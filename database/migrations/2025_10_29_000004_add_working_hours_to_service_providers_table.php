<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add working hours and service types to service providers
     */
    public function up(): void
    {
        Schema::table('service_providers', function (Blueprint $table) {
            // Working hours (JSON format for flexible schedule)
            // Example: {"monday": {"start": "09:00", "end": "18:00", "available": true}, ...}
            $table->json('working_hours')->nullable()->after('availability_status');

            // Working days (for quick check)
            $table->json('working_days')->nullable()->after('working_hours');

            // Average service duration in minutes
            $table->integer('avg_service_duration')->default(60)->after('working_days');

            // Advance booking days required
            $table->integer('min_advance_booking_hours')->default(24)->after('avg_service_duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_providers', function (Blueprint $table) {
            $table->dropColumn([
                'working_hours',
                'working_days',
                'avg_service_duration',
                'min_advance_booking_hours'
            ]);
        });
    }
};
