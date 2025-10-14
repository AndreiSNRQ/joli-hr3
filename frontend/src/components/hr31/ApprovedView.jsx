import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function ApprovedView({ employee, open, onOpenChange }) {
  const [status, setStatus] = React.useState(Array.isArray(employee) ? employee[0]?.status || 'pending' : employee?.status || 'pending');
  const [isEditing, setIsEditing] = React.useState(false);

  // Function to update timesheet status
  const updateRequestStatus = async () => {
    try {
      alert(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update status');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[38rem]">
        <DialogHeader>
          <DialogTitle>{Array.isArray(employee) ? employee[0]?.employeeName : employee?.employeeName}</DialogTitle>
          <DialogDescription>
            <Table>
              <TableHeader>
                Approved Timesheet
              </TableHeader>
              <TableHead>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time-In</TableHead>
                  <TableHead>Start Break</TableHead>
                  <TableHead>End Break</TableHead>
                  <TableHead>Time-Out</TableHead>
                  <TableHead>Over Time</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>

                <TableRow className="font-normal">
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.date : employee?.date}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.timeIn : employee?.timeIn}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.startBreak : employee?.startBreak}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.endBreak : employee?.endBreak}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.timeOut : employee?.timeOut}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.overTime : employee?.overTime}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(employee) ? employee[0]?.total : employee?.total}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </DialogDescription>
        </DialogHeader>
        {/* Proposed Request */}
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription className="text-md">
              <div className="flex items-center">
                <h1 className="text-black font-semibold">Date:</h1>
                <p className="p-1 rounded-sm w-fit text-black" readOnly>{Array.isArray(employee) ? employee[0]?.reqdate : employee?.reqdate}</p>
              </div>
              <div className="flex items-center">
                <h1 className="text-black font-semibold">Type:</h1>
                <p className="p-1 rounded-sm w-fit text-black capitalize" readOnly>{Array.isArray(employee) ? employee[0]?.type : employee?.type}</p>
              </div>
              <div className="flex items-center">
                <h1 className="text-black font-semibold">Proposed Time:</h1>
                <p className="p-1 rounded-sm w-fit text-black" readOnly>{Array.isArray(employee) ? employee[0]?.propose : employee?.propose}</p>
              </div>
              <div className="flex ">
                <h1 className="text-black font-semibold">Reason:</h1>
                <p className="p-1 rounded-sm w-fit text-black capitalize">{Array.isArray(employee) ? employee[0]?.reason : employee?.reason}</p> 
              </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}