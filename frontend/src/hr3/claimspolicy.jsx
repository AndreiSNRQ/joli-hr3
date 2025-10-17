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
        <h1 className="text-2xl font-bold text-muted-foreground py-2">
          Leave Policy Management
        </h1>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="types">Leave Types</TabsTrigger>
        </TabsList>
        <TabsContent value="policies">
          <Card>
            <CardContent>
              <div className="overflow-auto rounded-lg min-h-[630px] max-h-[630px]">
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                  <select
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                {/* Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="min-h-[500px] max-w-[full] bg-gray-50 hover:bg-gray-100">
                    <CardContent>
                      <div className="flex flex-row justify-between">
                        <h1 className="text-lg font-semibold">Key Guidelines:</h1>
                        <div>
                          <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md" onClick={() => setIsAddPolicyModalOpen(true)}>Add Guidelines</Button>
                        </div>
                      </div>
                      <Table>
                        <TableRow>
                          <TableHead className="w-7/16 border-r">Name</TableHead>
                          <TableHead>Description</TableHead>
                          </TableRow>
                        <TableRow className="text-wrap">
                          <TableCell className="border-r">sfsdfsd</TableCell>
                          <TableCell className="max-w-xs whitespace-normal break-words">If multiple employees request leave simultaneously, approval is on a first-come, first-served basis or business needs.</TableCell>
                        </TableRow>
                      </Table>
                    </CardContent>
                  </Card>
                  <Card className="min-h-[500px] bg-gray-50 hover:bg-gray-100">
                    <CardContent>
                      <div className="flex flex-row justify-between">
                          <h1 className="text-lg font-semibold">Restrictions:</h1>
                          <div>
                            <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md">Add Restriction</Button>
                          </div>
                      </div>
                      <Table>
                        <TableRow>
                          <TableHead className="w-1/16 border-r text-center">#</TableHead>
                          <TableHead>Description</TableHead>
                          </TableRow>
                        <TableRow>
                          <TableCell className="border-r text-center">1</TableCell>
                          <TableCell>fasjfsdfajkfnadsjfnsdjfnshajkdfndafkd</TableCell>
                        </TableRow>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>      <div className="w-full flex justify-center items-end">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>
          Terms & Conditions
        </p>
      </div>
        </TabsContent>
        <TabsContent value="types">
          <Card>
            <CardContent>
              <div className="overflow-auto rounded-lg min-h-[630px] max-h-[630px]">
                <Button className="bg-blue-500 text-white px-4 mb-3 rounded-md" onClick={() => setIsAddTypeModalOpen(true)}>
                  Add Leave Type
                </Button>
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                  <select
                    className="border rounded-md px-3 py-2 w-50"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <Table className="px-3">
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="font-medium w-1/16 text-center">#</TableHead>
                      <TableHead className="font-medium w=-1/4 text-center">Name</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Eligibility</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Duration</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Pay</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Notes</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Status</TableHead>
                      <TableHead className="font-medium w-1/4 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="text-center">{policy.id}</TableCell>
                        <TableCell className="text-right">{policy.name}</TableCell>
                        <TableCell className="text-center">{policy.eligibility}</TableCell>
                        <TableCell className="text-right">{policy.duration}</TableCell>
                        <TableCell className="text-center">{policy.pay}</TableCell>
                        <TableCell className="text-center">{policy.note}</TableCell>
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
            </CardContent>
          </Card>
          <div className="w-full flex justify-center items-end">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>
          Terms & Conditions
        </p>
      </div>
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