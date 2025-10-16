import React, { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import toast from "react-hot-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TermsDialog from "@/components/hr3/TermsDialog";
import { data } from "react-router";
import AddShiftModal from "@/components/hr3/AddShiftModal";
import EditShiftModal from "@/components/hr3/EditShiftModal";
import PublishScheduleModal from "@/components/hr3/PublishScheduleModal";



/* -------------------------- Dummy Employees -------------------------- */
// const dummyEmployees = [
//   { id: 1, name: "John Doe", department: "IT", role: "Developer" },
//   { id: 2, name: "Jane Smith", department: "IT", role: "System Admin" },
//   { id: 3, name: "Alice Johnson", department: "IT", role: "Help Desk" },
//   { id: 4, name: "Bob Wilson", department: "Sales/Support", role: "Sales Rep" },
//   { id: 5, name: "Carol Brown", department: "Sales/Support", role: "Support Agent" },
//   { id: 6, name: "Dave Miller", department: "Sales/Support", role: "Support Agent" },
//   { id: 7, name: "Eve Thomas", department: "HR", role: "HR Manager" },
//   { id: 8, name: "Frank White", department: "HR", role: "HR Assistant" },
//   { id: 9, name: "Grace Lee", department: "Finance", role: "Accountant" },
//   { id: 10, name: "Henry Clark", department: "Finance", role: "Payroll" },
//   { id: 11, name: "Dr. Irene Gray", department: "ER", role: "Doctor" },
//   { id: 12, name: "Jack Green", department: "ER", role: "Nurse" },
//   { id: 13, name: "Karen Hall", department: "ER", role: "Nurse" },
// ];

/* -------------------------- Helpers -------------------------- */
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const deptLexicon = [
  { rx: /\b(hr|human\s*resources)\b/i, label: "HR" },
  {
    rx: /\b(it|tech|engineering|developer|engineer|sysadmin|help\s*desk)\b/i,
    label: "IT",
  },
  {
    rx: /\b(sales|marketing|customer\s*(service|support)|call\s*center|support)\b/i,
    label: "Logistics",
  },
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
    heads: 1,
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

  // Detect days (support ranges like "Monday - Friday")
  const dayRangeRegex = /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*(?:-|to)\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i;
  const dayRangeMatch = input.match(dayRangeRegex);
  if (dayRangeMatch) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let startIdx = daysOfWeek.findIndex(
      (d) => d.toLowerCase() === dayRangeMatch[1].toLowerCase()
    );
    let endIdx = daysOfWeek.findIndex(
      (d) => d.toLowerCase() === dayRangeMatch[2].toLowerCase()
    );
    if (startIdx !== -1 && endIdx !== -1) {
      if (startIdx <= endIdx) {
        result.days = daysOfWeek.slice(startIdx, endIdx + 1);
      } else {
        // Wrap around week
        result.days = [
          ...daysOfWeek.slice(startIdx),
          ...daysOfWeek.slice(0, endIdx + 1),
        ];
      }
    }
  } else {
    for (let d of DAYS) {
      if (text.includes(d.toLowerCase().slice(0, 3))) {
        result.days.push(d);
      }
    }
    if (result.days.length === 0) {
      result.days = DAYS;
    }
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
  const countMatch = input.match(
    /\b(\d+)\s*(staff|people|employees?|person)?/i
  );
  if (countMatch) {
    result.heads = parseInt(countMatch[1], 10);
  }

  // Detect duration (weeks)
  let weeks = 1;
  const weekMatch = input.match(/(\d+)\s*weeks?/i);
  if (weekMatch) weeks = parseInt(weekMatch[1], 10);

  // Detect duration (months)
  let months = 0;
  const monthMatch = input.match(/for\s*(\d+)\s*months?/i);
  if (monthMatch) {
    months = parseInt(monthMatch[1], 10);
    weeks = 0; // If months are specified, ignore weeks
  } else {
    // Also handle "for 1 month" without "for"
    const altMonthMatch = input.match(/(\d+)\s*months?/i);
    if (altMonthMatch) {
      months = parseInt(altMonthMatch[1], 10);
      weeks = 0;
    }
  }

  // Smart start/end date alignment
  if (result.days.length > 0) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const todayIdx = now.getDay();
    const firstDayIdx = daysOfWeek.indexOf(result.days[0]);
    const lastDayIdx = daysOfWeek.indexOf(result.days[result.days.length - 1]);
    let diff = (firstDayIdx - todayIdx + 7) % 7;
    if (diff === 0) diff = 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diff);

    const lastDiff = (lastDayIdx - firstDayIdx + 7) % 7;
    const endDate = new Date(startDate);
    if (months > 0) {
      // Add months to startDate for endDate
      endDate.setMonth(startDate.getMonth() + months);
      // Optionally, align endDate to the last day in result.days
      // This keeps the end date on the same weekday as the last day in the range
      endDate.setDate(endDate.getDate() + lastDiff);
    } else {
      endDate.setDate(startDate.getDate() + (weeks - 1) * 7 + lastDiff);
    }

    result.start_date = startDate.toISOString().slice(0, 10);
    result.end_date = endDate.toISOString().slice(0, 10);
  }

  // Build shift name (list department)
  result.shift_name = `${result.department.join(", ")} Shift`;

  result.description =
    `Shift from ${result.start_time || "N/A"} to ${
      result.end_time || "N/A"
    } on ` +
    `${result.days.length ? result.days.join(",") : "N/A"} for ${
      result.heads
    } staff. ` +
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
  const [savedShifts, setSavedShifts] = useState([]);
  const [openAiModal, setOpenAiModal] = useState(false);
  const [openPublishModal, setOpenPublishModal] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  const [employeeSchedules, setEmployeeSchedules] = useState([]);
  useEffect(() => {
    const fetchEmployeeSchedules = () => {
      axios.get(hr3.backend.api.employee_schedule.replace('_', '-'))
        .then(res => {
          // Group by shift_id
          const grouped = {};
          res.data.forEach(item => {
            if (!grouped[item.id]) {
              grouped[item.id] = {
                ...item,
                assigned_employees: [item.assigned_employees ? item.assigned_employees : (item.employee_id)],
              };
            } else {
              // Merge employees
              grouped[item.id].assigned_employees.push(item.assigned_employees ? item.assigned_employees : (item.employee_id));
            }
          });
          setEmployeeSchedules(Object.values(grouped));
        })
        .catch(err => console.error(err));
    };
    fetchEmployeeSchedules();
    const interval = setInterval(fetchEmployeeSchedules, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);
  // Fetch employees and their schedules from backend
  const fetchEmployeesAndSchedules = async () => {
    try {
      // Fetch employees first
      const employeesResponse = await axios.get(hr3.backend.api.employees);
      let employeesList = [];

      if (!employeesResponse.data) {
        throw new Error("Invalid employees API response");
      }

      if (Array.isArray(employeesResponse.data)) {
        employeesList = employeesResponse.data;
      } else if (
        employeesResponse.data &&
        Array.isArray(employeesResponse.data.data)
      ) {
        employeesList = employeesResponse.data.data;
      } else {
        throw new Error("Unexpected employees data format");
      }
      setEmployees(employeesList);

      // Fetch only shifts
      const publishedSchedulesResponse = await axios.get(
        hr3.backend.api.shift_data_only
      );
      
      let publishedSchedulesList = [];

      if (!publishedSchedulesResponse.data.success) {
        throw new Error(
          publishedSchedulesResponse.data.message ||
            "Failed to fetch Shifts"
        );


      }
      setPublishedShifts(publishedSchedulesList);

      // Fetch only shift data (saved shifts) using shiftDataOnly endpoint
      const savedShiftsResponse = await axios.get(
        hr3.backend.api.shift_data_only
      );
      let savedShiftsList = [];
      if (Array.isArray(savedShiftsResponse.data)) {
        savedShiftsList = savedShiftsResponse.data;
      } else if (Array.isArray(savedShiftsResponse.data?.data)) {
        savedShiftsList = savedShiftsResponse.data.data;
      }
      setSavedShifts(savedShiftsList);
      console.log("✅ Loaded saved shifts (shiftDataOnly):", savedShiftsList);
    } catch (error) {
      console.error("fetching employees or schedules:", error);
      toast.error("Failed to fetch employees or schedules. Please try again.");
    }
  };
  useEffect(() => {
    fetchEmployeesAndSchedules();
  }, []);

  // Additional states for modal and history
  const [modalShift, setModalShift] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [deletedShiftId, setDeletedShiftId] = useState(null);

  // Helper to open PublishScheduleModal correctly
  const openPublishScheduleModal = (shift) => {
    setEditingIndex(null);
    setOpenModal(false);
    setOpenPublishModal(true);
    setModalShift(shift); // <-- Ensure modalShift is set for PublishScheduleModal
  };

  const runAnalysis = () => {
    if (!aiText.trim()) return;
    const res = analyzeShift(aiText);
    setAiResult(res);
  };

  const handleOpenPublishModal = async (shift, index = null) => {
    // Fetch assigned employees from backend
    let assignedEmployees = [];
    try {
      const res = await axios.get(`${hr3.backend.api.employee_schedule.replace('_', '-')}/assigned/${shift.id || shift.shift_id}`);
      if (res.data && Array.isArray(res.data.assigned_employees)) {
        assignedEmployees = res.data.assigned_employees;
      }
    } catch (err) {
      console.error('Failed to fetch assigned employees:', err);
    }
    setModalShift({
      ...shift,
      assigned_employees: assignedEmployees,
      heads: shift.heads || 1,
      department: Array.isArray(shift.department)
        ? shift.department
        : (shift.department || '').split(',').map(dep => dep.trim()).filter(Boolean),
      days: Array.isArray(shift.days)
        ? shift.days
        : (shift.days || '').split(',').map(day => day.trim()).filter(Boolean),
      start_date: shift.start_date || new Date().toISOString().split('T')[0],
      end_date:
        shift.end_date ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
    });
    setEditingIndex(index);
    setOpenModal(true);
  };

  const savePublishing = async () => {
    if (!modalShift) {
      console.error("No modalShift data available");
      return;
    }

    // Validate required fields
    if (!modalShift.shift_name) {
      toast.error("Shift type is required");
      return;
    }
    if (!modalShift.start_time || !modalShift.end_time) {
      toast.error("Start and end times are required");
      return;
    }
    if (!modalShift.start_date || !modalShift.end_date) {
      toast.error("Start and end dates are required");
      return;
    }

    // Validate time format HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(modalShift.start_time)) {
      toast.error("Start time must be in HH:mm format (e.g., 13:00)");
      return;
    }
    if (!timeRegex.test(modalShift.end_time)) {
      toast.error("End time must be in HH:mm format (e.g., 18:00)");
      return;
    }
    // Validate end time is after start time
    const [startHour, startMin] = modalShift.start_time.split(":").map(Number);
    const [endHour, endMin] = modalShift.end_time.split(":").map(Number);
    if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
      toast.error("End time must be after start time");
      return;
    }
    // const hasSelectedEmployees = modalShift.assigned_employees &&
    //   modalShift.assigned_employees.length > 0 &&
    //   modalShift.assigned_employees.some(emp => emp && emp.employee_id !== '');

    // if (!hasSelectedEmployees) {
    //   // Check if there are any selected employees that might not be in the array yet
    //   const selectedCount = Array.from(document.querySelectorAll('select[id^="employeeSelect-"]'))
    //     .filter(select => select.value !== '').length;

    //   if (selectedCount === 0) {
    //     toast.error('At least one employee must be selected');
    //     console.log('Validation failed: No valid employees selected', modalShift.assigned_employees);
    //     return;
    //   }
    // }

    // Create a deep copy of the modalShift state including selected employees
    const cleanedShift = JSON.parse(
      JSON.stringify({
        ...modalShift,
        assigned_employees: modalShift.assigned_employees
          ? modalShift.assigned_employees
              .filter((emp) => emp && emp.employee_id) // Ensure valid employee_id
              .map((emp) => ({ ...emp })) // Create new employee objects
          : [],
        // Include any selected employees from dropdowns that haven't been added to state yet
        ...Array.from(
          document.querySelectorAll('select[id^="employeeSelect-"]')
        )
          .filter((select) => select.value !== "")
          .reduce((acc, select, i) => {
            const emp = employees.find((e) => e.employee_id === select.value);
            if (emp && emp.employee_id) {
              if (!acc.assigned_employees) acc.assigned_employees = [];
              acc.assigned_employees[i] = { ...emp };
            }
            return acc;
          }, {}),
      })
    );
    console.log("DEBUG assigned_employees:", cleanedShift.assigned_employees);

    try {
      // 1. Save to shift table
      const shiftResponse = await axios.post(hr3.backend.api.shift, {
        shift_name: cleanedShift.shift_name || cleanedShift.type, // Add shift_name for migration
        type: cleanedShift.type,
        heads: cleanedShift.heads || 1,
        time_start: formatTimeToHi(cleanedShift.start_time),
        time_end: formatTimeToHi(cleanedShift.end_time),
        days: Array.isArray(cleanedShift.days)
          ? cleanedShift.days.join(",")
          : cleanedShift.days,
        date_from: cleanedShift.start_date,
        date_to: cleanedShift.end_date,
        department: Array.isArray(cleanedShift.department)
          ? cleanedShift.department.join(",")
          : cleanedShift.department || "IT", // Always send department as string
      });
      const shiftId = shiftResponse.data?.shift_id;

      // Use shiftId as employee_schedule_id
      const employeeScheduleId = shiftId;

      // Validate employeeScheduleId before proceeding
      if (!employeeScheduleId) {
        toast.error(
          "Failed to create employee schedule. No valid ID returned."
        );
        return;
      }

      // Register each employee for the schedule (backend expects employee_ids array)
      const employee_ids = cleanedShift.assigned_employees
        ? cleanedShift.assigned_employees.filter(emp => emp && emp.employee_id).map(emp => emp.employee_id)
        : [];
      // Only trigger employee assignment if editing an existing shift (not when adding new)
      if (editingIndex !== null) {
        await axios.post(hr3.backend.api.employee_schedule, {
          employee_ids,
          shift_id: shiftId, // send as shift_id instead of employee_schedule_id
          time_start: cleanedShift.start_time ? cleanedShift.start_time.slice(0,5) : undefined,
          time_end: cleanedShift.end_time ? cleanedShift.end_time.slice(0,5) : undefined,
        });
      }
      // Remove any save to schedule table (do not save to hr3.backend.api.schedule)
      // Remove any save to unpublish_schedule table
      // Remove any duplicate schedule creation

      if (editingIndex !== null) {
        setPublishingShifts((prev) => {
          const updated = [...prev];
          updated[editingIndex] = cleanedShift;
          return updated;
        });
      } else {
        setPublishingShifts((prev) => [...prev, cleanedShift]);
      }

      // Show success message
      toast.success(
        editingIndex !== null
          ? "Shift updated successfully"
          : "Shift added successfully"
      );
      console.log("Shift saved successfully:", cleanedShift);
    
      // Reset modal state
      setOpenModal(false);
      setModalShift(null);
      setEditingIndex(null);
      // Refresh employees and schedules
      fetchEmployeesAndSchedules();
      // Auto-refresh AI Shift Analysis after saving
      setAiText("");
      setAiResult(null);
    } catch (error) {
      console.error("Error saving shift:", error);
      if (error.response) {
        console.log("Full backend response:", error.response);
      }
      let errorMessage = "Failed to save shift. Please try again.";
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(" | ");
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
      const scheduleResponse = await axios.post(hr3.backend.api.schedule, payload);
      toast.success('Shift published successfully');
      // Get the new shift_id from backend response
      const newShiftId = scheduleResponse.data.shift_id;
      // Assign employees to the shift via /employee_schedule endpoint
      for (const empId of payload.employee_ids) {
        console.log("Sending to backend:", { employee_id: empId, shift_id: newShiftId });
        await axios.post(hr3.backend.api.employee_schedule, {
          employee_id: empId,
          shift_id: newShiftId,
          time_start: payload.time_start,
          time_end: payload.time_end
        });
      }
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
    <div className="px-5 space-y-4 -mt-7">
      {/* AI Shift Analysis */}
      <div>
        <h2 className="text-2xl font-bold">AI Shift Analysis</h2>
      </div>
      <div className="p-4 border rounded bg-white shadow">
        <label htmlFor="aiTextInput" className="block text-sm font-medium text-gray-700 mb-1">
          Create Shift
        </label>
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
                <p>
                  <strong>{r.shift_name}</strong>
                </p>
                <p>
                  Time: {r.start_time} – {r.end_time}
                </p>
                <p>Department: {r.department.join(", ")}</p>
                <p>Headcount: {r.heads}</p>
                <p>Days: {r.days.join(", ")}</p>
                <p>
                  Duration: {r.start_date} → {r.end_date}
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleOpenPublishModal(r)}
                >
                  Save Shift
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shifts */}
      <div className="px-4 py-2 border rounded bg-white shadow max-h-[39%] min-h-[20%] overflow-auto ">
        <h2 className="text-lg font-bold">Shifts</h2>
        <br />
        {savedShifts.length === 0 ? (
          <p className="text-gray-500">No Saved shifts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {savedShifts.map((s, idx) => (
              <div key={idx} className={`hover:border-2 flex flex-col justify-between min-h-[100%] hover:border-gray-400 border rounded-lg p-4 mb-2 bg-gray-50 max-w-[290px] shadow saved-shift-card${ deletedShiftId === s.id ? " dissolve" : "" }`} style={{ transition: "opacity 0.5s", opacity: deletedShiftId === s.id ? 0 : 1,}}>
                <div className="space-y-1 text-sm">
                  <h3 className="font-bold text-lg mb-2 capitalize">
                    {s.shift_name || s.type}
                  </h3>
                  <div>
                    <strong>Head Counts:</strong> {s.heads}
                  </div>
                  <div>
                    <strong>Department:</strong> {s.department}
                  </div>
                  <div className="capitalize">
                    <strong>Type:</strong> {s.type}
                  </div>
                  <div className="overflow-hidden">
                    <strong>Days:</strong>{" "}
                    <span className="text-wrap">{Array.isArray(s.days) ? s.days.join(", ") : s.days}</span>
                  </div>
                  <div>
                    <strong>Time:</strong> {s.time_start} – {s.time_end}
                  </div>
                  <div>
                    <strong>Date:</strong> {s.date_from} → {s.date_to}
                  </div>
                </div>
                {/* buttons */}
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleOpenPublishModal(
                        {
                          shift_name: s.shift_name || s.type,
                          heads: s.heads,
                          type: s.type,
                          days: Array.isArray(s.days)
                            ? s.days
                            : typeof s.days === "string"
                            ? s.days.split(",").map((d) => d.trim())
                            : [],
                          start_time: s.time_start,
                          end_time: s.time_end,
                          start_date: s.date_from,
                          end_date: s.date_to,
                          department: s.department,
                          assigned_employees: Array.isArray(s.employees) ? s.employees : [], // <-- pass actual employees
                          schedule_id: s.schedule_id,
                          id: s.id,
                        },
                        idx
                      )
                    }
                  >
                    Assign Employees
                  </Button>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this shift?"
                        )
                      ) {
                        setDeletedShiftId(s.id);
                        setTimeout(() => {
                          deleteSavedShift(s.id);
                          setDeletedShiftId(null);
                          fetchEmployeesAndSchedules();
                        }, 150);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
            </div>
            ))}
          </div>
        )}
      </div>

{/* Employee Schedule */}
<div className="px-4 py-2 border rounded bg-white shadow max-h-[30.5%] min-h-[25%] overflow-auto">
  <h2 className="text-lg font-bold">Schedules</h2>
  <br />

  {employeeSchedules.length === 0 ? (
    <p className="text-gray-500">No employee schedules found.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
      {employeeSchedules
        .filter(s => s.status?.toLowerCase() === "unpublish") // ✅ only show unpublish
        .map((s, idx) => (
          <div
            key={s.id || idx}
            className={`flex flex-col justify-between min-h-[100%] hover:border-2 hover:border-gray-400 border rounded-lg p-4 mb-2 bg-gray-50 max-w-[290px] shadow saved-shift-card ${
              deletedShiftId === s.id ? "dissolve" : ""
            }`}
            style={{
              transition: "opacity 0.5s",
              opacity: deletedShiftId === s.id ? 0 : 1,
            }}
          >
            <div className="space-y-1 text-sm">
              <h3 className="font-bold text-lg mb-2 capitalize">
                {s.shift_name || s.type}
              </h3>

              <div>
                <strong>Head Counts:</strong> {s.heads}
              </div>

              <div>
                <strong>Assigned Employees:</strong>{" "}
                {Array.isArray(s.employees) && s.employees.length > 0 ? (
                  s.employees.map((emp, empIdx) => (
                    <span key={emp.employee_id || empIdx}>
                      {typeof emp === "object"
                        ? emp.name ||
                          emp.employee_name ||
                          `#${emp.employee_id}`
                        : emp}
                      {empIdx < s.employees.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  "None"
                )}
              </div>

              <div>
                <strong>Department:</strong> {s.department}
              </div>
              <div className="capitalize">
                <strong>Type:</strong> {s.type}
              </div>
              <div>
                <strong>Days:</strong>{" "}
                {Array.isArray(s.days) ? s.days.join(", ") : s.days}
              </div>
              <div>
                <strong>Time:</strong> {s.time_start} – {s.time_end}
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  openPublishScheduleModal({
                    shift_name: s.shift_name || s.type,
                    heads: s.heads,
                    type: s.type,
                    days: Array.isArray(s.days)
                      ? s.days
                      : typeof s.days === "string"
                      ? s.days.split(",").map((d) => d.trim())
                      : [],
                    start_time: s.time_start,
                    end_time: s.time_end,
                    start_date: s.date_from,
                    end_date: s.date_to,
                    department: s.department,
                    assigned_employees: s.assigned_employees?.length
                      ? s.assigned_employees
                      : employees.filter((e) => e.shift_id === s.id),
                    id: s.id,
                  })
                }
              >
                Publish
              </Button>

              <Button
                className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                size="sm"
                variant="outline"
              >
                Edit
              </Button>

              <Button
                className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this Schedule?"
                    )
                  ) {
                    setDeletedShiftId(s.id);
                    setTimeout(() => {
                      deleteEmployeeSchedule(s.id);
                      setDeletedShiftId(null);
                      fetchEmployeesAndSchedules();
                    }, 150);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
    </div>
  )}
</div>


      {/* Unpublished employee schedules
      <div className="p-4 border rounded bg-white shadow max-h-[35%] overflow-auto ">
        <h2 className="text-lg font-bold">Unpublished Schedules</h2>
        <br />
        {savedShifts.length === 0 ? (
          <p className="text-gray-500">No Unpublished schedules found.</p>  
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {savedShifts.map((s, idx) => (
              <div
                key={idx}
                className={`hover:border-2 hover:border-gray-400 border rounded-lg p-4 mb-2 bg-gray-50 max-w-[290px] shadow saved-shift-card${
                  deletedShiftId === s.id ? " dissolve" : ""
                }`}
                style={{
                  transition: "opacity 0.5s",
                  opacity: deletedShiftId === s.id ? 0 : 1,
                }}
              >
                <h3 className="font-bold text-lg mb-2 capitalize">
                  {s.shift_name || s.type}
                </h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Head Counts:</strong> {s.heads}
                  </div>
                  <div>
                    <strong>Department:</strong> {s.department}
                  </div>
                  <div className="capitalize">
                    <strong>Type:</strong> {s.type}
                  </div>
                  <div>
                    <strong>Days:</strong>{" "}
                    {Array.isArray(s.days) ? s.days.join(", ") : s.days}
                  </div>
                  <div>
                    <strong>Time:</strong> {s.time_start} – {s.time_end}
                  </div>
                  <div> 
                    <strong>Assigned Employees:</strong> {Array.isArray(s.assigned_employees) && s.assigned_employees.length > 0
                      ? s.assigned_employees.map(emp => emp.name || emp.employee_id).join(", ")
                      : "None"}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleOpenPublishModal(
                        {
                          shift_name: s.shift_name || s.type,
                          heads: s.heads,
                          type: s.type,
                          days: Array.isArray(s.days)
                            ? s.days
                            : typeof s.days === "string"
                            ? s.days.split(",").map((d) => d.trim())
                            : [],
                          start_time: s.time_start,
                          end_time: s.time_end,
                          start_date: s.date_from,
                          end_date: s.date_to,
                          department: s.department,
                          assigned_employees: [],
                          schedule_id: s.schedule_id,
                          id: s.id,
                        },
                        idx
                      )
                    }
                  >
                    Publish
                  </Button>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this shift?"
                        )
                      ) {
                        setDeletedShiftId(s.id);
                        setTimeout(() => {
                          deleteSavedShift(s.id);
                          setDeletedShiftId(null);
                          fetchEmployeesAndSchedules();
                        }, 150);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}

      {/* Published Shifts as Calendar */}
      <div className="px-4 py-2 border rounded bg-white shadow">
        <h2 className="text-lg font-bold">Published Shifts & Schedules</h2>
        {employeeSchedules.filter(s => s.status === "publish").length === 0 ? (
          <p className="text-gray-500">No active shifts.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableCell className="font-bold">Department</TableCell>
                  {DAYS.map((day) => (
                    <TableCell key={day} className="font-bold text-center">
                      {day}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptLexicon.map((dept) => (
                  <TableRow key={dept.label}>
                    <TableCell className="font-semibold">
                      {dept.label}
                    </TableCell>
                    {DAYS.map((day) => {
                      const shiftsForDay = employeeSchedules.filter(
                        (s) =>
                          s.status === "publish" &&
                          (Array.isArray(s.department)
                            ? s.department
                            : [s.department ?? ""]
                          ).includes(dept.label) &&
                          (Array.isArray(s.days)
                            ? s.days
                            : [s.days ?? ""]
                          ).includes(day)
                      );
                      return (
                        <TableCell key={day} className="align-top">
                          {shiftsForDay.length === 0 ? (
                            <span className="text-gray-400 text-sm">—</span>
                          ) : (
                            <div className="space-y-2">
                              {shiftsForDay.map((shift, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-blue-50 border text-sm text-center"
                                >
                                  <div className="flex justify-between">
                                    <p className="font-medium">
                                      {shift.shift_name}
                                    </p>
                                    <span
                                      className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                                        shift.status === "publish"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {shift.status}
                                    </span>
                                  </div>
                                  <p>
                                    {shift.time_start} - {shift.time_end}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shift.assigned_employees &&
                                      shift.assigned_employees.length > 0 ? (
                                      shift.assigned_employees.map((e, idx) => (
                                        <span key={idx}>
                                          {e?.name || e?.employee_name || (e?.employee_id ? `#${e.employee_id}` : "Unknown")}
                                          {idx !== shift.assigned_employees.length - 1 ? ", " : ""}
                                        </span>
                                      ))
                                    ) : (
                                      <span>No employees assigned</span>
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* History */}
      <div className="px-4 py-2 border rounded bg-white shadow">
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
                  <TableCell>
                    {s.start_date} → {s.end_date}
                  </TableCell>
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

      {/* Modal for Adding/Editing/Publishing Employees */}
      <Dialog open={openModal || openPublishModal} onOpenChange={val => { setOpenPublishModal(val); }}>
        {openPublishModal ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <PublishScheduleModal
              open={openPublishModal}
              setOpen={setOpenPublishModal}
              id={modalShift?.id}
              schedule={modalShift}
              employees={employees}
              getAvailableEmployees={getAvailableEmployees}
              onPublish={handlePublishSchedule}
            />
          </div>
        ) : editingIndex !== null ? (
          <EditShiftModal
            open={openModal}
            setOpen={setOpenModal}
            modalShift={modalShift}
            setModalShift={setModalShift}
            employees={employees}
            getAvailableEmployees={getAvailableEmployees}
            onCreate={handleCreateOrUpdateShift}
          />
        ) : (
          <AddShiftModal
            open={openModal}
            setOpen={setOpenModal}
            modalShift={modalShift}
            setModalShift={setModalShift}
            onSave={savePublishing}
          />
        )}
      </Dialog>

      <div className="w-full justify-center flex">
        <p
          className="text-sm text-blue-500 py-5 cursor-pointer"
          onClick={() => setOpenTermsDialog(true)}
        >
          Terms & Conditions
        </p>
      </div>
      <TermsDialog
        className="w-full"
        open={openTermsDialog}
        onOpenChange={setOpenTermsDialog}
      />
    </div>
  );
}

const deleteSavedShift = async (shift_id) => {
  try {
    await axios.delete(`${hr3.backend.api.shift}/${shift_id}`);
    toast.success("Shift deleted successfully");
    // Refresh the list
    fetchEmployeesAndSchedules();
  } catch (error) {
    console.error("Error deleting shift:", error);
    toast.error("Failed to delete shift. Please try again.");
  }
};

const deleteEmployeeSchedule = async (scheduleId) => {
  try {
    await axios.delete(`${hr3.backend.api.employee_schedule}/${scheduleId}`);
    toast.success("Employee Schedule deleted successfully");
    fetchEmployeesAndSchedules();
  } catch (error) {
    console.error("Error deleting Employee Schedule:", error);
    toast.error("Failed to delete Employee Schedule. Please try again.");
  }
};

async function handlePublishSchedule(scheduleData) {
  const scheduleId = scheduleData?.id || modalShift?.id;
  if (!scheduleId) {
    toast.error("No schedule ID provided. Cannot publish.");
    return;
  }
  // Send publish request to backend
  const response = await axios.post(`${hr3.backend.api.employee_schedule}/${scheduleId}/publish`, {
    status: "publish"
  });
  if (response.status === 200 || response.status === 201) {
    toast.success("Schedule published successfully!");
    setOpenPublishModal(false);
    setModalShift(null);
    fetchEmployeesAndSchedules();
  } else {
    toast.error("Failed to publish schedule.");
  }
}
const handleCreateOrUpdateShift = async (shiftData) => {
  try {
    console.log("Saving shift data:", shiftData);

    // Only assign employees to shift, do not update the shift itself
    const shiftId = shiftData.id || shiftData.shift_id;
    if (!shiftId) {
      toast.error("No shift ID provided. Cannot assign employees.");
      return;
    }

    // ✅ Handle assigned employees
    if (shiftData.assigned_employees?.length > 0) {
      // Collect employee IDs into an array
      const employeeIds = shiftData.assigned_employees.map(emp => emp.employee_id);
      // Ensure days is an array
      const daysArray = Array.isArray(shiftData.days) ? shiftData.days : (shiftData.days ? shiftData.days.split(',').map(d => d.trim()) : []);
      await axios.post(hr3.backend.api.employee_schedule, {
        shift_id: shiftId,
        employee_ids: employeeIds,
        shift_name: shiftData.shift_name,
        type: shiftData.type,
        heads: shiftData.heads,
        days: daysArray,
        time_start: formatTimeToHi(shiftData.start_time || shiftData.time_start || ""),
        time_end: formatTimeToHi(shiftData.end_time || shiftData.time_end || ""),
        date_from: shiftData.date_from || shiftData.start_date || "",
        date_to: shiftData.date_to || shiftData.end_date || "",
        department: Array.isArray(shiftData.department) ? shiftData.department.join(", ") : shiftData.department || "",
      });
      console.log("✅ Employees assigned to shift");
      // Show alert with assigned employees, days, and time
      const employeeNames = shiftData.assigned_employees.map(e => e.name).join(", ");
      const days = daysArray.join(", ");
      const time = `${shiftData.start_time || shiftData.time_start || ""} - ${shiftData.end_time || shiftData.time_end || ""}`;
      alert(`Assigned: ${employeeNames}\nDays: ${days}\nTime: ${time}`);
    }

    // ✅ Refresh UI
    await fetchEmployeesAndSchedules();
    setOpenModal(false);
    toast.success("Employees assigned to shift successfully!");
  } catch (error) {
    console.error("❌ Error assigning employees:", error);
    toast.error("Failed to assign employees. Check console for details.");
  }
};

// Helper to format time to H:i (HH:mm)
function formatTimeToHi(timeStr) {
  if (!timeStr) return '';
  // Accepts 'HH:mm' or 'HH:mm:ss' or 'YYYY-MM-DD HH:mm:ss'
  let time = timeStr;
  if (time.includes(' ')) {
    time = time.split(' ')[1];
  }
  const [hour, minute] = time.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}