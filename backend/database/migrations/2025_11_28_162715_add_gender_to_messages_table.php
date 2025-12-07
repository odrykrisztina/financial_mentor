<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Ha már van adat a táblában, itt *jobb* nullable-ként felvenni
            $table->char('gender', 1)
                  ->nullable()
                  ->after('phone'); // oda teszed, ahová szeretnéd
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('gender');
        });
    }
};
