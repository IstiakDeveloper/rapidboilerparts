<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(2, true);

        // Create a simple colored image for category
        $imageName = Str::slug($name) . '-' . uniqid() . '.png';
        $imagePath = 'categories/' . $imageName;

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('categories')) {
            Storage::disk('public')->makeDirectory('categories');
        }

        // Create a simple 640x480 colored PNG image
        $image = imagecreate(640, 480);
        $bgColor = imagecolorallocate($image, rand(150, 255), rand(150, 255), rand(150, 255));
        $textColor = imagecolorallocate($image, 30, 30, 30);

        // Add text to image
        imagestring($image, 5, 250, 230, strtoupper(substr($name, 0, 15)), $textColor);

        // Save image
        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        Storage::disk('public')->put($imagePath, $imageData);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(6),
            'image' => $imagePath,
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => fake()->boolean(90),
            'parent_id' => null,
        ];
    }

    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => \App\Models\Category::factory(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
