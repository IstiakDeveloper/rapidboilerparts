<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Track service provider's schedule and bookings
     */
    public function up(): void
    {
        Schema::create('service_provider_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_provider_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');

            // Schedule details
            $table->date('service_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('time_slot', ['morning', 'afternoon', 'evening'])->nullable();

            // Status
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for efficient queries
            $table->index(['service_provider_id', 'service_date', 'status'], 'sp_schedule_idx');
            $table->index(['service_date', 'status'], 'schedule_date_idx');

            // Prevent double booking for same time slot
            $table->unique(['service_provider_id', 'service_date', 'start_time'], 'sp_datetime_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_provider_schedules');
    }
};
