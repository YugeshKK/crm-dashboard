import React, { useState, useMemo } from "react";
import {
  Package,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Settings2,
  MapPin,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Columns,
  Layers,
  List,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/DataTable";
import StockDetailsSheet, {
  InventoryItem,
} from "./StockDetailsSheet";
import {
  InventoryGridView,
  InventoryKanbanView,
  InventoryWarehouseView,
} from "./InventoryView";
import AdjustStockSheet from "../productDetails/productsDetailsTabs/inventory/AdjustStock";

// ============================================================
// TYPES
// ============================================================
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
type ViewMode = "grid" | "kanban" | "warehouse" | "table";

// ============================================================
// DUMMY DATA
// ============================================================
const generateInventory = (): InventoryItem[] => {
  const items = [
    { name: "Solar Panel 550W", desc: "High efficiency mono panel", sku: "SP-550", cat: "Solar Panels", cost: 18000 },
    { name: "Solar Inverter 10kW", desc: "3 Phase On-grid inverter", sku: "INV-10KW", cat: "Inverters", cost: 55000 },
    { name: "Lithium Battery 5kWh", desc: "Lithium Iron Phosphate", sku: "BAT-5KWH", cat: "Batteries", cost: 42000 },
    { name: "DC Cable 4mm", desc: "Solar DC Cable 100m", sku: "DC-4MM", cat: "Accessories", cost: 1800 },
    { name: "MC4 Connector", desc: "MC4 Male & Female Pair", sku: "MC4-CON", cat: "Accessories", cost: 120 },
    { name: "Mounting Structure", desc: "GI Mounting Structure", sku: "MNT-STR", cat: "Mounting", cost: 3200 },
    { name: "AC DB Box", desc: "AC Distribution Box", sku: "AC-DB", cat: "Electrical", cost: 4500 },
    { name: "Solar Panel 440W", desc: "Monocrystalline Panel", sku: "SP-440", cat: "Solar Panels", cost: 14000 },
    { name: "DC Cable 6mm", desc: "Solar DC Cable 100m", sku: "DC-6MM", cat: "Accessories", cost: 2600 },
    { name: "Junction Box", desc: "IP68 Junction Box", sku: "JB-IP68", cat: "Electrical", cost: 380 },
    { name: "Battery Cable 25mm", desc: "Battery interconnect cable", sku: "BAT-CBL", cat: "Accessories", cost: 450 },
    { name: "Charge Controller 60A", desc: "MPPT Charge Controller", sku: "CC-60A", cat: "Controllers", cost: 12500 },
  ];
  const locations = ["Main Warehouse", "Delhi Warehouse", "Bangalore Warehouse", "Chennai Warehouse"];

  return Array.from({ length: 84 }, (_, i) => {
    const base = items[i % items.length];
    const available = Math.floor(Math.random() * 500);
    const reorderLevel = 50;
    let status: StockStatus = "in_stock";
    if (available === 0) status = "out_of_stock";
    else if (available < reorderLevel) status = "low_stock";

    return {
      id: `inv-${i + 1}`,
      name: base.name + (i >= items.length ? ` ${Math.floor(i / items.length) + 1}` : ""),
      description: base.desc,
      sku: base.sku + (i >= items.length ? `-${i}` : ""),
      category: base.cat,
      location: locations[i % locations.length],
      available,
      reserved: Math.floor(Math.random() * 30),
      onOrder: Math.random() > 0.6 ? Math.floor(Math.random() * 100) : 0,
      reorderLevel,
      maxStock: 500,
      unitCost: base.cost,
      status,
    };
  });
};

// ============================================================
// TABLE COLUMNS (kept as one of the views)
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const statusConfig: Record<StockStatus, { label: string; className: string }> = {
  in_stock: {
    label: "In Stock",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const getHealthBar = (available: number, reorderLevel: number) => {
  const ratio = reorderLevel > 0 ? Math.min(available / (reorderLevel * 3), 1) : 1;
  let color = "bg-green-500";
  if (available === 0) color = "bg-red-500";
  else if (available < reorderLevel) color = "bg-yellow-500";
  else if (available < reorderLevel * 2) color = "bg-amber-500";
  return { ratio, color };
};

const createColumns = (onAdjust: (item: InventoryItem) => void) => [
  columnHelper.display({
    id: "select",
    header: ({ table }: any) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }: any) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }),

  columnHelper.accessor("name", {
    header: "Product",
    cell: (info: any) => {
      const row = info.row.original as InventoryItem;
      const initials = row.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[200px]">{row.name}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
              {row.description}
            </p>
          </div>
        </div>
      );
    },
    filterFn: "includesString",
  }),

  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info: any) => (
      <span className="text-[11px] font-mono text-muted-foreground">{info.getValue()}</span>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("category", {
    header: "Category",
    cell: (info: any) => <span className="text-xs text-muted-foreground">{info.getValue()}</span>,
    filterFn: "includesString",
  }),

  columnHelper.accessor("location", {
    header: "Location",
    cell: (info: any) => (
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="text-xs">{info.getValue()}</span>
      </div>
    ),
    filterFn: "includesString",
  }),

  columnHelper.accessor("available", {
    header: "Available",
    cell: (info: any) => {
      const row = info.row.original as InventoryItem;
      const { ratio, color } = getHealthBar(row.available, row.reorderLevel);
      return (
        <div className="min-w-[100px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">{row.available}</span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(ratio * 100, 3)}%` }} />
          </div>
        </div>
      );
    },
  }),

  columnHelper.accessor("reserved", {
    header: "Reserved",
    cell: (info: any) => <span className="text-xs">{info.getValue()}</span>,
  }),

  columnHelper.accessor("onOrder", {
    header: "On Order",
    cell: (info: any) => (
      <span className="text-xs text-muted-foreground">
        {info.getValue() > 0 ? `+${info.getValue()}` : "—"}
      </span>
    ),
  }),

  columnHelper.accessor("unitCost", {
    header: "Stock Value",
    cell: (info: any) => {
      const row = info.row.original as InventoryItem;
      const value = row.available * row.unitCost;
      return <span className="text-xs font-medium">₹ {value.toLocaleString("en-IN")}</span>;
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info: any) => {
      const v = info.getValue() as StockStatus;
      const cfg = statusConfig[v];
      return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}>
          {cfg.label}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="text-muted-foreground hover:text-foreground p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => onAdjust(row.original)}>
            Adjust Stock
          </DropdownMenuItem>
          <DropdownMenuItem>Receive Stock</DropdownMenuItem>
          <DropdownMenuItem>Transfer Stock</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View Movements</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),
];

// ============================================================
// SIDEBAR WIDGETS
// ============================================================
const InventorySummaryCard = ({ data }: { data: InventoryItem[] }) => {
  const summary = useMemo(() => {
    const totalValue = data.reduce((s, i) => s + i.available * i.unitCost, 0);
    const available = data.reduce((s, i) => s + i.available, 0);
    const reserved = data.reduce((s, i) => s + i.reserved, 0);
    const onOrder = data.reduce((s, i) => s + i.onOrder, 0);
    return { totalValue, available, reserved, onOrder };
  }, [data]);

  const rows = [
    { label: "Total Products", value: data.length.toString() },
    { label: "Total Stock Value", value: `₹ ${summary.totalValue.toLocaleString("en-IN")}` },
    { label: "Available Stock", value: `${summary.available.toLocaleString()} units` },
    { label: "Reserved Stock", value: `${summary.reserved.toLocaleString()} units` },
    { label: "On Order", value: `${summary.onOrder.toLocaleString()} units` },
  ];

  return (
    <Card className="border rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Inventory Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{r.label}</span>
            <span className="text-xs font-medium">{r.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const LowStockAlertCard = ({
  data,
  onSelect,
}: {
  data: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
}) => {
  const lowStock = useMemo(() => {
    return data
      .filter((i) => i.status === "low_stock" || i.status === "out_of_stock")
      .sort((a, b) => a.available - b.available)
      .slice(0, 5);
  }, [data]);

  return (
    <Card className="border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Low Stock Alert</CardTitle>
        <button className="text-[11px] text-blue-600 hover:underline">View all</button>
      </CardHeader>
      <CardContent className="space-y-2">
        {lowStock.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                item.available === 0
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {item.available}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

const RecentMovementsCard = () => {
  const movements = [
    { type: "in" as const, item: "Solar Panel 550W", qty: 50, when: "Today, 10:30 AM" },
    { type: "out" as const, item: "Solar Inverter 10kW", qty: 5, when: "Today, 09:15 AM" },
    { type: "in" as const, item: "MC4 Connector", qty: 200, when: "Yesterday, 04:45 PM" },
    { type: "out" as const, item: "Lithium Battery 5kWh", qty: 8, when: "Yesterday, 11:20 AM" },
  ];

  return (
    <Card className="border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">Recent Movements</CardTitle>
        <button className="text-[11px] text-blue-600 hover:underline">View all</button>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {movements.map((m, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                m.type === "in" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              {m.type === "in" ? (
                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {m.type === "in" ? "Stock In" : "Stock Out"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {m.item} ({m.qty} units)
              </p>
              <p className="text-[10px] text-muted-foreground">{m.when}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================================
// VIEW TOGGLE
// ============================================================
const ViewToggle = ({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) => {
  const options: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "kanban", label: "Board", icon: Columns },
    { value: "warehouse", label: "Warehouse", icon: Layers },
    { value: "table", label: "Table", icon: List },
  ];

  return (
    <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
      {options.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              value === opt.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Inventory = () => {
  const [data, setData] = useState<InventoryItem[]>(generateInventory);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<InventoryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const categories = useMemo(() => Array.from(new Set(data.map((i) => i.category))), [data]);
  const locations = useMemo(() => Array.from(new Set(data.map((i) => i.location))), [data]);

  const prefilteredData = useMemo(() => {
    return data.filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (locationFilter !== "all" && i.location !== locationFilter) return false;
      return true;
    });
  }, [data, categoryFilter, locationFilter]);

  const metrics = useMemo(() => {
    const total = data.length;
    const value = data.reduce((s, i) => s + i.available * i.unitCost, 0);
    const inStock = data.filter((i) => i.status === "in_stock").length;
    const lowStock = data.filter((i) => i.status === "low_stock").length;
    const outOfStock = data.filter((i) => i.status === "out_of_stock").length;
    return { total, value, inStock, lowStock, outOfStock };
  }, [data]);

  const metricCards = [
    { title: "Total Products", value: metrics.total.toString(), sub: "+8.6% vs last 30 days", icon: Package, color: "text-blue-600" },
    { title: "Stock Value", value: `₹ ${(metrics.value / 10000000).toFixed(2)} Cr`, sub: "+12.4% vs last 30 days", icon: IndianRupee, color: "text-purple-600" },
    { title: "In Stock", value: metrics.inStock.toString(), sub: `${((metrics.inStock / metrics.total) * 100).toFixed(1)}% of products`, icon: CheckCircle2, color: "text-green-600" },
    { title: "Low Stock", value: metrics.lowStock.toString(), sub: `${((metrics.lowStock / metrics.total) * 100).toFixed(1)}% of products`, icon: AlertTriangle, color: "text-yellow-600" },
    { title: "Out of Stock", value: metrics.outOfStock.toString(), sub: `${((metrics.outOfStock / metrics.total) * 100).toFixed(1)}% of products`, icon: XCircle, color: "text-red-500" },
  ];

  const filterTabs = useMemo(() => {
    const count = (s: string) => prefilteredData.filter((i) => i.status === s).length;
    return [
      { label: "All Products", value: "all", count: prefilteredData.length },
      { label: "In Stock", value: "in_stock", count: count("in_stock") },
      { label: "Low Stock", value: "low_stock", count: count("low_stock") },
      { label: "Out of Stock", value: "out_of_stock", count: count("out_of_stock") },
    ];
  }, [prefilteredData]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return prefilteredData;
    return prefilteredData.filter((i) => i.status === activeTab);
  }, [prefilteredData, activeTab]);

  const handleRowClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleAdjust = (item: InventoryItem) => {
    setAdjustProduct(item);
    setIsAdjustOpen(true);
  };

  const handleSaveAdjustment = (payload: any) => {
    console.log("Stock adjusted:", payload);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ============ HEADER ============ */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {metrics.total} products across {locations.length} warehouses
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ViewToggle value={view} onChange={setView} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export Current View (CSV)</DropdownMenuItem>
              <DropdownMenuItem>Export All Products (CSV)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export Stock Movements (CSV)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              setAdjustProduct(filteredData[0] || null);
              setIsAdjustOpen(true);
            }}
            disabled={filteredData.length === 0}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Adjust Stock</span>
          </Button>
        </div>
      </div>

      {/* ============ METRICS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <p className="text-xs text-muted-foreground">{m.title}</p>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1.5">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ---- LEFT: Filters + View ---- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-9 w-[180px] text-xs">
                <WarehouseIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tabs — only show in Table view */}
            {view === "table" && (
              <div className="flex flex-wrap items-center gap-1 ml-auto">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      activeTab === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 opacity-70">{tab.count}</span>
                  </button>
                ))}
              </div>
            )}

            {(categoryFilter !== "all" || locationFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs"
                onClick={() => {
                  setCategoryFilter("all");
                  setLocationFilter("all");
                }}
              >
                Reset
              </Button>
            )}
          </div>

          {/* View renderer */}
          {view === "grid" && (
            <InventoryGridView
              items={filteredData}
              onSelect={handleRowClick}
              onAdjust={handleAdjust}
            />
          )}

          {view === "kanban" && (
            <InventoryKanbanView
              items={filteredData}
              onSelect={handleRowClick}
              onAdjust={handleAdjust}
            />
          )}

          {view === "warehouse" && (
            <InventoryWarehouseView
              items={filteredData}
              onSelect={handleRowClick}
              onAdjust={handleAdjust}
            />
          )}

          {view === "table" && (
            <DataTable
              data={filteredData}
              columns={createColumns(handleAdjust)}
              title=""
              searchPlaceholder="Search by product name, SKU..."
              pageSizeOptions={[10, 25, 50, 100]}
              defaultPageSize={10}
              onRowClick={handleRowClick}
              enableSelection={true}
              enableSorting={true}
              enableFiltering={true}
              enablePagination={true}
              filterTabs={filterTabs}
              activeFilter={activeTab}
              onFilterChange={setActiveTab}
            />
          )}
        </div>

        {/* ---- RIGHT: Sidebar ---- */}
        <div className="lg:col-span-1 space-y-4">
          <InventorySummaryCard data={data} />
          <LowStockAlertCard
            data={data}
            onSelect={(item) => {
              setSelectedItem(item);
              setIsDetailsOpen(true);
            }}
          />
          <RecentMovementsCard />
        </div>
      </div>

      {/* Sheets */}
      <AdjustStockSheet
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        productName={adjustProduct?.name}
        sku={adjustProduct?.sku}
        currentStock={
          adjustProduct
            ? {
                total: adjustProduct.available + adjustProduct.reserved,
                available: adjustProduct.available,
                reserved: adjustProduct.reserved,
                incoming: adjustProduct.onOrder,
              }
            : undefined
        }
        onSave={handleSaveAdjustment}
      />

      <StockDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        item={selectedItem}
        onAdjust={(item) => {
          setIsDetailsOpen(false);
          handleAdjust(item);
        }}
      />
    </div>
  );
};

export default Inventory;