<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScheduleEmployeeTable extends Migration
{
    public function up()
    {
        Schema::create('schedule_employee', function (Blueprint $table) {
            $table->bigIncrements('id');
            // $table->unsignedBigInteger('schedule_id');
            $table->unsignedBigInteger('shift_id');
            $table->unsignedBigInteger('employee_id');
            $table->timestamps();

            $table->foreign('shift_id')->references('shift_id')->on('shift')->onDelete('cascade');
            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedule_employee');
    }
}