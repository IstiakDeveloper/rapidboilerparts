<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{ProductService, Product};
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;

class ProductServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ProductService::withCount('products');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->type) {
            $query->byType($request->type);
        }

        if ($request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        $services = $query->ordered()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ProductServices/Index', [
            'services' => $services,
            'filters' => $request->only('search', 'type', 'is_active'),
            'service_types' => ['setup', 'delivery', 'installation', 'maintenance', 'other'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ProductServices/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_services',
            'description' => 'nullable|string',
            'type' => 'required|in:setup,delivery,installation,maintenance,other',
            'price' => 'required|numeric|min:0',
            'is_optional' => 'boolean',
            'is_free' => 'boolean',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        ProductService::create($data);

        return redirect()->route('admin.product-services.index')
            ->with('success', 'Product service created successfully.');
    }

    public function show(ProductService $productService): Response
    {
        $productService->load('products');

        return Inertia::render('Admin/ProductServices/Show', [
            'service' => $productService,
        ]);
    }

    public function edit(ProductService $productService): Response
    {
        return Inertia::render('Admin/ProductServices/Edit', [
            'service' => $productService,
        ]);
    }

    public function update(Request $request, ProductService $productService): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('product_services')->ignore($productService->id)],
            'description' => 'nullable|string',
            'type' => 'required|in:setup,delivery,installation,maintenance,other',
            'price' => 'required|numeric|min:0',
            'is_optional' => 'boolean',
            'is_free' => 'boolean',
            'conditions' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $productService->update($data);

        return redirect()->route('admin.product-services.index')
            ->with('success', 'Product service updated successfully.');
    }

    public function destroy(ProductService $productService): RedirectResponse
    {
        if ($productService->products()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete service assigned to products.');
        }

        $productService->delete();

        return redirect()->route('admin.product-services.index')
            ->with('success', 'Product service deleted successfully.');
    }

    // Assign services to products
    public function assignToProduct(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'service_id' => 'required|exists:product_services,id',
            'custom_price' => 'nullable|numeric|min:0',
            'is_mandatory' => 'boolean',
            'is_free' => 'boolean',
            'conditions' => 'nullable|array',
        ]);

        $product = Product::findOrFail($request->product_id);
        $service = ProductService::findOrFail($request->service_id);

        $product->services()->syncWithoutDetaching([
            $service->id => [
                'custom_price' => $request->custom_price,
                'is_mandatory' => $request->is_mandatory ?? false,
                'is_free' => $request->is_free ?? false,
                'conditions' => $request->conditions,
            ]
        ]);

        return redirect()->back()
            ->with('success', 'Service assigned to product successfully.');
    }

    public function removeFromProduct(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'service_id' => 'required|exists:product_services,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $product->services()->detach($request->service_id);

        return redirect()->back()
            ->with('success', 'Service removed from product successfully.');
    }
}
