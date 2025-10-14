<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index()
    {
        try {
            // Load all shifts with employee data
            $records = Schedule::with('employees')->get();

            if ($records->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No shifts found',
                    'data' => []
                ]);
            }

            // Shape the response for React
            $mapped = $records->map(function ($shift) {
                $firstEmployee = $shift->employees->first();
                return [
                    'id' => $shift->shift_id,
                    'name' => $firstEmployee ? $firstEmployee->name : 'Unknown',
                    'type' => $shift->type,
                    'heads' => $shift->heads,
                    'start_time' => $shift->time_start,
                    'end_time' => $shift->time_end,
                    'date_from' => $shift->date_from,
                    'date_to' => $shift->date_to
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mapped
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schedules: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|string|max:100',
                'heads' => 'required|integer',
                'employee_ids' => 'required|array|min:1',
                'employee_ids.*' => 'exists:employees,employee_id',
                'time_start' => 'required|date_format:H:i',
                'time_end' => 'required|date_format:H:i|after:time_start',
                'date_from' => 'required|date',
                'date_to' => 'required|date|after_or_equal:date_from'
            ]);

            // Determine shift type based on time_start
            $startHour = intval(substr($validated['time_start'], 0, 2));
            $startMinute = intval(substr($validated['time_start'], 3, 2));
            $startTime12 = date("g:i A", strtotime($validated['time_start']));

            if ($startHour >= 5 && $startHour < 10) {
                $type = 'morning';
            } elseif ($startHour >= 12 && $startHour < 16) {
                $type = 'afternoon';
            } elseif ($startHour >= 18 && $startHour <= 22) {
                $type = 'night';
            } else {
                $type = 'custom';
            }

            $shift = Schedule::create([
                'type' => $type,
                'heads' => $validated['heads'],
                'time_start' => date("H:i:s", strtotime($validated['time_start'])),
                'time_end' => date("H:i:s", strtotime($validated['time_end'])),
                'date_from' => $validated['date_from'],
                'date_to' => $validated['date_to'],
                'shift_status' => 'not active'
            ]);

            $shift->employees()->sync($validated['employee_ids']);
            // Removed logic for unpublish_schedule insertion

            return response()->json($shift, 201);
        } catch (\Exception $e) {
            \Log::error('Error in ScheduleController@store: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function publish($id)
    {
        $shift = Schedule::findOrFail($id);
        
        $shift->update([
            'status' => 'published'
        ]);

        return response()->json(['message' => 'Shift published successfully']);
    }

    public function getUnpublishedSchedules()
    {
        // This method is now obsolete and has been removed.
    }
}