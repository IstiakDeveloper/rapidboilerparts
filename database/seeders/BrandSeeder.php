<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            [
                'name' => 'Worcester Bosch',
                'slug' => 'worcester-bosch',
                'description' => 'Leading UK boiler manufacturer',
                'website' => 'https://www.worcester-bosch.co.uk',
                'sort_order' => 1,
            ],
            [
                'name' => 'Baxi',
                'slug' => 'baxi',
                'description' => 'British heating and hot water systems manufacturer',
                'website' => 'https://www.baxi.co.uk',
                'sort_order' => 2,
            ],
            [
                'name' => 'Ideal',
                'slug' => 'ideal',
                'description' => 'UK heating solutions provider',
                'website' => 'https://www.idealheating.com',
                'sort_order' => 3,
            ],
            [
                'name' => 'Vaillant',
                'slug' => 'vaillant',
                'description' => 'German heating technology manufacturer',
                'website' => 'https://www.vaillant.co.uk',
                'sort_order' => 4,
            ],
            [
                'name' => 'Vokera',
                'slug' => 'vokera',
                'description' => 'Italian boiler manufacturer',
                'website' => 'https://www.vokera.co.uk',
                'sort_order' => 5,
            ],
            [
                'name' => 'Glow-worm',
                'slug' => 'glow-worm',
                'description' => 'British heating specialist',
                'website' => 'https://www.glow-worm.co.uk',
                'sort_order' => 6,
            ],
            [
                'name' => 'Potterton',
                'slug' => 'potterton',
                'description' => 'UK boiler and heating systems manufacturer',
                'website' => 'https://www.potterton.co.uk',
                'sort_order' => 7,
            ],
            [
                'name' => 'Alpha',
                'slug' => 'alpha',
                'description' => 'UK heating equipment manufacturer',
                'website' => 'https://www.alpha-innovation.co.uk',
                'sort_order' => 8,
            ],
            [
                'name' => 'Ferroli',
                'slug' => 'ferroli',
                'description' => 'Italian heating solutions provider',
                'website' => 'https://www.ferroli.com',
                'sort_order' => 9,
            ],
            [
                'name' => 'Ariston',
                'slug' => 'ariston',
                'description' => 'Italian home comfort solutions',
                'website' => 'https://www.ariston.com',
                'sort_order' => 10,
            ]
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
