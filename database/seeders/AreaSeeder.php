<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Area;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample areas for major cities
        $areas = [
            // London Areas
            'London' => [
                ['name' => 'Westminster', 'slug' => 'westminster', 'postcode' => 'SW1'],
                ['name' => 'Camden', 'slug' => 'camden', 'postcode' => 'NW1'],
                ['name' => 'Islington', 'slug' => 'islington', 'postcode' => 'N1'],
            ],

            // Manchester Areas
            'Manchester' => [
                ['name' => 'City Centre', 'slug' => 'city-centre-manchester', 'postcode' => 'M1'],
                ['name' => 'Salford', 'slug' => 'salford', 'postcode' => 'M5'],
            ],

            // Birmingham Areas
            'Birmingham' => [
                ['name' => 'City Centre', 'slug' => 'city-centre-birmingham', 'postcode' => 'B1'],
                ['name' => 'Edgbaston', 'slug' => 'edgbaston', 'postcode' => 'B15'],
            ],
        ];

        foreach ($areas as $cityName => $cityAreas) {
            $city = City::where('name', $cityName)->first();

            if ($city) {
                foreach ($cityAreas as $index => $areaData) {
                    Area::create([
                        'city_id' => $city->id,
                        'name' => $areaData['name'],
                        'slug' => $areaData['slug'],
                        'postcode' => $areaData['postcode'],
                        'sort_order' => $index + 1,
                    ]);
                }
            }
        }
    }
}
