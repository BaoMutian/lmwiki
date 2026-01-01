import { NextRequest, NextResponse } from "next/server";
import { getModelsForCompare } from "@/lib/db/benchmarks";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 获取模型 slugs（逗号分隔）
    const slugsParam = searchParams.get("slugs");
    
    if (!slugsParam) {
      return NextResponse.json(
        { error: "Missing slugs parameter" },
        { status: 400 }
      );
    }

    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (slugs.length === 0) {
      return NextResponse.json(
        { error: "No valid slugs provided" },
        { status: 400 }
      );
    }

    if (slugs.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 models can be compared at once" },
        { status: 400 }
      );
    }

    // 获取对比数据
    const compareResult = await getModelsForCompare(slugs);

    if (compareResult.models.length === 0) {
      return NextResponse.json(
        { error: "No models found for the given slugs" },
        { status: 404 }
      );
    }

    return NextResponse.json(compareResult);
  } catch (error) {
    console.error("Error fetching models for compare:", error);
    return NextResponse.json(
      { error: "Failed to fetch models for comparison" },
      { status: 500 }
    );
  }
}

