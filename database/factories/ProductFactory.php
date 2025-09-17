<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Brand;
use App\Models\Category;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(3, true) . ' ' . fake()->randomElement(['PCB', 'Pump', 'Valve', 'Sensor', 'Switch', 'Fan', 'Heat Exchanger']);
        $price = fake()->randomFloat(2, 20, 500);
        $salePrice = fake()->boolean(30) ? $price * 0.9 : null; // 30% chance of sale price

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name . '-' . fake()->unique()->numberBetween(1000, 9999)),
            'short_description' => fake()->sentence(8),
            'description' => fake()->paragraphs(3, true),
            'sku' => strtoupper(fake()->unique()->bothify('??-###-???-###')),
            'manufacturer_part_number' => fake()->unique()->numerify('########'),
            'gc_number' => 'GC-' . fake()->numerify('##-###-###'),
            'price' => $price,
            'sale_price' => $salePrice,
            'cost_price' => $price * 0.7, // 70% of selling price
            'stock_quantity' => fake()->numberBetween(0, 100),
            'manage_stock' => true,
            'in_stock' => fake()->boolean(85), // 85% chance of being in stock
            'low_stock_threshold' => fake()->numberBetween(3, 10),
            'meta_title' => ucwords($name),
            'meta_description' => fake()->sentence(12),
            'status' => fake()->randomElement(['active', 'inactive', 'draft']),
            'is_featured' => fake()->boolean(20), // 20% chance of being featured
            'brand_id' => Brand::factory(),
            'category_id' => Category::factory(),
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'length' => fake()->randomFloat(2, 5, 50),
            'width' => fake()->randomFloat(2, 5, 50),
            'height' => fake()->randomFloat(2, 2, 20),
        ];
    }

    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn(array $attributes) => [
            'stock_quantity' => 0,
            'in_stock' => false,
        ]);
    }

    public function onSale(): static
    {
        return $this->state(function (array $attributes) {
            $price = $attributes['price'] ?? 100;
            return [
                'sale_price' => $price * 0.8, // 20% discount
            ];
        });
    }
}
