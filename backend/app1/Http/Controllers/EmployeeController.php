<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees (JSON for API).
     */
    public function index()
    {
        return response()->json(Employee::all());
    }


    /**
     * Store a newly created employee (API).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|max:20',
        ]);

        $employee = Employee::create($validated);

        return response()->json([
            'message' => 'Employee created successfully!',
            'employee' => $employee
        ], 201);
    }

    /**
     * Show a specific employee.
     */
    public function show(Employee $employee)
    {
        return response()->json($employee);
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:employees,email,' . $employee->id,
            'phone' => 'nullable|string|max:20',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|max:20',
        ]);

        $employee->update($validated);

        return response()->json([
            'message' => 'Employee updated successfully!',
            'employee' => $employee
        ]);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully!'
        ]);
    }
    /**
     * Clock in or out an employee.
     */
    public function clock(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'clock_type' => 'required|string|max:20',
            'clock_time' => 'required|date',
        ]);
    }
    /**
     * Get the attendance history of an employee.
     */
    public function getAttendanceHistory(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);
    }
    /**
     * Get details of a specific employee.
     */
    public function getEmployeeDetails($id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }
        return response()->json($employee);
    }
    /**
     * Update details of a specific employee.
     */
    public function updateEmployee(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'position' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:employees,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'hire_date' => 'nullable|date',
            'status' => 'nullable|string|max:20',
        ]);
    }
    /**
     * Delete a specific employee.
     */
    public function deleteEmployee(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
        ]);
    }
    /**
     * Request timesheet for an employee.
     */
    public function requestTimesheet(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'timesheet_data' => 'required|json',
            'request_date' => 'required|date',
        ]);
    }
    /**
     * Request leave for an employee.
     */
    public function requestLeave(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'leave_type' => 'required|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'reason' => 'required|string',
        ]);
    }
    /**
     * Request claim for an employee.
     */
    public function requestClaim(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'claim_type' => 'required|string|max:20',
            'amount' => 'required|numeric',
            'reason' => 'required|string',
        ]);
    }
    /**
     * Request swap schedule for an employee.
     */
    public function requestSwap(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:employees,id',
            'swap_type' => 'required|string|max:20',
            'swap_data' => 'required|json',
            'request_date' => 'required|date',
        ]);
    }

}