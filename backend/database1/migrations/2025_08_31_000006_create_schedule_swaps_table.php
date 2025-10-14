<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateScheduleSwapsTable extends Migration
{
    public function up()
    {
        Schema::create('schedule_swaps', function (Blueprint $table) {
            $table->id();
            $table->integer('schedule_id')->comment('Reference to schedules.sched_id');
            $table->integer('employee_id')->comment('Reference to employees.id');
            $table->text('reason');
            $table->dateTime('proposed_time');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('approved_by')->comment('Reference to users.id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('schedule_swaps');
    }
}