<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome Discount',
                'description' => '10% discount for new customers',
                'type' => 'percentage',
                'value' => 10.00,
                'minimum_amount' => 500.00,
                'maximum_discount' => 200.00,
                'usage_limit' => 100,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(3),
            ],
            [
                'code' => 'SAVE50',
                'name' => 'Fixed Amount Discount',
                'description' => '£50 off on orders above £100',
                'type' => 'fixed_amount',
                'value' => 50.00,
                'minimum_amount' => 100.00,
                'maximum_discount' => null,
                'usage_limit' => 50,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonth(),
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }
    }
}
