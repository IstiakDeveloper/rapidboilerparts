<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;

class ProductImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'image_path' => 'products/' . fake()->image('public/storage/products', 640, 480, null, false),
            'alt_text' => fake()->sentence(3),
            'sort_order' => fake()->numberBetween(1, 10),
            'is_primary' => false,
        ];
    }

    public function primary(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_primary' => true,
            'sort_order' => 1,
        ]);
    }
}
