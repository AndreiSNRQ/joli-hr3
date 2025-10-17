<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimesheetsTable extends Migration
{
    public function up()
    {
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employeeid');
            $table->unsignedBigInteger('attendance_id');
            $table->decimal('total_hours', 5, 2)->default(0);
            $table->decimal('over_time', 5, 2)->default(0);
            $table->enum('status', ['pending', 'approve', 'reject'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('timesheets');
    }
}