"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  searchParams: {
    type?: string;
    family?: string;
    developer?: string;
    architecture?: string;
    vision?: string;
    reasoning?: string;
    toolUse?: string;
  };
}

interface FilterOptions {
  families: string[];
  developers: string[];
  architectures: string[];
}

export function FilterSidebar({ searchParams }: FilterSidebarProps) {
  const router = useRouter();
  const [options, setOptions] = useState<FilterOptions>({
    families: [],
    developers: [],
    architectures: [],
  });
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    capabilities: true,
    family: false,
    developer: false,
    architecture: false,
  });

  // Fetch filter options
  useEffect(() => {
    fetch("/api/filters")
      .then((res) => res.json())
      .then((data) => {
        // Validate response structure
        if (data && data.families && data.developers && data.architectures) {
          setOptions(data);
        }
      })
      .catch(console.error);
  }, []);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`/?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.type ? "" : new URLSearchParams(window.location.search).get("search");
    if (search) params.set("search", search);
    router.push(`/?${params.toString()}`);
  };

  const activeFilters = Object.entries(searchParams).filter(
    ([key, value]) => value && key !== "sort" && key !== "order" && key !== "view" && key !== "page"
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>筛选条件</span>
        </div>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            清除全部
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter(key, null)}
            >
              {value}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Model Type Filter */}
      <FilterSection
        title="模型类型"
        expanded={expandedSections.type}
        onToggle={() => toggleSection("type")}
      >
        <div className="space-y-2">
          <FilterCheckbox
            label="开源模型"
            checked={searchParams.type === "open"}
            onCheckedChange={(checked) =>
              updateFilter("type", checked ? "open" : null)
            }
          />
          <FilterCheckbox
            label="闭源模型"
            checked={searchParams.type === "closed"}
            onCheckedChange={(checked) =>
              updateFilter("type", checked ? "closed" : null)
            }
          />
        </div>
      </FilterSection>

      <Separator />

      {/* Capabilities Filter */}
      <FilterSection
        title="模型能力"
        expanded={expandedSections.capabilities}
        onToggle={() => toggleSection("capabilities")}
      >
        <div className="space-y-2">
          <FilterCheckbox
            label="视觉理解"
            checked={searchParams.vision === "true"}
            onCheckedChange={(checked) =>
              updateFilter("vision", checked ? "true" : null)
            }
          />
          <FilterCheckbox
            label="推理/思考"
            checked={searchParams.reasoning === "true"}
            onCheckedChange={(checked) =>
              updateFilter("reasoning", checked ? "true" : null)
            }
          />
          <FilterCheckbox
            label="工具调用"
            checked={searchParams.toolUse === "true"}
            onCheckedChange={(checked) =>
              updateFilter("toolUse", checked ? "true" : null)
            }
          />
        </div>
      </FilterSection>

      <Separator />

      {/* Family Filter */}
      <FilterSection
        title="模型家族"
        expanded={expandedSections.family}
        onToggle={() => toggleSection("family")}
        count={options.families.length}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {options.families.slice(0, 15).map((family) => (
            <FilterCheckbox
              key={family}
              label={family}
              checked={searchParams.family === family}
              onCheckedChange={(checked) =>
                updateFilter("family", checked ? family : null)
              }
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Developer Filter */}
      <FilterSection
        title="开发者"
        expanded={expandedSections.developer}
        onToggle={() => toggleSection("developer")}
        count={options.developers.length}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {options.developers.slice(0, 15).map((developer) => (
            <FilterCheckbox
              key={developer}
              label={developer}
              checked={searchParams.developer === developer}
              onCheckedChange={(checked) =>
                updateFilter("developer", checked ? developer : null)
              }
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Architecture Filter */}
      <FilterSection
        title="架构类型"
        expanded={expandedSections.architecture}
        onToggle={() => toggleSection("architecture")}
      >
        <div className="space-y-2">
          {options.architectures.map((arch) => (
            <FilterCheckbox
              key={arch}
              label={arch}
              checked={searchParams.architecture === arch}
              onCheckedChange={(checked) =>
                updateFilter("architecture", checked ? arch : null)
              }
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// Filter Section Component
function FilterSection({
  title,
  expanded,
  onToggle,
  count,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className="text-xs text-muted-foreground">({count})</span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Filter Checkbox Component
function FilterCheckbox({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor={label}
        className="text-sm font-normal text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}

