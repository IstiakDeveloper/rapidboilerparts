<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProductAttribute;

class ProductAttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            [
                'name' => 'Material',
                'slug' => 'material',
                'type' => 'select',
                'is_filterable' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Power Rating',
                'slug' => 'power-rating',
                'type' => 'text',
                'is_filterable' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Connection Type',
                'slug' => 'connection-type',
                'type' => 'select',
                'is_filterable' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Warranty Period',
                'slug' => 'warranty-period',
                'type' => 'text',
                'is_filterable' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Operating Temperature',
                'slug' => 'operating-temperature',
                'type' => 'text',
                'is_filterable' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Pressure Rating',
                'slug' => 'pressure-rating',
                'type' => 'text',
                'is_filterable' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Installation Type',
                'slug' => 'installation-type',
                'type' => 'select',
                'is_filterable' => true,
                'sort_order' => 7,
            ],
            [
                'name' => 'Condition',
                'slug' => 'condition',
                'type' => 'select',
                'is_filterable' => true,
                'sort_order' => 8,
            ]
        ];

        foreach ($attributes as $attribute) {
            ProductAttribute::create($attribute);
        }
    }
}
