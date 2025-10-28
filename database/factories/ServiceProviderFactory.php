<?php

namespace Database\Factories;

use App\Models\ServiceProvider;
use App\Models\User;
use App\Models\ServiceProviderCategory;
use App\Models\City;
use App\Models\Area;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceProviderFactory extends Factory
{
    protected $model = ServiceProvider::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => ServiceProviderCategory::factory(),
            'city_id' => City::factory(),
            'area_id' => Area::factory(),
            'business_name' => fake()->optional()->company(),
            'description' => fake()->optional()->paragraph(),
            'service_charge' => fake()->randomFloat(2, 20, 200),
            'contact_number' => fake()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'availability_status' => fake()->randomElement(['available', 'busy', 'offline']),
            'max_daily_orders' => fake()->numberBetween(3, 10),
            'current_daily_orders' => 0,
            'rating' => fake()->randomFloat(2, 3, 5),
            'total_jobs_completed' => fake()->numberBetween(0, 500),
            'total_reviews' => fake()->numberBetween(0, 100),
            'is_active' => true,
            'is_verified' => fake()->boolean(80),
            'verified_at' => fake()->optional(0.8)->dateTimeBetween('-1 year', 'now'),
            'last_active_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'availability_status' => ServiceProvider::STATUS_AVAILABLE,
            'is_active' => true,
            'is_verified' => true,
            'current_daily_orders' => 0,
        ]);
    }
}
