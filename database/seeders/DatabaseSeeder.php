<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Settings first
            SettingSeeder::class,

            // Users
            UserSeeder::class,

            // Location data
            CitySeeder::class,
            AreaSeeder::class,

            // Service providers
            ServiceProviderCategorySeeder::class,

            // Product related
            BrandSeeder::class,
            CategorySeeder::class,
            CompatibleModelSeeder::class,

            // Products with images
            ProductSeeder::class,

            // Coupons
            CouponSeeder::class,
        ]);
    }
}
