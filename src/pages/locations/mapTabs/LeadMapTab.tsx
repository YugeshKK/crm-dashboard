import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  BriefcaseBusiness,
  Target,
  Search,
  Maximize2,
  Filter,
  Phone,
  Mail,
  Star,
  TrendingUp,
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
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
type LeadSource = "Website" | "Referral" | "LinkedIn" | "Exhibition" | "Cold Call";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  lat: number;
  lng: number;
  status: LeadStatus;
  source: LeadSource;
  score: number;
  expectedValue: number;
  createdAt: string;
}

// ─── Dummy Data ──────────────────────────────────────────
const leads: Lead[] = [
  { id: "l-1", name: "Rohan Kumar", company: "RK Solutions", email: "rohan@rksol.com", phone: "+91 98765 43210", city: "Noida, UP", lat: 28.5355, lng: 77.391, status: "qualified", source: "Website", score: 78, expectedValue: 250000, createdAt: "2 days ago" },
  { id: "l-2", name: "Priya Singh", company: "Elite Corp", email: "priya@elite.com", phone: "+91 98765 11111", city: "Mumbai, MH", lat: 19.076, lng: 72.8777, status: "contacted", source: "Referral", score: 62, expectedValue: 180000, createdAt: "5 days ago" },
  { id: "l-3", name: "Amit Mehta", company: "Zylker Pvt Ltd", email: "amit@zylker.com", phone: "+91 98765 22222", city: "Bengaluru, KA", lat: 12.9716, lng: 77.5946, status: "converted", source: "LinkedIn", score: 92, expectedValue: 520000, createdAt: "1 week ago" },
  { id: "l-4", name: "Neha Sharma", company: "Neha Enterprise", email: "neha@nehe.com", phone: "+91 98765 33333", city: "Hyderabad, TS", lat: 17.385, lng: 78.4867, status: "new", source: "Exhibition", score: 45, expectedValue: 95000, createdAt: "1 day ago" },
  { id: "l-5", name: "Deepak Gupta", company: "DG Infotech", email: "deepak@dg.com", phone: "+91 98765 44444", city: "Pune, MH", lat: 18.5204, lng: 73.8567, status: "qualified", source: "Cold Call", score: 71, expectedValue: 310000, createdAt: "3 days ago" },
  { id: "l-6", name: "Vishal Sharma", company: "SoftTech Solutions", email: "vishal@softtech.com", phone: "+91 98765 55555", city: "Jaipur, RJ", lat: 26.9124, lng: 75.7873, status: "lost", source: "Website", score: 28, expectedValue: 60000, createdAt: "2 weeks ago" },
  { id: "l-7", name: "Anjali Shah", company: "Shah Traders", email: "anjali@shah.com", phone: "+91 98765 66666", city: "Ahmedabad, GJ", lat: 23.0225, lng: 72.5714, status: "new", source: "Website", score: 55, expectedValue: 130000, createdAt: "1 day ago" },
  { id: "l-8", name: "Arjun Patel", company: "Patel Group", email: "arjun@patel.com", phone: "+91 98765 77777", city: "Surat, GJ", lat: 21.1702, lng: 72.8311, status: "contacted", source: "Referral", score: 68, expectedValue: 220000, createdAt: "4 days ago" },
  { id: "l-9", name: "Sneha Reddy", company: "Reddy Industries", email: "sneha@reddy.com", phone: "+91 98765 88888", city: "Chennai, TN", lat: 13.0827, lng: 80.2707, status: "qualified", score: 82, expectedValue: 380000, source: "LinkedIn", createdAt: "6 days ago" },
  { id: "l-10", name: "Raj Joshi", company: "Joshi & Co", email: "raj@joshi.com", phone: "+91 98765 99999", city: "Kolkata, WB", lat: 22.5726, lng: 88.3639, status: "new", source: "Advertisement" as any, score: 38, expectedValue: 75000, createdAt: "2 days ago" },
  { id: "l-11", name: "Kavita Verma", company: "Verma Industries", email: "kavita@verma.com", phone: "+91 98765 12345", city: "Lucknow, UP", lat: 26.8467, lng: 80.9462, status: "contacted", source: "Cold Call", score: 58, expectedValue: 165000, createdAt: "5 days ago" },
  { id: "l-12", name: "Sanjay Kapoor", company: "SK Solar", email: "sanjay@sksolar.com", phone: "+91 98765 54321", city: "Chandigarh", lat: 30.7333, lng: 76.7794, status: "qualified", source: "Website", score: 74, expectedValue: 285000, createdAt: "3 days ago" },
];

const statusColors: Record<LeadStatus, string> = {
  new: "#3b82f6",
  contacted: "#8b5cf6",
  qualified: "#6366f1",
  converted: "#22c55e",
  lost: "#ef4444",
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

const formatINR = (n: number) => {
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹ ${(n / 1000).toFixed(0)}K`;
  return `₹ ${n}`;
};

// ─── Icon factory (pin shaped) ──────────────────────────
const getLeadIcon = (status: LeadStatus, selected: boolean, score: number) => {
  const size = selected ? 40 : 30;
  return new L.DivIcon({
    html: `
      <div style="position: relative;">
        <div style="
          width: ${size}px; height: ${size}px;
          background: ${statusColors[status]};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          transition: all 0.2s;
        "></div>
        <div style="
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -60%);
          color: white; font-weight: bold; font-size: ${selected ? "12px" : "10px"};
        ">${score}</div>
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// ─── Component ───────────────────────────────────────────
export default function LeadMapTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return [l.name, l.company, l.city, l.email].join(" ").toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, statusFilter]);

  const totals = useMemo(() => {
    const value = filtered.reduce((s, l) => s + l.expectedValue, 0);
    const avgScore = filtered.length
      ? Math.round(filtered.reduce((s, l) => s + l.score, 0) / filtered.length)
      : 0;
    const byStatus = {
      new: filtered.filter((l) => l.status === "new").length,
      contacted: filtered.filter((l) => l.status === "contacted").length,
      qualified: filtered.filter((l) => l.status === "qualified").length,
      converted: filtered.filter((l) => l.status === "converted").length,
      lost: filtered.filter((l) => l.status === "lost").length,
    };
    return { value, avgScore, byStatus };
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      {/* Sidebar */}
      <div className="space-y-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lead Pipeline
            </p>
            <BriefcaseBusiness className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Total Leads</p>
              <p className="text-lg font-bold">{filtered.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Pipeline Value</p>
              <p className="text-sm font-bold">{formatINR(totals.value)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Avg Score</p>
              <p className="text-lg font-bold flex items-center gap-1">
                {totals.avgScore}
                <span className="text-[10px] font-normal text-muted-foreground">/100</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Conversion</p>
              <p className="text-lg font-bold">
                {filtered.length
                  ? Math.round((totals.byStatus.converted / filtered.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex flex-wrap gap-x-3 gap-y-1.5 text-[10px]">
            {(Object.keys(statusLabels) as LeadStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusColors[s] }}
                />
                <span className="text-muted-foreground">
                  {statusLabels[s]} ({totals.byStatus[s]})
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
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                {statusFilter === "all" ? "All" : statusLabels[statusFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="new">New</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="contacted">Contacted</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="qualified">Qualified</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="converted">Converted</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="lost">Lost</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lead list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((l) => {
            const isSelected = l.id === selectedId;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Score badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: statusColors[l.status] }}
                  >
                    {l.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold truncate">{l.name}</p>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium shrink-0"
                        style={{ backgroundColor: statusColors[l.status] }}
                      >
                        {statusLabels[l.status]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {l.company} · {l.city}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {l.source}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatINR(l.expectedValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No leads match your filters
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden bg-card relative">
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
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

          {filtered.map((l) => {
            const isSelected = l.id === selectedId;
            return (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={getLeadIcon(l.status, isSelected, l.score)}
                eventHandlers={{ click: () => setSelectedId(l.id) }}
                zIndexOffset={isSelected ? 1000 : 0}
              >
                <Popup>
                  <div className="min-w-[220px] p-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{l.name}</p>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: statusColors[l.status] }}
                      >
                        {statusLabels[l.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{l.company}</p>
                    <p className="text-xs text-muted-foreground">{l.city}</p>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Lead Score
                        </p>
                        <p className="font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {l.score}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Expected
                        </p>
                        <p className="font-semibold">{formatINR(l.expectedValue)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Source
                        </p>
                        <p className="font-medium">{l.source}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Added
                        </p>
                        <p className="font-medium">{l.createdAt}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t space-y-1">
                      <p className="text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {l.phone}
                      </p>
                      <p className="text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {l.email}
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