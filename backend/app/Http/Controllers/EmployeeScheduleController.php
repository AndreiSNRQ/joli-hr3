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
                'employee_ids' => 'required|array|min:1',
                'employee_ids.*' => 'exists:employees,employee_id',
                'shift_id' => 'required|exists:shift,shift_id',
                'shift_name' => 'required|string',
                'type' => 'required|in:night,morning,afternoon,custom',
                'heads' => 'nullable|integer',
                'days' => 'nullable|array',
                'time_start' => 'required|date_format:H:i',
                'time_end' => 'required|date_format:H:i',
                'date_from' => 'required|date',
                'date_to' => 'required|date',
                'department' => 'nullable|string',
                'status' => 'nullable|in:publish,unpublish' // <-- add status validation
            ]);
            Log::info('Validation passed', ['validated' => $validated]);

            // Error checker: Ensure none of the employees are already assigned to this shift
            $alreadyAssigned = ScheduleEmployee::where('shift_id', $validated['shift_id'])
                ->whereJsonContains('employee_ids', $validated['employee_ids'])
                ->exists();
            Log::info('Already assigned check', ['alreadyAssigned' => $alreadyAssigned]);

            if ($alreadyAssigned) {
                Log::warning('Duplicate assignment attempt', $validated);
                return response()->json([
                    'success' => false,
                    'error' => 'One or more employees are already assigned to the selected shift.'
                ], 400);
            }

            // Add a 0.5 second delay before creating the record
            usleep(500000); // 500,000 microseconds = 0.5 seconds

            $assignment = ScheduleEmployee::create([
                'employee_ids' => $validated['employee_ids'],
                'shift_id' => $validated['shift_id'],
                'shift_name' => $validated['shift_name'],
                'type' => $validated['type'],
                'heads' => $validated['heads'] ?? null,
                'days' => $validated['days'] ?? null,
                'time_start' => $validated['time_start'],
                'time_end' => $validated['time_end'],
                'date_from' => $validated['date_from'],
                'date_to' => $validated['date_to'],
                'department' => $validated['department'] ?? null,
                'status' => $validated['status'] ?? 'unpublish', // <-- set status
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
    public function index()
    {
        // Fetch all unpublished employee schedules
        $schedules = \App\Models\ScheduleEmployee::with('shift')->get();
        $schedules->each(function ($schedule) {
            $schedule->employees = $schedule->employees; // This will use the accessor
        });
        return response()->json($schedules);
    }
    /**
     * Get assigned employees for a specific shift.
     */
    public function getAssignedEmployees($shift_id)
    {
        $assigned = ScheduleEmployee::where('shift_id', $shift_id)->get();
        $employees = [];
        foreach ($assigned as $assignment) {
            $ids = $assignment->employee_ids;
            if (is_array($ids)) {
                $employees = array_merge($employees, $ids);
            }
        }
        // Remove duplicates
        $employees = array_unique($employees);
        // Fetch employee details
        $employeeDetails = \App\Models\Employee::whereIn('employee_id', $employees)->get();
        return response()->json([
            'success' => true,
            'assigned_employees' => $employeeDetails
        ]);
    }
    public function show($id)
    {
        $schedule = ScheduleEmployee::find($id);
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }
        return response()->json($schedule);
    }
    /**
     * Get a specific schedule_employee record by ID
     */
    public function getScheduleEmployee($id)
    {
        $schedule = \App\Models\ScheduleEmployee::find($id);
        if (!$schedule) {
            return response()->json(['success' => false, 'error' => 'ScheduleEmployee not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $schedule]);
    }
    /**
     * Update the status of a schedule_employee record
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:publish,unpublish'
        ]);
        $scheduleEmployee = ScheduleEmployee::find($id);
        if (!$scheduleEmployee) {
            return response()->json(['success' => false, 'error' => 'ScheduleEmployee not found'], 404);
        }
        $scheduleEmployee->status = $validated['status'];
        $scheduleEmployee->save();
        return response()->json(['success' => true, 'data' => $scheduleEmployee]);
    }
    public function publish($id)
    {
        $scheduleEmployee = ScheduleEmployee::find($id);
        if (!$scheduleEmployee) {
            return response()->json(['success' => false, 'error' => 'ScheduleEmployee not found'], 404);
        }
        $scheduleEmployee->status = 'publish';
        $scheduleEmployee->save();
        return response()->json(['success' => true, 'data' => $scheduleEmployee]);
    }
}