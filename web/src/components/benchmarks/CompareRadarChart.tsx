"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { useId, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParsedModel } from "@/lib/db/models";

// Apple 风格颜色
const CHART_COLORS = [
  { main: "#007AFF", light: "#5AC8FA" }, // Blue
  { main: "#AF52DE", light: "#DA8FFF" }, // Purple
  { main: "#FF9500", light: "#FFCC00" }, // Orange
  { main: "#34C759", light: "#7AE87A" }, // Green
  { main: "#FF3B30", light: "#FF6961" }, // Red
];

interface CompareRadarChartProps {
  models: ParsedModel[];
  benchmarks: string[]; // 要显示的 Benchmark 列表
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: { benchmark: string };
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
        {payload[0].payload.benchmark}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold tabular-nums">{entry.value?.toFixed(1) ?? "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareRadarChart({ models, benchmarks }: CompareRadarChartProps) {
  const gradientId = useId();
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 缩放控制
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 转换数据格式
  const data = benchmarks.map((benchmark) => {
    const entry: Record<string, string | number | null> = {
      benchmark: benchmark.replace("AA ", "").replace(" Index", ""),
    };
    
    models.forEach((model) => {
      entry[model.slug] = model.benchmarks[benchmark] ?? null;
    });
    
    return entry;
  });

  if (benchmarks.length < 3) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        需要至少 3 个共有 Benchmark 才能显示雷达图
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 缩放控制栏 */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 p-1 rounded-lg bg-muted/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium w-12 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleReset}
          disabled={scale === 1 && offset.x === 0 && offset.y === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* 图表容器 */}
      <div
        className={cn(
          "h-96 select-none overflow-hidden",
          scale > 1 && "cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            width: "100%",
            height: "100%",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={data}
              margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
              style={{ outline: "none" }}
            >
              {/* Gradients */}
              <defs>
                {models.map((model, index) => {
                  const colors = CHART_COLORS[index % CHART_COLORS.length];
                  return (
                    <linearGradient
                      key={model.slug}
                      id={`${gradientId}-${model.slug}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={colors.main} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={colors.light} stopOpacity={0.3} />
                    </linearGradient>
                  );
                })}
              </defs>

              <PolarGrid
                gridType="polygon"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700/50"
                strokeWidth={0.5}
              />

              <PolarAngleAxis
                dataKey="benchmark"
                tick={({ payload, x, y, cx, cy }) => {
                  const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                  const angle = Math.atan2(y - cy, x - cx);
                  const textX = cx + (radius + 12) * Math.cos(angle);
                  const textY = cy + (radius + 12) * Math.sin(angle);

                  return (
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-500 dark:fill-gray-400"
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}
                    >
                      {payload.value}
                    </text>
                  );
                }}
                tickLine={false}
                axisLine={false}
              />

              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fontSize: 9,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
                className="[&_text]:fill-gray-400 dark:[&_text]:fill-gray-500"
                tickCount={5}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<GlassTooltip />} cursor={false} />

              <Legend
                wrapperStyle={{
                  paddingTop: 20,
                  fontSize: 12,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
              />

              {models.map((model, index) => {
                const colors = CHART_COLORS[index % CHART_COLORS.length];
                return (
                  <Radar
                    key={model.slug}
                    name={model.baseModelName || model.name}
                    dataKey={model.slug}
                    stroke={colors.main}
                    fill={`url(#${gradientId}-${model.slug})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: colors.main,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
