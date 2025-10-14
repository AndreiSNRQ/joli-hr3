<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $table = 'schedules';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'shift_id',
        'schedule_employee_id',
        'status',
        'created_at',
        'updated_at',
        'type',
        'heads',
        'time_start',
        'time_end',
        'date_from',
        'date_to'
    ];

    // Removed employee() relationship, use employees() only
    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'schedule_employee', 'shift_id', 'employee_id');
    }
}