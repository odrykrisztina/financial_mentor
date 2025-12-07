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
        // 1) pénzintézetek tábla
        Schema::create('financial_institutions', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->string('type', 30);
            $table->string('phone', 20)->nullable();
            $table->string('residence', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('address', 200)->nullable();
            $table->string('email', 255);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->unsignedTinyInteger('valid')->default(1);
        });

        // 2) utólagos FK hozzárakása a contracts-hoz
        Schema::table('contracts', function (Blueprint $table) {
            $table->foreign('financial_institution_id')
                  ->references('id')->on('financial_institutions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // először az FK-t kell dobni a contracts tábláról
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropForeign(['financial_institution_id']);
        });

        Schema::dropIfExists('financial_institutions');
    }
};
