<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EmployeesController extends Controller
{

    public function index()
{
    $employees = Employee::all();
    return response()->json($employees);
}
    // Attendance clock in/out
    public function clock(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:employees,employee_id',
            'type' => 'required|in:in,out',
            'location' => 'required|string',
        ]);

        $attendance = new Attendance();
        $attendance->employee_id = $request->id;
        $attendance->type = $request->type;
        $attendance->location = $request->location;
        $attendance->timestamp = Carbon::now();
        $attendance->save();

        return response()->json([
            'message' => 'Clock ' . $request->type . ' recorded successfully',
            'attendance' => $attendance
        ], 201);
    }
// Attendance Records
    public function getAttendanceHistory(Request $request)
    {
        $id = $request->id;
        $attendances = Attendance::where('employee_id', $id)
            ->orderBy('timestamp', 'desc')
            ->get();

        return response()->json($attendances);
    }

    public function getEmployeeDetails($id)
    {
        $employee = Employee::with(['attendances' => function($query) {
            $query->orderBy('timestamp', 'desc')->limit(5);
        }])->findOrFail($id);

        return response()->json($employee);
    }
}