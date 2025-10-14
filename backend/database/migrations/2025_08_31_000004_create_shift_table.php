<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShiftTable extends Migration
{
    public function up()
    {
        Schema::create('shift', function (Blueprint $table) {
            $table->id('shift_id');
            $table->string('shift_name')->nullable(); // Add shift_name column
            $table->enum('type', ['night', 'morning', 'afternoon', 'custom']);
            $table->integer('heads')->nullable();
            $table->string('days')->nullable(); // Added days field
            // $table->integer('employee_id')->comment('Reference to employees.id'); // REMOVED for many-to-many
            $table->time('time_start');
            $table->time('time_end');
            $table->date('date_from');
            $table->date('date_to');
            $table->string('department')->nullable(); // Added department column
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shift');
    }
}