import React, { useMemo, useState } from "react";
import {
  Package,
  PackagePlus,
  PackageMinus,
  RefreshCw,
  Trash2,
  Edit,
  IndianRupee,
  Truck,
  AlertTriangle,
  CheckCircle2,
  User,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// ============================================================
// TYPES
// ============================================================
type ActivityType =
  | "created"
  | "stock_added"
  | "stock_removed"
  | "price_updated"
  | "details_updated"
  | "deleted"
  | "order_placed"
  | "order_delivered"
  | "low_stock_alert"
  | "status_changed";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user: string;
  timestamp: string;
  meta?: {
    quantity?: number;
    reference?: string;
    oldValue?: string;
    newValue?: string;
  };
};

// ============================================================
// ACTIVITY TYPE CONFIG (icon + colour per type)
// ============================================================
const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; bg: string; text: string }
> = {
  created: {
    icon: PackagePlus,
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
  },
  stock_added: {
    icon: PackagePlus,
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  stock_removed: {
    icon: PackageMinus,
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
  },
  price_updated: {
    icon: IndianRupee,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  details_updated: {
    icon: Edit,
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  deleted: {
    icon: Trash2,
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
  },
  order_placed: {
    icon: Truck,
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  order_delivered: {
    icon: CheckCircle2,
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
  },
  low_stock_alert: {
    icon: AlertTriangle,
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  status_changed: {
    icon: RefreshCw,
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
  },
};

// ============================================================
// DUMMY DATA
// ============================================================
const activities: Activity[] = [
  {
    id: "act-1",
    type: "stock_added",
    title: "Stock Added",
    description: "50 units added to Main Warehouse",
    user: "Arjun Patel",
    timestamp: "2 hours ago",
    meta: { quantity: 50, reference: "PO-2035" },
  },
  {
    id: "act-2",
    type: "order_delivered",
    title: "Order Delivered",
    description: "Order delivered to SunPower Energy",
    user: "System",
    timestamp: "5 hours ago",
    meta: { quantity: 22, reference: "ORD-1024" },
  },
  {
    id: "act-3",
    type: "low_stock_alert",
    title: "Low Stock Alert",
    description: "Stock fell below reorder level (50 units)",
    user: "System",
    timestamp: "1 day ago",
    meta: { quantity: 42 },
  },
  {
    id: "act-4",
    type: "price_updated",
    title: "Price Updated",
    description: "Selling price changed from ₹ 24,000 to ₹ 25,000",
    user: "Jane Smith",
    timestamp: "1 day ago",
    meta: { oldValue: "₹ 24,000", newValue: "₹ 25,000" },
  },
  {
    id: "act-5",
    type: "order_placed",
    title: "Order Placed",
    description: "New purchase order created for 100 units",
    user: "Arjun Patel",
    timestamp: "2 days ago",
    meta: { quantity: 100, reference: "PO-2031" },
  },
  {
    id: "act-6",
    type: "stock_removed",
    title: "Stock Removed",
    description: "18 units removed due to damage",
    user: "Mike Johnson",
    timestamp: "3 days ago",
    meta: { quantity: 18, reference: "ADJ-1002" },
  },
  {
    id: "act-7",
    type: "status_changed",
    title: "Status Changed",
    description: "Product status changed from Inactive to Active",
    user: "Jane Smith",
    timestamp: "4 days ago",
    meta: { oldValue: "Inactive", newValue: "Active" },
  },
  {
    id: "act-8",
    type: "details_updated",
    title: "Details Updated",
    description: "Product dimensions and weight updated",
    user: "Arjun Patel",
    timestamp: "5 days ago",
  },
  {
    id: "act-9",
    type: "created",
    title: "Product Created",
    description: "Solar Panel 550W added to catalog",
    user: "Arjun Patel",
    timestamp: "10 Aug 2024",
  },
];

// ============================================================
// FILTER OPTIONS
// ============================================================
const filterOptions = [
  { value: "all", label: "All Activity" },
  { value: "stock", label: "Stock Changes" },
  { value: "orders", label: "Orders" },
  { value: "updates", label: "Updates" },
  { value: "alerts", label: "Alerts" },
];

const matchFilter = (type: ActivityType, filter: string) => {
  if (filter === "all") return true;
  if (filter === "stock") return ["stock_added", "stock_removed"].includes(type);
  if (filter === "orders") return ["order_placed", "order_delivered"].includes(type);
  if (filter === "updates")
    return ["price_updated", "details_updated", "status_changed", "created"].includes(type);
  if (filter === "alerts") return ["low_stock_alert", "deleted"].includes(type);
  return true;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductActivity: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => matchFilter(a.type, activeFilter));
  }, [activeFilter]);

  return (
    <Card className="border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Activity</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              {filterOptions.find((f) => f.value === activeFilter)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={activeFilter} onValueChange={setActiveFilter}>
              {filterOptions.map((opt) => (
                <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto scrollbar-thin">
        {filteredActivities.length > 0 ? (
          <ul className="relative px-4 pb-4">
            {/* Vertical timeline line */}
            <div className="absolute left-[34px] top-2 bottom-6 w-px bg-border" />

            {filteredActivities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;
              const isLast = index === filteredActivities.length - 1;

              return (
                <li key={activity.id} className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}>
                  {/* Icon bubble */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${config.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${config.text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{activity.title}</p>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {activity.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>

                    {/* Meta chips (quantity, reference, old→new value) */}
                    {activity.meta && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {activity.meta.reference && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                            {activity.meta.reference}
                          </span>
                        )}
                        {activity.meta.quantity !== undefined && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              activity.type === "stock_removed"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {activity.type === "stock_removed"
                              ? `-${activity.meta.quantity} units`
                              : `+${activity.meta.quantity} units`}
                          </span>
                        )}
                        {activity.meta.oldValue && activity.meta.newValue && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="line-through">{activity.meta.oldValue}</span>
                            <span>→</span>
                            <span className="text-foreground font-medium">
                              {activity.meta.newValue}
                            </span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* User */}
                    <div className="flex items-center gap-1 mt-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {activity.user}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No activity found for this filter.
          </div>
        )}

        {/* View all link */}
        {filteredActivities.length > 0 && (
          <div className="px-4 py-3 border-t">
            <button className="text-xs text-blue-600 hover:underline">
              View all activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductActivity;