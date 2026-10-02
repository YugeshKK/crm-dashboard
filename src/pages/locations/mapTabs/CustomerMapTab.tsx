import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import {
  Users,
  IndianRupee,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Search,
  Maximize2,
  Filter,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  totalOrders: number;
  totalRevenue: number;
  lastOrder: string;
  tier: "platinum" | "gold" | "silver";
  status: "active" | "inactive";
}

// ─── Dummy Data ──────────────────────────────────────────
const customers: Customer[] = [
  { id: "c-1", name: "ABC Electronics", email: "contact@abcelectronics.com", phone: "+91 98765 43210", address: "Noida, UP", lat: 28.5355, lng: 77.391, totalOrders: 42, totalRevenue: 1550000, lastOrder: "2 days ago", tier: "platinum", status: "active" },
  { id: "c-2", name: "SunPower Energy", email: "sales@sunpower.com", phone: "+91 98765 22222", address: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873, totalOrders: 38, totalRevenue: 1200000, lastOrder: "5 days ago", tier: "platinum", status: "active" },
  { id: "c-3", name: "GreenTech Solutions", email: "info@greentech.com", phone: "+91 98765 11111", address: "Lucknow, UP", lat: 26.8467, lng: 80.9462, totalOrders: 28, totalRevenue: 850000, lastOrder: "1 week ago", tier: "gold", status: "active" },
  { id: "c-4", name: "Bright Future Energy", email: "orders@bfe.com", phone: "+91 98765 33333", address: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946, totalOrders: 22, totalRevenue: 550000, lastOrder: "3 days ago", tier: "gold", status: "active" },
  { id: "c-5", name: "EcoPower Systems", email: "hello@ecopower.com", phone: "+91 98765 44444", address: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567, totalOrders: 18, totalRevenue: 400000, lastOrder: "2 weeks ago", tier: "silver", status: "active" },
  { id: "c-6", name: "PowerGrid Distributors", email: "info@powergrid.com", phone: "+91 98765 55555", address: "Ahmedabad, Gujarat", lat: 23.0225, lng: 72.5714, totalOrders: 15, totalRevenue: 320000, lastOrder: "3 weeks ago", tier: "silver", status: "active" },
  { id: "c-7", name: "SolarTech Industries", email: "sales@solartech.com", phone: "+91 98765 66666", address: "Hyderabad, Telangana", lat: 17.385, lng: 78.4867, totalOrders: 12, totalRevenue: 280000, lastOrder: "1 month ago", tier: "silver", status: "inactive" },
  { id: "c-8", name: "NextGen Solar", email: "info@nextgen.com", phone: "+91 98765 77777", address: "Kolkata, WB", lat: 22.5726, lng: 88.3639, totalOrders: 20, totalRevenue: 620000, lastOrder: "4 days ago", tier: "gold", status: "active" },
  { id: "c-9", name: "Renewable Co.", email: "contact@renewable.com", phone: "+91 98765 88888", address: "Mumbai, MH", lat: 19.076, lng: 72.8777, totalOrders: 25, totalRevenue: 780000, lastOrder: "6 days ago", tier: "gold", status: "active" },
  { id: "c-10", name: "Solaris Energy", email: "info@solaris.com", phone: "+91 98765 99999", address: "Surat, Gujarat", lat: 21.1702, lng: 72.8311, totalOrders: 8, totalRevenue: 180000, lastOrder: "1 month ago", tier: "silver", status: "active" },
  { id: "c-11", name: "Coastal Solar", email: "hi@coastal.com", phone: "+91 98765 12345", address: "Kochi, Kerala", lat: 9.9312, lng: 76.2673, totalOrders: 14, totalRevenue: 340000, lastOrder: "1 week ago", tier: "silver", status: "active" },
  { id: "c-12", name: "Northern Lights Solar", email: "info@nls.com", phone: "+91 98765 54321", address: "Chandigarh", lat: 30.7333, lng: 76.7794, totalOrders: 19, totalRevenue: 510000, lastOrder: "5 days ago", tier: "gold", status: "active" },
];

const tierColors = {
  platinum: "#a855f7",
  gold: "#eab308",
  silver: "#94a3b8",
};

const tierLabels = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
};

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(0)}K`;
  return `₹ ${n}`;
};

// ─── Custom icon factory ────────────────────────────────
const getCustomerIcon = (tier: keyof typeof tierColors, selected: boolean) =>
  new L.DivIcon({
    html: `
      <div style="
        width: ${selected ? "42px" : "32px"};
        height: ${selected ? "42px" : "32px"};
        background: ${tierColors[tier]};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        transition: all 0.2s;
      "></div>
    `,
    className: "",
    iconSize: selected ? [42, 42] : [32, 32],
    iconAnchor: selected ? [21, 21] : [16, 16],
  });

// ─── Component ───────────────────────────────────────────
export function CustomerMapTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "platinum" | "gold" | "silver">("all");
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return [c.name, c.email, c.address].join(" ").toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, tierFilter]);

  const selected = useMemo(
    () => customers.find((c) => c.id === selectedId) || null,
    [selectedId]
  );

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, c) => s + c.totalRevenue, 0);
    const orders = filtered.reduce((s, c) => s + c.totalOrders, 0);
    const byTier = {
      platinum: filtered.filter((c) => c.tier === "platinum").length,
      gold: filtered.filter((c) => c.tier === "gold").length,
      silver: filtered.filter((c) => c.tier === "silver").length,
    };
    return { revenue, orders, byTier };
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      {/* Sidebar */}
      <div className="space-y-3">
        {/* Summary card */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Network
            </p>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Customers</p>
              <p className="text-lg font-bold">{filtered.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Revenue</p>
              <p className="text-sm font-bold">{formatINR(totals.revenue)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
              <p className="text-lg font-bold">{totals.orders}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg / Customer</p>
              <p className="text-sm font-bold">
                {formatINR(filtered.length ? totals.revenue / filtered.length : 0)}
              </p>
            </div>
          </div>

          {/* Tier legend */}
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 text-[10px]">
            {(["platinum", "gold", "silver"] as const).map((tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tierColors[tier] }}
                />
                <span className="text-muted-foreground">
                  {tierLabels[tier]} ({totals.byTier[tier]})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                {tierFilter === "all" ? "All Tiers" : tierLabels[tierFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={tierFilter}
                onValueChange={(v) => setTierFilter(v as any)}
              >
                <DropdownMenuRadioItem value="all">All Tiers</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="platinum">Platinum</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="gold">Gold</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="silver">Silver</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Customer list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: tierColors[c.tier] }}
                  >
                    {c.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      {c.status === "inactive" && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {c.address}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {c.totalOrders} orders
                      </span>
                      <span className="text-xs font-semibold">
                        {formatINR(c.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No customers match your filters
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden bg-card relative">
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 shadow-md"
            onClick={() => setShowHeatmap((h) => !h)}
          >
            <Flame className="w-3.5 h-3.5" />
            {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
          </Button>
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <MapContainer
          center={[21.5, 79]}
          zoom={5}
          style={{ height: "600px", width: "100%", zIndex: 10 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmap — represented as large translucent circles */}
          {showHeatmap &&
            filtered.map((c) => (
              <CircleMarker
                key={`heat-${c.id}`}
                center={[c.lat, c.lng]}
                radius={Math.min(50, 15 + c.totalRevenue / 50000)}
                pathOptions={{
                  color: "transparent",
                  fillColor: "#ef4444",
                  fillOpacity: 0.15,
                }}
              />
            ))}

          {/* Customer markers */}
          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={getCustomerIcon(c.tier, isSelected)}
                eventHandlers={{ click: () => setSelectedId(c.id) }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup>
                  <div className="min-w-[220px] p-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: tierColors[c.tier] }}
                      >
                        {tierLabels[c.tier]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.address}</p>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Revenue
                        </p>
                        <p className="font-semibold">{formatINR(c.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Orders
                        </p>
                        <p className="font-semibold">{c.totalOrders}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Last Order
                        </p>
                        <p className="font-medium">{c.lastOrder}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t space-y-1">
                      <p className="text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {c.phone}
                      </p>
                      <p className="text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {c.email}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}