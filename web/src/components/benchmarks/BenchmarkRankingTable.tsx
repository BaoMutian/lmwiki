"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ModelIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Layers, Trophy, Medal, Award, Lock, Unlock } from "lucide-react";
import type { RankedModel } from "@/lib/db/benchmarks";
import Link from "next/link";

interface BenchmarkRankingTableProps {
  models: RankedModel[];
  benchmark: string;
  selectedSlugs: string[];
  onSelectionChange: (slugs: string[]) => void;
  maxScore?: number;
  maxSelection?: number;
}

// Apple 风格的颜色渐变
const SCORE_COLORS = {
  high: "from-emerald-500 to-green-400",
  medium: "from-blue-500 to-cyan-400",
  low: "from-amber-500 to-yellow-400",
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-amber-500" />;
    case 2:
      return <Medal className="h-4 w-4 text-gray-400" />;
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />;
    default:
      return null;
  }
}

function getScoreColorClass(score: number, maxScore: number): string {
  const ratio = score / maxScore;
  if (ratio >= 0.9) return SCORE_COLORS.high;
  if (ratio >= 0.7) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

export function BenchmarkRankingTable({
  models,
  benchmark,
  selectedSlugs,
  onSelectionChange,
  maxScore,
  maxSelection = 7,
}: BenchmarkRankingTableProps) {
  const computedMaxScore = maxScore || Math.max(...models.map((m) => m.score || 0), 100);
  const isAtLimit = selectedSlugs.length >= maxSelection;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 只选择前 maxSelection 个
      onSelectionChange(models.slice(0, maxSelection).map((m) => m.slug));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (slug: string, checked: boolean) => {
    if (checked) {
      // 检查是否已达上限
      if (selectedSlugs.length >= maxSelection) {
        return; // 不允许继续选择
      }
      onSelectionChange([...selectedSlugs, slug]);
    } else {
      onSelectionChange(selectedSlugs.filter((s) => s !== slug));
    }
  };

  const allSelected = models.length > 0 && selectedSlugs.length === Math.min(models.length, maxSelection);
  const someSelected = selectedSlugs.length > 0 && selectedSlugs.length < Math.min(models.length, maxSelection);

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
              aria-label="全选"
            />
          </div>
          <div className="w-12 text-sm font-medium text-muted-foreground text-center">
            排名
          </div>
          <div className="flex-1 text-sm font-medium text-muted-foreground">
            模型
          </div>
          <div className="w-48 text-sm font-medium text-muted-foreground text-right">
            {benchmark}
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/30">
          {models.map((model) => {
            const isSelected = selectedSlugs.includes(model.slug);
            const isOpen = model.modelType === "open";
            const hasVariants = model.variantCount > 1;

            return (
              <div
                key={model.slug}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-colors duration-200",
                  "hover:bg-muted/30",
                  isSelected && "bg-primary/5"
                )}
              >
                {/* Checkbox */}
                <div className="w-10">
                  <Checkbox
                    checked={isSelected}
                    disabled={!isSelected && isAtLimit}
                    onCheckedChange={(checked) =>
                      handleSelectOne(model.slug, checked as boolean)
                    }
                    aria-label={`选择 ${model.name}`}
                  />
                </div>

                {/* Rank */}
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(model.rank) || (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold",
                        model.rank <= 10
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {model.rank}
                    </span>
                  )}
                </div>

                {/* Model Info */}
                <Link
                  href={`/models/${model.slug}`}
                  className="flex-1 flex items-center gap-3 group min-w-0"
                >
                  {/* Icon */}
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    <ModelIcon
                      name={model.name}
                      developer={model.developer}
                      family={model.family}
                      size={24}
                      className="text-foreground"
                    />
                  </div>

                  {/* Name & Developer */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate group-hover:text-primary transition-colors">
                        {/* 聚合模式显示 baseModelName，展开模式显示完整 name */}
                        {hasVariants ? (model.baseModelName || model.name) : model.name}
                      </span>
                      {hasVariants && (
                        <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                          <Layers className="h-3 w-3" />
                          {model.variantCount}
                        </Badge>
                      )}
                      {isOpen ? (
                        <Unlock className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {model.developer}
                    </p>
                  </div>
                </Link>

                {/* Score */}
                <div className="w-48 flex items-center gap-3 justify-end">
                  {model.score !== null ? (
                    <>
                      {/* Progress Bar */}
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                            getScoreColorClass(model.score, computedMaxScore)
                          )}
                          style={{
                            width: `${Math.min((model.score / computedMaxScore) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      {/* Score Value */}
                      <span className="font-semibold tabular-nums w-14 text-right">
                        {model.score.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {models.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  );
}

