import React, { useState } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LeavePolicyModal() {
  const [modalType, setModalType] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [policies, setPolicies] = useState([
    { id: 1, name: "Annual Leave", accrual: "1.5 days/mo", max: "30 days", carry: true, status: "active" },
    { id: 2, name: "Sick Leave", accrual: "1 day/mo", max: "15 days", carry: false, status: "active" },
  ]);

  const openModal = (type, policy = null) => {
    setModalType(type);
    setSelectedPolicy(policy);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPolicy(null);
  };

  const handleDelete = (id) => {
    setPolicies(policies.filter((p) => p.id !== id));
    closeModal();
  };

  const handleSave = () => {
    if (modalType === "add") {
      setPolicies([...policies, { ...selectedPolicy, id: Date.now() }]);
    } else if (modalType === "edit") {
      setPolicies(policies.map((p) => (p.id === selectedPolicy.id ? selectedPolicy : p)));
    }
    closeModal();
  };

  const totalPages = Math.ceil(policies.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPolicies = policies.slice(startIndex, startIndex + rowsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Leave Policy Configuration</h1>
        <Button
          onClick={() =>
            openModal("add", { name: "", accrual: "", max: "", carry: false, status: "active" })
          }
        >
          <Plus size={16} className="mr-1" /> Add Policy
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Accrual</th>
              <th className="px-4 py-2">Max</th>
              <th className="px-4 py-2">Carry</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPolicies.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.accrual}</td>
                <td className="px-4 py-3">{p.max}</td>
                <td className="px-4 py-3">{p.carry ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => openModal("view", p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => openModal("edit", p)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openModal("delete", p)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={modalType === "view"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Policy</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-3 py-3 text-sm">
              <p>
                <strong>Name:</strong> {selectedPolicy.name}
              </p>
              <p>
                <strong>Accrual:</strong> {selectedPolicy.accrual}
              </p>
              <p>
                <strong>Max:</strong> {selectedPolicy.max}
              </p>
              <p>
                <strong>Carry:</strong> {selectedPolicy.carry ? "Yes" : "No"}
              </p>
              <p>
                <strong>Status:</strong> {selectedPolicy.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Modal */}
      <Dialog open={modalType === "add" || modalType === "edit"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "add" ? "Add New Policy" : "Edit Policy"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div>
              <Label>Name</Label>
              <Input
                value={selectedPolicy?.name || ""}
                onChange={(e) =>
                  setSelectedPolicy({ ...selectedPolicy, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Accrual</Label>
              <Input
                value={selectedPolicy?.accrual || ""}
                onChange={(e) =>
                  setSelectedPolicy({ ...selectedPolicy, accrual: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Max</Label>
              <Input
                value={selectedPolicy?.max || ""}
                onChange={(e) =>
                  setSelectedPolicy({ ...selectedPolicy, max: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Carry</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedPolicy?.carry ? "Yes" : "No"}
                onChange={(e) =>
                  setSelectedPolicy({ ...selectedPolicy, carry: e.target.value === "Yes" })
                }
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full border rounded p-2"
                value={selectedPolicy?.status || "active"}
                onChange={(e) =>
                  setSelectedPolicy({ ...selectedPolicy, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {modalType === "add" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={modalType === "delete"} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <p>
              Are you sure you want to delete <strong>{selectedPolicy.name}</strong>?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(selectedPolicy.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}