<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use App\Models\Product;

class ProductImageFactory extends Factory
{
    public function definition(): array
    {
        // Create a simple colored image for product
        $imageName = 'product-' . uniqid() . '.png';
        $imagePath = 'products/' . $imageName;

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('products')) {
            Storage::disk('public')->makeDirectory('products');
        }

        // Create a simple 640x480 colored PNG image
        $image = imagecreate(640, 480);
        $bgColor = imagecolorallocate($image, rand(100, 255), rand(100, 255), rand(100, 255));
        $textColor = imagecolorallocate($image, 255, 255, 255);

        // Add text to image
        imagestring($image, 5, 270, 230, 'PRODUCT', $textColor);

        // Save image
        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        Storage::disk('public')->put($imagePath, $imageData);

        return [
            'product_id' => Product::factory(),
            'image_path' => $imagePath,
            'alt_text' => fake()->sentence(3),
            'sort_order' => fake()->numberBetween(1, 10),
            'is_primary' => false,
        ];
    }

    public function primary(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_primary' => true,
            'sort_order' => 1,
        ]);
    }
}
