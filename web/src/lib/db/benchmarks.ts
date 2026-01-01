import prisma from "./prisma";
import { parseModel, type ParsedModel } from "./models";
import { Prisma, type Model } from "@prisma/client";

// ==========================================
// Types
// ==========================================

/**
 * Benchmark 统计信息
 */
export interface BenchmarkInfo {
  name: string;           // Benchmark 名称
  modelCount: number;     // 有此分数的模型数量
  minValue: number;
  maxValue: number;
  avgValue: number;
}

/**
 * 排行榜模型（带排名和分数）
 */
export interface RankedModel extends ParsedModel {
  rank: number;
  score: number | null;
  variantCount: number;
}

/**
 * 排行榜查询选项
 */
export interface RankingOptions {
  benchmark: string;        // 排序依据的 Benchmark
  aggregated?: boolean;     // true=聚合代表模型, false=所有变体
  includeNoData?: boolean;  // 是否包含无此分数的模型
  limit?: number;
  page?: number;
}

/**
 * 排行榜结果
 */
export interface RankingResult {
  models: RankedModel[];
  total: number;
  totalWithData: number;
  benchmark: string;
}

/**
 * 对比结果
 */
export interface CompareResult {
  models: ParsedModel[];
  allBenchmarks: string[];        // 所有模型的 Benchmark 并集
  commonBenchmarks: string[];     // 所有模型都有的 Benchmark 交集
  coverage: Record<string, number>; // 每个模型 slug -> 覆盖率百分比
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * 安全解析 JSON 对象
 */
function parseJsonObject<T>(value: Prisma.JsonValue | null): T {
  if (!value) return {} as T;
  if (typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

/**
 * 变体类型优先级（用于选择代表模型）
 */
function getVariantPriority(variantType: string | null): number {
  if (variantType === null) return 0;
  
  const normalized = variantType.toLowerCase();
  
  if (normalized === "standard" || normalized === "default" || normalized === "base") return 1;
  if (normalized === "non-reasoning" || normalized === "non-thinking") return 2;
  if (normalized === "medium" || normalized === "mid") return 3;
  if (normalized === "reasoning" || normalized === "thinking") return 4;
  if (normalized === "high" || normalized === "xhigh") return 5;
  if (normalized === "low" || normalized === "minimal") return 6;
  
  return 10;
}

/**
 * 判断 modelA 是否应该作为代表模型
 */
function shouldPreferAsRepresentative(modelA: Model, modelB: Model): boolean {
  const priorityA = getVariantPriority(modelA.variantType);
  const priorityB = getVariantPriority(modelB.variantType);
  
  if (priorityA !== priorityB) {
    return priorityA < priorityB;
  }
  
  if (modelA.variantType && modelB.variantType) {
    return modelA.variantType.length < modelB.variantType.length;
  }
  
  return false;
}

// ==========================================
// Core Functions
// ==========================================

/**
 * 动态获取所有可用的 Benchmark（从数据库扫描）
 * 返回按覆盖模型数量排序的列表
 */
export async function getAvailableBenchmarks(): Promise<BenchmarkInfo[]> {
  const models = await prisma.model.findMany({
    where: { benchmarks: { not: Prisma.DbNull } },
    select: { benchmarks: true }
  });
  
  const benchmarkStats = new Map<string, { count: number; values: number[] }>();
  
  for (const model of models) {
    const benchmarks = parseJsonObject<Record<string, number>>(model.benchmarks);
    for (const [name, value] of Object.entries(benchmarks)) {
      if (typeof value !== "number" || isNaN(value)) continue;
      
      if (!benchmarkStats.has(name)) {
        benchmarkStats.set(name, { count: 0, values: [] });
      }
      const stats = benchmarkStats.get(name)!;
      stats.count++;
      stats.values.push(value);
    }
  }
  
  // 转换为数组并按覆盖度排序
  return Array.from(benchmarkStats.entries())
    .map(([name, stats]) => ({
      name,
      modelCount: stats.count,
      minValue: Math.min(...stats.values),
      maxValue: Math.max(...stats.values),
      avgValue: stats.values.reduce((a, b) => a + b, 0) / stats.values.length,
    }))
    .sort((a, b) => b.modelCount - a.modelCount);
}

/**
 * 获取 Benchmark 排行榜
 */
export async function getBenchmarkRankings(options: RankingOptions): Promise<RankingResult> {
  const {
    benchmark,
    aggregated = true,
    includeNoData = false,
    limit = 50,
    page = 1,
  } = options;

  // 获取所有模型
  const allModels = await prisma.model.findMany({
    orderBy: { releaseDate: "desc" },
  });

  // 提取分数并标记
  const modelsWithScores: Array<{
    model: Model;
    score: number | null;
    benchmarks: Record<string, number>;
  }> = allModels.map((model) => {
    const benchmarks = parseJsonObject<Record<string, number>>(model.benchmarks);
    const score = typeof benchmarks[benchmark] === "number" ? benchmarks[benchmark] : null;
    return { model, score, benchmarks };
  });

  // 聚合模式：按 baseModelName 分组
  let processedModels: Array<{
    model: Model;
    score: number | null;
    benchmarks: Record<string, number>;
    variantCount: number;
  }>;

  if (aggregated) {
    const modelMap = new Map<string, {
      model: Model;
      score: number | null;
      benchmarks: Record<string, number>;
      count: number;
    }>();

    for (const item of modelsWithScores) {
      const key = item.model.baseModelName || item.model.name;

      if (!modelMap.has(key)) {
        modelMap.set(key, { ...item, count: 1 });
      } else {
        const existing = modelMap.get(key)!;
        existing.count++;

        // 选择更好的代表模型
        if (shouldPreferAsRepresentative(item.model, existing.model)) {
          existing.model = item.model;
          existing.score = item.score;
          existing.benchmarks = item.benchmarks;
        }
      }
    }

    processedModels = Array.from(modelMap.values()).map((item) => ({
      model: item.model,
      score: item.score,
      benchmarks: item.benchmarks,
      variantCount: item.count,
    }));
  } else {
    processedModels = modelsWithScores.map((item) => ({
      ...item,
      variantCount: 1,
    }));
  }

  // 过滤无数据的模型（如果不包含）
  let filteredModels = includeNoData
    ? processedModels
    : processedModels.filter((m) => m.score !== null);

  // 按分数排序（高分在前，无数据在末尾）
  filteredModels.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  const total = filteredModels.length;
  const totalWithData = filteredModels.filter((m) => m.score !== null).length;

  // 分页
  const startIndex = (page - 1) * limit;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + limit);

  // 转换为 RankedModel
  const rankedModels: RankedModel[] = paginatedModels.map((item, index) => ({
    ...parseModel(item.model),
    rank: startIndex + index + 1,
    score: item.score,
    variantCount: item.variantCount,
  }));

  return {
    models: rankedModels,
    total,
    totalWithData,
    benchmark,
  };
}

/**
 * 获取模型用于对比
 */
export async function getModelsForCompare(slugs: string[]): Promise<CompareResult> {
  if (slugs.length === 0) {
    return {
      models: [],
      allBenchmarks: [],
      commonBenchmarks: [],
      coverage: {},
    };
  }

  const models = await prisma.model.findMany({
    where: { slug: { in: slugs } },
  });

  const parsedModels = models.map(parseModel);

  // 收集所有 Benchmark 名称
  const benchmarkSets: Map<string, Set<string>> = new Map();
  const allBenchmarkSet = new Set<string>();

  for (const model of parsedModels) {
    const modelBenchmarks = new Set<string>();
    for (const name of Object.keys(model.benchmarks)) {
      allBenchmarkSet.add(name);
      modelBenchmarks.add(name);
    }
    benchmarkSets.set(model.slug, modelBenchmarks);
  }

  // 计算交集（所有模型都有的 Benchmark）
  const allBenchmarks = Array.from(allBenchmarkSet).sort();
  const commonBenchmarks = allBenchmarks.filter((name) =>
    Array.from(benchmarkSets.values()).every((set) => set.has(name))
  );

  // 计算每个模型的覆盖率
  const coverage: Record<string, number> = {};
  for (const model of parsedModels) {
    const modelBenchmarkCount = Object.keys(model.benchmarks).length;
    coverage[model.slug] = allBenchmarks.length > 0
      ? Math.round((modelBenchmarkCount / allBenchmarks.length) * 100)
      : 0;
  }

  // 按传入的 slugs 顺序排序
  const orderedModels = slugs
    .map((slug) => parsedModels.find((m) => m.slug === slug))
    .filter((m): m is ParsedModel => m !== undefined);

  return {
    models: orderedModels,
    allBenchmarks,
    commonBenchmarks,
    coverage,
  };
}

/**
 * 根据 slug 获取单个模型的所有变体
 */
export async function getModelVariantsForCompare(baseModelName: string): Promise<ParsedModel[]> {
  const models = await prisma.model.findMany({
    where: { baseModelName },
    orderBy: [
      { variantType: "asc" },
      { releaseDate: "desc" },
    ],
  });

  return models.map(parseModel);
}

