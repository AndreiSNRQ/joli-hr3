<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTimesheetRequestTable extends Migration
{
    public function up()
    {
        Schema::create('timesheet_request', function (Blueprint $table) {
            $table->id('request_id');
            $table->integer('timesheet_id')->comment('Reference to timesheets.timesheet_id');
            $table->integer('employee_id')->comment('Reference to employees.id');
            $table->enum('requested', ['clock_in', 'clock_out', 'break_start', 'break_end']);
            $table->string('reason', 255);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('requested_at')->useCurrent();
            $table->integer('approved_by')->comment('Reference to users.id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('timesheet_request');
    }
}