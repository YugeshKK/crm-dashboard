import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Download,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
type ComponentStatus = "in_stock" | "low_stock" | "out_of_stock";

type BOMComponent = {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  supplier: string;
  quantityPerUnit: number;
  unit: string;
  unitCost: number;
  leadTime: string;
  availableStock: number;
  status: ComponentStatus;
};

// ============================================================
// DUMMY DATA — BOM for Solar Panel 550W
// ============================================================
const bomComponents: BOMComponent[] = [
  {
    id: "bom-1",
    name: "Monocrystalline Solar Cell",
    partNumber: "CELL-MONO-166",
    category: "Solar Cells",
    supplier: "SolarTech Components",
    quantityPerUnit: 72,
    unit: "cells",
    unitCost: 185,
    leadTime: "7 Days",
    availableStock: 24800,
    status: "in_stock",
  },
  {
    id: "bom-2",
    name: "Tempered Glass 3.2mm",
    partNumber: "GLASS-TMP-3.2",
    category: "Glass",
    supplier: "GlassPro Industries",
    quantityPerUnit: 1,
    unit: "sheet",
    unitCost: 2800,
    leadTime: "5 Days",
    availableStock: 320,
    status: "in_stock",
  },
  {
    id: "bom-3",
    name: "EVA Encapsulant Sheet",
    partNumber: "EVA-STD-450",
    category: "Encapsulant",
    supplier: "Polymer Solutions",
    quantityPerUnit: 2,
    unit: "sheets",
    unitCost: 420,
    leadTime: "6 Days",
    availableStock: 580,
    status: "in_stock",
  },
  {
    id: "bom-4",
    name: "Backsheet White",
    partNumber: "BACK-WHT-450",
    category: "Backsheet",
    supplier: "Polymer Solutions",
    quantityPerUnit: 1,
    unit: "sheet",
    unitCost: 650,
    leadTime: "6 Days",
    availableStock: 42,
    status: "low_stock",
  },
  {
    id: "bom-5",
    name: "Aluminium Frame 35mm",
    partNumber: "FRAME-ALU-35",
    category: "Frame",
    supplier: "AluFrame Pvt. Ltd.",
    quantityPerUnit: 1,
    unit: "set",
    unitCost: 1450,
    leadTime: "4 Days",
    availableStock: 180,
    status: "in_stock",
  },
  {
    id: "bom-6",
    name: "Junction Box IP68",
    partNumber: "JB-IP68",
    category: "Electrical",
    supplier: "SolarTech Components",
    quantityPerUnit: 1,
    unit: "box",
    unitCost: 380,
    leadTime: "7 Days",
    availableStock: 210,
    status: "in_stock",
  },
  {
    id: "bom-7",
    name: "MC4 Connector Pair",
    partNumber: "MC4-PAIR",
    category: "Electrical",
    supplier: "Connector World",
    quantityPerUnit: 1,
    unit: "pair",
    unitCost: 120,
    leadTime: "3 Days",
    availableStock: 640,
    status: "in_stock",
  },
  {
    id: "bom-8",
    name: "Silicone Sealant",
    partNumber: "SEAL-SIL-300",
    category: "Sealant",
    supplier: "SealRight Products",
    quantityPerUnit: 1,
    unit: "tube",
    unitCost: 210,
    leadTime: "2 Days",
    availableStock: 0,
    status: "out_of_stock",
  },
  {
    id: "bom-9",
    name: "Tabbing Ribbon Wire",
    partNumber: "RIBBON-TAB",
    category: "Interconnect",
    supplier: "SolarTech Components",
    quantityPerUnit: 45,
    unit: "meters",
    unitCost: 18,
    leadTime: "7 Days",
    availableStock: 5200,
    status: "in_stock",
  },
  {
    id: "bom-10",
    name: "Corner Bracket Set",
    partNumber: "BRK-CORNER",
    category: "Hardware",
    supplier: "AluFrame Pvt. Ltd.",
    quantityPerUnit: 4,
    unit: "pieces",
    unitCost: 45,
    leadTime: "4 Days",
    availableStock: 980,
    status: "in_stock",
  },
];

// ============================================================
// STATUS CONFIG
// ============================================================
const statusConfig: Record<
  ComponentStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  in_stock: {
    label: "In Stock",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  low_stock: {
    label: "Low Stock",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: AlertTriangle,
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: AlertTriangle,
  },
};

// ============================================================
// HELPER
// ============================================================
const formatINR = (num: number) => {
  return `₹ ${num.toLocaleString("en-IN")}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductBOM: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Derived categories for the filter dropdown
  const categories = useMemo(() => {
    const unique = Array.from(new Set(bomComponents.map((c) => c.category)));
    return [{ value: "all", label: "All Categories" }, ...unique.map((c) => ({ value: c, label: c }))];
  }, []);

  // Filtered list
  const filteredComponents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bomComponents.filter((c) => {
      const matchesSearch =
        !query ||
        [c.name, c.partNumber, c.category, c.supplier]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalBOMCost = bomComponents.reduce(
      (sum, c) => sum + c.quantityPerUnit * c.unitCost,
      0,
    );
    const totalComponents = bomComponents.length;
    const uniqueSuppliers = new Set(bomComponents.map((c) => c.supplier)).size;
    const lowStockCount = bomComponents.filter(
      (c) => c.status === "low_stock" || c.status === "out_of_stock",
    ).length;
    return { totalBOMCost, totalComponents, uniqueSuppliers, lowStockCount };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* ============ SUMMARY CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total BOM Cost */}
        <Card className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total BOM Cost</p>
            <div className="text-green-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1">{formatINR(metrics.totalBOMCost)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-600">-2.4%</span>
            <span className="text-xs text-muted-foreground">vs last batch</span>
          </div>
        </Card>

        {/* Total Components */}
        <Card className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Components</p>
            <div className="text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1">{metrics.totalComponents}</p>
          <p className="text-xs text-muted-foreground mt-1">Raw materials in BOM</p>
        </Card>

        {/* Suppliers */}
        <Card className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Suppliers</p>
            <div className="text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1">{metrics.uniqueSuppliers}</p>
          <p className="text-xs text-muted-foreground mt-1">Active vendors</p>
        </Card>

        {/* Stock Alerts */}
        <Card className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Stock Alerts</p>
            <div className="text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1">{metrics.lowStockCount}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-500">Needs attention</span>
          </div>
        </Card>
      </div>

      {/* ============ BOM TABLE ============ */}
      <Card className="border rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Bill of Materials</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Raw materials required to manufacture 1 unit
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-[200px] text-xs pl-8"
              />
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  {categories.find((c) => c.value === categoryFilter)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  {categories.map((c) => (
                    <DropdownMenuRadioItem key={c.value} value={c.value}>
                      {c.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export */}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>

            {/* Add Component */}
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Component
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-y bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium">Component</th>
                  <th className="text-left px-4 py-2.5 font-medium">Category</th>
                  <th className="text-left px-4 py-2.5 font-medium">Supplier</th>
                  <th className="text-right px-4 py-2.5 font-medium">Qty / Unit</th>
                  <th className="text-right px-4 py-2.5 font-medium">Unit Cost</th>
                  <th className="text-right px-4 py-2.5 font-medium">Total Cost</th>
                  <th className="text-left px-4 py-2.5 font-medium">Lead Time</th>
                  <th className="text-right px-4 py-2.5 font-medium">Available</th>
                  <th className="text-right px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.length > 0 ? (
                  <>
                    {filteredComponents.map((c) => {
                      const totalCost = c.quantityPerUnit * c.unitCost;
                      const status = statusConfig[c.status];
                      const StatusIcon = status.icon;
                      return (
                        <tr
                          key={c.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          {/* Component */}
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{c.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {c.partNumber}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.category}
                          </td>

                          {/* Supplier */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.supplier}
                          </td>

                          {/* Qty per unit */}
                          <td className="px-4 py-3 text-right">
                            {c.quantityPerUnit} {c.unit}
                          </td>

                          {/* Unit cost */}
                          <td className="px-4 py-3 text-right">
                            {formatINR(c.unitCost)}
                          </td>

                          {/* Total cost */}
                          <td className="px-4 py-3 text-right font-medium">
                            {formatINR(totalCost)}
                          </td>

                          {/* Lead time */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {c.leadTime}
                          </td>

                          {/* Available stock */}
                          <td className="px-4 py-3 text-right">
                            {c.availableStock.toLocaleString("en-IN")}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.className}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals row */}
                    <tr className="bg-muted/50 border-t-2">
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-right font-semibold text-sm"
                      >
                        Total BOM Cost (per unit):
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sm">
                        {formatINR(metrics.totalBOMCost)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No components found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============ COST BREAKDOWN (optional visual) ============ */}
      <Card className="border rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Cost Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const byCategory = bomComponents.reduce(
                (acc, c) => {
                  const cost = c.quantityPerUnit * c.unitCost;
                  acc[c.category] = (acc[c.category] || 0) + cost;
                  return acc;
                },
                {} as Record<string, number>,
              );
              const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
              const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

              return sorted.map(([category, cost]) => {
                const percent = (cost / total) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        {formatINR(cost)} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductBOM;