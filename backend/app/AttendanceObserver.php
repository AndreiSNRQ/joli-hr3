<?php

namespace App;

use App\Models\Attendance;
use App\Models\Timesheet;

class AttendanceObserver
{
    public function saved(Attendance $attendance)
    {
        
        // Only copy if all time fields are NOT NULL
        if ($attendance->clock_in && $attendance->clock_out && $attendance->break_start && $attendance->break_end) {
            // Check if timesheet already exists for this attendance
            if (!Timesheet::where('attendance_id', $attendance->attendance_id)->exists()) {
                Timesheet::create([
                    'employeeid' => $attendance->employee_id,
                    'attendance_id' => $attendance->attendance_id,
                    'total_hours' => self::calculateTotalHours($attendance),
                    'over_time' => self::calculateOverTime($attendance),
                    'status' => 'pending',
                ]);
            }
        }
    }

    private static function calculateTotalHours($attendance)
    {
        // Calculate total hours: (clock_out - clock_in) - (break_end - break_start)
        $clockIn = strtotime($attendance->clock_in);
        $clockOut = strtotime($attendance->clock_out);
        $breakStart = strtotime($attendance->break_start);
        $breakEnd = strtotime($attendance->break_end);

        // Handle overnight shifts
        if ($clockOut < $clockIn) {
            // Add 24 hours to clockOut
            $clockOut += 24 * 3600;
        }

        $workDuration = ($clockOut - $clockIn) / 3600;
        $breakDuration = ($breakEnd - $breakStart) / 3600;
        return round($workDuration - $breakDuration, 2);
    }

    private static function calculateOverTime($attendance)
    {
        $total = self::calculateTotalHours($attendance);
        return $total > 8 ? round($total - 8, 2) : 0;
    }
}