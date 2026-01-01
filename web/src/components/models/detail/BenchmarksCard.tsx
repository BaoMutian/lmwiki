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
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          评测基准
          {model.scoreArenaElo && (
            <Badge variant="outline" className="ml-2 gap-1">
              <Trophy className="h-3 w-3" />
              Arena Elo: {model.scoreArenaElo}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeOpacity={0.2}
                />
                <PolarAngleAxis 
                  dataKey="benchmark" 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Radar
                  name={model.name}
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Benchmark List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedBenchmarks.map(([name, value]) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <span className="text-sm font-medium truncate mr-2">{name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-12 text-right">
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

