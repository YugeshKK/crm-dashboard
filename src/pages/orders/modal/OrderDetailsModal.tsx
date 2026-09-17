import React from "react";
import {
  X,
  Printer,
  MoreHorizontal,
  Check,
  Loader2,
  Package,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ============================================================
// TYPES
// ============================================================
type PaymentStatus = "paid" | "partial" | "unpaid";
type FulfillmentStatus =
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "confirmed";

export interface OrderDetail {
  id: string;
  orderId: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  orderTime: string;
  source: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: number;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  timeline: {
    label: string;
    date: string;
    time?: string;
    value?: string;
    state: "done" | "current" | "pending";
  }[];
}

interface OrderDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: OrderDetail | null;
}

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

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  partial: {
    label: "Partial",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const fulfillmentStatusConfig: Record<
  FulfillmentStatus,
  { label: string; className: string }
> = {
  processing: {
    label: "Processing",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  ready_to_ship: {
    label: "Ready to Ship",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  shipped: {
    label: "Shipped",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

// ============================================================
// TIMELINE DOT
// ============================================================
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
// MAIN COMPONENT
// ============================================================
export function OrderDetailsSheet({
  open,
  onOpenChange,
  order,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  const paymentCfg = paymentStatusConfig[order.paymentStatus];
  const fulfillmentCfg = fulfillmentStatusConfig[order.fulfillmentStatus];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[440px] p-0 flex flex-col overflow-hidden"
      >
        {/* ==================== HEADER ==================== */}
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">Order Details</SheetTitle>
            <SheetClose asChild>
              <button className="text-muted-foreground hover:text-foreground">
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* ==================== BODY ==================== */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500">
          <div className="px-5 py-5 space-y-6">
            {/* ---------- ORDER ID + STATUS ---------- */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{order.orderId}</h2>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${fulfillmentCfg.className}`}
                >
                  {fulfillmentCfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Placed on {order.orderDate} at {order.orderTime} via {order.source}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      More
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Duplicate Order</DropdownMenuItem>
                    <DropdownMenuItem>Download Invoice</DropdownMenuItem>
                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* ---------- CUSTOMER ---------- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Customer
                </p>
                <button className="text-xs text-blue-600 hover:underline">
                  View Customer
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                  {getInitials(order.customer)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {order.customer}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {order.customerEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- ORDER SUMMARY ---------- */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Order Summary
              </p>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({order.items} items)
                  </span>
                  <span className="font-medium">{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-red-500">
                    - {formatINR(order.discount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">{formatINR(order.tax)}</span>
                </div>
                <div className="border-t pt-2.5 flex items-center justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-base">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* ---------- ORDER TIMELINE ---------- */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Order Timeline
              </p>
              <ul className="relative">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-3 bottom-3 w-px bg-border" />

                {order.timeline.map((step, i) => {
                  const isLast = i === order.timeline.length - 1;
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
          </div>
        </div>

        {/* ==================== FOOTER ==================== */}
        <div className="border-t px-5 py-4 flex gap-3 bg-background">
          <Button variant="outline" className="flex-1">
            View Full Details
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            Edit Order
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default OrderDetailsSheet;