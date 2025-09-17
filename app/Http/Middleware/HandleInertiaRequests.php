<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Cart;
use App\Models\Wishlist;
use App\Models\Setting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Cart Count
        $cartCount = 0;
        if (auth()->check()) {
            $cartCount = Cart::where('user_id', auth()->id())->sum('quantity');
        } else {
            $sessionId = session()->getId();
            $cartCount = Cart::where('session_id', $sessionId)->sum('quantity');
        }

        // Wishlist Count (only for authenticated users)
        $wishlistCount = 0;
        if (auth()->check()) {
            $wishlistCount = Wishlist::where('user_id', auth()->id())->count();
        }

        // Site Settings
        try {
            $siteSettings = Setting::whereIn('key', [
                'site_name',
                'site_tagline',
                'site_description',
                'contact_email',
                'contact_phone',
                'whatsapp_number',
                'facebook_url',
                'twitter_url',
                'youtube_url',
                'currency_symbol'
            ])->pluck('value', 'key')->toArray();
        } catch (\Exception $e) {
            $siteSettings = [];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'cartCount' => $cartCount,
            'wishlistCount' => $wishlistCount,
            'siteSettings' => $siteSettings,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ];
    }
}
