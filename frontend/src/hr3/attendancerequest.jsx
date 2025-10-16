import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TermsDialog from "@/components/hr3/TermsDialog";
import { hr3 } from "@/api/hr3";

function AttendanceRequest() {
  const analytics = {
    pending: 5,
    approvedToday: 3,
    rejectedToday: 1,
    totalThisMonth: 20,
  };

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  // ✅ Fetch data from backend
  useEffect(() => {
    fetch(hr3.backend.api.attendance_correction_requests)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          setRequests(result.data);
        } else {
          console.error("Failed to load:", result.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance correction requests:", error);
      });
  }, []);

  // ✅ Modal controls
  const openModal = (request) => {
    setSelectedRequest(request);
    setActionStatus("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleActionChange = (status) => {
    setActionStatus(status);
  };

  const handleSubmit = async () => {
    if (!selectedRequest) return;
    // If status is approved, update attendance record
    if (actionStatus === "approved") {
      try {
        await fetch(hr3.backend.api.attendance_update, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendance_id: selectedRequest.attendance_id,
            [selectedRequest.type]: selectedRequest.proposed_time
          })
        });
      } catch (err) {
        console.error("Failed to update attendance record", err);
      }
    }
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: actionStatus } : req
      )
    );
    closeModal();
  };

  const statusVariant = {
    pending: "secondary",
    approved: "success",
    rejected: "destructive",
  };

  return (
    <div className="p-4 -mt-9">
      <h1 className="text-2xl font-bold mb-6">Attendance Requests</h1>

      {/* Summary Cards*/}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-blue-700">{requests.filter(l => l.status === 'Pending').length}</span>
                <span className="text-sm text-blue-700">Pending</span>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 hover:bg-green-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-green-700">{requests.filter(l => l.status === 'Approved').length}</span>
                <span className="text-sm text-green-700">Approved</span>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 hover:bg-red-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-red-700">{requests.filter(l => l.status === 'Rejected').length}</span>
                <span className="text-sm text-red-700">Rejected</span>
              </CardContent>
            </Card>
          </div>

      {/* Table Section */}
      <div className="overflow-auto rounded-lg border min-h-[570px] max-h-[580px]">
        <Table className="w-full">
          <TableCaption>Attendance Requests</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-center">#</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Proposed</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} className="hover:bg-gray-50">
                <TableCell className="text-center">{req.id}</TableCell>
                <TableCell className="text-center">
                  {req.employee?.name || req.employee_id}
                </TableCell>
                <TableCell className="text-center">{req.date}</TableCell>
                <TableCell className="text-center">{req.type

                }</TableCell>
                <TableCell className="text-center">{req.proposed_time}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusVariant[req.status] || "default"}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    className="mx-1"
                    size="sm"
                    onClick={() => openModal(req)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Update Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <div className="space-y-3">
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedRequest.employee?.full_name ||
                      selectedRequest.employee_id}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedRequest.date}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedRequest.type}
                  </p>
                  <p>
                    <strong>Proposed:</strong> {selectedRequest.proposed_time}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </p>

                  <div className="flex items-center gap-2">
                    <strong>New Status:</strong>
                    <Select
                      value={actionStatus}
                      onValueChange={handleActionChange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button onClick={handleSubmit} disabled={!actionStatus}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={closeModal}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="w-full justify-center flex">
        <p
          className="text-sm text-blue-500 py-5 cursor-pointer"
          onClick={() => setOpenTermsDialog(true)}
        >
          Terms & Conditions
        </p>
      </div>
      <TermsDialog
        className="w-full"
        open={openTermsDialog}
        onOpenChange={setOpenTermsDialog}
      />
    </div>
  );
}

export default AttendanceRequest;