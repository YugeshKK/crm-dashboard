import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Props for the modal
interface AddLeadModalProps {
  isAddLeadOpen: boolean;
  setisAddLeadOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddLeadModal({
  isAddLeadOpen,
  setisAddLeadOpen,
}: AddLeadModalProps) {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    source: "",
    owner: "Arjun Patel", // default
    status: "new",
    leadScore: "",
    expectedValue: "",
    notes: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // You can validate and then call onAddLead with formData
    console.log("Submitting lead:", formData);
    // Reset form if needed
  };

  return (
    <Dialog open={isAddLeadOpen} onOpenChange={setisAddLeadOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Add New Lead
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Enter the lead information below
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form area */}
        <div className="px-6 max-h-[60vh] overflow-y-auto">
          {/* Contact Information */}
        <div className="space-y-4 py-4">
              {/* Heading spans both columns */}
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider col-span-2">
                Contact Information
              </h3>

              {/* Grid container: 1 column on small screens, 2 on medium+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="fullName">First Name</label>
                  <Input
                    className="w-70"
                    id="fullName"
                    placeholder="Enter full name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="fullName">Last Name</label>
                  <Input
                    className="w-70"
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>

                {/* Phone (spans full width if needed, or keep in one column) */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="phone">Phone</label>
                  <div className="flex gap-2">
                    <Select value="+91" disabled>
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      className="flex-1"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="email">Email</label>
                  <Input
                  className="w-70"
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="company">Company</label>
                  <Input
                    className="w-70"
                    id="company"
                    placeholder="Enter company name"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </div>

                {/* Lead Source */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="source">Lead Source</label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleChange("source", value)}
                  >
                    <SelectTrigger className="w-70" id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                      <SelectItem value="coldcall">Cold Call</SelectItem>
                      <SelectItem value="advertisement">
                        Advertisement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Owner */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="owner">Owner</label>
                  <Select
                    value={formData.owner}
                    onValueChange={(value) => handleChange("owner", value)}
                  >
                    <SelectTrigger className="w-70" id="owner">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arjun Patel">Arjun Patel</SelectItem>
                      <SelectItem value="John Doe">John Doe</SelectItem>
                      <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lead Score */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="leadScore">Lead Score</label>
                  <Input
                    id="leadScore"
                    type="number"
                    placeholder="Enter score (0-100)"
                    min="0"
                    max="100"
                    value={formData.leadScore}
                    onChange={(e) => handleChange("leadScore", e.target.value)}
                    className="w-70"
                  />
                </div>

                {/* Expected Value */}
                <div className="flex flex-col gap-3">
                  <label htmlFor="expectedValue">Expected Value</label>
                  <Input
                  className="w-70"
                    id="expectedValue"
                    placeholder="Enter expected value"
                    value={formData.expectedValue}
                    onChange={(e) =>
                      handleChange("expectedValue", e.target.value)
                    }
                  />
                </div>
              </div>
         </div>

          {/* Additional Information */}
          <div className="space-y-4 py-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
              Additional Information
            </h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                placeholder="Add notes about this lead..."
                className="rounded-xl p-2 resize-none"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <DialogFooter className="border-t bg-gray-50 sticky bottom-0">
          <div className="flex gap-3 p-2">
            <Button variant="outline" onClick={() => setisAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Lead</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddLeadModal;
