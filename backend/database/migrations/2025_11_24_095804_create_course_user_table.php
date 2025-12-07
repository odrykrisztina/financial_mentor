<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('course_id')
                ->constrained('courses')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // státusz: enrolled / in_progress / completed / failed stb.
            $table->string('status')->default('enrolled');

            // opcionális pontszám / százalék
            $table->unsignedInteger('score')->nullable();        // pl. 0–100
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // egy user egy kurzusban egyszer szerepelhet
            $table->unique(['course_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_user');
    }
};
