<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'can_create_users')) {
                $column = $table->boolean('can_create_users')->default(false);

                if (Schema::hasColumn('users', 'data_range')) {
                    $column->after('data_range');
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'can_create_users')) {
                $table->dropColumn('can_create_users');
            }
        });
    }
};
