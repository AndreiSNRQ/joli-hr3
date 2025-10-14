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
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function TimesheetDialog({ employee, open, onOpenChange }) {
  const [status, setStatus] = React.useState(Array.isArray(employee) ? employee[0]?.status || 'pending' : employee?.status || 'pending');
  const [isEditing, setIsEditing] = React.useState(false);

  // Function to update timesheet status
  const updateTimesheetStatus = async () => {
    try {
      alert(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating timesheet status:', error);
      alert('Failed to update status');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full h-full">
      <DialogContent className="min-w-[50%] max-h-[80%]">
        <DialogHeader>
          <DialogTitle>{Array.isArray(employee) ? employee[0]?.employeeName : employee?.employeeName}'s Timesheet Details</DialogTitle>
          <DialogDescription>
            View timesheet details, including status, clock-in/out, and total hours. Fields are read-only as they are transferred from attendance records.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded p-1"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button onClick={updateTimesheetStatus}>
              Update Status
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Break In</TableHead>
                <TableHead>Break Out</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Total Hours</TableHead>
              </TableRow>
              {Array.isArray(employee) ? (
                employee.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.timeIn}</TableCell>
                    <TableCell>{record.breakIn}</TableCell>
                    <TableCell>{record.breakOut}</TableCell>
                    <TableCell>{record.timeOut}</TableCell>
                    <TableCell>{record.total}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell>{employee.date}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>{employee.timeIn}</TableCell>
                  <TableCell>{employee.breakIn}</TableCell>
                  <TableCell>{employee.breakOut}</TableCell>
                  <TableCell>{employee.timeOut}</TableCell>
                  <TableCell>{employee.total}</TableCell>
                </TableRow>
              )}
            </TableHeader>
            {Array.isArray(employee) && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Total Hours:
                  </TableCell>
                  <TableCell className="font-medium">
                    {(() => {
                      const totalMins = employee.reduce((sum, record) => sum + parseFloat(record.total || 0), 0);
                      return `${totalMins}mins`;
                    })()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className="flex justify-end space-x-2">
          {!isEditing && (!Array.isArray(employee) || employee.some(r => r.status === 'Pending')) ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Save logic would go here
                  setIsEditing(false);
                  onOpenChange(false);
                }}
              >
                Save Changes
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
      </div>
    </Dialog>
  );
}
