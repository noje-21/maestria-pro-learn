import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface Action<T> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = "Buscar...",
  searchKeys = [],
  loading = false,
  emptyMessage = "No hay datos disponibles",
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;

    const searchLower = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, search, searchKeys]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to first page when search changes
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" />
          </div>
        )}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
                {actions && <TableHead><Skeleton className="h-4 w-16" /></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <Skeleton className="h-8 w-20" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      {searchable && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Mostrando</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">de {filteredData.length}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={col.key} className={cn("font-semibold", col.className)}>
                    {col.header}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="text-right w-32">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (actions ? 1 : 0)} 
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, idx) => (
                  <TableRow 
                    key={row.id || idx} 
                    className="hover:bg-muted/30 transition-colors even:bg-muted/10"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell ? col.cell(row) : row[col.key]}
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions.map((action, actionIdx) => {
                            if (action.show && !action.show(row)) return null;
                            const Icon = action.icon;
                            return (
                              <Tooltip key={actionIdx}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={action.variant || "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => action.onClick(row)}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{action.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
