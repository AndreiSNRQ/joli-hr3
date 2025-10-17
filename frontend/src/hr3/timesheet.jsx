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
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";
import EditTimesheetModal from "@/components/hr3/EditTimesheetModal";

const defaultData = [
  { id: 1, employeeName: "John Doe", department: "IT", status: "Pending", timeIn: "08:00", breakIn: "12:00", breakOut: "13:00", timeOut: "17:00", total: "8:00" },
  { id: 2, employeeName: "Jane Smith", department: "HR", status: "Approved", timeIn: "09:00", breakIn: "12:00", breakOut: "13:00", timeOut: "18:00", total: "8:00" },
  { id: 3, employeeName: "Alex Cruz", department: "Finance", status: "Rejected", timeIn: "08:30", breakIn: "12:00", breakOut: "13:00", timeOut: "17:30", total: "8:00" },
];

export default function Timesheet() {
  const [data, setData] = useState([]);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [filterDept, setFilterDept] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch data
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const response = await axios.get(hr3.backend.api.timesheet);
        let records = [];

        if (Array.isArray(response.data)) records = response.data;
        else if (response.data && Array.isArray(response.data.data)) records = response.data.data;

        const mappedRecords = records.map(record => ({
          id: record.id,
          employeeName: record.employeeName || "Unknown",
          department: record.department || "N/A",
          status: record.status || "Pending",
          timeIn: record.start_time || "00:00",
          timeOut: record.end_time || "00:00",
          breakIn: "12:00",
          breakOut: "13:00",
          total: record.total_hours ? `${record.total_hours}:00` : "0:00"
        }));

        setData(mappedRecords.length > 0 ? mappedRecords : defaultData);
      } catch (error) {
        console.error("Error fetching timesheet:", error);
        setData(defaultData);
      }
    };

    fetchTimesheet();
  }, []);

  // Filtered data
  const filteredData = data.filter(row =>
    row.department.toLowerCase().includes(filterDept.toLowerCase()) &&
    row.employeeName.toLowerCase().includes(filterName.toLowerCase()) &&
    (filterStatus === "" || row.status.toLowerCase() === filterStatus.toLowerCase())
  );

  const handleApprove = async (row) => {
    try {
      // Send status update to backend
      await axios.put(`${hr3.backend.api.timesheet}/${row.id}`, { status: "Approve" });
      setData(prev => prev.map(item =>
        item.id === row.id ? { ...item, status: "Approved" } : item
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleEdit = (row) => {
    setSelectedEmployee(row);
    setOpenEditModal(true);
  };

  return (
    <div className="px-4 -mt-5">
      <h1 className="text-2xl font-bold mb-4">Timesheet</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded-md px-3 py-2 w-48"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by department..."
          className="border rounded-md px-3 py-2 w-48"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 w-48"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approve">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border min-h-[700px] max-h-[700px]">
        <Table className="w-full">
          <TableCaption>Timesheet Records</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-center">#</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Time In</TableHead>
              <TableHead className="text-center">Break In</TableHead>
              <TableHead className="text-center">Break Out</TableHead>
              <TableHead className="text-center">Time Out</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-center">{row.id}</TableCell>
                <TableCell className="text-center">{row.employeeName}</TableCell>
                <TableCell className="text-center">{row.department}</TableCell>
                <TableCell className="text-center">{row.timeIn}</TableCell>
                <TableCell className="text-center">{row.breakIn}</TableCell>
                <TableCell className="text-center">{row.breakOut}</TableCell>
                <TableCell className="text-center">{row.timeOut}</TableCell>
                <TableCell className="text-center">{row.total}</TableCell>
                <TableCell className="text-center">{row.status}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mx-1"
                    onClick={() => handleApprove(row)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mx-1"
                    onClick={() => handleEdit(row)} disabled
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <div className="w-full justify-center flex">
        <p
          className="text-sm text-blue-500 py-5 cursor-pointer"
          onClick={() => setOpenTermsDialog(true)}
        >
          Terms & Conditions
        </p>
      </div> */}

      <TermsDialog open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
      {selectedEmployee && (
        <EditTimesheetModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          employee={selectedEmployee}
          onSave={(updated) => {
            setData(prev =>
              prev.map(item => item.id === updated.id ? updated : item)
            );
          }}
        />
      )}
    </div>
  );
}