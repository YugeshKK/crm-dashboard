import React, { useMemo, useState } from "react";
import {
  Phone,
  Users,
  Mail,
  Clock,
  CheckSquare,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type {
  ActivityType,
  ActivityPriority,
  ActivityStatus,
  LinkedEntityType,
} from "./ActivityDetailSheet";

// ============================================================
// TYPES
// ============================================================
export type Activity = {
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
};

interface ActivityListViewProps {
  activities: Activity[];
  onRowClick: (activity: Activity) => void;
  onComplete: (activity: Activity) => void;
  onSnooze?: (activity: Activity, days: number) => void;
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

const priorityColors: Record<ActivityPriority, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const entityLabels: Record<string, string> = {
  lead: "Lead",
  customer: "Customer",
  order: "Order",
  invoice: "Invoice",
  payment: "Payment",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ============================================================
// DATE GROUPING HELPERS
// ============================================================
type GroupKey = "overdue" | "today" | "tomorrow" | "this_week" | "later" | "completed";

const getGroup = (activity: Activity): GroupKey => {
  if (activity.status === "completed" || activity.status === "cancelled") {
    return "completed";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(activity.dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "this_week";
  return "later";
};

const groupMeta: Record<
  GroupKey,
  { label: string; accent: string; icon: React.ElementType }
> = {
  overdue: {
    label: "Overdue",
    accent: "text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
  today: {
    label: "Today",
    accent: "text-blue-600 dark:text-blue-400",
    icon: Calendar,
  },
  tomorrow: {
    label: "Tomorrow",
    accent: "text-foreground",
    icon: Calendar,
  },
  this_week: {
    label: "This Week",
    accent: "text-muted-foreground",
    icon: Calendar,
  },
  later: {
    label: "Later",
    accent: "text-muted-foreground",
    icon: Calendar,
  },
  completed: {
    label: "Completed",
    accent: "text-green-600 dark:text-green-400",
    icon: CheckSquare,
  },
};

const groupOrder: GroupKey[] = [
  "overdue",
  "today",
  "tomorrow",
  "this_week",
  "later",
  "completed",
];

// ============================================================
// ACTIVITY CARD
// ============================================================
interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
  onComplete: () => void;
  onSnooze?: (days: number) => void;
  isCompleted: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onClick,
  onComplete,
  onSnooze,
  isCompleted,
}) => {
  const cfg = typeConfig[activity.type];
  const Icon = cfg.icon;
  const overdue =
    !isCompleted &&
    new Date(activity.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-lg border bg-background hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer ${
        isCompleted ? "opacity-60" : ""
      }`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isCompleted) onComplete();
        }}
        disabled={isCompleted}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? "border-green-500 bg-green-500"
            : "border-muted-foreground/40 hover:border-green-500"
        }`}
        aria-label={isCompleted ? "Completed" : "Mark complete"}
      >
        {isCompleted && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Type icon */}
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cfg.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium leading-tight truncate ${
                isCompleted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {activity.title}
            </p>
            {activity.linkedTo && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {activity.linkedTo.name}
                </span>{" "}
                · {entityLabels[activity.linkedTo.type]}
              </p>
            )}
          </div>

          {/* Right side: priority, time, avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Priority dot */}
            <div
              className={`w-2 h-2 rounded-full ${priorityColors[activity.priority]}`}
              title={`${activity.priority} priority`}
            />

            {/* Due time */}
            <div
              className={`flex items-center gap-1 text-[11px] ${
                overdue ? "text-red-500 font-medium" : "text-muted-foreground"
              }`}
            >
              <Clock className="w-3 h-3" />
              {activity.dueTime}
            </div>

            {/* Assignee avatar */}
            <div
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-foreground"
              title={activity.assignedTo}
            >
              {getInitials(activity.assignedTo)}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                {!isCompleted && onSnooze && (
                  <>
                    <DropdownMenuItem onClick={() => onSnooze(1)}>
                      Snooze 1 day
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSnooze(3)}>
                      Snooze 3 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSnooze(7)}>
                      Snooze 1 week
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Reassign</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN LIST VIEW
// ============================================================
export function ActivityListView({
  activities,
  onRowClick,
  onComplete,
  onSnooze,
}: ActivityListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    completed: true,
    later: false,
  });

  // Group activities
  const grouped = useMemo(() => {
    const groups: Record<GroupKey, Activity[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      this_week: [],
      later: [],
      completed: [],
    };

    activities.forEach((a) => {
      groups[getGroup(a)].push(a);
    });

    // Sort within each group by due time
    Object.keys(groups).forEach((k) => {
      groups[k as GroupKey].sort((a, b) =>
        a.dueTime.localeCompare(b.dueTime)
      );
    });

    return groups;
  }, [activities]);

  const totalVisible = activities.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled"
  ).length;

  if (totalVisible === 0 && grouped.completed.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-12 text-center">
        <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium">All caught up!</p>
        <p className="text-xs text-muted-foreground mt-1">
          No activities to show. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupOrder.map((key) => {
        const items = grouped[key];
        if (items.length === 0) return null;

        const meta = groupMeta[key];
        const GroupIcon = meta.icon;
        const isCollapsed = collapsed[key];

        return (
          <div key={key}>
            {/* Group header */}
            <button
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              className="w-full flex items-center gap-2 px-1 py-1.5 mb-2 hover:bg-muted/40 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <GroupIcon className={`w-3.5 h-3.5 ${meta.accent}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${meta.accent}`}>
                {meta.label}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </button>

            {/* Group items */}
            {!isCollapsed && (
              <div className="space-y-1.5 pl-2">
                {items.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => onRowClick(activity)}
                    onComplete={() => onComplete(activity)}
                    onSnooze={
                      onSnooze ? (days) => onSnooze(activity, days) : undefined
                    }
                    isCompleted={
                      activity.status === "completed" ||
                      activity.status === "cancelled"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ActivityListView;