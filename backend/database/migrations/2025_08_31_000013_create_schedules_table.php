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
            $table->json('employee_ids'); // Store multiple employee IDs as JSON array
            $table->unsignedBigInteger('schedule_id')->nullable();
            $table->string('shift_name')->nullable();
            $table->enum('type', ['night', 'morning', 'afternoon', 'custom']);
            $table->integer('heads')->nullable();
            $table->string('days')->nullable();
            $table->time('time_start');
            $table->time('time_end');
            $table->date('date_from');
            $table->date('date_to');
            $table->string('department')->nullable();
            $table->enum('status', ['active', 'not active'])->default('active');
            $table->timestamps();
            $table->foreign('schedule_id')->references('id')->on('schedule_employee')->onDelete('set null');
        });
    }
// 
    public function down()
    {
        Schema::dropIfExists('schedules');
    }
}