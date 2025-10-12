<?php

namespace App\Http\Controllers;
use App\Models\Claims;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClaimsController extends Controller
{
    public function index()
    {
        // Load attendance + employee relation
        $records = Claims::with('employee')->get();

        // Shape the response for React
        $mapped = $records->map(function ($claims) {

            return [
                'id' => $claims->id,
                'employeeName' => $claims->employee->full_name ?? 'Unknown',
                'claim_type' => $claims->claim_type,
                'amount' => $claims->amount,
                'status' => $claims->status,
            ];
        });

        return response()->json($mapped);
    }
}
