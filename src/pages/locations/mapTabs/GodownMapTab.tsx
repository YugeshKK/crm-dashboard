import { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Warehouse,
  MapPin,
  Package,
  IndianRupee,
  User,
  Phone,
  Search,
  Layers,
  List,
  Map as MapIcon,
  Route,
  Crosshair,
  ChartPie,
  Truck,
  X,
  ChevronRight,
  ExternalLink,
  Navigation,
  Maximize2,
  Plus,
  Minus,
  Locate,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ============================================================
// TYPES
// ============================================================
interface Godown {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  manager: string;
  phone: string;
  type: "Owned" | "Leased" | "Partner";
  capacity: number; // sq ft
  capacityUsed: number;
  stockValue: number;
  products: number;
  status: "active" | "maintenance";
  utilisation: number;
  image: string;
}

// ============================================================
// DUMMY DATA
// ============================================================
const godowns: Godown[] = [
  {
    id: "wh-1",
    name: "Main Warehouse",
    address: "C-45, Sector 63, Noida, Uttar Pradesh - 201301",
    city: "Noida",
    state: "Uttar Pradesh",
    lat: 28.5355,
    lng: 77.391,
    manager: "Rahul Sharma",
    phone: "+91 98765 43210",
    type: "Owned",
    capacity: 25000,
    capacityUsed: 19500,
    stockValue: 8500000,
    products: 248,
    status: "active",
    utilisation: 78,
    image: "https://picsum.photos/seed/warehouse-main/600/300",
  },
  {
    id: "wh-2",
    name: "Mumbai Depot",
    address: "Plot 22, Bhiwandi, Maharashtra - 421302",
    city: "Bhiwandi",
    state: "Maharashtra",
    lat: 19.2969,
    lng: 73.0636,
    manager: "Priya Singh",
    phone: "+91 98765 11111",
    type: "Leased",
    capacity: 18000,
    capacityUsed: 10080,
    stockValue: 4200000,
    products: 142,
    status: "active",
    utilisation: 56,
    image: "https://picsum.photos/seed/warehouse-mumbai/600/300",
  },
  {
    id: "wh-3",
    name: "Bengaluru Warehouse",
    address: "Hoskote Industrial Area, Karnataka - 562114",
    city: "Hoskote",
    state: "Karnataka",
    lat: 13.0707,
    lng: 77.7982,
    manager: "Vishal Sharma",
    phone: "+91 98765 22222",
    type: "Owned",
    capacity: 15000,
    capacityUsed: 9450,
    stockValue: 2800000,
    products: 96,
    status: "active",
    utilisation: 63,
    image: "https://picsum.photos/seed/warehouse-blr/600/300",
  },
  {
    id: "wh-4",
    name: "Kolkata Godown",
    address: "Howrah Industrial Estate, West Bengal - 711302",
    city: "Howrah",
    state: "West Bengal",
    lat: 22.5958,
    lng: 88.2636,
    manager: "Mike Johnson",
    phone: "+91 98765 33333",
    type: "Leased",
    capacity: 8000,
    capacityUsed: 7280,
    stockValue: 1200000,
    products: 42,
    status: "maintenance",
    utilisation: 91,
    image: "https://picsum.photos/seed/warehouse-kol/600/300",
  },
  {
    id: "wh-5",
    name: "Ahmedabad Store",
    address: "Vatva GIDC, Gujarat - 382445",
    city: "Vatva",
    state: "Gujarat",
    lat: 22.9734,
    lng: 72.6324,
    manager: "Anjali Shah",
    phone: "+91 98765 44444",
    type: "Partner",
    capacity: 6000,
    capacityUsed: 2040,
    stockValue: 850000,
    products: 28,
    status: "active",
    utilisation: 34,
    image: "https://picsum.photos/seed/warehouse-amd/600/300",
  },
  {
    id: "wh-6",
    name: "Chennai Warehouse",
    address: "Ambattur Industrial Estate, Chennai - 600058",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.1143,
    lng: 80.1548,
    manager: "Sneha Reddy",
    phone: "+91 98765 55555",
    type: "Owned",
    capacity: 12000,
    capacityUsed: 6600,
    stockValue: 2100000,
    products: 78,
    status: "active",
    utilisation: 55,
    image: "https://picsum.photos/seed/warehouse-chn/600/300",
  },
];

// ============================================================
// HELPERS
// ============================================================
const getUtilColor = (pct: number) => {
  if (pct >= 85) return { hex: "#ef4444", label: "High Utilisation", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (pct >= 60) return { hex: "#eab308", label: "Medium Utilisation", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  return { hex: "#22c55e", label: "Low Utilisation", badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
};

const getBarColor = (pct: number) => {
  if (pct >= 85) return "bg-red-500";
  if (pct >= 60) return "bg-yellow-500";
  return "bg-green-500";
};

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

// ============================================================
// CUSTOM MARKER ICON
// ============================================================
const getGodownIcon = (godown: Godown, selected: boolean) => {
  const util = getUtilColor(godown.utilisation);
  const size = selected ? 40 : 34;
  return new L.DivIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: ${size}px; height: ${size}px;
          background: ${util.hex};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -55%);
          font-size: 14px;
        ">🏭</div>
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

// ============================================================
// MAP ZOOM CONTROLS
// ============================================================
const MapControls = () => {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <div className="flex flex-col rounded-md overflow-hidden border bg-background shadow-md">
        <button
          onClick={() => map.zoomIn()}
          className="h-8 w-8 flex items-center justify-center hover:bg-muted"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          onClick={() => map.zoomOut()}
          className="h-8 w-8 flex items-center justify-center hover:bg-muted"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={() => map.locate()}
        className="h-8 w-8 rounded-md border bg-background shadow-md flex items-center justify-center hover:bg-muted"
      >
        <Locate className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.invalidateSize()}
        className="h-8 w-8 rounded-md border bg-background shadow-md flex items-center justify-center hover:bg-muted"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export function GodownMapTab() {
  const [selectedId, setSelectedId] = useState<string | null>("wh-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showRoutes, setShowRoutes] = useState(false);

  const filtered = useMemo(() => {
    return godowns.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (typeFilter !== "all" && g.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return [g.name, g.city, g.state, g.address, g.manager]
          .join(" ")
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  const selected = useMemo(
    () => godowns.find((g) => g.id === selectedId) || null,
    [selectedId]
  );

  const totals = useMemo(() => {
    const capacity = godowns.reduce((s, g) => s + g.capacity, 0);
    const used = godowns.reduce((s, g) => s + g.capacityUsed, 0);
    const value = godowns.reduce((s, g) => s + g.stockValue, 0);
    const products = godowns.reduce((s, g) => s + g.products, 0);
    return {
      capacity,
      used,
      value,
      products,
      util: (used / capacity) * 100,
    };
  }, []);

  const routes = useMemo(() => {
    const main = godowns[0];
    return godowns.slice(1).map((g) => ({
      id: g.id,
      positions: [
        [main.lat, main.lng],
        [g.lat, g.lng],
      ] as [number, number][],
    }));
  }, []);

  return (
    <div className="space-y-4 min-w-0">
      {/* ═══════════ FILTER BAR ═══════════ */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search godowns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Owned">Owned</SelectItem>
            <SelectItem value="Leased">Leased</SelectItem>
            <SelectItem value="Partner">Partner</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              More Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Capacity &gt; 70%</DropdownMenuItem>
            <DropdownMenuItem>Has Manager</DropdownMenuItem>
            <DropdownMenuItem>Top Performing</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle */}
        <div className="ml-auto flex items-center border rounded-lg p-0.5 bg-muted/30">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "map"
                ? "bg-green-600 text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Map View
          </button>
        </div>
      </div>

      {/* ═══════════ MAP + DETAIL CARD ═══════════ */}
      {viewMode === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* MAP */}
          <div className="rounded-lg border overflow-hidden bg-card relative h-[520px]">
            <MapContainer
              center={[21.5, 79]}
              zoom={5}
              style={{ height: "100%", width: "100%", zIndex: 10 }}
              scrollWheelZoom
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route lines */}
              {showRoutes &&
                routes.map((r) => (
                  <Polyline
                    key={r.id}
                    positions={r.positions}
                    pathOptions={{
                      color: "#22c55e",
                      weight: 2,
                      dashArray: "8 8",
                      opacity: 0.7,
                    }}
                  />
                ))}

              {filtered.map((g) => {
                const isSelected = g.id === selectedId;
                return (
                  <Marker
                    key={g.id}
                    position={[g.lat, g.lng]}
                    icon={getGodownIcon(g, isSelected)}
                    eventHandlers={{ click: () => setSelectedId(g.id) }}
                    zIndexOffset={isSelected ? 1000 : 0}
                  >
                    <Popup>
                      <div className="min-w-[180px] p-1">
                        <p className="font-semibold text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {g.city}, {g.state}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <MapControls />
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border bg-background/95 backdrop-blur shadow-md p-3 space-y-1.5 text-[11px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Utilisation
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>High Utilisation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Medium Utilisation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Low Utilisation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                <span>Inactive</span>
              </div>
            </div>
          </div>

          {/* DETAIL CARD */}
          {selected && (
            <div className="rounded-lg border bg-card overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Warehouse className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">
                        {selected.name}
                      </h3>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                          selected.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {selected.status === "active" ? "Active" : "Maintenance"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {selected.city}, {selected.state}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              <div className="px-4 pt-4">
                <div className="rounded-lg overflow-hidden border bg-muted aspect-[2/1]">
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 p-4 space-y-2.5 text-sm">
                <DetailRow
                  icon={Warehouse}
                  label="Type"
                  value={selected.type}
                />
                <DetailRow
                  icon={User}
                  label="Manager"
                  value={selected.manager}
                />
                <DetailRow
                  icon={Package}
                  label="Capacity"
                  value={`${selected.capacity.toLocaleString()} sq ft`}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <ChartPie className="w-3.5 h-3.5" />
                    Utilisation
                  </span>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(
                          selected.utilisation
                        )}`}
                        style={{ width: `${selected.utilisation}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold">
                      {selected.utilisation}%
                    </span>
                  </div>
                </div>

                <DetailRow
                  icon={IndianRupee}
                  label="Stock Value"
                  value={formatINR(selected.stockValue)}
                />

                <div className="pt-2 mt-2 border-t space-y-2">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs">{selected.address}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {selected.lat.toFixed(4)}° N, {selected.lng.toFixed(4)}° E
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-9 text-xs gap-1.5"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${selected.lat},${selected.lng}`,
                      "_blank"
                    )
                  }
                >
                  Open in Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ LIST VIEW FALLBACK ═══════════ */}
      {viewMode === "list" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GodownCard
              key={g.id}
              godown={g}
              onClick={() => {
                setSelectedId(g.id);
                setViewMode("map");
              }}
            />
          ))}
        </div>
      )}

      {/* ═══════════ ALL GODOWNS SCROLLER ═══════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            All Godowns{" "}
            <span className="text-muted-foreground font-normal">
              ({filtered.length})
            </span>
          </h3>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {filtered.map((g) => (
              <div key={g.id} className="w-[240px] shrink-0">
                <GodownCard
                  godown={g}
                  isSelected={g.id === selectedId}
                  onClick={() => setSelectedId(g.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ QUICK ACTIONS ═══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickActionCard
          icon={Route}
          title="Route Planner"
          description="Plan optimised routes between godowns, customers, and leads."
          color="green"
        />
        <QuickActionCard
          icon={Crosshair}
          title="Proximity Search"
          description="Find customers, leads, or vendors near any location."
          color="purple"
        />
        <QuickActionCard
          icon={ChartPie}
          title="Territory Analysis"
          description="Analyse coverage and performance by territories."
          color="blue"
        />
        <QuickActionCard
          icon={Truck}
          title="Delivery Area Mapping"
          description="Define and manage custom delivery zones."
          color="orange"
        />
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <span className="text-xs font-medium truncate max-w-[140px]">{value}</span>
  </div>
);

const GodownCard = ({
  godown,
  isSelected,
  onClick,
}: {
  godown: Godown;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  const util = getUtilColor(godown.utilisation);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md ${
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      {/* Image */}
      <div className="aspect-[2/1] bg-muted relative overflow-hidden">
        <img
          src={godown.image}
          alt={godown.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Status pill */}
        <div className="absolute top-2 left-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center"
            style={{ backgroundColor: util.hex }}
          >
            <span className="text-[10px]">🏭</span>
          </div>
        </div>
        {godown.status === "maintenance" && (
          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
            Maintenance
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold truncate">{godown.name}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {godown.city}, {godown.state}
        </p>

        {/* Utilisation */}
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-muted-foreground">
            {godown.utilisation}% Utilisation
          </span>
          <span className={`font-medium px-1.5 py-0.5 rounded-full ${util.badge}`}>
            {godown.utilisation >= 85 ? "High" : godown.utilisation >= 60 ? "Medium" : "Low"}
          </span>
        </div>
        <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getBarColor(godown.utilisation)}`}
            style={{ width: `${godown.utilisation}%` }}
          />
        </div>
      </div>
    </button>
  );
};

const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "green" | "purple" | "blue" | "orange";
}) => {
  const colors = {
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <button className="rounded-lg border bg-card p-4 text-left hover:shadow-md transition-all flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
          {description}
        </p>
      </div>
    </button>
  );
};