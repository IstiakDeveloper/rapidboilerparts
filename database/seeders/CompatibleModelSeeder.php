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
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'Greenstar 35i', 'model_code' => 'BT13-45004'],
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'CDi Classic 24', 'model_code' => 'BT10-35001'],
            ['brand_name' => 'Worcester Bosch', 'model_name' => 'CDi Classic 30', 'model_code' => 'BT10-35002'],

            // Baxi Models
            ['brand_name' => 'Baxi', 'model_name' => 'Duo-tec 24', 'model_code' => 'BX24-001'],
            ['brand_name' => 'Baxi', 'model_name' => 'Duo-tec 28', 'model_code' => 'BX28-001'],
            ['brand_name' => 'Baxi', 'model_name' => 'Duo-tec 33', 'model_code' => 'BX33-001'],
            ['brand_name' => 'Baxi', 'model_name' => 'Platinum 24', 'model_code' => 'BXP24-001'],
            ['brand_name' => 'Baxi', 'model_name' => 'Platinum 28', 'model_code' => 'BXP28-001'],

            // Ideal Models
            ['brand_name' => 'Ideal', 'model_name' => 'Logic+ 24', 'model_code' => 'ID24-001'],
            ['brand_name' => 'Ideal', 'model_name' => 'Logic+ 30', 'model_code' => 'ID30-001'],
            ['brand_name' => 'Ideal', 'model_name' => 'Logic+ 35', 'model_code' => 'ID35-001'],
            ['brand_name' => 'Ideal', 'model_name' => 'Vogue Max 26', 'model_code' => 'IDV26-001'],
            ['brand_name' => 'Ideal', 'model_name' => 'Vogue Max 32', 'model_code' => 'IDV32-001'],

            // Vaillant Models
            ['brand_name' => 'Vaillant', 'model_name' => 'ecoTEC plus 824', 'model_code' => 'VL824-001'],
            ['brand_name' => 'Vaillant', 'model_name' => 'ecoTEC plus 831', 'model_code' => 'VL831-001'],
            ['brand_name' => 'Vaillant', 'model_name' => 'ecoTEC plus 837', 'model_code' => 'VL837-001'],
            ['brand_name' => 'Vaillant', 'model_name' => 'ecoFIT pure 825', 'model_code' => 'VLF825-001'],
            ['brand_name' => 'Vaillant', 'model_name' => 'ecoFIT pure 830', 'model_code' => 'VLF830-001'],

            // Vokera Models
            ['brand_name' => 'Vokera', 'model_name' => 'Mynute 20e', 'model_code' => 'VK20E-001'],
            ['brand_name' => 'Vokera', 'model_name' => 'Mynute 25e', 'model_code' => 'VK25E-001'],
            ['brand_name' => 'Vokera', 'model_name' => 'Evolve 26c', 'model_code' => 'VKE26C-001'],
            ['brand_name' => 'Vokera', 'model_name' => 'Evolve 30c', 'model_code' => 'VKE30C-001'],
        ];

        foreach ($models as $model) {
            CompatibleModel::create($model);
        }
    }
}
