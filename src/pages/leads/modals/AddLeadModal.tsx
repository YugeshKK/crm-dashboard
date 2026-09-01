import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from 'libphonenumber-js';
import CustomPhoneInput from "@/components/ui/phoneInput/CustomPhoneInput";

const leadSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Only letters, spaces, hyphens, and apostrophes allowed",
    ),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .regex(
      /^[a-zA-Z\s\-']+$/,
      "Only letters, spaces, hyphens, and apostrophes allowed",
    ),

  phoneNo: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-() ]+$/, "Invalid phone format")
    .refine(
      (value) => {
        if (!value) return false;
        // Add '+' if missing
        const formatted = value.startsWith('+') ? value : `+${value}`;
        try {
          return isValidPhoneNumber(formatted);
        } catch {
          return false;
        }
    },
      { message: 'Invalid phone number for the selected country' }
    ),
    

  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(100, "Email is too long")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),

  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company name is too long")
    .regex(/^[a-zA-Z0-9\s\-&,.]+$/, "Invalid company name"),

  address: z
    .string()
    .min(5, "Address is Required")
    .max(100, "Address is too long")
    .regex(/^[a-zA-Z0-9\s\-&,.]+$/, "Invalid Address name"),

  leadSource: z.string(),

  owner: z.string().min(1, "Owner is required"),

  leadScore: z.number().max(100, "Score must be between 0 and 100"),

  expectedValue: z
    .string()
    .regex(/^[0-9,.]*$/, "Only numbers, commas, and periods allowed")
    .optional(),

  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

interface AddLeadModalProps {
  isAddLeadOpen: boolean;
  setisAddLeadOpen: (open: boolean) => void;
  onAddLead: (newLead: LeadFormData) => void;
}

export function AddLeadModal({
  isAddLeadOpen,
  setisAddLeadOpen,
  onAddLead,
}: AddLeadModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNo: "",
      email: "",
      company: "",
      address: "",
      leadSource: "",
      owner: "Arjun Patel",
      leadScore: 0,
      expectedValue: "",
      notes: "",
    },
  });

  const handleFormSubmit = (data: LeadFormData) => {
    onAddLead(data);
    setisAddLeadOpen(false);
  };

  useEffect(()=>{
    reset();
  },[isAddLeadOpen]);

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

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Scrollable form area */}
          <div className="px-6 max-h-[60vh] overflow-y-auto">
            {/* Contact Information */}
            <div className="space-y-4 py-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider col-span-2">
                Contact Information
              </h3>

              {/* Grid container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName">First Name</label>
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "First Name is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          className="w-full"
                          id="firstName"
                          placeholder="Enter first name"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName">Last Name</label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          className="w-full"
                          id="lastName"
                          placeholder="Enter last name"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone">Phone</label>
                  <div className="flex gap-2">
                    <Controller
                      name="phoneNo"
                      control={control}
                      render={({ field, fieldState }) => (
                        <div>
                          <CustomPhoneInput
                            value={field.value}
                            onChange={field.onChange}
                          />
                          {fieldState.error && (
                            <p className="text-red-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Email</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="email"
                          type="email"
                          className="w-full"
                          placeholder="Enter email address"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="company">Company</label>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="company"
                          className="w-full"
                          placeholder="Enter company name"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="address">Address</label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="address"
                          className="w-full"
                          placeholder="Enter address"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Lead Source */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="source">Lead Source</label>
                  <Controller
                    name="leadSource"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="source">
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
                    )}
                  />
                </div>

                {/* Owner */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="owner">Owner</label>
                  <Controller
                    name="owner"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="owner">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arjun Patel">
                            Arjun Patel
                          </SelectItem>
                          <SelectItem value="John Doe">John Doe</SelectItem>
                          <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                          <SelectItem value="Mike Johnson">
                            Mike Johnson
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Lead Score */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="leadScore">Lead Score</label>
                  <Controller
                    name="leadScore"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="leadScore"
                        type="number"
                        placeholder="Enter score (0-100)"
                        min="0"
                        max="100"
                        className="w-full"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />
                </div>

                {/* Expected Value */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="expectedValue">Expected Value</label>
                  <Controller
                    name="expectedValue"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="expectedValue"
                        className="w-full"
                        placeholder="Enter expected value"
                        {...field}
                      />
                    )}
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
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      id="notes"
                      placeholder="Add notes about this lead..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <DialogFooter className="border-t  sticky bottom-0 p-4">
            <div className="flex gap-3 pr-2">
              <Button
                variant="outline"
                type="button"
                style={{ backgroundColor: "var(--background)" }}
                onClick={() => {
                  setisAddLeadOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Lead</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddLeadModal;
