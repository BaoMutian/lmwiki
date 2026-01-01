"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
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

interface CompareBubbleChartProps {
  models: ParsedModel[];
  xAxis: { key: string; label: string };
  yAxis: { key: string; label: string };
  zAxis?: { key: string; label: string }; // 气泡大小
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      modelName: string;
      x: number;
      y: number;
      z: number;
      xLabel: string;
      yLabel: string;
      zLabel: string;
    };
  }>;
}

function GlassTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

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
      <p className="text-sm font-medium mb-1.5">{data.modelName}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{data.xLabel}:</span>
          <span className="font-semibold tabular-nums">
            {data.x?.toFixed(1) ?? "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{data.yLabel}:</span>
          <span className="font-semibold tabular-nums">
            {data.y?.toFixed(1) ?? "N/A"}
          </span>
        </div>
        {data.zLabel && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{data.zLabel}:</span>
            <span className="font-semibold tabular-nums">
              {data.z?.toFixed(1) ?? "N/A"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CompareBubbleChart({
  models,
  xAxis,
  yAxis,
  zAxis,
}: CompareBubbleChartProps) {
  // 为每个模型准备数据
  const scatterData = models.map((model, index) => {
    // 支持从 benchmarks 或模型直接属性中获取值
    const getVal = (key: string): number | null => {
      if (key in model.benchmarks) {
        return model.benchmarks[key];
      }
      // 特殊处理一些模型直接属性
      switch (key) {
        case "paramsTotal":
          return model.paramsTotal;
        case "contextWindow":
          return model.contextWindow;
        case "pricingInput":
          return model.pricingInput;
        case "pricingOutput":
          return model.pricingOutput;
        case "scoreArenaElo":
          return model.scoreArenaElo;
        default:
          return null;
      }
    };

    return {
      data: [
        {
          modelName: model.baseModelName || model.name,
          x: getVal(xAxis.key),
          y: getVal(yAxis.key),
          z: zAxis ? getVal(zAxis.key) : 50,
          xLabel: xAxis.label,
          yLabel: yAxis.label,
          zLabel: zAxis?.label || "",
        },
      ],
      color: CHART_COLORS[index % CHART_COLORS.length],
      name: model.baseModelName || model.name,
    };
  });

  // 过滤掉没有数据的模型
  const validData = scatterData.filter(
    (s) => s.data[0].x !== null && s.data[0].y !== null
  );

  if (validData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        所选指标暂无足够数据
      </div>
    );
  }

  return (
    <div className="h-96 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          style={{ outline: "none" }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700/50"
          />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxis.label}
            tick={{
              fontSize: 11,
              fill: "currentColor",
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
            className="text-gray-500 dark:text-gray-400"
            label={{
              value: xAxis.label,
              position: "bottom",
              offset: 0,
              style: {
                fontSize: 12,
                fill: "currentColor",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              },
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxis.label}
            tick={{
              fontSize: 11,
              fill: "currentColor",
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
            className="text-gray-500 dark:text-gray-400"
            label={{
              value: yAxis.label,
              angle: -90,
              position: "left",
              offset: 0,
              style: {
                fontSize: 12,
                fill: "currentColor",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              },
            }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 400]} />
          <Tooltip content={<GlassTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: 20,
              fontSize: 12,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          />
          {validData.map((scatter) => (
            <Scatter
              key={scatter.name}
              name={scatter.name}
              data={scatter.data}
              fill={scatter.color}
              fillOpacity={0.7}
              stroke={scatter.color}
              strokeWidth={2}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

