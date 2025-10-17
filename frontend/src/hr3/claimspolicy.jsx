import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import TermsDialog from "@/components/hr3/TermsDialog";
import AddLeavePolicyModal from "@/components/hr3/AddLeavePolicyModal";
import AddLeaveTypeModal from "@/components/hr3/AddLeaveTypeModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const defaultPolicies = [
  { id: 1, name: "Vacation Leave", eligibility: "All regular employees", duration: "5-15 days/year", pay: "Full Pay",note: "For rest, travel, personal; accrual may depend on tenure.", status: "Active" },
  { id: 2, name: "Sick Leave", eligibility: "All regular employees", duration: "5-15 days/year", pay: "Full Pay",note: "For illness or medical appointments; may be combined with vacation leave.", status: "Active" },
  { id: 3, name: "Emergency/Bereaverment Leave", eligibility: "All regular employees", duration: "3-5 days/year", pay: "Full Pay",note: "For death or serious illness of family members.", status: "Active" },
  { id: 4, name: "Study / Educational Leave", eligibility: "Employees attending approved courses", duration: "Varies", pay: "Paid/Unpaid",note: "Requires manager approval; company-specific..", status: "Active" },
  { id: 5, name: "Unpaid Leave", eligibility: "Employees who exhausted paid leave", duration: "Varies", pay: "None",note: "For personal reasons; requires management approval.", status: "Active" },
  { id: 2, name: "Sick Leave", eligibility: "All regular employees", duration: "5-15 days/year", pay: "Full Pay",note: "For illness or medical appointments; may be combined with vacation leave.", status: "Active" },
];

export default function ClaimsPolicy() {
  const [policies, setPolicies] = useState([]);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("policies");
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: "", description: "", maxDays: "" });
  const [newType, setNewType] = useState({ name: "", description: "", maxDays: "" });
  const [filterStatus, setFilterStatus] = useState("");
  const [filterName, setFilterName] = useState("");

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
  const handleAddPolicy = (e) => {
    e.preventDefault();
    setPolicies([
      ...policies,
      {
        id: policies.length + 1,
        name: newPolicy.name,
        eligibility: newPolicy.eligibility,
        duration: newPolicy.duration,
        pay: newPolicy.pay,
        note: newPolicy.note,
        status: "Active",
        maxDays: newPolicy.maxDays
      }
    ]);
    setIsAddPolicyModalOpen(false);
    setNewPolicy({ name: "", description: "", maxDays: "" });
  };
    const handleAddTypePolicy = (e) => {
    e.preventDefault();
    setPolicies([
      ...policies,
      {
        id: policies.length + 1,
        name: newPolicy.name,
        eligibility: newPolicy.eligibility,
        duration: newPolicy.duration,
        pay: newPolicy.pay,
        note: newPolicy.note,
        status: "Active",
        maxDays: newPolicy.maxDays
      }
    ]);
  
    setIsAddPolicyModalOpen(false);
    setNewPolicy({ name: "", description: "", maxDays: "" });
    };
  const handleAddType = (e) => {
    e.preventDefault();
    setIsAddTypeModalOpen(false);
    setNewType({ name: "", description: "", maxDays: "" });
  };

  return (
    <div className="-mt-7">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold py-2">
          Claims and Reimbursements Policy Management
        </h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

        <TabsContent value="policies">
          <Card>
            <CardContent className="space-y-3">
              <TabsList className="w-full"> 
                <TabsTrigger className="hover:border-black" value="policies">Claims Types</TabsTrigger>
                <TabsTrigger className="hover:border-black" value="types">Reimbursement Types</TabsTrigger>
              </TabsList>
              <div className="overflow-auto rounded-lg min-h-[630px] max-h-[630px]">
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>
                {/* Cards */}
                <div className="gap-4 mb-4">
                  <Card className="min-h-[550px] max-w-[full] bg-gray-50 hover:bg-gray-100">
                    <CardContent>
                      <div className="flex flex-row justify-between">
                        <h1 className="text-lg font-semibold">Claims Types:</h1>
                        <div>
                          <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md" onClick={() => setIsAddPolicyModalOpen(true)}>Add Claims Type</Button>
                        </div>
                      </div>
                      <Table>
                        <TableRow>
                          <TableHead className="">Name</TableHead>
                          <TableHead>Eligibility</TableHead>
                          <TableHead>Document Required</TableHead>
                          <TableHead>Description</TableHead>
                          </TableRow>
                        <TableRow className="text-wrap">
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Medical/Health Claim</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Employee who incurred medical expenses</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Medical certificate, receipts, SSS/PhilHealth claim forms</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">Usually filed through HR or insurance provider; may require pre-approval.</TableCell>
                        </TableRow>

                        <TableRow className="text-wrap">
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Accident / Incident Claim</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Employees injured at work</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Accident report, medical records</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">Can be filed via company or Pag-IBIG/SSS Work Injury benefits.</TableCell>
                        </TableRow>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>      
          {/* <div className="w-full flex justify-center items-end">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>
          Terms & Conditions
        </p>
      </div> */}
        </TabsContent>
        <TabsContent value="types">
          <Card>
            <CardContent className="space-y-3">
              <TabsList className="w-full"> 
                <TabsTrigger className="hover:border-black" value="policies">Claims Types</TabsTrigger>
                <TabsTrigger className="hover:border-black" value="types">Reimbursement Types</TabsTrigger>
              </TabsList>
              <div className="overflow-auto rounded-lg min-h-[630px] max-h-[630px]">
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>
                {/* Cards */}
                <div className="gap-4 mb-4">
                  <Card className="min-h-[550px] bg-gray-50 hover:bg-gray-100">
                    <CardContent>
                      <div className="flex flex-row justify-between">
                          <h1 className="text-lg font-semibold">Restrictions:</h1>
                          <div>
                            <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md">Add Reimbursement Type</Button>
                          </div>
                      </div>
                      <Table>
                        <TableRow>
                          <TableHead className="">Name</TableHead>
                          <TableHead>Eligibility</TableHead>
                          <TableHead>Coverage / Limit</TableHead>
                          <TableHead>Document Required</TableHead>
                          <TableHead>Description</TableHead>
                          </TableRow>
                        <TableRow className="text-wrap">
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Medical / Dental / Optical Reimbursement</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">All regular employees</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">ctual cost up to company cap</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">Receipts, prescription</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">ypically annual limit; HR verifies before payout.</TableCell>
                        </TableRow>

                        <TableRow className="text-wrap">
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Transportation / Travel Reimbursement</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Employees traveling for work</TableCell>
                          <TableCell className="border-r max-w-xs whitespace-normal break-words">Actual cost or per diem</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">Receipts, travel order</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">Paid via payroll or expense report.</TableCell>
                        </TableRow>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>  
          {/* <div className="w-full flex justify-center items-end">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>
          Terms & Conditions
        </p>
      </div> */}
        </TabsContent>
      </Tabs>

      <TermsDialog open={openTermsDialog} onOpenChange={setOpenTermsDialog} />
      <AddLeavePolicyModal
        open={isAddPolicyModalOpen}
        onOpenChange={setIsAddPolicyModalOpen}
        onSubmit={handleAddPolicy}
        policyData={newPolicy}
        setPolicyData={setNewPolicy}
      />
      <AddLeaveTypeModal
        open={isAddTypeModalOpen}
        onOpenChange={setIsAddTypeModalOpen}
        onSubmit={handleAddType}
        policyData={newType}
        setPolicyData={setNewType}
      />
    </div>
  );
}