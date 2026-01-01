import { NextRequest, NextResponse } from "next/server";
import { getModels, type ModelFilters, type ModelSortField, type ModelSortOrder } from "@/lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build filters
    const filters: ModelFilters = {};

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const modelType = searchParams.get("type");
    if (modelType === "open" || modelType === "closed") {
      filters.modelType = modelType;
    }

    const family = searchParams.get("family");
    if (family) filters.family = family;

    const developer = searchParams.get("developer");
    if (developer) filters.developer = developer;

    const architecture = searchParams.get("architecture");
    if (architecture) filters.architecture = architecture;

    if (searchParams.get("vision") === "true") filters.supportsVision = true;
    if (searchParams.get("reasoning") === "true") filters.supportsReasoning = true;
    if (searchParams.get("toolUse") === "true") filters.supportsToolUse = true;

    // Sorting
    const validSortFields: ModelSortField[] = [
      "releaseDate",
      "name",
      "paramsTotal",
      "contextWindow",
      "scoreArenaElo",
      "pricingInput",
    ];
    const sortBy = validSortFields.includes(searchParams.get("sort") as ModelSortField)
      ? (searchParams.get("sort") as ModelSortField)
      : "releaseDate";
    const sortOrder: ModelSortOrder =
      searchParams.get("order") === "asc" ? "asc" : "desc";

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "24", 10) || 24);

    const result = await getModels({
      filters,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

