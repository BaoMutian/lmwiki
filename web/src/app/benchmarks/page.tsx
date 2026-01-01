"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BenchmarkSelector } from "@/components/benchmarks/BenchmarkSelector";
import { BenchmarkRankingTable } from "@/components/benchmarks/BenchmarkRankingTable";
import { VariantToggle } from "@/components/benchmarks/VariantToggle";
import { BenchmarksSkeleton } from "@/components/benchmarks/BenchmarksSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, X, AlertCircle } from "lucide-react";
import type { BenchmarkInfo, RankedModel } from "@/lib/db/benchmarks";

const MAX_COMPARE_MODELS = 7;

interface BenchmarksResponse {
  models: RankedModel[];
  total: number;
  totalWithData: number;
  benchmark: string;
  availableBenchmarks: BenchmarkInfo[];
  page: number;
  limit: number;
  totalPages: number;
}

export default function BenchmarksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<BenchmarksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // URL 参数
  const benchmark = searchParams.get("benchmark") || "";
  const aggregated = searchParams.get("aggregated") !== "false";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // 获取数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (benchmark) params.set("benchmark", benchmark);
      params.set("aggregated", String(aggregated));
      params.set("page", String(page));
      params.set("limit", "30");

      const response = await fetch(`/api/benchmarks?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching benchmarks:", error);
    } finally {
      setLoading(false);
    }
  }, [benchmark, aggregated, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 更新 URL 参数
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // 切换 benchmark 或 aggregated 时重置页码
    if (updates.benchmark !== undefined || updates.aggregated !== undefined) {
      params.delete("page");
    }

    router.push(`/benchmarks?${params.toString()}`);
  };

  // 处理 Benchmark 选择
  const handleBenchmarkSelect = (selected: string) => {
    setSelectedSlugs([]); // 清空选择
    updateParams({ benchmark: selected });
  };

  // 处理聚合切换
  const handleAggregatedToggle = (value: boolean) => {
    setSelectedSlugs([]); // 清空选择
    updateParams({ aggregated: String(value) });
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  // 跳转到对比页面
  const goToCompare = () => {
    if (selectedSlugs.length >= 2) {
      router.push(`/benchmarks/compare?slugs=${selectedSlugs.join(",")}`);
    }
  };

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BenchmarksSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/50 to-transparent py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm font-medium">跑分实验室</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Benchmark 排行榜
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              探索各大模型在不同评测基准上的表现，选择多个模型进行横向对比分析
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
          >
            {/* Benchmark Selector */}
            <div className="flex-1">
              {data && (
                <BenchmarkSelector
                  benchmarks={data.availableBenchmarks}
                  selected={data.benchmark}
                  onSelect={handleBenchmarkSelect}
                />
              )}
            </div>

            {/* Variant Toggle */}
            <div className="shrink-0">
              <VariantToggle
                aggregated={aggregated}
                onToggle={handleAggregatedToggle}
              />
            </div>
          </motion.div>

          {/* Stats Bar */}
          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-4 text-sm text-muted-foreground"
            >
              <span>
                共 <strong className="text-foreground">{data.totalWithData}</strong> 个模型有{" "}
                <strong className="text-foreground">{data.benchmark}</strong> 数据
              </span>
              {data.total > data.totalWithData && (
                <Badge variant="secondary" className="text-xs">
                  {data.total - data.totalWithData} 个无数据
                </Badge>
              )}
            </motion.div>
          )}

          {/* Ranking Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {data && (
              <BenchmarkRankingTable
                models={data.models}
                benchmark={data.benchmark}
                selectedSlugs={selectedSlugs}
                onSelectionChange={setSelectedSlugs}
                maxSelection={MAX_COMPARE_MODELS}
              />
            )}
          </motion.div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                第 {data.page} / {data.totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page <= 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                >
                  下一页
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedSlugs.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={selectedSlugs.length >= MAX_COMPARE_MODELS ? "destructive" : "default"} 
                  className="text-sm px-3 py-1"
                >
                  {selectedSlugs.length}/{MAX_COMPARE_MODELS}
                </Badge>
                <span className="text-sm font-medium">个模型已选中</span>
                {selectedSlugs.length >= MAX_COMPARE_MODELS && (
                  <span className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    已达上限
                  </span>
                )}
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSlugs([])}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                清空
              </Button>
              
              <Button
                size="sm"
                onClick={goToCompare}
                disabled={selectedSlugs.length < 2}
                className="gap-2"
              >
                开始对比
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

