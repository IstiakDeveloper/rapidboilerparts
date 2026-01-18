<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ServiceProvider;
use App\Models\ServiceProviderCategory;
use App\Models\ServiceProviderSchedule;
use App\Models\ProductService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ServiceProviderAssignmentService
{
    /**
     * Auto-assign service provider to an order based on location, category, date/time, and services
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

        // Get required services from order items
        $requiredServiceIds = $this->getRequiredServicesFromOrder($order);

        // Get preferred date/time if available
        $preferredDateTime = null;
        if ($order->preferred_service_date && $order->preferred_service_time) {
            $preferredDateTime = Carbon::parse($order->preferred_service_date . ' ' . $order->preferred_service_time);
        }

        // Find available service provider
        $serviceProvider = $this->findAvailableProvider(
            $cityId,
            $areaId,
            $category->id,
            $requiredServiceIds,
            $preferredDateTime
        );

        if ($serviceProvider) {
            $this->assignServiceProvider($order, $serviceProvider, $preferredDateTime);
            return $serviceProvider;
        }

        return null;
    }

    /**
     * Assign a specific service provider to an order
     */
    public function assignServiceProvider(Order $order, ServiceProvider $serviceProvider, ?Carbon $serviceDateTime = null): void
    {
        $order->update([
            'service_provider_id' => $serviceProvider->id,
            'service_provider_charge' => $serviceProvider->service_charge,
            'service_provider_status' => 'assigned',
            'assigned_at' => now(),
        ]);

        // Create schedule entry if date/time provided
        if ($serviceDateTime) {
            $this->createScheduleEntry($order, $serviceProvider, $serviceDateTime);
        }

        // Increment service provider's daily orders
        $serviceProvider->incrementDailyOrders();
    }

    /**
     * Find available provider based on location, services, and time
     */
    protected function findAvailableProvider(
        int $cityId,
        int $areaId,
        int $categoryId,
        array $requiredServiceIds = [],
        ?Carbon $preferredDateTime = null
    ): ?ServiceProvider {

        $query = ServiceProvider::available()
            ->byCategory($categoryId)
            ->byLocation($cityId, $areaId);

        // Filter by required services if specified
        if (!empty($requiredServiceIds)) {
            $query->whereHas('services', function ($q) use ($requiredServiceIds) {
                $q->whereIn('product_service_id', $requiredServiceIds)
                  ->wherePivot('is_active', true);
            }, '=', count($requiredServiceIds));
        }

        $providers = $query->orderBy('current_daily_orders', 'asc')
            ->orderBy('rating', 'desc')
            ->get();

        // If no date/time preference, return first available
        if (!$preferredDateTime) {
            return $providers->first();
        }

        // Check availability for specific date/time
        foreach ($providers as $provider) {
            if ($provider->isAvailableOnDateTime($preferredDateTime)) {
                return $provider;
            }
        }

        // If no one in exact area, try city-wide
        $query = ServiceProvider::available()
            ->byCategory($categoryId)
            ->byCity($cityId);

        if (!empty($requiredServiceIds)) {
            $query->whereHas('services', function ($q) use ($requiredServiceIds) {
                $q->whereIn('product_service_id', $requiredServiceIds)
                  ->wherePivot('is_active', true);
            }, '=', count($requiredServiceIds));
        }

        $providers = $query->orderBy('current_daily_orders', 'asc')
            ->orderBy('rating', 'desc')
            ->get();

        if (!$preferredDateTime) {
            return $providers->first();
        }

        foreach ($providers as $provider) {
            if ($provider->isAvailableOnDateTime($preferredDateTime)) {
                return $provider;
            }
        }

        return null;
    }

    /**
     * Get required services from order items
     */
    protected function getRequiredServicesFromOrder(Order $order): array
    {
        $serviceIds = [];

        foreach ($order->items as $item) {
            if ($item->selected_services && is_array($item->selected_services)) {
                $serviceIds = array_merge($serviceIds, $item->selected_services);
            }
        }

        return array_unique($serviceIds);
    }

    /**
     * Create schedule entry for service provider
     */
    protected function createScheduleEntry(Order $order, ServiceProvider $serviceProvider, Carbon $serviceDateTime): void
    {
        $duration = $serviceProvider->avg_service_duration ?? 60;
        $endTime = $serviceDateTime->copy()->addMinutes($duration);

        ServiceProviderSchedule::create([
            'service_provider_id' => $serviceProvider->id,
            'order_id' => $order->id,
            'service_date' => $serviceDateTime->format('Y-m-d'),
            'start_time' => $serviceDateTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'time_slot' => $this->determineTimeSlot($serviceDateTime),
            'status' => ServiceProviderSchedule::STATUS_SCHEDULED,
        ]);
    }

    /**
     * Determine time slot from datetime
     */
    protected function determineTimeSlot(Carbon $dateTime): string
    {
        $hour = $dateTime->hour;

        if ($hour >= 8 && $hour < 12) {
            return ServiceProviderSchedule::SLOT_MORNING;
        } elseif ($hour >= 12 && $hour < 17) {
            return ServiceProviderSchedule::SLOT_AFTERNOON;
        } else {
            return ServiceProviderSchedule::SLOT_EVENING;
        }
    }

    /**
     * Reassign service provider (manual or auto)
     */
    public function reassignServiceProvider(Order $order, ?ServiceProvider $newServiceProvider = null): ?ServiceProvider
    {
        // Cancel old schedule if exists
        if ($order->service_provider_id) {
            ServiceProviderSchedule::where('order_id', $order->id)
                ->where('status', ServiceProviderSchedule::STATUS_SCHEDULED)
                ->update(['status' => ServiceProviderSchedule::STATUS_CANCELLED]);

            // Decrease old service provider's count
            $oldProvider = ServiceProvider::find($order->service_provider_id);
            if ($oldProvider && $oldProvider->current_daily_orders > 0) {
                $oldProvider->decrement('current_daily_orders');

                // Set back to available if was busy
                if ($oldProvider->availability_status === ServiceProvider::STATUS_BUSY) {
                    $oldProvider->update(['availability_status' => ServiceProvider::STATUS_AVAILABLE]);
                }
            }
        }

        // Get preferred date/time
        $preferredDateTime = null;
        if ($order->preferred_service_date && $order->preferred_service_time) {
            $preferredDateTime = Carbon::parse($order->preferred_service_date . ' ' . $order->preferred_service_time);
        }

        // If specific provider given, assign them
        if ($newServiceProvider) {
            $this->assignServiceProvider($order, $newServiceProvider, $preferredDateTime);
            return $newServiceProvider;
        }

        // Otherwise auto-assign
        return $this->autoAssignServiceProvider($order);
    }

    /**
     * Get available service providers for a location and services
     */
    public function getAvailableProviders(
        int $cityId,
        int $areaId,
        ?string $categorySlug = null,
        array $requiredServiceIds = [],
        ?Carbon $preferredDateTime = null
    ): \Illuminate\Database\Eloquent\Collection {

        $query = ServiceProvider::available()
            ->byLocation($cityId, $areaId)
            ->with(['user', 'category', 'city', 'area', 'services']);

        if ($categorySlug) {
            $category = ServiceProviderCategory::where('slug', $categorySlug)->first();
            if ($category) {
                $query->byCategory($category->id);
            }
        }

        // Filter by required services
        if (!empty($requiredServiceIds)) {
            $query->whereHas('services', function ($q) use ($requiredServiceIds) {
                $q->whereIn('product_service_id', $requiredServiceIds)
                  ->wherePivot('is_active', true);
            });
        }

        $providers = $query->orderBy('rating', 'desc')
            ->orderBy('current_daily_orders', 'asc')
            ->get();

        // Filter by date/time if specified
        if ($preferredDateTime) {
            $providers = $providers->filter(function ($provider) use ($preferredDateTime) {
                return $provider->isAvailableOnDateTime($preferredDateTime);
            });
        }

        return $providers;
    }

    /**
     * Check if any service provider is available for a location
     */
    public function hasAvailableProviders(
        int $cityId,
        int $areaId,
        ?string $categorySlug = null,
        array $requiredServiceIds = [],
        ?Carbon $preferredDateTime = null
    ): bool {

        return $this->getAvailableProviders(
            $cityId,
            $areaId,
            $categorySlug,
            $requiredServiceIds,
            $preferredDateTime
        )->isNotEmpty();
    }

    /**
     * Get available time slots for a specific date
     */
    public function getAvailableTimeSlots(
        ServiceProvider $serviceProvider,
        Carbon $date
    ): array {

        $dayName = strtolower($date->format('l'));

        // Check if provider works on this day
        if (!in_array($dayName, $serviceProvider->working_days ?? [])) {
            return [];
        }

        // Get working hours for this day
        $workingDay = $serviceProvider->working_hours[$dayName] ?? null;
        if (!$workingDay || !($workingDay['available'] ?? true)) {
            return [];
        }

        $startTime = $workingDay['start'] ?? '09:00';
        $endTime = $workingDay['end'] ?? '18:00';
        $duration = $serviceProvider->avg_service_duration ?? 60;

        // Get existing bookings for this date
        $existingBookings = $serviceProvider->schedules()
            ->forDate($date)
            ->active()
            ->get();

        // Generate possible slots
        $slots = [];
        $currentTime = Carbon::parse($date->format('Y-m-d') . ' ' . $startTime);
        $endDateTime = Carbon::parse($date->format('Y-m-d') . ' ' . $endTime);

        while ($currentTime->copy()->addMinutes($duration)->lte($endDateTime)) {
            $slotEnd = $currentTime->copy()->addMinutes($duration);

            // Check if slot is available
            $isAvailable = true;
            foreach ($existingBookings as $booking) {
                if ($booking->isConflictWith($currentTime->format('H:i:s'), $slotEnd->format('H:i:s'))) {
                    $isAvailable = false;
                    break;
                }
            }

            if ($isAvailable) {
                $slots[] = [
                    'start_time' => $currentTime->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'formatted' => $currentTime->format('g:i A') . ' - ' . $slotEnd->format('g:i A'),
                    'slot' => $this->determineTimeSlot($currentTime),
                ];
            }

            $currentTime->addMinutes($duration);
        }

        return $slots;
    }
}
