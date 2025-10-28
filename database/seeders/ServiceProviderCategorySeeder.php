<?php

namespace Database\Seeders;

use App\Models\ServiceProviderCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceProviderCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Installer',
                'slug' => 'installer',
                'description' => 'Installation service for boiler parts and equipment',
                'sort_order' => 1,
            ],
            [
                'name' => 'Delivery',
                'slug' => 'delivery',
                'description' => 'Delivery service for products',
                'sort_order' => 2,
            ],
            [
                'name' => 'Support',
                'slug' => 'support',
                'description' => 'Technical support and maintenance service',
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $category) {
            ServiceProviderCategory::create($category);
        }
    }
}
