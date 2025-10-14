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
import toast from "react-hot-toast";
import AddAttendance from "@/components/hr3/AddAttendance";
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

  // Helper to get schedule time from employee_id
  const getScheduleTime = (employee_id) => {
    const schedule = schedules.find(s => s.employee_id === employee_id);
    if (schedule) {
      return `${schedule.time_start} - ${schedule.time_end}`;
    }
    return "-";
  };

  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold -mt-5 mb-4">Attendance</h1>

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

          <Button variant="outline">Export Data</Button>
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
      <div className="overflow-auto rounded-lg border min-h-[510px] max-h-[510px]">
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
                      ? getScheduleTime(row.employee_id)
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
              try {
                // The backend expects H:i format, but the state is in 12-hour format.
                // This needs to be converted before sending.
                // For now, we assume the input is correct or will be handled.
                const response = await axios.put(`${hr3.backend.api.attendance}/${editRow.attendance_id}`, editRow);
                toast.success('Attendance updated successfully!');
                setEditModalOpen(false);

                // Format the response for display before updating state
                const formatTime = (datetimeStr) => {
                  if (!datetimeStr) return '';
                  const timeStr = datetimeStr.includes(' ') ? datetimeStr.split(' ')[1] : datetimeStr;
                  const [hours, minutes] = timeStr.split(':');
                  const hour = parseInt(hours, 10);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const hour12 = hour % 12 || 12;
                  return `${hour12}:${minutes} ${ampm}`;
                };
                const updatedRecord = { ...response.data, timeIn: formatTime(response.data.timeIn), breakStart: formatTime(response.data.breakStart), breakEnd: formatTime(response.data.breakEnd), timeOut: formatTime(response.data.timeOut) };

                // Refresh data
                setData(data.map(d => d.attendance_id === editRow.attendance_id ? updatedRecord : d));
              } catch (error) {
                console.error('Failed to update attendance:', error);
                toast.error('Failed to update attendance.');
              }
            }}>
              <label className="block mb-2">Time In<input name="timeIn" value={editRow?.timeIn || ''} onChange={(e) => setEditRow({ ...editRow, timeIn: e.target.value })} className="border p-2 w-full" /></label>
              <label className="block mb-2">Break Start<input name="breakStart" value={editRow?.breakStart || ''} onChange={(e) => setEditRow({ ...editRow, breakStart: e.target.value })} className="border p-2 w-full" /></label>
              <label className="block mb-2">Break End<input name="breakEnd" value={editRow?.breakEnd || ''} onChange={(e) => setEditRow({ ...editRow, breakEnd: e.target.value })} className="border p-2 w-full" /></label>
              <label className="block mb-2">Time Out<input name="timeOut" value={editRow?.timeOut || ''} onChange={(e) => setEditRow({ ...editRow, timeOut: e.target.value })} className="border p-2 w-full" /></label>
              <label className="block mb-2">Status<input name="status" value={editRow?.status || ''} onChange={(e) => setEditRow({ ...editRow, status: e.target.value })} className="border p-2 w-full" /></label>
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