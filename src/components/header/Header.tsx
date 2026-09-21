import React, { useEffect, useRef, useState } from "react";
import styles from "./header.module.scss";
import {
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
  Bell,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import logo from "../../assets/images/logo1.jpg";
import { Input } from "../ui/input";

type Props = {};

const Header = (props: Props) => {
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
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

  const handleProfileOpen = () => setProfileOpen((prev) => !prev);
  const handleThemeToggle = () => toggleTheme();

  return (
    <div
      className="flex items-center justify-end gap-4 p-3 border-b border-border sticky top-0 z-50"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Search */}
      <div className={styles.searchInpCont}>
        <Input type="text" placeholder="Search" className={styles.searchInp} />
      </div>

      {/* Theme toggle */}
      <button
        onClick={handleThemeToggle}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>

      {/* Profile */}
      <div className="relative mr-8" ref={profileRef}>
        {/* Avatar trigger */}
        <button
          onClick={handleProfileOpen}
          className={`rounded-full border-2 h-10 w-10 cursor-pointer overflow-hidden transition-all ${
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

        {/* Dropdown */}
        {profileOpen && (
          <div
            className="absolute right-0 top-12 w-[320px] rounded-xl border shadow-xl overflow-hidden z-50"
            style={{ backgroundColor: "var(--background)" }}
          >
            {/* ─── User identity block ─── */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-background shrink-0">
                  <img
                    src={logo}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "-15px center" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground truncate">
                    john.doe@salesflow.com
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Organization ─── */}
            <div className="p-2 border-b">
              <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Organization
              </p>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  SF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">SalesFlow Inc.</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Business Plan
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* ─── Menu items ─── */}
            <div className="p-2 border-b">
              <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Account
              </p>

              <MenuItem
                icon={User}
                label="My Profile"
                description="View and edit your details"
                onClick={() => {
                  setProfileOpen(false);
                  // navigate("/profile")
                }}
              />

              <MenuItem
                icon={Building2}
                label="Company Profile"
                description="Business info & branding"
                onClick={() => {
                  setProfileOpen(false);
                  // navigate("/company")
                }}
              />

              <MenuItem
                icon={CreditCard}
                label="Billing & Plans"
                description="Manage subscription"
                onClick={() => {
                  setProfileOpen(false);
                }}
              />

              <MenuItem
                icon={Bell}
                label="Notifications"
                description="Alerts and preferences"
                onClick={() => {
                  setProfileOpen(false);
                }}
              />

              <MenuItem
                icon={Settings}
                label="Settings"
                description="App preferences"
                onClick={() => {
                  setProfileOpen(false);
                  // navigate("/settings")
                }}
              />
            </div>

            {/* ─── Support + Logout ─── */}
            <div className="p-2">
              <MenuItem
                icon={HelpCircle}
                label="Help & Support"
                onClick={() => setProfileOpen(false)}
              />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  // handleLogout()
                }}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
              >
                <div className="w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Sign Out
                </span>
              </button>
            </div>

            {/* ─── Footer ─── */}
            <div className="px-4 py-2.5 border-t bg-muted/20">
              <p className="text-[10px] text-muted-foreground text-center">
                SalesFlow v1.0.0 · © 2024
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MENU ITEM
// ============================================================
interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
}

const MenuItem = ({ icon: Icon, label, description, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left group"
  >
    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-background transition-colors">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{label}</p>
      {description && (
        <p className="text-[10px] text-muted-foreground truncate">
          {description}
        </p>
      )}
    </div>
  </button>
);

export default Header;