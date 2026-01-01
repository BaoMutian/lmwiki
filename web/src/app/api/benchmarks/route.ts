import { NextRequest, NextResponse } from "next/server";
import { getAvailableBenchmarks, getBenchmarkRankings } from "@/lib/db/benchmarks";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 获取参数
    const benchmark = searchParams.get("benchmark");
    const aggregated = searchParams.get("aggregated") !== "false"; // 默认 true
    const includeNoData = searchParams.get("includeNoData") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10) || 50);

    // 获取可用的 Benchmark 列表
    const availableBenchmarks = await getAvailableBenchmarks();

    // 如果没有指定 benchmark，使用第一个（覆盖度最高的）
    const selectedBenchmark = benchmark || availableBenchmarks[0]?.name || "MMLU-Pro";

    // 获取排行榜
    const rankings = await getBenchmarkRankings({
      benchmark: selectedBenchmark,
      aggregated,
      includeNoData,
      page,
      limit,
    });

    return NextResponse.json({
      ...rankings,
      availableBenchmarks,
      page,
      limit,
      totalPages: Math.ceil(rankings.total / limit),
    });
  } catch (error) {
    console.error("Error fetching benchmark rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmark rankings" },
      { status: 500 }
    );
  }
}

