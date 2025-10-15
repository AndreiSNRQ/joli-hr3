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
                    'type' => $shift->type,
                    'heads' => $shift->heads,
                    'days' => $shift->days,
                    'department' => $shift->department,
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
            'type' => 'string|max:100',
            'heads' => 'integer',
            'days' => 'string|max:100', // Added days field
            'department' => 'string|max:100', // Added department field
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'date_start' => 'date',
            'date_end' => 'date|after_or_equal:date_start'
        ]);

        // Determine shift type based on start_time (if provided)
        if (isset($validated['time_start'])) {
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
        } else {
            $type = $validated['type'] ?? 'custom';
        }

        $shift = Shift::create([
            'type' => $type,
            'heads' => $validated['heads'] ?? 1,
            'days' => $validated['days'] ?? null, // Added days field
            'department' => $request->input('department') ?? null, // Added department field
            'time_start' => $validated['time_start'] ?? null,
            'time_end' => $validated['time_end'] ?? null,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'shift_name' => $request->input('shift_name') ?? $type
        ]);

        // Do NOT assign employees here. Just save the shift.

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

    public function shiftDataOnly()
    {
        try {
            $records = Shift::all();

            if ($records->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No shifts found',
                    'data' => []
                ]);
            }

            $mapped = $records->map(function ($shift) {
                return [
                    'id' => $shift->shift_id,
                    'shift_name' => $shift->shift_name,
                    'type' => $shift->type,
                    'heads' => $shift->heads,
                    'department' => $shift->department,
                    'days' => $shift->days,
                    'time_start' => $shift->time_start,
                    'time_end' => $shift->time_end,
                    'date_from' => $shift->date_from,
                    'date_to' => $shift->date_to,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mapped
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch shift data: ' . $e->getMessage()
            ], 500);
        }
    }
    public function destroy($id)
    {
        $shift = Shift::find($id);
        if (!$shift) {
            return response()->json(['success' => false, 'message' => 'Shift not found'], 404);
        }
        $shift->delete();
        return response()->json(['success' => true, 'message' => 'Shift deleted successfully']);
    }
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'string|max:100',
            'heads' => 'integer',
            'days' => 'string|max:100',
            'department' => 'string|max:100',
            'time_start' => 'required|date_format:H:i',
            'time_end' => 'required|date_format:H:i|after:time_start',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'shift_name' => 'string|max:100',
        ]);

        $shift = Shift::find($id);
        if (!$shift) {
            \Log::error('Shift not found for update', ['id' => $id, 'request' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Shift not found'], 404);
        }

        try {
            $shift->update($validated);
            \Log::info('Shift updated successfully', ['id' => $id, 'data' => $validated]);
            return response()->json(['success' => true, 'message' => 'Shift updated successfully', 'shift' => $shift]);
        } catch (\Exception $e) {
            \Log::error('Error updating shift', ['id' => $id, 'error' => $e->getMessage(), 'request' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Error updating shift', 'error' => $e->getMessage()], 500);
        }
    }
}