<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    protected $table= 'timesheets';
    protected $primaryKey = 'timesheet_id';
    
    protected $fillable = [
        'id',
        'shift_name',
        'start_time',
        'end_time'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
