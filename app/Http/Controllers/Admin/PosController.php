<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Get default address for orders
     */
    private function getDefaultAddress(?int $userId): array
    {
        if (!$userId) {
            return [
                'address_type' => 'pos',
                'address' => 'POS Sale',
                'city' => 'POS',
                'state' => 'POS',
                'country' => 'POS',
                'postal_code' => '00000'
            ];
        }

        $user = User::with('addresses')->find($userId);
        $defaultAddress = $user?->addresses->first();

        if (!$defaultAddress) {
            return [
                'address_type' => 'customer',
                'first_name' => $user?->first_name ?? '',
                'last_name' => $user?->last_name ?? '',
                'address' => 'Default Address',
                'city' => 'City',
                'state' => 'State',
                'country' => 'Country',
                'postal_code' => '00000',
                'phone' => $user?->phone ?? ''
            ];
        }

        return $defaultAddress->toArray();
    }
    /**
     * Display the POS interface
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Pos/Index', [
            'lastOrder' => Order::latest()->first(),
            'recentOrders' => Order::with(['items.product', 'user'])
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    /**
     * Search for products
     */
    public function searchProducts(Request $request)
    {
        $query = $request->get('query');

        $products = Product::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('sku', 'like', "%{$query}%")
                ->orWhere('barcode', 'like', "%{$query}%");
        })
            ->where('status', 'active')
            ->where('in_stock', true)
            ->with(['brand', 'category'])
            ->take(10)
            ->get(['id', 'name', 'sku', 'barcode', 'price', 'stock_quantity', 'brand_id', 'category_id']);

        if ($request->wantsJson()) {
            return response()->json($products);
        }

        return Inertia::render('Admin/Pos/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Create a new order from POS
     */
    public function createCustomer(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            $customer = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'] ?? '',
                'email' => $validated['email'] ?? $validated['first_name'] . time() . '@temp-customer.com',
                'phone' => $validated['phone'] ?? null,
                'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                'user_type' => 'customer',
                'is_active' => 1
            ]);

            return response()->json([
                'success' => true,
                'customer' => $customer,
                'message' => 'Customer created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function createOrder(Request $request)
    {
        // Debug: Log incoming data
        Log::info('POS Order Request:', $request->all());

        // Relaxed validation for debugging
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'customer_id' => 'nullable|integer|exists:users,id',
            'payment_method' => ['required', 'string', 'in:' . Order::PAYMENT_METHOD_CASH . ',' . Order::PAYMENT_METHOD_CARD],
            'notes' => 'nullable|string|max:500',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'amount_paid' => 'required|numeric|min:0',
            'change' => 'nullable|numeric',
        ], [
            // Custom error messages for debugging
            'items.required' => 'Cart items are required',
            'items.*.product_id.exists' => 'One or more products do not exist',
            'customer_id.exists' => 'Selected customer does not exist',
            'payment_method.in' => 'Invalid payment method',
        ]);

        DB::beginTransaction();

        try {
            // Create order with unique order number
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 12)),
                'user_id' => $validated['customer_id'] ?? null,
                'status' => Order::STATUS_COMPLETED,
                'payment_status' => Order::PAYMENT_STATUS_PAID,
                'payment_method' => $validated['payment_method'],
                'subtotal' => $validated['subtotal'],
                'tax_amount' => $validated['tax'],
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $validated['total'],
                'notes' => $validated['notes'] ?? null,
                'billing_address' => $this->getDefaultAddress($validated['customer_id']),
                'shipping_address' => $this->getDefaultAddress($validated['customer_id']),
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                // Check stock
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);

                // Update stock
                if ($product->manage_stock) {
                    $product->decrement('stock_quantity', $item['quantity']);
                    $product->update([
                        'in_stock' => $product->stock_quantity > 0
                    ]);
                }
            }

            // Create payment record
            $order->payments()->create([
                'amount' => $validated['amount_paid'],
                'payment_method' => $validated['payment_method'],
                'transaction_id' => 'POS-' . uniqid(),
                'status' => Order::PAYMENT_STATUS_PAID,
                'notes' => $validated['notes'] ?? null,
            ]);

            DB::commit();

            Log::info('Order created successfully:', ['order_id' => $order->id]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'order' => $order->load(['items.product', 'user']),
                    'message' => 'Order created successfully',
                ]);
            }

            return Inertia::render('Admin/Pos/Index', [
                'order' => $order->load(['items.product', 'user']),
                'message' => 'Order created successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Order creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = $e->getMessage();
            $statusCode = 422;

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validation failed: ' . collect($e->errors())->first()[0];
            } elseif ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $errorMessage = 'Product not found';
                $statusCode = 404;
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage
                ], $statusCode);
            }

            return Inertia::render('Admin/Pos/Index', [
                'error' => $errorMessage
            ])->with('error', $errorMessage);
        }
    }

    /**
     * Get customer details
     */
    public function getCustomer(Request $request)
    {
        $query = $request->get('query');
        $createNew = $request->boolean('createNew');

        if ($createNew) {
            // Create a new customer with minimal data
            $customer = User::create([
                'first_name' => $query,
                'email' => $query . '@temp-customer.com', // Temporary email
                'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Random password
                'user_type' => 'customer',
                'is_active' => 1
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'customer' => $customer,
                    'message' => 'New customer created successfully'
                ]);
            }

            return Inertia::render('Admin/Pos/Index', [
                'customers' => [$customer],
                'message' => 'New customer created successfully'
            ]);
        }

        // Regular customer search
        $customers = User::where('user_type', 'customer')
            ->where('is_active', 1)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', '%' . $query . '%')
                    ->orWhere('last_name', 'like', '%' . $query . '%')
                    ->orWhere('email', 'like', '%' . $query . '%')
                    ->orWhere('phone', 'like', '%' . $query . '%');
            })
            ->take(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'phone']);

        if ($request->wantsJson()) {
            return response()->json($customers);
        }

        return Inertia::render('Admin/Pos/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Get order details
     */
    public function getOrder(Order $order)
    {
        $order->load(['items.product', 'user', 'payments']);
        return response()->json($order);
    }

    /**
     * Print order receipt
     */
    public function printReceipt(Order $order)
    {
        $order->load(['items.product', 'user', 'payments']);

        // Format order data for receipt
        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'created_at' => $order->created_at,
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'user' => $order->user ? [
                'first_name' => $order->user->first_name,
                'last_name' => $order->user->last_name,
                'email' => $order->user->email,
            ] : null,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'product' => [
                        'name' => $item->product->name,
                        'sku' => $item->product->sku,
                    ]
                ];
            })->toArray(),
            'notes' => $order->notes,
        ];

        return Inertia::render('Admin/Pos/Receipt', [
            'order' => $orderData
        ]);
    }
}
