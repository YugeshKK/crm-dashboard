import React, { useState, useMemo } from "react";
import {
  FileUp,
  PlusIcon,
  UserRound,
  LayoutGrid,
  Table as TableIcon,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, StatusBadge } from "../../components/ui/table/DataTable";
import CustomerInfoModal from "./modal/customerInfoModal";
import { AddCustomerModal } from "./modal/addCustomerModal";

// ============================================================
// TYPES
// ============================================================
type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive" | "pending" | "blocked";
  source: string;
  owner: string;
  created: string;
  lastContact: string;
};

// ============================================================
// DUMMY DATA
// ============================================================
const generateDummyCustomers = (): Customer[] => {
  const firstNames = [
    "Rohan", "Priya", "Amit", "Neha", "Deepak",
    "Vishal", "Anjali", "Arjun", "Sneha", "Raj",
  ];
  const lastNames = [
    "Kumar", "Singh", "Mehta", "Sharma", "Gupta",
    "Patel", "Shah", "Verma", "Reddy", "Joshi",
  ];
  const companies = [
    "RK Solutions", "Elite Corp", "Zylker Pvt Ltd",
    "Neha Enterprise", "DG Infotech", "SoftTech Solutions",
    "Shah Traders", "Patel Group", "Verma Industries", "Joshi & Co",
  ];
  const sources = [
    "Website", "Referral", "LinkedIn", "Exhibition",
    "Cold Call", "Advertisement",
  ];
  const owners = ["Admin", "John Doe", "Jane Smith", "Mike Johnson"];
  const statuses: Customer["status"][] = [
    "active", "inactive", "pending", "blocked",
  ];

  return Array.from({ length: 128 }, (_, i) => ({
    id: `cust-${i + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `customer${i + 1}@email.com`,
    phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    company: companies[Math.floor(Math.random() * companies.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    owner: owners[Math.floor(Math.random() * owners.length)],
    created: `${Math.floor(Math.random() * 30) + 1}d ago`,
    lastContact: `${Math.floor(Math.random() * 14) + 1}d ago`,
  }));
};

// ============================================================
// CUSTOMER INFO MODAL
// ============================================================
interface CustomerInfoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerData?: Customer;
}



// ============================================================
// COLUMN DEFINITIONS
// ============================================================
const columnHelper = createColumnHelper<any, any>();

const createColumns = () => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    columnHelper.accessor("firstName", {
      id: "customer",
      header: "Customer",
      cell: (info) => {
        const firstName = info.getValue();
        const lastName = info.row.original.lastName || "";
        const initials = getInitials(firstName, lastName);
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
              {initials}
            </div>
            <div>
              <div className="font-medium text-sm">
                {firstName} {lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {info.row.original.email}
              </div>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
    }),
    columnHelper.accessor("phone", {
      header: "Contact",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),
    columnHelper.accessor("company", {
      header: "Company",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Status
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <StatusBadge status={info.getValue()} />,
      filterFn: "includesString",
    }),
    columnHelper.accessor("source", {
      header: "Source",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),
    columnHelper.accessor("owner", {
      header: "Owner",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),
    columnHelper.accessor("created", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Created
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
    }),
    columnHelper.accessor("lastContact", {
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <div
            className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
            onClick={column.getToggleSortingHandler()}
          >
            Last Contact
            <span className="text-xs">
              {isSorted === "asc" ? " ↑" : isSorted === "desc" ? " ↓" : " ↕"}
            </span>
          </div>
        );
      },
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: () => (
        <button
          className="text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      ),
    }),
  ];
};

// ============================================================
// MAIN CUSTOMERS COMPONENT
// ============================================================
const Customers: React.FC = () => {
  const [data] = useState<Customer[]>(generateDummyCustomers);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);

  // Filter tabs with counts
  const filterTabs = useMemo(() => {
    const counts = data.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return [
      { label: "All Customers", value: "all", count: data.length },
      { label: "Active", value: "active", count: counts.active || 0 },
      { label: "Inactive", value: "inactive", count: counts.inactive || 0 },
      { label: "Pending", value: "pending", count: counts.pending || 0 },
      { label: "Blocked", value: "blocked", count: counts.blocked || 0 },
    ];
  }, [data]);

  // Filtering and sorting
  const filteredData = useMemo(() => {
    if (activeFilter === "all") return data;
    return data.filter((item) => item.status === activeFilter);
  }, [data, activeFilter]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    switch (activeSort) {
      case "newest":
        return sorted.sort((a, b) => {
          const getDays = (str: string) => {
            const match = str.match(/(\d+)([dh])/);
            if (!match) return 0;
            const num = parseInt(match[1]);
            const unit = match[2];
            return unit === "d" ? num : num / 24;
          };
          return getDays(b.created) - getDays(a.created);
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const getDays = (str: string) => {
            const match = str.match(/(\d+)([dh])/);
            if (!match) return 0;
            const num = parseInt(match[1]);
            const unit = match[2];
            return unit === "d" ? num : num / 24;
          };
          return getDays(a.created) - getDays(b.created);
        });
      case "az":
        return sorted.sort((a, b) => a.firstName.localeCompare(b.firstName));
      case "za":
        return sorted.sort((a, b) => b.firstName.localeCompare(a.firstName));
      default:
        return sorted;
    }
  }, [filteredData, activeSort]);

  // Metrics cards
  const customerCards = [
    { title: "Total Customers", value: data.length, icon: <Users />, change: "+8%", changeText: "vs last month" },
    { title: "Active", value: data.filter(c => c.status === "active").length, icon: <UserCheck />, change: "+12%", changeText: "vs last month" },
    { title: "Inactive", value: data.filter(c => c.status === "inactive").length, icon: <UserX />, change: "-3%", changeText: "vs last month" },
    { title: "Pending", value: data.filter(c => c.status === "pending").length, icon: <UserPlus />, change: "+5%", changeText: "vs last month" },
    { title: "Blocked", value: data.filter(c => c.status === "blocked").length, icon: <UserRound />, change: "+2%", changeText: "vs last month" },
  ];

  // Bulk actions (example)
  const bulkActions = [
    {
      label: "Bulk Edit",
      onClick: (selectedRows: Customer[]) => console.log("Bulk edit:", selectedRows),
      variant: "default" as const,
    },
    {
      label: "Delete Selected",
      onClick: (selectedRows: Customer[]) => console.log("Delete:", selectedRows),
      variant: "destructive" as const,
    },
    {
      label: "Export CSV",
      onClick: (selectedRows: Customer[]) => console.log("Export:", selectedRows),
      variant: "success" as const,
    },
  ];

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-500" },
    { value: "inactive", label: "Inactive", color: "bg-gray-500" },
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "blocked", label: "Blocked", color: "bg-red-500" },
  ];

  const viewOptions = [
    { label: "Table", value: "table", icon: <TableIcon className="w-4 h-4" /> },
    { label: "Grid", value: "grid", icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  // Row click handler
  const handleRowClick = (row: Customer) => {
    setSelectedCustomer(row);
    setIsInfoOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage and track your customers in one place.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsAddCustModalOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Add Customer
          </Button>
          <Button variant="outline">
            <FileUp className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {customerCards.map((card, index) => (
          <Card
            key={index}
            className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                {card.title}
              </CardTitle>
              <div className="text-muted-foreground">{card.icon}</div>
            </CardHeader>
            <CardContent className="p-0 mt-2">
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
            <CardFooter className="p-0 mt-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600 font-medium">{card.change}</span>
                <span className="text-xs text-muted-foreground">{card.changeText}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        data={sortedData}
        columns={createColumns()}
        title=""
        searchPlaceholder="Search customers, name, email or phone..."
        pageSizeOptions={[10, 25, 50, 100]}
        defaultPageSize={10}
        onRowClick={handleRowClick}
        bulkActions={bulkActions}
        enableSelection={true}
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        filterTabs={filterTabs}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        viewOptions={viewOptions}
        activeView="table"
        onViewChange={(view) => console.log("View changed to:", view)}
        statusOptions={statusOptions}
        onStatusChange={(row, newStatus) => {
          // Update status in state (placeholder)
          console.log("Status change:", row, newStatus);
        }}
      />

      {/* Customer Info Modal */}
      <CustomerInfoModal
        isOpen={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        customerData={selectedCustomer}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustModalOpen}
        onOpenChange={setIsAddCustModalOpen}
      />
    </div>
  );
};

export default Customers;