<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ContactInquiryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'subject' => fake()->sentence(4),
            'message' => fake()->paragraph(5),
            'status' => fake()->randomElement(['new', 'in_progress', 'resolved', 'closed']),
            'admin_notes' => fake()->boolean(30) ? fake()->paragraph(2) : null,
        ];
    }

    public function new(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'new',
            'admin_notes' => null,
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'resolved',
            'admin_notes' => fake()->paragraph(2),
        ]);
    }
}
