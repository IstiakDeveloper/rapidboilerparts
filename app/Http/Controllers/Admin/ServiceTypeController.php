<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class ServiceTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $serviceTypes = ServiceType::active()
            ->ordered()
            ->get();

        return response()->json($serviceTypes);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:service_types',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data = $request->all();
        $data['slug'] = $request->input('slug') ?: Str::slug($data['name']);
        $data['color'] = $request->input('color') ?: 'bg-gray-100 text-gray-800';
        $data['is_active'] = true;

        $serviceType = ServiceType::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Service type created successfully',
            'data' => $serviceType
        ], 201);
    }

    public function update(Request $request, ServiceType $serviceType): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('service_types')->ignore($serviceType->id)],
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $serviceType->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Service type updated successfully',
            'data' => $serviceType
        ]);
    }

    public function destroy(ServiceType $serviceType): JsonResponse
    {
        if ($serviceType->productServices()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete service type that is assigned to product services'
            ], 422);
        }

        $serviceType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service type deleted successfully'
        ]);
    }
}
