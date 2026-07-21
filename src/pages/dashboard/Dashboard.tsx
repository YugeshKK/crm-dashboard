import { Button } from "@/components/ui/button";
import { CircleFadingArrowUpIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {};

const Dashboard = (props: Props) => {
  const handleClick = () => {
    console.log("Hello");
  };
  const items = [
    { label: "Light 1", value: "light-1" },
    { label: "Light 2", value: "light-2" },
    { label: "Light 3", value: "light-3" },
    { label: "Light 4", value: "light-4" },
  ];

  return (
    <div className="flex flex-col gap-2 flex-wrap p-3">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl">Dashboard</h1>
          <p className="font-light">
            Welcome back, Aegon Here's what's happening with your buisness
            today.
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant={"secondary"} onClick={handleClick}>
            <CircleFadingArrowUpIcon color="red"/>
            Click Me
          </Button>
        </div>
      </div>
      <div>Two</div>
      <div>Three</div>
    </div>
  );
};

export default Dashboard;
