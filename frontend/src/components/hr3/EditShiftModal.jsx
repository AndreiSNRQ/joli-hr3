import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditShiftModal({
  open,
  setOpen,
  modalShift,
  setModalShift,
  employees,
  getAvailableEmployees,
  onCreate,
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>

        {modalShift && (
          <>
            <div className="space-y-3">
              <div>
                <label htmlFor="shift_name" className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input
                  id="shift_name"
                  type="text"
                  className="w-full border p-1 rounded"
                  value={modalShift.shift_name || ""}
                  onChange={(e) => setModalShift((prev) => ({ ...prev, shift_name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                    id="department"
                    type="text"
                    className="w-full border p-1 rounded"
                    value={modalShift.department || ''}
                    onChange={(e) => setModalShift((prev) => ({ ...prev, department: e.target.value }))}
                    />
                </div>
                <div>
                    <label htmlFor="heads" className="block text-sm font-medium text-gray-700 mb-1">Head Counts</label>
                    <input
                    id="heads"
                    type="text"
                    className="w-full border p-1 rounded"
                    value={modalShift.heads || ''}
                    readOnly
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    id="start_time"
                    type="time"
                    className="w-full border p-1 rounded"
                    value={modalShift.start_time || ""}
                    onChange={(e) => setModalShift((prev) => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    id="end_time"
                    type="time"
                    className="w-full border p-1 rounded"
                    value={modalShift.end_time || ""}
                    onChange={(e) => setModalShift((prev) => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <input
                    id="days"
                    type="text"
                    className="w-full border p-1 rounded"
                    value={modalShift.days || ""}
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    id="duration"
                    type="text"
                    className="w-full border p-1 rounded"
                    value={
                      modalShift.start_date && modalShift.end_date
                        ? `${modalShift.start_date} - ${modalShift.end_date}`
                        : ""
                    }
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* ✅ Employee Checklist */}
            <div>
              <label htmlFor="assigned_employees" className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Assign Employees
              </label>
              <div className="border rounded p-2 grid grid-cols-2 max-h-40 overflow-y-auto">
                {(Array.isArray(modalShift.department)
                  ? employees.filter(emp => modalShift.department.includes(emp.department))
                  : employees.filter(emp => emp.department === modalShift.department)
                )
                .map((emp) => {
                  const assigned = modalShift.assigned_employees || [];
                  const isChecked = assigned.some((e) => e.employee_id === emp.employee_id);
                  const maxReached = assigned.length >= (modalShift.heads || 1);
                  return (
                    <div key={emp.employee_id} className="flex items-center mb-1">
                      <input
                        id={`assigned_employee_${emp.employee_id}`}
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isChecked && maxReached}
                        onChange={(e) => {
                          setModalShift((prev) => {
                            const assigned = prev.assigned_employees || [];
                            if (e.target.checked) {
                              if (assigned.length < (prev.heads || 1)) {
                                return { ...prev, assigned_employees: [...assigned, emp] };
                              } else {
                                return prev;
                              }
                            } else {
                              return {
                                ...prev,
                                assigned_employees: assigned.filter(
                                  (a) => a.employee_id !== emp.employee_id
                                ),
                              };
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      <span>
                        {emp.name} ({emp.department})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <DialogFooter>
  <Button onClick={() => {
    if (window.confirm('Are you sure you want to save changes to this shift?')) {
      onCreate({
        ...modalShift,
        assigned_employees: (modalShift.assigned_employees || []).map(emp => ({
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department
        })),
        shift_name: modalShift.shift_name,
        type: modalShift.type || modalShift.shift_name,
        heads: modalShift.heads || 1,
        days: modalShift.days,
        time_start: modalShift.start_time,
        time_end: modalShift.end_time,
        date_from: modalShift.start_date,
        date_to: modalShift.end_date,
        department: modalShift.department,
      });
    }
  }}>Save Changes</Button>
</DialogFooter>

      </DialogContent>
    </Dialog>
  );
}