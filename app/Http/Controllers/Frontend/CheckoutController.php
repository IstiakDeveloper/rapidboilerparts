<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserAddress;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    /**
     * Show checkout page
     */
    public function index(): Response|RedirectResponse
    {
        $cartItems = $this->getCartItems();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('warning', 'Your cart is empty');
        }

        $user = Auth::user();
        $addresses = $user->addresses;
        $cartSummary = $this->calculateCartSummary($cartItems);

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'cartSummary' => $cartSummary,
            'addresses' => $addresses->map(fn($addr) => [
                'id' => $addr->id,
                'type' => $addr->type,
                'first_name' => $addr->first_name,
                'last_name' => $addr->last_name,
                'company' => $addr->company,
                'address_line_1' => $addr->address_line_1,
                'address_line_2' => $addr->address_line_2,
                'city' => $addr->city,
                'state' => $addr->state,
                'postal_code' => $addr->postal_code,
                'country' => $addr->country,
                'phone' => $addr->phone,
                'is_default' => $addr->is_default,
            ]),
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Apply coupon code
     */
    public function applyCoupon(Request $request)
    {
        $request->validate([
            'coupon_code' => 'required|string',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->coupon_code))
            ->valid()
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired coupon code.',
            ], 422);
        }

        $cartItems = $this->getCartItems();
        $cartSummary = $this->calculateCartSummary($cartItems);

        if (!$coupon->isValid($cartSummary['subtotal'])) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is not valid for your cart total.',
            ], 422);
        }

        $discount = $coupon->calculateDiscount($cartSummary['subtotal']);

        Session::put('applied_coupon', [
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount_amount' => $discount,
        ]);

        $cartSummary = $this->calculateCartSummary($cartItems);

        return response()->json([
            'success' => true,
            'message' => 'Coupon applied successfully!',
            'cartSummary' => $cartSummary,
        ]);
    }

    /**
     * Remove coupon
     */
    public function removeCoupon()
    {
        Session::forget('applied_coupon');

        $cartItems = $this->getCartItems();
        $cartSummary = $this->calculateCartSummary($cartItems);

        return response()->json([
            'success' => true,
            'cartSummary' => $cartSummary,
        ]);
    }

    /**
     * Process checkout and create order
     */
    public function processCheckout(Request $request): RedirectResponse
    {
        $request->validate([
            'billing_address_id' => 'required|exists:user_addresses,id',
            'shipping_address_id' => 'required|exists:user_addresses,id',
            'payment_method' => 'required|in:cod,card,paypal',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $cartItems = $this->getCartItems();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        // Verify addresses belong to user
        $billingAddress = UserAddress::where('id', $request->billing_address_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $shippingAddress = UserAddress::where('id', $request->shipping_address_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Check stock availability
        foreach ($cartItems as $item) {
            $product = $item['product_model'];
            if (!$product->in_stock || $product->stock_quantity < $item['quantity']) {
                return back()->with('error', "Product '{$product->name}' is out of stock or insufficient quantity.");
            }
        }

        DB::beginTransaction();

        try {
            $cartSummary = $this->calculateCartSummary($cartItems);

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $cartSummary['subtotal'],
                'tax_amount' => $cartSummary['tax_amount'],
                'shipping_amount' => $cartSummary['shipping_amount'],
                'discount_amount' => $cartSummary['discount_amount'],
                'total_amount' => $cartSummary['total'],
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'payment_method' => $request->payment_method,
                'billing_address' => [
                    'first_name' => $billingAddress->first_name,
                    'last_name' => $billingAddress->last_name,
                    'company' => $billingAddress->company,
                    'address_line_1' => $billingAddress->address_line_1,
                    'address_line_2' => $billingAddress->address_line_2,
                    'city' => $billingAddress->city,
                    'state' => $billingAddress->state,
                    'postal_code' => $billingAddress->postal_code,
                    'country' => $billingAddress->country,
                    'phone' => $billingAddress->phone,
                ],
                'shipping_address' => [
                    'first_name' => $shippingAddress->first_name,
                    'last_name' => $shippingAddress->last_name,
                    'company' => $shippingAddress->company,
                    'address_line_1' => $shippingAddress->address_line_1,
                    'address_line_2' => $shippingAddress->address_line_2,
                    'city' => $shippingAddress->city,
                    'state' => $shippingAddress->state,
                    'postal_code' => $shippingAddress->postal_code,
                    'country' => $shippingAddress->country,
                    'phone' => $shippingAddress->phone,
                ],
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($cartItems as $item) {
                $product = $item['product_model'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->final_price,
                    'total_price' => $product->final_price * $item['quantity'],
                    'selected_services' => $item['selected_services'],
                    'services_total' => $item['services_total'],
                ]);

                // Reduce stock
                $product->decrement('stock_quantity', $item['quantity']);

                // Update stock status if needed
                if ($product->stock_quantity <= 0) {
                    $product->update(['in_stock' => false]);
                }
            }

            // Update coupon usage if applied
            if (Session::has('applied_coupon')) {
                $couponCode = Session::get('applied_coupon')['code'];
                $coupon = Coupon::where('code', $couponCode)->first();
                if ($coupon) {
                    $coupon->increment('used_count');
                }
                Session::forget('applied_coupon');
            }

            // Clear cart
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            // Redirect based on payment method
            if ($request->payment_method === 'cod') {
                return redirect()->route('orders.show', $order->id)
                    ->with('success', 'Order placed successfully!');
            }

            // For card/paypal, redirect to payment gateway
            return redirect()->route('checkout.payment', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to process order. Please try again.');
        }
    }

    /**
     * Show payment page
     */
    public function payment(Order $order): Response
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->payment_status === 'paid') {
            return Inertia::location(route('orders.show', $order->id));
        }

        return Inertia::render('Checkout/Payment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'payment_method' => $order->payment_method,
            ],
        ]);
    }

    /**
     * Get cart items
     */
    private function getCartItems()
    {
        return Cart::with(['product.brand', 'product.images'])
            ->where('user_id', Auth::id())
            ->get()
            ->map(function ($cartItem) {
                $product = $cartItem->product;
                $primaryImage = $product->images->where('is_primary', true)->first();

                // Get selected services
                $selectedServices = [];
                $servicesTotal = 0;

                if (!empty($cartItem->selected_services)) {
                    $services = DB::table('product_service_assignments')
                        ->join('product_services', 'product_service_assignments.product_service_id', '=', 'product_services.id')
                        ->where('product_service_assignments.product_id', $product->id)
                        ->whereIn('product_services.id', $cartItem->selected_services)
                        ->select(
                            'product_services.id',
                            'product_services.name',
                            'product_services.price as default_price',
                            'product_service_assignments.custom_price',
                            'product_service_assignments.is_free as assignment_is_free',
                            'product_services.is_free as service_is_free'
                        )
                        ->get();

                    foreach ($services as $service) {
                        $finalPrice = $service->custom_price ?? $service->default_price;
                        $isFree = $service->assignment_is_free || $service->service_is_free;
                        $price = $isFree ? 0 : (float) $finalPrice;

                        $selectedServices[] = [
                            'id' => $service->id,
                            'name' => $service->name,
                            'price' => $price,
                        ];

                        $servicesTotal += $price;
                    }
                }

                return [
                    'id' => $cartItem->id,
                    'quantity' => $cartItem->quantity,
                    'selected_services' => $selectedServices,
                    'services_total' => $servicesTotal,
                    'product_model' => $product, // Keep for stock checking
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'sku' => $product->sku,
                        'price' => (float) $product->price,
                        'final_price' => (float) $product->final_price,
                        'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                        'brand' => ['name' => $product->brand->name],
                    ],
                ];
            });
    }

    /**
     * Calculate cart summary
     */
    private function calculateCartSummary($cartItems)
    {
        $subtotal = 0;

        foreach ($cartItems as $item) {
            $itemTotal = ($item['product']['final_price'] * $item['quantity']) + $item['services_total'];
            $subtotal += $itemTotal;
        }

        $discountAmount = 0;
        if (Session::has('applied_coupon')) {
            $discountAmount = Session::get('applied_coupon')['discount_amount'];
        }

        $subtotalAfterDiscount = $subtotal - $discountAmount;
        $taxRate = 0.20;
        $taxAmount = $subtotalAfterDiscount * $taxRate;
        $shippingAmount = $subtotal > 50 ? 0 : 4.99;
        $total = $subtotalAfterDiscount + $taxAmount + $shippingAmount;

        return [
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discountAmount, 2),
            'tax_rate' => $taxRate * 100,
            'tax_amount' => round($taxAmount, 2),
            'shipping_amount' => round($shippingAmount, 2),
            'total' => round($total, 2),
            'applied_coupon' => Session::get('applied_coupon'),
        ];
    }
}
