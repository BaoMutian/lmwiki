"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelIcon } from "@/lib/icons";
import { CompareSkeleton } from "@/components/benchmarks/BenchmarksSkeleton";
import { CompareTable } from "@/components/benchmarks/CompareTable";
import { CompareRadarChart } from "@/components/benchmarks/CompareRadarChart";
import { CompareBarChart } from "@/components/benchmarks/CompareBarChart";
import { CompareLineChart } from "@/components/benchmarks/CompareLineChart";
import { CompareBubbleChart } from "@/components/benchmarks/CompareBubbleChart";
import { CompareHeatmap } from "@/components/benchmarks/CompareHeatmap";
import { BenchmarkMultiSelector } from "@/components/benchmarks/BenchmarkMultiSelector";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  GitCompare,
  Radar,
  BarChart3,
  LineChart,
  Circle,
  Grid3X3,
  X,
  Info,
  Share2,
  Filter,
} from "lucide-react";
import type { CompareResult } from "@/lib/db/benchmarks";

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>([]);
  const [chartTab, setChartTab] = useState("radar");

  // URL 参数
  const slugsParam = searchParams.get("slugs") || "";
  const slugs = slugsParam.split(",").filter(Boolean);

  // 获取数据
  const fetchData = useCallback(async () => {
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/benchmarks/compare?slugs=${slugs.join(",")}`
      );
      if (!response.ok) throw new Error("Failed to fetch");

      const result: CompareResult = await response.json();
      setData(result);
      // 初始化选择：如果共有 benchmarks 足够多则选择共有，否则选择全部
      if (result.commonBenchmarks.length >= 3) {
        setSelectedBenchmarks(result.commonBenchmarks);
      } else {
        setSelectedBenchmarks(result.allBenchmarks);
      }
    } catch (error) {
      console.error("Error fetching compare data:", error);
    } finally {
      setLoading(false);
    }
  }, [slugs.join(",")]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 移除模型
  const handleRemoveModel = (slug: string) => {
    const newSlugs = slugs.filter((s) => s !== slug);
    if (newSlugs.length >= 1) {
      router.push(`/benchmarks/compare?slugs=${newSlugs.join(",")}`);
    } else {
      router.push("/benchmarks");
    }
  };

  // 复制分享链接
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // 可以添加 toast 提示
    } catch {
      // 降级处理
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CompareSkeleton />
      </div>
    );
  }

  if (!data || data.models.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Info className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold mb-4">未找到模型</h1>
          <p className="text-muted-foreground mb-8">
            请从排行榜页面选择要对比的模型
          </p>
          <Button asChild>
            <Link href="/benchmarks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回排行榜
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // 使用用户选择的 benchmarks，如果为空则使用全部
  const displayBenchmarks = selectedBenchmarks.length > 0
    ? selectedBenchmarks
    : data.allBenchmarks;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/50 to-transparent py-10 md:py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Link */}
            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回排行榜
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                  <GitCompare className="h-4 w-4" />
                  <span className="text-sm font-medium">模型对比</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {data.models.length} 个模型对比分析
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Model Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {data.models.map((model, index) => (
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                <Card className="shrink-0 w-48 border-border/50 hover:border-primary/30 transition-colors relative group">
                  {/* Remove Button */}
                  {data.models.length > 1 && (
                    <button
                      onClick={() => handleRemoveModel(model.slug)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100 z-10"
                      aria-label={`移除 ${model.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <CardContent className="p-4 text-center">
                    <Link href={`/models/${model.slug}`} className="block">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <ModelIcon
                          name={model.name}
                          developer={model.developer}
                          family={model.family}
                          size={28}
                        />
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                        {model.baseModelName || model.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {model.developer}
                      </p>
                    </Link>
                    {/* Coverage Badge */}
                    <Badge
                      variant="secondary"
                      className="mt-2 text-[10px] px-2 py-0"
                    >
                      覆盖 {data.coverage[model.slug]}%
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benchmark Selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="py-4 px-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    共 <strong>{data.allBenchmarks.length}</strong> 项 Benchmark，
                    其中 <strong>{data.commonBenchmarks.length}</strong> 项所有模型都有数据，
                    当前已选择 <strong>{selectedBenchmarks.length}</strong> 项
                  </span>
                </div>
                <BenchmarkMultiSelector
                  allBenchmarks={data.allBenchmarks}
                  commonBenchmarks={data.commonBenchmarks}
                  selectedBenchmarks={selectedBenchmarks}
                  onSelectionChange={setSelectedBenchmarks}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">可视化对比</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={chartTab} onValueChange={setChartTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="radar" className="gap-2">
                    <Radar className="h-4 w-4" />
                    <span className="hidden sm:inline">雷达图</span>
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">柱状图</span>
                  </TabsTrigger>
                  <TabsTrigger value="line" className="gap-2">
                    <LineChart className="h-4 w-4" />
                    <span className="hidden sm:inline">折线图</span>
                  </TabsTrigger>
                  <TabsTrigger value="bubble" className="gap-2">
                    <Circle className="h-4 w-4" />
                    <span className="hidden sm:inline">气泡图</span>
                  </TabsTrigger>
                  <TabsTrigger value="heatmap" className="gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">热力图</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="radar">
                  <CompareRadarChart
                    models={data.models}
                    benchmarks={
                      data.commonBenchmarks.length >= 3
                        ? data.commonBenchmarks.slice(0, 8)
                        : displayBenchmarks.slice(0, 8)
                    }
                  />
                </TabsContent>

                <TabsContent value="bar">
                  <CompareBarChart
                    models={data.models}
                    benchmarks={displayBenchmarks.slice(0, 10)}
                  />
                </TabsContent>

                <TabsContent value="line">
                  <CompareLineChart
                    models={data.models}
                    benchmarks={displayBenchmarks.slice(0, 12)}
                  />
                </TabsContent>

                <TabsContent value="bubble">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      气泡图展示模型在两个维度上的表现（选择常见 Benchmark）
                    </p>
                    <CompareBubbleChart
                      models={data.models}
                      xAxis={{
                        key: displayBenchmarks[0] || "MMLU-Pro",
                        label: displayBenchmarks[0] || "MMLU-Pro",
                      }}
                      yAxis={{
                        key: displayBenchmarks[1] || "GPQA",
                        label: displayBenchmarks[1] || "GPQA",
                      }}
                      zAxis={
                        displayBenchmarks[2]
                          ? {
                              key: displayBenchmarks[2],
                              label: displayBenchmarks[2],
                            }
                          : undefined
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="heatmap">
                  <CompareHeatmap
                    models={data.models}
                    benchmarks={displayBenchmarks}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <CompareTable
            models={data.models}
            benchmarks={displayBenchmarks}
            onRemoveModel={handleRemoveModel}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <CompareSkeleton />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

