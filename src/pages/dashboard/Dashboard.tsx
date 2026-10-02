import { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import { DashboardKpiCard } from "./components/DashboardKpiCard";
import {
  DashboardWidget,
  type DashboardWidgetItem,
} from "./components/widgets/DashboardWidget";
import RevenueOverview from "./components/widgets/RevenueOverview";
import TopProducts from "./components/widgets/TopProducts";
import RecentOrders from "./components/widgets/RecentOrders";
import { MonthlyTargets } from "./components/widgets/MonthlyTargets";
import { SalesPipeline } from "./components/widgets/SalesPipeline";
import CustomerMap from "./components/widgets/CustomerMap";
import { AddWidgetModal } from "./modal/AddWidgetModal";

type Props = {};

type DashboardWidgetEntry = DashboardWidgetItem;

const initialWidgets: DashboardWidgetEntry[] = [
  {
    id: "customer-map",
    title: "Customer Map",
    description: "View your customers on the map",
    element: CustomerMap,
  },
  {
    id: "revenue-overview",
    title: "Revenue Overview",
    description: "Track your revenue over time",
    element: RevenueOverview,
  },
  {
    id: "top-products",
    title: "Top Products",
    description: "See your best performing products",
    element: TopProducts,
  },
  {
    id: "recent-orders",
    title: "Recent Orders",
    description: "Review your latest customer orders",
    element: RecentOrders,
  },
  {
    id: "monthly-targets",
    title: "Monthly Targets",
    description: "Monitor your monthly sales targets",
    element: MonthlyTargets,
  },
  {
    id: "sales-pipeline",
    title: "Sales Pipeline",
    description: "Track your sales opportunities",
    element: SalesPipeline,
  },
];

const Dashboard = (props: Props) => {
  const [allWidgets, setAllWidgets] =
    useState<DashboardWidgetEntry[]>(initialWidgets);
  const [widgets, setWidgets] = useState<DashboardWidgetEntry[]>([]);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchInp, setSearchInp] = useState("");

  const addWidget = () => {
    setSelectedWidgetIds([]);
    setSearchInp("");
    setAllWidgets(initialWidgets);
    setIsDialogOpen(true);
  };

  const toggleWidgetSelection = (widgetId: string) => {
    setSelectedWidgetIds((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId],
    );
  };

  const handleAddSelectedWidgets = () => {
    const newWidgets = allWidgets.filter(
      (widget) =>
        selectedWidgetIds.includes(widget.id) &&
        !widgets.some((existingWidget) => existingWidget.id === widget.id),
    );

    if (newWidgets.length > 0) {
      setWidgets((prev) => [...prev, ...newWidgets]);
    }

    setSelectedWidgetIds([]);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setSearchInp("");
    setAllWidgets(initialWidgets);
    setSelectedWidgetIds([]);
    setIsDialogOpen(false);
  };

  const handleSearchInp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const query = value.toLowerCase().trim();
    setSearchInp(value);
    setAllWidgets(
      initialWidgets.filter((widget) =>
        widget.title.toLowerCase().trim().includes(query),
      ),
    );
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prevWidgets) =>
      prevWidgets.filter((widget) => widget.id !== widgetId),
    );
  };

  return (
    <>
      <DashboardHeader
        addWidget={addWidget}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <DashboardKpiCard />
      <DashboardWidget widgets={widgets} onRemoveWidget={handleRemoveWidget} />
      <AddWidgetModal
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        allWidgets={allWidgets}
        selectedWidgetIds={selectedWidgetIds}
        searchInp={searchInp}
        handleSearchInp={handleSearchInp}
        toggleWidgetSelection={toggleWidgetSelection}
        handleAddSelectedWidgets={handleAddSelectedWidgets}
        handleCancel={handleCancel}
      />
    </>
  );
};

export default Dashboard;
