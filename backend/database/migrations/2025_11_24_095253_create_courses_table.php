<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();

            // Alap adatok
            $table->string('title');
            $table->string('slug')->unique();          // URL-barát azonosító
            $table->string('short_description', 255)->nullable();
            $table->text('description')->nullable();

            // Szint, nehézség
            $table->string('level')->default('beginner'); // pl.: beginner, intermediate, advanced

            // Státusz: draft / published / archived
            $table->string('status')->default('draft');

            // Meta
            $table->string('language', 10)->default('hu');
            $table->unsignedInteger('estimated_minutes')->nullable(); // becsült idő

            // Rendezéshez
            $table->unsignedInteger('sort_order')->default(0);

            // Kép, thumbnail
            $table->string('thumbnail_path')->nullable();

            // Ki hozta létre
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('published_at')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
