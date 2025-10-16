import { Doughnut, Bar, Pie } from "react-chartjs-2";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Building2Icon,
  StickyNoteIcon,
  RefreshCwIcon,
  NotepadTextIcon,
  HandCoinsIcon,
} from "lucide-react";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dash() {
  const summary = {
    employees: attendanceData.datasets[0].data[0],
    approvedTimesheets: timesheetData.datasets[0].data[0],
    requestSwap: 12,
    leaveRequests: leaveData.datasets[0].data.reduce((a, b) => a + b, 0),
    claims: claimsData.datasets[0].data.reduce((a, b) => a + b, 0),
    present: Building2Icon,
    timesheetI: NotepadTextIcon,
    swap: RefreshCwIcon,
    claimsI: HandCoinsIcon,
    leave: StickyNoteIcon,
  };

  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  return (
    <div className="px-3 md:px-6 -mt-7 space-y-3">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-4">
        <SummaryCard label="Total Present" value={summary.employees} icon={summary.present} />
        <SummaryCard label="Pending Timesheets" value={summary.approvedTimesheets} icon={summary.timesheetI} />
        <SummaryCard label="Request Schedule" value={summary.requestSwap} icon={summary.swap} />
        <SummaryCard label="Leave Requests" value={summary.leaveRequests} icon={summary.leave} />
        <SummaryCard label="Claims & Reimbursements" value={summary.claims} icon={summary.claimsI} />
      </div>

      {/* Attendance & Timesheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance */}
        <ChartCard title="Attendance per Week">
          <div className="h-[300px] sm:h-[350px] md:h-[400px]">
            <Bar data={attendanceData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </ChartCard>

        {/* Timesheet */}
        <ChartCard title="Timesheet Management">
          <div className="h-[300px] sm:h-[350px] md:h-[400px] flex justify-center">
            <Doughnut data={timesheetData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </ChartCard>
      </div>

      {/* Leave & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave */}
        <ChartCard title="Leave Trends">
          <div className="h-[300px] sm:h-[350px] md:h-[400px] flex justify-center">
            <Doughnut data={leaveData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </ChartCard>

        {/* Claims */}
        <ChartCard title="Claims and Reimbursements">
          <div className="h-[300px] sm:h-[350px] md:h-[400px] flex justify-center">
            <Pie data={claimsData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </ChartCard>
      </div>

      {/* Footer */}
      <div className="w-full flex justify-center">
        <p
          className="text-sm text-blue-500 py-5 cursor-pointer hover:underline"
          onClick={() => setOpenTermsDialog(true)}
        >
          Terms & Conditions
        </p>
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function SummaryCard({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between bg-pink-50 border border-pink-300 shadow-sm rounded-lg p-4 hover:bg-pink-100 transition">
      <div>
        <p className="text-sm text-pink-500">{label}</p>
        <p className="text-2xl font-semibold text-pink-600">{value}</p>
      </div>
      <div className="bg-pink-200 rounded-full p-3 flex items-center justify-center">
        {icon && React.createElement(icon, { className: "w-6 h-6 text-pink-600" })}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg p-3 bg-white shadow border hover:bg-blue-50 transition">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

/* ---------- Chart Data ---------- */
const attendanceData = {
  labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  datasets: [
    {
      data: [10, 13, 30, 40, 20, 40, 30],
      backgroundColor: [
        "#4CAF50",
        "#F44336",
        "#2196F3",
        "#9C27B0",
        "#607D8B",
        "#FFC107",
        "#F44336",
      ],
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
