<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ServiceProvider;
use App\Models\ServiceProviderCategory;

class ServiceProviderAssignmentService
{
    /**
     * Auto-assign service provider to an order based on location and category
     */
    public function autoAssignServiceProvider(Order $order, string $categorySlug = 'installer'): ?ServiceProvider
    {
        // Get shipping address from order
        $shippingAddress = $order->shipping_address;

        if (!isset($shippingAddress['city_id']) || !isset($shippingAddress['area_id'])) {
            return null;
        }

        $cityId = $shippingAddress['city_id'];
        $areaId = $shippingAddress['area_id'];

        // Get category
        $category = ServiceProviderCategory::where('slug', $categorySlug)
            ->where('is_active', true)
            ->first();

        if (!$category) {
            return null;
        }

        // Find available service provider in the same area
        $serviceProvider = ServiceProvider::available()
            ->byCategory($category->id)
            ->byLocation($cityId, $areaId)
            ->orderBy('current_daily_orders', 'asc') // Prioritize those with fewer orders
            ->orderBy('rating', 'desc') // Then by rating
            ->first();

        if ($serviceProvider) {
            $this->assignServiceProvider($order, $serviceProvider);
            return $serviceProvider;
        }

        // If no one in exact area, try city-wide
        $serviceProvider = ServiceProvider::available()
            ->byCategory($category->id)
            ->byCity($cityId)
            ->orderBy('current_daily_orders', 'asc')
            ->orderBy('rating', 'desc')
            ->first();

        if ($serviceProvider) {
            $this->assignServiceProvider($order, $serviceProvider);
            return $serviceProvider;
        }

        return null;
    }

    /**
     * Assign a specific service provider to an order
     */
    public function assignServiceProvider(Order $order, ServiceProvider $serviceProvider): void
    {
        $order->update([
            'service_provider_id' => $serviceProvider->id,
            'service_provider_charge' => $serviceProvider->service_charge,
            'service_provider_status' => 'assigned',
            'assigned_at' => now(),
        ]);

        // Increment service provider's daily orders
        $serviceProvider->incrementDailyOrders();
    }

    /**
     * Reassign service provider (manual or auto)
     */
    public function reassignServiceProvider(Order $order, ?ServiceProvider $newServiceProvider = null): ?ServiceProvider
    {
        // Decrease old service provider's count
        if ($order->service_provider_id) {
            $oldProvider = ServiceProvider::find($order->service_provider_id);
            if ($oldProvider && $oldProvider->current_daily_orders > 0) {
                $oldProvider->decrement('current_daily_orders');

                // Set back to available if was busy
                if ($oldProvider->availability_status === ServiceProvider::STATUS_BUSY) {
                    $oldProvider->update(['availability_status' => ServiceProvider::STATUS_AVAILABLE]);
                }
            }
        }

        // If specific provider given, assign them
        if ($newServiceProvider) {
            $this->assignServiceProvider($order, $newServiceProvider);
            return $newServiceProvider;
        }

        // Otherwise auto-assign
        return $this->autoAssignServiceProvider($order);
    }

    /**
     * Get available service providers for a location
     */
    public function getAvailableProviders(int $cityId, int $areaId, ?string $categorySlug = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = ServiceProvider::available()
            ->byLocation($cityId, $areaId)
            ->with(['user', 'category', 'city', 'area']);

        if ($categorySlug) {
            $category = ServiceProviderCategory::where('slug', $categorySlug)->first();
            if ($category) {
                $query->byCategory($category->id);
            }
        }

        return $query->orderBy('rating', 'desc')
            ->orderBy('current_daily_orders', 'asc')
            ->get();
    }

    /**
     * Check if any service provider is available for a location
     */
    public function hasAvailableProviders(int $cityId, int $areaId, ?string $categorySlug = null): bool
    {
        $query = ServiceProvider::available()
            ->byLocation($cityId, $areaId);

        if ($categorySlug) {
            $category = ServiceProviderCategory::where('slug', $categorySlug)->first();
            if ($category) {
                $query->byCategory($category->id);
            }
        }

        return $query->exists();
    }
}
