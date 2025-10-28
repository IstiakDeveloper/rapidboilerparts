<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BrandFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        // Create a simple colored image for brand logo
        $imageName = Str::slug($name) . '-' . uniqid() . '.png';
        $imagePath = 'brands/' . $imageName;

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('brands')) {
            Storage::disk('public')->makeDirectory('brands');
        }

        // Create a simple 200x200 colored PNG image
        $image = imagecreate(200, 200);
        $bgColor = imagecolorallocate($image, rand(200, 255), rand(200, 255), rand(200, 255));
        $textColor = imagecolorallocate($image, 50, 50, 50);

        // Add text to image
        $initials = strtoupper(substr($name, 0, 2));
        imagestring($image, 5, 80, 90, $initials, $textColor);

        // Save image
        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        Storage::disk('public')->put($imagePath, $imageData);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(1),
            'logo' => $imagePath,
            'website' => fake()->url(),
            'is_active' => fake()->boolean(95),
            'sort_order' => fake()->numberBetween(1, 50),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
