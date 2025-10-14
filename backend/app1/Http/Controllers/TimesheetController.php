<?php

namespace App\Http\Controllers;
use App\Models\Timesheet;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
        public function index()
    {
        // Load attendance + employee relation
        $records = Timesheet::with('employee')->get();

        // Shape the response for React
        $mapped = $records->map(function ($timesheet) {
            return [
                'id' => $timesheet->id,
                'employeeName' => $timesheet->employee->full_name ?? 'Unknown',
                'shift_name' => $timesheet->shift_name,
                'start_time' => $timesheet->start_time,
                'end_time' => $timesheet->end_time
            ];
        });

        return response()->json($mapped);
    }
}
