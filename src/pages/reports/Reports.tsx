import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Users,
  Target,
  AlertCircle,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// ============================================================
// DUMMY DATA
// ============================================================
const kpis = [
  { label: "Total Revenue", value: "₹ 62.4 L", change: "+18.6%", positive: true, icon: IndianRupee, sub: "vs last period" },
  { label: "Orders", value: "312", change: "+15.2%", positive: true, icon: ShoppingCart, sub: "vs last period" },
  { label: "New Leads", value: "128", change: "+12.4%", positive: true, icon: Users, sub: "vs last period" },
  { label: "Conversion Rate", value: "24.8%", change: "+2.1%", positive: true, icon: Target, sub: "leads → orders" },
  { label: "Outstanding", value: "₹ 32.4 L", change: "-5.7%", positive: false, icon: AlertCircle, sub: "needs follow-up" },
];

// Revenue trend per period
const revenueData: Record<string, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 82000 },
    { label: "Tue", value: 115000 },
    { label: "Wed", value: 98000 },
    { label: "Thu", value: 142000 },
    { label: "Fri", value: 168000 },
    { label: "Sat", value: 124000 },
    { label: "Sun", value: 88000 },
  ],
  "30d": [
    { label: "1", value: 42000 },
    { label: "5", value: 68000 },
    { label: "10", value: 145000 },
    { label: "15", value: 118000 },
    { label: "20", value: 210000 },
    { label: "25", value: 172000 },
    { label: "30", value: 238000 },
  ],
  "90d": [
    { label: "Apr 1", value: 320000 },
    { label: "Apr 15", value: 480000 },
    { label: "May 1", value: 540000 },
    { label: "May 15", value: 420000 },
    { label: "Jun 1", value: 680000 },
    { label: "Jun 15", value: 720000 },
    { label: "Jun 30", value: 840000 },
  ],
  "1y": [
    { label: "Jul", value: 680000 },
    { label: "Sep", value: 820000 },
    { label: "Nov", value: 1250000 },
    { label: "Jan", value: 1080000 },
    { label: "Mar", value: 1420000 },
    { label: "May", value: 1680000 },
    { label: "Jul", value: 1840000 },
  ],
};

// Sales by channel
const salesByChannel = [
  { label: "Direct Sales", value: 2810000, percent: 45, color: "#22c55e" },
  { label: "Distributors", value: 1872000, percent: 30, color: "#3b82f6" },
  { label: "Online", value: 936000, percent: 15, color: "#8b5cf6" },
  { label: "Others", value: 624000, percent: 10, color: "#f59e0b" },
];

// Lead pipeline funnel
const pipelineFunnel = [
  { stage: "New Leads", count: 128, color: "#3b82f6" },
  { stage: "Contacted", count: 96, color: "#8b5cf6" },
  { stage: "Qualified", count: 58, color: "#6366f1" },
  { stage: "Converted", count: 32, color: "#22c55e" },
];

// Payment status breakdown
const paymentBreakdown = [
  { label: "Paid", value: 892, percent: 72, color: "#22c55e" },
  { label: "Partial", value: 186, percent: 15, color: "#eab308" },
  { label: "Pending", value: 124, percent: 10, color: "#3b82f6" },
  { label: "Overdue", value: 38, percent: 3, color: "#ef4444" },
];

// AR aging
const arAging = [
  { bucket: "0-30 days", amount: 1840000, percent: 56, color: "#22c55e" },
  { bucket: "31-60 days", amount: 820000, percent: 25, color: "#eab308" },
  { bucket: "61-90 days", amount: 420000, percent: 13, color: "#f97316" },
  { bucket: "90+ days", amount: 210000, percent: 6, color: "#ef4444" },
];

// Top products
const topProducts = [
  { name: "Solar Panel 550W", sku: "SP-550", units: 182, revenue: 4520000 },
  { name: "Solar Inverter 10kW", sku: "INV-10KW", units: 62, revenue: 2480000 },
  { name: "Lithium Battery 5kWh", sku: "BAT-5KWH", units: 44, revenue: 1860000 },
  { name: "Mounting Kit", sku: "MT-KIT", units: 96, revenue: 528000 },
  { name: "DC Cable 4mm", sku: "DC-4MM", units: 220, revenue: 380000 },
];

// Top customers
const topCustomers = [
  { name: "ABC Electronics", orders: 42, revenue: 1550000 },
  { name: "SunPower Energy", orders: 38, revenue: 1200000 },
  { name: "GreenTech Solutions", orders: 28, revenue: 850000 },
  { name: "Bright Future Energy", orders: 22, revenue: 550000 },
  { name: "EcoPower Systems", orders: 18, revenue: 400000 },
];

// ============================================================
// HELPERS
// ============================================================
const formatINR = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(0)}K`;
  return `₹ ${n}`;
};

const formatINRFull = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

// ============================================================
// CHART 1 — Revenue Trend (SVG Area + Line)
// ============================================================
const RevenueTrendChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const min = Math.min(...data.map((d) => d.value)) * 0.8;
  const W = 600;
  const H = 220;
  const padL = 40;
  const padB = 30;
  const padT = 10;
  const chartW = W - padL - 10;
  const chartH = H - padT - padB;

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - ((d.value - min) / (max - min)) * chartH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + chartH} L ${padL} ${padT + chartH} Z`;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(min + ((max - min) * i) / yTicks)
  );

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid lines + labels */}
        {yLabels.map((val, i) => {
          const y = padT + chartH - (i / yTicks) * chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - 10} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-border" />
              <text x={padL - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-muted-foreground">
                {formatINR(val).replace("₹ ", "")}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#revAreaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#22c55e" stroke="white" strokeWidth="2" />
          </g>
        ))}

        {/* X labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H - 10} textAnchor="middle" className="text-[9px] fill-muted-foreground">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ============================================================
// CHART 2 — Donut Chart (reusable)
// ============================================================
interface DonutSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
}

const DonutChart = ({
  segments,
  centerTop,
  centerBottom,
  size = 160,
}: {
  segments: DonutSegment[];
  centerTop?: string;
  centerBottom?: string;
  size?: number;
}) => {
  const radius = 55;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => {
          const length = (seg.percent / 100) * circumference;
          const dasharray = `${length} ${circumference - length}`;
          const dashoffset = -offset;
          offset += length;
          return (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      {(centerTop || centerBottom) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerTop && <span className="text-2xl font-bold">{centerTop}</span>}
          {centerBottom && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {centerBottom}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// CHART 3 — Funnel
// ============================================================
const FunnelChart = ({ data }: { data: typeof pipelineFunnel }) => {
  const max = data[0].count;
  return (
    <div className="space-y-2.5">
      {data.map((stage, i) => {
        const widthPct = (stage.count / max) * 100;
        const conversion = i === 0 ? 100 : Math.round((stage.count / data[i - 1].count) * 100);
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{stage.stage}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stage.count}</span>
                {i > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ({conversion}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-7 bg-muted/40 rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-500 flex items-center px-2"
                style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
              >
                <span className="text-[10px] font-semibold text-white truncate">
                  {stage.count} leads
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// CHART 4 — AR Aging Bars
// ============================================================
const ARAgingChart = ({ data }: { data: typeof arAging }) => {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div className="space-y-3">
      {data.map((bucket, i) => {
        const widthPct = (bucket.amount / max) * 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{bucket.bucket}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatINR(bucket.amount)}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right">
                  {bucket.percent}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: bucket.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// SEGMENTED CONTROL
// ============================================================
const DateRangeSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const options = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "1y", label: "1Y" },
  ];
  return (
    <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            value === opt.value
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Reports = () => {
  const [dateRange, setDateRange] = useState("30d");
  const chartData = useMemo(() => revenueData[dateRange], [dateRange]);

  const totalRevenue = useMemo(
    () => chartData.reduce((s, d) => s + d.value, 0),
    [chartData]
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ============ HEADER ============ */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance insights across sales, customers, and finance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9">
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Schedule Email Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ============ KPI ROW ============ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const TrendIcon = k.positive ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-1.5">{k.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon
                  className={`w-3 h-3 ${
                    k.positive ? "text-green-600" : "text-red-500"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium ${
                    k.positive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {k.change}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {k.sub}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ============ ROW 1: Revenue Trend + Sales by Channel ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <Card className="border rounded-lg lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Total: <span className="font-medium text-foreground">{formatINRFull(totalRevenue)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Avg. per day
              </p>
              <p className="text-sm font-semibold">
                {formatINR(Math.round(totalRevenue / chartData.length))}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={chartData} />
          </CardContent>
        </Card>

        {/* Sales by Channel */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DonutChart
                segments={salesByChannel}
                centerTop="₹62L"
                centerBottom="Total"
                size={160}
              />
              <div className="flex-1 space-y-3">
                {salesByChannel.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-muted-foreground">{c.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatINR(c.value)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.percent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ ROW 2: Funnel + AR Aging + Payment Breakdown ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lead Funnel */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Lead Pipeline Funnel</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Conversion: 25% (128 → 32)
            </p>
          </CardHeader>
          <CardContent>
            <FunnelChart data={pipelineFunnel} />
          </CardContent>
        </Card>

        {/* AR Aging */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">AR Aging</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Total outstanding: ₹ 32.9 L
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ARAgingChart data={arAging} />
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="border rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DonutChart
                segments={paymentBreakdown}
                centerTop="1240"
                centerBottom="Invoices"
                size={140}
              />
              <div className="flex-1 space-y-3">
                {paymentBreakdown.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-muted-foreground">{p.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{p.value}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.percent}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ ROW 3: Top Products + Top Customers ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
            <button className="text-[11px] text-blue-600 hover:underline">
              View all
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-y bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium">Product</th>
                  <th className="text-right px-4 py-2 font-medium">Units</th>
                  <th className="text-right px-4 py-2 font-medium">Revenue</th>
                  <th className="text-right px-4 py-2 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => {
                  const share = (p.revenue / topProducts[0].revenue) * 100;
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {p.sku}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {p.units}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {formatINR(p.revenue)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8 text-right">
                            {Math.round(share)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold">Top Customers</CardTitle>
            <button className="text-[11px] text-blue-600 hover:underline">
              View all
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] border-y bg-muted/30">
                  <th className="text-left px-4 py-2 font-medium">Customer</th>
                  <th className="text-right px-4 py-2 font-medium">Orders</th>
                  <th className="text-right px-4 py-2 font-medium">Revenue</th>
                  <th className="text-right px-4 py-2 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => {
                  const share = (c.revenue / topCustomers[0].revenue) * 100;
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                            {c.name
                              .split(" ")
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")}
                          </div>
                          <p className="font-medium text-sm">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {c.orders}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {formatINR(c.revenue)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-8 text-right">
                            {Math.round(share)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;