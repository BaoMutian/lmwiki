"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useRef, useEffect } from "react";
import type { BenchmarkInfo } from "@/lib/db/benchmarks";

interface BenchmarkSelectorProps {
  benchmarks: BenchmarkInfo[];
  selected: string;
  onSelect: (benchmark: string) => void;
}

export function BenchmarkSelector({
  benchmarks,
  selected,
  onSelect,
}: BenchmarkSelectorProps) {
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredBenchmarks = useMemo(() => {
    if (!search.trim()) return benchmarks;
    const query = search.toLowerCase();
    return benchmarks.filter((b) => b.name.toLowerCase().includes(query));
  }, [benchmarks, search]);

  // 显示前 8 个 + 其余折叠
  const displayBenchmarks = filteredBenchmarks.slice(0, 8);
  const hasMore = filteredBenchmarks.length > 8;

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 点击"更多"聚焦到搜索框并打开下拉
  const handleMoreClick = () => {
    inputRef.current?.focus();
    setIsDropdownOpen(true);
  };

  // 选择 benchmark
  const handleSelect = (name: string) => {
    onSelect(name);
    setIsDropdownOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-3">
      {/* 搜索框 + 下拉框 */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="搜索 Benchmark..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="pl-10 pr-8 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
        />
        {search ? (
          <button
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
              isDropdownOpen && "rotate-180"
            )}
          />
        )}

        {/* 下拉框 */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border/50 bg-popover shadow-lg z-50 scrollbar-thin"
          >
            {filteredBenchmarks.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                未找到匹配的 Benchmark
              </div>
            ) : (
              <div className="py-1">
                {filteredBenchmarks.map((benchmark) => (
                  <button
                    key={benchmark.name}
                    onClick={() => handleSelect(benchmark.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors",
                      "hover:bg-muted/50",
                      selected === benchmark.name && "bg-primary/10 text-primary"
                    )}
                  >
                    <span className="truncate">{benchmark.name}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 shrink-0 ml-2">
                      {benchmark.modelCount}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Benchmark 按钮列表 */}
      <div className="flex flex-wrap gap-2">
        {displayBenchmarks.map((benchmark) => (
          <button
            key={benchmark.name}
            onClick={() => onSelect(benchmark.name)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              "border hover:shadow-sm",
              selected === benchmark.name
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card border-border/50 text-foreground hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <span className="truncate max-w-[120px]">{benchmark.name}</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1.5 py-0 h-5",
                selected === benchmark.name
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {benchmark.modelCount}
            </Badge>
          </button>
        ))}

        {hasMore && (
          <button
            onClick={handleMoreClick}
            className="inline-flex items-center px-3 py-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            +{filteredBenchmarks.length - 8} 更多
          </button>
        )}
      </div>
    </div>
  );
}
