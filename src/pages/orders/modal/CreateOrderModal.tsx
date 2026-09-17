import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  Minus,
  Trash2,
  User,
  Package,
  IndianRupee,
  Truck,
  ClipboardCheck,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// TYPES
// ============================================================
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  paymentTerms: string;
  outstanding: number;
  isExisting: boolean;
}

export interface OrderProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryDate: string;
  shippingMethod: "standard" | "express" | "pickup";
  notes: string;
}

export interface OrderPayload {
  customer: Customer | null;
  products: OrderProduct[];
  discount: number;
  taxRate: number;
  delivery: DeliveryInfo;
}

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: OrderPayload) => void;
}

// ============================================================
// DUMMY DATA
// ============================================================
const recentCustomers: Customer[] = [
  {
    id: "c-1",
    name: "ABC Electronics",
    email: "contact@abcelectronics.com",
    phone: "+91 98765 43210",
    city: "Noida",
    state: "Uttar Pradesh",
    paymentTerms: "Net 30",
    outstanding: 245000,
    isExisting: true,
  },
  {
    id: "c-2",
    name: "GreenTech Solutions",
    email: "info@greentech.com",
    phone: "+91 98765 11111",
    city: "Lucknow",
    state: "Uttar Pradesh",
    paymentTerms: "Net 15",
    outstanding: 115000,
    isExisting: true,
  },
  {
    id: "c-3",
    name: "SunPower Energy",
    email: "sales@sunpower.com",
    phone: "+91 98765 22222",
    city: "Jaipur",
    state: "Rajasthan",
    paymentTerms: "Net 30",
    outstanding: 0,
    isExisting: true,
  },
  {
    id: "c-4",
    name: "SolarEdge Systems",
    email: "orders@solaredge.com",
    phone: "+91 98765 33333",
    city: "Bengaluru",
    state: "Karnataka",
    paymentTerms: "Net 45",
    outstanding: 365000,
    isExisting: true,
  },
];

const availableProducts: OrderProduct[] = [
  { id: "p-1", name: "Solar Panel 550W", sku: "SP-550", price: 25000, quantity: 0, stock: 248 },
  { id: "p-2", name: "Solar Inverter 10kW", sku: "INV-10KW", price: 80000, quantity: 0, stock: 42 },
  { id: "p-3", name: "Lithium Battery 5kWh", sku: "BAT-5KWH", price: 65000, quantity: 0, stock: 12 },
  { id: "p-4", name: "Solar Mounting Kit", sku: "MT-KIT", price: 5500, quantity: 0, stock: 156 },
  { id: "p-5", name: "DC Cable 4mm 100m", sku: "DC-4MM", price: 3200, quantity: 0, stock: 0 },
  { id: "p-6", name: "Solar Charge Controller 60A", sku: "CC-60A", price: 12500, quantity: 0, stock: 78 },
];

// ============================================================
// STEPPER
// ============================================================
const steps = [
  { id: 1, label: "Customer", icon: User },
  { id: 2, label: "Products", icon: Package },
  { id: 3, label: "Pricing", icon: IndianRupee },
  { id: 4, label: "Delivery", icon: Truck },
  { id: 5, label: "Review", icon: ClipboardCheck },
];

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="flex items-start justify-between px-8 py-5">
      {steps.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-green-600 text-white"
                    : isCurrent
                    ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-900/30"
                    : "border-2 border-border bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 mx-1.5 mt-4">
                <div
                  className={`h-0.5 w-full rounded-full ${
                    currentStep > step.id ? "bg-green-600" : "bg-border"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================
// STEP 1 — CUSTOMER
// ============================================================
interface CustomerStepProps {
  selected: Customer | null;
  onSelect: (c: Customer) => void;
}

const CustomerStep: React.FC<CustomerStepProps> = ({ selected, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recentCustomers;
    return recentCustomers.filter((c) =>
      [c.name, c.email, c.phone, c.city, c.state].join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Select Customer</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose the customer for this order
        </p>
      </div>

      {/* Search + New Customer */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-green-600 border-green-300 hover:text-green-700 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20">
          <Plus className="w-3.5 h-3.5" />
          New Customer
        </Button>
      </div>

      {/* Recent Customers */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Customers
        </p>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No customers found.
            </div>
          ) : (
            filtered.map((customer) => {
              const isSelected = selected?.id === customer.id;
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50/60 dark:bg-green-900/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  {/* Radio */}
                  <div className="pt-1">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-green-600" : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-green-600" />}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {getInitials(customer.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {customer.name}
                      </span>
                      {customer.isExisting && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Existing Customer
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {customer.phone} • {customer.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {customer.city}, {customer.state}
                    </p>
                  </div>

                  {/* Right: payment terms + outstanding */}
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Payment Terms
                    </p>
                    <p className="text-xs font-medium mt-0.5">{customer.paymentTerms}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-2">
                      Outstanding
                    </p>
                    <p
                      className={`text-xs font-semibold mt-0.5 ${
                        customer.outstanding > 0
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      ₹ {customer.outstanding.toLocaleString("en-IN")}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* View all customers link */}
        <div className="mt-4 text-center">
          <button className="text-xs font-medium text-green-600 hover:underline inline-flex items-center gap-1">
            View all customers <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STEP 2 — PRODUCTS
// ============================================================
interface ProductsStepProps {
  products: OrderProduct[];
  onChange: (products: OrderProduct[]) => void;
}

const ProductsStep: React.FC<ProductsStepProps> = ({ products, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableProducts;
    return availableProducts.filter((p) =>
      [p.name, p.sku].join(" ").toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getQuantity = (id: string) =>
    products.find((p) => p.id === id)?.quantity || 0;

  const updateQuantity = (product: OrderProduct, qty: number) => {
    const existing = products.find((p) => p.id === product.id);
    if (qty <= 0) {
      onChange(products.filter((p) => p.id !== product.id));
    } else if (existing) {
      onChange(products.map((p) => (p.id === product.id ? { ...p, quantity: qty } : p)));
    } else {
      onChange([...products, { ...product, quantity: qty }]);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Select Products</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add products to this order
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Products list */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filtered.map((product) => {
          const qty = getQuantity(product.id);
          const outOfStock = product.stock === 0;
          return (
            <div
              key={product.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                qty > 0
                  ? "border-green-500 bg-green-50/60 dark:bg-green-900/10"
                  : "border-border"
              }`}
            >
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {product.sku}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      outOfStock ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">
                  ₹ {product.price.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {qty > 0 ? (
                  <>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => updateQuantity(product, qty - 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{qty}</span>
                    <button
                      type="button"
                      disabled={outOfStock || qty >= product.stock}
                      onClick={() => updateQuantity(product, qty + 1)}
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-muted disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={outOfStock}
                    className="h-7 text-xs gap-1"
                    onClick={() => updateQuantity(product, 1)}
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected count */}
      {products.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {products.reduce((s, p) => s + p.quantity, 0)} items •{" "}
          {products.length} product{products.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
};

// ============================================================
// STEP 3 — PRICING
// ============================================================
interface PricingStepProps {
  products: OrderProduct[];
  discount: number;
  taxRate: number;
  onDiscountChange: (v: number) => void;
  onTaxRateChange: (v: number) => void;
}

const PricingStep: React.FC<PricingStepProps> = ({
  products,
  discount,
  taxRate,
  onDiscountChange,
  onTaxRateChange,
}) => {
  const subtotal = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Pricing</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Apply discount and tax to the order
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: inputs */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="discount">Discount (%)</label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tax">Tax / GST (%)</label>
            <Input
              id="tax"
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => onTaxRateChange(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Right: summary */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm self-start">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Summary
          </p>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₹ {subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Discount ({discount}%)</span>
            <span className="font-medium text-red-500">
              - ₹ {discountAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax ({taxRate}%)</span>
            <span className="font-medium">₹ {taxAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="border-t pt-2.5 flex items-center justify-between">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-base">₹ {total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STEP 4 — DELIVERY
// ============================================================
interface DeliveryStepProps {
  delivery: DeliveryInfo;
  onChange: (d: DeliveryInfo) => void;
}

const DeliveryStep: React.FC<DeliveryStepProps> = ({ delivery, onChange }) => {
  const update = (patch: Partial<DeliveryInfo>) => onChange({ ...delivery, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Delivery Details</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Where and when should this order be delivered?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address (full width) */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="address">Delivery Address</label>
          <textarea
            id="address"
            rows={2}
            className="resize-none"
            placeholder="Street address, building, landmark..."
            value={delivery.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="city">City</label>
          <Input
            id="city"
            value={delivery.city}
            onChange={(e) => update({ city: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="state">State</label>
          <Input
            id="state"
            value={delivery.state}
            onChange={(e) => update({ state: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pincode">Pincode</label>
          <Input
            id="pincode"
            value={delivery.pincode}
            onChange={(e) => update({ pincode: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="deliveryDate">Delivery Date</label>
          <Input
            id="deliveryDate"
            type="date"
            value={delivery.deliveryDate}
            onChange={(e) => update({ deliveryDate: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="shippingMethod">Shipping Method</label>
          <Select
            value={delivery.shippingMethod}
            onValueChange={(v) =>
              update({ shippingMethod: v as DeliveryInfo["shippingMethod"] })
            }
          >
            <SelectTrigger id="shippingMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (5–7 days)</SelectItem>
              <SelectItem value="express">Express (2–3 days)</SelectItem>
              <SelectItem value="pickup">Customer Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label htmlFor="notes">Delivery Notes (Optional)</label>
          <textarea
            id="notes"
            rows={2}
            className="resize-none"
            placeholder="Any special delivery instructions..."
            value={delivery.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STEP 5 — REVIEW
// ============================================================
interface ReviewStepProps {
  customer: Customer | null;
  products: OrderProduct[];
  discount: number;
  taxRate: number;
  delivery: DeliveryInfo;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  customer,
  products,
  discount,
  taxRate,
  delivery,
}) => {
  const subtotal = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Review Order</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Please verify all details before creating the order
        </p>
      </div>

      {/* Customer */}
      <div className="rounded-lg border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Customer
        </p>
        {customer ? (
          <div>
            <p className="text-sm font-semibold">{customer.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.phone} • {customer.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.city}, {customer.state}
            </p>
          </div>
        ) : (
          <p className="text-xs text-red-500">No customer selected</p>
        )}
      </div>

      {/* Products */}
      <div className="rounded-lg border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Products ({products.length})
        </p>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  × {p.quantity}
                </span>
              </div>
              <span className="font-medium">
                ₹ {(p.price * p.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-xs text-red-500">No products added</p>
          )}
        </div>
      </div>

      {/* Pricing summary */}
      <div className="rounded-lg border p-4 space-y-2 text-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Pricing
        </p>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹ {subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount ({discount}%)</span>
          <span className="text-red-500">
            - ₹ {discountAmount.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax ({taxRate}%)</span>
          <span>₹ {taxAmount.toLocaleString("en-IN")}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹ {total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Delivery */}
      <div className="rounded-lg border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Delivery
        </p>
        <div className="text-sm space-y-1">
          <p>{delivery.address || "—"}</p>
          <p className="text-muted-foreground text-xs">
            {delivery.city}, {delivery.state} {delivery.pincode}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-muted-foreground" />
              {delivery.shippingMethod}
            </span>
            {delivery.deliveryDate && (
              <span className="text-muted-foreground">
                Expected: {delivery.deliveryDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN MODAL
// ============================================================
export function CreateOrderModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateOrderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(18);
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    address: "",
    city: "",
    state: "",
    pincode: "",
    deliveryDate: "",
    shippingMethod: "standard",
    notes: "",
  });

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedCustomer(null);
        setProducts([]);
        setDiscount(0);
        setTaxRate(18);
        setDelivery({
          address: "",
          city: "",
          state: "",
          pincode: "",
          deliveryDate: "",
          shippingMethod: "standard",
          notes: "",
        });
      }, 200);
    }
  }, [open]);

  // Step validation
  const canProceed = () => {
    if (currentStep === 1) return !!selectedCustomer;
    if (currentStep === 2) return products.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    onSubmit?.({
      customer: selectedCustomer,
      products,
      discount,
      taxRate,
      delivery,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-[780px] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={false}
      >
        {/* ============ HEADER ============ */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold">Create Order</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============ STEPPER ============ */}
        <div className="border-b bg-muted/20">
          <Stepper currentStep={currentStep} />
        </div>

        {/* ============ BODY ============ */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {currentStep === 1 && (
            <CustomerStep selected={selectedCustomer} onSelect={setSelectedCustomer} />
          )}
          {currentStep === 2 && (
            <ProductsStep products={products} onChange={setProducts} />
          )}
          {currentStep === 3 && (
            <PricingStep
              products={products}
              discount={discount}
              taxRate={taxRate}
              onDiscountChange={setDiscount}
              onTaxRateChange={setTaxRate}
            />
          )}
          {currentStep === 4 && (
            <DeliveryStep delivery={delivery} onChange={setDelivery} />
          )}
          {currentStep === 5 && (
            <ReviewStep
              customer={selectedCustomer}
              products={products}
              discount={discount}
              taxRate={taxRate}
              delivery={delivery}
            />
          )}
        </div>

        {/* ============ FOOTER ============ */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
          >
            {currentStep === 1 ? "Cancel" : (
              <>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </>
            )}
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Create Order
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrderModal;