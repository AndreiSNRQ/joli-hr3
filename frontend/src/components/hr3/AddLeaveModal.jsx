import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function AddLeaveModal({ open, onOpenChange, onSubmit, leaveData, setLeaveData }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Leave Request</DialogTitle>
          <DialogDescription>Fill out the form to request leave.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="font-bold">Employee Name</label>
            <Input
              type="text"
              value={leaveData.employee}
              onChange={e => setLeaveData({ ...leaveData, employee: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-bold">Leave Type</label>
            <Input
              type="text"
              value={leaveData.type}
              onChange={e => setLeaveData({ ...leaveData, type: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-bold">Start Date</label>
            <Input
              type="date"
              value={leaveData.startDate}
              onChange={e => setLeaveData({ ...leaveData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-bold">End Date</label>
            <Input
              type="date"
              value={leaveData.endDate}
              onChange={e => setLeaveData({ ...leaveData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="font-bold">Reason</label>
            <Textarea
              value={leaveData.reason}
              onChange={e => setLeaveData({ ...leaveData, reason: e.target.value })}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="default">Submit</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}