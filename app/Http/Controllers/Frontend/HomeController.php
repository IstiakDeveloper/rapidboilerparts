<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        // Get top 6 categories only for display
        $categories = Category::whereNull('parent_id')
            ->active()
            ->ordered()
            ->limit(6)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $this->getCategoryIcon($category->name),
                    'products_count' => $category->products()->active()->count(),
                ];
            });

        // Get all categories for search dropdown
        $allCategories = Category::active()
            ->ordered()
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'products_count' => $category->products()->active()->count(),
                ];
            });

        // Get brands with their available categories (এক বারেই সব data)
        $brands = Brand::active()
            ->ordered()
            ->withCount(['products' => function ($query) {
                $query->active();
            }])
            ->get()
            ->map(function ($brand) {
                // Get categories that have products from this brand
                $brandCategories = Category::whereHas('products', function ($query) use ($brand) {
                    $query->where('brand_id', $brand->id)->active();
                })
                ->active()
                ->withCount(['products' => function ($query) use ($brand) {
                    $query->where('brand_id', $brand->id)->active();
                }])
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'products_count' => $category->products_count
                    ];
                });

                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'logo' => $brand->logo,
                    'products_count' => $brand->products_count,
                    'categories' => $brandCategories // Brand এর specific categories
                ];
            });

        // Get 8 featured products
        $featuredProducts = Product::with(['brand', 'images', 'reviews'])
            ->active()
            ->featured()
            ->inStock()
            ->limit(8)
            ->get()
            ->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'final_price' => (float) $product->final_price,
                    'discount_percentage' => $product->discount_percentage,
                    'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                    'rating' => round($product->reviews->avg('rating') ?? 0, 1),
                    'reviews_count' => $product->reviews->count(),
                    'brand' => [
                        'name' => $product->brand->name,
                        'slug' => $product->brand->slug
                    ],
                    'in_stock' => $product->in_stock,
                ];
            });

        // Get 4 latest products
        $latestProducts = Product::with(['brand', 'images'])
            ->active()
            ->inStock()
            ->latest()
            ->limit(4)
            ->get()
            ->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'sku' => $product->sku,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'final_price' => (float) $product->final_price,
                    'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                    'brand' => $product->brand->name,
                    'in_stock' => $product->in_stock
                ];
            });

        // Simple stats
        $stats = [
            'total_products' => Product::active()->count(),
            'total_brands' => Brand::active()->count(),
            'total_categories' => Category::active()->count(),
        ];

        return Inertia::render('Home', [
            'categories' => $categories, // Display এর জন্য top 6
            'allCategories' => $allCategories, // Search dropdown এর জন্য সব categories
            'brands' => $brands, // Brands with their categories
            'featuredProducts' => $featuredProducts,
            'latestProducts' => $latestProducts,
            'stats' => $stats,
        ]);
    }

    private function getCategoryIcon(string $categoryName): string
    {
        $icons = [
            'PCB' => '🔌',
            'Diverter' => '🔧',
            'Pumps' => '💧',
            'Heat' => '🔥',
            'Gas' => '⚡',
            'Fans' => '🌀',
            'Motors' => '🌀',
            'Sensors' => '📡',
            'Electrodes' => '⚡'
        ];

        foreach ($icons as $key => $icon) {
            if (str_contains(strtolower($categoryName), strtolower($key))) {
                return $icon;
            }
        }

        return '🔧';
    }
}
