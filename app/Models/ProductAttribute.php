<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'is_required',
        'is_filterable',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_filterable' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function values(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    // Scopes
    public function scopeFilterable($query)
    {
        return $query->where('is_filterable', true);
    }


    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
}
