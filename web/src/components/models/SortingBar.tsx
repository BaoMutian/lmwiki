"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortingBarProps {
  total: number;
  sortBy: string;
  sortOrder: string;
  view: "grid" | "list";
}

const sortOptions = [
  { value: "releaseDate", label: "发布日期" },
  { value: "name", label: "名称" },
  { value: "paramsTotal", label: "参数量" },
  { value: "contextWindow", label: "上下文长度" },
  { value: "scoreArenaElo", label: "Arena Elo" },
  { value: "pricingInput", label: "价格" },
];

export function SortingBar({ total, sortBy, sortOrder, view }: SortingBarProps) {
  const router = useRouter();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value, page: "" });
  };

  const toggleSortOrder = () => {
    updateParams({ order: sortOrder === "desc" ? "asc" : "desc", page: "" });
  };

  const handleViewChange = (newView: "grid" | "list") => {
    updateParams({ view: newView });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        共找到 <span className="font-medium text-foreground">{total}</span> 个模型
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Sort Select */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={toggleSortOrder}
          title={sortOrder === "desc" ? "降序" : "升序"}
        >
          <ArrowUpDown
            className={cn(
              "h-4 w-4 transition-transform",
              sortOrder === "asc" && "rotate-180"
            )}
          />
        </Button>

        {/* View Toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-none",
              view === "grid" && "bg-muted"
            )}
            onClick={() => handleViewChange("grid")}
            title="网格视图"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-none",
              view === "list" && "bg-muted"
            )}
            onClick={() => handleViewChange("list")}
            title="列表视图"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

