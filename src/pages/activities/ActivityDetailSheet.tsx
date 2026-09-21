import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Phone,
  Users,
  Mail,
  Clock,
  CheckSquare,
  FileText,
  Pencil,
  Save,
  Check,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================
// TYPES
// ============================================================
export type ActivityType = "call" | "meeting" | "email" | "follow_up" | "task" | "note";
export type ActivityPriority = "high" | "medium" | "low";
export type ActivityStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type LinkedEntityType =
  | "lead"
  | "customer"
  | "order"
  | "invoice"
  | "payment"
  | "product";

export interface ActivityDetail {
  id: string;
  title: string;
  type: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  linkedTo: {
    type: LinkedEntityType;
    id: string;
    name: string;
  } | null;
  assignedTo: string;
  dueDate: string;
  dueTime: string;
  notes?: string;
  outcome?: string;
  createdAt: string;
}

interface ActivityDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: ActivityDetail | null;
  onSave?: (updated: ActivityDetail) => void;
  onComplete?: (
    activityId: string,
    outcome: string,
    nextFollowUpDate?: string
  ) => void;
}

// ============================================================
// CONFIG
// ============================================================
const typeConfig: Record<
  ActivityType,
  { label: string; icon: React.ElementType; className: string }
> = {
  call: {
    label: "Call",
    icon: Phone,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  email: {
    label: "Email",
    icon: Mail,
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  follow_up: {
    label: "Follow-up",
    icon: RotateCcw,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  task: {
    label: "Task",
    icon: CheckSquare,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  note: {
    label: "Note",
    icon: FileText,
    className: "bg-muted text-muted-foreground",
  },
};

const priorityConfig: Record<
  ActivityPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  medium: {
    label: "Medium",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  low: {
    label: "Low",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

const statusConfig: Record<
  ActivityStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
};

const entityLabels: Record<LinkedEntityType, string> = {
  lead: "Lead",
  customer: "Customer",
  order: "Order",
  invoice: "Invoice",
  payment: "Payment",
  product: "Product",
};

// ============================================================
// HELPERS
// ============================================================
const isOverdue = (dueDate: string, status: ActivityStatus) => {
  if (status === "completed" || status === "cancelled") return false;
  try {
    const due = new Date(dueDate);
    return due < new Date();
  } catch {
    return false;
  }
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ============================================================
// EDIT FORM
// ============================================================
type EditFormData = {
  title: string;
  type: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueDate: string;
  dueTime: string;
  assignedTo: string;
  notes: string;
};

// ============================================================
// MAIN
// ============================================================
export function ActivityDetailsSheet({
  open,
  onOpenChange,
  activity,
  onSave,
  onComplete,
}: ActivityDetailsSheetProps) {
  const [mode, setMode] = useState<"view" | "edit" | "complete">("view");
  const [outcome, setOutcome] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<EditFormData>({
    defaultValues: {
      title: "",
      type: "task",
      priority: "medium",
      status: "pending",
      dueDate: "",
      dueTime: "",
      assignedTo: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (activity && open) {
      reset({
        title: activity.title,
        type: activity.type,
        priority: activity.priority,
        status: activity.status,
        dueDate: activity.dueDate,
        dueTime: activity.dueTime,
        assignedTo: activity.assignedTo,
        notes: activity.notes || "",
      });
      setMode("view");
      setOutcome("");
      setNextFollowUp("");
    }
  }, [activity, open, reset]);

  if (!activity) return null;

  const typeCfg = typeConfig[activity.type];
  const priorityCfg = priorityConfig[activity.priority];
  const statusCfg = statusConfig[activity.status];
  const TypeIcon = typeCfg.icon;
  const overdue = isOverdue(activity.dueDate, activity.status);
  const isLocked = activity.status === "completed" || activity.status === "cancelled";

  const onSubmit = (data: EditFormData) => {
    onSave?.({
      ...activity,
      ...data,
    });
    setMode("view");
  };

  const handleCompleteSubmit = () => {
    if (!outcome.trim()) return;
    onComplete?.(
      activity.id,
      outcome.trim(),
      nextFollowUp.trim() || undefined
    );
    setMode("view");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {mode === "edit"
                ? "Edit Activity"
                : mode === "complete"
                ? "Complete Activity"
                : "Activity Details"}
            </SheetTitle>
            <SheetClose asChild>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === "edit" ? (
            /* ==================== EDIT MODE ==================== */
            <form
              id="edit-activity-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-5 space-y-5"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input id="title" placeholder="Activity title" {...field} />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="type">Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeConfig).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Input id="dueDate" type="date" {...field} />
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Controller
                    name="dueTime"
                    control={control}
                    render={({ field }) => (
                      <Input id="dueTime" type="time" {...field} />
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignedTo">Assigned To</Label>
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      id="notes"
                      rows={4}
                      className="resize-none"
                      placeholder="Add notes about this activity..."
                      {...field}
                    />
                  )}
                />
              </div>
            </form>
          ) : mode === "complete" ? (
            /* ==================== COMPLETE MODE ==================== */
            <div className="px-5 py-5 space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Log Outcome</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record what happened and optionally schedule a follow-up.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${typeCfg.className}`}
                  >
                    <TypeIcon className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-foreground">
                    {activity.title}
                  </span>
                </div>
                {activity.linkedTo && (
                  <p className="text-muted-foreground ml-8">
                    {entityLabels[activity.linkedTo.type]}:{" "}
                    {activity.linkedTo.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="outcome">
                  Outcome <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="outcome"
                  rows={4}
                  className="resize-none"
                  placeholder="e.g. Called Rohan, discussed pricing. He wants a revised quote by Friday."
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  {outcome.length}/500 characters
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nextFollowUp">
                  Schedule Next Follow-up{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="nextFollowUp"
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  If set, a new follow-up activity will be created automatically.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20 px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Completing this activity will mark it as done and log the
                  outcome in its history.
                </p>
              </div>
            </div>
          ) : (
            /* ==================== VIEW MODE ==================== */
            <div className="px-5 py-5 space-y-6">
              {/* Title block */}
              <div>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.className}`}
                  >
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold leading-tight">
                      {activity.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityCfg.className}`}
                      >
                        {priorityCfg.label} Priority
                      </span>
                      {overdue && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* When & Who */}
              <div className="rounded-lg border p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Due
                  </span>
                  <span className={`font-medium ${overdue ? "text-red-500" : ""}`}>
                    {formatDate(activity.dueDate)}
                    {activity.dueTime && ` • ${activity.dueTime}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Assigned to
                  </span>
                  <span className="font-medium">{activity.assignedTo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Created
                  </span>
                  <span className="font-medium">{formatDate(activity.createdAt)}</span>
                </div>
              </div>

              {/* Linked To */}
              {activity.linkedTo && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Linked To
                  </p>
                  <button className="w-full flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {entityLabels[activity.linkedTo.type]}
                        </p>
                        <p className="text-xs font-medium text-blue-600 truncate">
                          {activity.linkedTo.name}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Notes */}
              {activity.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Notes
                  </p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                    {activity.notes}
                  </div>
                </div>
              )}

              {/* Outcome */}
              {activity.outcome && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Outcome
                  </p>
                  <div className="rounded-lg border bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/40 p-3 text-xs">
                    {activity.outcome}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4 flex gap-3 bg-background">
          {mode === "edit" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setMode("view")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-activity-form"
                disabled={!isDirty}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </Button>
            </>
          )}

          {mode === "complete" && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMode("view")}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                onClick={handleCompleteSubmit}
                disabled={!outcome.trim()}
              >
                <Check className="w-3.5 h-3.5" />
                Mark Complete
              </Button>
            </>
          )}

          {mode === "view" && (
            <>
              {!isLocked && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMode("edit")}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                    onClick={() => setMode("complete")}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Complete
                  </Button>
                </>
              )}
              {isLocked && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ActivityDetailsSheet;