import React, { useState, useMemo } from "react";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/DataTable";
import PaymentDetailsSheet, {
  PaymentDetail,
  PaymentStatus,
  PaymentMethod,
} from "./PaymentDetailsSheet";

// ============================================================
// TYPES
// ============================================================
type Payment = {
  id: string;
  paymentNumber: string;
  customer: string;
  invoiceNumber: string;
  orderNumber?: string;
  date: string;
  amount: number;
  refunded: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
};

// ============================================================
// DUMMY DATA
// ============================================================
const generatePayments = (): Payment[] => {
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
  const methods: PaymentMethod[] = [
    "bank_transfer",
    "upi",
    "cheque",
    "cash",
    "card",
  ];
  const statuses: PaymentStatus[] = [
    "received",
    "received",
    "received",
    "pending",
    "partial",
    "failed",
    "refunded",
  ];

  return Array.from({ length: 120 }, (_, i) => {
    const amount = Math.floor(Math.random() * 300000) + 10000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const refunded =
      status === "refunded"
        ? amount
        : status === "partially_refunded"
        ? Math.floor(amount * 0.4)
        : 0;
    return {
      id: `pay-${i + 1}`,
      paymentNumber: `PAY-2024-${1000 + i}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      invoiceNumber: `INV-2024-${1000 + i}`,
      orderNumber: `SO-${1042 - i}`,
      date: `${((i % 28) + 1).toString().padStart(2, "0")} May 2024`,
      amount,
      refunded,
      method: methods[Math.floor(Math.random() * methods.length)],
      reference: `TXN${Math.floor(Math.random() * 1000000000)}`,
      status,
    };
  });
};

// ============================================================
// COLUMNS
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const statusStyles: Record<PaymentStatus, string> = {
  received:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  partial: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  refunded:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  partially_refunded:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const statusLabels: Record<PaymentStatus, string> = {
  received: "Received",
  pending: "Pending",
  failed: "Failed",
  partial: "Partial",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

const methodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  cash: "Cash",
  card: "Card",
  other: "Other",
};

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

  columnHelper.accessor("paymentNumber", {
    header: "Payment ID",
    cell: (info) => (
      <span className="text-xs font-mono text-blue-600 font-medium">
        {info.getValue()}
      </span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("invoiceNumber", {
    header: "Invoice #",
    cell: (info) => (
      <span className="text-xs font-mono text-muted-foreground">
        {info.getValue()}
      </span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("customer", {
    header: "Customer",
    cell: (info) => (
      <span className="text-sm font-medium">{info.getValue()}</span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
  }),

  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <div>
        <span className="text-xs font-medium">
          ₹ {info.getValue().toLocaleString("en-IN")}
        </span>
        {info.row.original.refunded > 0 && (
          <p className="text-[10px] text-orange-500 mt-0.5">
            − ₹ {info.row.original.refunded.toLocaleString("en-IN")} refunded
          </p>
        )}
      </div>
    ),
  }),

  columnHelper.accessor("method", {
    header: "Method",
    cell: (info) => (
      <span className="text-xs">{methodLabels[info.getValue() as PaymentMethod]}</span>
    ),
  }),

  columnHelper.accessor("reference", {
    header: "Reference",
    cell: (info) => (
      <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px] inline-block">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const v = info.getValue() as PaymentStatus;
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[v]}`}
        >
          {statusLabels[v]}
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
// BUILD DETAIL FROM LIST ROW
// ============================================================
const buildPaymentDetail = (p: Payment): PaymentDetail => {
  const isReceived = p.status === "received" || p.status === "partial";
  const isFailed = p.status === "failed";

  return {
    id: p.id,
    paymentNumber: p.paymentNumber,
    customer: p.customer,
    customerEmail: `accounts@${p.customer
      .toLowerCase()
      .replace(/\s+/g, "")}.com`,
    customerPhone: "+91 98765 43210",
    invoiceNumber: p.invoiceNumber,
    orderNumber: p.orderNumber,
    amount: p.amount,
    refunded: p.refunded,
    date: p.date,
    time: "02:45 PM",
    method: p.method,
    reference: p.reference,
    status: p.status,
    notes: "Recorded by accounts team.",
    timeline: [
      {
        label: "Payment Initiated",
        date: p.date,
        time: "02:30 PM",
        state: "done",
      },
      {
        label: "Processing",
        date: p.date,
        time: "02:40 PM",
        state: "done",
      },
      isFailed
        ? {
            label: "Payment Failed",
            date: p.date,
            time: "02:45 PM",
            state: "done",
          }
        : {
            label: "Payment Received",
            date: p.date,
            time: "02:45 PM",
            value: `₹ ${p.amount.toLocaleString("en-IN")}`,
            state: "done",
          },
      p.refunded > 0
        ? {
            label: "Refund Issued",
            date: p.date,
            time: "04:00 PM",
            value: `₹ ${p.refunded.toLocaleString("en-IN")}`,
            state: "done",
          }
        : {
            label: "Refund Issued",
            date: "",
            state: "pending",
          },
    ],
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Payments = () => {
  const [data, setData] = useState<Payment[]>(generatePayments);
  const [activeTab, setActiveTab] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(
    null
  );

  // Metrics
  const metrics = useMemo(() => {
    const total = data.length;
    const received = data
      .filter((p) => p.status === "received")
      .reduce((s, p) => s + p.amount - p.refunded, 0);
    const pending = data
      .filter((p) => p.status === "pending" || p.status === "partial")
      .reduce((s, p) => s + p.amount, 0);
    const failed = data.filter((p) => p.status === "failed").length;
    const refunded = data.reduce((s, p) => s + p.refunded, 0);
    return { total, received, pending, failed, refunded };
  }, [data]);

  const metricCards = [
    {
      title: "Total Payments",
      value: metrics.total.toLocaleString(),
      change: "+14.2%",
      positive: true,
      icon: IndianRupee,
    },
    {
      title: "Total Received",
      value: `₹ ${(metrics.received / 10000000).toFixed(2)} Cr`,
      change: "+22.8%",
      positive: true,
      icon: CheckCircle2,
    },
    {
      title: "Pending",
      value: `₹ ${(metrics.pending / 100000).toFixed(1)} L`,
      change: "-3.5%",
      positive: false,
      icon: Clock,
    },
    {
      title: "Failed",
      value: metrics.failed.toString(),
      change: "-8.1%",
      positive: false,
      icon: AlertCircle,
    },
    {
      title: "Refunded",
      value: `₹ ${(metrics.refunded / 100000).toFixed(1)} L`,
      change: "+2.4%",
      positive: false,
      icon: RotateCcw,
    },
  ];

  // Tabs
  const filterTabs = useMemo(() => {
    const count = (s: string) => data.filter((p) => p.status === s).length;
    return [
      { label: "All Payments", value: "all", count: data.length },
      { label: "Received", value: "received", count: count("received") },
      { label: "Pending", value: "pending", count: count("pending") },
      { label: "Partial", value: "partial", count: count("partial") },
      { label: "Failed", value: "failed", count: count("failed") },
      { label: "Refunded", value: "refunded", count: count("refunded") },
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter((p) => p.status === activeTab);
  }, [data, activeTab]);

  // Handlers
  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(buildPaymentDetail(payment));
    setIsDetailsOpen(true);
  };

  const handleRefund = (paymentId: string, amount: number, reason: string) => {
    setData((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const newRefunded = p.refunded + amount;
        const newStatus: PaymentStatus =
          newRefunded >= p.amount ? "refunded" : "partially_refunded";
        return {
          ...p,
          refunded: newRefunded,
          status: newStatus,
        };
      })
    );

    // Update the currently open detail
    if (selectedPayment && selectedPayment.id === paymentId) {
      const newRefunded = selectedPayment.refunded + amount;
      const newStatus: PaymentStatus =
        newRefunded >= selectedPayment.amount
          ? "refunded"
          : "partially_refunded";
      setSelectedPayment({
        ...selectedPayment,
        refunded: newRefunded,
        status: newStatus,
      });
    }

    console.log("Refund processed:", { paymentId, amount, reason });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage all customer payments
          </p>
        </div>
        {/* Note: Recording a payment happens from Invoice Details, not here. */}
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
        searchPlaceholder="Search by payment ID, invoice, customer, reference..."
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

      {/* Payment Details Sheet */}
      <PaymentDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        payment={selectedPayment}
        onRefund={handleRefund}
      />
    </div>
  );
};

export default Payments;