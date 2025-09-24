<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;

class ProductAttributeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ProductAttribute::withCount('values');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $attributes = $query->ordered()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/ProductAttributes/Index', [
            'attributes' => $attributes,
            'filters' => $request->only('search', 'type'),
            'attribute_types' => ['text', 'number', 'select', 'multiselect', 'boolean'],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/ProductAttributes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:product_attributes',
            'type' => 'required|in:text,number,select,multiselect,boolean',
            'is_required' => 'boolean',
            'is_filterable' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        ProductAttribute::create($data);

        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Product attribute created successfully.');
    }

    public function edit(ProductAttribute $productAttribute): Response
    {
        return Inertia::render('Admin/ProductAttributes/Edit', [
            'attribute' => $productAttribute,
        ]);
    }

    public function update(Request $request, ProductAttribute $productAttribute): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('product_attributes')->ignore($productAttribute->id)],
            'type' => 'required|in:text,number,select,multiselect,boolean',
            'is_required' => 'boolean',
            'is_filterable' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $productAttribute->update($data);

        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Product attribute updated successfully.');
    }

    public function destroy(ProductAttribute $productAttribute): RedirectResponse
    {
        $productAttribute->delete();

        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Product attribute deleted successfully.');
    }
}
