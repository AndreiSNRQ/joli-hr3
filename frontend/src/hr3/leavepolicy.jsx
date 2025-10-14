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

  return (
    <div className="-mt-5">
      <div className="text-2xl font-bold mb-3">Leave Policy</div>

      <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md">
        Add Leave Type
      </Button>

      <div className="overflow-auto rounded-lg border min-h-[650px] max-h-[800px]">
        <Table>
          <TableCaption>Leave Types and Policies</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="font-medium">#</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">Effective Date</TableHead>
              <TableHead className="font-medium">Policy Name</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.id}</TableCell>
                <TableCell>{policy.type}</TableCell>
                <TableCell>{policy.date}</TableCell>
                <TableCell>{policy.policyName}</TableCell>
                <TableCell>{policy.status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mx-1" onClick={() => handleView(policy)}>View</Button>
                  <Button variant="outline" size="sm" className="mx-1" onClick={() => handleUpdate(policy)}>Update</Button>
                  <Button variant="outline" size="sm" className="mx-1" onClick={() => handleDelete(policy)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="w-full flex justify-center">
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
