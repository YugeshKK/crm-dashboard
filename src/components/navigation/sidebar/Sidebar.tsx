import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./side.module.scss";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  ReceiptText,
  ShoppingCart,
  Users,
  X,
  Warehouse,
  IndianRupee,
  ActivityIcon,
  ChartPie,
} from "lucide-react";

type Props = {};

const navItems = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/leads", label: "Leads", Icon: BriefcaseBusiness },
  { to: "/customers", label: "Customers", Icon: Users },
  { to: "/products", label: "Products", Icon: Package },
  { to: "/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/invoice", label: "Invoice", Icon: ReceiptText },
  { to: "/payments", label: "Payments", Icon: IndianRupee },
  { to: "/inventory", label: "Inventory", Icon:Warehouse},
  { to: "/activities", label: "Activity", Icon:ActivityIcon},
  { to: "/reports", label: "Reports", Icon:ChartPie}
];

const Sidebar = (props: Props) => {
  const [collapse, setCollapsed] = useState(false);

  const handleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const navClasses = `${styles.navCont} cursor-pointer ${collapse ? styles.collapsed : ""}`.trim();

  return (
    <div className={navClasses}>
      <div className={collapse ? styles.collapse : styles.unCollapsed} onClick={handleCollapse}>
        {collapse ? <Menu /> : <X />}
      </div>

      <nav className={styles.navComp}>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${isActive ? "active" : ""} group flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:text-green-600`
            }
          >
            <Icon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-rotate-[10deg] group-hover:scale-110" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
