<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selected_services' => 'array',
    ];

    public function getServicesTotalAttribute(): float
    {
        if (!$this->selected_services || !is_array($this->selected_services)) {
            return 0;
        }

        $total = 0;
        foreach ($this->selected_services as $serviceId) {
            $total += $this->product->getServicePrice($serviceId);
        }

        return $total;
    }

    public function getTotalPriceAttribute()
    {
        $productTotal = $this->product->final_price * $this->quantity;
        $servicesTotal = $this->services_total;

        return $productTotal + $servicesTotal;
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeBySession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }
}
