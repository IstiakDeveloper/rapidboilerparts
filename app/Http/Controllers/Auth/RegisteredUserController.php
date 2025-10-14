<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'password' => Hash::make($request->password),
            'user_type' => 'customer',
            'is_active' => true,
        ]);

        // Get guest cart data before login
        $guestCartItems = \App\Models\Cart::where('session_id', session()->getId())->get();
        $guestCartCount = $guestCartItems->sum('quantity');

        event(new Registered($user));

        Auth::login($user);

        // Transfer cart items from guest session to user account
        if ($guestCartItems->isNotEmpty()) {
            foreach ($guestCartItems as $cartItem) {
                // Check if product already exists in user's cart
                $existingCartItem = \App\Models\Cart::where('user_id', $user->id)
                    ->where('product_id', $cartItem->product_id)
                    ->first();

                if ($existingCartItem) {
                    // Update quantity if product already exists
                    $existingCartItem->update([
                        'quantity' => $existingCartItem->quantity + $cartItem->quantity,
                        'selected_services' => array_merge(
                            $existingCartItem->selected_services ?? [],
                            $cartItem->selected_services ?? []
                        )
                    ]);
                } else {
                    // Create new cart item for user
                    \App\Models\Cart::create([
                        'user_id' => $user->id,
                        'product_id' => $cartItem->product_id,
                        'quantity' => $cartItem->quantity,
                        'selected_services' => $cartItem->selected_services
                    ]);
                }

                // Delete the guest cart item
                $cartItem->delete();
            }

            // Update session data
            $userCartItems = \App\Models\Cart::where('user_id', $user->id)->get();
            $userCartCount = $userCartItems->sum('quantity');

            session()->put('cart_count', $userCartCount);

            // Dispatch a cart updated event
            event(new \App\Events\CartUpdated($user->id, $userCartCount));
        }        return redirect()->intended(route('dashboard', absolute: false));
    }
}
