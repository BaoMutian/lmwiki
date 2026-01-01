"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { AggregatedModel } from "@/lib/db/models";

interface FamilyTimelineProps {
  models: AggregatedModel[];
  currentSlug: string;
  currentBaseModelName: string | null;
  familyName: string;
}

export function FamilyTimeline({ models, currentSlug, currentBaseModelName, familyName }: FamilyTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/5">
            <GitBranch className="h-4 w-4 text-violet-500" />
          </div>
          {familyName} 家族
          <Badge variant="secondary" className="ml-1 rounded-lg">
            {models.length} 个版本
          </Badge>
        </CardTitle>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
        >
          {models.map((model, index) => {
            // Check if this is the current model group (by baseModelName)
            const isCurrent = model.baseModelName 
              ? model.baseModelName === currentBaseModelName
              : model.slug === currentSlug;
            const hasVariants = model.variantCount > 1;
            const displayName = model.baseModelName || model.shortName || model.name;
            
            return (
              <div key={model.slug} className="flex items-center">
                {/* Timeline Node */}
                <Link
                  href={`/models/${model.slug}`}
                  className={cn(
                    "shrink-0 w-52 p-4 rounded-2xl transition-all duration-200",
                    "ring-1",
                    isCurrent
                      ? "bg-primary/10 ring-primary/50 shadow-lg shadow-primary/10"
                      : "bg-muted/30 ring-black/[0.03] dark:ring-white/[0.05] hover:ring-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn(
                        "font-semibold truncate text-sm",
                        isCurrent && "text-primary"
                      )}>
                        {displayName}
                      </h4>
                      {isCurrent && (
                        <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md">
                          当前
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {model.releaseDate || "未知日期"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {hasVariants && (
                        <Badge variant="secondary" className="text-[10px] rounded-md px-1.5 py-0.5 gap-0.5">
                          <Layers className="h-2.5 w-2.5" />
                          {model.variantCount}
                        </Badge>
                      )}
                      {model.paramsTotal && (
                        <Badge variant="outline" className="text-[10px] rounded-md px-1.5 py-0.5">
                          {model.paramsTotal}B
                        </Badge>
                      )}
                      {model.branchType && (
                        <Badge variant="outline" className="text-[10px] rounded-md px-1.5 py-0.5">
                          {model.branchType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Connector Line */}
                {index < models.length - 1 && (
                  <div className="w-6 h-0.5 bg-gradient-to-r from-border/60 to-border/30 shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
