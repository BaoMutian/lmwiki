"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { ParsedModel } from "@/lib/db/models";

// Apple 风格颜色
const CHART_COLORS = [
  "#007AFF", // Blue
  "#AF52DE", // Purple
  "#FF9500", // Orange
  "#34C759", // Green
  "#FF3B30", // Red
];

interface CompareLineChartProps {
  models: ParsedModel[];
  benchmarks: string[];
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
        {payload
          .filter((entry) => entry.value !== null && entry.value !== undefined)
          .map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold tabular-nums">
                {entry.value?.toFixed(1)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function CompareLineChart({ models, benchmarks }: CompareLineChartProps) {
  // 转换数据格式 - 每个 benchmark 作为一个数据点
  const data = benchmarks.map((benchmark) => {
    const entry: Record<string, string | number | null> = {
      name: benchmark.replace("AA ", "").replace(" Index", ""),
    };

    models.forEach((model) => {
      entry[model.slug] = model.benchmarks[benchmark] ?? null;
    });

    return entry;
  });

  if (benchmarks.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        暂无 Benchmark 数据
      </div>
    );
  }

  return (
    <div className="h-96 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Tooltip content={<GlassTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: 20,
              fontSize: 12,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          />
          {models.map((model, index) => (
            <Line
              key={model.slug}
              type="monotone"
              dataKey={model.slug}
              name={model.baseModelName || model.name}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{
                fill: CHART_COLORS[index % CHART_COLORS.length],
                strokeWidth: 2,
                stroke: "#fff",
                r: 4,
              }}
              activeDot={{
                r: 6,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

