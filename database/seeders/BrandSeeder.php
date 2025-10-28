<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
        ];

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('brands')) {
            Storage::disk('public')->makeDirectory('brands');
        }

        foreach ($brands as $brandData) {
            // Create image for brand
            $imageName = Str::slug($brandData['name']) . '-' . uniqid() . '.png';
            $imagePath = 'brands/' . $imageName;

            // Create a simple 200x200 colored PNG image
            $image = imagecreate(200, 200);
            $bgColor = imagecolorallocate($image, rand(200, 255), rand(200, 255), rand(200, 255));
            $textColor = imagecolorallocate($image, 50, 50, 50);

            // Add text to image
            $initials = strtoupper(substr($brandData['name'], 0, 2));
            imagestring($image, 5, 80, 90, $initials, $textColor);

            // Save image
            ob_start();
            imagepng($image);
            $imageData = ob_get_clean();
            imagedestroy($image);

            Storage::disk('public')->put($imagePath, $imageData);

            // Create brand with image
            Brand::create(array_merge($brandData, ['logo' => $imagePath]));
        }
    }
}
