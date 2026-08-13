export interface IRevenueOverviewProps {}
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revenueOverviewWidget } from "../../data/dashboardDummyData";
import {
  ArrowUp,
  Calendar,
  ChartNoAxesCombined,
  EllipsisVertical,
  IndianRupee,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RevenueOverview(props: IRevenueOverviewProps) {
  return (
    <div className="revenue-widget-container flex flex-col gap-6 resize overflow-auto">
      <div className="w-header flex justify-between items-center">
        <h5>Revenue Overview</h5>
        <div className="flex items-center gap-3">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Choose timeline</SelectLabel>
                <SelectItem value="hello">
                  <Calendar /> Month
                </SelectItem>
                <SelectItem value="hello2">
                  <Calendar /> Year
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <EllipsisVertical />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between border-b-1 pb-4">
        <div className="flex flex-col gap-1 ">
          <p>Total Revenue</p>
          <div className="flex items-center">
            <IndianRupee size={15} />{" "}
            {revenueOverviewWidget.summary.totalRevenue}
          </div>
          <div className="flex">
            <span className="flex">
              <ArrowUp />
              {revenueOverviewWidget.summary.growthPercentage} %
            </span>{" "}
            compared to last month
          </div>
        </div>
        <Wallet />
      </div>
      <div className="flex gap-3">
        <div className="flex gap-4 items-center">
          <ChartNoAxesCombined />
          <div className="flex flex-col gap-1 ">
            <p>Total Profit</p>
            <h4>{revenueOverviewWidget.summary.totalProfit}</h4>
            <div className="flex gap-2">
              <ArrowUp /> <p>8.7% vs last month</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <ChartNoAxesCombined />
          <div className="flex flex-col gap-1 ">
            <p>Total Profit</p>
            <h4>{revenueOverviewWidget.summary.totalProfit}</h4>
            <div className="flex gap-2">
              <ArrowUp /> <p>8.7% vs last month</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <ChartNoAxesCombined />
          <div className="flex flex-col gap-1 ">
            <p>Total Profit</p>
            <h4>{revenueOverviewWidget.summary.totalProfit}</h4>
            <div className="flex gap-2">
              <ArrowUp /> <p>8.7% vs last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
