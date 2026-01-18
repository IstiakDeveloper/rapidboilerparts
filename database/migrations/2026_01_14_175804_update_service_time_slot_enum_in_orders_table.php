<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update service_time_slot to accept actual time slot values
     */
    public function up(): void
    {
        // Change ENUM to allow actual time slots
        DB::statement("ALTER TABLE orders MODIFY COLUMN service_time_slot ENUM('09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', 'flexible') DEFAULT 'flexible'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to old ENUM values
        DB::statement("ALTER TABLE orders MODIFY COLUMN service_time_slot ENUM('morning', 'afternoon', 'evening', 'flexible') DEFAULT 'flexible'");
    }
};
