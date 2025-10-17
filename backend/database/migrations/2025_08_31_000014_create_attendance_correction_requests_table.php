<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAttendanceCorrectionRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('attendance_correction_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->enum('type', ['clock_in', 'clock_out', 'break_in', 'break_out']);
            $table->time('proposed_time');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('attendance_id')->nullable(); // Link to attendance record if needed
            $table->timestamps();

            $table->foreign('employee_id')->references('employee_id')->on('employees')->onDelete('cascade');
            $table->foreign('attendance_id')->references('attendance_id')->on('attendance')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('attendance_correction_requests');
    }
}