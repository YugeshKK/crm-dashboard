import React from "react";
import {
  Settings2,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import type { InventoryItem } from "./StockDetailsSheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ============================================================
// SHARED HELPERS
// ============================================================
const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(0)}K`;
  return `₹ ${n}`;
};

const getStatusStyle = (status: InventoryItem["status"]) => {
  switch (status) {
    case "in_stock":
      return {
        label: "In Stock",
        text: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        bar: "bg-green-500",
        dot: "bg-green-500",
      };
    case "low_stock":
      return {
        label: "Low Stock",
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        bar: "bg-yellow-500",
        dot: "bg-yellow-500",
      };
    case "out_of_stock":
      return {
        label: "Out of Stock",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        bar: "bg-red-500",
        dot: "bg-red-500",
      };
  }
};

const getHealthPct = (item: InventoryItem) => {
  const target = Math.max(item.reorderLevel * 3, item.reorderLevel + 1);
  return Math.min(100, Math.max(3, (item.available / target) * 100));
};

// ============================================================
// 1. GRID VIEW — Card-based (DEFAULT)
// ============================================================
interface ViewProps {
  items: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}

export const InventoryGridView: React.FC<ViewProps> = ({
  items,
  onSelect,
  onAdjust,
}) => {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-12 text-center">
        <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">No products match your filters</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try changing the category or location filter
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <StockCard
          key={item.id}
          item={item}
          onSelect={onSelect}
          onAdjust={onAdjust}
        />
      ))}
    </div>
  );
};

const StockCard: React.FC<{
  item: InventoryItem;
  onSelect: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}> = ({ item, onSelect, onAdjust }) => {
  const style = getStatusStyle(item.status);
  const healthPct = getHealthPct(item);
  const stockValue = item.available * item.unitCost;
  const needsReorder = item.available < item.reorderLevel;
  const suggested = needsReorder
    ? Math.max(0, item.reorderLevel * 3 - item.available)
    : 0;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative border rounded-lg bg-background hover:border-primary/30 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Status stripe at top */}
      <div className={`h-1 w-full ${style.bar}`} />

      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {getInitials(item.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">
              {item.name}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
              {item.sku}
            </p>
          </div>
          <span
            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
          >
            {style.label}
          </span>
        </div>

        {/* Big stock number + health bar */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-3xl font-bold leading-none">
              {item.available}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              units
            </span>
            {item.onOrder > 0 && (
              <span className="ml-auto text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                +{item.onOrder} incoming
              </span>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${style.bar}`}
              style={{ width: `${healthPct}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 pb-3 mb-3 border-b">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Reserved
            </p>
            <p className="text-xs font-semibold mt-0.5">{item.reserved}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Reorder
            </p>
            <p className="text-xs font-semibold mt-0.5">{item.reorderLevel}</p>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Value
            </p>
            <p className="text-xs font-semibold mt-0.5">
              {formatINR(stockValue)}
            </p>
          </div>
        </div>

        {/* Suggested reorder hint */}
        {suggested > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdjust(item);
            }}
            className="w-full mb-3 flex items-center justify-between gap-2 text-[10px] px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Suggested reorder
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              +{suggested} units
            </span>
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground rounded"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => onAdjust(item)}>
                Adjust Stock
              </DropdownMenuItem>
              <DropdownMenuItem>Receive Stock</DropdownMenuItem>
              <DropdownMenuItem>Transfer Stock</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Movements</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 2. KANBAN VIEW — Grouped by stock health
// ============================================================
export const InventoryKanbanView: React.FC<ViewProps> = ({
  items,
  onSelect,
  onAdjust,
}) => {
  const columns = [
    {
      key: "in_stock",
      label: "In Stock",
      color: "green",
      dot: "bg-green-500",
    },
    {
      key: "low_stock",
      label: "Low Stock",
      color: "yellow",
      dot: "bg-yellow-500",
    },
    {
      key: "out_of_stock",
      label: "Out of Stock",
      color: "red",
      dot: "bg-red-500",
    },
    {
      key: "incoming",
      label: "Incoming",
      color: "blue",
      dot: "bg-blue-500",
    },
  ] as const;

  const grouped = {
    in_stock: items.filter((i) => i.status === "in_stock"),
    low_stock: items.filter((i) => i.status === "low_stock"),
    out_of_stock: items.filter((i) => i.status === "out_of_stock"),
    incoming: items.filter((i) => i.onOrder > 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colItems = grouped[col.key];
        return (
          <div
            key={col.key}
            className="bg-muted/30 rounded-lg border overflow-hidden"
          >
            {/* Column header */}
            <div className="px-3 py-2.5 bg-background border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold">{col.label}</span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {colItems.length}
              </span>
            </div>

            {/* Column items */}
            <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {colItems.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-6">
                  No items
                </p>
              ) : (
                colItems.map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    onSelect={onSelect}
                    onAdjust={onAdjust}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const KanbanCard: React.FC<{
  item: InventoryItem;
  onSelect: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
}> = ({ item, onSelect, onAdjust }) => {
  const style = getStatusStyle(item.status);
  const healthPct = getHealthPct(item);

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-background rounded-md border p-2.5 cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          {getInitials(item.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold truncate leading-tight">
            {item.name}
          </p>
          <p className="text-[9px] font-mono text-muted-foreground truncate">
            {item.sku}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-lg font-bold leading-none">{item.available}</span>
        <span className="text-[9px] text-muted-foreground">units</span>
      </div>

      <div className="h-1 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${style.bar}`}
          style={{ width: `${healthPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground min-w-0">
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">
            {item.location.replace(" Warehouse", "")}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjust(item);
          }}
          className="text-muted-foreground hover:text-foreground p-0.5"
        >
          <Settings2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// 3. WAREHOUSE VIEW — Grouped by location
// ============================================================
export const InventoryWarehouseView: React.FC<ViewProps> = ({
  items,
  onSelect,
  onAdjust,
}) => {
  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.location]) acc[item.location] = [];
      acc[item.location].push(item);
      return acc;
    },
    {} as Record<string, InventoryItem[]>
  );

  const warehouses = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length
  );

  if (warehouses.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-12 text-center">
        <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">No warehouses to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {warehouses.map(([location, locItems]) => {
        const totalValue = locItems.reduce(
          (s, i) => s + i.available * i.unitCost,
          0
        );
        const totalUnits = locItems.reduce((s, i) => s + i.available, 0);
        const lowCount = locItems.filter(
          (i) => i.status === "low_stock" || i.status === "out_of_stock"
        ).length;

        return (
          <div
            key={location}
            className="rounded-lg border bg-background overflow-hidden"
          >
            {/* Warehouse header */}
            <div className="px-4 py-3 bg-muted/30 border-b flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {location}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {locItems.length} products · {totalUnits.toLocaleString()}{" "}
                    units
                  </p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4 text-xs">
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase">
                    Total Value
                  </p>
                  <p className="font-semibold">{formatINR(totalValue)}</p>
                </div>
                {lowCount > 0 && (
                  <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                    {lowCount} need attention
                  </div>
                )}
              </div>
            </div>

            {/* Items list */}
            <div className="divide-y">
              {locItems.slice(0, 6).map((item) => {
                const style = getStatusStyle(item.status);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {getInitials(item.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold">{item.available}</p>
                      <p className="text-[9px] text-muted-foreground">units</p>
                    </div>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdjust(item);
                      }}
                      className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {locItems.length > 6 && (
                <div className="px-4 py-2 text-center">
                  <button className="text-[11px] text-blue-600 hover:underline font-medium">
                    View all {locItems.length} products →
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};