import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  FileUp,
  Plus,
  PlusIcon,
  Star,
  Target,
  UserRound,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, StatusBadge } from "../../components/ui/table/DataTable";
import { LeadInfoModal } from "./modals/LeadInfoModal";
import AddLeadModal from "./modals/AddLeadModal";




// --- Types ---
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  company: string;
  source: string;
  owner: string;
  created: string;
};

// --- Generate Dummy Data ---
const generateDummyData = (): Person[] => {
  const firstNames = [
    "Rohan", "Priya", "Amit", "Neha", "Deepak", 
    "Vishal", "Anjali", "Arjun", "Sneha", "Raj"
  ];
  const lastNames = [
    "Kumar", "Singh", "Mehta", "Sharma", "Gupta",
    "Patel", "Shah", "Verma", "Reddy", "Joshi"
  ];
  const companies = [
    "RK Solutions", "Elite Corp", "Zylker Pvt Ltd", 
    "Neha Enterprise", "DG Infotech", "SoftTech Solutions",
    "Shah Traders", "Patel Group", "Verma Industries", "Joshi & Co"
  ];
  const sources = ["Website", "Referral", "LinkedIn", "Exhibition", "Cold Call", "Advertisement"];
  const owners = ["Admin", "John Doe", "Jane Smith", "Mike Johnson"];
  const statuses: Person["status"][] = [
    "new", "contacted", "qualified", "converted", "lost"
  ];

  return Array.from({ length: 128 }, (_, i) => ({
    id: `user-${i + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    age: Math.floor(Math.random() * 50) + 18,
    address: `${Math.floor(Math.random() * 1000)} Main St, City`,
    phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    owner: owners[Math.floor(Math.random() * owners.length)],
    created: `${Math.floor(Math.random() * 30) + 1}d ago`,
  }));
};

// --- Column Definitions ---
const columnHelper = createColumnHelper<any, any>();

const createColumns = () => {
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return [
    // Selection Column
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

    // Lead (Name with avatar)
    columnHelper.accessor("firstName", {
      id: "lead",
      header: "Lead",
      cell: (info) => {
        const firstName = info.getValue();
        const initials = getInitials(firstName," ");
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
              {initials}
            </div>
            <div>
              <div className="font-medium text-sm">{firstName}</div>
              <div className="text-xs text-gray-500">{info.row.original.email || `${firstName.toLowerCase()}@email.com`}</div>
            </div>
          </div>
        );
      },
      filterFn: "includesString",
    }),

    // Contact (Phone)
    columnHelper.accessor("phone", {
      header: "Contact",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),

    // Company
    columnHelper.accessor("company", {
      header: "Company",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),

    // Status
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

    // Source
    columnHelper.accessor("source", {
      header: "Source",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),

    // Owner
    columnHelper.accessor("owner", {
      header: "Owner",
      cell: (info) => <div className="text-sm">{info.getValue()}</div>,
      filterFn: "includesString",
    }),

    // Created
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

    // Actions
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: () => (
        <button className="text-gray-400 hover:text-gray-600 cursor-pointer"
        onClick={(e)=> e.stopPropagation()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      ),
    }),
  ];
};

// --- Main Leads Component ---
const Leads: React.FC = () => { 
   
  const [data, setData] = useState<Person[]>(generateDummyData);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [isLeadInfoOpen, setIsLeadInfoOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Person>();
  const [isAddLeadOpen, setIsAddLeadOpen]= useState(false);

  // Filter tabs with counts
  const filterTabs = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: "All Leads", value: "all", count: data.length },
      { label: "New", value: "new", count: counts.new || 0 },
      { label: "Contacted", value: "contacted", count: counts.contacted || 0 },
      { label: "Qualified", value: "qualified", count: counts.qualified || 0 },
      { label: "Converted", value: "converted", count: counts.converted || 0 },
      { label: "Lost", value: "lost", count: counts.lost || 0 },
    ];
  }, [data]);

// Handler for status change
    const handleStatusChange = (row: Person, newStatus: string) => {
    setData(prev =>
      prev.map(item =>
        item.id === row.id ? { ...item, status: newStatus as Person['status'] } : item
      )
    );
  };


  // View options
  const viewOptions = [
    { label: "Table", value: "table", icon: <TableIcon className="w-4 h-4" /> },
    { label: "Grid", value: "grid", icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
    { value: 'converted', label: 'Converted', color: 'bg-green-500' },
    { value: 'lost', label: 'Lost', color: 'bg-red-500' },
  ];

  // Filter data based on active filter
  const filteredData = useMemo(() => {
    if (activeFilter === "all") return data;
    return data.filter((item) => item.status === activeFilter);
  }, [data, activeFilter]);

  // Sort data based on active sort
const sortedData = useMemo(() => {
  const sorted = [...filteredData];

  switch (activeSort) {
    case 'newest':
      // Sort by created date (assumes format like "2d ago", "5h ago", etc.)
      // We'll parse the number before 'd' or 'h' and convert to days/hours for comparison
      return sorted.sort((a, b) => {
        const getDays = (str: string) => {
          const match = str.match(/(\d+)([dh])/);
          if (!match) return 0;
          const num = parseInt(match[1]);
          const unit = match[2];
          return unit === 'd' ? num : num / 24; // convert hours to days
        };
        return getDays(b.created) - getDays(a.created);
      });

    case 'oldest':
      return sorted.sort((a, b) => {
        const getDays = (str: string) => {
          const match = str.match(/(\d+)([dh])/);
          if (!match) return 0;
          const num = parseInt(match[1]);
          const unit = match[2];
          return unit === 'd' ? num : num / 24;
        };
        return getDays(a.created) - getDays(b.created);
      });

    case 'az':
      return sorted.sort((a, b) => a.firstName.localeCompare(b.firstName));

    case 'za':
      return sorted.sort((a, b) => b.firstName.localeCompare(a.firstName));

    default:
      return sorted;
  }
}, [filteredData, activeSort]);

  // Lead cards data
  const leadCards = [
    { title: "Total Leads", value: 128, icon: <UserRound />, change: "+12%", changeText: "vs last month" },
    { title: "New Leads", value: 32, icon: <Plus />, change: "+8%", changeText: "vs last month" },
    { title: "Contacted", value: 56, icon: <UserRound />, change: "+5%", changeText: "vs last month" },
    { title: "Qualified", value: 18, icon: <Star />, change: "+20%", changeText: "vs last month" },
    { title: "Converted", value: 22, icon: <Target />, change: "+10%", changeText: "vs last month" },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Bulk Edit",
      onClick: (selectedRows: Person[]) => {
        console.log("Bulk edit:", selectedRows);
      },
      variant: "default" as const,
    },
    {
      label: "Delete Selected",
      onClick: (selectedRows: Person[]) => {
        console.log("Delete:", selectedRows);
      },
      variant: "destructive" as const,
    },
    {
      label: "Export CSV",
      onClick: (selectedRows: Person[]) => {
        console.log("Export:", selectedRows);
      },
      variant: "success" as const,
    },
  ];

  // Row click Handler
  const handleRowClick = (row: Person) => {
    setIsLeadInfoOpen(true);
    setSelectedLead(row);
    console.log(isLeadInfoOpen)
  };

  const handleAddLead=()=>{
    setIsAddLeadOpen(true);
  }

  console.log(filteredData, 'filter')

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your leads in one place.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
          variant="outline"
          onClick={handleAddLead}
          >
            <PlusIcon className="w-4 h-4" />
            Add Lead
          </Button>
          <Button variant="outline">
            <FileUp className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Lead Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {leadCards.map((card, index) => (
          <div
            className="bg-white border-2 rounded-lg p-4 hover:shadow-md transition-shadow"
            key={index}
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">{card.title}</span>
                <div className="text-gray-400">{card.icon}</div>
              </div>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 font-medium">{card.change}</span>
                <span className="text-xs text-gray-500">{card.changeText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DataTable */}
      <DataTable
        data={sortedData}
        columns={createColumns()}
        title=""
        searchPlaceholder="Search leads, name, email or phone..."
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
        onStatusChange={handleStatusChange}
        statusOptions={statusOptions}
      />
      <LeadInfoModal
        isLeadInfoOpen={isLeadInfoOpen}
        setIsLeadInfoOpen={setIsLeadInfoOpen}
        leadData={selectedLead}
      />
      <AddLeadModal
      isAddLeadOpen={isAddLeadOpen}
      setisAddLeadOpen={setIsAddLeadOpen}
      />
    </div>
  );
};

export default Leads;