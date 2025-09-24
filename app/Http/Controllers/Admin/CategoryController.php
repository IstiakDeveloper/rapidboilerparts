<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Str;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Category::with('parent')
            ->withCount('products');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->status !== null) {
            $query->where('is_active', $request->status);
        }

        $categories = $query->orderBy('sort_order')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create(): Response
    {
        $parent_categories = Category::whereNull('parent_id')
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('Admin/Categories/Create', [
            'parent_categories' => $parent_categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        Category::create($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function show(Category $category): Response
    {
        $category->load(['parent', 'children', 'products']);

        return Inertia::render('Admin/Categories/Show', [
            'category' => $category,
        ]);
    }

    public function edit(Category $category): Response
    {
        $parent_categories = Category::whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parent_categories' => $parent_categories,
        ]);
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $category->update($data);

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete category with products.');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $categories = Category::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $categories->update(['is_active' => true]);
                $message = 'Categories activated successfully.';
                break;
            case 'deactivate':
                $categories->update(['is_active' => false]);
                $message = 'Categories deactivated successfully.';
                break;
            case 'delete':
                $categories->delete();
                $message = 'Categories deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}
