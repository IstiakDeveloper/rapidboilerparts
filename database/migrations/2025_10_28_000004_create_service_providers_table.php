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
        Schema::create('service_providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('service_provider_categories')->onDelete('cascade');
            $table->foreignId('city_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->constrained()->onDelete('cascade');

            // Service Details
            $table->string('business_name')->nullable();
            $table->text('description')->nullable();
            $table->decimal('service_charge', 10, 2)->default(0); // Base charge for service
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();

            // Availability
            $table->enum('availability_status', ['available', 'busy', 'offline'])->default('available');
            $table->integer('max_daily_orders')->default(5); // Max orders per day
            $table->integer('current_daily_orders')->default(0); // Current orders today

            // Rating & Stats
            $table->decimal('rating', 3, 2)->default(0); // Average rating
            $table->integer('total_jobs_completed')->default(0);
            $table->integer('total_reviews')->default(0);

            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false); // Admin verification
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_active_at')->nullable();

            $table->timestamps();

            $table->index(['city_id', 'area_id', 'category_id']);
            $table->index(['availability_status', 'is_active']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_providers');
    }
};
