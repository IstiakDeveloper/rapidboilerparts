<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class OrderFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 2000);
        $taxAmount = $subtotal * 0.15; // 15% tax
        $shippingAmount = fake()->randomElement([0, 50, 100, 150]);
        $discountAmount = fake()->randomFloat(2, 0, $subtotal * 0.2);
        $totalAmount = $subtotal + $taxAmount + $shippingAmount - $discountAmount;

        return [
            'order_number' => 'ORD-' . strtoupper(fake()->unique()->bothify('########')),
            'user_id' => User::factory(),
            'status' => fake()->randomElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed']),
            'payment_method' => fake()->randomElement(['cash_on_delivery', 'bank_transfer', 'bkash', 'nagad']),
            'payment_transaction_id' => fake()->boolean(70) ? fake()->uuid() : null,
            'billing_address' => [
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'address_line_1' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => 'BD',
                'phone' => fake()->phoneNumber(),
            ],
            'shipping_address' => [
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'address_line_1' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => 'BD',
                'phone' => fake()->phoneNumber(),
            ],
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'shipped_at' => fake()->boolean(50) ? fake()->dateTimeBetween('-30 days', 'now') : null,
            'delivered_at' => fake()->boolean(30) ? fake()->dateTimeBetween('-15 days', 'now') : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'processing',
            'payment_status' => 'paid',
        ]);
    }

    public function shipped(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'shipped',
            'payment_status' => 'paid',
            'shipped_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function delivered(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'delivered',
            'payment_status' => 'paid',
            'shipped_at' => fake()->dateTimeBetween('-15 days', '-5 days'),
            'delivered_at' => fake()->dateTimeBetween('-5 days', 'now'),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'cancelled',
            'payment_status' => fake()->randomElement(['pending', 'refunded']),
        ]);
    }
}
