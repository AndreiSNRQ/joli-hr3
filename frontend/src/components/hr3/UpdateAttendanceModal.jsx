import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function UpdateAttendanceModal({ open, onOpenChange, editRow, setEditRow, onSave }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Update the attendance record below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Clock In</label>
              <Input
                type="time"
                value={editRow?.timeIn || ''}
                onChange={e => setEditRow({ ...editRow, timeIn: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2">Break Start</label>
              <Input
                type="time"
                value={editRow?.breakStart || ''}
                onChange={e => setEditRow({ ...editRow, breakStart: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Break End</label>
              <Input
                type="time"
                value={editRow?.breakEnd || ''}
                onChange={e => setEditRow({ ...editRow, breakEnd: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2">Clock Out</label>
              <Input
                type="time"
                value={editRow?.timeOut || ''}
                onChange={e => setEditRow({ ...editRow, timeOut: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2">Status</label>
            <Input
              name="status"
              value={editRow?.status || ''}
              onChange={e => setEditRow({ ...editRow, status: e.target.value })}
              className="border p-2 w-full"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}