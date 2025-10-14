<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance'; // ✅ use singular
    protected $primaryKey = 'attendance_id';
    protected $fillable = [
        'attendance_id',
        'employee_id',
        'date',
        'clock_in',
        'break_start',
        'break_end',
        'clock_out',
        'updated_at',
    ];

    // 🔗 Relation: Attendance belongs to an employee
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}