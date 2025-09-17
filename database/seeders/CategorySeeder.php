<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'PCB (Printed Circuit Boards)',
                'slug' => 'pcb-printed-circuit-boards',
                'description' => 'Electronic control boards for boiler systems',
                'sort_order' => 1,
                'children' => [
                    'Main PCB Boards',
                    'Display PCB Boards',
                    'Ignition PCB Boards'
                ]
            ],
            [
                'name' => 'Diverter Valves',
                'slug' => 'diverter-valves',
                'description' => 'Valves that control water flow between heating and hot water systems',
                'sort_order' => 2,
                'children' => [
                    '3-Way Diverter Valves',
                    'Motorized Diverter Valves',
                    'Manual Diverter Valves'
                ]
            ],
            [
                'name' => 'Pumps',
                'slug' => 'pumps',
                'description' => 'Circulation pumps for boiler systems',
                'sort_order' => 3,
                'children' => [
                    'Circulation Pumps',
                    'Central Heating Pumps',
                    'Hot Water Pumps'
                ]
            ],
            [
                'name' => 'Heat Exchangers',
                'slug' => 'heat-exchangers',
                'description' => 'Primary and secondary heat exchangers',
                'sort_order' => 4,
                'children' => [
                    'Primary Heat Exchangers',
                    'Secondary Heat Exchangers',
                    'Plate Heat Exchangers'
                ]
            ],
            [
                'name' => 'Gas Valves',
                'slug' => 'gas-valves',
                'description' => 'Gas control and safety valves',
                'sort_order' => 5,
                'children' => [
                    'Main Gas Valves',
                    'Safety Gas Valves',
                    'Modulating Gas Valves'
                ]
            ],
            [
                'name' => 'Fans & Motors',
                'slug' => 'fans-motors',
                'description' => 'Combustion fans and motors',
                'sort_order' => 6,
                'children' => [
                    'Combustion Fans',
                    'Fan Motors',
                    'Centrifugal Fans'
                ]
            ],
            [
                'name' => 'Sensors & Switches',
                'slug' => 'sensors-switches',
                'description' => 'Temperature sensors, pressure switches, and flow switches',
                'sort_order' => 7,
                'children' => [
                    'Temperature Sensors',
                    'Pressure Switches',
                    'Flow Switches',
                    'Air Pressure Switches'
                ]
            ],
            [
                'name' => 'Electrodes & Ignition',
                'slug' => 'electrodes-ignition',
                'description' => 'Ignition electrodes and flame detection components',
                'sort_order' => 8,
                'children' => [
                    'Ignition Electrodes',
                    'Flame Detection Electrodes',
                    'Spark Generators'
                ]
            ]
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::create($categoryData);

            // Create child categories
            foreach ($children as $index => $childName) {
                Category::create([
                    'name' => $childName,
                    'slug' => str($childName)->slug(),
                    'parent_id' => $category->id,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]);
            }
        }
    }
}
