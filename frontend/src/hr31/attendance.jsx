import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react";
import AddAttendance from "@/components/hr3/AddAttendance";
import ExportData from "@/components/hr3/ExportData";
import ApproveAdjustments from "@/components/hr3/ApproveAdjustments";
import { hr3 } from "@/api/hr3";
import axios from "axios";
import TermsDialog from "@/components/hr3/TermsDialog";
import RequestCorrectionAttendance from "@/components/hr3/RequestCorrectionAttendance";



export default function Attendance() {
  const columns = [
    { id: "name", label: "Employee Name" },
    { id: "date", label: "Date" },
    { id: "timeIn", label: "Time In" },
    { id: "breakStart", label: "Start Break" },
    { id: "breakEnd", label: "End Break" },
    { id: "timeOut", label: "Time Out" },
    { id: "total", label: "Total" },
    { id: "status", label: "Status" },
    { id: "schedule", label: "Schedule Time" },
    { id: "actions", label: "Action" },
  ];

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

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

  const handleSubmit = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((req) =>
        req.id === selectedRequest.id ? { ...req, status: actionStatus } : req
      )
    );
    closeModal();
  };
  useEffect(() => {
    // Fetch attendance
    axios.get(hr3.backend.api.attendance)
      .then((response) => {
        const attendanceData = response.data;
        // Format time fields to 12-hour format with AM/PM from full datetime strings
        const formatTime = (datetimeStr) => {
          if (!datetimeStr) return '';
          const timeStr = datetimeStr.includes(' ') ? datetimeStr.split(' ')[1] : datetimeStr;
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };
        setData(attendanceData.map(item => ({
          ...item,
          timeIn: formatTime(item.timeIn),
          breakStart: formatTime(item.breakStart),
          breakEnd: formatTime(item.breakEnd),
          timeOut: formatTime(item.timeOut)
        })));
      })
      .catch((error) => {
        console.error("Error fetching attendance data:", error);
      });
    // Fetch schedules
    axios.get(hr3.backend.api.schedule)
      .then((response) => {
        let schedulesList = [];
        if (response.data.success && Array.isArray(response.data.data)) {
          schedulesList = response.data.data;
        } else if (Array.isArray(response.data)) {
          schedulesList = response.data;
        }
        setSchedules(schedulesList);
      })
      .catch((error) => {
        console.error("Error fetching schedules:", error);
      });
  }, []);

  // Calculate summary values
  const totalEmployees = data.length;
  const presentCount = data.filter(item => item.status === 'Present').length;
  const absentCount = data.filter(item => item.status === 'Absent').length;
  const lateCount = data.filter(item => item.status === 'Late').length;
  const leaveCount = data.filter(item => item.status === 'Leave').length;
  const adjustmentsCount = data.filter(item => item.status === 'Adjustment').length;

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // map statuses to badge colors
  const statusVariant = {
    Present: "success",
    Absent: "destructive",
    Late: "secondary",
    Leave: "default",
    Adjustment: "secondary",
  };

  // Helper to get schedule time from shift_id
  const getScheduleTime = (shift_id) => {
    const schedule = schedules.find(s => s.id === shift_id || s.schedule_id === shift_id);
    if (schedule) {
      return `${schedule.time_start} - ${schedule.time_end}`;
    }
    return "-";
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Present</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">{presentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Absent</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">{absentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Late</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-600">{lateCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>On Leave</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-blue-600">{leaveCount}</CardContent>
        </Card>
      </div>

      {/* Actions + Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 sticky top-0 bg-white z-10 py-2">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Add Attendance</Button>
            </DialogTrigger>
            <AddAttendance />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Export Data</Button>
            </DialogTrigger>
            <ExportData />
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full"
          />
          <Button variant="outline" className="rounded-full">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto rounded-lg border max-h-[500px]">
        <Table className="w-full ">
          <TableCaption>Attendance Records</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              {columns.map((column) => (
                <TableHead key={column.id}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.attendance_id} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.id === "schedule"
                      ? getScheduleTime(row.shift_id)
                      : column.id === "status"
                        ? <Badge variant={statusVariant[row.status] || "default"}>{row[column.id]}</Badge>
                        : row[column.id]
                    }
                    {column.id === "actions" ? (
                      <div className="flex gap-2 ">
                        <Button variant="outline" className="p-2 px-4" onClick={() => { setEditRow(row); setEditModalOpen(true); }}>Update</Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="mx-1" variant="outline">Request Correction</Button>
                          </DialogTrigger>
                          <RequestCorrectionAttendance request={row} />
                        </Dialog>
                      </div>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editModalOpen && (
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <div className="p-6 bg-white rounded shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Edit Attendance</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Collect updated fields
              const updatedRow = {
                ...editRow,
                timeIn: e.target.timeIn.value || editRow.timeIn,
                breakStart: e.target.breakStart.value || editRow.breakStart,
                breakEnd: e.target.breakEnd.value || editRow.breakEnd,
                timeOut: e.target.timeOut.value || editRow.timeOut,
                status: e.target.status.value || editRow.status,
              };
              try {
                await axios.put(`${hr3.backend.api.attendance}/${editRow.attendance_id}`, updatedRow);
                alert('Attendance updated successfully!');
                setEditModalOpen(false);
              } catch (error) {
                alert('Failed to update attendance.');
              }
            }}>
              <label className="block mb-2">Time In
                <input name="timeIn" defaultValue={editRow?.timeIn || ''} className="border p-2 w-full" />
              </label>
              <label className="block mb-2">Break Start
                <input name="breakStart" defaultValue={editRow?.breakStart || ''} className="border p-2 w-full" />
              </label>
              <label className="block mb-2">Break End
                <input name="breakEnd" defaultValue={editRow?.breakEnd || ''} className="border p-2 w-full" />
              </label>
              <label className="block mb-2">Time Out
                <input name="timeOut" defaultValue={editRow?.timeOut || ''} className="border p-2 w-full" />
              </label>
              <label className="block mb-2">Status
                <input name="status" defaultValue={editRow?.status || ''} className="border p-2 w-full" />
              </label>
              <div className="flex gap-2 mt-4">
                <Button type="submit" variant="outline">Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}
const handleUpdate = async (row) => {
  console.log('Updating row:', row); // Debug statement
  try {
    await axios.put(`${hr3.backend.api.attendance}/${row.attendance_id}`, row);
    alert('Attendance updated successfully!');
  } catch (error) {
    console.error('Error updating attendance:', error);
    alert('Failed to update attendance.');
  }
};