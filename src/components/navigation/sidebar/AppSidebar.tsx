import { NavLink, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Users,
  Warehouse,
  IndianRupee,
  ActivityIcon,
  ChartPie,
  Settings,
  LifeBuoy,
  type LucideIcon,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from "../../ui/sidebar";
import { NavLink as RouterNavLink } from "react-router-dom";

// ============================================================
// NAV CONFIG
// ============================================================
type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/leads", label: "Leads", icon: BriefcaseBusiness },
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/products", label: "Products", icon: Package },
      { to: "/orders", label: "Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/invoice", label: "Invoices", icon: ReceiptText },
      { to: "/payments", label: "Payments", icon: IndianRupee },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/inventory", label: "Inventory", icon: Warehouse },
      { to: "/activities", label: "Activities", icon: ActivityIcon },
      { to: "/reports", label: "Reports", icon: ChartPie },
    ],
  },
];

const secondaryItems: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/support", label: "Support", icon: LifeBuoy },
];

// ============================================================
// BRAND / LOGO
// ============================================================
const Brand = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-white text-xs font-bold shrink-0">
        VM
      </div>
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold leading-tight truncate">
            SalesFlow
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight truncate">
            CRM Suite
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// NAV ITEM
// ============================================================
interface SidebarNavItemProps {
  item: NavItem;
}

const SidebarNavItem = ({ item }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive =
    item.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.to);

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <RouterNavLink to={item.to}>
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </RouterNavLink>
      </SidebarMenuButton>
      {item.badge !== undefined && (
        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
};

// ============================================================
// MAIN SIDEBAR
// ============================================================
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* ─── Brand header ─── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Brand />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ─── Main nav groups ─── */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarNavItem key={item.to} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ─── Footer: secondary nav ─── */}
      <SidebarFooter>
        <SidebarMenu>
          {secondaryItems.map((item) => (
            <SidebarNavItem key={item.to} item={item} />
          ))}
        </SidebarMenu>
      </SidebarFooter>

      {/* ─── Drag rail ─── */}
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;