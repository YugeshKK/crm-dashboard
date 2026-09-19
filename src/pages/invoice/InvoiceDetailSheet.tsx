import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Printer,
  Mail,
  Download,
  Pencil,
  Save,
  Check,
  Loader2,
  AlertCircle,
  IndianRupee,
  Calendar,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// TYPES
// ============================================================
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  linkedOrderId?: string;
  paymentMethod?: string;
  notes?: string;
  terms?: string;
  lineItems: {
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  timeline: {
    label: string;
    date: string;
    time?: string;
    value?: string;
    state: "done" | "current" | "pending";
  }[];
}

interface InvoiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceDetail | null;
  onSave?: (updated: InvoiceDetail) => void;
}

// ============================================================
// STATUS CONFIG
// ============================================================
const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  sent: {
    label: "Sent",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  partial: {
    label: "Partial",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  paid: {
    label: "Paid",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  overdue: {
    label: "Overdue",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  void: {
    label: "Void",
    className:
      "bg-muted text-muted-foreground",
  },
};

// Terminal statuses — can't be edited
const LOCKED_STATUSES: InvoiceStatus[] = ["paid", "void"];

// ============================================================
// HELPERS
// ============================================================
const formatINR = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const TimelineDot = ({ state }: { state: "done" | "current" | "pending" }) => {
  if (state === "done") {
    return (
      <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40">
        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
      </div>
    );
  }
  if (state === "current") {
    return (
      <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40">
        <Loader2 className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }
  return (
    <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-muted">
      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
    </div>
  );
};

// ============================================================
// EDIT FORM
// ============================================================
type EditFormData = {
  status: InvoiceStatus;
  dueDate: string;
  amountPaid: number;
  paymentMethod: string;
  notes: string;
  terms: string;
};

// ============================================================
// MAIN
// ============================================================
export function InvoiceDetailsSheet({
  open,
  onOpenChange,
  invoice,
  onSave,
}: InvoiceDetailsSheetProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<EditFormData>({
    defaultValues: {
      status: "draft",
      dueDate: "",
      amountPaid: 0,
      paymentMethod: "",
      notes: "",
      terms: "",
    },
  });

  useEffect(() => {
    if (invoice && open) {
      reset({
        status: invoice.status,
        dueDate: invoice.dueDate,
        amountPaid: invoice.amountPaid,
        paymentMethod: invoice.paymentMethod || "",
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
      setIsEditing(false);
    }
  }, [invoice, open, reset]);

  const isLocked = invoice ? LOCKED_STATUSES.includes(invoice.status) : false;
  const watchedAmountPaid = watch("amountPaid");

  const computedAmountDue = useMemo(() => {
    if (!invoice) return 0;
    return Math.max(0, invoice.amount - (watchedAmountPaid || 0));
  }, [invoice, watchedAmountPaid]);

  const onSubmit = (data: EditFormData) => {
    if (!invoice) return;
    const updated: InvoiceDetail = {
      ...invoice,
      status: data.status,
      dueDate: data.dueDate,
      amountPaid: data.amountPaid,
      amountDue: Math.max(0, invoice.amount - data.amountPaid),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      terms: data.terms,
    };
    onSave?.(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (invoice) {
      reset({
        status: invoice.status,
        dueDate: invoice.dueDate,
        amountPaid: invoice.amountPaid,
        paymentMethod: invoice.paymentMethod || "",
        notes: invoice.notes || "",
        terms: invoice.terms || "",
      });
    }
    setIsEditing(false);
  };

  if (!invoice) return null;

  const cfg = statusConfig[invoice.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {isEditing ? "Edit Invoice" : "Invoice Details"}
            </SheetTitle>
            <SheetClose asChild>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            /* ==================== EDIT MODE ==================== */
            <form
              id="edit-invoice-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-5 space-y-6"
            >
              {/* Status */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Invoice Status</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mark as paid once the full amount is received.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="status">Status</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Payment
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="amountPaid">Amount Paid (₹)</label>
                  <Controller
                    name="amountPaid"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="amountPaid"
                        type="number"
                        min="0"
                        max={invoice.amount}
                        disabled={isLocked}
                        {...field}
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount Due: <strong>{formatINR(computedAmountDue)}</strong>
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dueDate">Due Date</label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Input id="dueDate" type="date" disabled={isLocked} {...field} />
                    )}
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Terms & Notes</h3>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="terms">Terms</label>
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="terms"
                        rows={2}
                        className="resize-none"
                        placeholder="e.g. Net 30"
                        disabled={isLocked}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="notes">Internal Notes</label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="notes"
                        rows={3}
                        className="resize-none"
                        placeholder="Add internal notes..."
                        disabled={isLocked}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {isLocked && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    This invoice is {invoice.status} and cannot be edited.
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* ==================== VIEW MODE ==================== */
            <div className="px-5 py-5 space-y-6">
              {/* Invoice ID */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{invoice.invoiceNumber}</h2>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Issued on {invoice.issueDate}
                  {invoice.linkedOrderId && ` • Order ${invoice.linkedOrderId}`}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Send
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                </div>
              </div>

              {/* Amount summary */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Invoice Amount</span>
                  <span className="font-medium">{formatINR(invoice.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    {formatINR(invoice.amountPaid)}
                  </span>
                </div>
                <div className="border-t pt-2.5 flex items-center justify-between">
                  <span className="font-semibold">Amount Due</span>
                  <span
                    className={`font-bold text-base ${
                      invoice.amountDue > 0 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {formatINR(invoice.amountDue)}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Bill To
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {getInitials(invoice.customer)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{invoice.customer}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {invoice.customerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {invoice.customerPhone}
                    </p>
                    {invoice.customerAddress && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {invoice.customerAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Line Items
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 text-muted-foreground uppercase text-[10px]">
                        <th className="text-left px-3 py-2 font-medium">Item</th>
                        <th className="text-right px-2 py-2 font-medium">Qty</th>
                        <th className="text-right px-2 py-2 font-medium">Rate</th>
                        <th className="text-right px-3 py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{item.description}</td>
                          <td className="px-2 py-2 text-right">{item.qty}</td>
                          <td className="px-2 py-2 text-right">
                            {formatINR(item.rate)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Timeline
                </p>
                <ul className="relative">
                  <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border" />
                  {invoice.timeline.map((step, i) => {
                    const isLast = i === invoice.timeline.length - 1;
                    return (
                      <li
                        key={i}
                        className={`relative flex gap-3 ${isLast ? "" : "pb-4"}`}
                      >
                        <TimelineDot state={step.state} />
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm leading-tight ${
                                step.state === "pending"
                                  ? "text-muted-foreground"
                                  : "font-medium"
                              }`}
                            >
                              {step.label}
                            </p>
                            {step.value && (
                              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {step.value}
                              </span>
                            )}
                          </div>
                          {step.state === "pending" ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              Pending
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.date}
                              {step.time ? `, ${step.time}` : ""}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Terms / Notes */}
              {invoice.terms && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Terms
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                    {invoice.terms}
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Internal Notes
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {invoice.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex gap-3 bg-background">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-invoice-form"
                disabled={!isDirty || isLocked}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isLocked}
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit Invoice
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default InvoiceDetailsSheet;