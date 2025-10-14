import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TimesheetDialog } from "@/components/hr3/timesheetDialog";
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";

// Table columns
const columns = [
  { id: "id", label: "ID" },
  { id: "employeeName", label: "Name" },
  { id: "department", label: "Department" },
  { id: "status", label: "Status" },
  { id: "action", label: "Action" },
];

// Default data in case API fails
const defaultData = [
  { id: 1, employeeName: "John Doe", department:"IT", date: "2023-01-01", status: "Pending", timeIn: "08:00", breakIn: "12:00", breakOut: "13:00", timeOut: "17:00", total: "8:00" },
  { id: 2, employeeName: "Jane Smith", department:"HR", date: "2023-01-01", status: "Approved", timeIn: "00:00", breakIn: "00:00", breakOut: "00:00", timeOut: "00:00", total: "00:00" },
];

// Group employees by first record
function getUniqueEmployees(data) {
  return data.reduce((acc, current) => {
    const x = acc.find((item) => item.employeeName === current.employeeName);
    return x ? acc : acc.concat([current]);
  }, []);
}

export default function Timesheet() {
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
      <h1 className="text-2xl font-bold mb-4">Employee Timesheet</h1>  
      <Table className="w-full h-full">
        <TableCaption>Timesheet Records</TableCaption>
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
              <TimesheetDialog
                employee={
                  showAllRecords
                    ? data.filter((r) => r.employeeName === row.employeeName)
                    : row
                }
                open={openDialog && selectedEmployee?.id === row.id}
                onOpenChange={setOpenDialog}
              />
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.employeeName}</TableCell>
              <TableCell>{row.department}</TableCell>
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
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(row)}
                >
                  Approve
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
