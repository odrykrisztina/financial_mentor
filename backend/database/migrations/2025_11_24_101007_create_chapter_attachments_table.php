<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapter_attachments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('chapter_id')
                ->constrained('course_chapters')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('type')->default('file');
            // pl.: file | link | video | pdf | code

            $table->string('file_path')->nullable(); // storage path
            $table->string('url')->nullable();       // külső link / video URL

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapter_attachments');
    }
};
