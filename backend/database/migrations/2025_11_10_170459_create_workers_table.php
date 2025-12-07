<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            // id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
            $table->id();

            // user_id BIGINT UNSIGNED DEFAULT NULL
            $table->unsignedBigInteger('user_id')->nullable();

            $table->integer('superior');
            $table->string('identifier', 50);

            $table->date('employ_beg')->nullable();   // az SQL-ben CURRENT_TIMESTAMP a default, de adatok visszatöltésénél úgyis explicit érték lesz
            $table->date('employ_end')->nullable();

            $table->string('rank', 10)->default('FA');
            $table->unsignedTinyInteger('ranking')->default(0);

            $table->string('id_card');
            $table->unsignedTinyInteger('valid')->default(1);

            // indexek
            $table->index('user_id');

            // Kapcsolat
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
