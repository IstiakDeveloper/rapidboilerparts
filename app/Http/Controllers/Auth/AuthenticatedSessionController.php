<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Store old session ID BEFORE regeneration
        $oldSessionId = Session::getId();

        $request->authenticate();

        $request->session()->regenerate();

        // Merge guest cart to user cart after login
        $this->mergeGuestCart($oldSessionId, Auth::id());

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Merge guest cart items to authenticated user cart
     */
    private function mergeGuestCart(string $oldSessionId, int $userId): void
    {
        // Get guest cart items using old session ID
        $guestCartItems = Cart::where('session_id', $oldSessionId)->get();

        if ($guestCartItems->isEmpty()) {
            return;
        }

        foreach ($guestCartItems as $guestItem) {
            // Check if user already has this product in cart
            $userCartItem = Cart::where('user_id', $userId)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($userCartItem) {
                // Merge quantities (check stock limit)
                $newQuantity = $userCartItem->quantity + $guestItem->quantity;

                // Get product stock
                $maxQuantity = $guestItem->product->stock_quantity ?? 999;

                // Update with minimum of desired quantity and stock
                $userCartItem->quantity = min($newQuantity, $maxQuantity);
                $userCartItem->save();

                // Delete guest cart item
                $guestItem->delete();
            } else {
                // Transfer guest cart item to user
                $guestItem->user_id = $userId;
                $guestItem->session_id = null;
                $guestItem->save();
            }
        }

        // Clear cache for both old session and new user
        Cache::forget("cart_count_{$userId}_{$oldSessionId}");
        Cache::forget("cart_count_{$userId}_" . Session::getId());
    }
}
