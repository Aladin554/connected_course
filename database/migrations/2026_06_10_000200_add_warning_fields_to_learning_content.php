<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('welcome_slides', function (Blueprint $table) {
            if (!Schema::hasColumn('welcome_slides', 'warning')) {
                $table->text('warning')->nullable()->after('body_content');
            }
        });

        Schema::table('course_modules', function (Blueprint $table) {
            if (!Schema::hasColumn('course_modules', 'warning')) {
                $table->text('warning')->nullable()->after('description');
            }
        });

        Schema::table('lessons', function (Blueprint $table) {
            if (!Schema::hasColumn('lessons', 'warning')) {
                $table->text('warning')->nullable()->after('title');
            }
        });
    }

    public function down(): void
    {
        Schema::table('welcome_slides', function (Blueprint $table) {
            if (Schema::hasColumn('welcome_slides', 'warning')) {
                $table->dropColumn('warning');
            }
        });

        Schema::table('course_modules', function (Blueprint $table) {
            if (Schema::hasColumn('course_modules', 'warning')) {
                $table->dropColumn('warning');
            }
        });

        Schema::table('lessons', function (Blueprint $table) {
            if (Schema::hasColumn('lessons', 'warning')) {
                $table->dropColumn('warning');
            }
        });
    }
};
