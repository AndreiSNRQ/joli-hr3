import React, { useState, useEffect } from "react";
import axios from "axios";
import { hr3 } from "@/api/hr3";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TermsDialog from "@/components/hr3/TermsDialog";
import { Card, CardContent } from "@/components/ui/card";

export default function ClaimsModule() {
  const [claims, setClaims] = useState([]);
  
  // Fetch claims from backend
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axios.get(hr3.backend.api.claims);
        
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
          type: record.claim_type || 'Other',
          category: record.claim_type || 'Other',
          amount: record.amount || 0,
          status: record.status || 'Pending',
          img: image, // Default image for now
        }));
        
        setClaims(mappedRecords);
      } catch (error) {
        console.error("Error fetching claims:", error);
        // Keep default data if fetch fails
        setClaims([
          {
            id: 1,
            employee: "Juan Dela Cruz",
            type: "Travel",
            category: "Transportation",
            amount: 1200,
            status: "Pending",
            img: image,
          },
          {
            id: 2,
            employee: "Maria Santos",
            type: "Medical",
            category: "Consultation",
            amount: 800,
            status: "Approved",
            img: "/receipt2.png",
          },
        ]);
      }
    };
    
    fetchClaims();
  }, []);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [tempStatus, setTempStatus] = useState("Pending");
  const [zoomedImage, setZoomedImage] = useState(null); // ✅ for zoom
  const [openTermsDialog, setOpenTermsDialog] = useState(false);


  const handleViewClick = (claim) => {
    setSelectedClaim(claim);
    setTempStatus(claim.status);
  };

  const handleStatusChange = (value) => {
    setTempStatus(value);
  };

  const handleSubmit = () => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id ? { ...c, status: tempStatus } : c
      )
    );
    setSelectedClaim(null);
  };

  return (
    <div className="p-6 -mt-10">
      {/* ✅ Pending Claims */}
      <div>
        <h2 className="text-xl font-bold mb-3">Pending Claims</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100">
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-2xl font-bold text-blue-700">{claims.filter(c => c.status === 'Pending').length}</span>
              <span className="text-sm text-blue-700">Pending</span>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200 hover:bg-green-100">
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-2xl font-bold text-green-700">{claims.filter(c => c.status === 'Approved').length}</span>
              <span className="text-sm text-green-700">Approved</span>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 hover:bg-red-100">
            <CardContent className="flex flex-col items-center py-6">
              <span className="text-2xl font-bold text-red-700">{claims.filter(c => c.status === 'Rejected').length}</span>
              <span className="text-sm text-red-700">Rejected</span>
            </CardContent>
          </Card>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-10">Employee</TableHead>
              <TableHead className="px-10">Type</TableHead>
              <TableHead className="px-10">Category</TableHead>
              <TableHead className="px-10">Amount</TableHead>
              <TableHead className="px-10">Status</TableHead>
              <TableHead className="px-10">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims
              .filter((c) => c.status === "Pending")
              .map((claim) => (
                <TableRow
                  key={claim.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <TableCell className="text-md px-10 font-medium">
                    {claim.employee}
                  </TableCell>
                  <TableCell className="text-md px-10">{claim.type}</TableCell>
                  <TableCell className="text-md px-10">
                    {claim.category}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    ₱{claim.amount}
                  </TableCell>
                  <TableCell className="text-md px-10">
                    <Badge variant="secondary">{claim.status}</Badge>
                  </TableCell>
                  <TableCell className="text-md px-10">
                    <Button onClick={() => handleViewClick(claim)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Claim Details Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-2xl rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Claim Details
            </DialogTitle>
            <DialogDescription>
              Review and take action on this claim
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="grid grid-cols-2 gap-6 mt-4">
              {/* Left: Claim Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Employee:</span>
                  <span>{selectedClaim.employee}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Type:</span>
                  <span>{selectedClaim.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Category:</span>
                  <span>{selectedClaim.category}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">Amount:</span>
                  <span>₱{selectedClaim.amount}</span>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <Select value={tempStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Receipt */}
              <div className="border rounded-xl p-4 bg-muted/30">
                <p className="font-semibold mb-2">Receipt</p>
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setZoomedImage(selectedClaim.img)} // ✅ set zoom
                >
                  <img
                    src={selectedClaim.img}
                    alt="Receipt"
                    className="w-full h-auto rounded-lg object-contain max-h-[280px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm">Click to Zoom</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Zoom Image Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
          <img
            src={zoomedImage || ""}
            alt="Zoomed Receipt"
            className="w-full h-auto rounded-lg object-contain max-h-[90vh] mx-auto"
          />
        </DialogContent>
      </Dialog>
      <div className="w-full justify-center flex">
        <p className="text-sm text-blue-500 py-5 cursor-pointer" onClick={() => setOpenTermsDialog(true)}>Terms & Conditions</p>
      </div>
      <TermsDialog className="w-full" open={openTermsDialog} onOpenChange={setOpenTermsDialog} />

    </div>
  );
}