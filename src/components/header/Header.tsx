import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  CircleDollarSign,
  Moon,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  UserRoundPlus,
  type LucideIcon,
  Sun,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/context/ThemeContext";
import logo from "../../assets/images/logo1.jpg";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  tone: string;
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Payment received",
    description: "Apex Industries paid invoice INV-2048 for $12,480.",
    time: "8 min ago",
    icon: CircleDollarSign,
    tone: "bg-emerald-500/10 text-emerald-600",
    unread: true,
  },
  {
    id: 2,
    title: "New lead assigned",
    description: "Priya Mehta from Northstar Retail is now yours to follow up.",
    time: "32 min ago",
    icon: UserRoundPlus,
    tone: "bg-sky-500/10 text-sky-600",
    unread: true,
  },
  {
    id: 3,
    title: "Meeting in 30 minutes",
    description: "Product demo with Marcus Lee · Meridian Group.",
    time: "10:30 AM",
    icon: CalendarClock,
    tone: "bg-amber-500/10 text-amber-600",
    unread: true,
  },
  {
    id: 4,
    title: "Order ready to ship",
    description: "Order SO-7816 for Greenfield Supply has been packed.",
    time: "Yesterday",
    icon: PackageCheck,
    tone: "bg-violet-500/10 text-violet-600",
    unread: false,
  },
  {
    id: 5,
    title: "Lead moved to negotiation",
    description: "Cobalt Works · $24,000 opportunity · Maya Chen.",
    time: "Yesterday",
    icon: UserRoundPlus,
    tone: "bg-sky-500/10 text-sky-600",
    unread: false,
  },
];

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const visibleNotifications = showUnreadOnly
    ? notifications.filter((notification) => notification.unread)
    : notifications;

  const isCollapsed = state === "collapsed";

  // Close profile on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 backdrop-blur pr-4">
      {/* ─── Sidebar toggle — always visible ─── */}
      <button
        onClick={toggleSidebar}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </button>

      {/* ─── Search ─── */}
      <div className="relative max-w-md flex-1">
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* ─── Spacer ─── */}
      <div className="flex-1" />

      {/* ─── Right actions ─── */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={10} className="w-[380px] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Notifications</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {unreadCount ? `${unreadCount} unread updates` : "You're all caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>

            <div className="flex items-center gap-1 border-b border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setShowUnreadOnly(false)}
                aria-pressed={!showUnreadOnly}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${!showUnreadOnly ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setShowUnreadOnly(true)}
                aria-pressed={showUnreadOnly}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${showUnreadOnly ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70"}`}
              >
                Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            </div>

            <div className="max-h-[min(420px,60vh)] overflow-y-auto">
              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() =>
                        setNotifications((items) =>
                          items.map((item) => item.id === notification.id ? { ...item, unread: false } : item),
                        )
                      }
                      className="flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notification.tone}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium leading-5">{notification.title}</span>
                          {notification.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{notification.description}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground/80">{notification.time}</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">No unread notifications</p>
              )}
            </div>
            <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
              Latest sales, order, and customer updates
            </div>
          </PopoverContent>
        </Popover>


        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className={`h-8 w-8 rounded-full overflow-hidden border-2 transition-all ${
              profileOpen
                ? "border-green-500 ring-2 ring-green-500/20"
                : "border-border hover:border-primary/40"
            }`}
            aria-label="Open profile menu"
          >
            <img
              src={logo}
              alt="Profile"
              className="block h-full w-full object-cover object-center"
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-10 w-[280px] rounded-xl border bg-popover shadow-lg overflow-hidden z-50">
              <div className="p-4 border-b bg-muted/30">
                <p className="text-sm font-semibold">John Doe</p>
                <p className="text-xs text-muted-foreground">john.doe@salesflow.com</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted">
                  My Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted">
                  Company Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted">
                  Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted text-red-600">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;