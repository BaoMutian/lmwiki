"use client";

import { cn } from "@/lib/utils";
import { ModelIcon } from "@/lib/icons";
import type { ParsedModel } from "@/lib/db/models";

interface CompareHeatmapProps {
  models: ParsedModel[];
  benchmarks: string[];
}

// 根据分数获取热力颜色
function getHeatColor(value: number | undefined, maxValue: number): string {
  if (value === undefined || value === null) {
    return "bg-muted/30";
  }

  const ratio = value / maxValue;
  
  if (ratio >= 0.9) return "bg-emerald-500/80 text-white";
  if (ratio >= 0.8) return "bg-emerald-400/70 text-white";
  if (ratio >= 0.7) return "bg-green-400/60 text-white";
  if (ratio >= 0.6) return "bg-lime-400/50 text-gray-900 dark:text-white";
  if (ratio >= 0.5) return "bg-yellow-400/50 text-gray-900 dark:text-white";
  if (ratio >= 0.4) return "bg-amber-400/50 text-gray-900 dark:text-white";
  if (ratio >= 0.3) return "bg-orange-400/50 text-gray-900 dark:text-white";
  return "bg-red-400/40 text-gray-900 dark:text-white";
}

export function CompareHeatmap({ models, benchmarks }: CompareHeatmapProps) {
  // 计算每个 benchmark 的最大值
  const maxValues: Record<string, number> = {};
  for (const benchmark of benchmarks) {
    const values = models
      .map((m) => m.benchmarks[benchmark])
      .filter((v): v is number => v !== undefined && v !== null);
    maxValues[benchmark] = values.length > 0 ? Math.max(...values) : 100;
  }

  if (benchmarks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        暂无 Benchmark 数据
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {/* 空白角落格 */}
            <th className="sticky left-0 z-10 bg-background p-3 text-left text-sm font-medium text-muted-foreground border-b border-r border-border/50">
              Benchmark
            </th>
            {/* 模型列头 */}
            {models.map((model) => (
              <th
                key={model.slug}
                className="p-3 text-center border-b border-border/50 min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <ModelIcon
                      name={model.name}
                      developer={model.developer}
                      family={model.family}
                      size={20}
                    />
                  </div>
                  <span className="text-xs font-medium line-clamp-2">
                    {model.baseModelName || model.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {benchmarks.map((benchmark) => (
            <tr key={benchmark} className="hover:bg-muted/20 transition-colors">
              {/* Benchmark 名称 */}
              <td className="sticky left-0 z-10 bg-background p-3 text-sm font-medium border-r border-b border-border/30">
                {benchmark}
              </td>
              {/* 分数格子 */}
              {models.map((model) => {
                const value = model.benchmarks[benchmark];
                const maxValue = maxValues[benchmark];
                const hasValue = value !== undefined && value !== null;

                return (
                  <td
                    key={`${model.slug}-${benchmark}`}
                    className="p-2 text-center border-b border-border/30"
                  >
                    <div
                      className={cn(
                        "inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg text-sm font-semibold tabular-nums transition-all",
                        getHeatColor(value, maxValue)
                      )}
                    >
                      {hasValue ? value.toFixed(1) : "-"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

