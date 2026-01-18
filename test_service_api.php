<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$product = App\Models\Product::first();
echo "Product: " . $product->name . " (ID: " . $product->id . ")\n\n";

$services = App\Models\ProductService::active()->get();
echo "Total Services: " . $services->count() . "\n\n";

$response = $services->map(function($s) {
    return [
        'id' => $s->id,
        'name' => $s->name,
        'description' => $s->description,
        'base_price' => (float)$s->price,
        'duration_minutes' => 60,
        'is_active' => (bool)$s->is_active
    ];
});

echo "API Response:\n";
echo json_encode(['success' => true, 'services' => $response], JSON_PRETTY_PRINT);
