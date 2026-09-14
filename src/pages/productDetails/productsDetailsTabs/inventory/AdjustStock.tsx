import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, ChevronDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// --- Schema ---
const adjustStockSchema = z.object({
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
  productName?: string;
  sku?: string;
  currentStock?: {
    total: number;
    available: number;
    reserved: number;
    incoming: number;
  };
  onSave?: (data: AdjustStockFormData) => void;
}

export function AdjustStockSheet({
  open,
  onOpenChange,
  productName = "Solar Panel 550W",
  sku = "SP-550",
  currentStock = { total: 248, available: 248, reserved: 32, incoming: 70 },
  onSave,
}: AdjustStockSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdjustStockFormData>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      adjustmentType: "increase",
      quantity: 0,
      reason: "",
      reference: "",
      warehouse: "Main Warehouse",
      adjustmentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const notesValue = watch("notes") || "";

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = (data: AdjustStockFormData) => {
    onSave?.(data);
    onOpenChange(false);
  };

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
              <SheetTitle className="text-xl font-semibold">Adjust Stock</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                {productName} ({sku})
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-500 overflow-x-hidden">
            {/* Current Stock Info */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Current Stock Information</h3>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {currentStock.total} Units
                </p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-medium">{currentStock.available}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reserved: </span>
                    <span className="font-medium">{currentStock.reserved}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Incoming: </span>
                    <span className="font-medium">{currentStock.incoming}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustment Type */}
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
                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                      <DropdownMenuRadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <DropdownMenuRadioItem value="increase" className="flex flex-col items-start py-2">
                          <span className="font-medium">Increase Stock</span>
                          <span className="text-xs text-muted-foreground">
                            Add stock to inventory
                          </span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="decrease" className="flex flex-col items-start py-2">
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

            {/* Adjustment Details */}
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
                        <p className="text-red-500 text-xs">{fieldState.error.message}</p>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="reason" className="w-full">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Purchase Received">Purchase Received</SelectItem>
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
                        <p className="text-red-500 text-xs">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Reference */}
              <div className="flex flex-col gap-2">
                <label htmlFor="reference">
                  Reference <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Controller
                  name="reference"
                  control={control}
                  render={({ field }) => (
                    <Input id="reference" placeholder="e.g. PO-2035" className="w-full" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="warehouse" className="w-full">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Warehouse">Main Warehouse</SelectItem>
                          <SelectItem value="Delhi Warehouse">Delhi Warehouse</SelectItem>
                          <SelectItem value="Bangalore Warehouse">Bangalore Warehouse</SelectItem>
                          <SelectItem value="Chennai Warehouse">Chennai Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">{fieldState.error.message}</p>
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
                        <Input id="adjustmentDate" type="date" className="w-full" {...field} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {fieldState.error && (
                        <p className="text-red-500 text-xs">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-2">
                <label htmlFor="notes">
                  Notes <span className="text-muted-foreground font-normal">(Optional)</span>
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
                          <p className="text-red-500 text-xs">{fieldState.error.message}</p>
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