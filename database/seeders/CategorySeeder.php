<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
                ]
            ],
        ];

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('categories')) {
            Storage::disk('public')->makeDirectory('categories');
        }

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            // Create image for parent category
            $imageName = Str::slug($categoryData['name']) . '-' . uniqid() . '.png';
            $imagePath = 'categories/' . $imageName;

            // Create a simple 640x480 colored PNG image
            $image = imagecreate(640, 480);
            $bgColor = imagecolorallocate($image, rand(150, 255), rand(150, 255), rand(150, 255));
            $textColor = imagecolorallocate($image, 30, 30, 30);

            // Add text to image
            imagestring($image, 5, 250, 230, strtoupper(substr($categoryData['name'], 0, 15)), $textColor);

            // Save image
            ob_start();
            imagepng($image);
            $imageData = ob_get_clean();
            imagedestroy($image);

            Storage::disk('public')->put($imagePath, $imageData);

            // Create parent category with image
            $category = Category::create(array_merge($categoryData, ['image' => $imagePath]));

            // Create child categories with images
            foreach ($children as $index => $childName) {
                // Create image for child category
                $childImageName = Str::slug($childName) . '-' . uniqid() . '.png';
                $childImagePath = 'categories/' . $childImageName;

                // Create a simple 640x480 colored PNG image for child
                $childImage = imagecreate(640, 480);
                $childBgColor = imagecolorallocate($childImage, rand(150, 255), rand(150, 255), rand(150, 255));
                $childTextColor = imagecolorallocate($childImage, 30, 30, 30);

                // Add text to child image
                imagestring($childImage, 5, 250, 230, strtoupper(substr($childName, 0, 15)), $childTextColor);

                // Save child image
                ob_start();
                imagepng($childImage);
                $childImageData = ob_get_clean();
                imagedestroy($childImage);

                Storage::disk('public')->put($childImagePath, $childImageData);

                Category::create([
                    'name' => $childName,
                    'slug' => str($childName)->slug(),
                    'parent_id' => $category->id,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                    'image' => $childImagePath,
                ]);
            }
        }
    }
}
