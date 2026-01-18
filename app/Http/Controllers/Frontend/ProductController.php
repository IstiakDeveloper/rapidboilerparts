<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->withCount([
                'products' => function ($q) {
                    $q->active();
                }
            ])
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
            ->withCount([
                'products' => function ($q) {
                    $q->active();
                }
            ])
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

        // Get all active services (available for all products)
        $availableServices = ProductService::active()
            ->ordered()
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'base_price' => (float) $service->price,
                    'duration_minutes' => 60,
                    'type' => $service->type,
                    'is_optional' => (bool) $service->is_optional,
                    'is_free' => (bool) $service->is_free,
                ];
            });

        return Inertia::render('Products/Index', [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
            'priceRange' => [
                'min' => (float) $priceRange->min_price,
                'max' => (float) $priceRange->max_price
            ],
            'filters' => $request->only([
                'search',
                'brand',
                'category',
                'part_number',
                'gc_number',
                'min_price',
                'max_price',
                'featured',
                'in_stock_only',
                'sort',
                'order'
            ]),
            'totalProducts' => Product::active()->count(),
            'availableServices' => $availableServices,
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::with([
            'brand',
            'category',
            'images' => fn($q) => $q->ordered(),
            'reviews' => fn($q) => $q->approved()->with('user'),
            'attributeValues.attribute',
            'compatibleModels' => fn($q) => $q->active(),
        ])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        // Get assigned services
        $productServices = DB::table('product_service_assignments')
            ->join('product_services', 'product_service_assignments.product_service_id', '=', 'product_services.id')
            ->where('product_service_assignments.product_id', $product->id)
            ->where('product_services.is_active', true)
            ->select(
                'product_services.id',
                'product_services.name',
                'product_services.slug',
                'product_services.description',
                'product_services.type',
                'product_services.price as default_price',
                'product_service_assignments.custom_price',
                'product_service_assignments.is_mandatory',
                'product_service_assignments.is_free as assignment_is_free',
                'product_services.is_free as service_is_free',
                'product_services.is_optional',
                'product_services.conditions',
                'product_services.sort_order'
            )
            ->orderBy('product_services.sort_order')
            ->get()
            ->map(function ($service) {
                $finalPrice = $service->custom_price ?? $service->default_price;
                $isFree = $service->assignment_is_free || $service->service_is_free;

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'type' => $service->type,
                    'price' => $isFree ? 0 : (float) $finalPrice,
                    'is_free' => $isFree,
                    'is_mandatory' => (bool) $service->is_mandatory,
                    'is_optional' => (bool) $service->is_optional,
                ];
            });

        // Related products
        $relatedProducts = Product::with(['brand', 'images'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->inStock()
            ->limit(8)
            ->get()
            ->map(function ($prod) {
                $primaryImage = $prod->images->where('is_primary', true)->first();
                return [
                    'id' => $prod->id,
                    'name' => $prod->name,
                    'slug' => $prod->slug,
                    'price' => (float) $prod->price,
                    'sale_price' => $prod->sale_price ? (float) $prod->sale_price : null,
                    'final_price' => (float) $prod->final_price,
                    'discount_percentage' => $prod->discount_percentage,
                    'image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                    'brand' => ['name' => $prod->brand->name, 'slug' => $prod->brand->slug],
                    'rating' => round($prod->reviews->avg('rating') ?? 0, 1),
                    'in_stock' => $prod->in_stock,
                ];
            });

        // Calculate rating breakdown
        $ratingBreakdown = [
            5 => $product->reviews->where('rating', 5)->count(),
            4 => $product->reviews->where('rating', 4)->count(),
            3 => $product->reviews->where('rating', 3)->count(),
            2 => $product->reviews->where('rating', 2)->count(),
            1 => $product->reviews->where('rating', 1)->count(),
        ];

        $primaryImage = $product->images->where('is_primary', true)->first();

        return Inertia::render('Products/Show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'manufacturer_part_number' => $product->manufacturer_part_number,
                'gc_number' => $product->gc_number,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price ? (float) $product->sale_price : null,
                'cost_price' => $product->cost_price ? (float) $product->cost_price : null,
                'final_price' => (float) $product->final_price,
                'discount_percentage' => $product->discount_percentage,
                'stock_quantity' => $product->stock_quantity,
                'in_stock' => $product->in_stock,
                'low_stock_threshold' => $product->low_stock_threshold,
                'is_featured' => $product->is_featured,
                'manage_stock' => $product->manage_stock,
                'weight' => $product->weight ? (float) $product->weight : null,
                'dimensions' => [
                    'length' => $product->length ? (float) $product->length : null,
                    'width' => $product->width ? (float) $product->width : null,
                    'height' => $product->height ? (float) $product->height : null,
                ],
                'brand' => [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                    'logo' => $product->brand->logo,
                    'website' => $product->brand->website,
                ],
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'images' => $product->images->map(fn($img) => [
                    'id' => $img->id,
                    'image_path' => $img->image_path,
                    'alt_text' => $img->alt_text ?? $product->name,
                    'is_primary' => $img->is_primary,
                    'sort_order' => $img->sort_order,
                ]),
                'primary_image' => $primaryImage ? $primaryImage->image_path : 'products/placeholder-product.jpg',
                'attributes' => $product->attributeValues->map(fn($av) => [
                    'id' => $av->id,
                    'name' => $av->attribute->name,
                    'slug' => $av->attribute->slug,
                    'value' => $av->value,
                    'type' => $av->attribute->type,
                ]),
                'compatible_models' => $product->compatibleModels->groupBy('brand_name')->map(fn($models, $brand) => [
                    'brand' => $brand,
                    'models' => $models->map(fn($cm) => [
                        'id' => $cm->id,
                        'model_name' => $cm->model_name,
                        'model_code' => $cm->model_code,
                        'year_from' => $cm->year_from,
                        'year_to' => $cm->year_to,
                        'year_range' => ($cm->year_from && $cm->year_to)
                            ? "{$cm->year_from} - {$cm->year_to}"
                            : ($cm->year_from ? "From {$cm->year_from}" : null),
                    ])->values()
                ])->values(),
                'rating' => round($product->reviews->avg('rating') ?? 0, 1),
                'reviews_count' => $product->reviews->count(),
                'rating_breakdown' => $ratingBreakdown,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'created_at' => $product->created_at->format('M d, Y'),
                'updated_at' => $product->updated_at->format('M d, Y'),
            ],
            'services' => $productServices,
            'reviews' => $product->reviews->map(fn($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'title' => $review->title,
                'comment' => $review->comment,
                'user_name' => $review->user->first_name . ' ' . substr($review->user->last_name, 0, 1) . '.',
                'created_at' => $review->created_at->format('M d, Y'),
                'formatted_date' => $review->created_at->diffForHumans(),
            ]),
            'relatedProducts' => $relatedProducts,
        ]);
    }

}
