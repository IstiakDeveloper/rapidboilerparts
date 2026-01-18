<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->json('selected_services')->nullable()->after('quantity'); // selected services for cart item
            $table->decimal('services_total', 10, 2)->default(0)->after('selected_services'); // total cost of selected services
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['selected_services', 'services_total']);
        });
    }
};
