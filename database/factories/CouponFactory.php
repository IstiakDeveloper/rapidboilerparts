<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class CouponFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['percentage', 'fixed_amount']);
        $value = $type === 'percentage' ? fake()->numberBetween(5, 50) : fake()->numberBetween(10, 200);

        return [
            'code' => strtoupper(fake()->unique()->bothify('???###')),
            'name' => fake()->words(2, true) . ' Discount',
            'description' => fake()->sentence(),
            'type' => $type,
            'value' => $value,
            'minimum_amount' => fake()->randomFloat(2, 100, 1000),
            'maximum_discount' => $type === 'percentage' ? fake()->randomFloat(2, 50, 500) : null,
            'usage_limit' => fake()->boolean(70) ? fake()->numberBetween(10, 100) : null,
            'used_count' => 0,
            'is_active' => fake()->boolean(80), // 80% chance of being active
            'starts_at' => Carbon::now()->subDays(fake()->numberBetween(0, 30)),
            'expires_at' => Carbon::now()->addDays(fake()->numberBetween(1, 90)),
        ];
    }

    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn(array $attributes) => [
            'starts_at' => Carbon::now()->subMonth(),
            'expires_at' => Carbon::now()->subWeek(),
        ]);
    }

    public function percentage(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'percentage',
            'value' => fake()->numberBetween(5, 50),
        ]);
    }

    public function fixedAmount(): static
    {
        return $this->state(fn(array $attributes) => [
            'type' => 'fixed_amount',
            'value' => fake()->numberBetween(10, 200),
            'maximum_discount' => null,
        ]);
    }
}
