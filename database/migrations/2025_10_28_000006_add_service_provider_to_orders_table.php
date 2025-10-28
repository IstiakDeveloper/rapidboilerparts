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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('service_provider_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->decimal('service_provider_charge', 10, 2)->nullable()->after('service_provider_id');
            $table->enum('service_provider_status', ['pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'])
                ->default('pending')->after('service_provider_charge');
            $table->timestamp('assigned_at')->nullable()->after('service_provider_status');
            $table->timestamp('accepted_at')->nullable()->after('assigned_at');
            $table->timestamp('service_completed_at')->nullable()->after('accepted_at');
            $table->text('service_provider_notes')->nullable()->after('service_completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['service_provider_id']);
            $table->dropColumn([
                'service_provider_id',
                'service_provider_charge',
                'service_provider_status',
                'assigned_at',
                'accepted_at',
                'service_completed_at',
                'service_provider_notes'
            ]);
        });
    }
};
