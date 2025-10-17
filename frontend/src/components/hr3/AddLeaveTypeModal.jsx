import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddLeaveTypeModal({ open, onOpenChange, onSubmit, policyData, setPolicyData }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Leave Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Policy Name"
            value={policyData.name}
            onChange={e => setPolicyData({ ...policyData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={policyData.description}
            onChange={e => setPolicyData({ ...policyData, description: e.target.value })}
            required
          />
          <Input
            placeholder="Max Days"
            type="number"
            value={policyData.maxDays}
            onChange={e => setPolicyData({ ...policyData, maxDays: e.target.value })}
            required
          />
          <DialogFooter>
            <Button type="submit" className="bg-blue-500 text-white">Create Policy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}