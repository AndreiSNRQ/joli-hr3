import './index.css'

import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from './context/AuthProvider';
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';
import NotFound from './main/not-found';
// hr3
import Dash from './hr3/dashboard'
import Attendance from './hr3/attendance'
import AttendanceRequest from './hr3/attendancerequest'
import ApprovedTimesheet from './hr3/approvedtimesheet'
import TimesheetRequest from './hr3/timesheetrequest'
import Timesheet from './hr3/timesheet'
import Schedule from './hr3/schedule'
// import Shift from './hr3/shift'
import ScheduleSwap from './hr3/scheduleswap';
import Leave from './hr3/leave'
import LeavePolicy from './hr3/leavepolicy'
import Claims from './hr3/claims'
import ClaimsPolicy from './hr3/claimspolicy'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout allowedRoles={['HR3 Admin', 'Super Admin']}/>}>
            <Route index element={<Dash/>}/>
            <Route path='attendance' element={<Attendance/>}/>
            <Route path='attendance-requests' element={<AttendanceRequest/>}/>
            <Route path='timesheet' element={<Timesheet/>}/>
            <Route path='timesheetrequest' element={<TimesheetRequest/>}/>
            <Route path='approvedtimesheet' element={<ApprovedTimesheet/>}/>
            <Route path='schedule' element={<Schedule/>}/>
            {/* <Route path='shift' element={<Shift/>}/> */}
            <Route path='scheduleswap' element={<ScheduleSwap/>}/>
            <Route path='leave' element={<Leave/>}/>
            <Route path='leavepolicy' element={<LeavePolicy/>}/>
            <Route path='claims' element={<Claims/>}/>
            <Route path='claimspolicy' element={<ClaimsPolicy/>}/>
          </Route>

          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)