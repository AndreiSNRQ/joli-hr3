import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select,SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

export default function AddLeaveTypeModal({ open, onOpenChange, onSubmit, policyData, setPolicyData }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Leave Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Type Name"
            value={policyData.name}
            onChange={e => setPolicyData({ ...policyData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Eligibility"
            value={policyData.eligible}
            onChange={e => setPolicyData({ ...policyData, eligible: e.target.value })}
            required
          />
          <Input
            placeholder="5"
            type="number"
            value={policyData.duration}
            onChange={e => setPolicyData({ ...policyData, duration: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={policyData.description}
            onChange={e => setPolicyData({ ...policyData, description: e.target.value })}
            required
          />
          <select className="border rounded-md px-3 py-2 w-full" name="pay" id="">
            <option className="text-gray-500" value="">Select Pay</option>
            <option value="Full Pay">Full Pay</option>
            <option value="Half Pay">Half Pay</option>
            <option value="No Pay">No Pay</option>
          </select>

          <DialogFooter>
            <Button type="submit" className="bg-blue-500 text-white">Create Policy</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}