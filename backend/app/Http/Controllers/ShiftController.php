<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShiftController extends Controller
{
    public function index()
    {
        try {
            // Load all shifts with employee data
            $records = Shift::with('schedule_employee')->get();

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
                    'employee_name' => $firstEmployee ? $firstEmployee->name : 'Unknown',
                    'shift_type' => $shift->type,
                    'headcount' => $shift->heads,
                    'start_time' => $shift->time_start,
                    'end_time' => $shift->time_end,
                    'date_start' => $shift->date_from,
                    'date_end' => $shift->date_to
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
        $validated = $request->validate([
            'shift_type' => 'string|max:100',
            'headcount' => 'integer',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'date_start' => 'date',
            'date_end' => 'date|after_or_equal:date_start'
        ]);

        // Determine shift type based on start_time (if provided)
        if (isset($validated['start_time'])) {
            $startHour = intval(substr($validated['start_time'], 0, 2));
            $startMinute = intval(substr($validated['start_time'], 3, 2));
            $startTime12 = date("g:i A", strtotime($validated['start_time']));

            if ($startHour >= 5 && $startHour < 10) {
                $type = 'morning';
            } elseif ($startHour >= 12 && $startHour < 16) {
                $type = 'afternoon';
            } elseif ($startHour >= 18 && $startHour <= 22) {
                $type = 'night';
            } else {
                $type = 'custom';
            }
        } else {
            $type = $validated['shifttype'] ?? 'custom';
        }

        $shift = Shift::create([
            'type' => $validated['type'] ?? 'custom',
            'heads' => $validated['heads'] ?? 1,
            'time_start' => $validated['time_start'] ?? null,
            'time_end' => $validated['time_end'] ?? null,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null
        ]);

        return response()->json($shift, 201);
    }

    public function publish($id)
    {
        $shift = Shift::findOrFail($id);
        
        $shift->update([
            'status' => 'published'
        ]);

        return response()->json(['message' => 'Shift published successfully']);
    }

    public function getUnpublishedSchedules()
    {
        try {
            $records = DB::table('unpublish_schedule')
                ->join('schedule_employee', 'unpublish_schedule.schedule_employee_id', '=', 'schedule_employee.id')
                ->join('employees', 'schedule_employee.employee_id', '=', 'employees.id')
                ->join('schedules', 'unpublish_schedule.shift_id', '=', 'schedules.shift_id')
                ->select(
                    'unpublish_schedule.id as unpublish_id',
                    'schedules.shift_id',
                    'schedules.type',
                    'schedules.heads',
                    'schedules.time_start',
                    'schedules.time_end',
                    'schedules.date_from',
                    'schedules.date_to',
                    'employees.id as employee_id',
                    'employees.name as employee_name',
                    'employees.department',
                    'unpublish_schedule.status'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $records
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unpublished schedules: ' . $e->getMessage()
            ], 500);
        }
    }
}