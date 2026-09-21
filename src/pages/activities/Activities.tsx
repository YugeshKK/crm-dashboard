import React, { useState, useMemo } from "react";
import {
  Plus,
  Phone,
  Users,
  Mail,
  Clock,
  CheckSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RotateCcw,
  MoreHorizontal,
  List,
  Table as TableIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/DataTable";
import ActivityDetailsSheet, {
  ActivityDetail,
  ActivityType,
  ActivityPriority,
  ActivityStatus,
} from "./ActivityDetailSheet";
import CreateActivitySheet from "./CreateActivitySheet";
import { ActivityListView, type Activity } from "./ActivityListView";

// ============================================================
// DUMMY DATA
// ============================================================
const generateActivities = (): Activity[] => {
  const titles = [
    "Follow up on proposal",
    "Call to discuss pricing",
    "Meeting for contract review",
    "Send revised quotation",
    "Demo the solar panel",
    "Confirm payment receipt",
    "Site survey visit",
    "Follow up on invoice",
    "Check battery stock",
    "Schedule installation",
  ];
  const types: ActivityType[] = ["call", "meeting", "email", "follow_up", "task", "note"];
  const priorities: ActivityPriority[] = ["high", "medium", "low"];
  const statuses: ActivityStatus[] = ["pending", "pending", "in_progress", "completed"];
  const entities = [
    { type: "lead" as const, id: "user-12", name: "Rohan Kumar" },
    { type: "customer" as const, id: "cust-3", name: "ABC Electronics" },
    { type: "order" as const, id: "SO-1042", name: "SO-1042" },
    { type: "invoice" as const, id: "INV-2024-1050", name: "INV-2024-1050" },
    { type: "payment" as const, id: "PAY-2024-1042", name: "PAY-2024-1042" },
  ];
  const assignees = ["Arjun Patel", "Jane Smith", "Mike Johnson", "Priya Singh"];

  const today = new Date();
  return Array.from({ length: 72 }, (_, i) => {
    const offset = (i % 21) - 7;
    const due = new Date(today);
    due.setDate(today.getDate() + offset);
    const hours = 9 + (i % 8);
    const mins = (i % 2) * 30;

    return {
      id: `act-${i + 1}`,
      title: titles[i % titles.length] + (i >= titles.length ? ` #${i}` : ""),
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      linkedTo: entities[i % entities.length],
      assignedTo: assignees[i % assignees.length],
      dueDate: due.toISOString().split("T")[0],
      dueTime: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
      notes: "Discussed next steps with the client.",
      outcome:
        i % 3 === 0
          ? "Client confirmed interest. Follow-up scheduled."
          : undefined,
      createdAt: new Date(today.getTime() - i * 86400000)
        .toISOString()
        .split("T")[0],
    };
  });
};

// ============================================================
// HELPERS
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

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
};

const isOverdue = (dateStr: string, status: ActivityStatus) => {
  if (status === "completed" || status === "cancelled") return false;
  const d = new Date(dateStr);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
};

const isUpcoming = (dateStr: string, status: ActivityStatus) => {
  if (status === "completed" || status === "cancelled") return false;
  const d = new Date(dateStr);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const weekLater = new Date(t);
  weekLater.setDate(t.getDate() + 7);
  return d > t && d <= weekLater;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0 && diff > -7) return `${Math.abs(diff)} days ago`;
  if (diff > 0 && diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ============================================================
// TABLE COLUMNS (secondary view)
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const createColumns = () => [
  columnHelper.display({
    id: "select",
    header: ({ table }: any) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }: any) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }),

  columnHelper.accessor("title", {
    header: "Activity",
    cell: (info: any) => {
      const row = info.row.original as Activity;
      const cfg = typeConfig[row.type];
      const Icon = cfg.icon;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${cfg.className}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[240px]">
              {row.title}
            </p>
            {row.linkedTo && (
              <p className="text-[10px] text-muted-foreground truncate">
                {row.linkedTo.name}
              </p>
            )}
          </div>
        </div>
      );
    },
    filterFn: "includesString",
  }),

  columnHelper.accessor("type", {
    header: "Type",
    cell: (info: any) => {
      const v = info.getValue() as ActivityType;
      return <span className="text-xs">{typeConfig[v].label}</span>;
    },
    filterFn: "includesString",
  }),

  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info: any) => {
      const v = info.getValue() as ActivityPriority;
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityConfig[v].className}`}
        >
          {priorityConfig[v].label}
        </span>
      );
    },
  }),

  columnHelper.accessor("assignedTo", {
    header: "Assigned To",
    cell: (info: any) => <span className="text-xs">{info.getValue()}</span>,
    filterFn: "includesString",
  }),

  columnHelper.accessor("dueDate", {
    header: "Due",
    cell: (info: any) => {
      const row = info.row.original as Activity;
      const overdue = isOverdue(row.dueDate, row.status);
      const today = isToday(row.dueDate);
      return (
        <div>
          <p
            className={`text-xs font-medium ${
              overdue ? "text-red-500" : today ? "text-blue-600" : ""
            }`}
          >
            {formatDate(row.dueDate)}
          </p>
          <p className="text-[10px] text-muted-foreground">{row.dueTime}</p>
        </div>
      );
    },
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info: any) => {
      const v = info.getValue() as ActivityStatus;
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[v].className}`}
        >
          {statusConfig[v].label}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "",
    cell: () => (
      <button
        className="text-muted-foreground hover:text-foreground p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    ),
  }),
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const Activities = () => {
  const [data, setData] = useState<Activity[]>(generateActivities);
  const [activeTab, setActiveTab] = useState("all");
  const [view, setView] = useState<"list" | "table">("list");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Metrics
  const metrics = useMemo(() => {
    const today = data.filter(
      (a) =>
        isToday(a.dueDate) &&
        a.status !== "completed" &&
        a.status !== "cancelled"
    ).length;
    const overdue = data.filter((a) => isOverdue(a.dueDate, a.status)).length;
    const upcoming = data.filter((a) => isUpcoming(a.dueDate, a.status)).length;
    const completed = data.filter((a) => a.status === "completed").length;
    return { today, overdue, upcoming, completed };
  }, [data]);

  const metricCards = [
    {
      title: "Today",
      value: metrics.today.toString(),
      sub: "Due today",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Overdue",
      value: metrics.overdue.toString(),
      sub: "Needs attention",
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      title: "Upcoming",
      value: metrics.upcoming.toString(),
      sub: "Next 7 days",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Completed",
      value: metrics.completed.toString(),
      sub: "All time",
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];

  // Tabs (only used in Table view)
  const filterTabs = useMemo(() => {
    const todayCount = data.filter(
      (a) =>
        isToday(a.dueDate) &&
        a.status !== "completed" &&
        a.status !== "cancelled"
    ).length;
    const upcomingCount = data.filter((a) =>
      isUpcoming(a.dueDate, a.status)
    ).length;
    const overdueCount = data.filter((a) => isOverdue(a.dueDate, a.status)).length;
    const completedCount = data.filter((a) => a.status === "completed").length;

    return [
      { label: "Today", value: "today", count: todayCount },
      { label: "Upcoming", value: "upcoming", count: upcomingCount },
      { label: "Overdue", value: "overdue", count: overdueCount },
      { label: "Completed", value: "completed", count: completedCount },
      { label: "All", value: "all", count: data.length },
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    switch (activeTab) {
      case "today":
        return data.filter(
          (a) =>
            isToday(a.dueDate) &&
            a.status !== "completed" &&
            a.status !== "cancelled"
        );
      case "upcoming":
        return data.filter((a) => isUpcoming(a.dueDate, a.status));
      case "overdue":
        return data.filter((a) => isOverdue(a.dueDate, a.status));
      case "completed":
        return data.filter((a) => a.status === "completed");
      case "all":
      default:
        return data;
    }
  }, [data, activeTab]);

  // Handlers
  const handleRowClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const handleQuickComplete = (activity: Activity) => {
    // Quick-complete from list view: mark as completed, no outcome prompt
    setData((prev) =>
      prev.map((a) =>
        a.id === activity.id ? { ...a, status: "completed" } : a
      )
    );
  };

  const handleSnooze = (activity: Activity, days: number) => {
    const newDue = new Date(activity.dueDate);
    newDue.setDate(newDue.getDate() + days);
    setData((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? { ...a, dueDate: newDue.toISOString().split("T")[0] }
          : a
      )
    );
  };

  const handleSave = (updated: ActivityDetail) => {
    setData((prev) =>
      prev.map((a) =>
        a.id === updated.id
          ? { ...a, ...updated, linkedTo: updated.linkedTo || null }
          : a
      )
    );
    setSelectedActivity(updated as any);
  };

  const handleComplete = (
    activityId: string,
    outcome: string,
    nextFollowUpDate?: string
  ) => {
    setData((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, status: "completed", outcome } : a
      )
    );

    if (nextFollowUpDate) {
      const original = data.find((a) => a.id === activityId);
      if (original) {
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          title: `Follow-up: ${original.title}`,
          type: "follow_up",
          priority: "medium",
          status: "pending",
          linkedTo: original.linkedTo,
          assignedTo: original.assignedTo,
          dueDate: nextFollowUpDate,
          dueTime: "10:00",
          notes: `Auto-created follow-up from "${original.title}"`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setData((prev) => [newActivity, ...prev]);
      }
    }

    setIsDetailsOpen(false);
    setSelectedActivity(null);
  };

  const handleCreate = (formData: any) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      status: "pending",
      linkedTo:
        formData.linkedType !== "none" && formData.linkedName
          ? {
              type: formData.linkedType,
              id: formData.linkedName,
              name: formData.linkedName,
            }
          : null,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      notes: formData.notes,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setData((prev) => [newActivity, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track calls, meetings, follow-ups and tasks across your pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "table"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4" />
            New Activity
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <p className="text-xs text-muted-foreground">{m.title}</p>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-bold mt-1.5">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* ============ VIEW: LIST (default) ============ */}
      {view === "list" && (
        <ActivityListView
          activities={data}
          onRowClick={handleRowClick}
          onComplete={handleQuickComplete}
          onSnooze={handleSnooze}
        />
      )}

      {/* ============ VIEW: TABLE (secondary) ============ */}
      {view === "table" && (
        <DataTable
          data={filteredData}
          columns={createColumns()}
          title=""
          searchPlaceholder="Search activities by title, assignee..."
          pageSizeOptions={[10, 25, 50, 100]}
          defaultPageSize={10}
          onRowClick={handleRowClick}
          enableSelection={true}
          enableSorting={true}
          enableFiltering={true}
          enablePagination={true}
          filterTabs={filterTabs}
          activeFilter={activeTab}
          onFilterChange={setActiveTab}
        />
      )}

      {/* Sheets */}
      <ActivityDetailsSheet
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        activity={selectedActivity as any}
        onSave={handleSave}
        onComplete={handleComplete}
      />

      <CreateActivitySheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default Activities;