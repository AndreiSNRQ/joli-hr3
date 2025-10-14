import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Table,TableBody,TableCaption,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";

export default function RequestCorrectionAttendance({ request }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [formData, setFormData] = useState({
    date: request?.date || "",
    type: request?.type || "",
    proposed_time: request?.proposed || "",
    reason: request?.reason || "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/employees');
        if (!response.data) {
          throw new Error('No data received from API');
        }
        const employeesData = Array.isArray(response.data) ? response.data : [response.data];
        setEmployees(employeesData.map(emp => ({
          id: emp.id,
          name: emp.name || emp.full_name || `Employee ${emp.id}`,
          department: emp.department || 'N/A',
          position: emp.position || 'N/A'
        })));
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = Array.isArray(employees) 
    ? employees.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for attendance correction request
      const payload = {
        employee_id: request?.employee_id || selectedEmployee,
        date: formData.date,
        type: formData.type,
        proposed_time: formData.proposed_time,
        reason: formData.reason,
        status: "pending",
        attendance_id: request?.id || request?.attendance_id || null
      };
      // Send POST request to backend
      const response = await axios.post("http://localhost:8095/api/attendance-correction-request", payload);
      if (response.status === 200 || response.status === 201) {
        alert("Attendance correction request submitted successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error submitting correction request:", error);
      alert(`Error submitting correction request: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      axios.get(`/attendance?employee_id=${selectedEmployee}`)
        .then(response => setAttendanceRecords(response.data))
        .catch(error => {
          console.error("Error fetching attendance:", error);
          setAttendanceRecords([]);
        });
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      setSelectedEmployeeDetails(employee);
    } else {
      setSelectedEmployeeDetails(null);
    }
  }, [selectedEmployee, employees]);

  return (
    <div className="w-full">
    <DialogContent className="min-w-[30%]">
      <DialogHeader>
        <DialogTitle>Correction of {request.name} Attendance</DialogTitle>
        <DialogDescription>
          <Table>
            <TableCaption>Saved Attendance Data</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Break Start</TableHead>
                <TableHead>Break End</TableHead>
                <TableHead>Time Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request && (
                <TableRow>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{request.timeIn}</TableCell>
                  <TableCell>{request.breakStart}</TableCell>
                  <TableCell>{request.breakEnd}</TableCell>
                  <TableCell>{request.timeOut}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="P-4">
          <label className="block mb-2">Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger className="w-full">
              <SelectValue  placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clock_in">Clock In</SelectItem>
              <SelectItem value="break_in">Break Start</SelectItem>
              <SelectItem value="break_out">Break End</SelectItem>
              <SelectItem value="clock_out">Clock Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4 P-4">
          <div>
            <label className="block mb-2">Proposed Time:</label>
            <Input 
              type="time" 
              value={formData.proposed_time}
              onChange={(e) => setFormData({...formData, proposed_time: e.target.value})}/>
          </div>
          <div>
            <label className="block mb-2">Reason:</label>
            <Input 
              type="text" 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </DialogContent>
    </div>
  );
}