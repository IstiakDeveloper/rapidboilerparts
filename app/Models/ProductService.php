<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany};

class ProductService extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'service_type_id',
        'price',
        'is_optional',
        'is_free',
        'conditions',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_optional' => 'boolean',
        'is_free' => 'boolean',
        'conditions' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function serviceType(): BelongsTo
    {
        return $this->belongsTo(ServiceType::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_service_assignments')
            ->withPivot(['custom_price', 'is_mandatory', 'is_free', 'conditions'])
            ->withTimestamps();
    }

    public function serviceProviders(): BelongsToMany
    {
        return $this->belongsToMany(ServiceProvider::class, 'product_service_service_provider')
            ->withPivot(['custom_price', 'experience_level', 'is_active'])
            ->withTimestamps();
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function getFinalPrice($productId = null): float
    {
        if ($productId) {
            $assignment = $this->products()->where('product_id', $productId)->first();
            if ($assignment && $assignment->pivot->custom_price !== null) {
                return (float) $assignment->pivot->custom_price;
            }
            if ($assignment && $assignment->pivot->is_free) {
                return 0;
            }
        }

        return $this->is_free ? 0 : (float) $this->price;
    }

    public function isMandatoryFor($productId): bool
    {
        if (!$this->is_optional) {
            return true;
        }

        $assignment = $this->products()->where('product_id', $productId)->first();
        return $assignment && $assignment->pivot->is_mandatory;
    }

    public function isFreeFor($productId): bool
    {
        if ($this->is_free) {
            return true;
        }

        $assignment = $this->products()->where('product_id', $productId)->first();
        return $assignment && $assignment->pivot->is_free;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
}
