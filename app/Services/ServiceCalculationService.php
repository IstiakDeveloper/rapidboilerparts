<?php

namespace App\Services;

use App\Models\{Product, ProductService};

class ServiceCalculationService
{
    public function calculateServicesTotal(Product $product, array $selectedServices): array
    {
        $total = 0;
        $breakdown = [];

        foreach ($selectedServices as $serviceId) {
            $service = ProductService::find($serviceId);
            if (!$service) continue;

            $price = $service->getFinalPrice($product->id);
            $total += $price;

            $breakdown[] = [
                'service_id' => $serviceId,
                'name' => $service->name,
                'price' => $price,
                'is_free' => $price == 0,
            ];
        }

        return [
            'total' => $total,
            'breakdown' => $breakdown,
        ];
    }

    public function getAvailableServicesForProduct(Product $product): array
    {
        $services = $product->availableServices()->get();

        return $services->map(function ($service) use ($product) {
            return [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'type' => $service->type,
                'price' => $service->getFinalPrice($product->id),
                'is_mandatory' => $service->isMandatoryFor($product->id),
                'is_free' => $service->isFreeFor($product->id),
                'is_optional' => $service->is_optional && !$service->isMandatoryFor($product->id),
            ];
        })->toArray();
    }

    public function validateSelectedServices(Product $product, array $selectedServices): array
    {
        $errors = [];
        $mandatoryServices = $product->mandatoryServices()->pluck('id')->toArray();

        // Check if all mandatory services are selected
        foreach ($mandatoryServices as $mandatoryServiceId) {
            if (!in_array($mandatoryServiceId, $selectedServices)) {
                $service = ProductService::find($mandatoryServiceId);
                $errors[] = "Service '{$service->name}' is mandatory for this product.";
            }
        }

        // Check if all selected services are available for this product
        $availableServiceIds = $product->services()->pluck('product_services.id')->toArray();
        foreach ($selectedServices as $serviceId) {
            if (!in_array($serviceId, $availableServiceIds)) {
                $errors[] = "Selected service is not available for this product.";
            }
        }

        return $errors;
    }
}
