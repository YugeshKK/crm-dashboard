import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  ChevronDown,
  Package,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ============================================================
// TYPES
// ============================================================
export interface AdjustStockProduct {
  id: string;
  name: string;
  sku: string;
  available: number;
  reserved: number;
  onOrder: number;
  unitCost?: number;
  category?: string;
}

// ============================================================
// SCHEMA
// ============================================================
const adjustStockSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  adjustmentType: z.enum(["increase", "decrease"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  reference: z.string().optional(),
  warehouse: z.string().min(1, "Warehouse is required"),
  adjustmentDate: z.string().min(1, "Date is required"),
  notes: z.string().max(255, "Maximum 255 characters").optional(),
});

export type AdjustStockFormData = z.infer<typeof adjustStockSchema>;

interface AdjustStockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products?: AdjustStockProduct[];
  preselectedProductId?: string;
  defaultWarehouse?: string;
  onSave?: (data: AdjustStockFormData) => void;
}

// ============================================================
// FALLBACK DUMMY
// ============================================================
const fallbackProducts: AdjustStockProduct[] = [
  {
    id: "inv-1",
    name: "Solar Panel 550W",
    sku: "SP-550",
    available: 248,
    reserved: 32,
    onOrder: 70,
    category: "Solar Panels",
  },
];

// ============================================================
// SEARCHABLE PRODUCT SELECT
// ============================================================
interface ProductComboboxProps {
  products: AdjustStockProduct[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ProductCombobox = ({
  products,
  value,
  onChange,
  placeholder = "Select a product to adjust",
}: ProductComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = products.find((p) => p.id === value);

  // Group products by category for better organisation
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? products.filter((p) =>
          [p.name, p.sku, p.category].join(" ").toLowerCase().includes(q)
        )
      : products;

    const groups: Record<string, AdjustStockProduct[]> = {};
    filtered.forEach((p) => {
      const key = p.category || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [products, search]);

  const totalResults = Object.values(grouped).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
            !selected && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            {selected ? (
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium text-foreground truncate max-w-full">
                  {selected.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono truncate">
                  {selected.sku} · {selected.available} units
                </span>
              </div>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products by name, SKU..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            {totalResults === 0 ? (
              <CommandEmpty>No products found.</CommandEmpty>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <CommandGroup
                  key={category}
                  heading={category}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {items.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={() => {
                        onChange(p.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5 shrink-0",
                          value === p.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {p.sku}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0",
                          p.available === 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : p.available < 50
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        )}
                      >
                        {p.available} units
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>

          {/* Footer with count */}
          <div className="border-t px-3 py-2 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>
              {totalResults} product{totalResults !== 1 ? "s" : ""}
            </span>
            <span className="font-mono">↑↓ navigate · ⏎ select · esc close</span>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export function AdjustStockSheet({
  open,
  onOpenChange,
  products = fallbackProducts,
  preselectedProductId,
  defaultWarehouse = "Main Warehouse",
  onSave,
}: AdjustStockSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      productId: preselectedProductId || "",
      adjustmentType: "increase",
      quantity: 0,
      reason: "",
      reference: "",
      warehouse: defaultWarehouse,
      adjustmentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const notesValue = watch("notes") || "";
  const watchedProductId = watch("productId");
  const watchedAdjustmentType = watch("adjustmentType");
  const watchedQuantity = watch("quantity");

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === watchedProductId) || null,
    [products, watchedProductId]
  );

  // Reset on close / set preselection on open
  useEffect(() => {
    if (!open) {
      reset({
        productId: preselectedProductId || "",
        adjustmentType: "increase",
        quantity: 0,
        reason: "",
        reference: "",
        warehouse: defaultWarehouse,
        adjustmentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } else if (preselectedProductId) {
      setValue("productId", preselectedProductId);
    }
  }, [open, reset, preselectedProductId, defaultWarehouse, setValue]);

  const onSubmit = (data: AdjustStockFormData) => {
    onSave?.(data);
    onOpenChange(false);
  };

  // Preview
  const currentTotal = selectedProduct
    ? selectedProduct.available + selectedProduct.reserved
    : 0;
  const previewDelta =
    watchedAdjustmentType === "increase"
      ? Math.abs(watchedQuantity || 0)
      : -Math.abs(watchedQuantity || 0);
  const previewTotal = currentTotal + previewDelta;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:min-w-[500px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">
                Adjust Stock
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Update inventory levels for a product
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 overflow-x-hidden">
            {/* ============ PRODUCT SELECTOR (SEARCHABLE) ============ */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Product <span className="text-red-500">*</span>
              </label>
              <Controller
                name="productId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <ProductCombobox
                      products={products}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* ============ CURRENT STOCK INFO ============ */}
            {selectedProduct ? (
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Current Stock Information
                </h3>
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Current Stock
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {currentTotal} Units
                      </p>
                    </div>
                    {watchedQuantity > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          After Adjustment
                        </p>
                        <p
                          className={cn(
                            "text-2xl font-bold mt-1",
                            previewTotal < 0
                              ? "text-red-500"
                              : watchedAdjustmentType === "increase"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-orange-500"
                          )}
                        >
                          {previewTotal} Units
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-green-200 dark:border-green-900/40 text-xs">
                    <div>
                      <span className="text-muted-foreground">Available: </span>
                      <span className="font-medium">
                        {selectedProduct.available}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reserved: </span>
                      <span className="font-medium">
                        {selectedProduct.reserved}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Incoming: </span>
                      <span className="font-medium">
                        {selectedProduct.onOrder}
                      </span>
                    </div>
                  </div>
                </div>

                {watchedAdjustmentType === "decrease" &&
                  watchedQuantity > selectedProduct.available && (
                    <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 px-3 py-2">
                      <span className="text-red-600 dark:text-red-400 text-xs">
                        ⚠️ Cannot decrease by more than available stock (
                        {selectedProduct.available} units)
                      </span>
                    </div>
                  )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
                <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Select a product to see its stock
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current stock and adjustment preview will appear here
                </p>
              </div>
            )}

            {/* ============ ADJUSTMENT TYPE ============ */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Adjustment Type</h3>
              <Controller
                name="adjustmentType"
                control={control}
                render={({ field }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {field.value === "increase"
                              ? "Increase Stock"
                              : "Decrease Stock"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {field.value === "increase"
                              ? "Add stock to inventory"
                              : "Remove stock from inventory"}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)]"
                    >
                      <DropdownMenuRadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <DropdownMenuRadioItem
                          value="increase"
                          className="flex flex-col items-start py-2"
                        >
                          <span className="font-medium">Increase Stock</span>
                          <span className="text-xs text-muted-foreground">
                            Add stock to inventory
                          </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="decrease"
                          className="flex flex-col items-start py-2"
                        >
                          <span className="font-medium">Decrease Stock</span>
                          <span className="text-xs text-muted-foreground">
                            Remove stock from inventory
                          </span>
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            </div>

            {/* ============ ADJUSTMENT DETAILS ============ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Adjustment Details</h3>

              {/* Quantity */}
              <div className="flex flex-col gap-2">
                <label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <div className="relative">
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="0"
                          className="w-full pr-16"
                          {...field}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Units
                        </span>
                      </div>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reason">
                  Reason <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="reason"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="reason" className="w-full">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchase Received">
                            Purchase Received
                          </SelectItem>
                          <SelectItem value="Sale">Sale</SelectItem>
                          <SelectItem value="Damage">Damage</SelectItem>
                          <SelectItem value="Return">Return</SelectItem>
                          <SelectItem value="Inventory Count Adjustment">
                            Inventory Count Adjustment
                          </SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Reference */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reference">
                  Reference{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <Controller
                  name="reference"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="reference"
                      placeholder="e.g. PO-2035"
                      className="w-full"
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Warehouse */}
              <div className="flex flex-col gap-2">
                <label htmlFor="warehouse">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="warehouse"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger id="warehouse" className="w-full">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Warehouse">
                            Main Warehouse
                          </SelectItem>
                          <SelectItem value="Delhi Warehouse">
                            Delhi Warehouse
                          </SelectItem>
                          <SelectItem value="Bangalore Warehouse">
                            Bangalore Warehouse
                          </SelectItem>
                          <SelectItem value="Chennai Warehouse">
                            Chennai Warehouse
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Adjustment Date */}
              <div className="flex flex-col gap-2">
                <label htmlFor="adjustmentDate">
                  Adjustment Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="adjustmentDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <div className="relative">
                        <Input
                          id="adjustmentDate"
                          type="date"
                          className="w-full"
                          {...field}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <label htmlFor="notes">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <textarea
                        id="notes"
                        rows={4}
                        placeholder="Add notes about this adjustment..."
                        className="w-full resize-none"
                        {...field}
                      />
                      <div className="flex justify-between items-center">
                        {fieldState.error ? (
                          <p className="text-red-500 text-xs">
                            {fieldState.error.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {notesValue.length}/255
                        </span>
                      </div>
                    </>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="border-t p-4 flex gap-3 bg-background">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedProduct}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Save Adjustment
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AdjustStockSheet;