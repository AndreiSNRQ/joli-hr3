<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleEmployee extends Model
{
    protected $table = 'schedule_employee';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'employee_id',
        'shift_id',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'employee_schedule_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id', 'shift_id');
    }
}