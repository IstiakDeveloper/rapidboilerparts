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
        $worcesterBrand = Brand::where('slug', 'worcester-bosch')->first();
        $baxiBrand = Brand::where('slug', 'baxi')->first();
        $idealBrand = Brand::where('slug', 'ideal')->first();

        $pcbCategory = Category::where('slug', 'pcb-printed-circuit-boards')->first();
        $pumpCategory = Category::where('slug', 'pumps')->first();
        $diverterCategory = Category::where('slug', 'diverter-valves')->first();

        $products = [
            [
                'name' => 'Worcester Greenstar Fan Replacement 87161213440',
                'slug' => 'worcester-greenstar-fan-replacement-87161213440',
                'short_description' => 'Original Worcester Greenstar centrifugal fan replacement part',
                'description' => 'This is a genuine Worcester Greenstar centrifugal fan assembly suitable for various Worcester Greenstar boiler models. The fan is responsible for providing combustion air and removing flue gases. This is a high-quality replacement part manufactured to OEM specifications.',
                'sku' => 'WB-FAN-87161213440',
                'manufacturer_part_number' => '87161213440',
                'gc_number' => 'GC-47-123-456',
                'price' => 125.50,
                'sale_price' => 115.00,
                'stock_quantity' => 25,
                'brand_id' => $worcesterBrand->id,
                'category_id' => $pcbCategory->id,
                'status' => 'active',
                'is_featured' => true,
                'weight' => 1.2,
                'meta_title' => 'Worcester Greenstar Fan Replacement 87161213440',
                'meta_description' => 'Genuine Worcester Greenstar centrifugal fan replacement part 87161213440 for various boiler models.',
            ],
            [
                'name' => 'Baxi Duo-tec PCB Main Control Board',
                'slug' => 'baxi-duo-tec-pcb-main-control-board',
                'short_description' => 'Main PCB control board for Baxi Duo-tec boiler series',
                'description' => 'Original Baxi main PCB control board designed for Duo-tec series boilers. This circuit board controls all major boiler functions including ignition, flame detection, pump operation, and safety systems. Essential for proper boiler operation.',
                'sku' => 'BX-PCB-DUOTEC-001',
                'manufacturer_part_number' => '5120219',
                'gc_number' => 'GC-47-234-567',
                'price' => 285.00,
                'sale_price' => null,
                'stock_quantity' => 15,
                'brand_id' => $baxiBrand->id,
                'category_id' => $pcbCategory->id,
                'status' => 'active',
                'is_featured' => true,
                'weight' => 0.5,
                'meta_title' => 'Baxi Duo-tec PCB Main Control Board',
                'meta_description' => 'Original Baxi main PCB control board 5120219 for Duo-tec series boilers.',
            ],
            [
                'name' => 'Ideal Logic+ Circulation Pump Assembly',
                'slug' => 'ideal-logic-circulation-pump-assembly',
                'short_description' => 'Complete circulation pump assembly for Ideal Logic+ boilers',
                'description' => 'Genuine Ideal Logic+ circulation pump assembly including pump head, motor, and mounting hardware. This pump circulates water through the heating system and is essential for proper heat distribution. Compatible with Logic+ 24, 30, and 35 models.',
                'sku' => 'ID-PUMP-LOGIC-001',
                'manufacturer_part_number' => '175591',
                'gc_number' => 'GC-47-345-678',
                'price' => 165.75,
                'sale_price' => 155.00,
                'stock_quantity' => 30,
                'brand_id' => $idealBrand->id,
                'category_id' => $pumpCategory->id,
                'status' => 'active',
                'is_featured' => false,
                'weight' => 2.8,
                'meta_title' => 'Ideal Logic+ Circulation Pump Assembly',
                'meta_description' => 'Genuine Ideal Logic+ circulation pump assembly 175591 for Logic+ boiler series.',
            ],
            [
                'name' => 'Worcester Greenstar 3-Way Diverter Valve',
                'slug' => 'worcester-greenstar-3-way-diverter-valve',
                'short_description' => '3-way diverter valve for Worcester Greenstar boilers',
                'description' => 'Original Worcester Greenstar 3-way diverter valve that controls the flow of water between central heating and domestic hot water circuits. Includes valve body, actuator motor, and sealing components. Essential for combi boiler operation.',
                'sku' => 'WB-DIV-3WAY-001',
                'manufacturer_part_number' => '87161066240',
                'gc_number' => 'GC-47-456-789',
                'price' => 89.99,
                'sale_price' => null,
                'stock_quantity' => 20,
                'brand_id' => $worcesterBrand->id,
                'category_id' => $diverterCategory->id,
                'status' => 'active',
                'is_featured' => true,
                'weight' => 1.5,
                'meta_title' => 'Worcester Greenstar 3-Way Diverter Valve',
                'meta_description' => 'Original Worcester Greenstar 3-way diverter valve 87161066240 for combi boilers.',
            ],
            [
                'name' => 'Baxi Platinum Main Heat Exchanger',
                'slug' => 'baxi-platinum-main-heat-exchanger',
                'short_description' => 'Main heat exchanger for Baxi Platinum series boilers',
                'description' => 'Genuine Baxi Platinum main heat exchanger manufactured from high-grade stainless steel. This primary heat exchanger transfers heat from the burner to the heating water. Designed for long-lasting performance and optimal heat transfer efficiency.',
                'sku' => 'BX-HE-PLAT-MAIN',
                'manufacturer_part_number' => '5114711',
                'gc_number' => 'GC-47-567-890',
                'price' => 320.00,
                'sale_price' => 295.00,
                'stock_quantity' => 8,
                'brand_id' => $baxiBrand->id,
                'category_id' => $pcbCategory->id, // Using PCB category as placeholder
                'status' => 'active',
                'is_featured' => true,
                'weight' => 5.2,
                'meta_title' => 'Baxi Platinum Main Heat Exchanger',
                'meta_description' => 'Genuine Baxi Platinum main heat exchanger 5114711 for Platinum series boilers.',
            ],
        ];

        foreach ($products as $productData) {
            $product = Product::create($productData);

            // Add sample product images
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'products/' . $product->slug . '-1.jpg',
                'alt_text' => $product->name . ' - Main Image',
                'sort_order' => 1,
                'is_primary' => true,
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'products/' . $product->slug . '-2.jpg',
                'alt_text' => $product->name . ' - Side View',
                'sort_order' => 2,
                'is_primary' => false,
            ]);

            // Add sample attribute values
            $materialAttr = ProductAttribute::where('slug', 'material')->first();
            $conditionAttr = ProductAttribute::where('slug', 'condition')->first();
            $warrantyAttr = ProductAttribute::where('slug', 'warranty-period')->first();

            if ($materialAttr) {
                ProductAttributeValue::create([
                    'product_id' => $product->id,
                    'product_attribute_id' => $materialAttr->id,
                    'value' => rand(0, 1) ? 'Stainless Steel' : 'Aluminum Alloy',
                ]);
            }

            if ($conditionAttr) {
                ProductAttributeValue::create([
                    'product_id' => $product->id,
                    'product_attribute_id' => $conditionAttr->id,
                    'value' => rand(0, 1) ? 'New' : 'Refurbished',
                ]);
            }

            if ($warrantyAttr) {
                ProductAttributeValue::create([
                    'product_id' => $product->id,
                    'product_attribute_id' => $warrantyAttr->id,
                    'value' => rand(0, 1) ? '12 Months' : '24 Months',
                ]);
            }

            // Add compatible models
            $compatibleModels = CompatibleModel::where('brand_name', $product->brand->name)
                ->inRandomOrder()
                ->limit(3)
                ->get();

            foreach ($compatibleModels as $model) {
                $product->compatibleModels()->attach($model->id);
            }
        }

        // Create additional products using factory
        Product::factory(50)->create();
    }
}
