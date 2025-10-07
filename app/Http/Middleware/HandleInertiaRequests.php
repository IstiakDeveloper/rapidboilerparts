<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Cart;
use App\Models\Wishlist;
use App\Models\Setting;
use App\Models\Category;
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
                $settings = Setting::pluck('value', 'key')->toArray();

                // Default fallback values
                $defaults = [
                    'site_name' => 'Rapid Boiler Parts',
                    'site_tagline' => 'UK\'s Leading Boiler Spare Parts Supplier',
                    'site_description' => 'We offer over 20,000 genuine boiler spare parts',
                    'contact_email' => 'hi@rapidboilerparts.com',
                    'contact_phone' => '01919 338762',
                    'whatsapp_number' => '+447832156716',
                    'currency_symbol' => '£',
                    'currency' => 'GBP',
                    'free_shipping_threshold' => '50',
                    'company_name' => 'Rapid Boiler Parts',
                    'company_address' => 'Unit 5, Industrial Estate, Manchester, M12 4QR, UK',
                    'company_registration' => '12345678',
                    'vat_number' => 'GB123456789',
                    'facebook_url' => '',
                    'twitter_url' => '',
                    'instagram_url' => '',
                    'youtube_url' => '',
                    'linkedin_url' => '',
                ];

                return array_merge($defaults, $settings);
            } catch (\Exception $e) {
                \Log::error('Failed to load site settings: ' . $e->getMessage());
                return [
                    'site_name' => 'Rapid Boiler Parts',
                    'contact_email' => 'hi@heatingandcateringparts.com',
                    'contact_phone' => '01919 338762',
                    'whatsapp_number' => '+447832156716',
                    'currency_symbol' => '£',
                ];
            }
        });

        // Categories - Cached and optimized (only active, parent categories with icon)
        $categories = Cache::remember('main_categories', 3600, function () {
            try {
                return Category::active()
                    ->parent()
                    ->ordered()
                    ->select('id', 'name', 'slug', 'image', 'description')
                    ->limit(6) // Only show 6 main categories in header
                    ->get()
                    ->map(function ($category) {
                        // Map category to include icon emoji (you can store this in DB or use a helper)
                        $iconMap = [
                            'pcb-boards' => '🔌',
                            'pumps' => '💧',
                            'diverter-valves' => '🔧',
                            'heat-exchangers' => '🔥',
                            'gas-valves' => '⚡',
                            'fans-motors' => '🌀',
                        ];

                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'icon' => $iconMap[$category->slug] ?? '📦',
                            'image' => $category->image,
                            'description' => $category->description,
                        ];
                    })
                    ->toArray();
            } catch (\Exception $e) {
                \Log::error('Failed to load categories: ' . $e->getMessage());
                // Fallback categories
                return [
                    ['name' => 'PCB Boards', 'slug' => 'pcb-boards', 'icon' => '🔌'],
                    ['name' => 'Pumps', 'slug' => 'pumps', 'icon' => '💧'],
                    ['name' => 'Diverter Valves', 'slug' => 'diverter-valves', 'icon' => '🔧'],
                    ['name' => 'Heat Exchangers', 'slug' => 'heat-exchangers', 'icon' => '🔥'],
                    ['name' => 'Gas Valves', 'slug' => 'gas-valves', 'icon' => '⚡'],
                    ['name' => 'Fans & Motors', 'slug' => 'fans-motors', 'icon' => '🌀'],
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
            'categories' => $categories,
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
