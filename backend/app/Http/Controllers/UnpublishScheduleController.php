<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class UnpublishScheduleController extends Controller
{
    public function index()
    {
        // Join unpublish_schedule with shift and schedule_employee
        $unpublished = DB::table('unpublish_schedule')
            ->where('unpublish_schedule.status', 'not active')
            ->join('shift', 'unpublish_schedule.shift_id', '=', 'shift.shift_id')
            ->join('schedule_employee', 'unpublish_schedule.schedule_employee_id', '=', 'schedule_employee.id')
            ->join('employees', 'schedule_employee.employee_id', '=', 'employees.employee_id')
            ->select(
                'unpublish_schedule.id as unpublish_id',
                'shift.*',
                'schedule_employee.*',
                'employees.name as employee_name',
                'employees.department as employee_department'
            )
            ->get();

        return response()->json($unpublished);
    }
}