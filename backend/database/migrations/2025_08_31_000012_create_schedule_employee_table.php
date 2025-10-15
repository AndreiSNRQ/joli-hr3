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
            $table->json('employee_ids'); // Store multiple employee IDs as JSON array
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->string('shift_name')->nullable();
            $table->enum('type', ['night', 'morning', 'afternoon', 'custom']);
            $table->integer('heads')->nullable();
            $table->string('days')->nullable();
            $table->time('time_start');
            $table->time('time_end');
            $table->date('date_from');
            $table->date('date_to');
            $table->string('department')->nullable();
            $table->timestamps();
            $table->foreign('shift_id')->references('shift_id')->on('shift')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedule_employee');
    }
}