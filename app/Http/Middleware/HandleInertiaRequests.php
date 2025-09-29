<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Cart;
use App\Models\Wishlist;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;

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
        $userId = Auth::id();
        $sessionId = Session::getId();

        // Cart Count - Optimized query
        $cartCount = Cache::remember("cart_count_{$userId}_{$sessionId}", 60, function () use ($userId, $sessionId) {
            return Cart::where(function ($query) use ($userId, $sessionId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('session_id', $sessionId);
                }
            })->sum('quantity') ?? 0;
        });

        // Wishlist Count - Only for authenticated users
        $wishlistCount = 0;
        if ($userId) {
            $wishlistCount = Cache::remember("wishlist_count_{$userId}", 60, function () use ($userId) {
                return Wishlist::where('user_id', $userId)->count();
            });
        }

        // Site Settings - Cached for performance
        $siteSettings = Cache::remember('site_settings', 3600, function () {
            try {
                return Setting::whereIn('key', [
                    'site_name',
                    'site_tagline',
                    'site_description',
                    'contact_email',
                    'contact_phone',
                    'whatsapp_number',
                    'facebook_url',
                    'twitter_url',
                    'instagram_url',
                    'youtube_url',
                    'linkedin_url',
                    'currency_symbol',
                    'currency_code',
                    'tax_rate',
                    'free_shipping_threshold',
                    'company_name',
                    'company_address',
                    'company_registration',
                    'vat_number',
                ])->pluck('value', 'key')->toArray();
            } catch (\Exception $e) {
                \Log::error('Failed to load site settings: ' . $e->getMessage());
                return [
                    'site_name' => 'RapidBoilerParts',
                    'contact_email' => 'info@rapidboilerparts.com',
                    'contact_phone' => '01919338762',
                    'whatsapp_number' => '+447832156716',
                    'currency_symbol' => '£',
                    'currency_code' => 'GBP',
                ];
            }
        });

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userId ? [
                    'id' => Auth::user()->id,
                    'first_name' => Auth::user()->first_name,
                    'last_name' => Auth::user()->last_name,
                    'email' => Auth::user()->email,
                    'user_type' => Auth::user()->user_type,
                ] : null,
            ],
            'cartCount' => (int) $cartCount,
            'wishlistCount' => (int) $wishlistCount,
            'siteSettings' => $siteSettings,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
                'warning' => fn() => $request->session()->get('warning'),
            ],
            'csrf_token' => csrf_token(),
            'app_url' => config('app.url'),
        ];
    }
}
