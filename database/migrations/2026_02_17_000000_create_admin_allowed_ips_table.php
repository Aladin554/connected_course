<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_allowed_ips', function (Blueprint $table) {
            $table->id();
            $table->string('ip', 64)->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $seedIps = config('admin_security.allowed_ips', []);
        if (!is_array($seedIps)) {
            $seedIps = [];
        }

        $rows = [];
        $timestamp = now();

        foreach ($seedIps as $ip) {
            if (!is_string($ip)) {
                continue;
            }

            $ip = trim($ip);
            if ($ip === '' || isset($rows[$ip])) {
                continue;
            }

            $rows[$ip] = [
                'ip' => $ip,
                'description' => 'Imported from admin_security.allowed_ips',
                'is_active' => true,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        if (!empty($rows)) {
            DB::table('admin_allowed_ips')->insert(array_values($rows));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_allowed_ips');
    }
};
