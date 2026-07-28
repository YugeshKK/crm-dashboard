import { JSX, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import { DashboardKpiCard } from "./components/DashboardKpiCard";
import { DashboardWidget } from "./components/widgets/DashboardWidget";
import RevenueTrendWidget from "./components/widgets/RevenueTrendWidget";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import TopProducts from "./components/widgets/TopProducts";


type Props = {};

const Dashboard = (props: Props) => {
  const [allWidgets, setAllWidgets] = useState<JSX.Element[]>([
    <RevenueTrendWidget key="revenue-trend-widget" />,
    <TopProducts key="top-products-widget" />,
  ]);
  const [widgets, setWidgets] = useState<JSX.Element[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addWidget = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <DashboardHeader
        addWidget={addWidget}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <DashboardKpiCard />
      <DashboardWidget widgets={widgets} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle className="text-center">
            Add Widget
          </DialogTitle>
          <div className="flex flex-row gap-2">
            {allWidgets.map((widget, index) => (
              <div
                key={index}
                className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setWidgets([
                    ...widgets,
                     widget
                    ]);
                  setIsDialogOpen(false);
                }}
              >
                {widget}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
