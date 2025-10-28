<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cities = [
            // England - Major Cities
            ['name' => 'London', 'slug' => 'london', 'region' => 'England', 'county' => 'Greater London', 'sort_order' => 1],
            ['name' => 'Manchester', 'slug' => 'manchester', 'region' => 'England', 'county' => 'Greater Manchester', 'sort_order' => 2],
            ['name' => 'Birmingham', 'slug' => 'birmingham', 'region' => 'England', 'county' => 'West Midlands', 'sort_order' => 3],
            ['name' => 'Leeds', 'slug' => 'leeds', 'region' => 'England', 'county' => 'West Yorkshire', 'sort_order' => 4],
            ['name' => 'Liverpool', 'slug' => 'liverpool', 'region' => 'England', 'county' => 'Merseyside', 'sort_order' => 5],

            // Scotland
            ['name' => 'Glasgow', 'slug' => 'glasgow', 'region' => 'Scotland', 'county' => 'Glasgow City', 'sort_order' => 6],
            ['name' => 'Edinburgh', 'slug' => 'edinburgh', 'region' => 'Scotland', 'county' => 'City of Edinburgh', 'sort_order' => 7],

            // Wales
            ['name' => 'Cardiff', 'slug' => 'cardiff', 'region' => 'Wales', 'county' => 'Cardiff', 'sort_order' => 8],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}
