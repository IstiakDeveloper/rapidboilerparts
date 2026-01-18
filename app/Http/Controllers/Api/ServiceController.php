<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductService;
use App\Models\ServiceProvider;
use App\Services\ServiceProviderAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ServiceController extends Controller
{
    protected $assignmentService;

    public function __construct(ServiceProviderAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Get available services for a product
     */
    public function getProductServices($product): JsonResponse
    {
        // Find product with its assigned services
        $productModel = \App\Models\Product::with(['category', 'services'])->findOrFail($product);

        // Get only the services assigned to this specific product
        $services = $productModel->services()
            ->where('product_services.is_active', true)
            ->orderBy('product_services.sort_order', 'asc')
            ->get()
            ->map(function ($service) use ($productModel) {
                // Get custom price from pivot table if available
                $customPrice = $service->pivot->custom_price ?? $service->price;
                $isFree = $service->pivot->is_free ?? false;

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'base_price' => $isFree ? 0 : (float) $customPrice,
                    'duration_minutes' => 60,
                    'is_active' => (bool) $service->is_active,
                    'is_mandatory' => (bool) ($service->pivot->is_mandatory ?? false),
                    'is_free' => (bool) $isFree,
                ];
            });

        \Log::info('Services fetched for product', [
            'product_id' => $productModel->id,
            'product_name' => $productModel->name,
            'services_count' => $services->count(),
            'service_ids' => $services->pluck('id')->toArray(),
        ]);

        return response()->json([
            'success' => true,
            'services' => $services,
            'product' => [
                'id' => $productModel->id,
                'name' => $productModel->name,
                'category' => $productModel->category->name ?? null,
            ]
        ]);
    }

    /**
     * Check service availability for location and date/time
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city_id' => 'required|exists:cities,id',
            'area_id' => 'required|exists:areas,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:product_services,id',
            'service_date' => 'nullable|date|after_or_equal:today',
            'service_time' => 'nullable|date_format:H:i',
        ]);

        $preferredDateTime = null;
        if ($request->service_date && $request->service_time) {
            $preferredDateTime = Carbon::parse($request->service_date . ' ' . $request->service_time);
        }

        $availableProviders = $this->assignmentService->getAvailableProviders(
            $validated['city_id'],
            $validated['area_id'],
            'installer',
            $validated['service_ids'],
            $preferredDateTime
        );

        return response()->json([
            'success' => true,
            'available' => $availableProviders->isNotEmpty(),
            'provider_count' => $availableProviders->count(),
            'providers' => $availableProviders->take(5)->map(function ($provider) {
                return [
                    'id' => $provider->id,
                    'name' => $provider->display_name,
                    'rating' => $provider->rating,
                    'total_jobs' => $provider->total_jobs_completed,
                    'service_charge' => $provider->service_charge,
                ];
            }),
        ]);
    }

    /**
     * Get available time slots for a specific date and provider
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => 'nullable|exists:service_providers,id',
            'city_id' => 'required|exists:cities,id',
            'area_id' => 'required|exists:areas,id',
            'service_date' => 'required|date|after_or_equal:today',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:product_services,id',
        ]);

        $date = Carbon::parse($validated['service_date']);

        // If specific provider requested
        if ($request->provider_id) {
            $provider = ServiceProvider::findOrFail($request->provider_id);
            $slots = $this->assignmentService->getAvailableTimeSlots($provider, $date);

            return response()->json([
                'success' => true,
                'provider' => [
                    'id' => $provider->id,
                    'name' => $provider->display_name,
                ],
                'slots' => $slots,
            ]);
        }

        // Otherwise get slots from available providers
        $providers = $this->assignmentService->getAvailableProviders(
            $validated['city_id'],
            $validated['area_id'],
            'installer',
            $validated['service_ids'] ?? []
        );

        $availableSlots = [];
        foreach ($providers->take(3) as $provider) {
            $slots = $this->assignmentService->getAvailableTimeSlots($provider, $date);
            if (!empty($slots)) {
                $availableSlots[] = [
                    'provider' => [
                        'id' => $provider->id,
                        'name' => $provider->display_name,
                        'rating' => $provider->rating,
                    ],
                    'slots' => $slots,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'available_providers' => $availableSlots,
        ]);
    }

    /**
     * Get service provider details
     */
    public function getProviderDetails(int $providerId): JsonResponse
    {
        $provider = ServiceProvider::with(['services', 'category', 'city', 'area'])
            ->findOrFail($providerId);

        return response()->json([
            'success' => true,
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->display_name,
                'business_name' => $provider->business_name,
                'description' => $provider->description,
                'rating' => $provider->rating,
                'total_reviews' => $provider->total_reviews,
                'total_jobs_completed' => $provider->total_jobs_completed,
                'service_charge' => $provider->service_charge,
                'location' => $provider->location,
                'category' => $provider->category->name,
                'working_days' => $provider->working_days,
                'avg_service_duration' => $provider->avg_service_duration,
                'services' => $provider->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'name' => $service->name,
                        'type' => $service->type,
                        'experience_level' => $service->pivot->experience_level,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Calculate total service cost
     */
    public function calculateServiceCost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:product_services,id',
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $totalCost = 0;
        $serviceDetails = [];

        foreach ($validated['service_ids'] as $serviceId) {
            $service = ProductService::findOrFail($serviceId);

            foreach ($validated['product_ids'] as $productId) {
                $price = $service->getFinalPrice($productId);
                $totalCost += $price;

                $serviceDetails[] = [
                    'service_id' => $serviceId,
                    'service_name' => $service->name,
                    'product_id' => $productId,
                    'price' => $price,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'total_cost' => $totalCost,
            'details' => $serviceDetails,
        ]);
    }
}
