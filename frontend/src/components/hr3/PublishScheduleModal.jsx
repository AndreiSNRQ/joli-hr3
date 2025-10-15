import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { hr3 } from "@/api/hr3";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PublishScheduleModal({ open, setOpen, schedule }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Details</DialogTitle>
        </DialogHeader>
        {schedule ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input type="text" className="w-full border p-1 rounded" value={schedule.shift_name || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input type="text" className="w-full border p-1 rounded" value={schedule.type || ""} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" className="w-full border p-1 rounded" value={schedule.department || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heads</label>
                <input type="text" className="w-full border p-1 rounded" value={schedule.heads || ""} readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Employees</label>
              <div className="border rounded p-2 bg-gray-50">
                {Array.isArray(schedule.assigned_employees) && schedule.assigned_employees.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {schedule.assigned_employees.map((emp, idx) => (
                      <li key={idx}>
                        {emp.name || emp.employee_name || emp.employee_id}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" className="w-full border p-1 rounded" value={schedule.start_time || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input type="time" className="w-full border p-1 rounded" value={schedule.end_time || ""} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input type="text" className="w-full border p-1 rounded" value={Array.isArray(schedule.days) ? schedule.days.join(", ") : schedule.days || ""} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (From-To)</label>
                <input type="text" className="w-full border p-1 rounded" value={schedule.start_date && schedule.end_date ? `${formatDate(schedule.start_date)} - ${formatDate(schedule.end_date)}` : ""} readOnly />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No schedule selected.</div>
        )}
        <DialogFooter>
          <Button onClick={() => {
            // Transfer logic: create a copy of the record in the schedule table
            if (schedule) {
              // Prepare payload for schedule table
              const payload = {
                shift_name: schedule.shift_name,
                type: schedule.type,
                heads: schedule.heads,
                department: Array.isArray(schedule.department) ? schedule.department.join(",") : schedule.department,
                days: Array.isArray(schedule.days) ? schedule.days.join(",") : schedule.days,
                time_start: schedule.start_time,
                time_end: schedule.end_time,
                date_from: schedule.start_date,
                date_to: schedule.end_date,
                employee_ids: schedule.assigned_employees,
              };
              // Send to backend
              axios.post(hr3.backend.api.schedule, payload)
                .then(() => {
                  toast.success("Record transferred to schedule table!");
                  setOpen(false);
                })
                .catch(() => {
                  toast.error("Failed to transfer record.");
                });
            }
          }}>Transfer</Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add date formatting helper at the top
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}