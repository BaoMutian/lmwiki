"use client";

import { cn } from "@/lib/utils";
import { Layers, LayoutList } from "lucide-react";

interface VariantToggleProps {
  aggregated: boolean;
  onToggle: (aggregated: boolean) => void;
}

export function VariantToggle({ aggregated, onToggle }: VariantToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
      <button
        onClick={() => onToggle(true)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          aggregated
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">聚合变体</span>
      </button>
      <button
        onClick={() => onToggle(false)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          !aggregated
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">展开全部</span>
      </button>
    </div>
  );
}

