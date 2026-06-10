<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('welcome_slides', function (Blueprint $table) {
            if (!Schema::hasColumn('welcome_slides', 'warning_position')) {
                $table->string('warning_position', 32)->default('after_description')->after('warning');
            }
        });
    }

    public function down(): void
    {
        Schema::table('welcome_slides', function (Blueprint $table) {
            if (Schema::hasColumn('welcome_slides', 'warning_position')) {
                $table->dropColumn('warning_position');
            }
        });
    }
};
