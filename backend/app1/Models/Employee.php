<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees'; // ✅ table name
    protected $primaryKey = 'employee_id';

    public $incrementing = true; // or false if you manually assign IDs
    protected $keyType = 'int';

    // Optional: if timestamps exist
    public $timestamps = true;
    protected $fillable = [
        'name',
        'position',
        'department',
        'email',
        'phone',
        'hire_date',
        'status',
    ];

    // 🔗 Relation: Employee has many attendance records
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'employee_id');
    }

    public function claims()
    {
        return $this->hasMany(Claims::class, 'employee_id');
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class, 'employee_id');
    }

    public function schedules()
    {
        return $this->belongsToMany(Schedule::class, 'schedule_employee', 'employee_id', 'schedule_id');
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class, 'employee_id');
    }
}