import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================================
// DUMMY DATA
// ============================================================
type Buyer = {
  id: string;
  name: string;
  type: string;
  totalOrders: number;
  lastOrder: string;
  revenue: string;
  status: "active" | "inactive";
};

const buyers: Buyer[] = [
  {
    id: "buy-1",
    name: "SunPower Energy",
    type: "Distributor",
    totalOrders: 62,
    lastOrder: "30 May 2024",
    revenue: "₹ 15,50,000",
    status: "active",
  },
  {
    id: "buy-2",
    name: "GreenTech Solutions",
    type: "Retailer",
    totalOrders: 48,
    lastOrder: "29 May 2024",
    revenue: "₹ 12,00,000",
    status: "active",
  },
  {
    id: "buy-3",
    name: "ABC Solar Pvt. Ltd.",
    type: "Distributor",
    totalOrders: 34,
    lastOrder: "28 May 2024",
    revenue: "₹ 8,50,000",
    status: "active",
  },
  {
    id: "buy-4",
    name: "Bright Future Energy",
    type: "Installer",
    totalOrders: 22,
    lastOrder: "27 May 2024",
    revenue: "₹ 5,50,000",
    status: "active",
  },
  {
    id: "buy-5",
    name: "Eco Power Systems",
    type: "Reseller",
    totalOrders: 16,
    lastOrder: "26 May 2024",
    revenue: "₹ 4,00,000",
    status: "active",
  },
  {
    id: "buy-6",
    name: "SolarMax Industries",
    type: "Distributor",
    totalOrders: 12,
    lastOrder: "24 May 2024",
    revenue: "₹ 3,20,000",
    status: "inactive",
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductBuyers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBuyers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return buyers;
    }

    return buyers.filter((buyer) =>
      [
        buyer.name,
        buyer.type,
        buyer.lastOrder,
        buyer.revenue,
        buyer.status,
        buyer.totalOrders.toString(),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  return (
    <Card className="border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base font-semibold">Buyers</CardTitle>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search buyer"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-8 w-[180px] text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => console.log("Add Buyer clicked")}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Buyer
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] border-y bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium">Buyer</th>
              <th className="text-left px-4 py-2.5 font-medium">Type</th>
              <th className="text-right px-4 py-2.5 font-medium">Total Orders</th>
              <th className="text-left px-4 py-2.5 font-medium">Last Order</th>
              <th className="text-right px-4 py-2.5 font-medium">Revenue</th>
              <th className="text-right px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuyers.length > 0 ? (
              filteredBuyers.map((b) => (
                <tr
                  key={b.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-sm">{b.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.type}</td>
                  <td className="px-4 py-3 text-right">{b.totalOrders}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.lastOrder}</td>
                  <td className="px-4 py-3 text-right font-medium">{b.revenue}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        b.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No buyers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ProductBuyers;