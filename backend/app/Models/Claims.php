<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Claims extends Model
{
    use HasFactory;
    protected $table = 'claims';

    protected $fillable = [
        'id',
        'claim_type',
        'amount',
        'status'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
