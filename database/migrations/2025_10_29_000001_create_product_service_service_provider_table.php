<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This table links ProductServices with ServiceProviders (many-to-many)
     * So we know which service provider can provide which services
     */
    public function up(): void
    {
        Schema::create('product_service_service_provider', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_service_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_provider_id')->constrained()->onDelete('cascade');

            // Optional: Custom price for this provider for this service
            $table->decimal('custom_price', 10, 2)->nullable();

            // Experience level for this service
            $table->enum('experience_level', ['beginner', 'intermediate', 'expert'])->default('intermediate');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['product_service_id', 'service_provider_id'], 'ps_sp_unique');
            $table->index(['service_provider_id', 'is_active'], 'ps_sp_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_service_service_provider');
    }
};
