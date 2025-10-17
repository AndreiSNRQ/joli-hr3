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
import UpdateAttendanceModal from "@/components/hr3/UpdateAttendanceModal";



export default function Attendance() {
  const columns = [
    { id: "name", label: "Employee Name" },
    { id: "date", label: "Date" },
    { id: "timeIn", label: "Time In" },
    { id: "breakStart", label: "Start Break" },
    { id: "breakEnd", label: "End Break" },
    { id: "timeOut", label: "Time Out" },
    { id: "total", label: "Total"},
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
    axios.get(hr3.backend.api.employee_schedule)
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
    <div className="px-4">
      <h1 className="text-2xl font-bold -mt-5 mb-4">Attendance</h1>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-blue-700">{presentCount}</span>
                <span className="text-sm text-blue-700">Present</span>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 hover:bg-green-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-green-700">{absentCount}</span>
                <span className="text-sm text-green-700">Absent</span>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 hover:bg-red-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-red-700">{lateCount}</span>
                <span className="text-sm text-red-700">Late</span>
              </CardContent>
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
                        {/* <Dialog>
                          <DialogTrigger asChild>
                            <Button className="mx-1" variant="outline">Request Correction</Button>
                          </DialogTrigger>
                          <RequestCorrectionAttendance request={row} />
                        </Dialog> */}
                      </div>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Edit Attendance Modal */}
      {editModalOpen && (
        <UpdateAttendanceModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          editRow={editRow}
          setEditRow={setEditRow}
          onSave={async (e) => {
            e.preventDefault();
            try {
              // Helper to convert 12-hour time (e.g. "9:30 AM") to 24-hour ("09:30")
              const to24Hour = (time) => {
                if (!time) return '';
                // If already in HH:mm format, return as is
                if (/^\d{2}:\d{2}$/.test(time)) return time;
                // If in 12-hour format
                const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (!match) return '';
                let [_, hour, minute, ampm] = match;
                hour = parseInt(hour, 10);
                if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
                if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
                return `${hour.toString().padStart(2, '0')}:${minute}`;
              };
              const payload = {
                employee_id: editRow.employee_id,
                clock_in: to24Hour(editRow.timeIn),
                clock_out: to24Hour(editRow.timeOut),
                break_start: to24Hour(editRow.breakStart),
                break_end: to24Hour(editRow.breakEnd),
                status: editRow.status,
                // date: editRow.date, // only if needed
              };
              const response = await axios.put(`${hr3.backend.api.attendance}/${editRow.attendance_id}`, payload);
              toast.success('Attendance updated successfully!');
              setEditModalOpen(false);
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
              setData(data.map(d => d.attendance_id === editRow.attendance_id ? updatedRecord : d));
            } catch (error) {
              console.error('Failed to update attendance:', error);
              toast.error('Failed to update attendance.');
            }
          }}
        />
      )}
      {/* <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div> */}
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}