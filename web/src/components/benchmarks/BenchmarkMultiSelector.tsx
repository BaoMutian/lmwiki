"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  CheckCheck,
  XCircle,
  ListFilter,
} from "lucide-react";

interface BenchmarkMultiSelectorProps {
  allBenchmarks: string[];
  commonBenchmarks: string[];
  selectedBenchmarks: string[];
  onSelectionChange: (benchmarks: string[]) => void;
}

type PresetMode = "all" | "common" | "custom";

export function BenchmarkMultiSelector({
  allBenchmarks,
  commonBenchmarks,
  selectedBenchmarks,
  onSelectionChange,
}: BenchmarkMultiSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // 判断当前是哪种预设模式
  const currentMode: PresetMode = useMemo(() => {
    if (selectedBenchmarks.length === allBenchmarks.length) {
      const isSameAsAll = allBenchmarks.every((b) =>
        selectedBenchmarks.includes(b)
      );
      if (isSameAsAll) return "all";
    }
    if (selectedBenchmarks.length === commonBenchmarks.length) {
      const isSameAsCommon = commonBenchmarks.every((b) =>
        selectedBenchmarks.includes(b)
      );
      if (isSameAsCommon) return "common";
    }
    return "custom";
  }, [selectedBenchmarks, allBenchmarks, commonBenchmarks]);

  // 搜索过滤
  const filteredBenchmarks = useMemo(() => {
    if (!search) return allBenchmarks;
    const lower = search.toLowerCase();
    return allBenchmarks.filter((b) => b.toLowerCase().includes(lower));
  }, [allBenchmarks, search]);

  // 切换单个 benchmark
  const handleToggle = (benchmark: string) => {
    if (selectedBenchmarks.includes(benchmark)) {
      onSelectionChange(selectedBenchmarks.filter((b) => b !== benchmark));
    } else {
      onSelectionChange([...selectedBenchmarks, benchmark]);
    }
  };

  // 预设选择
  const handleSelectAll = () => {
    onSelectionChange([...allBenchmarks]);
  };

  const handleSelectCommon = () => {
    onSelectionChange([...commonBenchmarks]);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // 全选/取消搜索结果
  const handleToggleFiltered = () => {
    const allSelected = filteredBenchmarks.every((b) =>
      selectedBenchmarks.includes(b)
    );
    if (allSelected) {
      // 取消选择过滤结果
      onSelectionChange(
        selectedBenchmarks.filter((b) => !filteredBenchmarks.includes(b))
      );
    } else {
      // 选择所有过滤结果
      const newSelection = new Set([
        ...selectedBenchmarks,
        ...filteredBenchmarks,
      ]);
      onSelectionChange([...newSelection]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* 预设按钮 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground shrink-0">快速选择：</span>
        <div className="flex items-center gap-1.5">
          <Button
            variant={currentMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={handleSelectAll}
            className="h-8 text-xs"
          >
            全部 ({allBenchmarks.length})
          </Button>
          <Button
            variant={currentMode === "common" ? "default" : "outline"}
            size="sm"
            onClick={handleSelectCommon}
            className="h-8 text-xs"
            disabled={commonBenchmarks.length === 0}
          >
            仅共有 ({commonBenchmarks.length})
          </Button>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="hidden sm:block w-px h-6 bg-border" />

      {/* 自定义选择器 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={currentMode === "custom" ? "default" : "outline"}
            size="sm"
            className="h-8 gap-2 text-xs"
          >
            <ListFilter className="h-3.5 w-3.5" />
            自定义选择
            <Badge
              variant="secondary"
              className={cn(
                "ml-1 h-5 px-1.5 text-[10px]",
                currentMode === "custom" && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {selectedBenchmarks.length}
            </Badge>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <CommandInput
                placeholder="搜索 Benchmark..."
                value={search}
                onValueChange={setSearch}
                className="border-0 focus:ring-0"
              />
            </div>

            {/* 快捷操作栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFiltered}
                  className="h-7 text-xs px-2"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  {filteredBenchmarks.every((b) =>
                    selectedBenchmarks.includes(b)
                  )
                    ? "取消全选"
                    : "全选当前"}
                </Button>
              </div>
              {selectedBenchmarks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  清空
                </Button>
              )}
            </div>

            <CommandList className="max-h-64">
              <CommandEmpty>未找到匹配的 Benchmark</CommandEmpty>
              <CommandGroup>
                {filteredBenchmarks.map((benchmark) => {
                  const isSelected = selectedBenchmarks.includes(benchmark);
                  const isCommon = commonBenchmarks.includes(benchmark);

                  return (
                    <CommandItem
                      key={benchmark}
                      value={benchmark}
                      onSelect={() => handleToggle(benchmark)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
                        <span className="flex-1 truncate">{benchmark}</span>
                        {isCommon && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 shrink-0"
                          >
                            共有
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {/* 底部确认栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
              <span className="text-xs text-muted-foreground">
                已选择 {selectedBenchmarks.length} / {allBenchmarks.length} 项
              </span>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOpen(false)}
              >
                确定
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 已选择标签（仅在自定义模式且数量较少时显示） */}
      {currentMode === "custom" && selectedBenchmarks.length <= 5 && selectedBenchmarks.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedBenchmarks.slice(0, 3).map((benchmark) => (
            <Badge
              key={benchmark}
              variant="secondary"
              className="text-xs py-0 h-6 gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleToggle(benchmark)}
            >
              {benchmark.length > 15
                ? benchmark.slice(0, 12) + "..."
                : benchmark}
              <XCircle className="h-3 w-3 opacity-50 hover:opacity-100" />
            </Badge>
          ))}
          {selectedBenchmarks.length > 3 && (
            <Badge variant="outline" className="text-xs py-0 h-6">
              +{selectedBenchmarks.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

