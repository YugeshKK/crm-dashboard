import React from "react";
import { TrendingUp, TrendingDown, ChevronDown, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ============================================================
// DUMMY DATA
// ============================================================

const topMetrics = [
  {
    title: "Total Revenue",
    value: "₹ 62,40,000",
    change: "18.6%",
    positive: true,
    note: "vs previous 6 months",
  },
  {
    title: "Total Quantity Sold",
    value: "312 Units",
    change: "15.2%",
    positive: true,
    note: "vs previous 6 months",
  },
  {
    title: "Average Selling Price",
    value: "₹ 19,980",
    change: "3.4%",
    positive: true,
    note: "vs previous 6 months",
  },
  {
    title: "Gross Profit",
    value: "₹ 18,72,000",
    change: "20.1%",
    positive: true,
    note: "vs previous 6 months",
  },
  {
    title: "Gross Margin",
    value: "30.0%",
    change: "2.8%",
    positive: true,
    note: "vs previous 6 months",
  },
];

// Revenue trend chart data (Aug 2023 → Aug 2024)
const revenueTrendPoints = [
  { x: 0, y: 145, label: "Mar 2024", value: 5 },     // ₹ 5L
  { x: 66, y: 120, label: "Apr 2024", value: 8.2 },   // ₹ 8.2L
  { x: 132, y: 105, label: "May 2024", value: 13.9 }, // ₹ 13.9L
  { x: 198, y: 55, label: "Jun 2024", value: 13.3 },  // peak ₹ 15L
  { x: 264, y: 80, label: "Jul 2024", value: 11.3 },  // ₹ 11.3L
  { x: 330, y: 60, label: "Aug 2024", value: 14.8 },  // ₹ 14.8L
];

const revenueTrendLabels = ["Mar 2024", "Apr 2024", "May 2024", "Jun 2024", "Jul 2024", "Aug 2024"];
const revenueYAxis = ["₹ 0", "₹ 5L", "₹ 10L", "₹ 15L", "₹ 20L"];

// Sales by channel
const salesByChannel = [
  { label: "Direct Sales", value: 2810000, percent: 45, color: "#22c55e" },
  { label: "Distributors", value: 1872000, percent: 30, color: "#3b82f6" },
  { label: "Online", value: 936000, percent: 15, color: "#8b5cf6" },
  { label: "Others", value: 624000, percent: 10, color: "#f59e0b" },
];

// Sales summary table
const salesSummary = [
  { period: "Aug 2024", revenue: 1480000, qty: 74, avgPrice: 20000, grossProfit: 444000, margin: 30.0 },
  { period: "Jul 2024", revenue: 1130000, qty: 56, avgPrice: 20180, grossProfit: 336000, margin: 30.0 },
  { period: "Jun 2024", revenue: 1500000, qty: 48, avgPrice: 18750, grossProfit: 273000, margin: 29.8 },
  { period: "May 2024", revenue: 1390000, qty: 68, avgPrice: 19853, grossProfit: 405000, margin: 29.1 },
  { period: "Apr 2024", revenue: 820000, qty: 40, avgPrice: 20500, grossProfit: 246000, margin: 30.0 },
  { period: "Mar 2024", revenue: 560000, qty: 28, avgPrice: 20000, grossProfit: 168000, margin: 30.0 },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

/** Revenue Trend Chart (SVG line + area) */
const RevenueTrendChart = () => {
  // Smooth curve path
  const linePath = `
    M ${revenueTrendPoints[0].x} ${revenueTrendPoints[0].y}
    C 33 130, 50 ${revenueTrendPoints[1].y}, ${revenueTrendPoints[1].x} ${revenueTrendPoints[1].y}
    C 99 ${revenueTrendPoints[1].y}, 115 ${revenueTrendPoints[2].y}, ${revenueTrendPoints[2].x} ${revenueTrendPoints[2].y}
    C 165 ${revenueTrendPoints[2].y}, 180 ${revenueTrendPoints[3].y}, ${revenueTrendPoints[3].x} ${revenueTrendPoints[3].y}
    C 231 ${revenueTrendPoints[3].y}, 245 ${revenueTrendPoints[4].y}, ${revenueTrendPoints[4].x} ${revenueTrendPoints[4].y}
    C 297 ${revenueTrendPoints[4].y}, 310 ${revenueTrendPoints[5].y}, ${revenueTrendPoints[5].x} ${revenueTrendPoints[5].y}
  `;

  const areaPath = `${linePath} L 330 160 L 0 160 Z`;

  return (
    <div className="flex gap-3">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between text-[10px] text-muted-foreground py-1">
        {revenueYAxis.slice().reverse().map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="flex-1">
        <svg viewBox="0 0 340 170" className="w-full h-52" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[10, 48, 86, 124, 160].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="340" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
          ))}

          {/* Area */}
          <path d={areaPath} fill="url(#revenueAreaGradient)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" />

          {/* Data points */}
          {revenueTrendPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#22c55e"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          {revenueTrendLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Donut Chart for Sales by Channel */
const SalesByChannelDonut = ({ data }: { data: typeof salesByChannel }) => {
  const radius = 45;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-[140px] h-[140px]">
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
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
    </div>
  );
};

/** Format number as Indian Rupee */
const formatINR = (num: number) => {
  return `₹ ${num.toLocaleString("en-IN")}`;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SalesPerformance: React.FC = () => {
  const totalRevenue = salesByChannel.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ============ HEADER ============ */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sales Performance</h2>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
          Last 6 Months <ChevronDown className="w-3 h-3" />
        </Button>
      </div>

      {/* ============ TOP METRIC CARDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {topMetrics.map((m, i) => (
          <Card key={i} className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{m.title}</p>
            <p className="text-2xl font-bold mt-1">{m.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {m.positive ? (
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  m.positive ? "text-green-600" : "text-red-500"
                }`}
              >
                {m.change}
              </span>
              <span className="text-xs text-muted-foreground">{m.note}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ============ MIDDLE ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* --- Revenue Trend --- */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Revenue (₹) <ChevronDown className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart />
          </CardContent>
        </Card>

        {/* --- Sales by Channel --- */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <SalesByChannelDonut data={salesByChannel} />
              <div className="flex-1 space-y-3">
                {salesByChannel.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatINR(item.value)} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ BOTTOM ROW ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* --- Sales Summary Table (spans 2 columns) --- */}
        <Card className="border rounded-lg lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sales Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium">Period</th>
                  <th className="text-right px-2 py-2.5 font-medium">Revenue (₹)</th>
                  <th className="text-right px-2 py-2.5 font-medium">Quantity Sold</th>
                  <th className="text-right px-2 py-2.5 font-medium">Avg. Selling Price (₹)</th>
                  <th className="text-right px-2 py-2.5 font-medium">Gross Profit (₹)</th>
                  <th className="text-right px-4 py-2.5 font-medium">Gross Margin</th>
                </tr>
              </thead>
              <tbody>
                {salesSummary.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium">{row.period}</td>
                    <td className="px-2 py-2.5 text-right">{formatINR(row.revenue)}</td>
                    <td className="px-2 py-2.5 text-right">{row.qty}</td>
                    <td className="px-2 py-2.5 text-right">{formatINR(row.avgPrice)}</td>
                    <td className="px-2 py-2.5 text-right">{formatINR(row.grossProfit)}</td>
                    <td className="px-4 py-2.5 text-right">{row.margin.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t">
              <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View full report <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* --- Right Column: Reserved for Key Insights (empty) --- */}
        <div className="lg:col-span-1">
          {/* 
            Key Insights section intentionally excluded.
            Reserved space for future content, or can be removed to expand table.
          */}
        </div>
      </div>
    </div>
  );
};

export default SalesPerformance;