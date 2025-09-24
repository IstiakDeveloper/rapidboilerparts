<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompatibleModel;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompatibleModelController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CompatibleModel::withCount('products');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('brand_name', 'like', "%{$request->search}%")
                    ->orWhere('model_name', 'like', "%{$request->search}%")
                    ->orWhere('model_code', 'like', "%{$request->search}%");
            });
        }

        if ($request->brand_name) {
            $query->byBrand($request->brand_name);
        }

        if ($request->is_active !== null) {
            $query->where('is_active', $request->is_active);
        }

        $models = $query->orderBy('brand_name')
            ->orderBy('model_name')
            ->paginate(20)
            ->withQueryString();

        $brands = CompatibleModel::distinct()->pluck('brand_name')->sort();

        return Inertia::render('Admin/CompatibleModels/Index', [
            'models' => $models,
            'brands' => $brands,
            'filters' => $request->only('search', 'brand_name', 'is_active'),
        ]);
    }

    public function create(): Response
    {
        $brands = CompatibleModel::distinct()->pluck('brand_name')->sort();

        return Inertia::render('Admin/CompatibleModels/Create', [
            'brands' => $brands,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'brand_name' => 'required|string|max:255',
            'model_name' => 'required|string|max:255',
            'model_code' => 'nullable|string|max:255',
            'year_from' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'year_to' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'is_active' => 'boolean',
        ]);

        CompatibleModel::create($request->all());

        return redirect()->route('admin.compatible-models.index')
            ->with('success', 'Compatible model created successfully.');
    }

    public function show(CompatibleModel $compatibleModel): Response
    {
        $compatibleModel->load('products');

        return Inertia::render('Admin/CompatibleModels/Show', [
            'model' => $compatibleModel,
        ]);
    }

    public function edit(CompatibleModel $compatibleModel): Response
    {
        $brands = CompatibleModel::distinct()->pluck('brand_name')->sort();

        return Inertia::render('Admin/CompatibleModels/Edit', [
            'model' => $compatibleModel,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, CompatibleModel $compatibleModel): RedirectResponse
    {
        $request->validate([
            'brand_name' => 'required|string|max:255',
            'model_name' => 'required|string|max:255',
            'model_code' => 'nullable|string|max:255',
            'year_from' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'year_to' => 'nullable|integer|min:1900|max:' . (date('Y') + 10),
            'is_active' => 'boolean',
        ]);

        $compatibleModel->update($request->all());

        return redirect()->route('admin.compatible-models.index')
            ->with('success', 'Compatible model updated successfully.');
    }

    public function destroy(CompatibleModel $compatibleModel): RedirectResponse
    {
        if ($compatibleModel->products()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete model with associated products.');
        }

        $compatibleModel->delete();

        return redirect()->route('admin.compatible-models.index')
            ->with('success', 'Compatible model deleted successfully.');
    }
}
