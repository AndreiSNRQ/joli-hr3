<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScheduleEmployee;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmployeeScheduleController extends Controller
{
    public function store(Request $request)
    {
        Log::info('EmployeeScheduleController@store called', ['request' => $request->all()]);
        try {
            $validated = $request->validate([
                'employee_id' => 'required|exists:employees,employee_id',
                'shift_id' => 'required|exists:shift,shift_id',
            ]);
            Log::info('Validation passed', ['validated' => $validated]);

            // Error checker: Ensure employee is not already assigned to this shift
            $alreadyAssigned = ScheduleEmployee::where('employee_id', $validated['employee_id'])
                ->where('shift_id', $validated['shift_id'])
                ->exists();
            Log::info('Already assigned check', ['alreadyAssigned' => $alreadyAssigned]);

            if ($alreadyAssigned) {
                Log::warning('Duplicate assignment attempt', $validated);
                return response()->json([
                    'success' => false,
                    'error' => 'This employee is already assigned to the selected shift.'
                ], 400);
            }

            // Add a 0.5 second delay before creating the record
            usleep(500000); // 500,000 microseconds = 0.5 seconds

            $assignment = ScheduleEmployee::create([
                'employee_id' => $validated['employee_id'],
                'shift_id' => $validated['shift_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            Log::info('Assignment created', ['assignment' => $assignment]);

            return response()->json(['success' => true, 'data' => $assignment], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            Log::error('Validation error', ['errors' => $ve->errors(), 'request' => $request->all()]);
            return response()->json([
                'success' => false,
                'error' => 'Data validation error',
                'errors' => $ve->errors(),
                'request' => $request->all()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in EmployeeScheduleController@store: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json(['success' => false, 'error' => $e->getMessage(), 'request' => $request->all()], 500);
        }
    }
}