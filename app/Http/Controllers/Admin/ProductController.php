<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ProductService;
use App\Models\ProductAttribute;
use App\Models\CompatibleModel;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'category', 'images' => function($q) {
            $q->where('is_primary', true);
        }]);

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Filter by brand
        if ($request->filled('brand_id')) {
            $query->byBrand($request->brand_id);
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by stock status
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->inStock();
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('in_stock', false);
            } elseif ($request->stock_status === 'low_stock') {
                $query->whereRaw('stock_quantity <= low_stock_threshold');
            }
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        if (in_array($sortField, ['name', 'price', 'stock_quantity', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $products = $query->paginate(15)->withQueryString();

        // Get filter options
        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'brand_id', 'category_id', 'status', 'stock_status', 'sort', 'direction']),
            'brands' => $brands,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new product
     */
    public function create(): Response
    {
        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $services = ProductService::active()->ordered()->get();
        $attributes = ProductAttribute::ordered()->get();
        $compatibleModels = CompatibleModel::active()->get();

        return Inertia::render('Admin/Products/Create', [
            'brands' => $brands,
            'categories' => $categories,
            'services' => $services,
            'attributes' => $attributes,
            'compatibleModels' => $compatibleModels,
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:products,sku',
            'barcode' => 'nullable|string|unique:products,barcode',
            'manufacturer_part_number' => 'nullable|string|max:255',
            'gc_number' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'manage_stock' => 'boolean',
            'low_stock_threshold' => 'required|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,draft',
            'is_featured' => 'boolean',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            // Services validation - UPDATED
            'services' => 'nullable|array',
            'services.*.service_id' => 'required|exists:product_services,id',
            'services.*.custom_price' => 'nullable|numeric|min:0',
            'services.*.is_mandatory' => 'boolean',
            'services.*.is_free' => 'boolean',
            'services.*.conditions' => 'nullable|array',
            'attributes' => 'nullable|array',
            'attributes.*.attribute_id' => 'required|exists:product_attributes,id',
            'attributes.*.value' => 'required|string',
            'compatible_models' => 'nullable|array',
            'compatible_models.*' => 'exists:compatible_models,id',
        ]);

        DB::beginTransaction();

        try {
            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
                // Ensure uniqueness
                $originalSlug = $validated['slug'];
                $counter = 1;
                while (Product::where('slug', $validated['slug'])->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $counter++;
                }
            }

            // Set in_stock based on stock_quantity and manage_stock
            $validated['in_stock'] = $validated['manage_stock']
                ? $validated['stock_quantity'] > 0
                : true;

            // Create product
            $product = Product::create($validated);

            // Generate barcode after product creation
            $barcode = $product->generateBarcode();

            // Handle images
            if ($request->hasFile('images')) {
                $this->handleImageUpload($product, $request->file('images'));
            }

            // Handle services - UPDATED
            if (!empty($validated['services'])) {
                $this->attachServices($product, $validated['services']);
            }

            // Handle attributes
            if (!empty($validated['attributes'])) {
                $this->attachAttributes($product, $validated['attributes']);
            }

            // Handle compatible models
            if (!empty($validated['compatible_models'])) {
                $product->compatibleModels()->attach($validated['compatible_models']);
            }

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product created successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified product
     */
    public function show(Product $product): Response
    {
        $product->load([
            'brand',
            'category',
            'images' => function($q) { $q->ordered(); },
            'attributeValues.attribute',
            'compatibleModels',
            'services' => function($q) { $q->active()->ordered(); }, // UPDATED - with pivot data
            'reviews.user'
        ]);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified product
     */
    public function edit(Product $product): Response
    {
        $product->load([
            'brand',
            'category',
            'images' => function($q) { $q->ordered(); },
            'attributeValues.attribute',
            'compatibleModels',
            'services' => function($q) { $q->active()->ordered(); } // UPDATED - load with pivot data
        ]);

        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $services = ProductService::active()->ordered()->get();
        $attributes = ProductAttribute::ordered()->get();
        $compatibleModels = CompatibleModel::active()->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'brands' => $brands,
            'categories' => $categories,
            'services' => $services,
            'attributes' => $attributes,
            'compatibleModels' => $compatibleModels,
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', Rule::unique('products')->ignore($product->id)],
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sku' => ['required', 'string', Rule::unique('products')->ignore($product->id)],
            'barcode' => ['nullable', 'string', Rule::unique('products')->ignore($product->id)],
            'manufacturer_part_number' => 'nullable|string|max:255',
            'gc_number' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lt:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'manage_stock' => 'boolean',
            'low_stock_threshold' => 'required|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive,draft',
            'is_featured' => 'boolean',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'existing_images' => 'nullable|array',
            'existing_images.*' => 'exists:product_images,id',
            // Services validation - UPDATED
            'services' => 'nullable|array',
            'services.*.service_id' => 'required|exists:product_services,id',
            'services.*.custom_price' => 'nullable|numeric|min:0',
            'services.*.is_mandatory' => 'boolean',
            'services.*.is_free' => 'boolean',
            'services.*.conditions' => 'nullable|array',
            'attributes' => 'nullable|array',
            'attributes.*.attribute_id' => 'required|exists:product_attributes,id',
            'attributes.*.value' => 'required|string',
            'compatible_models' => 'nullable|array',
            'compatible_models.*' => 'exists:compatible_models,id',
        ]);

        DB::beginTransaction();

        try {
            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
                // Ensure uniqueness
                $originalSlug = $validated['slug'];
                $counter = 1;
                while (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $counter++;
                }
            }

            // Set in_stock based on stock_quantity and manage_stock
            $validated['in_stock'] = $validated['manage_stock']
                ? $validated['stock_quantity'] > 0
                : true;

            // Update product
            $product->update($validated);

            // Handle image deletion and upload
            $this->handleImageUpdate($product, $request);

            // Handle services update - UPDATED
            $this->updateServices($product, $validated['services'] ?? []);

            // Handle attributes update
            $this->updateAttributes($product, $validated['attributes'] ?? []);

            // Handle compatible models update
            $product->compatibleModels()->sync($validated['compatible_models'] ?? []);

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product updated successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update product: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy(Product $product): RedirectResponse
    {
        DB::beginTransaction();

        try {
            // Delete all related images from storage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }

            // Delete the product (cascade will handle related records including services)
            $product->delete();

            DB::commit();

            return redirect()->route('admin.products.index')
                ->with('success', 'Product deleted successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to delete product: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk actions for products
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate,feature,unfeature',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $productIds = $request->product_ids;
        $action = $request->action;

        DB::beginTransaction();

        try {
            switch ($action) {
                case 'delete':
                    $products = Product::whereIn('id', $productIds)->get();
                    foreach ($products as $product) {
                        // Delete images from storage
                        foreach ($product->images as $image) {
                            Storage::disk('public')->delete($image->image_path);
                        }
                        $product->delete();
                    }
                    $message = 'Products deleted successfully.';
                    break;

                case 'activate':
                    Product::whereIn('id', $productIds)->update(['status' => 'active']);
                    $message = 'Products activated successfully.';
                    break;

                case 'deactivate':
                    Product::whereIn('id', $productIds)->update(['status' => 'inactive']);
                    $message = 'Products deactivated successfully.';
                    break;

                case 'feature':
                    Product::whereIn('id', $productIds)->update(['is_featured' => true]);
                    $message = 'Products featured successfully.';
                    break;

                case 'unfeature':
                    Product::whereIn('id', $productIds)->update(['is_featured' => false]);
                    $message = 'Products unfeatured successfully.';
                    break;
            }

            DB::commit();

            return back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Bulk action failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Update stock for a product
     */
    public function updateStock(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->update([
            'stock_quantity' => $request->stock_quantity,
            'in_stock' => $product->manage_stock ? $request->stock_quantity > 0 : true,
        ]);

        return back()->with('success', 'Stock updated successfully.');
    }

    /**
     * Get products for select dropdown (API endpoint)
     */
    public function getProducts(Request $request)
    {
        $query = Product::active()->with(['brand', 'category']);

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $products = $query->limit(50)->get(['id', 'name', 'sku', 'price', 'brand_id', 'category_id']);

        return response()->json($products);
    }

    /**
     * Export products to CSV
     */
    public function export(Request $request)
    {
        $query = Product::with(['brand', 'category', 'services']);

        // Apply same filters as index
        if ($request->filled('search')) {
            $query->search($request->search);
        }
        if ($request->filled('brand_id')) {
            $query->byBrand($request->brand_id);
        }
        if ($request->filled('category_id')) {
            $query->byCategory($request->category_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $products = $query->get();

        $csvData = [];
        $csvData[] = [
            'ID', 'Name', 'SKU', 'Brand', 'Category', 'Price', 'Sale Price',
            'Stock', 'Status', 'Featured', 'Services Count', 'Created At'
        ];

        foreach ($products as $product) {
            $csvData[] = [
                $product->id,
                $product->name,
                $product->sku,
                $product->brand->name,
                $product->category->name,
                $product->price,
                $product->sale_price,
                $product->stock_quantity,
                $product->status,
                $product->is_featured ? 'Yes' : 'No',
                $product->services->count(),
                $product->created_at->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'products-' . date('Y-m-d-H-i-s') . '.csv';

        $handle = fopen('php://temp', 'w+');
        foreach ($csvData as $row) {
            fputcsv($handle, $row);
        }
        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Handle image upload for product
     */
    private function handleImageUpload(Product $product, array $images): void
    {
        foreach ($images as $index => $image) {
            $path = $image->store('products', 'public');

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'alt_text' => $product->name . ' - Image ' . ($index + 1),
                'sort_order' => $index,
                'is_primary' => $index === 0, // First image is primary
            ]);
        }
    }

    /**
     * Handle image update for product
     */
    private function handleImageUpdate(Product $product, Request $request): void
    {
        // Get existing images that should be kept
        $keepImageIds = $request->input('existing_images', []);

        // Delete images that are not in the keep list
        $imagesToDelete = $product->images()->whereNotIn('id', $keepImageIds)->get();
        foreach ($imagesToDelete as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        // Add new images
        if ($request->hasFile('images')) {
            $existingCount = $product->images()->count();
            $this->handleImageUpload($product, $request->file('images'));

            // If no existing images, make first new image primary
            if ($existingCount === 0) {
                $product->images()->first()?->update(['is_primary' => true]);
            }
        }
    }

    /**
     * Attach services to product - UPDATED
     */
    private function attachServices(Product $product, array $services): void
    {
        $serviceData = [];
        foreach ($services as $service) {
            $serviceData[$service['service_id']] = [
                'custom_price' => $service['custom_price'] ?? null,
                'is_mandatory' => $service['is_mandatory'] ?? false,
                'is_free' => $service['is_free'] ?? false,
                'conditions' => !empty($service['conditions']) ? json_encode($service['conditions']) : null,
            ];
        }
        $product->services()->attach($serviceData);
    }

    /**
     * Update services for product - UPDATED
     */
    private function updateServices(Product $product, array $services): void
    {
        // Detach all existing services
        $product->services()->detach();

        // Attach new services
        if (!empty($services)) {
            $this->attachServices($product, $services);
        }
    }

    /**
     * Attach attributes to product
     */
    private function attachAttributes(Product $product, array $attributes): void
    {
        foreach ($attributes as $attribute) {
            $product->attributeValues()->create([
                'product_attribute_id' => $attribute['attribute_id'],
                'value' => $attribute['value'],
            ]);
        }
    }

    /**
     * Update attributes for product
     */
    private function updateAttributes(Product $product, array $attributes): void
    {
        // Delete existing attribute values
        $product->attributeValues()->delete();

        // Create new attribute values
        if (!empty($attributes)) {
            $this->attachAttributes($product, $attributes);
        }
    }

    /**
     * Delete product image
     */
    public function deleteImage(Product $product, ProductImage $image): RedirectResponse
    {
        if ($image->product_id !== $product->id) {
            return back()->withErrors(['error' => 'Image does not belong to this product.']);
        }

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        // If this was the primary image, make another image primary
        if ($image->is_primary) {
            $product->images()->first()?->update(['is_primary' => true]);
        }

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Set primary image
     */
    public function setPrimaryImage(Product $product, ProductImage $image): RedirectResponse
    {
        if ($image->product_id !== $product->id) {
            return back()->withErrors(['error' => 'Image does not belong to this product.']);
        }

        // Remove primary status from all images
        $product->images()->update(['is_primary' => false]);

        // Set this image as primary
        $image->update(['is_primary' => true]);

        return back()->with('success', 'Primary image updated successfully.');
    }

    /**
     * Duplicate product
     */
    public function duplicate(Product $product): RedirectResponse
    {
        DB::beginTransaction();

        try {
            $newProduct = $product->replicate();
            $newProduct->name = $product->name . ' (Copy)';
            $newProduct->sku = $product->sku . '-copy-' . time();
            $newProduct->slug = Str::slug($newProduct->name) . '-' . time();
            $newProduct->status = 'draft';
            $newProduct->save();

            // Copy services - UPDATED
            $services = $product->services()->get();
            foreach ($services as $service) {
                $newProduct->services()->attach($service->id, [
                    'custom_price' => $service->pivot->custom_price,
                    'is_mandatory' => $service->pivot->is_mandatory,
                    'is_free' => $service->pivot->is_free,
                    'conditions' => $service->pivot->conditions,
                ]);
            }

            // Copy attributes
            foreach ($product->attributeValues as $attributeValue) {
                $newProduct->attributeValues()->create([
                    'product_attribute_id' => $attributeValue->product_attribute_id,
                    'value' => $attributeValue->value,
                ]);
            }

            // Copy compatible models
            $newProduct->compatibleModels()->attach($product->compatibleModels->pluck('id'));

            DB::commit();

            return redirect()->route('admin.products.edit', $newProduct)
                ->with('success', 'Product duplicated successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to duplicate product: ' . $e->getMessage()]);
        }
    }

    /**
     * Manage services for a specific product - NEW METHOD
     */
    public function manageServices(Product $product): Response
    {
        $product->load([
            'services' => function($q) {
                $q->active()->ordered()->withPivot(['custom_price', 'is_mandatory', 'is_free', 'conditions']);
            }
        ]);

        $allServices = ProductService::active()->ordered()->get();

        return Inertia::render('Admin/Products/ManageServices', [
            'product' => $product,
            'allServices' => $allServices,
        ]);
    }

    /**
     * Update services for a specific product - NEW METHOD
     */
    public function updateProductServices(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'services' => 'nullable|array',
            'services.*.service_id' => 'required|exists:product_services,id',
            'services.*.custom_price' => 'nullable|numeric|min:0',
            'services.*.is_mandatory' => 'boolean',
            'services.*.is_free' => 'boolean',
            'services.*.conditions' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $this->updateServices($product, $request->services ?? []);

            DB::commit();

            return back()->with('success', 'Product services updated successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update services: ' . $e->getMessage()]);
        }
    }

    /**
     * Get available services for a product - API endpoint - NEW METHOD
     */
    public function getAvailableServices(Product $product)
    {
        $assignedServiceIds = $product->services()->pluck('product_services.id');

        $availableServices = ProductService::active()
            ->whereNotIn('id', $assignedServiceIds)
            ->ordered()
            ->get(['id', 'name', 'type', 'price', 'is_optional']);

        return response()->json($availableServices);
    }

    /**
     * Quick assign service to product - API endpoint - NEW METHOD
     */
    public function quickAssignService(Request $request, Product $product): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'service_id' => 'required|exists:product_services,id',
            'is_mandatory' => 'boolean',
            'is_free' => 'boolean',
            'custom_price' => 'nullable|numeric|min:0',
        ]);

        try {
            // Check if service already assigned
            if ($product->services()->where('product_service_id', $request->service_id)->exists()) {
                return response()->json(['error' => 'Service already assigned to this product'], 422);
            }

            $product->services()->attach($request->service_id, [
                'custom_price' => $request->custom_price,
                'is_mandatory' => $request->is_mandatory ?? false,
                'is_free' => $request->is_free ?? false,
                'conditions' => null,
            ]);

            return response()->json(['success' => 'Service assigned successfully']);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to assign service'], 500);
        }
    }

    /**
     * Remove service from product - NEW METHOD
     */
    public function removeService(Product $product, ProductService $service): RedirectResponse
    {
        try {
            $product->services()->detach($service->id);

            return back()->with('success', 'Service removed from product successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove service: ' . $e->getMessage()]);
        }
    }
}
