<?php
// 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// 
class CreateSchedulesTable extends Migration
{
    public function up()
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('shift_id');
            $table->unsignedBigInteger('schedule_id');
            $table->enum('status', ['active', 'not active'])->default('not active');
            $table->timestamps();

            $table->foreign('shift_id')->references('shift_id')->on('shift')->onDelete('cascade');
            $table->foreign('schedule_id')->references('idz')->on('schedule_employee')->onDelete('cascade');
        });
    }
// 
    public function down()
    {
        Schema::dropIfExists('schedules');
    }
}