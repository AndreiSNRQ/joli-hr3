<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;

class LeaveController extends Controller
{
        public function index()
    {
        // Load attendance + employee relation
        $records = Leave::with('employee')->get();

        // Shape the response for React
        $mapped = $records->map(function ($leave) {

            return [
                'id' => $leave->leave_id,
                'employeeName' => $leave->employee->name ?? 'Unknown',
                'start_date' => $leave->start_date,
                'end_date' => $leave->end_date,
                'reason' => $leave->reason,
                'leave_type' => $leave->leave_type,
                'status' => $leave->status
            ];
        });

        return response()->json($mapped);
    }
}
