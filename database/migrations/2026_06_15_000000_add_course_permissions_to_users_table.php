<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'can_add_courses')) {
                $table->boolean('can_add_courses')->default(false)->after('can_create_users');
            }
            if (!Schema::hasColumn('users', 'can_edit_courses')) {
                $table->boolean('can_edit_courses')->default(true)->after('can_add_courses');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'can_edit_courses')) {
                $table->dropColumn('can_edit_courses');
            }
            if (Schema::hasColumn('users', 'can_add_courses')) {
                $table->dropColumn('can_add_courses');
            }
        });
    }
};
