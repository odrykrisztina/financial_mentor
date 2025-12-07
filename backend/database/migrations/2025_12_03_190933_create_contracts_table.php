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
        Schema::create('contracts', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->bigIncrements('id');
            $table->string('contract_no', 255)->unique();
            $table->string('type', 30);

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('worker_id');
            $table->unsignedBigInteger('financial_institution_id');

            $table->unsignedBigInteger('award');
            $table->string('currency', 20)->default('HUF');
            $table->date('start_at');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->unsignedTinyInteger('valid')->default(1);

            // FK-k, amikhez a táblák már léteznek
            $table->foreign('user_id')
                  ->references('id')->on('users');

            $table->foreign('worker_id')
                  ->references('id')->on('workers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // előbb FK-k dobása, ha léteznek
            $table->dropForeign(['user_id']);
            $table->dropForeign(['worker_id']);
        });

        Schema::dropIfExists('contracts');
    }
};
