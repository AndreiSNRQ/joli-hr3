<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $table = 'shift';
    protected $primaryKey = 'shift_id';
    
    protected $fillable = [
        'type',
        'heads',
        'time_start',
        'time_end',
        'date_from',
        'date_to'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'shift_id');
    }
    public function unpublishSchedules()
    {
        return $this->hasMany(UnpublishSchedule::class, 'shift_id');
    }
}