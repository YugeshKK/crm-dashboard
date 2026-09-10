import React from "react";
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ============================================================
// DUMMY DATA
// ============================================================

const inventorySummary = {
  availableStock: { value: 248, label: "In Stock" },
  reservedStock: { value: 32, label: "" },
  incomingStock: { value: 70, label: "Expected" },
  reorderLevel: 50,
  stockValue: "₹ 6,20,000",
  avgCostPrice: "₹ 18,000",
  stockAge: "45 Days",
  lastUpdated: "Today, 10:30 AM",
};

const stockStatusData = [
  { label: "In Stock", value: 248, percent: 68, color: "#22c55e" },
  { label: "Low Stock", value: 32, percent: 9, color: "#eab308" },
  { label: "Out of Stock", value: 12, percent: 3, color: "#ef4444" },
  { label: "Incoming", value: 70, percent: 20, color: "#9ca3af" },
];

const reorderRecommendation = {
  quantity: "120 Units",
  estimatedDays: "45 days",
  reorderLevel: "50 Units",
  avgMonthlySales: "180 Units",
  leadTime: "7 Days",
};

const stockMovements = [
  { date: "30 May 2024", type: "Sale", ref: "ORD-1024", inOut: "Out", qty: -22, balance: 248 },
  { date: "28 May 2024", type: "Purchase", ref: "PO-2031", inOut: "In", qty: 70, balance: 270 },
  { date: "25 May 2024", type: "Sale", ref: "ORD-1017", inOut: "Out", qty: -18, balance: 200 },
  { date: "20 May 2024", type: "Sale", ref: "ORD-1009", inOut: "Out", qty: -25, balance: 218 },
  { date: "15 May 2024", type: "Purchase", ref: "PO-2025", inOut: "In", qty: 100, balance: 243 },
];

const warehouseAvailability = [
  { warehouse: "Main Warehouse", available: 180, reserved: 20, incoming: 50, total: 250 },
  { warehouse: "Delhi Warehouse", available: 48, reserved: 8, incoming: 10, total: 66 },
  { warehouse: "Bangalore Warehouse", available: 20, reserved: 4, incoming: 10, total: 34 },
  { warehouse: "Chennai Warehouse", available: 0, reserved: 0, incoming: 0, total: 0 },
];

const bottomMetrics = [
  { title: "Stock Turnover Rate", value: "4.2x", badge: "Good", badgeColor: "green", sub: "Industry Avg: 3.8x" },
  { title: "Days of Inventory", value: "41 Days", badge: "Healthy", badgeColor: "green", sub: "Industry Avg: 45 Days" },
  { title: "Stockout Risk", value: "Low", badge: "Low Risk", badgeColor: "green", sub: "Next 30 Days" },
  { title: "Inventory Accuracy", value: "98.5%", badge: "Excellent", badgeColor: "green", sub: "Last 30 Days" },
];

// Stock history line chart data
const stockHistoryPoints = [
  { x: 0, y: 120 },
  { x: 50, y: 110 },
  { x: 100, y: 95 },
  { x: 150, y: 105 },
  { x: 200, y: 80 },
  { x: 250, y: 90 },
  { x: 300, y: 70 },
  { x: 350, y: 85 },
  { x: 400, y: 75 },
];

const stockHistoryLabels = ["1 May", "6 May", "11 May", "16 May", "21 May", "26 May", "31 May"];

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Donut chart for Stock Status */
const DonutChart = ({ data, total }: { data: typeof stockStatusData; total: number }) => {
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-[140px] h-[140px] mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {data.map((item, i) => {
          const length = (item.percent / 100) * circumference;
          const strokeDasharray = `${length} ${circumference - length}`;
          const strokeDashoffset = -offset;
          offset += length;
          return (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">Total Units</span>
      </div>
    </div>
  );
};

/** Line chart for Stock History */
const StockHistoryChart = () => {
  const linePath = stockHistoryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L 400 140 L 0 140 Z`;

  return (
    <div className="w-full">
      <svg viewBox="0 0 400 150" className="w-full h-36" preserveAspectRatio="none">
        <defs>
          <linearGradient id="invAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 50, 100, 150].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="400" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#invAreaGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" />

        {/* Dots */}
        {stockHistoryPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#22c55e" stroke="white" strokeWidth="1.5" />
        ))}
      </svg>

      <div className="flex justify-between text-[10px] text-muted-foreground px-1 mt-1">
        {stockHistoryLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
};

/** Mini sparkline for bottom cards */
const Sparkline = () => {
  const points = [80, 75, 82, 70, 68, 65, 72, 60, 58, 55];
  const path = points.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 10} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 90 90" className="w-20 h-10">
      <path d={path} fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </svg>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ProductInventory: React.FC = () => {
  const totalUnits = stockStatusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ============ TOP ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- Inventory Summary --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Inventory Summary</CardTitle>
            <button className="text-xs text-blue-600 hover:underline">View Details</button>
          </CardHeader>
          <CardContent>
            {/* 4 stat boxes */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                <p className="text-[10px] text-muted-foreground uppercase">Available Stock</p>
                <p className="text-lg font-bold">{inventorySummary.availableStock.value}</p>
                <span className="text-[10px] text-green-600 font-medium">
                  {inventorySummary.availableStock.label}
                </span>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <p className="text-[10px] text-muted-foreground uppercase">Reserved Stock</p>
                <p className="text-lg font-bold">{inventorySummary.reservedStock.value}</p>
              </div>
              <div className="p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-[10px] text-muted-foreground uppercase">Incoming Stock</p>
                <p className="text-lg font-bold">{inventorySummary.incomingStock.value}</p>
                <span className="text-[10px] text-yellow-600 font-medium">
                  {inventorySummary.incomingStock.label}
                </span>
              </div>
              <div className="p-2 rounded-md bg-muted/40">
                <p className="text-[10px] text-muted-foreground uppercase">Reorder Level</p>
                <p className="text-lg font-bold">{inventorySummary.reorderLevel}</p>
              </div>
            </div>

            {/* 4 detail rows */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Stock Value</p>
                <p className="font-semibold">{inventorySummary.stockValue}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Avg. Cost Price</p>
                <p className="font-semibold">{inventorySummary.avgCostPrice}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Stock Age</p>
                <p className="font-semibold">{inventorySummary.stockAge}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Last Updated</p>
                <p className="font-semibold">{inventorySummary.lastUpdated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Stock Status --- */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DonutChart data={stockStatusData} total={totalUnits} />
              <div className="flex-1 space-y-2">
                {stockStatusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {item.value} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Reorder Recommendation --- */}
        <Card className="border rounded-lg border-orange-200 dark:border-orange-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Reorder Recommendation</CardTitle>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">
              Needs Attention
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Based on sales velocity and current stock</p>

            <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/40">
              <p className="text-[10px] text-muted-foreground uppercase">Recommended Order Quantity</p>
              <p className="text-xl font-bold text-orange-600">{reorderRecommendation.quantity}</p>
              <p className="text-xs text-muted-foreground">
                Estimated to last {reorderRecommendation.estimatedDays}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Reorder Level</p>
                <p className="font-semibold">{reorderRecommendation.reorderLevel}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Avg. Monthly Sales</p>
                <p className="font-semibold">{reorderRecommendation.avgMonthlySales}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Lead Time</p>
                <p className="font-semibold">{reorderRecommendation.leadTime}</p>
              </div>
            </div>

            <Button className="w-full gap-2" variant="outline">
              <ShoppingCart className="w-4 h-4" />
              Create Purchase Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ============ MIDDLE ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- Stock Movement Table --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Stock Movement</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              This Month ▾
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-2 py-2 font-medium">Type</th>
                  <th className="text-left px-2 py-2 font-medium">Reference</th>
                  <th className="text-center px-2 py-2 font-medium">In/Out</th>
                  <th className="text-right px-2 py-2 font-medium">Quantity</th>
                  <th className="text-right px-4 py-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 text-muted-foreground">{row.date}</td>
                    <td className="px-2 py-2">{row.type}</td>
                    <td className="px-2 py-2 text-blue-600">{row.ref}</td>
                    <td className="px-2 py-2 text-center text-muted-foreground">{row.inOut}</td>
                    <td
                      className={`px-2 py-2 text-right font-medium ${
                        row.qty > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {row.qty > 0 ? `+${row.qty}` : row.qty}
                    </td>
                    <td className="px-4 py-2 text-right">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3">
              <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all stock movements <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* --- Stock History Chart --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Stock History</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              30 Days ▾
            </Button>
          </CardHeader>
          <CardContent>
            <StockHistoryChart />
          </CardContent>
        </Card>

        {/* --- Warehouse Availability --- */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Warehouse Availability</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b">
                  <th className="text-left px-4 py-2 font-medium">Warehouse</th>
                  <th className="text-right px-2 py-2 font-medium">Available</th>
                  <th className="text-right px-2 py-2 font-medium">Reserved</th>
                  <th className="text-right px-2 py-2 font-medium">Incoming</th>
                  <th className="text-right px-4 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {warehouseAvailability.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2">{row.warehouse}</td>
                    <td className="px-2 py-2 text-right">{row.available}</td>
                    <td className="px-2 py-2 text-right text-muted-foreground">{row.reserved}</td>
                    <td className="px-2 py-2 text-right">{row.incoming}</td>
                    <td className="px-4 py-2 text-right font-medium">{row.total}</td>
                  </tr>
                ))}
                <tr className="bg-muted/40">
                  <td className="px-4 py-2 font-semibold">Total</td>
                  <td className="px-2 py-2 text-right font-semibold">248</td>
                  <td className="px-2 py-2 text-right font-semibold">32</td>
                  <td className="px-2 py-2 text-right font-semibold">70</td>
                  <td className="px-4 py-2 text-right font-semibold">350</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ============ BOTTOM ROW – 4 METRIC CARDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {bottomMetrics.map((m, i) => (
          <Card key={i} className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{m.title}</p>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-2xl font-bold">{m.value}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mt-1">
                  {m.badge}
                </span>
              </div>
              <Sparkline />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">{m.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductInventory;