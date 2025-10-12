<?php

namespace App\Models;
// use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    // use HasFactory;
    protected $table = 'leave_requests';
    protected $fillable = [
        'id',
        'start_date',
        'end_date',
        'type',
        'reason',
        'status',
        'created_at',
        'updated_at',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
