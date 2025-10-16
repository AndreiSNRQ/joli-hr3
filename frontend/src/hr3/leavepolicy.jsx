import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";

// Default leave policy data
const defaultPolicies = [
  { id: 1, type: "Vacation Leave", date: "2025-01-01", policyName: "Annual Paid Leave", description: "Employees get 15 days of paid vacation leave per year.", status: "Active" },
  { id: 2, type: "Sick Leave", date: "2025-01-01", policyName: "Paid Sick Days", description: "Employees can take up to 10 days of paid sick leave annually.", status: "Active" },
  { id: 3, type: "Maternity Leave", date: "2025-01-01", policyName: "105-Day Maternity Leave", description: "Female employees are entitled to 105 days of paid maternity leave.", status: "Active" },
  { id: 4, type: "Paternity Leave", date: "2025-01-01", policyName: "7-Day Paternity Leave", description: "Male employees are entitled to 7 days of paid leave upon childbirth of spouse.", status: "Active" },
  { id: 5, type: "Vacation Leave", date: "2025-01-01", policyName: "Annual Paid Leave", description: "Employees get 15 days of paid vacation leave per year.", status: "Active" },
  { id: 6, type: "Sick Leave", date: "2025-01-01", policyName: "Paid Sick Days", description: "Employees can take up to 10 days of paid sick leave annually.", status: "Active" },
  { id: 7, type: "Maternity Leave", date: "2025-01-01", policyName: "105-Day Maternity Leave", description: "Female employees are entitled to 105 days of paid maternity leave.", status: "Active" },
  { id: 8, type: "Paternity Leave", date: "2025-01-01", policyName: "7-Day Paternity Leave", description: "Male employees are entitled to 7 days of paid leave upon childbirth of spouse.", status: "Active" },
];

export default function LeavePolicy() {
  const [policies, setPolicies] = useState([]);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  // Fetch leave policies from backend
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get(hr3.backend.api.leave_policies);
        let records = [];

        if (Array.isArray(response.data)) {
          records = response.data;
        } else if (response.data?.data) {
          records = response.data.data;
        }

        const mapped = records.map((item) => ({
          id: item.id,
          type: item.type || "Unknown Type",
          date: item.effective_date || "N/A",
          policyName: item.policy_name || "Untitled Policy",
          description: item.description || "No description provided",
          status: item.status || "Active",
        }));

        setPolicies(mapped.length ? mapped : defaultPolicies);
      } catch (error) {
        console.error("Error fetching leave policies:", error);
        setPolicies(defaultPolicies);
      }
    };

    fetchPolicies();
  }, []);

  // CRUD actions
  const handleView = (policy) => {
    alert(`Viewing: ${policy.policyName}`);
  };

  const handleUpdate = (policy) => {
    alert(`Updating: ${policy.policyName}`);
  };

  const handleDelete = (policy) => {
    if (confirm(`Delete ${policy.policyName}?`)) {
      setPolicies((prev) => prev.filter((p) => p.id !== policy.id));
    }
  };

  const [filterStatus, setFilterStatus] = useState("");
  const [filterName, setFilterName] = useState("");
  return (
    <div className="-mt-5 px-4 min-h-[800px]">
      <div className="text-2xl font-bold mb-3">
        Leave Policy
      </div>

      <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md">
        Add Leave Type
      </Button>

      <div className="max-h-[full] rounded-lg border pt-5 px-4 space-y-4">
        {/* filter */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
          type="text"
          placeholder="Search by name..."
          className="border rounded-md px-3 py-2 w-50"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <select
          className="border rounded-md px-3  py-2 w-50"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Active</option>
          <option value="Approved">Not Active</option>
        </select>
        </div>
        <div className="min-h-[600px] max-h-[400px] overflow-y-auto">
          <Table>
          <TableCaption>Policy Table</TableCaption>
          <TableHeader >
            <TableRow className="bg-gray-100">
              <TableHead className="font-medium w-1/16 text-center">#</TableHead>
              <TableHead className="font-medium w=-1/4 text-center">Name</TableHead>
              <TableHead className="font-medium w-1/4 text-center">Accrual</TableHead>
              <TableHead className="font-medium w-1/4 text-center">Max Balance</TableHead>
              <TableHead className="font-medium w-1/4 text-center">Carry</TableHead>
              <TableHead className="font-medium w-1/4 text-center">Status</TableHead>
              <TableHead className="font-medium w-1/4 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="text-center">{policy.id}</TableCell>
                <TableCell className="text-rigth">{policy.type}</TableCell>
                <TableCell className="text-center">{policy.date}</TableCell>
                <TableCell className="text-rigth">{policy.policyName}</TableCell>
                <TableCell className="text-center">{policy.status}</TableCell>
                <TableCell className="text-center">{policy.status}</TableCell>
                <TableCell className="text-center space-x-3">
                  <Button variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600 hover:text-white" onClick={() => handleView(policy)}>View</Button>
                  <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => handleUpdate(policy)}>Update</Button>
                  <Button className="bg-red-500 text-white hover:bg-red-600 hover:text-white" variant="outline" size="sm" onClick={() => handleDelete(policy)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="w-full flex justify-center items-end">
        <p
          className="text-sm text-blue-500 py-5 cursor-pointer"
          onClick={() => setOpenTermsDialog(true)}
        >
          Terms & Conditions
        </p>
      </div>

      <TermsDialog open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
    </div>
  );
}
