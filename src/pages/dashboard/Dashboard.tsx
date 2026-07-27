import DashboardHeader from "./components/DashboardHeader";
import { DashboardKpiCard } from "./components/DashboardKpiCard";
import { DashboardWidget } from "./components/widgets/DashboardWidget";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <>
      <DashboardHeader />
      <DashboardKpiCard />
      <DashboardWidget/>
    </>
  );
};

export default Dashboard;
