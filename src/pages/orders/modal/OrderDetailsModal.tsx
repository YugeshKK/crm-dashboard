import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Printer,
  MoreHorizontal,
  Check,
  Loader2,
  Truck,
  AlertCircle,
  Pencil,
  Save,
  XCircle,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ============================================================
// TYPES
// ============================================================
export type PaymentStatus = "paid" | "partial" | "unpaid";
export type FulfillmentStatus =
  | "draft"
  | "pending_approval"
  | "confirmed"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  trackingNumber?: string;
  carrier?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPincode?: string;
  expectedDeliveryDate?: string;
  shippingMethod?: "standard" | "express" | "pickup";
  notes?: string;
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
  onSave?: (updated: OrderDetail) => void;
}

// ============================================================
// STATUS FLOW — defines the linear progression of fulfillment
// ============================================================
const FULFILLMENT_FLOW: FulfillmentStatus[] = [
  "draft",
  "pending_approval",
  "confirmed",
  "processing",
  "ready_to_ship",
  "shipped",
  "delivered",
];

// Statuses where editing is locked (terminal states)
const LOCKED_STATUSES: FulfillmentStatus[] = ["delivered", "cancelled"];

// ============================================================
// STATUS CONFIG
// ============================================================
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
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  pending_approval: {
    label: "Pending Approval",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
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
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

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

/**
 * Returns the list of statuses the user can transition to from the current one.
 * Rules:
 *  - Terminal statuses (delivered, cancelled) → no transitions.
 *  - Once "shipped", can only move forward to "delivered".
 *  - Before "shipped", the user can only move FORWARD in the flow (or cancel).
 *  - Cancellation is only allowed before "shipped".
 */
export const getAvailableStatusTransitions = (
  current: FulfillmentStatus
): FulfillmentStatus[] => {
  if (LOCKED_STATUSES.includes(current)) return [];

  const currentIndex = FULFILLMENT_FLOW.indexOf(current);
  if (currentIndex === -1) return [];

  const forward = FULFILLMENT_FLOW.slice(currentIndex + 1);

  // Can't cancel after shipped
  const canCancel = currentIndex < FULFILLMENT_FLOW.indexOf("shipped");
  return canCancel ? [...forward, "cancelled"] : forward;
};

/** Whether the user can edit this order at all */
export const isOrderEditable = (status: FulfillmentStatus) =>
  !LOCKED_STATUSES.includes(status);

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
// EDIT FORM TYPES
// ============================================================
type EditFormData = {
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingMethod: "standard" | "express" | "pickup";
  expectedDeliveryDate: string;
  trackingNumber: string;
  carrier: string;
  notes: string;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export function OrderDetailsSheet({
  open,
  onOpenChange,
  order,
  onSave,
}: OrderDetailsSheetProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<EditFormData>({
    defaultValues: {
      paymentStatus: "unpaid",
      fulfillmentStatus: "draft",
      shippingMethod: "standard",
      expectedDeliveryDate: "",
      trackingNumber: "",
      carrier: "",
      notes: "",
    },
  });

  // Reset when order changes / sheet opens
  useEffect(() => {
    if (order && open) {
      reset({
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        shippingMethod: order.shippingMethod || "standard",
        expectedDeliveryDate: order.expectedDeliveryDate || "",
        trackingNumber: order.trackingNumber || "",
        carrier: order.carrier || "",
        notes: order.notes || "",
      });
      setIsEditing(false);
    }
  }, [order, open, reset]);

  const watchedStatus = watch("fulfillmentStatus");

  const availableTransitions = useMemo(() => {
    if (!order) return [];
    // If the user hasn't changed the status, still show valid next steps
    return getAvailableStatusTransitions(order.fulfillmentStatus);
  }, [order]);

  const isLocked = order ? !isOrderEditable(order.fulfillmentStatus) : false;

  const onSubmit = (data: EditFormData) => {
    if (!order) return;
    const updated: OrderDetail = {
      ...order,
      paymentStatus: data.paymentStatus,
      fulfillmentStatus: data.fulfillmentStatus,
      shippingMethod: data.shippingMethod,
      expectedDeliveryDate: data.expectedDeliveryDate,
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      notes: data.notes,
      // Append to timeline if status changed
      timeline:
        data.fulfillmentStatus !== order.fulfillmentStatus
          ? [
              ...order.timeline,
              {
                label: `Status changed to ${
                  fulfillmentStatusConfig[data.fulfillmentStatus].label
                }`,
                date: new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                time: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                state: "done",
              },
            ]
          : order.timeline,
    };
    onSave?.(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (order) {
      reset({
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        shippingMethod: order.shippingMethod || "standard",
        expectedDeliveryDate: order.expectedDeliveryDate || "",
        trackingNumber: order.trackingNumber || "",
        carrier: order.carrier || "",
        notes: order.notes || "",
      });
    }
    setIsEditing(false);
  };

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
            <SheetTitle className="text-base font-semibold">
              {isEditing ? "Edit Order" : "Order Details"}
            </SheetTitle>
            <SheetClose asChild>
              <button className="text-muted-foreground hover:text-foreground">
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* ==================== BODY ==================== */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            /* ==================== EDIT MODE ==================== */
            <form
              id="edit-order-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-5 space-y-6"
            >
              {/* Status section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Order Status</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Status can only move forward. Cancellation is disabled once shipped.
                  </p>
                </div>

                {/* Fulfillment status */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fulfillmentStatus">Fulfillment Status</label>
                  <Controller
                    name="fulfillmentStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked || availableTransitions.length === 0}
                      >
                        <SelectTrigger id="fulfillmentStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Include current as disabled option */}
                          <SelectItem value={order.fulfillmentStatus} disabled>
                            {fulfillmentStatusConfig[order.fulfillmentStatus].label}{" "}
                            (current)
                          </SelectItem>
                          {availableTransitions.map((s) => (
                            <SelectItem key={s} value={s}>
                              {fulfillmentStatusConfig[s].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {isLocked && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      This order is {order.fulfillmentStatus} and cannot be edited.
                    </p>
                  )}
                </div>

                {/* Payment status */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="paymentStatus">Payment Status</label>
                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked}
                      >
                        <SelectTrigger id="paymentStatus">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Shipping section – only relevant if shipped/ready_to_ship */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Shipping
                  </h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="shippingMethod">Shipping Method</label>
                  <Controller
                    name="shippingMethod"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLocked}
                      >
                        <SelectTrigger id="shippingMethod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (5–7 days)</SelectItem>
                          <SelectItem value="express">Express (2–3 days)</SelectItem>
                          <SelectItem value="pickup">Customer Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="carrier">Carrier</label>
                    <Controller
                      name="carrier"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="carrier"
                          placeholder="e.g. BlueDart"
                          disabled={isLocked}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="trackingNumber">Tracking No.</label>
                    <Controller
                      name="trackingNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="trackingNumber"
                          placeholder="e.g. BD123456789"
                          disabled={isLocked}
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                  <Controller
                    name="expectedDeliveryDate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="expectedDeliveryDate"
                        type="date"
                        disabled={isLocked}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Notes section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Internal Notes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visible to staff only
                  </p>
                </div>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      rows={4}
                      className="resize-none"
                      placeholder="Add notes about this order..."
                      disabled={isLocked}
                      {...field}
                    />
                  )}
                />
              </div>
            </form>
          ) : (
            /* ==================== VIEW MODE ==================== */
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

              {/* ---------- PAYMENT STATUS ---------- */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Payment Status
                </p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${paymentCfg.className}`}
                >
                  {paymentCfg.label}
                </span>
              </div>

              {/* ---------- SHIPPING ---------- */}
              {(order.trackingNumber || order.carrier || order.expectedDeliveryDate) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Shipping
                  </p>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    {order.carrier && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span className="font-medium">{order.carrier}</span>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking No.</span>
                        <span className="font-mono text-xs">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                    {order.expectedDeliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected</span>
                        <span className="font-medium">
                          {order.expectedDeliveryDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ---------- ORDER TIMELINE ---------- */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Timeline
                </p>
                <ul className="relative">
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

              {/* ---------- NOTES ---------- */}
              {order.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Internal Notes
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================== FOOTER ==================== */}
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
                form="edit-order-form"
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
                Edit Order
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

export default OrderDetailsSheet;