<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScheduleEmployee;
use Illuminate\Support\Facades\DB;

class EmployeeScheduleController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'employee_id' => 'required|exists:employees,employee_id',
                'employee_schedule_id' => 'required|exists:schedules,shift_id',
            ]);

            // Error checker: Ensure employee is not already assigned to this schedule
            $alreadyAssigned = ScheduleEmployee::where('employee_id', $validated['employee_id'])
                ->where('employee_schedule_id', $validated['employee_schedule_id'])
                ->exists();

            if ($alreadyAssigned) {
                return response()->json([
                    'success' => false,
                    'error' => 'This employee is already assigned to the selected schedule.'
                ], 400);
            }

            $assignment = ScheduleEmployee::create([
                'employee_id' => $validated['employee_id'],
                'employee_schedule_id' => $validated['employee_schedule_id'],
            ]);

            return response()->json(['success' => true, 'data' => $assignment], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            // Alert validation errors with details
            return response()->json([
                'success' => false,
                'error' => 'Data validation error',
                'errors' => $ve->errors(),
                'request' => $request->all()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in EmployeeScheduleController@store: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json(['success' => false, 'error' => $e->getMessage(), 'request' => $request->all()], 500);
        }
    }
}