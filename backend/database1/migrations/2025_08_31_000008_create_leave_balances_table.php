<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeaveBalancesTable extends Migration
{
    public function up()
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id('balance_id');
            $table->integer('employee_id')->comment('Reference to employees.id');
            $table->enum('leaved_type', ['sick', 'vacation', 'emergency']);
            $table->integer('allocated_days');
            $table->integer('used_days')->default(0);
            $table->integer('remaining_days');
            $table->integer('year');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_balances');
    }
}