<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
