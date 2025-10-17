<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    protected $table= 'timesheets';
    protected $primaryKey = 'id';
    
protected $fillable = [
    'employeeid',
    'attendance_id',
    'total_hours',
    'over_time',
    'status',
];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employeeid', 'employee_id');
    }
}