import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddShiftModal({ open, setOpen, modalShift, setModalShift, onSave }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
        </DialogHeader>

        {modalShift && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
              <input
                type="text"
                className="w-full border p-1 rounded"
                value={modalShift.shift_name || ""}
                onChange={(e) => setModalShift((prev) => ({ ...prev, shift_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                className="w-full border p-1 rounded"
                value={modalShift.department || ""}
                onChange={(e) => setModalShift((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  className="w-full border p-1 rounded"
                  value={modalShift.start_time || ""}
                  onChange={(e) => setModalShift((prev) => ({ ...prev, start_time: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  className="w-full border p-1 rounded"
                  value={modalShift.end_time || ""}
                  onChange={(e) => setModalShift((prev) => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input
                  type="text"
                  className="w-full border p-1 rounded"
                  value={modalShift.days || ""}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (From-To)</label>
                <input
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
        )}

        <DialogFooter>
          <Button onClick={onSave}>Save Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
