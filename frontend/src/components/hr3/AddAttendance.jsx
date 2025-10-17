import axios from "axios";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { HR3_API } from "@/api/axios";
import { hr3 } from "@/api/hr3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddAttendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [formData, setFormData] = useState({
    timeIn: "",
    timeOut: "",
    breakIn: "",
    breakOut: ""
  });

  useEffect(() => {
  console.log("Employees array:", employees);
  console.log("Selected employee value:", selectedEmployee);
  if (selectedEmployee) {
    const employee = employees.find(emp => String(emp.employee_id) === String(selectedEmployee));
    console.log("Matched employee:", employee);
    setSelectedEmployeeDetails(employee);
  } else {
    setSelectedEmployeeDetails(null);
  }
}, [selectedEmployee, employees]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await HR3_API.get(hr3.backend.api.employees);
        if (!response.data) {
          throw new Error('No data received from API');
        }
        const employeesData = Array.isArray(response.data) ? response.data : [response.data];
        setEmployees(
          employeesData
            .filter(emp => emp.employee_id !== undefined && emp.employee_id !== null)
            .map(emp => ({
              employee_id: emp.employee_id,
              name: emp.name ?? `Employee ${emp.employee_id}`,
              department: emp.department ?? `No Department ${emp.employee_id}`,
            }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const departments = Array.from(new Set(employees.map(emp => emp.department))).map((dept, idx) => ({ id: idx, name: dept }));
  
  const filteredEmployees = Array.isArray(employees)
    ? employees
        .filter(emp => !selectedDepartment || emp.department === departments.find(d => String(d.id) === String(selectedDepartment))?.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      employee_id: selectedEmployee,
      clock_in: formData.timeIn || null
    };
    if (formData.timeOut) payload.clock_out = formData.timeOut;
    if (formData.breakIn) payload.break_start = formData.breakIn;
    if (formData.breakOut) payload.break_end = formData.breakOut;
    // create_at is omitted so backend can use now()
    const response = await axios.post(hr3.backend.api.attendance, payload);
    if (response.status === 201) {
      const data = response.data;
      alert(`Attendance Submitted`);
      window.location.reload();
    }
  } catch (error) {
    console.error('Error creating attendance:', error);
    alert(`Error creating attendance: ${error.response?.data?.message || error.message}`);
  }
};


  useEffect(() => {
    if (selectedEmployee) {
      axios.get(`${hr3.backend.api.attendance}?employee_id=${selectedEmployee}`)
        .then(response => {
          // Ensure attendanceRecords is always an array
          const data = response.data;
          if (Array.isArray(data)) {
            setAttendanceRecords(data);
          } else if (data && Array.isArray(data.records)) {
            setAttendanceRecords(data.records);
          } else if (data) {
            setAttendanceRecords([data]);
          } else {
            setAttendanceRecords([]);
          }
        })
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
      const employee = employees.find(emp => String(emp.employee_id) === String(selectedEmployee));
      setSelectedEmployeeDetails(employee);
    } else {
      setSelectedEmployeeDetails(null);
    }
  }, [selectedEmployee, employees]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Attendance</DialogTitle>
        <DialogDescription>
          Fill out the form to add a new attendance record.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Employee</label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <Select onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={`dept-${dept.id}`} value={String(dept.id)}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map(employee => (
                  <SelectItem key={`employee-${employee.employee_id}`} value={String(employee.employee_id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedEmployeeDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium">{selectedEmployeeDetails.name}</h4>
              <h4 className="font-medium">Department: {selectedEmployeeDetails.department}</h4>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Time In</label>
            <Input type="time" value={formData.timeIn} onChange={(e) => setFormData({...formData, timeIn: e.target.value})}/>
          </div>
          
          <div>
            <label className="block mb-2">Break In</label>
            <Input 
              type="time" 
              value={formData.breakIn}
              onChange={(e) => setFormData({...formData, breakIn: e.target.value})}
            />
          </div>
          
        </div>
        
        <div className="grid grid-cols-2 gap-4">          
          <div>
            <label className="block mb-2">Break Out</label>
            <Input 
              type="time" 
              value={formData.breakOut}
              onChange={(e) => setFormData({...formData, breakOut: e.target.value})}
            />
          </div>

          <div>
            <label className="block mb-2">Time Out</label>
            <Input 
              type="time" 
              value={formData.timeOut}
              onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
            />
          </div>          
        </div>
        
        <Button type="submit">Submit</Button>
      </form>
    </DialogContent>
  );
}