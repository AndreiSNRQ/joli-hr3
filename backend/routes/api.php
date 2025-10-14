<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\ClaimsController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TimesheetController;
// use App\Http\Controllers\UnpublishScheduleController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\EmployeeScheduleController;
use App\Http\Controllers\AttendanceCorrectionRequestController;


//ESS
use App\Http\Controllers\EmployeesController;

Route::get('/hello', function () {
    return 'Hello World!';
});

//ESS
Route::middleware(['auth:sanctum'])->group(function () {
    // Employee routes
    Route::post('/employee/clock', [EmployeesController::class, 'clock']);
    Route::get('/employee/{employee_id}/attendance', [EmployeesController::class, 'getAttendanceHistory']);
    Route::get('/employee/{employee_id}', [EmployeesController::class, 'getEmployeeDetails']);
    Route::put('/employee/{employee_id}', [EmployeesController::class, 'updateEmployee']);
    Route::delete('/employee/{employee_id}', [EmployeesController::class, 'deleteEmployee']);
    Route::post('/employee/request_timesheet', [EmployeesController::class, 'requestTimesheet']);
    Route::post('/employee/request_leave', [EmployeesController::class, 'requestLeave']);
    Route::post('/employee/request_claim', [EmployeesController::class, 'requestClaim']);
    Route::post('/employee/request_swap', [EmployeesController::class, 'requestSwap']);
});
//EMPLOYEE
Route::resource('employees', EmployeeController::class);

// Attendance
Route::get('/attendance', [AttendanceController::class, 'index']);
Route::post('/attendance', [AttendanceController::class, 'store']);
Route::put('/attendance/{attendance_id}', [AttendanceController::class, 'update']);
// Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy']);
// attendnce request
Route::apiResource('/attendance-correction-request',AttendanceCorrectionRequestController::class);
// Route::get('/attendance-correction-request', [AttendanceCorrectionRequestController::class, 'index']);



// TIMESHEET
Route::get('/timesheet', [TimesheetController::class, 'index']);
Route::post('/timesheet', [TimesheetController::class, 'store']);

// SHIFT AND SCHEDULE
Route::get('/schedule', [ScheduleController::class, 'index']);
Route::post('/employee-schedule', [EmployeeScheduleController::class, 'store']);
Route::get('/shift', [ShiftController::class, 'index']);
Route::post('/shift', [ShiftController::class, 'store']);
// shift data only
Route::get('/shift_data_only', [ShiftController::class, 'shiftDataOnly']);
Route::delete('/shift/{id}', [ShiftController::class, 'destroy']);
Route::get('/publish-schedule', [ScheduleController::class, 'getPublishedSchedules']);
Route::post('/publish-schedule-detailed', [ScheduleController::class, 'publishScheduleDetailed']);

// LEAVE MANAGEMENT
Route::get('/leave', [LeaveController::class, 'index']);
Route::post('/leave', [LeaveController::class, 'store']);


// CLAIMS AND REIMBURSEMENTS
Route::get('/claims', [ClaimsController::class, 'index']);
Route::post('/claims', [ClaimsController::class, 'store']);