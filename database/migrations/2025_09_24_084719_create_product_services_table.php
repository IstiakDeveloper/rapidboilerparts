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
        Schema::create('product_services', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Setup Service, Delivery Service, Installation Service
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['setup', 'delivery', 'installation', 'maintenance', 'other']);
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_optional')->default(true); // true = optional, false = mandatory
            $table->boolean('is_free')->default(false); // free service
            $table->json('conditions')->nullable(); // conditions for free service
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_services');
    }
};
