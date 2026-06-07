<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_module_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained('course_modules')->cascadeOnDelete();
            $table->enum('status', ['locked', 'in_progress', 'completed'])->default('locked');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_module_progress');
    }
};
