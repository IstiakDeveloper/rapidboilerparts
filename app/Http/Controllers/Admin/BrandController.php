<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Brand::withCount('products');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->status !== null) {
            $query->where('is_active', $request->status);
        }

        $brands = $query->orderBy('sort_order')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Brands/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:brands',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        Brand::create($data);

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand created successfully.');
    }

    public function show(Brand $brand): Response
    {
        $brand->load('products');

        return Inertia::render('Admin/Brands/Show', [
            'brand' => $brand,
        ]);
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('Admin/Brands/Edit', [
            'brand' => $brand,
        ]);
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('brands')->ignore($brand->id)],
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $brand->update($data);

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete brand with products.');
        }

        $brand->delete();

        return redirect()->route('admin.brands.index')
            ->with('success', 'Brand deleted successfully.');
    }
}
