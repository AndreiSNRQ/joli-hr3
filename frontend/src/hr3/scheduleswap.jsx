import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RequestView } from "@/components/hr3/requestView";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";

// Table columns
const columns = [
  { id: "employeeName", label: "Name" },
  { id: "date", label: "Request Date" },
  { id: "type", label: "Current Shift" },
  { id: "propose", label: "Proposed Shift" },
  { id: "status", label: "Status" },
  { id: "action", label: "Action" },
];

// Default data in case API fails
const defaultData = [
  {id:"1", employeeName: "John Doe", reqdate: "01-15-2025", type: "time-in", propose: "08:00", reason: "Work",status: "Pending", date: "01-01-2025", timeIn:"08:30",startBreak:"12:00",endBreak:"12:30",timeOut:"17:00",overTime:"00:30",total:"07:30" },
  {id:"2", employeeName: "Jane Smith", reqdate: "01-16-2025", type: "time-out", propose: "17:30", reason: "dsfsdfd ddfdfderf feferrff gegvmlvkdfm vvverdverdver vrseverfdv vferdfververdfv verdverervfrev verververv vdreverdverv ",status: "Pending", date: "01-01-2025", timeIn:"08:00",startBreak:"12:00",endBreak:"12:30",timeOut:"17:00",overTime:"00:00",total:"08:00" },
  {id:"3", employeeName: "Alice Brown", reqdate: "01-17-2025", type: "time-in", propose: "09:00", reason: "Traffic",status: "Pending", date: "01-01-2025", timeIn:"09:15",startBreak:"12:30",endBreak:"13:00",timeOut:"18:00",overTime:"00:45",total:"07:45" },
  {id:"4", employeeName: "Bob Lee", reqdate: "01-18-2025", type: "time-out", propose: "18:00", reason: "Overtime",status: "Pending", date: "01-01-2025", timeIn:"08:00",startBreak:"12:00",endBreak:"12:30",timeOut:"18:00",overTime:"01:00",total:"09:00" },
  {id:"5", employeeName: "Maria Garcia", reqdate: "01-19-2025", type: "time-in", propose: "08:30", reason: "Medical",status: "Pending", date: "01-01-2025", timeIn:"08:45",startBreak:"12:00",endBreak:"12:30",timeOut:"17:00",overTime:"00:15",total:"07:45" },
];

// Group employees by first record
function getUniqueEmployees(data) {
  return data.reduce((acc, current) => {
    const x = acc.find((item) => item.employeeName === current.employeeName);
    return x ? acc : acc.concat([current]);
  }, []);
}

export default function scheduleswap() {
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
          type: record.type,
          propose: record.propose,
          status: 'Pending',
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

  const handleReject = (row) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, status: "Rejected" } : item
      )
    );
  };

  return (
    <div className="-mt-5">
      <div>
        <h1 className="text-2xl font-bold mb-4">Schedule Swap Request</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">
              {data.filter((row) => row.status === "Pending").length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-yellow-600">
              {data.filter((row) => row.status === "Approved").length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Rejected</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">
              {data.filter((row) => row.status === "Rejected").length}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="h-full overflow-auto" style={{ maxHeight: "500px", overflowY: "auto" }}>
        <Table className="w-full h-full">
          <TableCaption>Correction Requests</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <RequestView
                  employee={row}
                  open={openDialog && selectedEmployee?.id === row.id}
                  onOpenChange={setOpenDialog}
                />
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell className="capitalize">{row.type}</TableCell>
                <TableCell>{row.propose}</TableCell>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(row)}
                  >
                    Reject
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