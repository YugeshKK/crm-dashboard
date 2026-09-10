import React from "react";
import { TrendingUp, ArrowRight, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ============================================================
// DUMMY DATA
// ============================================================

const metricsData = [
  { label: "Units Sold (This Month)", value: "182", change: "12.4%", positive: true },
  { label: "Revenue (This Month)", value: "₹45,20,000", change: "15.3%", positive: true },
  { label: "Profit (This Month)", value: "₹12,30,000", change: "18.6%", positive: true },
  { label: "Gross Margin", value: "27.2%", change: "2.4%", positive: true },
  { label: "Total Orders", value: "64", change: "8.7%", positive: true },
  { label: "Avg. Selling Price", value: "₹24,835", change: "3.1%", positive: true },
];

// Sales chart data points (approximating the screenshot)
const salesChartPoints = [
  { x: 0, y: 146 },   // 1 May  – 20
  { x: 83, y: 104 },  // 5 May  – 80
  { x: 166, y: 55 },  // 10 May – 150
  { x: 250, y: 90 },  // 15 May – 100
  { x: 333, y: 34 },  // 20 May – 180
  { x: 416, y: 55 },  // 25 May – 150
  { x: 500, y: 55 },  // 30 May – 150
];

const salesChartLabels = ["1 May", "5 May", "10 May", "15 May", "20 May", "25 May", "30 May"];

const stockMovements = [
  { type: "Sale", date: "30 May 2024", quantity: -22, balance: 248, refNo: "ORD-1024" },
  { type: "Purchase", date: "28 May 2024", quantity: 70, balance: 270, refNo: "PO-2031" },
  { type: "Sale", date: "25 May 2024", quantity: -18, balance: 200, refNo: "ORD-1017" },
  { type: "Sale", date: "20 May 2024", quantity: -25, balance: 218, refNo: "ORD-1009" },
  { type: "Purchase", date: "15 May 2024", quantity: 100, balance: 243, refNo: "PO-2025" },
];

const topCustomers = [
  { name: "SunPower Energy", units: 62, revenue: "₹15,50,000" },
  { name: "GreenTech Solutions", units: 48, revenue: "₹12,00,000" },
  { name: "ABC Solar Pvt. Ltd.", units: 34, revenue: "₹8,50,000" },
  { name: "Bright Future Energy", units: 22, revenue: "₹5,50,000" },
  { name: "Eco Power Systems", units: 16, revenue: "₹4,00,000" },
];

const productInfo = [
  { label: "SKU", value: "SP-550" },
  { label: "Weight", value: "27.5 kg" },
  { label: "Barcode", value: "8901234567890" },
  { label: "Dimensions", value: "2279 x 1134 x 35 mm" },
  { label: "Category", value: "Solar Panels" },
  { label: "Country of Origin", value: "India" },
  { label: "Brand", value: "SunPower" },
  { label: "Status", value: "Active", badge: true },
];

const recentOrders = [
  { orderNo: "ORD-1024", customer: "SunPower Energy", date: "30 May 2024", qty: 22, status: "Delivered" },
  { orderNo: "ORD-1023", customer: "GreenTech Solutions", date: "29 May 2024", qty: 18, status: "Delivered" },
  { orderNo: "ORD-1022", customer: "ABC Solar Pvt. Ltd.", date: "28 May 2024", qty: 12, status: "Processing" },
  { orderNo: "ORD-1021", customer: "Bright Future Energy", date: "27 May 2024", qty: 8, status: "Delivered" },
  { orderNo: "ORD-1020", customer: "Eco Power Systems", date: "26 May 2024", qty: 10, status: "Delivered" },
];

// Placeholder images – using gradient divs to simulate product photos
const productImages = [
  "linear-gradient(135deg, #1e3a5f, #0a1a2e)",
  "linear-gradient(135deg, #2d4a6b, #142a45)",
  "linear-gradient(135deg, #3a5a7a, #1e3a5f)",
  "linear-gradient(135deg, #1a2e4a, #0d1f33)",
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Individual metric card */
const MetricCard = ({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) => (
  <Card className="border rounded-lg p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <div className="flex items-center gap-1 mt-1">
      <TrendingUp className={`w-3.5 h-3.5 ${positive ? "text-green-600" : "text-red-500"}`} />
      <span className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
        {change}
      </span>
      <span className="text-xs text-muted-foreground">vs last month</span>
    </div>
  </Card>
);

/** SVG area chart for Sales Overview */
const SalesChart = () => {
  // Build smooth path using cubic bezier
  const linePath = `
    M ${salesChartPoints[0].x} ${salesChartPoints[0].y}
    C 40 120, 50 ${salesChartPoints[1].y}, ${salesChartPoints[1].x} ${salesChartPoints[1].y}
    C 120 ${salesChartPoints[1].y}, 140 ${salesChartPoints[2].y}, ${salesChartPoints[2].x} ${salesChartPoints[2].y}
    C 200 ${salesChartPoints[2].y}, 220 ${salesChartPoints[3].y}, ${salesChartPoints[3].x} ${salesChartPoints[3].y}
    C 280 ${salesChartPoints[3].y}, 300 ${salesChartPoints[4].y}, ${salesChartPoints[4].x} ${salesChartPoints[4].y}
    C 370 ${salesChartPoints[4].y}, 390 ${salesChartPoints[5].y}, ${salesChartPoints[5].x} ${salesChartPoints[5].y}
    C 450 ${salesChartPoints[5].y}, 470 ${salesChartPoints[6].y}, ${salesChartPoints[6].x} ${salesChartPoints[6].y}
  `;

  const areaPath = `${linePath} L 500 160 L 0 160 Z`;

  return (
    <div className="w-full">
      <svg viewBox="0 0 500 180" className="w-full h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[20, 55, 90, 125, 160].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="500" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" />

        {/* End dot */}
        <circle cx="500" cy="55" r="4" fill="#22c55e" stroke="white" strokeWidth="2" />
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
        {salesChartLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ProductOverview: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ============ TOP ROW – METRIC CARDS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricsData.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* ============ MIDDLE ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- Sales Overview --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              This Month <ChevronDown className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-6 text-sm">
              <span>
                Units Sold: <strong className="text-foreground">182</strong>
              </span>
              <span>
                Revenue: <strong className="text-foreground">₹45,20,000</strong>
              </span>
            </div>
            <SalesChart />
          </CardContent>
        </Card>

        {/* --- Stock Movement --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Stock Movement (Last 30 Days)</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              All <ChevronDown className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b">
                  <th className="text-left px-4 py-2 font-medium">Type</th>
                  <th className="text-left px-2 py-2 font-medium">Date</th>
                  <th className="text-right px-2 py-2 font-medium">Quantity</th>
                  <th className="text-right px-2 py-2 font-medium">Balance</th>
                  <th className="text-right px-4 py-2 font-medium">Ref No.</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2">{row.type}</td>
                    <td className="px-2 py-2 text-muted-foreground">{row.date}</td>
                    <td
                      className={`px-2 py-2 text-right font-medium ${
                        row.quantity > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                    </td>
                    <td className="px-2 py-2 text-right">{row.balance}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{row.refNo}</td>
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

        {/* --- Top Customers --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              This Month <ChevronDown className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b">
                  <th className="text-left px-4 py-2 font-medium">Customer</th>
                  <th className="text-right px-2 py-2 font-medium">Units</th>
                  <th className="text-right px-4 py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-2 py-2 text-right">{c.units}</td>
                    <td className="px-4 py-2 text-right">{c.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3">
              <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all buyers <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ BOTTOM ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- Product Information --- */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {productInfo.map((item, i) => (
                <div key={i}>
                  <dt className="text-[11px] text-muted-foreground uppercase">{item.label}</dt>
                  <dd className="mt-0.5">
                    {item.badge ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {item.value}
                      </span>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* --- Recent Orders --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all orders <ArrowRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b">
                  <th className="text-left px-4 py-2 font-medium">Order No.</th>
                  <th className="text-left px-2 py-2 font-medium">Customer</th>
                  <th className="text-left px-2 py-2 font-medium">Date</th>
                  <th className="text-right px-2 py-2 font-medium">Qty</th>
                  <th className="text-right px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 text-blue-600 font-medium">{o.orderNo}</td>
                    <td className="px-2 py-2">{o.customer}</td>
                    <td className="px-2 py-2 text-muted-foreground">{o.date}</td>
                    <td className="px-2 py-2 text-right">{o.qty}</td>
                    <td className="px-4 py-2 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          o.status === "Delivered"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {o.status === "Processing" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 animate-pulse" />
                        )}
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* --- Product Images --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Product Images</CardTitle>
            <button className="text-xs text-blue-600 hover:underline">View all</button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {productImages.map((bg, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md overflow-hidden relative"
                  style={{ background: bg }}
                >
                  <img src="https://picsum.photos/200/300" alt="" />
                </div>
              ))}
              {/* "+2" overlay on the last image */}
              <div className="relative aspect-square rounded-md overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{ background: "linear-gradient(135deg, #1a2e4a, #0d1f33)" }}
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+2</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductOverview;