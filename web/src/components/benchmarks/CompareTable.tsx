"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModelIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { X, Info } from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";
import Link from "next/link";

interface CompareTableProps {
  models: ParsedModel[];
  benchmarks: string[];
  onRemoveModel?: (slug: string) => void;
}

// 获取分数进度条颜色
function getProgressColor(ratio: number): string {
  if (ratio >= 0.9) return "from-emerald-500 to-green-400";
  if (ratio >= 0.7) return "from-blue-500 to-cyan-400";
  if (ratio >= 0.5) return "from-amber-500 to-yellow-400";
  return "from-orange-500 to-red-400";
}

export function CompareTable({
  models,
  benchmarks,
  onRemoveModel,
}: CompareTableProps) {
  // 计算每个 benchmark 的最大值和哪个模型获得最高分
  const benchmarkStats: Record<
    string,
    { max: number; bestSlug: string | null }
  > = {};

  for (const benchmark of benchmarks) {
    let max = 0;
    let bestSlug: string | null = null;

    for (const model of models) {
      const value = model.benchmarks[benchmark];
      if (value !== undefined && value !== null && value > max) {
        max = value;
        bestSlug = model.slug;
      }
    }

    benchmarkStats[benchmark] = { max: max || 100, bestSlug };
  }

  if (models.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>请选择要对比的模型</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">详细对比</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {/* Benchmark 列头 */}
                <th className="sticky left-0 z-10 bg-muted/30 backdrop-blur-sm p-4 text-left text-sm font-medium text-muted-foreground min-w-[180px]">
                  Benchmark
                </th>
                {/* 模型列头 */}
                {models.map((model) => (
                  <th
                    key={model.slug}
                    className="p-4 text-center min-w-[160px]"
                  >
                    <div className="flex flex-col items-center gap-2 relative">
                      {/* 删除按钮 */}
                      {onRemoveModel && (
                        <button
                          onClick={() => onRemoveModel(model.slug)}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          aria-label={`移除 ${model.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      {/* 模型图标 */}
                      <Link
                        href={`/models/${model.slug}`}
                        className="group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <ModelIcon
                            name={model.name}
                            developer={model.developer}
                            family={model.family}
                            size={24}
                          />
                        </div>
                      </Link>
                      {/* 模型名称 */}
                      <Link
                        href={`/models/${model.slug}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-2 text-center"
                      >
                        {model.baseModelName || model.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {model.developer}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {benchmarks.map((benchmark) => {
                const stats = benchmarkStats[benchmark];

                return (
                  <tr
                    key={benchmark}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Benchmark 名称 */}
                    <td className="sticky left-0 z-10 bg-background p-4 text-sm font-medium">
                      <span className="truncate block max-w-[160px]">
                        {benchmark}
                      </span>
                    </td>
                    {/* 各模型分数 */}
                    {models.map((model) => {
                      const value = model.benchmarks[benchmark];
                      const hasValue = value !== undefined && value !== null;
                      const isBest = model.slug === stats.bestSlug;
                      const ratio = hasValue ? value / stats.max : 0;

                      return (
                        <td
                          key={`${model.slug}-${benchmark}`}
                          className={cn(
                            "p-4 text-center",
                            isBest && "bg-emerald-500/5"
                          )}
                        >
                          {hasValue ? (
                            <div className="flex flex-col items-center gap-2">
                              {/* 分数值 */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "font-semibold tabular-nums",
                                    isBest && "text-emerald-600 dark:text-emerald-400"
                                  )}
                                >
                                  {value.toFixed(1)}
                                </span>
                                {isBest && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  >
                                    最高
                                  </Badge>
                                )}
                              </div>
                              {/* 进度条 */}
                              <div className="w-full max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                                    getProgressColor(ratio)
                                  )}
                                  style={{ width: `${ratio * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 无数据提示 */}
        {benchmarks.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>所选模型没有共同的 Benchmark 数据</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

