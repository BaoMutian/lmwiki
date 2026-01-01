"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from "recharts";
import { useState } from "react";
import type { ParsedModel } from "@/lib/db/models";
import { CustomLegend } from "./CustomLegend";

// Apple 风格颜色
const CHART_COLORS = [
  "#007AFF", // Blue
  "#AF52DE", // Purple
  "#FF9500", // Orange
  "#34C759", // Green
  "#FF3B30", // Red
];

interface CompareBarChartProps {
  models: ParsedModel[];
  benchmarks: string[];
  selectedBenchmark?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: { name: string };
  }>;
}

function GlassTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="
        px-3 py-2 rounded-xl
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-xl backdrop-saturate-150
        border border-white/20 dark:border-white/10
        shadow-lg shadow-black/5 dark:shadow-black/20
      "
    >
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {payload[0].payload.name}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold tabular-nums">
              {entry.value?.toFixed(1) ?? "N/A"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareBarChart({
  models,
  benchmarks,
  selectedBenchmark,
}: CompareBarChartProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // 如果选择了单个 benchmark，显示各模型在该 benchmark 上的对比
  if (selectedBenchmark) {
    const data = models.map((model, index) => ({
      name: model.baseModelName || model.name,
      value: model.benchmarks[selectedBenchmark] ?? null,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    return (
      <div className="h-96 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            style={{ outline: "none" }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700/50"
            />
            <XAxis
              dataKey="name"
              tick={{
                fontSize: 11,
                fill: "currentColor",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
              className="text-gray-500 dark:text-gray-400"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{
                fontSize: 11,
                fill: "currentColor",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: "transparent" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 多 benchmark 分组柱状图
  const data = benchmarks.slice(0, 8).map((benchmark) => {
    const entry: Record<string, string | number | null> = {
      name: benchmark.replace("AA ", "").replace(" Index", ""),
    };

    models.forEach((model) => {
      entry[model.slug] = model.benchmarks[benchmark] ?? null;
    });

    return entry;
  });

  return (
    <div className="h-96 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          style={{ outline: "none" }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700/50"
          />
          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fill: "currentColor",
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
            className="text-gray-500 dark:text-gray-400"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{
              fontSize: 11,
              fill: "currentColor",
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
            className="text-gray-500 dark:text-gray-400"
          />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: "transparent" }} />
          <Legend
            content={
              <CustomLegend
                activeDataKey={activeSlug}
                onHover={setActiveSlug}
              />
            }
            wrapperStyle={{
              paddingTop: 24,
            }}
          />
          {models.map((model, index) => {
            const isActive = activeSlug === null || activeSlug === model.slug;
            return (
              <Bar
                key={model.slug}
                dataKey={model.slug}
                name={model.baseModelName || model.name}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={isActive ? 1 : 0.15}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                style={{
                  transition: "fill-opacity 0.2s",
                }}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

