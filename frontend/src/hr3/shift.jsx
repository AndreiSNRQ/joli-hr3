import React, { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableCell, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TermsDialog from "@/components/hr3/TermsDialog";


/* -------------------------- Dummy Employees -------------------------- */
const Employees = [
  { id: 1, name: "John Doe", department: "IT", role: "Developer" },
  { id: 2, name: "Jane Smith", department: "IT", role: "System Admin" },
  { id: 3, name: "Alice Johnson", department: "IT", role: "Help Desk" },
  { id: 4, name: "Bob Wilson", department: "Sales/Support", role: "Sales Rep" },
  { id: 5, name: "Carol Brown", department: "Sales/Support", role: "Support Agent" },
  { id: 6, name: "Dave Miller", department: "Sales/Support", role: "Support Agent" },
  { id: 7, name: "Eve Thomas", department: "HR", role: "HR Manager" },
  { id: 8, name: "Frank White", department: "HR", role: "HR Assistant" },
  { id: 9, name: "Grace Lee", department: "Finance", role: "Accountant" },
  { id: 10, name: "Henry Clark", department: "Finance", role: "Payroll" },
  { id: 11, name: "Dr. Irene Gray", department: "ER", role: "Doctor" },
  { id: 12, name: "Jack Green", department: "ER", role: "Nurse" },
  { id: 13, name: "Karen Hall", department: "ER", role: "Nurse" },
];

const shift=[
  {
    id: 1,
    name: "Day Shift",
    startTime: "09:00",
    endTime: "17:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    date_from: "2025-08-31",
    date_to: "2025-09-06",
  },
  {
    id: 2,
    name: "Night Shift",
    startTime: "17:00",
    endTime: "09:00",
    days: ["Saturday", "Sunday"],
    date_from: "2025-08-31",
    date_to: "2025-09-06",
  },
  {
    id: 3,
    name: "Custom Shift",
    startTime: "",
    endTime: "",
    days: [],
  }
]
const schedule_employee=[
  {
    id: 1,
    schedule_id: 1,
    shift_id: 1,
    employee_id: 1,
  },
  {
    id: 2,
    schedule_id: 1,
    shift_id: 1,
    employee_id: 2,
  },
  {
    id: 3,
    schedule_id: 1,
    shift_id: 1,
    employee_id: 3,
  },
]

const schedule=[
  {
    id: 1,
    schedule_id:1,
    shift_id: 1,

  },
]

/* -------------------------- Helpers -------------------------- */
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const deptLexicon = [
  { rx: /\b(hr|human\s*resources)\b/i, label: "HR" },
  { rx: /\b(it|tech|engineering|developer|engineer|sysadmin|help\s*desk)\b/i, label: "IT" },
  { rx: /\b(sales|marketing|customer\s*(service|support)|call\s*center|support)\b/i, label: "Logistics" },
  { rx: /\b(er|emergency|ward|triage|clinic|nurse|doctor)\b/i, label: "ER" },
  { rx: /\b(finance|accounting|payroll)\b/i, label: "Finance" },
];

/* -------------------------- AI Analysis -------------------------- */
function analyzeShift(input) {
  const text = input.toLowerCase();
  const now = new Date();

  let result = {
    shift_name: "Custom Shift",
    start_time: "",
    end_time: "",
    department: [], // multiple department
    headcount: 1,
    days: [],
    description: "",
    start_date: "",
    end_date: "",
  };

  // Detect time
  const timeRegex = /(\d{1,2})(am|pm)?\s*[-–to]+\s*(\d{1,2})(am|pm)?/i;
  const timeMatch = input.match(timeRegex);
  if (timeMatch) {
    let [_, sh, sm, eh, em] = timeMatch;
    const to24 = (h, m) => {
      let hour = parseInt(h, 10);
      if (m?.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (m?.toLowerCase() === "am" && hour === 12) hour = 0;
      return hour.toString().padStart(2, "0") + ":00";
    };
    result.start_time = to24(sh, sm);
    result.end_time = to24(eh, em);
  }

  // Detect days
  for (let d of DAYS) {
    if (text.includes(d.toLowerCase().slice(0, 3))) {
      result.days.push(d);
    }
    }
  if (result.days.length === 0) {
    result.days = DAYS;
  }

  // Detect department (multiple allowed)
  for (let dept of deptLexicon) {
    if (dept.rx.test(text)) {
      if (!result.department.includes(dept.label)) {
        result.department.push(dept.label);
      }
    }
  }

  // If no department found → default to ALL
  if (result.department.length === 0) {
    result.department = deptLexicon.map((d) => d.label);
  }

  // Detect headcount
  const countMatch = input.match(/\b(\d+)\s*(staff|people|employees?|person)?/i);
  if (countMatch) {
    result.headcount = parseInt(countMatch[1], 10);
  }

  // Detect duration (weeks)
  let weeks = 1;
  const weekMatch = input.match(/(\d+)\s*weeks?/i);
  if (weekMatch) weeks = parseInt(weekMatch[1], 10);

  // Smart start/end date alignment
  if (result.days.length > 0) {
    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const todayIdx = now.getDay();
    const firstDayIdx = daysOfWeek.indexOf(result.days[0]);
    const lastDayIdx = daysOfWeek.indexOf(result.days[result.days.length - 1]);

    let diff = (firstDayIdx - todayIdx + 7) % 7;
    if (diff === 0) diff = 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diff);

    const lastDiff = (lastDayIdx - firstDayIdx + 7) % 7;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (weeks - 1) * 7 + lastDiff);

    result.start_date = startDate.toISOString().slice(0, 10);
    result.end_date = endDate.toISOString().slice(0, 10);
  }

  // Build shift name (list department)
  result.shift_name = `${result.department.join(", ")} Shift`;

  result.description =
    `Shift from ${result.start_time || "N/A"} to ${result.end_time || "N/A"} on ` +
    `${result.days.length ? result.days.join(",") : "N/A"} for ${result.headcount} staff. ` +
    `Department: ${result.department.join(", ")}. ` +
    `Duration: ${result.start_date} → ${result.end_date}`;

  return {
    recommendations: [result],
  };
}



/* -------------------------- Component -------------------------- */
export default function Schedule() {
  /* -------------------------- Employee Filtering -------------------------- */
  const getAvailableEmployees = (department) => {
    if (!department || department.length === 0) return employees;
    return employees.filter((emp) => department.includes(emp.department));
  };

  const [employees, setEmployees] = useState([]);
  const [aiText, setAiText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [publishingShifts, setPublishingShifts] = useState([]);
  const [publishedShifts, setPublishedShifts] = useState([]);
  const [unpublishedShifts, setUnpublishedShifts] = useState([]);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  
  // Fetch employees and their schedules from backend
  useEffect(() => {
    const fetchEmployeesAndSchedules = async () => {
      try {
        // Fetch employees first
        const employeesResponse = await axios.get(hr3.backend.api.employees);
        let employeesList = [];
        
        if (!employeesResponse.data) {
          throw new Error('Invalid employees API response');
        }
        
        if (Array.isArray(employeesResponse.data)) {
          employeesList = employeesResponse.data;
        } else if (employeesResponse.data && Array.isArray(employeesResponse.data.data)) {
          employeesList = employeesResponse.data.data;
        } else {
          throw new Error('Unexpected employees data format');
        }
        setEmployees(employeesList);

        // Then fetch schedules
        const schedulesResponse = await axios.get(hr3.backend.api.schedule);
        let schedulesList = [];
        
        if (!schedulesResponse.data.success) {
          throw new Error(schedulesResponse.data.message || 'Failed to fetch schedules');
        }
        
        if (Array.isArray(schedulesResponse.data.data)) {
          schedulesList = schedulesResponse.data.data;
        } else if (Array.isArray(schedulesResponse.data)) {
          schedulesList = schedulesResponse.data;
        }
        setPublishedShifts(schedulesList);

        // Fetch unpublished schedules (robust handling)
        const unpublishedResponse = await axios.get(hr3.backend.api.unpublish_schedule);
        let unpublishedList = [];

        if (Array.isArray(unpublishedResponse.data)) {
          unpublishedList = unpublishedResponse.data;
        } else if (Array.isArray(unpublishedResponse.data?.data)) {
          unpublishedList = unpublishedResponse.data.data;
        }

        if (unpublishedList.length > 0) {
          setUnpublishedShifts(unpublishedList);
          console.log("✅ Loaded unpublished shifts:", unpublishedList);
        }} catch (error) {
  console.error('Error fetching employees or schedules:', error);
  toast.error('Failed to fetch employees or schedules. Please try again.');
}

    };
    fetchEmployeesAndSchedules();
  }, []);

  // Additional states for modal and history
  const [modalShift, setModalShift] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [openModal, setOpenModal] = React.useState(false);

  const runAnalysis = () => {
    if (!aiText.trim()) return;
    const res = analyzeShift(aiText);
    setAiResult(res);
  };

  const handleOpenPublishModal = (shift, index = null) => {
    setModalShift({
      ...shift,
      assigned_employees: Array.isArray(shift.assigned_employees) 
        ? [...shift.assigned_employees.filter(e => e && e.employee_id)] 
        : [],
      headcount: shift.headcount || 1,
      department: [...(shift.department || ['General'])],
      days: [...(shift.days || [0,1,2,3,4])],
      start_date: shift.start_date || new Date().toISOString().split('T')[0],
      end_date: shift.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setEditingIndex(index);
    setOpenModal(true);
  };

  const savePublishing = async () => {
    if (!modalShift) {
      console.error('No modalShift data available');
      return;
    }
    
    // Validate required fields
    if (!modalShift.shift_name) {
      toast.error('Shift type is required');
      console.log('Validation failed: Shift type is required');
      return;
    }
    
    if (!modalShift.start_time || !modalShift.end_time) {
      toast.error('Start and end times are required');
      console.log('Validation failed: Start and end times are required');
      return;
    }
    
    if (!modalShift.start_date || !modalShift.end_date) {
      toast.error('Start and end dates are required');
      console.log('Validation failed: Start and end dates are required');
      return;
    }
    
    // Validate at least one employee is selected
    const hasSelectedEmployees = modalShift.assigned_employees && 
      modalShift.assigned_employees.length > 0 &&
      modalShift.assigned_employees.some(emp => emp && emp.employee_id !== '');
    
    if (!hasSelectedEmployees) {
      // Check if there are any selected employees that might not be in the array yet
      const selectedCount = Array.from(document.querySelectorAll('select[id^="employeeSelect-"]'))
        .filter(select => select.value !== '').length;
      
      if (selectedCount === 0) {
        toast.error('At least one employee must be selected');
        console.log('Validation failed: No valid employees selected', modalShift.assigned_employees);
        return;
      }
    }
    
    // Create a deep copy of the modalShift state including selected employees
    const cleanedShift = JSON.parse(JSON.stringify({
      ...modalShift,
      assigned_employees: modalShift.assigned_employees
        ? modalShift.assigned_employees
            .filter(Boolean)
            .map(emp => ({...emp})) // Create new employee objects
        : [],
      // Include any selected employees from dropdowns that haven't been added to state yet
      ...(Array.from(document.querySelectorAll('select[id^="employeeSelect-"]'))
        .filter(select => select.value !== '')
        .reduce((acc, select, i) => {
          const emp = employees.find(e => e.employee_id === select.value);
          if (emp) {
            if (!acc.assigned_employees) acc.assigned_employees = [];
            acc.assigned_employees[i] = {...emp};
          }
          return acc;
        }, {}))
    }));

    try {
      // Post to backend
      const response = await axios.post(hr3.backend.api.schedule, {
        type: cleanedShift.shift_name,
        heads: cleanedShift.headcount || 1,
        employee_ids: cleanedShift.assigned_employees.map(emp => emp.employee_id), // <-- send all selected employee_ids
        time_start: cleanedShift.start_time,
        time_end: cleanedShift.end_time,
        date_from: cleanedShift.start_date,
        date_to: cleanedShift.end_date
      });

      if (editingIndex !== null) {
        setPublishingShifts(prev => {
          const updated = [...prev];
          updated[editingIndex] = cleanedShift;
          return updated;
        });
      } else {
        setPublishingShifts(prev => [...prev, cleanedShift]);
      }
      
      // Show success message
      toast.success(editingIndex !== null ? 'Shift updated successfully' : 'Shift added successfully');
      console.log('Shift saved successfully:', cleanedShift);
      
      // Reset modal state
      setOpenModal(false);
      setModalShift(null);
      setEditingIndex(null);
      // Refresh employees and schedules
      fetchEmployeesAndSchedules();
    } catch (error) {
      console.error('Error saving shift:', error);
      if (error.response) {
        console.log('Full backend response:', error.response);
      }
      let errorMessage = 'Failed to save shift. Please try again.';
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      toast.error(errorMessage);
    }
  };

  const publishShift = (idx) => {
    const shift = publishingShifts[idx];
    setPublishedShifts((prev) => [...prev, { ...shift, status: "Active" }]);
    setPublishingShifts(publishingShifts.filter((_, i) => i !== idx));
  };

  const reuseShift = (idx) => {
    const shift = history[idx];
    setPublishingShifts((prev) => [...prev, { ...shift }]);
    setHistory(history.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    const today = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const stillActive = [];
    const ended = [];

    publishedShifts.forEach((shift) => {
      if (shift.end_date && new Date(shift.end_date) < twoDaysAgo) {
        ended.push({ ...shift, status: "Ended" });
      } else {
        stillActive.push(shift);
      }
    });

    if (ended.length > 0) {
      setPublishedShifts(stillActive);
      setHistory((prev) => [...prev, ...ended]);
    }
  }, [publishedShifts]);

  // Function to publish an unpublished shift: auto transfer to schedules DB
const publishUnpublishedShift = async (schedule_id) => {
  try {
    // Aggregate all shifts with the same schedule_id
    const relatedShifts = unpublishedShifts.filter(s => s.schedule_id === schedule_id);
    if (relatedShifts.length === 0) {
      toast.error('Shift not found');
      return;
    }
    // Build arrays for employee names and departments
    const employee_names = relatedShifts.map(s => s.employee_name);
    // Use the first shift for shared properties
    const shift = relatedShifts[0];
    // Prepare payload for schedules DB
    const payload = {
      type: shift.type,
      heads: shift.headcount || 1,
      employee_ids: employee_names.map(name => {
        const emp = employees.find(e => e.name === name);
        return emp ? emp.employee_id : null;
      }).filter(Boolean),
      days: relatedShifts.map(s => s.day),
      time_start: shift.time_start.slice(0,5), // Ensure HH:mm format
      time_end: shift.time_end.slice(0,5),     // Ensure HH:mm format
      date_from: shift.date_from,
      date_to: shift.date_to
    };
    // Post to schedules DB
    await axios.post(hr3.backend.api.schedule, payload);
    toast.success('Shift published successfully');
    // Remove from unpublishedShifts
    setUnpublishedShifts(prev => prev.filter(s => s.schedule_id !== schedule_id));
    // Refresh employees and schedules
    fetchEmployeesAndSchedules();
  } catch (error) {
    console.error('Error publishing shift:', error);
    toast.error('Failed to publish shift. Please try again.');
  }
};
  return (
    <div className="p-6 space-y-6">
      {/* AI Shift Analysis */}
      {/* <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">A Shift Analysis</h2>
        <label htmlFor="aiTextInput" className="block text-sm font-medium text-gray-700 mb-1">Shift Description</label>
        <Textarea
          id="aiTextInput"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder="e.g. 3 IT staff Saturday to Sunday 1pm-6pm for 2 weeks"
        />
        <Button className="mt-2" onClick={runAnalysis}>
          Analyze
        </Button>

        {aiResult && (
          <div className="mt-4 space-y-3">
            {aiResult.recommendations.map((r, i) => (
              <div key={i} className="border p-3 rounded bg-gray-50">
                <p><strong>{r.shift_name}</strong></p>
                <p>Time: {r.start_time} – {r.end_time}</p>
                <p>Dept: {r.department.join(", ")}</p>
                <p>Headcount: {r.headcount}</p>
                <p>Days: {r.days.join(", ")}</p>
                <p>Duration: {r.start_date} → {r.end_date}</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleOpenPublishModal(r)}
                >
                  Add to Publishing Schedule
                </Button>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Shifts & Schedule Publishing */}
 {/* Shifts & Schedule Publishing */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">Shifts & Schedule Publishing</h2>
        {unpublishedShifts.length === 0 ? (
          <p className="text-gray-500">No unpublished shifts found.</p>
        ) : (
          (() => {
            // Group unpublishedShifts by schedule_id
            const grouped = {};
            unpublishedShifts.forEach(s => {
              if (!grouped[s.schedule_id]) {
                grouped[s.schedule_id] = {
                  ...s,
                  employee_names: [s.employee_name],
                  employee_departments: [s.employee_department]
                };
              } else {
                grouped[s.schedule_id].employee_names.push(s.employee_name);
                grouped[s.schedule_id].employee_departments.push(s.employee_department);
              }
            });
            return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Shift</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Dept</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const grouped = {};
                  unpublishedShifts.forEach(s => {
                    if (!grouped[s.schedule_id]) {
                      grouped[s.schedule_id] = {
                        ...s,
                        employee_names: [s.employee_name],
                        employee_departments: [s.employee_department],
                      };
                    } else {
                      grouped[s.schedule_id].employee_names.push(s.employee_name);
                      grouped[s.schedule_id].employee_departments.push(s.employee_department);
                    }
                  });

                  return Object.values(grouped).map((s, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium">{s.type}</TableCell>
                      <TableCell>{s.time_start} – {s.time_end}</TableCell>
                      <TableCell>{[...new Set(s.employee_departments)].join(", ")}</TableCell>
                      <TableCell>{s.employee_names.join(", ")}</TableCell>
                      <TableCell>{s.date_from} → {s.date_to}</TableCell>
                      <TableCell>{s.status}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2"
                          onClick={() =>
                            handleOpenPublishModal({
                              shift_name: s.type,
                              start_time: s.time_start,
                              end_time: s.time_end,
                              start_date: s.date_from,
                              end_date: s.date_to,
                              department: [...new Set(s.employee_departments)],
                              assigned_employees: s.employee_names.map(name => {
                                const emp = employees.find(e => e.name === name);
                                return emp ? emp : { employee_id: null, name };
                              }),
                              schedule_id: s.schedule_id,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Publish: auto transfer to schedules DB, no modal
                            publishUnpublishedShift(s.schedule_id);
                          }}
                        >
                          Publish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
            );
          })()
        )}
      </div>

{/* Published Shifts as Calendar */}
<div className="p-4 border rounded bg-white shadow">
  <h2 className="text-lg font-bold">Published Shifts & Schedules</h2>
  <Table>
    <TableHeader>
      <TableRow>
        <TableCell>Shift Name</TableCell>
        <TableCell>Department</TableCell>
        <TableCell>Headcount</TableCell>
        <TableCell>Days</TableCell>
        <TableCell>Time</TableCell>
        <TableCell>Employees</TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {sampleShifts.map((shift) => (
        <TableRow key={shift.shift_id}>
          <TableCell>{shift.shift_name}</TableCell>
          <TableCell>{shift.department.join(", ")}</TableCell>
          <TableCell>{shift.headcount}</TableCell>
          <TableCell>{shift.days.join(", ")}</TableCell>
          <TableCell>{shift.start_time} - {shift.end_time}</TableCell>
          <TableCell>{shift.assigned_employees.map(e => e.name).join(", ")}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

      {/* History */}
      <div className="p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">History (Ended Shifts)</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No ended shifts.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Shift</TableCell>
                <TableCell>Dept</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell>{s.shift_name}</TableCell>
                  <TableCell>{s.department.join(", ")}</TableCell>
                  <TableCell>{s.start_date} → {s.end_date}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reuseShift(idx)}
                    >
                      Reuse
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

       {/* Modal for Adding/Editing Employees */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Publishing Shift" : "Add Shift to Publishing"}
            </DialogTitle>
          </DialogHeader>
          {modalShift && (
            <div className="space-y-3">
              <div>
                <label htmlFor="shiftNameInput" className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input
                  id="shiftNameInput"
                  type="text"
                  className="w-full border p-1 rounded mb-2"
                  value={modalShift.shift_name || ''}
                  onChange={(e) => setModalShift(prev => ({...prev, shift_name: e.target.value}))}
                />
              </div>
              <div>
                <label htmlFor="startTimeInput" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  id="startTimeInput"
                  type="time"
                  className="w-full border p-1 rounded mb-2"
                  value={modalShift.start_time || ''}
                  onChange={(e) => setModalShift(prev => ({...prev, start_time: e.target.value}))}
                />
              </div>
              <div>
                <label htmlFor="endTimeInput" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  id="endTimeInput"
                  type="time"
                  className="w-full border p-1 rounded mb-2"
                  value={modalShift.end_time || ''}
                  onChange={(e) => setModalShift(prev => ({...prev, end_time: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                  <input type="text" className="w-full border p-1 rounded mb-2" value={modalShift.days || ''} readOnly />
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (From-To)</label>
                  <input
                    id="duration"
                    type="text"
                    className="w-full border p-1 rounded mb-2"
                    value={(() => {
                      if (modalShift.start_date && modalShift.end_date) {
                        return `${modalShift.start_date} - ${modalShift.end_date}`;
                      }
                      return '';
                    })()}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Employees (max: {modalShift.headcount})</label>
                <div className="grid grid-cols-2 gap-2">
                  {employees.filter(emp =>
                    Array.isArray(modalShift.department)
                      ? modalShift.department.includes(emp.department)
                      : emp.department === modalShift.department
                  ).map(emp => {
                    // Only check if employee is in assigned_employees by employee_id
                    const checked = modalShift.assigned_employees?.some(e => e.employee_id === emp.employee_id);
                    const checkedCount = modalShift.assigned_employees?.length || 0;
                    const disabled = !checked && checkedCount >= (modalShift.headcount || 1);
                    return (
                      <label key={emp.employee_id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={e => {
                            setModalShift(ms => {
                              let updated;
                              if (e.target.checked) {
                                // Add employee by employee_id
                                updated = [...(ms.assigned_employees || []), { ...emp, employee_id: emp.employee_id }];
                              } else {
                                // Remove employee by employee_id
                                updated = (ms.assigned_employees || []).filter(e => e.employee_id !== emp.employee_id);
                              }
                              return { ...ms, assigned_employees: updated };
                            });
                          }}
                        />
                        <span>{emp.name} ({emp.department})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={savePublishing}>
              {editingIndex !== null ? "Save Changes" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}

// Sample shift data for display
const sampleShifts = [
  {
    shift_id: 1,
    shift_name: "Morning Shift",
    department: ["IT"],
    headcount: 3,
    days: ["Monday", "Tuesday", "Wednesday"],
    start_time: "08:00",
    end_time: "12:00",
    start_date: "2024-09-02",
    end_date: "2024-09-04",
    assigned_employees: [
      { employee_id: 101, name: "John Doe" },
      { employee_id: 102, name: "Jane Smith" },
      { employee_id: 103, name: "Alice Johnson" }
    ]
  },
  {
    shift_id: 2,
    shift_name: "Afternoon Shift",
    department: ["HR"],
    headcount: 2,
    days: ["Thursday", "Friday"],
    start_time: "13:00",
    end_time: "17:00",
    start_date: "2024-09-05",
    end_date: "2024-09-06",
    assigned_employees: [
      { employee_id: 104, name: "Eve Thomas" },
      { employee_id: 105, name: "Frank White" }
    ]
  }
];

// Example usage: Display sample shifts in a simple table
<div className="p-4 border rounded bg-white shadow">
  <h2 className="text-lg font-bold">Sample Shifts</h2>
  <Table>
    <TableHeader>
      <TableRow>
        <TableCell>Shift Name</TableCell>
        <TableCell>Department</TableCell>
        <TableCell>Headcount</TableCell>
        <TableCell>Days</TableCell>
        <TableCell>Time</TableCell>
        <TableCell>Employees</TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {sampleShifts.map((shift) => (
        <TableRow key={shift.shift_id}>
          <TableCell>{shift.shift_name}</TableCell>
          <TableCell>{shift.department.join(", ")}</TableCell>
          <TableCell>{shift.headcount}</TableCell>
          <TableCell>{shift.days.join(", ")}</TableCell>
          <TableCell>{shift.start_time} - {shift.end_time}</TableCell>
          <TableCell>{shift.assigned_employees.map(e => e.name).join(", ")}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

// Fetch schedules with status="not active"
function ShiftComponent() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch("/api/schedule");
        const data = await response.json();
        // Filter schedules with status="not active"
        const inactiveSchedules = data.data.filter(schedule => schedule.shift_status === "not active" || schedule.status === "not active");
        setSchedules(inactiveSchedules);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    };
    fetchSchedules();
  }, []);
}