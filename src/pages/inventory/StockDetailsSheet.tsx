import React, { useEffect } from "react";
import {
  X,
  Settings2,
  Package,
  MapPin,
  TrendingUp,
  TrendingDown,
  Truck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  location: string;
  available: number;
  reserved: number;
  onOrder: number;
  reorderLevel: number;
  maxStock: number;
  unitCost: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

interface StockDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onAdjust?: (item: InventoryItem) => void;
}

const statusConfig = {
  in_stock: {
    label: "In Stock",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  low_stock: {
    label: "Low Stock",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  out_of_stock: {
    label: "Out of Stock",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const movements = [
  { type: "in" as const, label: "Stock Received", qty: 50, when: "Today, 10:30 AM", ref: "PO-2035" },
  { type: "out" as const, label: "Order Fulfilled", qty: -15, when: "Yesterday, 04:20 PM", ref: "ORD-1024" },
  { type: "out" as const, label: "Order Fulfilled", qty: -8, when: "2 days ago", ref: "ORD-1019" },
  { type: "in" as const, label: "Stock Adjusted", qty: 20, when: "3 days ago", ref: "ADJ-1002" },
];

export default function StockDetailsSheet({
  open,
  onOpenChange,
  item,
  onAdjust,
}: StockDetailsSheetProps) {
  if (!item) return null;

  const cfg = statusConfig[item.status];
  const stockValue = item.available * item.unitCost;
  const totalStock = item.available + item.reserved;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              Stock Details
            </SheetTitle>
            <SheetClose asChild>
              <button className="text-muted-foreground hover:text-foreground">
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Product */}
          <div>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {item.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold truncate">{item.name}</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.sku}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.className}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock breakdown */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Current Stock
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-green-50/50 dark:bg-green-900/10 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Available
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {item.available}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Reserved
                </p>
                <p className="text-xl font-bold">{item.reserved}</p>
              </div>
              <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">
                  On Order
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  +{item.onOrder}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Total
                </p>
                <p className="text-xl font-bold">{totalStock}</p>
              </div>
            </div>
          </div>

          {/* Value + location */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Details
            </p>
            <div className="rounded-lg border p-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Stock Value
                </span>
                <span className="font-semibold">
                  ₹ {stockValue.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Unit Cost</span>
                <span className="font-medium">
                  ₹ {item.unitCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Category</span>
                <span className="font-medium">{item.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Location</span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              </div>
            </div>
          </div>

          {/* Reorder */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Reorder Settings
            </p>
            <div className="rounded-lg border p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Reorder Level
                </span>
                <span className="font-medium">{item.reorderLevel} units</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  Max Stock
                </span>
                <span className="font-medium">{item.maxStock} units</span>
              </div>
              {item.available < item.reorderLevel && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 p-2.5">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    💡 Suggested reorder: {item.reorderLevel * 3 - item.available} units
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent movements */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Movements
            </p>
            <ul className="space-y-3">
              {movements.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      m.type === "in"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {m.type === "in" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium">{m.label}</p>
                      <span
                        className={`text-xs font-semibold ${
                          m.qty > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {m.ref} • {m.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex gap-3 bg-background">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={() => onAdjust?.(item)}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Adjust Stock
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}