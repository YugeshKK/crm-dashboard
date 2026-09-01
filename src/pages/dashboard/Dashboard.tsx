import { JSX, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import { DashboardKpiCard } from "./components/DashboardKpiCard";
import {
  DashboardWidget,
  type DashboardWidgetItem,
} from "./components/widgets/DashboardWidget";
import RevenueOverview from "./components/widgets/RevenueOverview";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TopProducts from "./components/widgets/TopProducts";
import { DialogDescription } from "radix-ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingCart } from "lucide-react";
import RecentOrders from "./components/widgets/RecentOrders";
import { MonthlyTargets } from "./components/widgets/MonthlyTargets";
import { SalesPipeline } from "./components/widgets/SalesPipeline";
import CustomerMap from "./components/widgets/CustomerMap";
import { Button } from "@/components/ui/button";

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Select a widget to add to your dashboard. You can add up to 12
              widgets.
            </DialogDescription>
            <div className="flex flex-row pl-1 pt-1 pb-1 items-center gap-2.5 border border-gray-200 rounded-lg hover:shadow-lg w-xs">
              <Search size={18} color="grey" />
              <Input
                type="text"
                placeholder="Search widgets"
                className="border-0 p-0"
                value={searchInp}
                onChange={handleSearchInp}
                style={{ width: "-webkit-fill-available" }}
              ></Input>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
              {allWidgets.map((widget, index) => {
                const isSelected = selectedWidgetIds.includes(widget.id);

                return (
                  <div
                    key={index}
                    style={{ borderColor: "var(--border)" }}
                    className={`w-3xs border rounded p-2 cursor-pointer flex flex-row gap-3 items-center  transition hover:shadow-lg ${
                      isSelected ? "bg-purple-50 text-black" : 'bg-[var(--background)]'
                    }`}
                    onClick={() => toggleWidgetSelection(widget.id)}
                  >
                    <ShoppingCart
                      color="purple"
                      height={50}
                      width={70}
                      style={{
                        backgroundColor: "#ee9dee68",
                        borderRadius: "10px",
                        padding: "0.4rem 0.6rem",
                      }}
                    />
                    <div>
                      <p>{widget.title}</p>
                      <p>{widget.description}</p>
                    </div>
                    <Button
                      style={{
                        background: isSelected ? "#c084fc" : "#4a434438",
                      }}
                    >
                      <Plus color={isSelected ? "#ffffff" : "#121212eb"} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </DialogHeader>
            <DialogFooter>
            <Button
              onClick={handleAddSelectedWidgets}
              disabled={selectedWidgetIds.length === 0}
              style={{
                background: "var(--background)",
                color: "var(--text-color)",
              }}
            >
              Add Widget
            </Button>
            <DialogClose
              asChild
                onClick={() => {
                  setSearchInp("");
                  setAllWidgets(initialWidgets);
                }}
            >
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
