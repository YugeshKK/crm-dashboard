import DashboardHeader from "./components/DashboardHeader";
import { DashboardKpiCard } from "./components/DashboardKpiCard";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <>
      <DashboardHeader />
      <DashboardKpiCard />
    </>
  );
};

export default Dashboard;
