import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import {
  Route,
  MapPin,
  Navigation,
  Clock,
  IndianRupee,
  Plus,
  X,
  RotateCw,
  Warehouse,
  Users,
  BriefcaseBusiness,
  Maximize2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────
type StopType = "warehouse" | "customer" | "lead";

interface Stop {
  id: string;
  type: StopType;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** Only for customer stops */
  revenue?: number;
}

// ─── Dummy Data ──────────────────────────────────────────
const startPoint: Stop = {
  id: "wh-1",
  type: "warehouse",
  name: "Main Warehouse",
  address: "Sector 62, Noida",
  lat: 28.5355,
  lng: 77.391,
};

const availableStops: Stop[] = [
  { id: "c-1", type: "customer", name: "ABC Electronics", address: "Noida, UP", lat: 28.5355, lng: 77.391, revenue: 1550000 },
  { id: "c-2", type: "customer", name: "GreenTech Solutions", address: "Lucknow, UP", lat: 26.8467, lng: 80.9462, revenue: 850000 },
  { id: "c-3", type: "customer", name: "Northern Lights Solar", address: "Chandigarh", lat: 30.7333, lng: 76.7794, revenue: 510000 },
  { id: "c-4", type: "customer", name: "SunPower Energy", address: "Jaipur, RJ", lat: 26.9124, lng: 75.7873, revenue: 1200000 },
  { id: "c-5", type: "customer", name: "Renewable Co.", address: "Mumbai, MH", lat: 19.076, lng: 72.8777, revenue: 780000 },
  { id: "c-6", type: "customer", name: "Renewable Co.", address: "Mumbai, MH", lat: 19.076, lng: 72.8777, revenue: 780000 },
  { id: "l-1", type: "lead", name: "Rohan Kumar", address: "Noida, UP", lat: 28.6, lng: 77.4 },
  { id: "l-2", type: "lead", name: "Amit Mehta", address: "Bengaluru, KA", lat: 12.9716, lng: 77.5946 },
  { id: "l-3", type: "lead", name: "Sanjay Kapoor", address: "Chandigarh", lat: 30.7333, lng: 76.7794 },
];

// ─── Icons ───────────────────────────────────────────────
const iconFor = (type: StopType, selected: boolean) => {
  const config = {
    warehouse: { bg: "#22c55e", emoji: "🏭", size: 36 },
    customer: { bg: "#3b82f6", emoji: "👤", size: 32 },
    lead: { bg: "#f59e0b", emoji: "🎯", size: 32 },
  };
  const c = config[type];
  const size = selected ? c.size + 6 : c.size;
  return new L.DivIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${c.bg};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      ">${c.emoji}</div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// ─── Helpers ─────────────────────────────────────────────
/**
 * Haversine distance in kilometers between two coordinates.
 */
const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Total route distance and duration (assuming 40 km/h avg speed).
 */
const computeRouteMetrics = (stops: Stop[]) => {
  let totalKm = 0;
  for (let i = 1; i < stops.length; i++) {
    totalKm += haversineDistance(
      stops[i - 1].lat,
      stops[i - 1].lng,
      stops[i].lat,
      stops[i].lng
    );
  }
  const hours = totalKm / 40;
  return { totalKm, hours };
};

/**
 * Greedy nearest-neighbour route optimization.
 * Simple O(n²) algorithm suitable for small stop lists.
 */
const optimizeRoute = (start: Stop, stops: Stop[]): Stop[] => {
  const remaining = [...stops];
  const ordered: Stop[] = [];
  let current = start;

  while (remaining.length) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineDistance(current.lat, current.lng, s.lat, s.lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    });
    const next = remaining.splice(nearestIdx, 1)[0];
    ordered.push(next);
    current = next;
  }
  return ordered;
};

const formatINR = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(0)}K`;
  return `₹ ${n}`;
};

// ─── Component ───────────────────────────────────────────
export function RoutePlannerTab() {
  const [selectedStops, setSelectedStops] = useState<Stop[]>([
    availableStops[0],
    availableStops[1],
    availableStops[2],
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const metrics = useMemo(
    () => computeRouteMetrics([startPoint, ...selectedStops]),
    [selectedStops]
  );

  const routeRevenue = useMemo(
    () =>
      selectedStops.reduce((s, stop) => s + (stop.revenue || 0), 0),
    [selectedStops]
  );

  const routePolyline: [number, number][] = useMemo(
    () => [
      [startPoint.lat, startPoint.lng],
      ...selectedStops.map((s) => [s.lat, s.lng] as [number, number]),
    ],
    [selectedStops]
  );

  const toggleStop = (stop: Stop) => {
    setSelectedStops((prev) =>
      prev.find((s) => s.id === stop.id)
        ? prev.filter((s) => s.id !== stop.id)
        : [...prev, stop]
    );
  };

  const handleOptimize = () => {
    const ordered = optimizeRoute(startPoint, selectedStops);
    setSelectedStops(ordered);
  };

  const clearRoute = () => setSelectedStops([]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      {/* Sidebar */}
      <div className="space-y-3">
        {/* Route summary */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Route Summary
            </p>
            <Route className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> Stops
              </p>
              <p className="text-lg font-bold">{selectedStops.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5" /> Distance
              </p>
              <p className="text-lg font-bold">{metrics.totalKm.toFixed(0)} km</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> Duration
              </p>
              <p className="text-sm font-bold">
                {metrics.hours.toFixed(1)} hrs
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                <IndianRupee className="w-2.5 h-2.5" /> Value
              </p>
              <p className="text-sm font-bold">{formatINR(routeRevenue)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleOptimize}
              disabled={selectedStops.length < 2}
            >
              <Zap className="w-3.5 h-3.5" />
              Optimize
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={clearRoute}
              disabled={selectedStops.length === 0}
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </div>

        {/* Selected stops */}
        {selectedStops.length > 0 && (
          <div className="rounded-lg border bg-card">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Route Order
              </p>
              <span className="text-[10px] text-muted-foreground">
                {selectedStops.length} stops
              </span>
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {/* Start point */}
              <div className="flex items-center gap-2 px-3 py-2 border-b bg-green-50/50 dark:bg-green-900/10">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{startPoint.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {startPoint.address}
                  </p>
                </div>
              </div>

              {/* Ordered stops */}
              {selectedStops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedId(stop.id)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{stop.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {stop.address}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStop(stop);
                    }}
                    className="text-muted-foreground hover:text-red-500 p-1 shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available stops */}
        <div className="rounded-lg border bg-card">
          <div className="px-3 py-2 border-b">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Add Stops
            </p>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {availableStops.map((stop) => {
              const isSelected = selectedStops.some((s) => s.id === stop.id);
              const Icon =
                stop.type === "customer"
                  ? Users
                  : stop.type === "lead"
                  ? BriefcaseBusiness
                  : Warehouse;
              return (
                <button
                  key={stop.id}
                  onClick={() => toggleStop(stop)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 border-b last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      stop.type === "customer"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{stop.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {stop.address}
                    </p>
                  </div>
                  {isSelected ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                      Added
                    </span>
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden bg-card relative">
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 shadow-md"
            onClick={handleOptimize}
            disabled={selectedStops.length < 2}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Optimize
          </Button>
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0 shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <MapContainer
          center={[24, 78]}
          zoom={5}
          style={{ height: "600px", width: "100%", zIndex: 10 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route polyline */}
          {routePolyline.length > 1 && (
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#22c55e",
                weight: 3,
                opacity: 0.8,
              }}
            />
          )}

          {/* Start marker */}
          <Marker
            position={[startPoint.lat, startPoint.lng]}
            icon={iconFor("warehouse", true)}
          >
            <Popup>
              <div className="min-w-[180px] p-1">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Start Point
                </p>
                <p className="font-semibold text-sm mt-1">{startPoint.name}</p>
                <p className="text-xs text-muted-foreground">{startPoint.address}</p>
              </div>
            </Popup>
          </Marker>

          {/* Stop markers */}
          {selectedStops.map((stop, idx) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={iconFor(stop.type, stop.id === selectedId)}
              eventHandlers={{ click: () => setSelectedId(stop.id) }}
            >
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="font-semibold text-sm">{stop.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{stop.address}</p>

                  {stop.revenue !== undefined && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Expected Revenue
                      </p>
                      <p className="text-sm font-semibold">
                        {formatINR(stop.revenue)}
                      </p>
                    </div>
                  )}

                  {idx > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-[10px] text-muted-foreground uppercase">
                        From Previous Stop
                      </p>
                      <p className="text-xs font-medium">
                        {haversineDistance(
                          selectedStops[idx - 1].lat,
                          selectedStops[idx - 1].lng,
                          stop.lat,
                          stop.lng
                        ).toFixed(1)}{" "}
                        km
                      </p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}