<?php

namespace Database\Factories;

use App\Models\ServiceProviderCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceProviderCategoryFactory extends Factory
{
    protected $model = ServiceProviderCategory::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Installer',
            'Delivery',
            'Support',
            'Maintenance',
            'Emergency Service',
            'Repair Specialist',
            'Gas Engineer'
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
