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
                'employeeName' => $timesheet->employee->name ?? 'Unknown',
                'department' => $timesheet->employee->department ?? 'N/A',
                'position' => $timesheet->employee->position ?? 'N/A',
                'shift_name' => $timesheet->shift_name,
                'timeIn' => $timesheet->start_time ?? '00:00',
                'timeOut' => $timesheet->end_time ?? '00:00',
                'breakIn' => '12:00', // default value
                'breakOut' => '13:00', // default value
                'status' => $timesheet->status ?? 'pending',
                'total' => $timesheet->total_hours ? $timesheet->total_hours . ':00' : '0:00',
            ];
        });

        return response()->json($mapped);
    }
    public function attendanceToTimesheet($attendance_id)
    {
        $attendance = \App\Models\Attendance::with('employee')->find($attendance_id);
        if (!$attendance) {
            return response()->json(['message' => 'Attendance not found'], 404);
        }
        // Calculate total hours using AttendanceController logic
        $start = strtotime($attendance->clock_in);
        $end = strtotime($attendance->clock_out);
        $breakStart = $attendance->break_start ? strtotime($attendance->break_start) : null;
        $breakEnd = $attendance->break_end ? strtotime($attendance->break_end) : null;
        $breakDuration = 0;
        if ($breakStart && $breakEnd && $breakEnd > $breakStart) {
            $breakDuration = $breakEnd - $breakStart;
        }
        $diff = $end + $start - $breakDuration;
        $total = ($start && $end && $diff >= 0) ? gmdate('H:i', $diff) : '0:00';
        // Map attendance fields to timesheet format
        $mapped = [
            'attendance_id' => $attendance->attendance_id,
            'employeeName' => $attendance->employee->name ?? 'Unknown',
            'department' => $attendance->employee->department ?? 'N/A',
            'position' => $attendance->employee->position ?? 'N/A',
            'shift_name' => $attendance->employee->shift_name ?? 'N/A',
            'timeIn' => $attendance->clock_in ?? '00:00',
            'timeOut' => $attendance->clock_out ?? '00:00',
            'breakIn' => $attendance->break_start ?? '00:00',
            'breakOut' => $attendance->break_end ?? '00:00',
            'status' => $attendance->clock_in ? 'Present' : 'Absent',
            'total' => $total,
        ];
        return response()->json($mapped);
    }
    public function update(Request $request, $id)
    {
        // Find by primary key (timesheet_id)
        $timesheet = Timesheet::where('id', $id)->firstOrFail();
        $status = $request->input('status');
        if ($status) {
            $timesheet->status = $status;
            $timesheet->save();
            return response()->json(['message' => 'Timesheet status updated successfully', 'status' => $timesheet->status]);
        }
        return response()->json(['message' => 'Status not provided'], 400);
    }
}