<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BrandFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(3),
            'logo' => 'brands/' . fake()->image('public/storage/brands', 200, 200, null, false),
            'website' => fake()->url(),
            'is_active' => fake()->boolean(95), // 95% chance of being active
            'sort_order' => fake()->numberBetween(1, 50),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
