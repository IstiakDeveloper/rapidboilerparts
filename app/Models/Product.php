<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;
use App\Services\BarcodeService;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'short_description',
        'description',
        'sku',
        'barcode',
        'barcode_image',
        'manufacturer_part_number',
        'gc_number',
        'price',
        'sale_price',
        'cost_price',
        'stock_quantity',
        'manage_stock',
        'in_stock',
        'low_stock_threshold',
        'meta_title',
        'meta_description',
        'status',
        'is_featured',
        'brand_id',
        'category_id',
        'weight',
        'length',
        'width',
        'height',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'manage_stock' => 'boolean',
        'in_stock' => 'boolean',
        'low_stock_threshold' => 'integer',
        'is_featured' => 'boolean',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
    ];

    // Relationships
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    public function compatibleModels(): BelongsToMany
    {
        return $this->belongsToMany(CompatibleModel::class, 'product_compatible_models');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlistItems(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    // Accessors
    public function getFinalPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    public function getDiscountPercentageAttribute()
    {
        if ($this->sale_price && $this->price > $this->sale_price) {
            return round((($this->price - $this->sale_price) / $this->price) * 100, 2);
        }
        return 0;
    }

    public function getPrimaryImageAttribute()
    {
        return $this->images()->where('is_primary', true)->first();
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    public function scopeByBrand($query, $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('manufacturer_part_number', 'like', "%{$search}%")
                ->orWhere('gc_number', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }


    public function services(): BelongsToMany
    {
        return $this->belongsToMany(ProductService::class, 'product_service_assignments')
            ->withPivot(['custom_price', 'is_mandatory', 'is_free', 'conditions'])
            ->withTimestamps();
    }

    public function availableServices()
    {
        return $this->services()->active()->ordered();
    }

    public function mandatoryServices()
    {
        return $this->services()->active()->where(function ($query) {
            $query->where('product_services.is_optional', false)
                ->orWhere('product_service_assignments.is_mandatory', true);
        });
    }

    public function getServicePrice($serviceId): float
    {
        $service = $this->services()->where('product_services.id', $serviceId)->first();
        if (!$service) {
            return 0;
        }

        return $service->getFinalPrice($this->id);
    }

    public function serviceAssignments(): HasMany
    {
        return $this->hasMany(ProductServiceAssignment::class);
    }

    /**
     * Generate a unique barcode for the product
     */
    public function generateBarcode(): string
    {
        // Generate a shorter barcode with format: RB{brand_id}{category_id}{random}
        // where {random} is a 4-digit number
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $barcode = sprintf(
            'RB%02d%02d%s',
            $this->brand_id,
            $this->category_id,
            $random
        );

        // Generate barcode image
        try {
            $barcodeService = app(BarcodeService::class);
            $this->barcode_image = $barcodeService->generateBarcodeImage($barcode);
            $this->barcode = $barcode;
            $this->save();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to generate barcode image: ' . $e->getMessage());
        }

        return $barcode;
    }

    public function getBarcodeImageUrlAttribute()
    {
        return $this->barcode_image ? Storage::url($this->barcode_image) : null;
    }
}
