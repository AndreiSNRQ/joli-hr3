import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EditTimesheetModal({ open, onOpenChange, employee, onSave }) {
  const [formData, setFormData] = useState(employee);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-[50%] lg:max-w-[50%] xl:max-w-[50%] ">
        <DialogHeader>
          <DialogTitle>Edit Timesheet - {formData.employeeName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="flex justify-between">
            <label className="font-medium">Department:</label>
            <input
              type="text"
              className="border rounded-md px-2 py-1 w-40"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <label className="font-medium">Time In:</label>
            <input
              type="time"
              className="border rounded-md px-2 py-1 w-40"
              value={formData.timeIn}
              onChange={(e) => handleChange("timeIn", e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <label className="font-medium">Break In:</label>
            <input
              type="time"
              className="border rounded-md px-2 py-1 w-40"
              value={formData.breakIn}
              onChange={(e) => handleChange("breakIn", e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <label className="font-medium">Break Out:</label>
            <input
              type="time"
              className="border rounded-md px-2 py-1 w-40"
              value={formData.breakOut}
              onChange={(e) => handleChange("breakOut", e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <label className="font-medium">Time Out:</label>
            <input
              type="time"
              className="border rounded-md px-2 py-1 w-40"
              value={formData.timeOut}
              onChange={(e) => handleChange("timeOut", e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <label className="font-medium">Status:</label>
            <select
              className="border rounded-md px-2 py-1 w-40"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="Pending">🟡 Pending</option>
              <option value="Approved">🟢 Approved</option>
              <option value="Rejected">🔴 Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-blue-500 text-white" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
