<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;

class ServiceTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Setup Service',
                'slug' => 'setup',
                'description' => 'Initial configuration and setup of the product',
                'color' => 'bg-blue-100 text-blue-800',
                'sort_order' => 1,
            ],
            [
                'name' => 'Delivery Service',
                'slug' => 'delivery',
                'description' => 'Product delivery and handling fees',
                'color' => 'bg-green-100 text-green-800',
                'sort_order' => 2,
            ],
            [
                'name' => 'Installation Service',
                'slug' => 'installation',
                'description' => 'Professional installation by certified technicians',
                'color' => 'bg-purple-100 text-purple-800',
                'sort_order' => 3,
            ],
            [
                'name' => 'Maintenance Service',
                'slug' => 'maintenance',
                'description' => 'Ongoing maintenance and support services',
                'color' => 'bg-orange-100 text-orange-800',
                'sort_order' => 4,
            ],
            [
                'name' => 'Other Service',
                'slug' => 'other',
                'description' => 'Custom or miscellaneous services',
                'color' => 'bg-gray-100 text-gray-800',
                'sort_order' => 5,
            ],
        ];

        foreach ($types as $type) {
            ServiceType::create($type);
        }
    }
}
