import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Search,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, StatusBadge } from "../../components/ui/table/DataTable";
import { useNavigate } from "react-router-dom";

// ============================================================
// TYPES
// ============================================================
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  soldThisMonth: number;
  revenueThisMonth: number;
  status: "active" | "inactive";
  updated: string;
};

// ============================================================
// DUMMY DATA
// ============================================================
const generateDummyProducts = (): Product[] => {
  const productNames = [
    "Solar Panel 550W High efficiency mono panel",
    "Solar Inverter 10kW 3 Phase On-grid inverter",
    "Lithium Battery 5kWh Lithium Iron Phosphate",
    "Solar Mounting Kit Aluminum Roof Mount",
    "DC Cable 4mm Solar DC Cable 100m",
    "Solar Charge Controller 60A MPPT",
    "Solar Panel 400W Bifacial Glass-Glass",
    "Hybrid Inverter 5kW Off-grid",
    "Solar Fuse 10A DC",
    "Solar Connector MC4 Pair",
  ];
  const skus = ["SP-550", "INV-10KW", "BAT-5KWH", "MT-KIT", "DC-4MM", "CC-60A", "SP-400", "HINV-5", "FUSE-10", "MC4-P"];
  const categories = ["Solar Panels", "Inverters", "Batteries", "Mounting", "Accessories", "Charge Controllers"];
  const statuses: Product["status"][] = ["active", "inactive"];

  return Array.from({ length: 50 }, (_, i) => {
    const stock = Math.floor(Math.random() * 300);
    const sold = Math.floor(Math.random() * 150);
    const price = Math.floor(Math.random() * 80000) + 2000;
    const costPrice = Math.floor(price * (0.5 + Math.random() * 0.4));
    return {
      id: `prod-${i + 1}`,
      name: productNames[i % productNames.length] + (i >= productNames.length ? ` ${i}` : ""),
      sku: skus[i % skus.length] + (i >= skus.length ? `-${i}` : ""),
      category: categories[i % categories.length],
      price,
      costPrice,
      stock,
      soldThisMonth: sold,
      revenueThisMonth: sold * price,
      status: statuses[i % 2],
      updated: `${Math.floor(Math.random() * 30) + 1}h ago`,
    };
  });
};

// ============================================================
// COLUMN DEFINITIONS
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-500" },
    { value: "inactive", label: "Inactive", color: "bg-gray-500" },
 ];

const createColumns = () => {
  const getStockBadge = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", className: "bg-red-500 text-white" };
    if (stock < 20) return { label: "Low Stock", className: "bg-yellow-500 text-white" };
    return { label: "In Stock", className: "bg-green-500 text-white" };
  };

  return [
    // Selection
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

    // Product
    columnHelper.accessor("name", {
      id: "product",
      header: "Product",
      cell: (info) => (
        <div>
          <div className="font-medium text-sm">{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.sku}</div>
        </div>
      ),
      filterFn: "includesString",
    }),

    // SKU is displayed inside product, no separate column.

    // Category
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),

    // Price
    columnHelper.accessor("price", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Price
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">₹ {info.getValue().toLocaleString()}</div>,
    }),

    // Cost Price
    columnHelper.accessor("costPrice", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Cost Price
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">₹ {info.getValue().toLocaleString()}</div>,
    }),

    // Stock
    columnHelper.accessor("stock", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Stock
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => {
        const stock = info.getValue();
        const badge = getStockBadge(stock);
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{stock}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        );
      },
    }),

    // Sold (this month)
    columnHelper.accessor("soldThisMonth", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Sold
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
    }),

    // Revenue (this month)
    columnHelper.accessor("revenueThisMonth", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Revenue
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">₹ {info.getValue().toLocaleString()}</div>,
    }),

    // Status (Active/Inactive)
    columnHelper.accessor("status", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Status
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <StatusBadge status={info.getValue()} />,
      filterFn: "includesString",
    }),

    // Updated
    columnHelper.accessor("updated", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Updated
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
    }),

    // Actions
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: () => (
        <button
          className="text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      ),
    }),
  ];
};

// ============================================================
// METRICS CARDS
// ============================================================
const metrics = [
  {
    title: "Total Products",
    key: "total",
    icon: Package,
    change: "+12.4%",
    changeText: "vs last month",
  },
  {
    title: "Active Products",
    key: "active",
    icon: CheckCircle,
    change: "+8.6%",
    changeText: "vs last month",
  },
  {
    title: "Low Stock",
    key: "lowStock",
    icon: AlertTriangle,
    change: "-16.7%",
    changeText: "vs last month",
  },
  {
    title: "Out of Stock",
    key: "outOfStock",
    icon: XCircle,
    change: "-5.3%",
    changeText: "vs last month",
  },
  {
    title: "Total Revenue (This Month)",
    key: "revenue",
    icon: IndianRupee,
    change: "+15.3%",
    changeText: "vs last month",
  },
];

// ============================================================
// MAIN PRODUCTS COMPONENT
// ============================================================
const Products: React.FC = () => {
  const [data] = useState<Product[]>(generateDummyProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  
  // Computed metrics
  const metricsData = useMemo(() => {
    const total = data.length;
    const active = data.filter((p) => p.status === "active").length;
    const lowStock = data.filter((p) => p.stock > 0 && p.stock < 20).length;
    const outOfStock = data.filter((p) => p.stock === 0).length;
    const totalRevenue = data.reduce((sum, p) => sum + p.revenueThisMonth, 0);
    return { total, active, lowStock, outOfStock, revenue: totalRevenue };
  }, [data]);

  // Bulk actions (placeholder)
  const bulkActions = [
    {
      label: "Bulk Edit",
      onClick: (rows: Product[]) => console.log("Bulk edit:", rows),
      variant: "default" as const,
    },
    {
      label: "Delete Selected",
      onClick: (rows: Product[]) => console.log("Delete:", rows),
      variant: "destructive" as const,
    },
    {
      label: "Export CSV",
      onClick: (rows: Product[]) => console.log("Export:", rows),
      variant: "success" as const,
    },
  ];

  // Filter tabs (optional) – could add filters for stock status, but we'll keep it simple.
  // We can add a search input in the header that uses global filter.
  const handleRowClick=(row: Product) => {
    navigate(`/products/${row.id}`);
  }
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your products, inventory and performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => console.log("Add Product")}>
            <PlusIcon className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const value = metricsData[metric.key as keyof typeof metricsData];
          let displayValue: number | string = value;
          if (metric.key === "revenue") {
            displayValue = `₹ ${(value as number).toLocaleString()}`;
          }
          return (
            <Card
              key={index}
              className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between p-0">
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  {metric.title}
                </CardTitle>
                <div className="text-muted-foreground">
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-2xl font-bold">{displayValue}</p>
              </CardContent>
              <CardFooter className="p-0 mt-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-medium ${
                      metric.change.startsWith("+") ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {metric.changeText}
                  </span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable
        data={data}
        columns={createColumns()}
        title=""
        searchPlaceholder="Search products..."
        pageSizeOptions={[10, 25, 50, 100]}
        defaultPageSize={10}
        onRowClick={handleRowClick}
        bulkActions={bulkActions}
        enableSelection={true}
        enableSorting={true}
        enableFiltering={true} // enables column filters
        enablePagination={true}
        statusOptions={statusOptions}
        // Additional props like filterTabs, sort options can be added later.
      />
    </div>
  );
};

export default Products;