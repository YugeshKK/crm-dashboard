import { useState } from "react";
import {
  Warehouse,
  Users,
  BriefcaseBusiness,
  Map as MapIcon,
  Truck,
  Building2,
  Wrench,
  Route,
} from "lucide-react";
import { GodownMapTab } from "./mapTabs/GodownMapTab";
import { CustomerMapTab } from "./mapTabs/CustomerMapTab";
import  LeadMapTab  from "./mapTabs/LeadMapTab";
import { RoutePlannerTab } from "./mapTabs/RoutePlannerTab";
import { ComingSoonTab } from "./mapTabs/ComingSoonTab";

type TabKey =
  | "godowns"
  | "customers"
  | "leads"
  | "territories"
  | "delivery"
  | "vendors"
  | "service"
  | "routes";

const tabs: {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  count?: number;
}[] = [
  { key: "godowns", label: "Stock Godown", icon: Warehouse, count: 12 },
  { key: "customers", label: "Customer Locations", icon: Users, count: 128 },
  { key: "leads", label: "Lead Locations", icon: BriefcaseBusiness, count: 84 },
  { key: "territories", label: "Sales Territories", icon: MapIcon, count: 6 },
  { key: "delivery", label: "Delivery Zones", icon: Truck, count: 9 },
  { key: "vendors", label: "Vendors", icon: Building2, count: 24 },
  { key: "service", label: "Service Centers", icon: Wrench, count: 8 },
];

const Locations = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("godowns");

  return (
    <div className="flex flex-col gap-4 p-4 min-w-0">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold">Locations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View and manage all your business locations on the map.
        </p>
      </div>

      {/* ─── Tab bar ─── */}
      <div className="flex items-center gap-0.5 border-b overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? "border-green-600 text-green-700 dark:text-green-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab content ─── */}
      <div className="min-w-0">
        {activeTab === "godowns" && <GodownMapTab />}
        {activeTab === "customers" && <CustomerMapTab />}
        {activeTab === "leads" && <LeadMapTab />}
        {activeTab === "routes" && <RoutePlannerTab />}
        {activeTab === "territories" && (
          <ComingSoonTab
            icon={MapIcon}
            title="Sales Territories"
            description="Draw territory polygons, assign them to salespeople, and analyse coverage. Coming soon."
          />
        )}
        {activeTab === "delivery" && (
          <ComingSoonTab
            icon={Truck}
            title="Delivery Zones"
            description="Define delivery areas, estimate ETAs, and map routes to your customers. Coming soon."
          />
        )}
        {activeTab === "vendors" && (
          <ComingSoonTab
            icon={Building2}
            title="Vendors"
            description="Locate your suppliers and manufacturers on the map. Coming soon."
          />
        )}
        {activeTab === "service" && (
          <ComingSoonTab
            icon={Wrench}
            title="Service Centers"
            description="Track service and installation centers across regions. Coming soon."
          />
        )}
      </div>
    </div>
  );
};

export default Locations;