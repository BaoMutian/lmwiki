"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function BenchmarksSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero Section Skeleton */}
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Benchmark Selector */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        
        {/* Toggle */}
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border/50 bg-muted/30">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-48" />
            <div className="flex-1" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-border/30 last:border-b-0"
            >
              {/* Checkbox */}
              <Skeleton className="h-5 w-5 rounded" />
              
              {/* Rank */}
              <Skeleton className="h-6 w-8 rounded-md" />
              
              {/* Model Info */}
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-24 rounded-full" />
                <Skeleton className="h-5 w-14" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CompareSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-5 w-72 mx-auto" />
      </div>

      {/* Model Cards Row */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="shrink-0 w-48 border-border/50">
            <CardContent className="p-4 text-center">
              <Skeleton className="h-12 w-12 rounded-xl mx-auto mb-3" />
              <Skeleton className="h-5 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Tabs Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center gap-4 p-4 border-b border-border/50 bg-muted/30">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-24 flex-1" />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-border/30 last:border-b-0"
            >
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex-1 flex items-center gap-2">
                  <Skeleton className="h-2 w-full max-w-20 rounded-full" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

