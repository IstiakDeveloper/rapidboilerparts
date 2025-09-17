<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CompatibleModelFactory extends Factory
{
    public function definition(): array
    {
        $brands = ['Worcester Bosch', 'Baxi', 'Ideal', 'Vaillant', 'Vokera', 'Glow-worm', 'Potterton', 'Alpha'];
        $brand = fake()->randomElement($brands);

        return [
            'brand_name' => $brand,
            'model_name' => fake()->bothify('Model ?? ##'),
            'model_code' => fake()->bothify('??###-###'),
            'year_from' => fake()->numberBetween(2000, 2020),
            'year_to' => fake()->numberBetween(2021, 2025),
            'is_active' => fake()->boolean(90), // 90% chance of being active
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }
}
