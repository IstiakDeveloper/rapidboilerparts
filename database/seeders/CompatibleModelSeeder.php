<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompatibleModel;

class CompatibleModelSeeder extends Seeder
{
    public function run(): void
    {
        $models = [
            // Worcester Bosch Models
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'Greenstar 25i', 'model_code' => 'BT13-45002'],
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'Greenstar 30i', 'model_code' => 'BT13-45003'],
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'CDi Classic 24', 'model_code' => 'BT10-35001'],

            // Baxi Models
            ['brand_name' => 'Baxi', 'model_name' => 'Duo-tec 24', 'model_code' => 'BX24-001'],
            ['brand_name' => 'Baxi', 'model_name' => 'Duo-tec 28', 'model_code' => 'BX28-001'],

            // Ideal Models
            ['brand_name' => 'Ideal', 'model_name' => 'Logic+ 24', 'model_code' => 'ID24-001'],
            ['brand_name' => 'Ideal', 'model_name' => 'Logic+ 30', 'model_code' => 'ID30-001'],
        ];

        foreach ($models as $model) {
            CompatibleModel::create($model);
        }
    }
}
