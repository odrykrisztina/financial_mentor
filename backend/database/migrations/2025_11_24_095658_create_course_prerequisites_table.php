<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_prerequisites', function (Blueprint $table) {
            $table->id();

            // A kurzus, amit el akar venni a tanuló
            $table->foreignId('course_id')
                ->constrained('courses')
                ->cascadeOnDelete();

            // Az a kurzus, amit előtte KÖTELEZŐ elvégeznie
            $table->foreignId('required_course_id')
                ->constrained('courses')
                ->cascadeOnDelete();

            // Egy kurzushoz egy adott előfeltétel csak egyszer szerepelhet
            $table->unique(['course_id', 'required_course_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_prerequisites');
    }
};
