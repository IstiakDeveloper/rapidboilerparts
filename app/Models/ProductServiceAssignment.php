<?php
// app/Models/ProductServiceAssignment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductServiceAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_service_id',
        'custom_price',
        'is_mandatory',
        'is_free',
        'conditions',
    ];

    protected $casts = [
        'custom_price' => 'decimal:2',
        'is_mandatory' => 'boolean',
        'is_free' => 'boolean',
        'conditions' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productService(): BelongsTo
    {
        return $this->belongsTo(ProductService::class);
    }
}
