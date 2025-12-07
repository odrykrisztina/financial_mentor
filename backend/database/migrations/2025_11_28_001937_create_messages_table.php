<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->string('status', 20)->nullable();

            $table->unsignedBigInteger('worker_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('prefix_name', 20)->nullable();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('postfix_name', 20)->nullable();

            $table->string('phone', 20)->nullable();
            $table->string('email', 255);

            $table->string('subject_id', 20);          
            $table->text('message');

            $table->timestamps();
            $table->dateTime('finished_at')->nullable();

            // (opcionális indexek)
            // $table->index('worker_id');
            // $table->index('user_id');
            // $table->index('subject_id');

            // (opcionális külső kulcsok)
            // $table->foreign('worker_id')->references('id')->on('workers')->nullOnDelete();
            // $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
