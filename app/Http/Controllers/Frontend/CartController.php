<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    /**
     * Get session ID for guest users
     */
    private function getSessionId(): string
    {
        if (!Session::has('cart_session_id')) {
            Session::put('cart_session_id', Session::getId());
        }
        return Session::get('cart_session_id');
    }

    /**
     * Get cart items for sidebar (API endpoint)
     */
    public function getItems()
    {
        $cartItems = $this->getCartItems();

        return response()->json([
            'items' => $cartItems,
            'count' => $cartItems->sum('quantity'),
        ]);
    }

    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::with('brand')->findOrFail($validated['product_id']);

        // Check stock
        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available'
            ], 400);
        }

        $userId = Auth::id();
        $sessionId = Session::getId();

        // Find or create cart item
        $cartItem = Cart::where('product_id', $product->id)
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $validated['quantity'];

            if ($newQuantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot add more items. Stock limit reached.'
                ], 400);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            $cartItem = Cart::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        // Clear cache
        Cache::forget("cart_count_{$userId}_{$sessionId}");

        // Get updated cart count
        $cartCount = Cart::where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->sum('quantity');

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart successfully',
            'cartCount' => (int) $cartCount,
            'cartItem' => $cartItem
        ]);
    }



    /**
     * Display cart page
     */
    public function index(): Response
    {
        $cartItems = $this->getCartItems();
        $cartSummary = $this->calculateCartSummary($cartItems);

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'cartSummary' => $cartSummary,
        ]);
    }

    /**
     * Add product to cart
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'selected_services' => 'nullable|array',
            'selected_services.*' => 'exists:product_services,id',
        ]);

        $product = Product::with('images')->findOrFail($request->product_id);

        // Check stock availability
        if (!$product->in_stock || $product->stock_quantity < $request->quantity) {
            return back()->with('error', 'Product is out of stock or insufficient quantity available.');
        }

        $userId = Auth::id();
        $sessionId = $userId ? null : $this->getSessionId();

        // Check if product already in cart
        $cartItem = Cart::where('product_id', $product->id)
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($newQuantity > $product->stock_quantity) {
                return back()->with('error', 'Cannot add more items. Maximum available quantity is ' . $product->stock_quantity);
            }

            $cartItem->update([
                'quantity' => $newQuantity,
                'selected_services' => $request->selected_services ?? [],
            ]);

            return back()->with('success', 'Cart updated successfully!');
        }

        // Add new cart item
        Cart::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'selected_services' => $request->selected_services ?? [],
        ]);

        return back()->with('success', 'Product added to cart successfully!');
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, Cart $cart)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        if (!$this->verifyCartOwnership($cart)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $product = $cart->product;

        if ($request->quantity > $product->stock_quantity) {
            return response()->json([
                'error' => 'Insufficient stock. Only ' . $product->stock_quantity . ' items available.'
            ], 422);
        }

        $cart->update(['quantity' => $request->quantity]);

        // Get updated cart count
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        $cartCount = Cart::where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->sum('quantity');

        $cartItems = $this->getCartItems();
        $cartSummary = $this->calculateCartSummary($cartItems);

        return response()->json([
            'success' => true,
            'cartSummary' => $cartSummary,
            'cartCount' => (int) $cartCount, // ← এটা add করো
        ]);
    }

    /**
     * Update selected services for cart item
     */
    public function updateServices(Request $request, Cart $cart)
    {
        $request->validate([
            'selected_services' => 'nullable|array',
            'selected_services.*' => 'exists:product_services,id',
        ]);

        // Verify ownership
        if (!$this->verifyCartOwnership($cart)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cart->update([
            'selected_services' => $request->selected_services ?? [],
        ]);

        $cartItems = $this->getCartItems();
        $cartSummary = $this->calculateCartSummary($cartItems);

        return response()->json([
            'success' => true,
            'cartSummary' => $cartSummary,
        ]);
    }

    public function remove(Cart $cart)
    {
        // Verify ownership
        if (!$this->verifyCartOwnership($cart)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $cart->delete();

        // Get updated cart count
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        $cartCount = Cart::where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->sum('quantity');

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart.',
            'cartCount' => (int) $cartCount
        ]);
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        Cart::where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->delete();

        return back()->with('success', 'Cart cleared successfully.');
    }

    /**
     * Get cart count (for header)
     */
    public function count()
    {
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        $count = Cart::where(function ($query) use ($userId, $sessionId) {
            if ($userId) {
                $query->where('user_id', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }
        })->sum('quantity');

        return response()->json(['count' => $count]);
    }

    /**
     * Get all cart items with details
     */
    private function getCartItems()
    {
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        return Cart::with(['product.brand', 'product.images'])
            ->where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })
            ->get()
            ->map(function ($cartItem) {
                $product = $cartItem->product;
                $primaryImage = $product->images->where('is_primary', true)->first();

                // Get selected services details
                $selectedServices = [];
                $servicesTotal = 0;

                if (!empty($cartItem->selected_services)) {
                    $services = \DB::table('product_service_assignments')
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
                            'is_free' => $isFree,
                        ];

                        $servicesTotal += $price;
                    }
                }

                $itemTotal = ($product->final_price * $cartItem->quantity) + $servicesTotal;

                return [
                    'id' => $cartItem->id,
                    'quantity' => $cartItem->quantity,
                    'selected_services' => $selectedServices,
                    'services_total' => $servicesTotal,
                    'item_total' => $itemTotal,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'sku' => $product->sku,
                        'price' => (float) $product->price,
                        'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                        'final_price' => (float) $product->final_price,
                        'discount_percentage' => $product->discount_percentage,
                        'stock_quantity' => $product->stock_quantity,
                        'in_stock' => $product->in_stock,
                        'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                        'brand' => [
                            'name' => $product->brand->name,
                            'slug' => $product->brand->slug,
                        ],
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
        $totalItems = 0;
        $totalServicesAmount = 0;

        foreach ($cartItems as $item) {
            $subtotal += $item['item_total'];
            $totalItems += $item['quantity'];
            $totalServicesAmount += $item['services_total'];
        }

        $taxRate = 0.20; // 20% VAT for UK
        $taxAmount = $subtotal * $taxRate;
        $shippingAmount = $subtotal > 50 ? 0 : 4.99; // Free shipping over £50
        $total = $subtotal + $taxAmount + $shippingAmount;

        return [
            'subtotal' => round($subtotal, 2),
            'tax_rate' => $taxRate * 100,
            'tax_amount' => round($taxAmount, 2),
            'shipping_amount' => round($shippingAmount, 2),
            'total' => round($total, 2),
            'total_items' => $totalItems,
            'total_services_amount' => round($totalServicesAmount, 2),
            'free_shipping_threshold' => 50,
            'amount_for_free_shipping' => $subtotal < 50 ? round(50 - $subtotal, 2) : 0,
        ];
    }

    /**
     * Verify cart ownership
     */
    private function verifyCartOwnership(Cart $cart): bool
    {
        $userId = Auth::id();
        $sessionId = $this->getSessionId();

        if ($userId) {
            return $cart->user_id == $userId;
        }

        return $cart->session_id == $sessionId;
    }

    /**
     * Merge guest cart to user cart after login
     */
    public function mergeGuestCart()
    {
        if (!Auth::check()) {
            return;
        }

        $sessionId = $this->getSessionId();
        $userId = Auth::id();

        $guestCartItems = Cart::where('session_id', $sessionId)->get();

        foreach ($guestCartItems as $guestItem) {
            $userCartItem = Cart::where('user_id', $userId)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($userCartItem) {
                // Merge quantities
                $userCartItem->quantity += $guestItem->quantity;
                $userCartItem->save();
            } else {
                // Transfer to user
                $guestItem->user_id = $userId;
                $guestItem->session_id = null;
                $guestItem->save();
            }
        }

        // Delete remaining guest items
        Cart::where('session_id', $sessionId)->delete();
    }
}
