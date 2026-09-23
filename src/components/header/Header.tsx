import { useEffect, useRef, useState } from "react";
import { Moon, Sun, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/context/ThemeContext";
import logo from "../../assets/images/logo1.jpg";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

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
              className="h-full w-full object-cover"
              style={{ objectPosition: "-15px center" }}
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