<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'category', 'images', 'reviews'])
            ->active()
            ->inStock();

        // Search functionality
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%")
                  ->orWhere('manufacturer_part_number', 'like', "%{$searchTerm}%")
                  ->orWhere('gc_number', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhereHas('brand', function ($brandQuery) use ($searchTerm) {
                      $brandQuery->where('name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('category', function ($catQuery) use ($searchTerm) {
                      $catQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $query->whereHas('brand', function ($brandQuery) use ($request) {
                $brandQuery->where('slug', $request->brand);
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->whereHas('category', function ($catQuery) use ($request) {
                $catQuery->where('slug', $request->category);
            });
        }

        // Part Number search
        if ($request->filled('part_number')) {
            $query->where('manufacturer_part_number', 'like', "%{$request->part_number}%");
        }

        // GC Number search
        if ($request->filled('gc_number')) {
            $query->where('gc_number', 'like', "%{$request->gc_number}%");
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Featured filter
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // In stock filter
        if ($request->boolean('in_stock_only')) {
            $query->inStock();
        }

        // Sorting
        $sortBy = $request->get('sort', 'name');
        $sortOrder = $request->get('order', 'asc');

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'oldest':
                $query->oldest();
                break;
            case 'rating':
                $query->withAvg('reviews', 'rating')->orderBy('reviews_avg_rating', 'desc');
                break;
            case 'popular':
                $query->withCount('reviews')->orderBy('reviews_count', 'desc');
                break;
            default:
                $query->orderBy('name', 'asc');
        }

        // Get products with pagination
        $products = $query->paginate(12)->through(function ($product) {
            $primaryImage = $product->images->where('is_primary', true)->first();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'manufacturer_part_number' => $product->manufacturer_part_number,
                'gc_number' => $product->gc_number,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'final_price' => (float) $product->final_price,
                'discount_percentage' => $product->discount_percentage,
                'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                'rating' => round($product->reviews->avg('rating') ?? 0, 1),
                'reviews_count' => $product->reviews->count(),
                'brand' => [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug
                ],
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug
                ],
                'in_stock' => $product->in_stock,
                'stock_quantity' => $product->stock_quantity,
            ];
        });

        // Get filter options
        $brands = Brand::active()
            ->withCount(['products' => function ($q) {
                $q->active();
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'products_count' => $brand->products_count
                ];
            });

        $categories = Category::active()
            ->withCount(['products' => function ($q) {
                $q->active();
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'products_count' => $category->products_count
                ];
            });

        // Get price range
        $priceRange = Product::active()->selectRaw('MIN(price) as min_price, MAX(price) as max_price')->first();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
            'priceRange' => [
                'min' => (float) $priceRange->min_price,
                'max' => (float) $priceRange->max_price
            ],
            'filters' => $request->only([
                'search', 'brand', 'category', 'part_number', 'gc_number',
                'min_price', 'max_price', 'featured', 'in_stock_only', 'sort', 'order'
            ]),
            'totalProducts' => Product::active()->count(),
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['brand', 'category', 'images', 'reviews.user', 'compatibleModels']);

        $productData = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'manufacturer_part_number' => $product->manufacturer_part_number,
            'gc_number' => $product->gc_number,
            'description' => $product->description,
            'short_description' => $product->short_description,
            'price' => (float) $product->price,
            'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
            'final_price' => (float) $product->final_price,
            'discount_percentage' => $product->discount_percentage,
            'stock_quantity' => $product->stock_quantity,
            'in_stock' => $product->in_stock,
            'weight' => $product->weight,
            'brand' => [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
                'logo' => $product->brand->logo
            ],
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug
            ],
            'images' => $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'alt_text' => $image->alt_text,
                    'is_primary' => $image->is_primary
                ];
            }),
            'reviews' => $product->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'user' => $review->user->first_name . ' ' . substr($review->user->last_name, 0, 1) . '.',
                    'created_at' => $review->created_at->format('d M Y')
                ];
            }),
            'compatible_models' => $product->compatibleModels->map(function ($model) {
                return [
                    'id' => $model->id,
                    'brand_name' => $model->brand_name,
                    'model_name' => $model->model_name,
                    'model_code' => $model->model_code
                ];
            }),
            'average_rating' => round($product->reviews->avg('rating') ?? 0, 1),
            'total_reviews' => $product->reviews->count(),
        ];

        // Related products
        $relatedProducts = Product::with(['brand', 'images'])
            ->active()
            ->inStock()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get()
            ->map(function ($product) {
                $primaryImage = $product->images->where('is_primary', true)->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                    'final_price' => (float) $product->final_price,
                    'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                    'brand' => $product->brand->name,
                ];
            });

        return Inertia::render('Products/Show', [
            'product' => $productData,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
