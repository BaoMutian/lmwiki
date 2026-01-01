"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trophy } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { useId } from "react";
import type { ParsedModel } from "@/lib/db/models";

interface BenchmarksCardProps {
  model: ParsedModel;
}

// Apple-style colors
const APPLE_BLUE = "#007AFF";
const APPLE_BLUE_LIGHT = "#5AC8FA";
const APPLE_PURPLE = "#AF52DE";

// Custom Glassmorphism Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { benchmark: string } }>;
}

function GlassTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0];
  
  return (
    <div 
      className="
        px-3 py-1.5 rounded-xl
        bg-white/70 dark:bg-gray-900/70
        backdrop-blur-xl backdrop-saturate-150
        border border-white/20 dark:border-white/10
        shadow-lg shadow-black/5 dark:shadow-black/20
      "
    >
      <span 
        className="text-sm font-semibold tabular-nums"
        style={{ color: APPLE_BLUE }}
      >
        {data.value.toFixed(1)}
      </span>
    </div>
  );
}

export function BenchmarksCard({ model }: BenchmarksCardProps) {
  const gradientId = useId();
  const benchmarkEntries = Object.entries(model.benchmarks);
  
  // Select key benchmarks for radar chart (max 8)
  const keyBenchmarks = [
    "MMLU-Pro",
    "GPQA",
    "LiveCodeBench",
    "AIME 2025",
    "AA Intelligence Index",
    "AA Coding Index",
    "AA Math Index",
    "HLE",
  ];
  
  const radarData = keyBenchmarks
    .filter((name) => model.benchmarks[name] !== undefined)
    .map((name) => ({
      benchmark: name.replace("AA ", "").replace(" Index", ""),
      value: model.benchmarks[name],
      fullMark: 100,
    }));

  // All benchmarks sorted by value
  const sortedBenchmarks = benchmarkEntries.sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/5">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </div>
          评测基准
        </CardTitle>
        {model.scoreArenaElo && (
          <Badge 
            variant="outline" 
            className="gap-1.5 rounded-lg px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          >
            <Trophy className="h-3.5 w-3.5" />
            Arena Elo: {model.scoreArenaElo}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Apple-styled Radar Chart */}
        {radarData.length >= 3 && (
          <div className="h-80 -mx-4 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                data={radarData} 
                margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                // Remove focus outline/border
                style={{ outline: 'none' }}
              >
                {/* SVG Definitions for gradients */}
                <defs>
                  {/* Blue to Purple gradient fill */}
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={APPLE_BLUE} stopOpacity={0.5} />
                    <stop offset="50%" stopColor={APPLE_BLUE_LIGHT} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={APPLE_PURPLE} stopOpacity={0.35} />
                  </linearGradient>
                  
                  {/* Brighter stroke gradient */}
                  <linearGradient id={`${gradientId}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={APPLE_BLUE_LIGHT} />
                    <stop offset="100%" stopColor={APPLE_PURPLE} />
                  </linearGradient>
                </defs>

                {/* Polar Grid - Ultra subtle */}
                <PolarGrid 
                  gridType="polygon"
                  stroke="currentColor"
                  className="text-gray-200 dark:text-gray-700/50"
                  strokeWidth={0.5}
                />
                
                {/* Angle Axis - Benchmark labels */}
                <PolarAngleAxis 
                  dataKey="benchmark"
                  tick={({ payload, x, y, cx, cy }) => {
                    // Calculate angle for text positioning
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
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
                        }}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                
                {/* Radius Axis - Score scale */}
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
                
                {/* Custom Glassmorphism Tooltip */}
                <Tooltip 
                  content={<GlassTooltip />}
                  cursor={false}
                  wrapperStyle={{ outline: 'none' }}
                />
                
                {/* Main Radar Area */}
                <Radar
                  name={model.name}
                  dataKey="value"
                  stroke={`url(#${gradientId}-stroke)`}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="dark:drop-shadow-[0_0_8px_rgba(0,122,255,0.5)] [&:focus]:outline-none"
                  // No default dots - cleaner look
                  dot={false}
                  // Only show dot on hover with glow effect
                  activeDot={{
                    r: 5,
                    fill: APPLE_BLUE,
                    stroke: "#fff",
                    strokeWidth: 2,
                    style: {
                      filter: 'drop-shadow(0 2px 4px rgba(0, 122, 255, 0.4))',
                    },
                    className: "dark:stroke-gray-800",
                  }}
                  // Remove focus rectangle
                  style={{ outline: 'none' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Benchmark List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {sortedBenchmarks.map(([name, value]) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30 ring-1 ring-black/[0.02] dark:ring-white/[0.04]"
            >
              <span className="text-sm font-medium truncate mr-3">{name}</span>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(value, 100)}%`,
                      background: `linear-gradient(90deg, ${APPLE_BLUE} 0%, ${APPLE_PURPLE} 100%)`
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-10 text-right tabular-nums">
                  {value.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
