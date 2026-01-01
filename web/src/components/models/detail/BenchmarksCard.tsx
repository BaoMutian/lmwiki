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
} from "recharts";
import type { ParsedModel } from "@/lib/db/models";

interface BenchmarksCardProps {
  model: ParsedModel;
}

export function BenchmarksCard({ model }: BenchmarksCardProps) {
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
        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <div className="h-72 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeOpacity={0.15}
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis 
                  dataKey="benchmark" 
                  tick={{ 
                    fill: "hsl(var(--muted-foreground))", 
                    fontSize: 11,
                    fontWeight: 500
                  }}
                  tickLine={false}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                  tickCount={5}
                  axisLine={false}
                />
                <Radar
                  name={model.name}
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
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
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
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
