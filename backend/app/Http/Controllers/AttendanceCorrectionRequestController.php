<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AttendanceCorrectionRequest;
use Illuminate\Http\Request;

class AttendanceCorrectionRequestController extends Controller
{
    // 🟢 Fetch all requests
    // public function index()
    // {
    //     $requests = AttendanceCorrectionRequest::with(['employee', 'attendance'])->get();

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Attendance correction requests retrieved successfully.',
    //         'data' => $requests
    //     ]);
    // }
    public function index(Request $request)
    {
        try {
            // Optionally, filter by employee_id or status
            $query = AttendanceCorrectionRequest::with(['employee', 'attendance']);

            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Attendance correction requests fetched successfully.',
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch attendance correction requests.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🟢 Fetch a single request by ID
    public function show($id)
    {
        $request = AttendanceCorrectionRequest::with(['employee', 'attendance'])->find($id);

        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance correction request not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Attendance correction request retrieved successfully.',
            'data' => $request
        ]);
    }

    // 🟢 Create a new request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|integer|exists:employees,employee_id',
            'date' => 'required|date',
            'type' => 'required|in:clock_in,clock_out,break_in,break_out',
            'proposed_time' => 'required|date_format:H:i',
            'reason' => 'nullable|string',
            'attendance_id' => 'nullable|integer|exists:attendance,attendance_id'
        ]);

        $correction = AttendanceCorrectionRequest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Attendance correction request created successfully.',
            'data' => $correction
        ], 201);
    }

    // 🟢 Update an existing request
    public function update(Request $request, $id)
    {
        $correction = AttendanceCorrectionRequest::find($id);

        if (!$correction) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance correction request not found.'
            ], 404);
        }

        $validated = $request->validate([
            'employee_id' => 'sometimes|integer|exists:employees,employee_id',
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:clock_in,clock_out,break_in,break_out',
            'proposed_time' => 'sometimes|date_format:H:i',
            'reason' => 'nullable|string',
            'status' => 'sometimes|in:pending,approved,rejected',
            'attendance_id' => 'nullable|integer|exists:attendance,attendance_id'
        ]);

        $correction->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Attendance correction request updated successfully.',
            'data' => $correction
        ]);
    }

    // 🟢 Delete a request
    public function destroy($id)
    {
        $correction = AttendanceCorrectionRequest::find($id);

        if (!$correction) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance correction request not found.'
            ], 404);
        }

        $correction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attendance correction request deleted successfully.'
        ]);
    }
}
