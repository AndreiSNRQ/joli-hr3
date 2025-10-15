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
        'days', // Added days to fillable
        'department', // Added department to fillable
        'time_start',
        'time_end',
        'date_from',
        'date_to',
        'shift_name'
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'shift_id');
    }
}