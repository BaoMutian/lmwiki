"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { ParsedModel } from "@/lib/db/models";

interface FamilyTimelineProps {
  models: ParsedModel[];
  currentSlug: string;
  familyName: string;
}

export function FamilyTimeline({ models, currentSlug, familyName }: FamilyTimelineProps) {
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
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {familyName} 家族
            <Badge variant="secondary" className="ml-2">
              {models.length} 个模型
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {models.map((model, index) => {
            const isCurrent = model.slug === currentSlug;
            return (
              <div key={model.slug} className="flex items-center">
                {/* Timeline Node */}
                <Link
                  href={`/models/${model.slug}`}
                  className={cn(
                    "shrink-0 w-56 p-4 rounded-xl border transition-all",
                    isCurrent
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 border-border/50 hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "font-semibold truncate",
                        isCurrent && "text-primary"
                      )}>
                        {model.shortName || model.name}
                      </h4>
                      {isCurrent && (
                        <Badge variant="default" className="shrink-0 text-xs">
                          当前
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {model.releaseDate || "未知日期"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {model.paramsTotal && (
                        <Badge variant="outline" className="text-xs">
                          {model.paramsTotal}B
                        </Badge>
                      )}
                      {model.branchType && (
                        <Badge variant="outline" className="text-xs">
                          {model.branchType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Connector Line */}
                {index < models.length - 1 && (
                  <div className="w-8 h-0.5 bg-border/50 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

