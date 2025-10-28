<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductAttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ProductAttribute;
use App\Models\CompatibleModel;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing brands and categories
        $brands = Brand::all();
        $categories = Category::whereNull('parent_id')->get();
        
        // Create 10 products with images
        for ($i = 1; $i <= 10; $i++) {
            $product = Product::factory()
                ->for($brands->random())
                ->for($categories->random())
                ->create([
                    'status' => 'active',
                    'in_stock' => true,
                ]);
            
            // Create 3 images for each product (1 primary + 2 secondary)
            ProductImage::factory()
                ->for($product)
                ->primary()
                ->create();
            
            ProductImage::factory()
                ->for($product)
                ->count(2)
                ->create();
        }
    }
}
