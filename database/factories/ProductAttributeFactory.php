<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductAttributeFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'type' => fake()->randomElement(['text', 'number', 'select', 'multiselect', 'boolean']),
            'is_required' => fake()->boolean(30), // 30% chance of being required
            'is_filterable' => fake()->boolean(50), // 50% chance of being filterable
            'sort_order' => fake()->numberBetween(1, 20),
        ];
    }

    public function required(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_required' => true,
        ]);
    }

    public function filterable(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_filterable' => true,
        ]);
    }
}
