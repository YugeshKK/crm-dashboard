import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import CustomPhoneInput from "@/components/ui/phoneInput/CustomPhoneInput";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";

// Zod schema for customer
const customerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .regex(/^[a-zA-Z\s\-']+$/, "Only letters, spaces, hyphens, and apostrophes allowed"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .regex(/^[a-zA-Z\s\-']+$/, "Only letters, spaces, hyphens, and apostrophes allowed"),

  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required")
    .max(100, "Email is too long")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),

  phoneNo: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-() ]+$/, "Invalid phone format")
    .refine(
      (value) => {
        if (!value) return false;
        const formatted = value.startsWith("+") ? value : `+${value}`;
        try {
          return isValidPhoneNumber(formatted);
        } catch {
          return false;
        }
      },
      { message: "Invalid phone number for the selected country" }
    ),

  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company name is too long")
    .regex(/^[a-zA-Z0-9\s\-&,.]+$/, "Invalid company name"),

  source: z.string().min(1, "Source is required"),

  owner: z.string().min(1, "Owner is required"),

  status: z.enum(["active", "inactive", "pending", "blocked"]).default("active"),

  notes: z.string().max(1000, "Notes are too long").optional(),
});

type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormData = z.output<typeof customerSchema>;

interface AddCustomerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerModal({
  isOpen,
  onOpenChange
}: AddCustomerModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      company: "",
      source: "",
      owner: "Arjun Patel",
      status: "active",
      notes: "",
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    onOpenChange(false);
    reset();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
 <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Add New Customer</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Enter the customer information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 max-h-[60vh] overflow-y-auto scrollbar-none">
            <div className="space-y-4 py-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider col-span-2">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName">First Name</label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          className="w-full"
                          id="firstName"
                          placeholder="Enter first name"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-red-500">{fieldState.error.message}</p>
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
                          <p className="text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
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
                          <p className="text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone">Phone</label>
                  <Controller
                    name="phoneNo"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <CustomPhoneInput
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
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
                          <p className="text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Source */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="source">Customer Source</label>
                  <Controller
                    name="source"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="source">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Website">Website</SelectItem>
                            <SelectItem value="Referral">Referral</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Exhibition">Exhibition</SelectItem>
                            <SelectItem value="Cold Call">Cold Call</SelectItem>
                            <SelectItem value="Advertisement">Advertisement</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Owner */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="owner">Owner</label>
                  <Controller
                    name="owner"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="owner">
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arjun Patel">Arjun Patel</SelectItem>
                            <SelectItem value="John Doe">John Doe</SelectItem>
                            <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                            <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <p className="text-red-500">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="status">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
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
                      placeholder="Add notes about this customer..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t sticky bottom-0 p-4">
            <div className="flex gap-3 pr-2">
              <Button
                variant="outline"
                type="button"
                style={{ backgroundColor: "var(--background)" }}
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Customer</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCustomerModal;