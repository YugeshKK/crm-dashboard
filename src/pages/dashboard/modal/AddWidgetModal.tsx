import type { ChangeEvent } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ShoppingCart } from "lucide-react";
import type { DashboardWidgetItem } from "../components/widgets/DashboardWidget";

export interface IAddWidgetModalProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  allWidgets: DashboardWidgetItem[];
  selectedWidgetIds: string[];
  searchInp: string;
  handleSearchInp: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleWidgetSelection: (widgetId: string) => void;
  handleAddSelectedWidgets: () => void;
  handleCancel: () => void;
}

export function AddWidgetModal({
  isDialogOpen,
  setIsDialogOpen,
  allWidgets,
  selectedWidgetIds,
  searchInp,
  handleSearchInp,
  toggleWidgetSelection,
  handleAddSelectedWidgets,
  handleCancel,
}: IAddWidgetModalProps) {
  return (
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
              {allWidgets.map((widget) => {
                const isSelected = selectedWidgetIds.includes(widget.id);

                return (
                  <div
                    key={widget.id}
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
                        background:  "#c084fc",
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
                onClick={handleCancel}
            >
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
