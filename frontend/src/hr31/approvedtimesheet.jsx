import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import{
  Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,
}from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApprovedView } from "@/components/hr3/ApprovedView";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";

// Table columns
const columns = [
  { id: "employeeName", label: "Name" },
  { id: "date", label: "Date" },
  { id: "timeIn", label: "Time In" },
  { id: "breakIn", label: "Break In" },
  { id: "breakOut", label: "Break Out" },
  { id: "timeOut", label: "Time Out" },
  { id: "total", label: "Total" },
  { id: "schedule", label: "Schedule Time" },
  { id: "status", label: "Status" },
  { id: "action", label: "Action" },
];

// Default data in case API fails
const defaultData = [
  { employeeName: "John Doe", date: "2023-01-01", timeIn: "08:00", breakIn: "12:00", breakOut: "13:00", timeOut: "17:00", total: "8:00", schedule: "8:00-17:00" },
];

// Group employees by first record
function getUniqueEmployees(data) {
  return data.reduce((acc, current) => {
    const x = acc.find((item) => item.employeeName === current.employeeName);
    return x ? acc : acc.concat([current]);
  }, []);
}

export default function ApprovedTimesheet() {
  const [data, setData] = useState([]);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  
  // Fetch timesheet data from backend
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const response = await axios.get(hr3.backend.api.timesheet);
        
        let records = [];
        if (Array.isArray(response.data)) {
          // plain array
          records = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // paginated response
          records = response.data.data;
        }
        
        const mappedRecords = records.map(record => ({
          id: record.id,
          employeeName: record.employeeName || 'Unknown',
          date: record.work_date || new Date().toISOString().split('T')[0],
          status: 'Pending',
          timeIn: record.start_time || '00:00',
          timeOut: record.end_time || '00:00',
          breakIn: '12:00',
          breakOut: '13:00',
          total: record.total_hours ? `${record.total_hours}:00` : '0:00'
        }));
        
        setData(mappedRecords.length > 0 ? mappedRecords : defaultData);
      } catch (error) {
        console.error("Error fetching timesheet:", error);
        setData(defaultData); // Use default data if API fails
      }
    };
    
    fetchTimesheet();
  }, []);

  const uniqueEmployees = getUniqueEmployees(data);

  const handleApprove = (row) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "Approved" } : item
      )
    );
  };

  return (
    <div className="h-full overflow-auto" style={{ maxHeight: "500px", overflowY: "auto" }}>
      <h1 className="text-2xl font-bold mb-4">Approved Timesheets</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">3</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">1</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-600">0</CardContent>
        </Card>
      </div>
      <Table className="w-full h-full">
        <TableCaption>Pending Timesheets</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {(showAllRecords
            ? data.filter((row) => row.employeeName === currentEmployee?.employeeName)
            : uniqueEmployees
          ).map((row) => (
            <TableRow key={row.id}>
              {/* Timesheet dialog per employee */}
              <ApprovedView
                employee={
                  showAllRecords
                    ? data.filter((r) => r.employeeName === row.employeeName)
                    : row
                }
                open={openDialog && selectedEmployee?.id === row.id}
                onOpenChange={setOpenDialog}
              />
              {selectedEmployee && (
                <ApprovedView
                  employee={data.filter((r) => r.employeeName === selectedEmployee.employeeName)}
                  open={openDialog}
                  onOpenChange={setOpenDialog}
                />
              )}
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.timeIn}</TableCell>
              <TableCell>{row.breakIn}</TableCell>
              <TableCell>{row.breakOut}</TableCell>
              <TableCell>{row.timeOut}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.schedule}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmployee(row);
                    setOpenDialog(true);
                    setCurrentEmployee(row);
                    setShowAllRecords(true);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(row)}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}