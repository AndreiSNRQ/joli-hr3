import { Doughnut, Bar, Pie } from "react-chartjs-2";
import React, { useState } from "react";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip,Legend,
} from "chart.js";
// import{
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableRow
// } from '@components/ui/table';
import{
  Building2Icon,StickyNoteIcon,RefreshCwIcon,NotepadTextIcon,HandCoinsIcon,
}from "lucide-react"
// import TermsDialog from "@/components/hr3/TermsDialog";


// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dash() {
  // Summary values from datasets
  const summary = {
    employees: attendanceData.datasets[0].data[0], // total of Present+Absent+Leave
    approvedTimesheets: timesheetData.datasets[0].data[0], // Approved
    requestSwap: 12, // mock value, replace with API later
    leaveRequests: leaveData.datasets[0].data.reduce((a, b) => a + b, 0),
    claims: claimsData.datasets[0].data.reduce((a, b) => a + b, 0),
    present: Building2Icon, // Present
    timesheetI: NotepadTextIcon,
    swap: RefreshCwIcon,
    claimsI: HandCoinsIcon,
    leave: StickyNoteIcon,
  };  

  const [openTermsDialog, setOpenTermsDialog] = useState(false);


  return (
    
    <div className="px-5 -mt-7 ">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-rows-10 gap-3 pt-4">
        {/* Top summary cards */}
        <div className="gap-3 grid grid-cols-5">
          <SummaryCard label="Total Present" value={summary.employees} icon={summary.present} />
          <SummaryCard label="Pending Timesheets" value={summary.approvedTimesheets} icon={summary.timesheetI} />
          <SummaryCard label="Request Schedule" value={summary.requestSwap} icon={summary.swap} />
          <SummaryCard label="Leave Requests" value={summary.leaveRequests} icon={summary.leave} />
          <SummaryCard label="Claims and Reimbursements" value={summary.claims} icon={summary.claimsI} />
        </div>

        {/* Attendance & Timesheet */}
        <div className="grid grid-cols-2 gap-4 row-span-3 ">
          {/* Attendance */}
          <div className="rounded-lg p-3 bg-white shadow border grid grid-rows-11 hover:bg-gray-100">
            <div className="flex items-center text-lg font-semibold">
              <h1>Attendance per Week</h1>
            </div>
            <div className="row-span-10 p-2">
              <Bar data={attendanceData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Timesheet */}
          <div className="rounded-lg p-3 bg-white shadow border grid grid-rows-11 hover:bg-gray-100">
            <div className="flex items-center text-lg font-semibold">
              <h1>Timesheet Management</h1>
            </div>
            <div className="row-span-10 p-2">
              <Doughnut data={timesheetData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-lg p-3 row-span-3 bg-white shadow border grid grid-cols-2">
          {/* Left */}
          <div className="grid grid-rows-7">
            <div className="flex items-center w-full">
              <h1 className="text-lg font-semibold">Shift and Schedule</h1>
            </div>
            <div>{/* TODO: Add schedule content */}</div>
          </div>

          {/* Right */}
          <div className="grid grid-rows-7 w-full px-3">
            <div className="flex items-center w-full">
              <h1 className="text-lg font-semibold">Published Schedule</h1>
            </div>
            <div className="row-span-6 grid px-3 pt-3 justify-center h-full overflow-auto">
              {/* <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Shift</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>2023-08-01</TableCell>
                    <TableCell>8:00 AM - 4:00 PM</TableCell>
                  </TableRow>
                </TableBody>
              </Table> */}
            </div>
          </div>
        </div>

        {/* Leave Management and Claims */}
        <div className="grid grid-cols-2 gap-4 row-span-3">
          {/* Leave Management */}
          <div className="rounded-lg p-3 bg-white shadow border grid grid-rows-11 hover:bg-gray-100">
            <div className="flex items-center text-lg font-semibold">
              <h1>Leave Trend's</h1>
            </div>
            <div className="row-span-10 p-2 grid grid-cols-2">
              <Doughnut data={leaveData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Claims and Reimbursements */}
          <div className="rounded-lg p-3 bg-white shadow border grid grid-rows-11 hover:bg-gray-100">
            <div className="flex items-center text-lg font-semibold">
              <h1>Claims and Reimbursements</h1>
            </div>
            <div className="row-span-10 p-2">
              <Pie data={claimsData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      {/* <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} /> */}
    </div>
  );
}

// Reusable card component
function SummaryCard({ label, value, icon }) {
  return (
    <div className="grid grid-cols-3 border rounded-sm px-5 hover:bg-gray-100">
      <div className="grid grid-rows-2 col-span-2">
        <div className="text-md text-gray-600 flex items-end">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
      <div className="h-full w-full flex items-center">
        <div className="w-[82%] rounded-full h-[72%] text-gray-600 flex items-center justify-center bg-gray-200">
          {icon && React.createElement(icon, { className: "w-8 h-8 text-gray-400" })}
        </div>
      </div>
    </div>
  );
}
// Chart Data
const attendanceData = {
  labels: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
  datasets: [
    {
      data: [10,13,30,40,20,40,30],
      backgroundColor: ["#4CAF50", "#F44336", "#2196F3", "#9C27B0", "#607D8B", "#FFC107", "#F44336"],
    },
  ],
};

const timesheetData = {
  labels: ["Approved", "Pending"],
  datasets: [
    {
      data: [90, 10],
      backgroundColor: ["#4CAF50", "#FFC107"],
    },
  ],
};

const leaveData = {
  labels: ["Vacation", "Sick", "Other"],
  datasets: [
    {
      data: [60, 30, 10],
      backgroundColor: ["#2196F3", "#9C27B0", "#607D8B"],
    },
  ],
};

const claimsData = {
  labels: ["Approved", "Pending", "Rejected"],
  datasets: [
    {
      data: [70, 20, 10],
      backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
    },
  ],
};