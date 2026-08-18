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
import { ChevronLeftCircle, ChevronRight, ChevronRightCircle, Wallet } from 'lucide-react';  
import useEmblaCarousel from 'embla-carousel-react';
import styles from './DashboardKpi.scss';

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
  ];
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 20,
  })

const scrollPrev = () => emblaApi?.scrollPrev()

const scrollNext = () => emblaApi?.scrollNext()

  return (
  <div className="relative w-full">
      {/* Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Container */}
        <div className="flex gap-4 p-2">
          {KPI_DATA.map((card) => (
            <Card
              key={card.id}
              className="w-[280px] shrink-0 p-2"
            >
              <CardHeader className="flex gap-3">
                <CardTitle>{card.title}</CardTitle>

                <CardAction className="min-w-fit w-20 rounded-lg bg-green-200 p-2 text-center text-green-900">
                  {card.change}%
                </CardAction>
              </CardHeader>

              <div className="flex justify-around">
                <div className="w-full self-start">
                  <CardContent>
                    <p className="font-bold">
                      {card.prefix} {card.value}
                    </p>
                  </CardContent>

                  <CardDescription>
                    {card.trend}
                  </CardDescription>
                </div>

                <Wallet />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 -translate-y-1/2"
      >
        <ChevronLeftCircle  className="cursor-pointer" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-2 -translate-y-1/2"
      >
        <ChevronRightCircle className="cursor-pointer" />
      </button>
    </div>
  );        
 
}
