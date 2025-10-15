<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleEmployee extends Model
{
    use HasFactory;
    
    protected $table = 'schedule_employee';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'employee_ids',
        'shift_id',
        'shift_name',
        'type',
        'heads',
        'days',
        'time_start',
        'time_end',
        'date_from',
        'date_to',
        'department'
    ];

    protected $casts = [
        'employee_ids' => 'array',
        'days' => 'array',
        'time_start' => 'datetime:H:i',
        'time_end' => 'datetime:H:i',
        'date_from' => 'date',
        'date_to' => 'date'
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id', 'shift_id');
    }

    public function employees()
    {
        // Remove this as a relationship, use an accessor instead
        // return Employee::whereIn('employee_id', $this->employee_ids);
    }
    public function getEmployeesAttribute()
    {
        if (is_array($this->employee_ids) && count($this->employee_ids)) {
            return Employee::whereIn('employee_id', $this->employee_ids)->get();
        }
        return collect(); // Return empty collection if no IDs
    }
}