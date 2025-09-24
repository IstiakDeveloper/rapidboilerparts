<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Product, Category, Brand, ProductAttribute, CompatibleModel, ProductService};
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;
use DB;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with(['brand', 'category'])
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

        return Inertia::render('Admin/Products/Create', [
            'brands' => $brands,
            'categories' => $categories,
            'attributes' => $attributes,
            'compatible_models' => $compatible_models,
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
        ]);

        DB::transaction(function () use ($request) {
            $data = $request->except(['attributes', 'compatible_models']);
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
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product): Response
    {
        $product->load([
            'brand',
            'category',
            'images',
            'attributeValues.attribute',
            'compatibleModels',
            'reviews.user'
        ]);

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load(['attributeValues', 'compatibleModels']);

        $brands = Brand::active()->ordered()->get(['id', 'name']);
        $categories = Category::active()->ordered()->get(['id', 'name']);
        $attributes = ProductAttribute::ordered()->get();
        $compatible_models = CompatibleModel::active()->get();

        // Format attribute values for frontend
        $attributeValues = $product->attributeValues->pluck('value', 'product_attribute_id');
        $selectedCompatibleModels = $product->compatibleModels->pluck('id');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'brands' => $brands,
            'categories' => $categories,
            'attributes' => $attributes,
            'compatible_models' => $compatible_models,
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
        ]);

        DB::transaction(function () use ($request, $product) {
            $data = $request->except(['attributes', 'compatible_models']);
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
}
