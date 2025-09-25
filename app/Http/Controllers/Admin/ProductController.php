<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Product, Category, Brand, ProductAttribute, CompatibleModel, ProductService, ProductImage};
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;
use DB;
use Storage;
use Image;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'category', 'images' => function ($q) {
            $q->where('is_primary', true);
        }])
            ->withCount(['reviews', 'images']);

        if ($request->search) {
            $query->search($request->search);
        }

        if ($request->brand_id) {
            $query->byBrand($request->brand_id);
        }

        if ($request->category_id) {
            $query->byCategory($request->category_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->stock_status) {
            if ($request->stock_status === 'in_stock') {
                $query->inStock();
            } elseif ($request->stock_status === 'low_stock') {
                $query->whereRaw('stock_quantity <= low_stock_threshold');
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock_quantity', 0);
            }
        }

        $products = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'brands' => $brands,
            'categories' => $categories,
            'filters' => $request->only('search', 'brand_id', 'category_id', 'status', 'stock_status'),
        ]);
    }

    public function create(): Response
    {
        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $attributes = ProductAttribute::ordered()->get();
        $compatible_models = CompatibleModel::active()->get();
        $services = ProductService::active()->ordered()->get();

        return Inertia::render('Admin/Products/Create', [
            'brands' => $brands,
            'categories' => $categories,
            'attributes' => $attributes,
            'compatible_models' => $compatible_models,
            'services' => $services,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products',
            'sku' => 'required|string|unique:products',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'status' => 'required|in:active,inactive,draft',
            'attributes' => 'array',
            'compatible_models' => 'array',
            'services' => 'array',
            'images' => 'array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'image_alts' => 'array',
            'image_alts.*' => 'nullable|string|max:255',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $data = $request->except(['attributes', 'compatible_models', 'services', 'images', 'image_alts', 'primary_image_index']);
            $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
            $data['in_stock'] = $data['stock_quantity'] > 0;

            $product = Product::create($data);

            // Handle attributes
            if ($request->attributes) {
                foreach ($request->attributes as $attributeId => $value) {
                    if ($value) {
                        $product->attributeValues()->create([
                            'product_attribute_id' => $attributeId,
                            'value' => $value,
                        ]);
                    }
                }
            }

            // Handle compatible models
            if ($request->compatible_models) {
                $product->compatibleModels()->sync($request->compatible_models);
            }

            // Handle services
            if ($request->services) {
                $syncData = [];
                foreach ($request->services as $service) {
                    $syncData[$service['service_id']] = [
                        'custom_price' => $service['custom_price'],
                        'is_mandatory' => $service['is_mandatory'] ?? false,
                        'is_free' => $service['is_free'] ?? false,
                    ];
                }
                $product->services()->sync($syncData);
            }

            // Handle images
            if ($request->hasFile('images')) {
                $this->handleImageUpload($product, $request->file('images'), $request->image_alts ?? [], $request->primary_image_index ?? 0);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $product->load([
            'brand',
            'category',
            'images' => function ($q) {
                $q->ordered();
            },
            'attributeValues.attribute',
            'compatibleModels',
            'reviews.user',
            'services'
        ]);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load(['attributeValues', 'compatibleModels', 'images' => function ($q) {
            $q->ordered();
        }, 'services']);

        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $attributes = ProductAttribute::ordered()->get();
        $compatible_models = CompatibleModel::active()->get();
        $services = ProductService::active()->ordered()->get();

        // Format attribute values for frontend
        $attributeValues = $product->attributeValues->pluck('value', 'product_attribute_id');
        $selectedCompatibleModels = $product->compatibleModels->pluck('id');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'brands' => $brands,
            'categories' => $categories,
            'attributes' => $attributes,
            'compatible_models' => $compatible_models,
            'services' => $services,
            'attribute_values' => $attributeValues,
            'selected_compatible_models' => $selectedCompatibleModels,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'sku' => ['required', 'string', Rule::unique('products')->ignore($product->id)],
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'status' => 'required|in:active,inactive,draft',
            'attributes' => 'array',
            'compatible_models' => 'array',
            'services' => 'array',
            'new_images' => 'array|max:10',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'new_image_alts' => 'array',
            'new_image_alts.*' => 'nullable|string|max:255',
            'existing_images' => 'array',
            'existing_images.*.id' => 'required|exists:product_images,id',
            'existing_images.*.alt_text' => 'nullable|string|max:255',
            'existing_images.*.sort_order' => 'integer|min:0',
            'existing_images.*.is_primary' => 'boolean',
            'delete_images' => 'array',
            'delete_images.*' => 'exists:product_images,id',
        ]);

        DB::transaction(function () use ($request, $product) {
            $data = $request->except(['attributes', 'compatible_models', 'services', 'new_images', 'new_image_alts', 'existing_images', 'delete_images']);
            $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
            $data['in_stock'] = $data['stock_quantity'] > 0;

            $product->update($data);

            // Update attributes
            $product->attributeValues()->delete();
            if ($request->attributes) {
                foreach ($request->attributes as $attributeId => $value) {
                    if ($value) {
                        $product->attributeValues()->create([
                            'product_attribute_id' => $attributeId,
                            'value' => $value,
                        ]);
                    }
                }
            }

            // Update compatible models
            $product->compatibleModels()->sync($request->compatible_models ?: []);

            // Update services
            if ($request->services) {
                $syncData = [];
                foreach ($request->services as $service) {
                    $syncData[$service['service_id']] = [
                        'custom_price' => $service['custom_price'],
                        'is_mandatory' => $service['is_mandatory'] ?? false,
                        'is_free' => $service['is_free'] ?? false,
                    ];
                }
                $product->services()->sync($syncData);
            } else {
                $product->services()->sync([]);
            }

            // Handle image deletion
            if ($request->delete_images) {
                $imagesToDelete = ProductImage::whereIn('id', $request->delete_images)->get();
                foreach ($imagesToDelete as $image) {
                    $this->deleteImageFile($image->image_path);
                    $image->delete();
                }
            }

            // Update existing images
            if ($request->existing_images) {
                foreach ($request->existing_images as $imageData) {
                    ProductImage::where('id', $imageData['id'])->update([
                        'alt_text' => $imageData['alt_text'],
                        'sort_order' => $imageData['sort_order'],
                        'is_primary' => $imageData['is_primary'] ?? false,
                    ]);
                }
            }

            // Handle new images
            if ($request->hasFile('new_images')) {
                $maxSortOrder = $product->images()->max('sort_order') ?? 0;
                $this->handleImageUpload($product, $request->file('new_images'), $request->new_image_alts ?? [], null, $maxSortOrder + 1);
            }

            // Ensure at least one primary image exists
            $this->ensurePrimaryImage($product);
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->orderItems()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete product that has been ordered.');
        }

        // Delete all product images
        foreach ($product->images as $image) {
            $this->deleteImageFile($image->image_path);
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:activate,deactivate,delete,feature,unfeature',
        ]);

        $products = Product::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $products->update(['status' => 'active']);
                $message = 'Products activated successfully.';
                break;
            case 'deactivate':
                $products->update(['status' => 'inactive']);
                $message = 'Products deactivated successfully.';
                break;
            case 'feature':
                $products->update(['is_featured' => true]);
                $message = 'Products featured successfully.';
                break;
            case 'unfeature':
                $products->update(['is_featured' => false]);
                $message = 'Products unfeatured successfully.';
                break;
            case 'delete':
                // Delete images for all products being deleted
                $productsToDelete = $products->with('images')->get();
                foreach ($productsToDelete as $product) {
                    foreach ($product->images as $image) {
                        $this->deleteImageFile($image->image_path);
                    }
                }
                $products->delete();
                $message = 'Products deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    public function duplicate(Product $product): RedirectResponse
    {
        $newProduct = $product->replicate();
        $newProduct->name = $product->name . ' (Copy)';
        $newProduct->slug = Str::slug($newProduct->name);
        $newProduct->sku = $product->sku . '-copy';
        $newProduct->status = 'draft';
        $newProduct->save();

        // Copy attribute values
        foreach ($product->attributeValues as $attributeValue) {
            $newProduct->attributeValues()->create([
                'product_attribute_id' => $attributeValue->product_attribute_id,
                'value' => $attributeValue->value,
            ]);
        }

        // Copy compatible models
        $newProduct->compatibleModels()->sync($product->compatibleModels->pluck('id'));

        // Copy services
        $serviceData = [];
        foreach ($product->services as $service) {
            $serviceData[$service->id] = [
                'custom_price' => $service->pivot->custom_price,
                'is_mandatory' => $service->pivot->is_mandatory,
                'is_free' => $service->pivot->is_free,
            ];
        }
        $newProduct->services()->sync($serviceData);

        // Copy images
        foreach ($product->images as $image) {
            $originalPath = $image->image_path;
            $newPath = $this->duplicateImageFile($originalPath, $newProduct->id);

            if ($newPath) {
                $newProduct->images()->create([
                    'image_path' => $newPath,
                    'alt_text' => $image->alt_text,
                    'sort_order' => $image->sort_order,
                    'is_primary' => $image->is_primary,
                ]);
            }
        }

        return redirect()->route('admin.products.edit', $newProduct)
            ->with('success', 'Product duplicated successfully.');
    }

    public function manageServices(Product $product): Response
    {
        $product->load('services');
        $availableServices = ProductService::active()->ordered()->get();

        return Inertia::render('Admin/Products/Services', [
            'product' => $product,
            'available_services' => $availableServices,
            'assigned_services' => $product->services,
        ]);
    }

    public function updateServices(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'services' => 'array',
            'services.*.service_id' => 'required|exists:product_services,id',
            'services.*.custom_price' => 'nullable|numeric|min:0',
            'services.*.is_mandatory' => 'boolean',
            'services.*.is_free' => 'boolean',
        ]);

        $syncData = [];
        foreach ($request->services as $service) {
            $syncData[$service['service_id']] = [
                'custom_price' => $service['custom_price'],
                'is_mandatory' => $service['is_mandatory'] ?? false,
                'is_free' => $service['is_free'] ?? false,
            ];
        }

        $product->services()->sync($syncData);

        return redirect()->back()
            ->with('success', 'Product services updated successfully.');
    }

    // Image handling methods
    private function handleImageUpload(Product $product, array $images, array $alts = [], ?int $primaryIndex = 0, int $startSortOrder = 0): void
    {
        foreach ($images as $index => $image) {
            $filename = $this->generateImageFilename($image, $product->id);
            $path = $this->storeImage($image, $filename);

            if ($path) {
                $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $alts[$index] ?? $product->name,
                    'sort_order' => $startSortOrder + $index,
                    'is_primary' => $primaryIndex === $index,
                ]);
            }
        }
    }

    private function generateImageFilename($image, int $productId): string
    {
        $extension = $image->getClientOriginalExtension();
        return 'product_' . $productId . '_' . time() . '_' . uniqid() . '.' . $extension;
    }

    private function storeImage($image, string $filename): ?string
    {
        try {
            $path = 'products/' . date('Y/m');
            $fullPath = $path . '/' . $filename;

            // Store original
            Storage::disk('public')->putFileAs($path, $image, $filename);

            // Create thumbnail with GD
            $this->createThumbnailGD($image->getPathname(), $filename, $path);

            return $fullPath;
        } catch (\Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());
            return null;
        }
    }

    private function createThumbnailGD($sourcePath, $filename, $path)
    {
        $imageInfo = getimagesize($sourcePath);
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];

        // Calculate thumbnail size (300x300 max, maintain ratio)
        $thumbWidth = 300;
        $thumbHeight = 300;

        if ($width > $height) {
            $thumbHeight = ($height / $width) * 300;
        } else {
            $thumbWidth = ($width / $height) * 300;
        }

        // Create source image
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($sourcePath);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($sourcePath);
                break;
            case IMAGETYPE_WEBP:
                $source = imagecreatefromwebp($sourcePath);
                break;
            default:
                return; // Skip thumbnail for unsupported types
        }

        // Create thumbnail
        $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);

        // Preserve transparency for PNG
        if ($type == IMAGETYPE_PNG) {
            imagealphablending($thumb, false);
            imagesavealpha($thumb, true);
        }

        imagecopyresampled($thumb, $source, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

        // Save thumbnail
        $thumbnailPath = storage_path('app/public/' . $path . '/thumb_' . $filename);
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($thumb, $thumbnailPath, 90);
                break;
            case IMAGETYPE_PNG:
                imagepng($thumb, $thumbnailPath);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($thumb, $thumbnailPath, 90);
                break;
        }

        imagedestroy($source);
        imagedestroy($thumb);
    }

    private function deleteImageFile(string $imagePath): void
    {
        if (Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);

            // Also delete thumbnail
            $pathInfo = pathinfo($imagePath);
            $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
            if (Storage::disk('public')->exists($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }
        }
    }

    private function duplicateImageFile(string $originalPath, int $newProductId): ?string
    {
        if (!Storage::disk('public')->exists($originalPath)) {
            return null;
        }

        try {
            $pathInfo = pathinfo($originalPath);
            $newFilename = 'product_' . $newProductId . '_' . time() . '_' . uniqid() . '.' . $pathInfo['extension'];
            $newPath = 'products/' . date('Y/m') . '/' . $newFilename;

            Storage::disk('public')->copy($originalPath, $newPath);

            // Copy thumbnail if exists
            $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
            if (Storage::disk('public')->exists($thumbnailPath)) {
                $newThumbnailPath = 'products/' . date('Y/m') . '/thumb_' . $newFilename;
                Storage::disk('public')->copy($thumbnailPath, $newThumbnailPath);
            }

            return $newPath;
        } catch (\Exception $e) {
            \Log::error('Image duplication failed: ' . $e->getMessage());
            return null;
        }
    }

    private function ensurePrimaryImage(Product $product): void
    {
        $primaryImage = $product->images()->where('is_primary', true)->first();

        if (!$primaryImage) {
            $firstImage = $product->images()->orderBy('sort_order', 'asc')->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }
    }

    // Additional image management endpoints
    public function updateImageOrder(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:product_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->images as $imageData) {
            ProductImage::where('id', $imageData['id'])
                ->where('product_id', $product->id)
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Image order updated successfully.');
    }

    public function setPrimaryImage(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'image_id' => 'required|exists:product_images,id',
        ]);

        // Remove primary flag from all images
        $product->images()->update(['is_primary' => false]);

        // Set the selected image as primary
        ProductImage::where('id', $request->image_id)
            ->where('product_id', $product->id)
            ->update(['is_primary' => true]);

        return redirect()->back()->with('success', 'Primary image updated successfully.');
    }

    public function deleteImage(Product $product, ProductImage $image): RedirectResponse
    {
        if ($image->product_id !== $product->id) {
            return redirect()->back()->with('error', 'Image not found.');
        }

        $this->deleteImageFile($image->image_path);
        $image->delete();

        // Ensure we still have a primary image
        $this->ensurePrimaryImage($product);

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }
}
