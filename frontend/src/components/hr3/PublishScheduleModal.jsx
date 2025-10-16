import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { hr3 } from "@/api/hr3";

export default function PublishScheduleModal({ open, setOpen, id, onPublished }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!id) {
      toast.error("No schedule ID provided.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Correct: matches Route::post('/employee_schedule/{id}/publish', ...)
      const url = `${hr3.backend.uri}/api/employee_schedule/${id}/publish`;

      const response = await axios.post(url);
      alert("Schedule published successfully!");

      if (onPublished) onPublished(response.data);
      setOpen(false);
    } catch (error) {
      console.error("Error publishing schedule:", error);
      alert("Failed to publish schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-lg">Are you sure you want to publish this schedule?</p>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? "Publishing..." : "Confirm"}
            </Button>
            <Button onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}