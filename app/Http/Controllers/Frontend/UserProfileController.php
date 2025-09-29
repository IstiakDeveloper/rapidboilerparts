<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{

    /**
     * Show user profile
     */
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Profile/Index', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'date_of_birth' => $user->date_of_birth,
                'gender' => $user->gender,
            ],
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
        ]);

        $user->update($request->only([
            'first_name',
            'last_name',
            'phone',
            'date_of_birth',
            'gender',
        ]));

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Update email
     */
    public function updateEmail(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'required|current_password',
        ]);

        $user->update(['email' => $request->email]);

        return back()->with('success', 'Email updated successfully!');
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password updated successfully!');
    }

    /**
     * Show addresses page
     */
    public function addresses(): Response
    {
        $addresses = Auth::user()->addresses;

        return Inertia::render('Profile/Addresses', [
            'addresses' => $addresses->map(fn($addr) => [
                'id' => $addr->id,
                'type' => $addr->type,
                'first_name' => $addr->first_name,
                'last_name' => $addr->last_name,
                'full_name' => $addr->full_name,
                'company' => $addr->company,
                'address_line_1' => $addr->address_line_1,
                'address_line_2' => $addr->address_line_2,
                'city' => $addr->city,
                'state' => $addr->state,
                'postal_code' => $addr->postal_code,
                'country' => $addr->country,
                'phone' => $addr->phone,
                'is_default' => $addr->is_default,
                'formatted_address' => $addr->formatted_address,
            ]),
        ]);
    }

    /**
     * Store new address
     */
    public function storeAddress(Request $request)
    {
        $request->validate([
            'type' => 'required|in:billing,shipping',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|size:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        $user = Auth::user();

        // If setting as default, unset other defaults of same type
        if ($request->is_default) {
            UserAddress::where('user_id', $user->id)
                ->where('type', $request->type)
                ->update(['is_default' => false]);
        }

        $user->addresses()->create($request->all());

        return back()->with('success', 'Address added successfully!');
    }

    /**
     * Update address
     */
    public function updateAddress(Request $request, UserAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:billing,shipping',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|size:2',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);

        // If setting as default, unset other defaults of same type
        if ($request->is_default) {
            UserAddress::where('user_id', Auth::id())
                ->where('type', $request->type)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($request->all());

        return back()->with('success', 'Address updated successfully!');
    }

    /**
     * Delete address
     */
    public function deleteAddress(UserAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        $address->delete();

        return back()->with('success', 'Address deleted successfully.');
    }

    /**
     * Set default address
     */
    public function setDefaultAddress(UserAddress $address)
    {
        if ($address->user_id !== Auth::id()) {
            abort(403);
        }

        // Unset other defaults of same type
        UserAddress::where('user_id', Auth::id())
            ->where('type', $address->type)
            ->where('id', '!=', $address->id)
            ->update(['is_default' => false]);

        $address->update(['is_default' => true]);

        return back()->with('success', 'Default address updated successfully!');
    }
}
