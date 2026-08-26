// ============================================
// 1. IMPORTS
// ============================================
import React, { useMemo, useState } from "react";
import {
  useTable,
  tableFeatures,
  createColumnHelper,
  // Features
  rowSortingFeature,
  rowSelectionFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  // Row Models
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  // Filter functions
  filterFn_includesString,
  filterFn_equals,
  // Utilities
  flexRender,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { ChevronDown } from "lucide-react";

// ============================================
// 2. TYPES
// ============================================
export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type SortOption = {
  label: string;
  value: string;
  sortFn?: (a: any, b: any) => number;
};

export type DataTableProps<TData> = {
  data: TData[];
  columns: any[];
  title?: string;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowClick?: (row: TData) => void;
  bulkActions?: {
    label: string;
    onClick: (selectedRows: TData[]) => void;
    variant?: "default" | "destructive" | "success";
  }[];

  // New props for table controls
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;

  // Filter tabs (like All, New, Contacted, etc.)
  filterTabs?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;

  // Sort options
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (sort: string) => void;

  // View options
  viewOptions?: { label: string; value: string; icon?: React.ReactNode }[];
  activeView?: string;
  onViewChange?: (view: string) => void;
  onStatusChange?: (row: TData, newStatus: string) => void;
  statusOptions: Record<string, string>[];
  statusKey?: string;
};

// ============================================
// 3. STATUS BADGE
// ============================================
export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    blocked: "bg-red-100 text-red-800",
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-purple-100 text-purple-800",
    qualified: "bg-indigo-100 text-indigo-800",
    converted: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1) || status}
    </span>
  );
};

// ============================================
// 4. MAIN DATATABLE COMPONENT
// ============================================
export function DataTable<TData extends Record<string, any>>({
  data,
  columns,
  title = "Data Table",
  searchPlaceholder = "Search leads, name, email or phone...",
  pageSizeOptions = [5, 10, 20, 30, 50],
  defaultPageSize = 10,
  onRowClick,
  bulkActions = [],
  enableSelection = true,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,

  // Table controls
  filterTabs = [],
  activeFilter = "all",
  onFilterChange,
  sortOptions = [],
  activeSort = "",
  onSortChange,
  viewOptions = [],
  activeView = "",
  onViewChange,
  onStatusChange,
  statusOptions,
  statusKey = "status",
}: DataTableProps<TData>) {
  // State
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  // Build features dynamically
  const features = tableFeatures({
    ...(enableSorting && { rowSortingFeature }),
    ...(enableSelection && { rowSelectionFeature }),
    ...(enableFiltering && { columnFilteringFeature }),
    ...(enableFiltering && { globalFilteringFeature }),
    ...(enablePagination && { rowPaginationFeature }),
    sortedRowModel: enableSorting ? createSortedRowModel() : undefined,
    filteredRowModel: enableFiltering ? createFilteredRowModel() : undefined,
    paginatedRowModel: enablePagination ? createPaginatedRowModel() : undefined,
    filterFns: enableFiltering
      ? {
          includesString: filterFn_includesString,
          equals: filterFn_equals,
        }
      : undefined,
  });

  const processedColumns = useMemo(() => {
    if (!onStatusChange) return columns;
    return columns.map((col) => {
      if (col.id === 'status' || col.accessorKey === 'status') {
        return {
          ...col,
          cell: (info: any) => {
            const currentStatus = info.getValue();
            const row = info.row.original;
            const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors w-[120px] ${currentOption.color} ${currentOption.textColor || 'text-white'}`}
                    onClick={(e) => e.stopPropagation()} // <-- stop row click
                  >
                    {currentOption.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[140px] rounded-lg shadow-lg border">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation(); // <-- stop row click
                        onStatusChange(row, option.value);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
        };
      }
      return col;
    });
  }, [columns, onStatusChange, statusOptions]);

  // Table instance
  const table = useTable({
    features,
    columns: processedColumns,
    data,
    state: {
      ...(enableFiltering && { globalFilter }),
      ...(enableSelection && { rowSelection }),
    },
    ...(enableFiltering && { onGlobalFilterChange: setGlobalFilter }),
    ...(enableSelection && { onRowSelectionChange: setRowSelection }),
  });

  // Get table data
  const { pagination } = table.state;
  const pageIndex = enablePagination ? pagination.pageIndex : 0;
  const pageSize = enablePagination ? pagination.pageSize : data.length;
  const pageRows = table.getRowModel().rows;
  const totalRows = table.getFilteredRowModel().rows.length;

  // Get selected rows
  const selectedRowIds = Object.keys(rowSelection);
  const selectedRows = selectedRowIds
    .map(
      (id) => table.getRowModel().rows.find((row) => row.id === id)?.original,
    )
    .filter(Boolean) as TData[];

  // Handlers
  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  };


  return (
    <div className="p-4 max-w-8xl">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {enableSelection && selectedRowIds.length > 0 && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
              {selectedRowIds.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs and Sort Controls */}
      {(filterTabs.length > 0 || sortOptions.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Filter Tabs */}
          {filterTabs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => onFilterChange?.(tab.value)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    activeFilter === tab.value
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        activeFilter === tab.value
                          ? "bg-blue-400 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex flex-col gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {enableFiltering && header.column.getCanFilter() && (
                          <input
                            type="text"
                            value={
                              (header.column.getFilterValue() as string) ?? ""
                            }
                            onChange={(e) => {
                              header.column.setFilterValue(e.target.value);
                            }}
                            placeholder={`Filter...`}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {pageRows.length > 0 ? (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    enableSelection && row.getIsSelected() ? "bg-blue-50" : ""
                  } ${onRowClick || onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => handleRowClick(row)}
                >
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Showing {pageIndex * pageSize + 1} to{" "}
              {Math.min((pageIndex + 1) * pageSize, totalRows)} of {totalRows}{" "}
              leads
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ⏮
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600 px-2">
              Page {pageIndex + 1} of {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              ⏭
            </button>

            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {enableSelection &&
        selectedRowIds.length > 0 &&
        bulkActions.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedRowIds.length} rows selected
            </span>
            {bulkActions.map((action, index) => {
              const variantStyles = {
                default: "bg-blue-500 hover:bg-blue-600",
                destructive: "bg-red-500 hover:bg-red-600",
                success: "bg-green-500 hover:bg-green-600",
              };
              return (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedRows)}
                  className={`px-3 py-1 text-sm text-white rounded transition ${
                    variantStyles[action.variant || "default"]
                  }`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
}

export default DataTable;
