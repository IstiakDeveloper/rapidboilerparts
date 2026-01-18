<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ServiceProviderSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_provider_id',
        'order_id',
        'service_date',
        'start_time',
        'end_time',
        'time_slot',
        'status',
        'notes',
    ];

    protected $casts = [
        'service_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Status constants
    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    // Time slot constants
    public const SLOT_MORNING = 'morning';    // 8AM - 12PM
    public const SLOT_AFTERNOON = 'afternoon'; // 12PM - 5PM
    public const SLOT_EVENING = 'evening';     // 5PM - 8PM

    // Relationships
    public function serviceProvider(): BelongsTo
    {
        return $this->belongsTo(ServiceProvider::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_IN_PROGRESS]);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('service_date', Carbon::parse($date)->format('Y-m-d'));
    }

    public function scopeForProvider($query, $providerId)
    {
        return $query->where('service_provider_id', $providerId);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('service_date', '>=', now()->format('Y-m-d'))
            ->whereIn('status', [self::STATUS_SCHEDULED, self::STATUS_IN_PROGRESS]);
    }

    // Helper methods
    public function isConflictWith(string $checkStartTime, string $checkEndTime): bool
    {
        $scheduleStart = Carbon::parse($this->start_time);
        $scheduleEnd = Carbon::parse($this->end_time);
        $checkStart = Carbon::parse($checkStartTime);
        $checkEnd = Carbon::parse($checkEndTime);

        return $checkStart->lt($scheduleEnd) && $checkEnd->gt($scheduleStart);
    }

    public function getDurationInMinutes(): int
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);
        return $start->diffInMinutes($end);
    }

    // Accessors
    public function getFormattedDateAttribute(): string
    {
        return $this->service_date->format('M d, Y');
    }

    public function getFormattedTimeAttribute(): string
    {
        return Carbon::parse($this->start_time)->format('g:i A') . ' - ' .
               Carbon::parse($this->end_time)->format('g:i A');
    }

    public function getIsUpcomingAttribute(): bool
    {
        return $this->service_date->isFuture() &&
               in_array($this->status, [self::STATUS_SCHEDULED, self::STATUS_IN_PROGRESS]);
    }
}
