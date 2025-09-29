<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{

    /**
     * Display wishlist page
     */
    public function index(): Response
    {
        $wishlistItems = Wishlist::with(['product.brand', 'product.images', 'product.reviews'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                $primaryImage = $product->images->where('is_primary', true)->first();

                return [
                    'id' => $item->id,
                    'added_at' => $item->created_at->format('M d, Y'),
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
                        'rating' => round($product->reviews->avg('rating') ?? 0, 1),
                        'reviews_count' => $product->reviews->count(),
                    ],
                ];
            });

        return Inertia::render('Wishlist/Index', [
            'wishlistItems' => $wishlistItems,
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);

        $exists = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->exists();

        if ($exists) {
            return back()->with('info', 'Product is already in your wishlist.');
        }

        Wishlist::create([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
        ]);

        return back()->with('success', 'Product added to wishlist!');
    }

    /**
     * Remove product from wishlist
     */
    public function remove(Wishlist $wishlist)
    {
        if ($wishlist->user_id !== Auth::id()) {
            return back()->with('error', 'Unauthorized action.');
        }

        $wishlist->delete();

        return back()->with('success', 'Product removed from wishlist.');
    }

    /**
     * Toggle wishlist (add/remove)
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlistItem = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($wishlistItem) {
            $wishlistItem->delete();
            return response()->json([
                'success' => true,
                'action' => 'removed',
                'message' => 'Removed from wishlist',
            ]);
        }

        Wishlist::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'success' => true,
            'action' => 'added',
            'message' => 'Added to wishlist',
        ]);
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $inWishlist = Wishlist::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->exists();

        return response()->json(['in_wishlist' => $inWishlist]);
    }

    /**
     * Move wishlist item to cart
     */
    public function moveToCart(Wishlist $wishlist)
    {
        if ($wishlist->user_id !== Auth::id()) {
            return back()->with('error', 'Unauthorized action.');
        }

        $product = $wishlist->product;

        if (!$product->in_stock) {
            return back()->with('error', 'Product is out of stock.');
        }

        // Add to cart
        $cart = \App\Models\Cart::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->first();

        if ($cart) {
            $cart->increment('quantity');
        } else {
            \App\Models\Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'quantity' => 1,
            ]);
        }

        // Remove from wishlist
        $wishlist->delete();

        return back()->with('success', 'Product moved to cart!');
    }

    /**
     * Clear entire wishlist
     */
    public function clear()
    {
        Wishlist::where('user_id', Auth::id())->delete();

        return back()->with('success', 'Wishlist cleared successfully.');
    }
}
