<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->char('type', 1)->default('G');
            $table->string('prefix_name', 20)->nullable();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('postfix_name', 20)->nullable();

            $table->date('born')->nullable();
            $table->char('gender', 1);

            $table->binary('img')->nullable();
            $table->string('img_type')->nullable();

            $table->string('phone', 20)->nullable();
            $table->string('residence', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('address', 200)->nullable();

            $table->string('email')->unique();

            $table->boolean('email_verified')->default(false);
            $table->string('email_verification_code')->nullable();
            $table->timestamp('email_verified_at')->nullable();

            $table->string('password');
            $table->string('remember_token', 100)->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('login_at')->nullable();

            $table->unsignedTinyInteger('attempts_num')->default(0);
            $table->unsignedTinyInteger('valid')->default(1);
        });

        // img:  BLOB -> MEDIUMBLOB
        DB::statement('ALTER TABLE users MODIFY img MEDIUMBLOB NULL');

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
