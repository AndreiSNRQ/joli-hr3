import React, { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, startOfWeek, getDay } from 'date-fns';
import TermsDialog from "@/components/hr3/TermsDialog";
import enUS from 'date-fns/locale/en-US';
import AddLeaveModal from "@/components/hr3/AddLeaveModal";

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getEventStyle = (event) => {
  switch (event.type.toLowerCase().split(' ')[0]) {
    case 'vacation':
      return { backgroundColor: '#22C55E', color: 'white' };
    case 'sick':
      return { backgroundColor: '#EF4444', color: 'white' };
    case 'emergency':
      return { backgroundColor: '#F59E0B', color: 'white' };
    default:
      return { backgroundColor: '#3B82F6', color: 'white' };
  }
};

// Dummy Data
const dummyLeaveRequests = [
  { id: 1, employee: "John Doe", type: "Sick Leave", date:"2025-08-31" , startDate: "2025-09-03", endDate: "2025-09-04", reason: "Medical appointment", status: "Pending" },
  { id: 2, employee: "Jane Smith", type: "Vacation Leave", date:"2025-08-31", startDate: "2025-09-10", endDate: "2025-09-15", reason: "Family vacation", status: "Pending" },
  { id: 3, employee: "Jane Smith", type: "Vacation Leave", date:"2025-08-31", startDate: "2025-09-10", endDate: "2025-09-15", reason: "Family vacation", status: "Pending" },
  { id: 4, employee: "Alice Johnson", type: "Emergency Leave", date:"2025-08-31", startDate: "2025-09-20", endDate: "2025-09-21", reason: "Family emergency", status: "Approved" },
  { id: 5, employee: "Bob Wilson", type: "Vacation Leave", date:"2025-08-31", startDate: "2025-09-25", endDate: "2025-09-30", reason: "Summer vacation", status: "Approved" }
];

const dummyLeaveBalances = [
  { id: 1, employee: "John Doe", vacation: { total: 15, used: 5, remaining: 10 }, sick: { total: 10, used: 5, remaining: 5 }, emergency: { total: 3, used: 1, remaining: 2 } },
  { id: 2, employee: "Jane Smith", vacation: { total: 15, used: 0, remaining: 15 }, sick: { total: 10, used: 7, remaining: 3 }, emergency: { total: 3, used: 2, remaining: 1 } },
  { id: 3, employee: "Alice Johnson", vacation: { total: 15, used: 5, remaining: 10 }, sick: { total: 10, used: 3, remaining: 7 }, emergency: { total: 3, used: 0, remaining: 3 } },
  { id: 4, employee: "Bob Wilson", vacation: { total: 15, used: 10, remaining: 5 }, sick: { total: 10, used: 2, remaining: 8 }, emergency: { total: 3, used: 1, remaining: 2 } }
];

// AI Analysis Helper
const analyzeLeaveRequest = (reason) => {
  const keywords = {
    sick: ['sick', 'fever', 'hospital', 'medical', 'doctor', 'illness', 'health','unwell'],
    vacation: ['vacation', 'holiday', 'trip', 'travel', 'family', 'rest'],
    emergency: ['emergency', 'urgent', 'death', 'accident', 'crisis']
  };

  reason = reason.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => reason.includes(word))) {
      return {
        type: `${type.charAt(0).toUpperCase() + type.slice(1)} Leave`,
        recommendation: 'Approved',
        confidence: 0.85,
        analysis: `Request appears to be a valid ${type} leave based on the provided reason.`
      };
    }
  }

  return {
    type: 'Unspecified Leave',
    recommendation: 'Review Required',
    confidence: 0.5,
    analysis: 'Unable to determine leave type from reason. Manual review recommended.'
  };
};

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState(dummyLeaveBalances);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [calendarView, setCalendarView] = useState('month');
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ employee: "", type: "", startDate: "", endDate: "", reason: "" });

  const handleAddLeave = (e) => {
    e.preventDefault();
    setLeaveRequests([
      ...leaveRequests,
      {
        id: leaveRequests.length + 1,
        employee: newLeave.employee,
        type: newLeave.type,
        date: new Date().toISOString().split('T')[0],
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: "Pending"
      }
    ]);
    setIsAddModalOpen(false);
    setNewLeave({ employee: "", type: "", startDate: "", endDate: "", reason: "" });
  };

  // Fetch leave requests from backend
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(hr3.backend.api.leave);
        
        let records = [];
        if (Array.isArray(response.data)) {
          // plain array
          records = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // paginated response
          records = response.data.data;
        }
        
        const mappedRecords = records.map(record => ({
          id: record.id,
          employee: record.employeeName || 'Unknown',
          leave_type: record.leave_type || 'Vacation Leave',
          date: record.date || new Date().toISOString().split('T')[0],
          startDate: record.start_date || new Date().toISOString().split('T')[0],
          endDate: record.end_date || new Date().toISOString().split('T')[0],
          reason: record.reason || 'Not specified',
          status: record.status || 'Pending'
        }));
        
        setLeaveRequests(mappedRecords.length > 0 ? mappedRecords : dummyLeaveRequests);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        setLeaveRequests(dummyLeaveRequests); // Use dummy data if API fails
      }
    };
    
    fetchLeaveRequests();
  }, []);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAiAnalysis(analyzeLeaveRequest(request.reason));
    setIsDialogOpen(true);
  };

  const handleApprove = (requestId) => {
    const request = leaveRequests.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequests = leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Approved" } : req
    );

    const startDate = new Date(request.start_ate);
    const endDate = new Date(request.end_date);
    const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const updatedBalances = leaveBalances.map(balance => {
      if (balance.employee === request.employee) {
        const type = request.type.toLowerCase().split(' ')[0];
        const currentBalance = balance[type];
        if (currentBalance.remaining < durationInDays) {
          alert(`Insufficient ${type} leave balance for ${request.employee}`);
          return balance;
        }
        return {
          ...balance,
          [type]: {
            ...currentBalance,
            used: currentBalance.used + durationInDays,
            remaining: currentBalance.remaining - durationInDays
          }
        };
      }
      return balance;
    });

    setLeaveRequests(updatedRequests);
    setLeaveBalances(updatedBalances);
  };

  const handleReject = (requestId) => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === requestId ? { ...req, status: "Rejected" } : req
    ));
  };

  const getCalendarEvents = () => {
    return leaveRequests
      .filter(leave => leave.status === "Approved")
      .map(leave => ({
        id: leave.employee_id,
        title: `${leave.employee} - ${leave.leave_type}`,
        start: new Date(leave.startDate),
        end: new Date(leave.endDate),
        leave_type: leave.leave_type,
        employee: leave.employee,
        reason: leave.reason,
        status: leave.status
      }));
  };

  const handleEventSelect = (event) => {
    const request = leaveRequests.find(req => req.id === event.id);
    if (request) {
      handleViewRequest(request);
    }
  };

  return (
    <div className=" -mt-7">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold py-2">
          AI Leave Processing & Shift Scheduling using spaCy NLP
        </h1>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="w-full mb-3">
            <TabsTrigger className="hover:border-black" value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger className="hover:border-black" value="balances">Leave Balances</TabsTrigger>
          </TabsList>

        {/* Requests */}
        <TabsContent value="requests" className="">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-blue-700">{leaveRequests.filter(l => l.status === 'Pending').length}</span>
                <span className="text-sm text-blue-700">Pending</span>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200 hover:bg-green-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-green-700">{leaveRequests.filter(l => l.status === 'Approved').length}</span>
                <span className="text-sm text-green-700">Approved</span>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200 hover:bg-red-100">
              <CardContent className="flex flex-col items-center py-6">
                <span className="text-2xl font-bold text-red-700">{leaveRequests.filter(l => l.status === 'Rejected').length}</span>
                <span className="text-sm text-red-700">Rejected</span>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="space-y-3">
              <div className="overflow-auto rounded-lg min-h-[540px] max-h-[500px]">
                <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md" onClick={() => setIsAddModalOpen(true)}>
                  Add Leave Request
                </Button>
              <Table className="px-3">
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Set Date <span className="text-sm text-gray-500"> (from-to)</span> </TableCell>
                    <TableCell className="w-1/8 text-center">Status</TableCell>
                    <TableCell className="w-1/8 text-center">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.id}</TableCell>
                      <TableCell className="">{req.employee}</TableCell>
                      <TableCell className="">{req.type}</TableCell>
                      <TableCell>{format(new Date(req.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(req.startDate), 'MMM dd, yyyy')} - {format(new Date(req.endDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="w-1/8 space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequest(req)}>View</Button>
                        <Button variant="default" size="sm" onClick={() => handleApprove(req.id)} disabled={req.status !== "Pending"}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(req.id)} disabled={req.status !== "Pending"}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balances */}
        <TabsContent value="balances" className="">
          <Card>
            <CardContent className="space-y-3">
            <div className="overflow-auto min-h-[700px] max-h-[800px]">
            <Table className="px-3">
              <TableHeader>
                <TableRow className="bg-gray-200" >
                  <TableCell>Employee</TableCell>
                  <TableCell className="text-center font-medium" colSpan={3}>Vacation Leave</TableCell>
                  <TableCell className="text-center font-medium" colSpan={3}>Sick Leave</TableCell>
                  <TableCell className="text-center font-medium" colSpan={3}>Emergency Leave</TableCell>
                </TableRow>
                <TableRow className="bg-gray-100">
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="font-medium">Used</TableCell>
                  <TableCell className="border-r font-medium">Remaining</TableCell>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="font-medium">Used</TableCell>
                  <TableCell className="border-r font-medium">Remaining</TableCell>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="font-medium">Used</TableCell>
                  <TableCell className="border-r font-medium">Remaining</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveBalances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>{balance.employee || 'Unknown'}</TableCell>
                    <TableCell>{balance.vacation.total}</TableCell>
                    <TableCell>{balance.vacation.used}</TableCell>
                    <TableCell className={balance.vacation.remaining < 5 ? 'text-red-500 font-medium' : ''}>{balance.vacation.remaining}</TableCell>
                    <TableCell>{balance.sick.total}</TableCell>
                    <TableCell>{balance.sick.used}</TableCell>
                    <TableCell className={balance.sick.remaining < 3 ? 'text-red-500 font-medium' : ''}>{balance.sick.remaining}</TableCell>
                    <TableCell>{balance.emergency.total}</TableCell>
                    <TableCell>{balance.emergency.used}</TableCell>
                    <TableCell className={balance.emergency.remaining < 2 ? 'text-red-500 font-medium' : ''}>{balance.emergency.remaining}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              AI-assisted leave request analysis
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Existing request details */}
                <div>
                  <label className="font-bold">Employee</label>
                  <p>{selectedRequest.employee || 'Unknown'}</p>
                </div>
                <div> 
                  <label className="font-bold">Leave Type</label> 
                  <p>{selectedRequest.leave_type}</p> 
                </div> 
                <div> 
                  <label className="font-bold">Start Date</label> 
                  <p>{format(new Date(selectedRequest.startDate), 'MMM dd, yyyy')}</p> 
                </div> 
                <div> 
                  <label className="font-bold">End Date</label> 
                  <p>{format(new Date(selectedRequest.endDate), 'MMM dd, yyyy')}</p> 
                </div> 
                <div className="col-span-2"> 
                  <label className="font-bold">Reason</label> 
                  <p>{selectedRequest.reason}</p> 
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-lg">AI Analysis</h3>
                {aiAnalysis && (
                  <>
                    <div>
                      <label className="font-bold text-sm">Detected Leave Type</label>
                      <p className="text-blue-600">{aiAnalysis.type}</p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Recommendation</label>
                      <p className={aiAnalysis.recommendation === 'Approved' ? 
                        'text-green-600' : 'text-yellow-600'}>
                        {aiAnalysis.recommendation}
                      </p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Confidence Score</label>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${aiAnalysis.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {(aiAnalysis.confidence * 100).toFixed(0)}% confident
                      </p>
                    </div>
                    <div>
                      <label className="font-bold text-sm">Analysis</label>
                      <p className="text-sm text-gray-600">{aiAnalysis.analysis}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-2 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div> */}
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
      <AddLeaveModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddLeave}
        leaveData={newLeave}
        setLeaveData={setNewLeave}
      />
    </div>
  );  
}