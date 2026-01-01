import { getAggregatedModels, type ModelFilters, type ModelSortField, type ModelSortOrder } from "@/lib/db/models";
import { ModelCard } from "./ModelCard";
import { SortingBar } from "./SortingBar";
import { Pagination } from "./Pagination";

interface ModelListProps {
  searchParams: {
    search?: string;
    type?: string;
    family?: string;
    developer?: string;
    architecture?: string;
    vision?: string;
    reasoning?: string;
    toolUse?: string;
    sort?: string;
    order?: string;
    view?: string;
    page?: string;
  };
}

export async function ModelList({ searchParams }: ModelListProps) {
  // Build filters from search params
  const filters: ModelFilters = {};
  
  if (searchParams.search) {
    filters.search = searchParams.search;
  }
  
  if (searchParams.type === "open" || searchParams.type === "closed") {
    filters.modelType = searchParams.type;
  }
  
  if (searchParams.family) {
    filters.family = searchParams.family;
  }
  
  if (searchParams.developer) {
    filters.developer = searchParams.developer;
  }
  
  if (searchParams.architecture) {
    filters.architecture = searchParams.architecture;
  }
  
  if (searchParams.vision === "true") {
    filters.supportsVision = true;
  }
  
  if (searchParams.reasoning === "true") {
    filters.supportsReasoning = true;
  }
  
  if (searchParams.toolUse === "true") {
    filters.supportsToolUse = true;
  }

  // Parse sorting
  const validSortFields: ModelSortField[] = [
    "releaseDate",
    "name",
    "paramsTotal",
    "contextWindow",
    "scoreArenaElo",
    "pricingInput",
  ];
  const sortBy = validSortFields.includes(searchParams.sort as ModelSortField)
    ? (searchParams.sort as ModelSortField)
    : "releaseDate";
  const sortOrder: ModelSortOrder = searchParams.order === "asc" ? "asc" : "desc";

  // Parse pagination
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const limit = 24;

  // Parse view mode
  const view = searchParams.view === "list" ? "list" : "grid";

  // Fetch aggregated models (variants grouped together)
  const { models, total } = await getAggregatedModels({
    filters,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Sorting Bar */}
      <SortingBar
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        view={view}
      />

      {/* Models Grid/List */}
      {models.length > 0 ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {models.map((model) => (
            <ModelCard key={model.id} model={model} view={view} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">未找到匹配的模型</h3>
          <p className="text-muted-foreground">
            尝试调整搜索条件或清除筛选器
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}

