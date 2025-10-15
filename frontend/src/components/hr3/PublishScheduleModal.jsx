import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function PublishScheduleModal({ open, setOpen, id, onPublished }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    if (!id) {
      console.log("No schedule selected.");
      return;
    }
    setLoading(true);
    try {
      // Use the correct API endpoint
      const response = await axios.post(`/api/employee_schedule/${id}/publish`, { status: "publish" });
      alert(response.data?.message || "Schedule published successfully");
      if (onPublished) onPublished();
      setOpen(false);
    } catch (error) {
      console.error("Error publishing schedule:", error);
      console.log(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to publish schedule."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center">
          <p className="text-lg">Are you sure you want to publish this schedule?</p>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={loading}>{loading ? "Publishing..." : "Confirm"}</Button>
          <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}