<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add service scheduling fields to orders table
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Service scheduling
            $table->date('preferred_service_date')->nullable()->after('shipping_address');
            $table->time('preferred_service_time')->nullable()->after('preferred_service_date');
            $table->enum('service_time_slot', ['morning', 'afternoon', 'evening', 'flexible'])->default('flexible')->after('preferred_service_time');

            // Additional service notes from customer
            $table->text('service_instructions')->nullable()->after('service_time_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'preferred_service_date',
                'preferred_service_time',
                'service_time_slot',
                'service_instructions'
            ]);
        });
    }
};
