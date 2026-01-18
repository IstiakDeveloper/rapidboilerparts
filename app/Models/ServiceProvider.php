<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class ServiceProvider extends Model
{
    use HasFactory;

    // Availability Status Constants
    public const STATUS_AVAILABLE = 'available';
    public const STATUS_BUSY = 'busy';
    public const STATUS_OFFLINE = 'offline';

    protected $fillable = [
        'user_id',
        'category_id',
        'city_id',
        'area_id',
        'business_name',
        'description',
        'service_charge',
        'contact_number',
        'email',
        'availability_status',
        'working_hours',
        'working_days',
        'avg_service_duration',
        'min_advance_booking_hours',
        'max_daily_orders',
        'current_daily_orders',
        'rating',
        'total_jobs_completed',
        'total_reviews',
        'is_active',
        'is_verified',
        'verified_at',
        'last_active_at',
    ];

    protected $casts = [
        'service_charge' => 'decimal:2',
        'rating' => 'decimal:2',
        'max_daily_orders' => 'integer',
        'current_daily_orders' => 'integer',
        'total_jobs_completed' => 'integer',
        'total_reviews' => 'integer',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'last_active_at' => 'datetime',
        'working_hours' => 'array',
        'working_days' => 'array',
        'avg_service_duration' => 'integer',
        'min_advance_booking_hours' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceProviderCategory::class, 'category_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(ProductService::class, 'product_service_service_provider')
            ->withPivot(['custom_price', 'experience_level', 'is_active'])
            ->withTimestamps();
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ServiceProviderSchedule::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('availability_status', self::STATUS_AVAILABLE)
            ->where('is_active', true)
            ->where('is_verified', true)
            ->whereColumn('current_daily_orders', '<', 'max_daily_orders');
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    public function scopeByArea($query, $areaId)
    {
        return $query->where('area_id', $areaId);
    }

    public function scopeByLocation($query, $cityId, $areaId)
    {
        return $query->where('city_id', $cityId)
            ->where('area_id', $areaId);
    }

    // Helper Methods
    public function isAvailable(): bool
    {
        return $this->is_active
            && $this->is_verified
            && $this->availability_status === self::STATUS_AVAILABLE
            && $this->current_daily_orders < $this->max_daily_orders;
    }

    public function incrementDailyOrders(): void
    {
        $this->increment('current_daily_orders');

        // Auto set to busy if reached max
        if ($this->current_daily_orders >= $this->max_daily_orders) {
            $this->update(['availability_status' => self::STATUS_BUSY]);
        }
    }

    public function resetDailyOrders(): void
    {
        $this->update([
            'current_daily_orders' => 0,
            'availability_status' => self::STATUS_AVAILABLE,
        ]);
    }

    public function updateRating(int $newRating): void
    {
        $totalRating = ($this->rating * $this->total_reviews) + $newRating;
        $newTotalReviews = $this->total_reviews + 1;
        $newRatingValue = round($totalRating / $newTotalReviews, 2);

        $this->update([
            'rating' => $newRatingValue,
            'total_reviews' => $newTotalReviews
        ]);
    }

    // Accessors
    public function getDisplayNameAttribute(): string
    {
        return $this->business_name ?? $this->user->full_name;
    }

    public function getLocationAttribute(): string
    {
        return $this->area->name . ', ' . $this->city->name;
    }

    // Schedule & Availability Methods
    public function isAvailableOnDateTime(Carbon $dateTime): bool
    {
        // Check if provider is generally available
        if (!$this->isAvailable()) {
            return false;
        }

        // Check if date is in working days
        $dayName = strtolower($dateTime->format('l'));
        if (!in_array($dayName, $this->working_days ?? [])) {
            return false;
        }

        // Check advance booking requirement
        $hoursUntilService = now()->diffInHours($dateTime, false);
        if ($hoursUntilService < $this->min_advance_booking_hours) {
            return false;
        }

        // Check if time falls within working hours
        if ($this->working_hours && isset($this->working_hours[$dayName])) {
            $workingDay = $this->working_hours[$dayName];
            if (!($workingDay['available'] ?? true)) {
                return false;
            }

            $serviceTime = $dateTime->format('H:i');
            $startTime = $workingDay['start'] ?? '09:00';
            $endTime = $workingDay['end'] ?? '18:00';

            if ($serviceTime < $startTime || $serviceTime > $endTime) {
                return false;
            }
        }

        // Check for existing bookings at that time
        $existingBooking = $this->schedules()
            ->where('service_date', $dateTime->format('Y-m-d'))
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($dateTime) {
                $query->where(function ($q) use ($dateTime) {
                    $q->where('start_time', '<=', $dateTime->format('H:i:s'))
                      ->where('end_time', '>', $dateTime->format('H:i:s'));
                });
            })
            ->exists();

        return !$existingBooking;
    }

    public function canProvideService(int $productServiceId): bool
    {
        return $this->services()
            ->where('product_service_id', $productServiceId)
            ->wherePivot('is_active', true)
            ->exists();
    }

    public function getServicePrice(int $productServiceId): ?float
    {
        $service = $this->services()
            ->where('product_service_id', $productServiceId)
            ->first();

        if (!$service) {
            return null;
        }

        // Return custom price if set, otherwise service's default price
        return $service->pivot->custom_price ?? $service->price;
    }
}
