import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  type: z.enum(["call", "meeting", "email", "follow_up", "task", "note"]),
  priority: z.enum(["high", "medium", "low"]),
  dueDate: z.string().min(1, "Due date is required"),
  dueTime: z.string().min(1, "Due time is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  linkedType: z.enum(["none", "lead", "customer", "order", "invoice", "payment"]),
  linkedName: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface CreateActivitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: ActivityFormData) => void;
}

export function CreateActivitySheet({
  open,
  onOpenChange,
  onCreate,
}: CreateActivitySheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      type: "task",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      dueTime: "10:00",
      assignedTo: "Arjun Patel",
      linkedType: "none",
      linkedName: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const linkedType = watch("linkedType");

  const onSubmit = (data: ActivityFormData) => {
    onCreate?.(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-base font-semibold">
                New Activity
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Schedule a task, call, or follow-up
              </SheetDescription>
            </div>
            <SheetClose asChild>
            </SheetClose>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="e.g. Follow up with ABC Electronics"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="type">
                  Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dueDate">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <Input id="dueDate" type="date" {...field} />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dueTime">
                  Due Time <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="dueTime"
                  control={control}
                  render={({ field }) => (
                    <Input id="dueTime" type="time" {...field} />
                  )}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="assignedTo">
                Assign To <span className="text-red-500">*</span>
              </label>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arjun Patel">Arjun Patel</SelectItem>
                      <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                      <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                      <SelectItem value="Priya Singh">Priya Singh</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Linked entity (optional) */}
            <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <label className="text-xs">Link to Record (Optional)</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Controller
                  name="linkedType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name="linkedName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      placeholder="Record name / ID"
                      className="h-9 text-xs"
                      disabled={linkedType === "none"}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes">
                Notes{" "}
                <span className="text-muted-foreground font-normal">
                  (Optional)
                </span>
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="notes"
                    rows={3}
                    className="resize-none"
                    placeholder="Add context or instructions..."
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="border-t px-5 py-4 flex gap-3 bg-background">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Create Activity
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default CreateActivitySheet;