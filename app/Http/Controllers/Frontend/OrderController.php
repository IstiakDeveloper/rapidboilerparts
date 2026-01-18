<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display user's orders
     */
    public function index(Request $request): Response
    {
        $query = Order::where('user_id', Auth::id())
            ->with('items.product')
            ->latest();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by order number
        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        $orders = $query->paginate(10)->through(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'total_amount' => (float) $order->total_amount,
                'total_items' => $order->total_items,
                'created_at' => $order->created_at->format('M d, Y'),
                'formatted_date' => $order->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display single order details
     */
    public function show(Order $order): Response
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['items.product.brand', 'items.product.images', 'serviceProvider.user', 'serviceProvider.city', 'serviceProvider.area']);

        // Calculate total services amount from order items
        $totalServicesAmount = $order->items->sum('services_total');

        return Inertia::render('Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'payment_transaction_id' => $order->payment_transaction_id,
                'subtotal' => (float) $order->subtotal,
                'tax_amount' => (float) $order->tax_amount,
                'shipping_amount' => (float) $order->shipping_amount,
                'discount_amount' => (float) $order->discount_amount,
                'total_amount' => (float) $order->total_amount,
                'total_services_amount' => (float) $totalServicesAmount,
                'billing_address' => $order->billing_address,
                'shipping_address' => $order->shipping_address,
                'notes' => $order->notes,
                'preferred_service_date' => $order->preferred_service_date ? $order->preferred_service_date->format('M d, Y') : null,
                'service_time_slot' => $order->service_time_slot,
                'service_instructions' => $order->service_instructions,
                'service_provider' => $order->serviceProvider ? [
                    'id' => $order->serviceProvider->id,
                    'name' => $order->serviceProvider->user->first_name . ' ' . $order->serviceProvider->user->last_name,
                    'business_name' => $order->serviceProvider->business_name,
                    'contact_number' => $order->serviceProvider->contact_number,
                    'email' => $order->serviceProvider->email,
                    'city' => $order->serviceProvider->city->name ?? null,
                    'area' => $order->serviceProvider->area->name ?? null,
                    'rating' => (float) ($order->serviceProvider->rating ?? 0),
                ] : null,
                'assigned_at' => $order->assigned_at ? $order->assigned_at->format('M d, Y H:i A') : null,
                'created_at' => $order->created_at->format('M d, Y H:i A'),
                'shipped_at' => $order->shipped_at ? $order->shipped_at->format('M d, Y H:i A') : null,
                'delivered_at' => $order->delivered_at ? $order->delivered_at->format('M d, Y H:i A') : null,
                'items' => $order->items->map(function ($item) {
                    $primaryImage = $item->product->images->where('is_primary', true)->first();

                    // Format selected services to match frontend expectations
                    $selectedServices = [];
                    if (!empty($item->selected_services) && is_array($item->selected_services)) {
                        foreach ($item->selected_services as $service) {
                            $selectedServices[] = [
                                'id' => $service['service_id'] ?? null,
                                'name' => $service['service_name'] ?? 'Unknown Service',
                                'price' => (float) ($service['estimated_cost'] ?? 0),
                            ];
                        }
                    }

                    return [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'product_sku' => $item->product_sku,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                        'selected_services' => $selectedServices,
                        'services_total' => (float) $item->services_total,
                        'product' => [
                            'id' => $item->product->id,
                            'slug' => $item->product->slug,
                            'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                            'brand' => ['name' => $item->product->brand->name],
                        ],
                    ];
                }),
            ],
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if (!in_array($order->status, ['pending', 'processing'])) {
            return back()->with('error', 'Cannot cancel this order.');
        }

        $order->update(['status' => 'cancelled']);

        // Restore stock
        foreach ($order->items as $item) {
            $product = $item->product;
            $product->increment('stock_quantity', $item->quantity);
            if ($product->stock_quantity > 0 && !$product->in_stock) {
                $product->update(['in_stock' => true]);
            }
        }

        return back()->with('success', 'Order cancelled successfully.');
    }

    /**
     * Download invoice
     */
    public function invoice(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Generate PDF invoice here
        // For now, return view
        return view('invoices.order', compact('order'));
    }
}
