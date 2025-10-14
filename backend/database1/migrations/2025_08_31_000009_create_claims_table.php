<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClaimsTable extends Migration
{
    public function up()
    {
        Schema::create('claims', function (Blueprint $table) {
            $table->id('claims_id');
            $table->integer('employee_id')->comment('Reference to employees.id');
            $table->string('claim_type', 50);
            $table->string('proof', 255);
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->dateTime('approved_at')->nullable();
            $table->integer('approved_by')->comment('Reference to users.id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('claims');
    }
}