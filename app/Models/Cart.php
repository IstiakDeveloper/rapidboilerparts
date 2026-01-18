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
        'selected_services',
        'services_total',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selected_services' => 'array',
        'services_total' => 'decimal:2',
    ];


     public function getTotalPriceAttribute()
    {
        $productTotal = $this->product->final_price * $this->quantity;
        // Use the stored services_total from database
        $servicesTotal = $this->attributes['services_total'] ?? 0;

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
