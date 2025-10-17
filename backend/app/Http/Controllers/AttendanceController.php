<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $employeeId = $request->query('employee_id');
        $query = Attendance::with('employee');
        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }
        $records = $query->get();

        $mapped = $records->map(function ($attendance) {
            $total = $this->calculateHours(
                $attendance->clock_in,
                $attendance->clock_out,
                $attendance->break_start,
                $attendance->break_end
            );

            return [
                'attendance_id' => $attendance->attendance_id,
                'name' => $attendance->employee->name ?? 'Unknown',
                'employee_id' => $attendance->employee_id,
                'date' => $attendance->date ?? $attendance->created_at?->toDateString() ?? 'N/A',
                'timeIn' => $attendance->clock_in,
                'breakStart' => $attendance->break_start,
                'breakEnd' => $attendance->break_end,
                'timeOut' => $attendance->clock_out,
                'total' => $total,
                'status' => $attendance->clock_in ? 'Present' : 'Absent',
            ];
        });

        return response()->json($mapped);
    }

    // Calculate Time
    private function calculateHours($clockIn, $clockOut, $break_in, $break_out)
    {
        if (!$clockIn || !$clockOut) return "0:00";
        $start = strtotime($clockIn);
        $end = strtotime($clockOut);
        $breakStart = $break_in ? strtotime($break_in) : null;
        $breakEnd = $break_out ? strtotime($break_out) : null;

        $breakDuration = 0;
        if ($breakStart && $breakEnd && $breakEnd > $breakStart) {
            $breakDuration = $breakEnd - $breakStart;
        }

        $diff = $end + $start - $breakDuration;
        if ($diff < 0) {
            return "0:00";
        }

        return gmdate("H:i", $diff);
    }

    private function getStatus($item)
    {
        if (!$item->clock_in && !$item->clock_out) return "Absent";
        if ($item->clock_in > "08:15:00") return "Late";
        return "Present";
    }

    // POST /api/attendance
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'clock_in'    => 'nullable|date_format:H:i',
            'clock_out'   => 'nullable|date_format:H:i',
            'break_start' => 'nullable|date_format:H:i',
            'break_end'   => 'nullable|date_format:H:i',
        ]);

        // Set date to now if not provided
        $validated['date'] = now()->toDateString();

        // Check if employee already has attendance for today
        $existing = Attendance::where('employee_id', $validated['employee_id'])
            ->whereDate('created_at', now()->toDateString())
            ->first();
        if ($existing) {
            return response()->json([
                'message' => $existing->employee->name . ' already has an attendance record for today.',
                'attendance_id' => $existing->attendance_id,
            ], 409);
        }

        $attendance = Attendance::create($validated);
        
        // Reload the attendance with employee relation
        $attendance = Attendance::with('employee')->find($attendance->attendance_id);
        
        // Format the response to match the index method
        $total = $this->calculateHours(
            $attendance->clock_in,
            $attendance->clock_out,
            $attendance->break_start,
            $attendance->break_end
        );
        
        $formattedAttendance = [
            'attendance_id' => $attendance->attendance_id,
            'name' => $attendance->employee->name ?? 'Unknown',
            'employee_id' => $attendance->employee_id,
            'timeIn' => $attendance->clock_in,
            'breakStart' => $attendance->break_start,
            'breakEnd' => $attendance->break_end,
            'timeOut' => $attendance->clock_out,
            'total' => $total,
            'status' => $this->getStatus($attendance),
        ];

        return response()->json($formattedAttendance, 201);
    }

    public function update(Request $request, $attendance_id)
    {
        $attendance = Attendance::findOrFail($attendance_id);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            //'date'        => 'nullable|date', // removed, date will be auto-filled
            'clock_in'    => 'nullable|date_format:H:i',
            'clock_out'   => 'nullable|date_format:H:i',
            'break_start' => 'nullable|date_format:H:i',
            'break_end'   => 'nullable|date_format:H:i',
        ]);

        // Format time fields to 'Y-m-d H:i:s' if present
        $currentDate = date('Y-m-d');
        foreach (['clock_in', 'clock_out', 'break_start', 'break_end'] as $field) {
            if (isset($validated[$field]) && $validated[$field]) {
                // If already contains date, leave as is
                if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $validated[$field])) {
                    $validated[$field] = $currentDate . ' ' . $validated[$field] . ':00';
                }
            }
        }
        $validated['created_at'] = now();
        $attendance->update($validated);
        
        // Reload the attendance with employee relation
        $attendance = Attendance::with('employee')->find($attendance->attendance_id);
        
        // Format the response to match the index method
        $total = $this->calculateHours(
            $attendance->clock_in,
            $attendance->clock_out,
            $attendance->break_start,
            $attendance->break_end
        );
        
        $formattedAttendance = [
            'attendance_id' => $attendance->attendance_id,
            'name' => $attendance->employee->name ?? 'Unknown',
            'employee_id' => $attendance->employee_id,
            'date' => $attendance->date ?? $attendance->created_at?->toDateString() ?? 'N/A',
            'timeIn' => $attendance->clock_in,
            'breakStart' => $attendance->break_start,
            'breakEnd' => $attendance->break_end,
            'timeOut' => $attendance->clock_out,
            'total' => $total,
            'status' => $this->getStatus($attendance),
        ];

        return response()->json($formattedAttendance);
    }
    // GET /api/attendance/{attendance_id}
    public function show($attendance_id)
    {
        $attendance = Attendance::with('employee')->find($attendance_id);
        if (!$attendance) {
            return response()->json(['message' => 'Attendance not found'], 404);
        }
        $total = $this->calculateHours(
            $attendance->clock_in,
            $attendance->clock_out,
            $attendance->break_start,
            $attendance->break_end
        );
        $formattedAttendance = [
            'attendance_id' => $attendance->attendance_id,
            'name' => $attendance->employee->name ?? 'Unknown',
            'employee_id' => $attendance->employee_id,
            'date' => $attendance->date ?? $attendance->created_at?->toDateString() ?? 'N/A',
            'timeIn' => $attendance->clock_in,
            'breakStart' => $attendance->break_start,
            'breakEnd' => $attendance->break_end,
            'timeOut' => $attendance->clock_out,
            'total' => $total,
            'status' => $this->getStatus($attendance),
        ];
        return response()->json($formattedAttendance);
    }
}