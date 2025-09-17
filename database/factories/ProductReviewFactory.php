<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;
use App\Models\User;

class ProductReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->sentence(4),
            'comment' => fake()->paragraph(3),
            'is_approved' => fake()->boolean(80), // 80% chance of being approved
        ];
    }

    public function approved(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_approved' => true,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_approved' => false,
        ]);
    }

    public function fiveStars(): static
    {
        return $this->state(fn(array $attributes) => [
            'rating' => 5,
        ]);
    }

    public function oneStar(): static
    {
        return $this->state(fn(array $attributes) => [
            'rating' => 1,
        ]);
    }
}
