<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnpublishSchedule extends Model
{
    protected $table = 'unpublish_schedule';
    protected $primaryKey = 'sched_id';
    
    protected $fillable = [
        'shift_id',
        'schedule_employee_id',
        'schedule_date',
        'status'
    ];

    public function scheduleEmployee()
    {
        return $this->belongsTo(ScheduleEmployee::class, 'employee_schedule_id', 'schedule_employee_id');
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class, 'shift_id', 'shift_id');
    }
    public function employee()
    {
        // This relationship is not needed; use scheduleEmployee->employee instead
    }
}