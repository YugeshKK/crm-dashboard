import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  Mail,
  Printer,
  Receipt,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  FileText,
  ExternalLink,
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
export type PaymentStatus =
  | "received"
  | "pending"
  | "failed"
  | "partial"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod =
  | "bank_transfer"
  | "upi"
  | "cheque"
  | "cash"
  | "card"
  | "other";

export interface PaymentDetail {
  id: string;
  paymentNumber: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  invoiceNumber: string;
  orderNumber?: string;
  amount: number;
  refunded: number;
  date: string;
  time: string;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  notes?: string;
  timeline: {
    label: string;
    date: string;
    time?: string;
    value?: string;
    state: "done" | "current" | "pending";
  }[];
}

interface PaymentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentDetail | null;
  onRefund?: (paymentId: string, amount: number, reason: string) => void;
}

// ============================================================
// CONFIG
// ============================================================
const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  received: {
    label: "Received",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  partial: {
    label: "Partial",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  partially_refunded: {
    label: "Partially Refunded",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

const methodlabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  cash: "Cash",
  card: "Card",
  other: "Other",
};

// Refundable statuses (can initiate refund)
const REFUNDABLE: PaymentStatus[] = ["received", "partial"];

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

const TimelineDot = ({
  state,
}: {
  state: "done" | "current" | "pending";
}) => {
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
// MAIN
// ============================================================
export function PaymentDetailsSheet({
  open,
  onOpenChange,
  payment,
  onRefund,
}: PaymentDetailsSheetProps) {
  const [isRefundMode, setIsRefundMode] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");

  const maxRefund = payment ? payment.amount - payment.refunded : 0;
  const isRefundable =
    payment && REFUNDABLE.includes(payment.status) && maxRefund > 0;

  useEffect(() => {
    if (payment && open) {
      setIsRefundMode(false);
      setRefundAmount(maxRefund);
      setRefundReason("");
    }
  }, [payment, open, maxRefund]);

  if (!payment) return null;

  const cfg = statusConfig[payment.status];

  const handleRefund = () => {
    if (!payment || refundAmount <= 0 || refundAmount > maxRefund) return;
    onRefund?.(payment.id, refundAmount, refundReason);
    setIsRefundMode(false);
  };

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
              {isRefundMode ? "Issue Refund" : "Payment Details"}
            </SheetTitle>
            <SheetClose asChild>
              <button className="text-muted-foreground hover:text-foreground">
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isRefundMode ? (
            /* ==================== REFUND MODE ==================== */
            <div className="px-5 py-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Refund Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Refund part or all of {formatINR(payment.amount)} to{" "}
                  {payment.customer}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-medium">{formatINR(payment.amount)}</span>
                </div>
                {payment.refunded > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Refunded</span>
                    <span className="font-medium text-orange-500">
                      {formatINR(payment.refunded)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Max Refundable</span>
                  <span>{formatINR(maxRefund)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="refundAmount">Refund Amount (₹)</label>
                <Input
                  id="refundAmount"
                  type="number"
                  min="0"
                  max={maxRefund}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                />
                {refundAmount > maxRefund && (
                  <p className="text-xs text-red-500">
                    Cannot exceed {formatINR(maxRefund)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="refundReason">Reason</label>
                <textarea
                  id="refundReason"
                  rows={3}
                  className="resize-none"
                  placeholder="Why is this refund being issued?"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20 px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Refunds are irreversible. The linked invoice will be updated
                  accordingly.
                </p>
              </div>
            </div>
          ) : (
            /* ==================== VIEW MODE ==================== */
            <div className="px-5 py-5 space-y-6">
              {/* Payment ID + status */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{payment.paymentNumber}</h2>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Received on {payment.date} at {payment.time}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>
                  {isRefundable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 text-orange-600 border-orange-300 hover:text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                      onClick={() => setIsRefundMode(true)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refund
                    </Button>
                  )}
                </div>
              </div>

              {/* Amount summary */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Amount</span>
                  <span className="font-medium">{formatINR(payment.amount)}</span>
                </div>
                {payment.refunded > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Refunded</span>
                    <span className="font-medium text-orange-500">
                      - {formatINR(payment.refunded)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2.5 flex items-center justify-between">
                  <span className="font-semibold">Net Received</span>
                  <span className="font-bold text-base text-green-600">
                    {formatINR(payment.amount - payment.refunded)}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Customer
                </p>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {getInitials(payment.customer)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{payment.customer}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {payment.customerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {payment.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked documents */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Linked Documents
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Invoice
                        </p>
                        <p className="text-xs font-mono font-medium text-blue-600 truncate">
                          {payment.invoiceNumber}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  {payment.orderNumber && (
                    <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Receipt className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase">
                            Order
                          </p>
                          <p className="text-xs font-mono font-medium text-purple-600 truncate">
                            {payment.orderNumber}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Payment Information
                </p>
                <div className="rounded-lg border p-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{methodlabels[payment.method]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reference No.</span>
                    <span className="font-mono text-xs">{payment.reference}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{payment.date}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Payment Timeline
                </p>
                <ul className="relative">
                  <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border" />
                  {payment.timeline.map((step, i) => {
                    const isLast = i === payment.timeline.length - 1;
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

              {/* Notes */}
              {payment.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {payment.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex gap-3 bg-background">
          {isRefundMode ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsRefundMode(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
                disabled={
                  refundAmount <= 0 ||
                  refundAmount > maxRefund ||
                  !refundReason.trim()
                }
                onClick={handleRefund}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Confirm Refund
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default PaymentDetailsSheet;