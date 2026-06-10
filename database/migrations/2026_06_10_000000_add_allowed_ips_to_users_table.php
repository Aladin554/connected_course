<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'allowed_ips')) {
                $column = $table->json('allowed_ips')->nullable();

                if (Schema::hasColumn('users', 'can_create_users')) {
                    $column->after('can_create_users');
                } elseif (Schema::hasColumn('users', 'max_cards')) {
                    $column->after('max_cards');
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'allowed_ips')) {
                $table->dropColumn('allowed_ips');
            }
        });
    }
};
