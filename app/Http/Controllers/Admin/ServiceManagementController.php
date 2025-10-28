<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceProvider;
use App\Models\ServiceProviderCategory;
use App\Models\City;
use App\Models\Area;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ServiceManagementController extends Controller
{
    /**
     * Display service providers with filters
     */
    public function index(Request $request): Response
    {
        $query = ServiceProvider::with(['user', 'category', 'city', 'area'])
            ->withCount('orders');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filters
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'verified') {
                $query->where('is_verified', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_verified', false);
            }
        }

        if ($request->filled('availability')) {
            $query->where('availability_status', $request->availability);
        }

        $serviceProviders = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/ServiceManagement/Index', [
            'serviceProviders' => $serviceProviders,
            'filters' => $request->only(['search', 'category_id', 'city_id', 'status', 'availability']),
            'categories' => ServiceProviderCategory::active()->ordered()->get(),
            'cities' => City::active()->ordered()->get(),
        ]);
    }

    /**
     * Show create form with all necessary data
     */
    public function create(): Response
    {
        return Inertia::render('Admin/ServiceManagement/Create', [
            'categories' => ServiceProviderCategory::active()->ordered()->get(),
            'cities' => City::active()->ordered()->get(),
            'users' => User::where('user_type', 'customer')
                ->whereDoesntHave('serviceProvider')
                ->select('id', 'first_name', 'last_name', 'email')
                ->get(),
        ]);
    }

    /**
     * Store new service provider with dynamic category/city/area creation
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:service_providers,user_id',

            // Category - can be existing ID or new name
            'category_id' => 'nullable|exists:service_provider_categories,id',
            'new_category_name' => 'nullable|required_without:category_id|string|max:255',

            // City - can be existing ID or new name
            'city_id' => 'nullable|exists:cities,id',
            'new_city_name' => 'nullable|required_without:city_id|string|max:255',
            'new_city_region' => 'nullable|required_with:new_city_name|in:England,Scotland,Wales,Northern Ireland',
            'new_city_county' => 'nullable|string|max:255',

            // Area - can be existing ID or new name
            'area_id' => 'nullable|exists:areas,id',
            'new_area_name' => 'nullable|required_without:area_id|string|max:255',
            'new_area_postcode' => 'nullable|string|max:20',

            'business_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'service_charge' => 'required|numeric|min:0',
            'contact_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'max_daily_orders' => 'required|integer|min:1|max:50',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Handle Category
            if ($request->filled('new_category_name')) {
                $category = ServiceProviderCategory::create([
                    'name' => $request->new_category_name,
                    'slug' => Str::slug($request->new_category_name),
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
                $validated['category_id'] = $category->id;
            }

            // Handle City
            if ($request->filled('new_city_name')) {
                $city = City::create([
                    'name' => $request->new_city_name,
                    'slug' => Str::slug($request->new_city_name),
                    'region' => $request->new_city_region,
                    'county' => $request->new_city_county,
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
                $validated['city_id'] = $city->id;
            }

            // Handle Area
            if ($request->filled('new_area_name')) {
                $area = Area::create([
                    'city_id' => $validated['city_id'],
                    'name' => $request->new_area_name,
                    'slug' => Str::slug($request->new_area_name),
                    'postcode' => $request->new_area_postcode,
                    'is_active' => true,
                    'sort_order' => 0,
                ]);
                $validated['area_id'] = $area->id;
            }

            // Create Service Provider
            $validated['availability_status'] = ServiceProvider::STATUS_AVAILABLE;
            $validated['current_daily_orders'] = 0;

            if ($validated['is_verified'] ?? false) {
                $validated['verified_at'] = now();
            }

            // Remove temporary fields
            unset($validated['new_category_name']);
            unset($validated['new_city_name']);
            unset($validated['new_city_region']);
            unset($validated['new_city_county']);
            unset($validated['new_area_name']);
            unset($validated['new_area_postcode']);

            ServiceProvider::create($validated);

            DB::commit();

            return redirect()->route('admin.service-management.index')
                ->with('success', 'Service provider created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'Failed to create service provider: ' . $e->getMessage()]);
        }
    }

    /**
     * Show service provider details
     */
    public function show(ServiceProvider $serviceManagement): Response
    {
        $serviceManagement->load([
            'user',
            'category',
            'city',
            'area',
            'orders' => function ($query) {
                $query->latest()->limit(10);
            }
        ]);

        return Inertia::render('Admin/ServiceManagement/Show', [
            'serviceProvider' => $serviceManagement,
        ]);
    }

    /**
     * Edit service provider
     */
    public function edit(ServiceProvider $serviceManagement): Response
    {
        $serviceManagement->load(['user', 'category', 'city', 'area']);

        return Inertia::render('Admin/ServiceManagement/Edit', [
            'serviceProvider' => $serviceManagement,
            'categories' => ServiceProviderCategory::active()->ordered()->get(),
            'cities' => City::active()->ordered()->get(),
            'users' => User::where('user_type', 'customer')
                ->where(function ($q) use ($serviceManagement) {
                    $q->whereDoesntHave('serviceProvider')
                        ->orWhere('id', $serviceManagement->user_id);
                })
                ->select('id', 'first_name', 'last_name', 'email')
                ->get(),
        ]);
    }

    /**
     * Update service provider with dynamic creation support
     */
    public function update(Request $request, ServiceProvider $serviceManagement): RedirectResponse
    {
        $validated = $request->validate([
            // Category
            'category_id' => 'nullable|exists:service_provider_categories,id',
            'new_category_name' => 'nullable|required_without:category_id|string|max:255',

            // City
            'city_id' => 'nullable|exists:cities,id',
            'new_city_name' => 'nullable|required_without:city_id|string|max:255',
            'new_city_region' => 'nullable|required_with:new_city_name|in:England,Scotland,Wales,Northern Ireland',
            'new_city_county' => 'nullable|string|max:255',

            // Area
            'area_id' => 'nullable|exists:areas,id',
            'new_area_name' => 'nullable|required_without:area_id|string|max:255',
            'new_area_postcode' => 'nullable|string|max:20',

            'business_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'service_charge' => 'required|numeric|min:0',
            'contact_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'max_daily_orders' => 'required|integer|min:1|max:50',
            'availability_status' => 'required|in:available,busy,offline',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            // Handle Category
            if ($request->filled('new_category_name')) {
                $category = ServiceProviderCategory::create([
                    'name' => $request->new_category_name,
                    'slug' => Str::slug($request->new_category_name),
                    'is_active' => true,
                ]);
                $validated['category_id'] = $category->id;
            }

            // Handle City
            if ($request->filled('new_city_name')) {
                $city = City::create([
                    'name' => $request->new_city_name,
                    'slug' => Str::slug($request->new_city_name),
                    'region' => $request->new_city_region,
                    'county' => $request->new_city_county,
                    'is_active' => true,
                ]);
                $validated['city_id'] = $city->id;
            }

            // Handle Area
            if ($request->filled('new_area_name')) {
                $area = Area::create([
                    'city_id' => $validated['city_id'],
                    'name' => $request->new_area_name,
                    'slug' => Str::slug($request->new_area_name),
                    'postcode' => $request->new_area_postcode,
                    'is_active' => true,
                ]);
                $validated['area_id'] = $area->id;
            }

            // Handle verification
            if (($validated['is_verified'] ?? false) && !$serviceManagement->is_verified) {
                $validated['verified_at'] = now();
            } elseif (!($validated['is_verified'] ?? true) && $serviceManagement->is_verified) {
                $validated['verified_at'] = null;
            }

            // Remove temporary fields
            unset($validated['new_category_name']);
            unset($validated['new_city_name']);
            unset($validated['new_city_region']);
            unset($validated['new_city_county']);
            unset($validated['new_area_name']);
            unset($validated['new_area_postcode']);

            $serviceManagement->update($validated);

            DB::commit();

            return redirect()->route('admin.service-management.index')
                ->with('success', 'Service provider updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'Failed to update service provider: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete service provider
     */
    public function destroy(ServiceProvider $serviceManagement): RedirectResponse
    {
        $serviceManagement->delete();
        return redirect()->route('admin.service-management.index')
            ->with('success', 'Service provider deleted successfully.');
    }

    /**
     * Get areas by city (AJAX)
     */
    public function getAreasByCity(Request $request)
    {
        $validated = $request->validate([
            'city_id' => 'required|exists:cities,id'
        ]);

        $areas = Area::where('city_id', $validated['city_id'])
            ->active()
            ->ordered()
            ->get();

        return response()->json(['areas' => $areas]);
    }

    /**
     * Toggle provider status
     */
    public function toggleStatus(ServiceProvider $serviceManagement): RedirectResponse
    {
        $serviceManagement->update([
            'is_active' => !$serviceManagement->is_active
        ]);
        return back()->with('success', 'Status updated successfully.');
    }

    /**
     * Verify provider
     */
    public function verify(ServiceProvider $serviceManagement): RedirectResponse
    {
        $serviceManagement->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
        return back()->with('success', 'Service provider verified successfully.');
    }

    /**
     * Reset daily orders
     */
    public function resetDailyOrders(ServiceProvider $serviceManagement): RedirectResponse
    {
        $serviceManagement->resetDailyOrders();
        return back()->with('success', 'Daily orders reset successfully.');
    }

    /**
     * Bulk actions
     */
    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:service_providers,id',
            'action' => 'required|in:activate,deactivate,verify,delete',
        ]);

        $providers = ServiceProvider::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $providers->update(['is_active' => true]);
                $message = 'Service providers activated successfully.';
                break;
            case 'deactivate':
                $providers->update(['is_active' => false]);
                $message = 'Service providers deactivated successfully.';
                break;
            case 'verify':
                $providers->update([
                    'is_verified' => true,
                    'verified_at' => now()
                ]);
                $message = 'Service providers verified successfully.';
                break;
            case 'delete':
                $providers->delete();
                $message = 'Service providers deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }

    /**
     * Get all categories (for API/AJAX)
     */
    public function getCategories()
    {
        return response()->json([
            'categories' => ServiceProviderCategory::active()->ordered()->get()
        ]);
    }

    /**
     * Get all cities (for API/AJAX)
     */
    public function getCities()
    {
        return response()->json([
            'cities' => City::active()->ordered()->get()
        ]);
    }
}
