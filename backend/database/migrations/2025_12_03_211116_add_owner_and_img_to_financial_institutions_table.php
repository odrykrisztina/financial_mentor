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
        Schema::table('financial_institutions', function (Blueprint $table) {
            $table->string('owner', 255)
                  ->nullable()
                  ->after('email');

            $table->binary('img')
                  ->nullable()
                  ->after('owner');

            $table->string('img_type', 255)
                  ->nullable()
                  ->after('img');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_institutions', function (Blueprint $table) {
            $table->dropColumn(['owner', 'img', 'img_type']);
        });
    }
};
