import React, { useState, useMemo } from "react";
import {
  FileText,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/DataTable";
import InvoiceDetailsSheet, {InvoiceStatus, InvoiceDetail} from "./InvoiceDetailSheet";

// ============================================================
// TYPES
// ============================================================
type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  linkedOrderId?: string;
};

// ============================================================
// DUMMY DATA
// ============================================================
const generateInvoices = (): Invoice[] => {
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
  const statuses: InvoiceStatus[] = [
    "draft",
    "sent",
    "partial",
    "paid",
    "overdue",
    "void",
  ];

  return Array.from({ length: 96 }, (_, i) => {
    const amount = Math.floor(Math.random() * 500000) + 50000;
    const paid =
      Math.random() > 0.5
        ? amount
        : Math.floor(Math.random() * amount * 0.8);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const day = (i % 28) + 1;
    return {
      id: `inv-${i + 1}`,
      invoiceNumber: `INV-${2024 + (i % 2)}-${1000 + i}`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      issueDate: `${day.toString().padStart(2, "0")} May 2024`,
      dueDate: `${((day + 15) % 28 || 28).toString().padStart(2, "0")} May 2024`,
      amount,
      amountPaid: status === "paid" ? amount : paid,
      amountDue: status === "paid" ? 0 : amount - paid,
      status,
      linkedOrderId: `SO-${1042 - i}`,
    };
  });
};

// ============================================================
// COLUMNS
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const statusStyles: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  partial:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  void: "bg-muted text-muted-foreground",
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

  columnHelper.accessor("invoiceNumber", {
    header: "Invoice #",
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
      <span className="text-sm font-medium">{info.getValue()}</span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("issueDate", {
    header: "Issue Date",
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
  }),

  columnHelper.accessor("dueDate", {
    header: "Due Date",
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
  }),

  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <span className="text-xs font-medium">
        ₹ {info.getValue().toLocaleString("en-IN")}
      </span>
    ),
  }),

  columnHelper.accessor("amountDue", {
    header: "Amount Due",
    cell: (info) => {
      const v = info.getValue() as number;
      return (
        <span
          className={`text-xs font-medium ${
            v > 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          ₹ {v.toLocaleString("en-IN")}
        </span>
      );
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const v = info.getValue() as InvoiceStatus;
      const label = v.charAt(0).toUpperCase() + v.slice(1);
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[v]}`}
        >
          {label}
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
const buildInvoiceDetail = (invoice: Invoice): InvoiceDetail => {
  const subtotal = invoice.amount;
  const gst = Math.round(subtotal * 0.18);
  const baseAmount = subtotal - gst;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: invoice.customer,
    customerEmail: `accounts@${invoice.customer
      .toLowerCase()
      .replace(/\s+/g, "")}.com`,
    customerPhone: "+91 98765 43210",
    customerAddress: "Plot 12, Sector 62, Noida, Uttar Pradesh 201301",
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    amount: invoice.amount,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    status: invoice.status,
    linkedOrderId: invoice.linkedOrderId,
    paymentMethod: invoice.status === "paid" ? "Bank Transfer" : undefined,
    terms: "Net 30. Please pay within 30 days of issue.",
    notes: "Auto-generated from order.",
    lineItems: [
      {
        description: "Solar Panel 550W",
        qty: 3,
        rate: Math.round(baseAmount / 3 / 100) * 100,
        amount: baseAmount,
      },
      {
        description: "Installation & Setup",
        qty: 1,
        rate: gst,
        amount: gst,
      },
    ],
    timeline: [
      {
        label: "Invoice Created",
        date: invoice.issueDate,
        time: "10:15 AM",
        state: "done",
      },
      {
        label: "Invoice Sent",
        date: invoice.issueDate,
        time: "10:20 AM",
        state: invoice.status === "draft" ? "pending" : "done",
      },
      {
        label: "Payment Received",
        date: invoice.amountPaid > 0 ? invoice.issueDate : "",
        time: invoice.amountPaid > 0 ? "02:45 PM" : undefined,
        value: invoice.amountPaid > 0 ? `₹ ${invoice.amountPaid.toLocaleString("en-IN")}` : undefined,
        state:
          invoice.status === "paid"
            ? "done"
            : invoice.status === "partial"
            ? "current"
            : "pending",
      },
      {
        label: "Fully Paid",
        date: "",
        state: invoice.status === "paid" ? "done" : "pending",
      },
    ],
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Invoices = () => {
  const [data, setData] = useState<Invoice[]>(generateInvoices);
  const [activeTab, setActiveTab] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(
    null
  );

  // Metrics
  const metrics = useMemo(() => {
    const total = data.length;
    const totalAmount = data.reduce((s, i) => s + i.amount, 0);
    const paid = data.filter((i) => i.status === "paid").length;
    const overdue = data.filter((i) => i.status === "overdue").length;
    const outstanding = data
      .filter((i) => i.status !== "paid" && i.status !== "void")
      .reduce((s, i) => s + i.amountDue, 0);
    return { total, totalAmount, paid, overdue, outstanding };
  }, [data]);

  const metricCards = [
    {
      title: "Total Invoices",
      value: metrics.total.toLocaleString(),
      change: "+12.4%",
      positive: true,
      icon: FileText,
    },
    {
      title: "Total Invoiced",
      value: `₹ ${(metrics.totalAmount / 10000000).toFixed(2)} Cr`,
      change: "+18.6%",
      positive: true,
      icon: IndianRupee,
    },
    {
      title: "Paid",
      value: metrics.paid.toString(),
      change: "+15.2%",
      positive: true,
      icon: CheckCircle2,
    },
    {
      title: "Overdue",
      value: metrics.overdue.toString(),
      change: "-3.1%",
      positive: false,
      icon: AlertCircle,
    },
    {
      title: "Outstanding",
      value: `₹ ${(metrics.outstanding / 100000).toFixed(1)} L`,
      change: "-5.7%",
      positive: false,
      icon: Clock,
    },
  ];

  // Tabs
  const filterTabs = useMemo(() => {
    const count = (s: string) => data.filter((i) => i.status === s).length;
    return [
      { label: "All Invoices", value: "all", count: data.length },
      { label: "Draft", value: "draft", count: count("draft") },
      { label: "Sent", value: "sent", count: count("sent") },
      { label: "Partial", value: "partial", count: count("partial") },
      { label: "Paid", value: "paid", count: count("paid") },
      { label: "Overdue", value: "overdue", count: count("overdue") },
      { label: "Void", value: "void", count: count("void") },
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter((i) => i.status === activeTab);
  }, [data, activeTab]);

  // Handlers
  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(buildInvoiceDetail(invoice));
    setIsDetailsOpen(true);
  };

  const handleSave = (updated: InvoiceDetail) => {
    // Update the master list
    setData((prev) =>
      prev.map((i) =>
        i.id === updated.id
          ? {
              ...i,
              status: updated.status,
              dueDate: updated.dueDate,
              amountPaid: updated.amountPaid,
              amountDue: updated.amountDue,
            }
          : i
      )
    );
    // Update local detail
    setSelectedInvoice(updated);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer invoices and payments
          </p>
        </div>
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
        searchPlaceholder="Search by invoice #, customer..."
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

      {/* Invoice Details Sheet */}
      <InvoiceDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        invoice={selectedInvoice}
        onSave={handleSave}
      />
    </div>
  );
};

export default Invoices;