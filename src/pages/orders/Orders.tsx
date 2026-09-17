import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/DataTable";
import OrderDetailsSheet , {OrderDetail} from "./modal/OrderDetailsModal";
import CreateOrderModal from "./modal/CreateOrderModal";

// ============================================================
// TYPES
// ============================================================
type Order = {
  id: string;
  orderId: string;
  customer: string;
  orderDate: string;
  items: number;
  totalAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  fulfillmentStatus: "processing" | "ready_to_ship" | "shipped" | "delivered" | "confirmed";
  source: "customer_portal" | "salesperson" | "phone" | "email";
  status: string;
};

const buildOrderDetail = (order: Order): OrderDetail => {
  const itemsCount = order.items;
  const total = order.totalAmount;
  // Reverse-calculate subtotal, tax, discount for demo purposes
  const subtotal = Math.round(total / 1.18);
  const tax = Math.round(subtotal * 0.18);
  const discount = 5000;
  const isPaid = order.paymentStatus === "paid";
  const isProcessing = order.fulfillmentStatus === "processing";

  return {
    id: order.id,
    orderId: order.orderId,
    customer: order.customer,
    customerEmail: `contact@${order.customer.toLowerCase().replace(/\s+/g, "")}.com`,
    customerPhone: "+91 98765 43210",
    orderDate: order.orderDate,
    orderTime: "10:32 AM",
    source:
      order.source === "customer_portal"
        ? "Customer Portal"
        : order.source === "salesperson"
        ? "Salesperson"
        : order.source === "phone"
        ? "Phone"
        : "Email",
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    items: itemsCount,
    subtotal,
    discount,
    tax,
    totalAmount: total,
    timeline: [
      { label: "Order Placed", date: order.orderDate, time: "10:32 AM", state: "done" },
      { label: "Order Confirmed", date: order.orderDate, time: "11:05 AM", state: "done" },
      {
        label: "Payment Received (50%)",
        date: order.orderDate,
        time: "11:20 AM",
        value: `₹ ${(total * 0.5).toLocaleString("en-IN")}`,
        state: "done",
      },
      {
        label: "Inventory Reserved",
        date: order.orderDate,
        time: "11:25 AM",
        value: `${itemsCount} items`,
        state: "done",
      },
      {
        label: "Processing",
        date: order.orderDate,
        time: "01:10 PM",
        state: isProcessing ? "current" : "done",
      },
      { label: "Shipped", date: "", state: "pending" },
      { label: "Delivered", date: "", state: "pending" },
    ],
  };
};
// ============================================================
// DUMMY DATA
// ============================================================
const generateOrders = (): Order[] => {
  const customers = [
    "ABC Electronics",
    "SunPower Energy",
    "GreenTech Solutions",
    "Bright Future Energy",
    "EcoSolar Systems",
    "PowerGrid Distributors",
    "SolarTech Industries",
    "NextGen Solar",
  ];
  const paymentStatuses: Order["paymentStatus"][] = ["paid", "partial", "unpaid"];
  const fulfillmentStatuses: Order["fulfillmentStatus"][] = [
    "processing",
    "ready_to_ship",
    "shipped",
    "delivered",
    "confirmed",
  ];
  const sources: Order["source"][] = ["customer_portal", "salesperson", "phone", "email"];
  const statuses = [
    "draft",
    "pending_approval",
    "confirmed",
    "processing",
    "ready_to_ship",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return Array.from({ length: 128 }, (_, i) => ({
    id: `order-${i + 1}`,
    orderId: `SO-${1042 - i}`,
    customer: customers[Math.floor(Math.random() * customers.length)],
    orderDate: `${Math.floor(Math.random() * 28) + 1} May 2024`,
    items: Math.floor(Math.random() * 10) + 1,
    totalAmount: Math.floor(Math.random() * 100000) + 5000,
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    fulfillmentStatus:
      fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

// ============================================================
// COLUMN DEFINITIONS
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const createColumns = () => [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }),

  columnHelper.accessor("orderId", {
    header: "Order ID",
    cell: (info) => (
      <span className="text-xs font-mono text-blue-600 font-medium">
        {info.getValue()}
      </span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("customer", {
    header: "Customer",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-foreground">
          {getInitials(info.getValue())}
        </div>
        <span className="text-sm">{info.getValue()}</span>
      </div>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("orderDate", {
    header: "Order Date",
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
  }),

  columnHelper.accessor("items", {
    header: "Items",
    cell: (info) => <span className="text-xs">{info.getValue()} items</span>,
  }),

  columnHelper.accessor("totalAmount", {
    header: "Total Amount",
    cell: (info) => (
      <span className="text-xs font-medium">
        ₹ {info.getValue().toLocaleString("en-IN")}
      </span>
    ),
  }),

  columnHelper.accessor("paymentStatus", {
    header: "Payment Status",
    cell: (info) => {
      const map: Record<string, { label: string; className: string }> = {
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
      const v = info.getValue() as string;
      const cfg = map[v];
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
        >
          {cfg.label}
        </span>
      );
    },
  }),

  columnHelper.accessor("fulfillmentStatus", {
    header: "Fulfillment",
    cell: (info) => {
      const map: Record<string, { label: string; className: string }> = {
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
      const v = info.getValue() as string;
      const cfg = map[v];
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
        >
          {cfg.label}
        </span>
      );
    },
  }),

  columnHelper.accessor("source", {
    header: "Source",
    cell: (info) => {
      const map: Record<string, string> = {
        customer_portal: "Customer Portal",
        salesperson: "Salesperson",
        phone: "Phone",
        email: "Email",
      };
      return (
        <span className="text-xs text-muted-foreground">
          {map[info.getValue() as string]}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => (
      <button
        className="text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    ),
  }),
];

// ============================================================
// ✅ PAGE COMPONENT — NO PROPS
// ============================================================
const Orders = () => {
  // ------------------- STATE -------------------
  const [data] = useState<Order[]>(generateOrders);
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  // ------------------- DERIVED DATA -------------------
  const metrics = useMemo(() => {
    const total = data.length;
    const revenue = data.reduce((s, o) => s + o.totalAmount, 0);
    const pending = data.filter((o) => o.fulfillmentStatus === "processing").length;
    const paid = data.filter((o) => o.paymentStatus === "paid").length;
    const outstanding = data
      .filter((o) => o.paymentStatus !== "paid")
      .reduce((s, o) => s + o.totalAmount, 0);
    return { total, revenue, pending, paid, outstanding };
  }, [data]);

  const metricCards = [
    {
      title: "Total Orders",
      value: metrics.total.toLocaleString(),
      change: "+18.8%",
      positive: true,
      icon: ShoppingCart,
    },
    {
      title: "Total Revenue",
      value: `₹ ${(metrics.revenue / 10000000).toFixed(2)} Cr`,
      change: "+22.8%",
      positive: true,
      icon: IndianRupee,
    },
    {
      title: "Pending Orders",
      value: metrics.pending.toString(),
      change: "-8.3%",
      positive: false,
      icon: Clock,
    },
    {
      title: "Paid Orders",
      value: metrics.paid.toString(),
      change: "+15.2%",
      positive: true,
      icon: CheckCircle2,
    },
    {
      title: "Outstanding",
      value: `₹ ${(metrics.outstanding / 100000).toFixed(1)} L`,
      change: "-5.7%",
      positive: false,
      icon: AlertCircle,
    },
  ];

  const filterTabs = useMemo(() => {
    const count = (s: string) => data.filter((o) => o.status === s).length;
    return [
      { label: "All Orders", value: "all", count: data.length },
      { label: "Draft", value: "draft", count: count("draft") },
      { label: "Pending Approval", value: "pending_approval", count: count("pending_approval") },
      { label: "Confirmed", value: "confirmed", count: count("confirmed") },
      { label: "Processing", value: "processing", count: count("processing") },
      { label: "Ready to Ship", value: "ready_to_ship", count: count("ready_to_ship") },
      { label: "Shipped", value: "shipped", count: count("shipped") },
      { label: "Delivered", value: "delivered", count: count("delivered") },
      { label: "Cancelled", value: "cancelled", count: count("cancelled") },
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter((o) => o.status === activeTab);
  }, [data, activeTab]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(buildOrderDetail(order));
    setIsDetailsOpen(true);
  };

  const handleCreateModalOpen=()=>{
    setIsCreateOrderOpen(prev=> !prev);
  }
  // ------------------- HANDLERS -------------------
  // const handleCreateOrder = (formData: OrderFormData) => {
  //   console.log("New order:", formData);
  //   // TODO: POST to API, then update local state
  // };

  // ------------------- RENDER -------------------
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track all customer orders
          </p>
        </div>
        <Button onClick={handleCreateModalOpen} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted-foreground">{m.title}</p>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-2">{m.value}</p>
              <p
                className={`text-xs font-medium mt-1 ${
                  m.positive ? "text-green-600" : "text-red-500"
                }`}
              >
                {m.positive ? "↑" : "↓"} {m.change.replace("-", "")}{" "}
                <span className="text-muted-foreground font-normal">
                  vs last 30 days
                </span>
              </p>
            </Card>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredData}
        columns={createColumns()}
        title=""
        searchPlaceholder="Search by order ID, customer, product..."
        pageSizeOptions={[10, 25, 50, 100]}
        defaultPageSize={10}
        enableSelection={true}
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        filterTabs={filterTabs}
        activeFilter={activeTab}
        onFilterChange={setActiveTab}
        onRowClick={handleRowClick}
      />

      {/* Create Order Sheet */}
      <OrderDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        order={selectedOrder}
      />

      <CreateOrderModal
      open={isCreateOrderOpen}
      onOpenChange={handleCreateModalOpen}
      />
    </div>
  );
};

export default Orders;