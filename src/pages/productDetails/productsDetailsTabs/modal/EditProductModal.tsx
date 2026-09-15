import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Info,
  IndianRupee,
  Wrench,
  Package2,
  Image as ImageIcon,
  Upload,
  X,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// ============================================================
// SCHEMA
// ============================================================
const productSchema = z.object({
  // General
  name: z.string().min(1, "Product name is required").max(150),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, "Only letters, numbers, and hyphens"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  status: z.enum(["active", "inactive", "draft", "discontinued"]),
  description: z.string().max(1000).optional(),

  // Pricing
  costPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  sellingPrice: z.coerce.number().min(0, "Must be ≥ 0"),
  tax: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0).max(100).optional(),

  // Specifications
  power: z.string().optional(),
  productType: z.string().optional(),
  efficiency: z.string().optional(),
  warranty: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),

  // Inventory Settings
  trackInventory: z.boolean(),
  uom: z.string().min(1, "UOM is required"),
  reorderLevel: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  maxStockLevel: z.coerce.number().min(0),
  allowBackorders: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ============================================================
// PROPS
// ============================================================
interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productData?: Partial<ProductFormData> & {
    existingImages?: string[];
    existingDocuments?: { name: string; size: string }[];
  };
  onSave?: (data: ProductFormData, images: string[]) => void;
}

// ============================================================
// DEFAULTS
// ============================================================
const defaultValues: ProductFormData = {
  name: "Solar Panel 550W",
  sku: "SP-550",
  category: "Solar Panels",
  brand: "SunPower",
  status: "active",
  description: "High efficiency mono panel with 25-year warranty.",
  costPrice: 18000,
  sellingPrice: 25000,
  tax: 18,
  discount: 0,
  power: "550W",
  productType: "Monocrystalline",
  efficiency: "21.5%",
  warranty: "25 Years",
  weight: "27.5 kg",
  dimensions: "2279 × 1134 × 35 mm",
  trackInventory: true,
  uom: "Units",
  reorderLevel: 50,
  lowStockThreshold: 20,
  maxStockLevel: 500,
  allowBackorders: false,
};

// ============================================================
// SECTION WRAPPER
// ============================================================
const Section = ({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex items-start gap-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="pl-9">{children}</div>
  </section>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
export function EditProductModal({
  open,
  onOpenChange,
  productData,
  onSave,
}: EditProductModalProps) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...defaultValues, ...productData },
  });

  // Image state (separate from form – will be uploaded to storage on save)
  const [images, setImages] = useState<string[]>(productData?.existingImages || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live pricing calculations
  const costPrice = watch("costPrice") || 0;
  const sellingPrice = watch("sellingPrice") || 0;
  const tax = watch("tax") || 0;
  const discount = watch("discount") || 0;
  const grossProfit = sellingPrice - costPrice;
  const grossMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const netSellingPrice = sellingPrice * (1 - discount / 100);
  const taxAmount = (netSellingPrice * tax) / 100;

  const formatINR = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

  // Reset on open
  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, ...productData });
      setImages(productData?.existingImages || []);
    }
  }, [open, productData, reset]);

  const onSubmit = (data: ProductFormData) => {
    onSave?.(data, images);
    onOpenChange(false);
  };

  // Image handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...newUrls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl max-h-[90vh] min-w-0 overflow-hidden p-0 gap-0">
        {/* ==================== HEADER ==================== */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">Edit Product</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update product information and configuration. Stock quantities are managed from the Inventory tab.
          </DialogDescription>
        </DialogHeader>

        {/* ==================== FORM ==================== */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-w-0 min-h-0 flex-col [&_input]:w-full [&_input]:min-w-0 [&_textarea]:w-full [&_textarea]:min-w-0 [&_[role=combobox]]:w-full"
        >
          <div className="min-w-0 max-h-[65vh] overflow-x-hidden overflow-y-auto px-6 py-5 space-y-7 scrollbar-thin scrollbar-thumb-gray-500">
            {/* ---------- 1. GENERAL INFORMATION ---------- */}
            <Section
              icon={Info}
              title="General Information"
              description="Basic product details."
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                {/* Product Name */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input id="name" placeholder="Enter product name" {...field} />
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* SKU */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sku">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="sku"
                        placeholder="e.g. SP-550"
                        className="font-mono uppercase"
                        {...field}
                      />
                    )}
                  />
                  {errors.sku && (
                    <p className="text-xs text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="brand">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <Input id="brand" placeholder="e.g. SunPower" {...field} />
                    )}
                  />
                  {errors.brand && (
                    <p className="text-xs text-red-500">{errors.brand.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solar Panels">Solar Panels</SelectItem>
                          <SelectItem value="Inverters">Inverters</SelectItem>
                          <SelectItem value="Batteries">Batteries</SelectItem>
                          <SelectItem value="Mounting">Mounting</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Charge Controllers">Charge Controllers</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-xs text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="status">
                    Product Status <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="description">Description</label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="description"
                        rows={3}
                        placeholder="Short description of the product..."
                        className="resize-none"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* ---------- 2. PRICING ---------- */}
            <Section
              icon={IndianRupee}
              title="Pricing"
              description="Set product pricing. Gross profit and margin are calculated automatically."
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                {/* Cost Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="costPrice">
                    Cost Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="costPrice"
                    control={control}
                    render={({ field }) => (
                      <Input id="costPrice" type="number" min="0" {...field} />
                    )}
                  />
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sellingPrice">
                    Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="sellingPrice"
                    control={control}
                    render={({ field }) => (
                      <Input id="sellingPrice" type="number" min="0" {...field} />
                    )}
                  />
                </div>

                {/* Tax / GST */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tax">Tax / GST (%)</label>
                  <Controller
                    name="tax"
                    control={control}
                    render={({ field }) => (
                      <Input id="tax" type="number" min="0" max="100" {...field} />
                    )}
                  />
                </div>

                {/* Discount */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="discount">
                    Discount (%) <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <Controller
                    name="discount"
                    control={control}
                    render={({ field }) => (
                      <Input id="discount" type="number" min="0" max="100" {...field} />
                    )}
                  />
                </div>

                {/* Calculated preview (read-only) */}
                <div className="md:col-span-2 rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Pricing Preview
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Calculated automatically
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Net Selling Price</p>
                      <p className="font-semibold mt-0.5">{formatINR(netSellingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tax Amount</p>
                      <p className="font-semibold mt-0.5">{formatINR(taxAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gross Profit</p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          grossProfit >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {formatINR(grossProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gross Margin</p>
                      <p
                        className={`font-semibold mt-0.5 ${
                          grossMargin >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {grossMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* ---------- 3. PRODUCT SPECIFICATIONS ---------- */}
            <Section
              icon={Wrench}
              title="Product Specifications"
              description="Technical attributes. Additional attributes can be added later."
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                {/* Power */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="power">Power / Wattage</label>
                  <Controller
                    name="power"
                    control={control}
                    render={({ field }) => (
                      <Input id="power" placeholder="e.g. 550W" {...field} />
                    )}
                  />
                </div>

                {/* Product Type */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="productType">Product Type</label>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Input id="productType" placeholder="e.g. Monocrystalline" {...field} />
                    )}
                  />
                </div>

                {/* Efficiency */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="efficiency">Efficiency</label>
                  <Controller
                    name="efficiency"
                    control={control}
                    render={({ field }) => (
                      <Input id="efficiency" placeholder="e.g. 21.5%" {...field} />
                    )}
                  />
                </div>

                {/* Warranty */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="warranty">Warranty</label>
                  <Controller
                    name="warranty"
                    control={control}
                    render={({ field }) => (
                      <Input id="warranty" placeholder="e.g. 25 Years" {...field} />
                    )}
                  />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="weight">Weight</label>
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <Input id="weight" placeholder="e.g. 27.5 kg" {...field} />
                    )}
                  />
                </div>

                {/* Dimensions */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dimensions">Dimensions</label>
                  <Controller
                    name="dimensions"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="dimensions"
                        placeholder="e.g. 2279 × 1134 × 35 mm"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* ---------- 4. INVENTORY SETTINGS ---------- */}
            <Section
              icon={Package2}
              title="Inventory Settings"
              description="Configuration only. Current stock is managed from the Inventory tab."
            >
              {/* Info banner */}
              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 px-3 py-2.5 mb-4">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Stock quantities are managed through inventory actions like{" "}
                  <strong>Receive Stock</strong>, <strong>Adjust Stock</strong>, and{" "}
                  <strong>Transfer Stock</strong>.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                {/* Track Inventory */}
                <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Track Inventory</p>
                    <p className="text-xs text-muted-foreground">
                      Monitor stock levels for this product
                    </p>
                  </div>
                  <Controller
                    name="trackInventory"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                {/* UOM */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="uom">Unit of Measurement</label>
                  <Controller
                    name="uom"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="uom">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Units">Units</SelectItem>
                          <SelectItem value="Pieces">Pieces</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Meters">Meters</SelectItem>
                          <SelectItem value="Boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Reorder Level */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reorderLevel">Reorder Level</label>
                  <Controller
                    name="reorderLevel"
                    control={control}
                    render={({ field }) => (
                      <Input id="reorderLevel" type="number" min="0" {...field} />
                    )}
                  />
                </div>

                {/* Low Stock Threshold */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
                  <Controller
                    name="lowStockThreshold"
                    control={control}
                    render={({ field }) => (
                      <Input id="lowStockThreshold" type="number" min="0" {...field} />
                    )}
                  />
                </div>

                {/* Max Stock Level */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="maxStockLevel">Maximum Stock Level</label>
                  <Controller
                    name="maxStockLevel"
                    control={control}
                    render={({ field }) => (
                      <Input id="maxStockLevel" type="number" min="0" {...field} />
                    )}
                  />
                </div>

                {/* Allow Backorders */}
                <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Allow Backorders</p>
                    <p className="text-xs text-muted-foreground">
                      Accept orders when stock is unavailable
                    </p>
                  </div>
                  <Controller
                    name="allowBackorders"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* ---------- 5. IMAGES & DOCUMENTS ---------- */}
            <Section
              icon={ImageIcon}
              title="Product Images & Documents"
              description="Upload product photos and supporting documents."
            >
              <div className="space-y-4">
                {/* Images */}
                <div>
                  <label className="mb-2 block">Images</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-md overflow-hidden border group"
                      >
                        <img
                          src={img}
                          alt={`Product ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Upload tile */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <label className="mb-2 block">Documents</label>
                  <div className="space-y-2">
                    {/* Existing docs */}
                    {productData?.existingDocuments?.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{doc.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {doc.size}
                        </span>
                      </div>
                    ))}

                    {/* Add document */}
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Attach document
                    </button>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ==================== FOOTER ==================== */}
          <DialogFooter className=" py-4 border-t bg-background">
            <div className="flex items-center justify-end gap-3 w-full p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty} className="min-w-[130px]">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditProductModal;