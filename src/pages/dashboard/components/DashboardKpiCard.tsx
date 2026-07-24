import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet } from 'lucide-react';
export interface IAppProps {}

export function DashboardKpiCard(props: IAppProps) {
  const KPI_DATA = [
    {
      id: 1,
      title: "Monthly Revenue",
      value: 4862500,
      prefix: "₹",
      change: 12.4,
      trend: "14 Apr-16 Dec",
      icon: "IndianRupee",
    },
    {
      id: 2,
      title: "Today's Orders",
      value: 27,
      change: 5.2,
      trend: "14 Apr-16 Dec",
      icon: "ShoppingCart",
    },
    {
      id: 3,
      title: "Active Customers",
      value: 148,
      change: 3.5,
      trend: "14 Apr-16 Dec",
      icon: "Users",
    },
    {
      id: 4,
      title: "New Leads",
      value: 18,
      change: -1.8,
      trend: "down",
      icon: "UserPlus",
    },
    {
      id: 5,
      title: "Pending Deliveries",
      value: 31,
      change: 4.3,
      trend: "14 Apr-16 Dec",
      icon: "Truck",
    },
    {
      id: 6,
      title: "Outstanding Payments",
      value: 587000,
      prefix: "₹",
      change: -7.1,
      trend: "down",
      icon: "Receipt",
    },
  ];

  return (
    <div className="flex flex-row gap-3">
      {KPI_DATA?.map((card) => (
        <Card key={card.id} className="flex-1 p-2">
          <CardHeader className="flex gap-3">
            <CardTitle>{card.title}</CardTitle>
            <CardAction className="bg-green-200 p-2 rounded-lg w-20 text-center text-green-900 min-w-fit">
              {card.change} %
            </CardAction>
          </CardHeader>
          <div className="flex justify-around">
            <div className="self-start w-full">
              <CardContent>
                <p className="font-bold">
                  {card.prefix} {card.value}
                </p>
              </CardContent>
              <CardDescription>{card.trend}</CardDescription>
            </div>
            <Wallet color="purple"/>
          </div>
        </Card>
      ))}
    </div>
  );
}
