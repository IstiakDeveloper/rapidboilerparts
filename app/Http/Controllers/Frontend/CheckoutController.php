<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserAddress;
use App\Models\Coupon;
use App\Models\City;
use App\Models\Area;
use App\Models\ServiceProvider;
use App\Services\ServiceProviderAssignmentService;
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
        $cartSummary = $this->calculateCartSummary($cartItems);

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'cartSummary' => $cartSummary,
            'cities' => City::active()->ordered()->get(['id', 'name', 'region']),
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
     * Get areas by city for AJAX
     */
    public function getAreasByCity(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
        ]);

        $areas = Area::where('city_id', $request->city_id)
            ->active()
            ->ordered()
            ->get(['id', 'name', 'postcode']);

        return response()->json([
            'areas' => $areas,
        ]);
    }

    /**
     * Process checkout and create order
     */
    public function processCheckout(Request $request): RedirectResponse
    {
        // Log incoming request data for debugging
        \Log::info('=== Checkout Request Data ===', [
            'service_date' => $request->service_date,
            'service_time' => $request->service_time,
            'service_provider_id' => $request->service_provider_id,
            'service_instructions' => $request->service_instructions,
            'all_data' => $request->all(),
        ]);

        $request->validate([
            // Billing
            'billing_first_name' => 'required|string|max:100',
            'billing_last_name' => 'required|string|max:100',
            'billing_phone' => 'required|string|max:20',
            'billing_city_id' => 'required|exists:cities,id',
            'billing_area_id' => 'required|exists:areas,id',
            'billing_address' => 'required|string|max:500',

            // Shipping
            'shipping_first_name' => 'required|string|max:100',
            'shipping_last_name' => 'required|string|max:100',
            'shipping_phone' => 'required|string|max:20',
            'shipping_city_id' => 'required|exists:cities,id',
            'shipping_area_id' => 'required|exists:areas,id',
            'shipping_address' => 'required|string|max:500',

            'payment_method' => 'required|in:cod,card,paypal',
            'notes' => 'nullable|string|max:500',
            'cart_services' => 'nullable|array',
            'cart_services.*.*.service_id' => 'required_with:cart_services|exists:product_services,id',
            'cart_services.*.*.service_date' => 'required_with:cart_services|date|after_or_equal:today',
            'cart_services.*.*.service_time' => 'required_with:cart_services|string',
            'cart_services.*.*.service_instructions' => 'nullable|string|max:500',

            // Service scheduling
            'service_date' => 'nullable|date|after_or_equal:today',
            'service_time' => 'nullable|string',
            'service_provider_id' => 'nullable|exists:service_providers,id',
            'service_instructions' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $cartItems = $this->getCartItems();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty.');
        }

        // Get city and area details
        $billingCity = City::findOrFail($request->billing_city_id);
        $billingArea = Area::findOrFail($request->billing_area_id);
        $shippingCity = City::findOrFail($request->shipping_city_id);
        $shippingArea = Area::findOrFail($request->shipping_area_id);

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

            // Process services from cart items (already loaded in getCartItems)
            $processedServices = [];
            foreach ($cartItems as $item) {
                if (!empty($item['selected_services'])) {
                    // Convert services to the format expected by OrderItem
                    $services = [];
                    foreach ($item['selected_services'] as $service) {
                        $services[] = [
                            'service_id' => $service['id'],
                            'service_name' => $service['name'],
                            'estimated_cost' => $service['price'],
                        ];
                    }
                    $processedServices[$item['id']] = $services;
                }
            }

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
                    'first_name' => $request->billing_first_name,
                    'last_name' => $request->billing_last_name,
                    'phone' => $request->billing_phone,
                    'address' => $request->billing_address,
                    'city_id' => $billingCity->id,
                    'city' => $billingCity->name,
                    'area_id' => $billingArea->id,
                    'area' => $billingArea->name,
                    'postcode' => $billingArea->postcode,
                ],
                'shipping_address' => [
                    'first_name' => $request->shipping_first_name,
                    'last_name' => $request->shipping_last_name,
                    'phone' => $request->shipping_phone,
                    'address' => $request->shipping_address,
                    'city_id' => $shippingCity->id,
                    'city' => $shippingCity->name,
                    'area_id' => $shippingArea->id,
                    'area' => $shippingArea->name,
                    'postcode' => $shippingArea->postcode,
                ],
                'notes' => $request->notes,
            ]);

            // Create order items and process services
            foreach ($cartItems as $item) {
                $product = $item['product_model'];
                $cartItemId = $item['id'];

                // Get services for this cart item
                $itemServices = $processedServices[$cartItemId] ?? [];

                // Calculate services total
                $servicesTotal = collect($itemServices)->sum('estimated_cost');

                \Log::info('Creating Order Item', [
                    'product_name' => $product->name,
                    'cart_item_id' => $cartItemId,
                    'selected_services' => $itemServices,
                    'services_total' => $servicesTotal,
                ]);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->final_price,
                    'total_price' => $product->final_price * $item['quantity'],
                    'selected_services' => $itemServices,
                    'services_total' => $servicesTotal,
                ]);

                // Reduce stock
                $product->decrement('stock_quantity', $item['quantity']);

                // Update stock status if needed
                if ($product->stock_quantity <= 0) {
                    $product->update(['in_stock' => false]);
                }
            }

            // Handle service scheduling and provider assignment
            if ($request->service_date && $request->service_time) {
                \Log::info('Updating Order with Service Schedule', [
                    'order_id' => $order->id,
                    'service_date' => $request->service_date,
                    'service_time' => $request->service_time,
                    'service_provider_id' => $request->service_provider_id,
                    'service_instructions' => $request->service_instructions,
                ]);

                // Update order with service scheduling info
                $order->update([
                    'preferred_service_date' => $request->service_date,
                    'service_time_slot' => $request->service_time,
                    'service_instructions' => $request->service_instructions,
                ]);

                // Assign the selected service provider
                if ($request->service_provider_id) {
                    \Log::info('Assigning Service Provider', [
                        'order_id' => $order->id,
                        'service_provider_id' => $request->service_provider_id,
                    ]);

                    $order->update([
                        'service_provider_id' => $request->service_provider_id,
                        'assigned_at' => now(),
                    ]);
                } else {
                    // Fallback to auto-assignment if no provider selected
                    try {
                        $assignmentService = app(ServiceProviderAssignmentService::class);
                        $provider = $assignmentService->assignToOrder($order);

                        if ($provider) {
                            $order->update([
                                'service_provider_id' => $provider->id,
                                'assigned_at' => now(),
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Failed to auto-assign service provider: ' . $e->getMessage());
                    }
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
            \Log::error('=== Order Processing Failed ===', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
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

                // Get selected services from cart's JSON data
                $selectedServices = [];
                $servicesTotal = 0;

                // Get the raw selected_services value to avoid accessor issues
                $rawServices = $cartItem->getAttributeValue('selected_services');

                if (!empty($rawServices) && is_array($rawServices)) {
                    // Check if it's array of IDs or array of objects
                    $firstItem = $rawServices[0] ?? null;

                    if (is_numeric($firstItem)) {
                        // It's array of service IDs - fetch service details from database
                        $services = \App\Models\ProductService::whereIn('id', $rawServices)->get();

                        foreach ($services as $service) {
                            $selectedServices[] = [
                                'id' => $service->id,
                                'name' => $service->name,
                                'price' => (float) $service->estimated_cost,
                            ];
                            $servicesTotal += (float) $service->estimated_cost;
                        }
                    } else {
                        // It's array of objects with service_id, service_name, estimated_cost
                        foreach ($rawServices as $serviceData) {
                            $selectedServices[] = [
                                'id' => $serviceData['service_id'],
                                'name' => $serviceData['service_name'],
                                'price' => (float) $serviceData['estimated_cost'],
                            ];
                            $servicesTotal += (float) $serviceData['estimated_cost'];
                        }
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
        $totalServicesAmount = 0;

        foreach ($cartItems as $item) {
            $productTotal = $item['product']['final_price'] * $item['quantity'];
            $subtotal += $productTotal;
            $totalServicesAmount += $item['services_total'];
        }

        $discountAmount = 0;
        if (Session::has('applied_coupon')) {
            $discountAmount = Session::get('applied_coupon')['discount_amount'];
        }

        $subtotalAfterDiscount = $subtotal - $discountAmount;
        $taxRate = 0.20;
        $taxAmount = ($subtotalAfterDiscount + $totalServicesAmount) * $taxRate;

        // Delivery charge - Free for now (will be area-based in future)
        // When services are selected, delivery is auto-handled by service provider
        $shippingAmount = 0.00;

        $total = $subtotalAfterDiscount + $totalServicesAmount + $taxAmount + $shippingAmount;

        return [
            'subtotal' => round($subtotal, 2),
            'total_services_amount' => round($totalServicesAmount, 2),
            'discount_amount' => round($discountAmount, 2),
            'tax_rate' => $taxRate,
            'tax_amount' => round($taxAmount, 2),
            'shipping_amount' => round($shippingAmount, 2),
            'total' => round($total, 2),
            'applied_coupon' => Session::get('applied_coupon'),
        ];
    }

    /**
     * Check service provider availability
     */
    public function checkServiceAvailability(Request $request)
    {
        $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:product_services,id',
            'date' => 'required|date|after_or_equal:today',
            'time_slot' => 'required|string',
            'area_id' => 'nullable|exists:areas,id',
        ]);

        \Log::info('=== Checking Service Provider Availability ===', [
            'service_ids' => $request->service_ids,
            'date' => $request->date,
            'time_slot' => $request->time_slot,
            'area_id' => $request->area_id,
        ]);

        // Get available service providers who can handle these services
        $query = ServiceProvider::where('is_active', true)
            ->where('is_verified', true)
            ->whereHas('services', function ($q) use ($request) {
                $q->whereIn('product_services.id', $request->service_ids);
            });

        // Filter by area if provided
        if ($request->area_id) {
            $query->where('area_id', $request->area_id);
        }

        $availableProviders = $query->with(['user:id,first_name,last_name'])
            ->get()
            ->map(function ($provider) {
                return [
                    'id' => $provider->id,
                    'name' => $provider->user->first_name . ' ' . $provider->user->last_name,
                    'rating' => $provider->rating ?? 5.0,
                    'completed_services' => $provider->total_jobs_completed ?? 0,
                ];
            });

        \Log::info('Available Providers Found:', [
            'count' => $availableProviders->count(),
            'providers' => $availableProviders->toArray(),
        ]);

        return response()->json([
            'available_providers' => $availableProviders,
        ]);
    }
}
