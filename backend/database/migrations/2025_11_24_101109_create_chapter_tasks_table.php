<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapter_tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('chapter_id')
                ->constrained('course_chapters')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // feladattípus: single_choice / multiple_choice / text / true_false stb.
            $table->string('type')->default('single_choice');

            $table->unsignedInteger('max_score')->default(1);
            $table->boolean('is_required')->default(true);

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapter_tasks');
    }
};
