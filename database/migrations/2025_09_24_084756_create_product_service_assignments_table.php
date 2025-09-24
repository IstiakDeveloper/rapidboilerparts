<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_service_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_service_id')->constrained()->onDelete('cascade');
            $table->decimal('custom_price', 10, 2)->nullable(); // override default price for specific product
            $table->boolean('is_mandatory')->default(false); // mandatory for this specific product
            $table->boolean('is_free')->default(false); // free for this specific product
            $table->json('conditions')->nullable(); // specific conditions for this product
            $table->timestamps();

            $table->unique(['product_id', 'product_service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_service_assignments');
    }
};
