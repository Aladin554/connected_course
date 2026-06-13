<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lessons')) {
            return;
        }

        DB::statement('ALTER TABLE lessons MODIFY video_type VARCHAR(32) NULL');
        DB::statement('ALTER TABLE lessons MODIFY video_value VARCHAR(255) NULL');
    }

    public function down(): void
    {
        if (!Schema::hasTable('lessons')) {
            return;
        }

        DB::statement("ALTER TABLE lessons MODIFY video_type VARCHAR(32) NOT NULL DEFAULT 'youtube'");
        DB::statement("ALTER TABLE lessons MODIFY video_value VARCHAR(255) NOT NULL DEFAULT ''");
    }
};
