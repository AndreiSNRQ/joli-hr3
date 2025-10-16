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


// Default data in case API fails
const defaultData = [
  { employeeName: "John Doe", department:"IT", type: "Contract"},
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

  const [filterStatus, setFilterStatus] = useState("");
  const [filterName, setFilterName] = useState("");

  return (
    <div className="h-full overflow-auto -mt-5 px-4">
      <h1 className="text-2xl font-bold mb-4">Approved Timesheets</h1>
      {/* Summary Cards */}
          {/* <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-blue-700">{data.filter(l => l.status === 'Pending').length}</span>
                <span className="text-sm text-blue-700">Pending</span>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-green-700">{data.filter(l => l.status === 'Approved').length}</span>
                <span className="text-sm text-green-700">Approved</span>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-red-700">{data.filter(l => l.status === 'Rejected').length}</span>
                <span className="text-sm text-red-700">Rejected</span>
              </CardContent>
            </Card>
          </div> */}
      <div className="overflow-auto rounded-lg px-3 border min-h-[750px] max-h-[800px]">
        <div className="flex gap-4 my-4">
          <input
          type="text"
          placeholder="Search by name..."
          className="border rounded-md px-3 py-2 w-48"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          />
          <select
            className="border rounded-md px-3 py-2 w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
  
      <Table className="w-full">
        <TableCaption>Pending Timesheets</TableCaption>
        <TableHeader className="bg-gray-100">
          <TableCell>Name</TableCell>
          <TableCell>Department</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Action</TableCell>
        </TableHeader>
        <TableBody className="bg-white p-2">
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
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.type}</TableCell>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}