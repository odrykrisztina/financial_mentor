<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('task_id')
                ->constrained('chapter_tasks')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // ha szöveges
            $table->longText('text_answer')->nullable();

            // ha single/multi choice – JSON-ben az option id-k
            $table->json('selected_option_ids')->nullable();

            $table->unsignedInteger('score')->default(0);
            $table->boolean('is_correct')->default(false);

            $table->unsignedSmallInteger('attempt')->default(1);

            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();

            // egy feladatra egy usernek több próbálkozása is lehet,
            // attempt alapján megkülönböztetve
            $table->index(['task_id', 'user_id', 'attempt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_submissions');
    }
};
