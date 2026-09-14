import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ============================================================
// DUMMY DATA
// ============================================================
type Supplier = {
  id: string;
  name: string;
  materials: string;
  leadTime: string;
  lastPurchase: string;
  status: "active" | "inactive";
};

const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "SolarTech Components",
    materials: "Solar Cell, Junction Box",
    leadTime: "7 Days",
    lastPurchase: "05 Aug 2024",
    status: "active",
  },
  {
    id: "sup-2",
    name: "GlassPro Industries",
    materials: "Tempered Glass",
    leadTime: "5 Days",
    lastPurchase: "28 Jul 2024",
    status: "active",
  },
  {
    id: "sup-3",
    name: "Polymer Solutions",
    materials: "EVA Sheet, Backsheet",
    leadTime: "6 Days",
    lastPurchase: "30 Jul 2024",
    status: "active",
  },
  {
    id: "sup-4",
    name: "AluFrame Pvt. Ltd.",
    materials: "Aluminium Frame",
    leadTime: "4 Days",
    lastPurchase: "02 Aug 2024",
    status: "active",
  },
  {
    id: "sup-5",
    name: "Connector World",
    materials: "MC4 Connector",
    leadTime: "3 Days",
    lastPurchase: "01 Aug 2024",
    status: "active",
  },
  {
    id: "sup-6",
    name: "SealRight Products",
    materials: "Silicone Sealant",
    leadTime: "2 Days",
    lastPurchase: "29 Jul 2024",
    status: "active",
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductSuppliers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [
        supplier.name,
        supplier.materials,
        supplier.leadTime,
        supplier.lastPurchase,
        supplier.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  return (
    <Card className="border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Suppliers</CardTitle>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search supplier"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-8 w-[180px] text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => console.log("Add Supplier clicked")}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground uppercase text-[10px] border-y bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium">Supplier</th>
              <th className="text-left px-4 py-2.5 font-medium">
                Materials Supplied
              </th>
              <th className="text-left px-4 py-2.5 font-medium">Lead Time</th>
              <th className="text-left px-4 py-2.5 font-medium">
                Last Purchase
              </th>
              <th className="text-right px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-sm">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.materials}
                  </td>
                  <td className="px-4 py-3">{s.leadTime}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.lastPurchase}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        s.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ProductSuppliers;
