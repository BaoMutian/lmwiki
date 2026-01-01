import prisma from "./prisma";
import type { Model, Prisma } from "@prisma/client";

// Types for parsed model data
export interface ParsedModel extends Omit<Model, 
  'modalitiesInput' | 'modalitiesOutput' | 'languages' | 
  'fineTuningMethod' | 'quantizationAvailable' | 'inferenceFrameworks' | 
  'benchmarks' | 'metadata'
> {
  modalitiesInput: string[];
  modalitiesOutput: string[];
  languages: string[];
  fineTuningMethod: string[];
  quantizationAvailable: string[];
  inferenceFrameworks: string[];
  benchmarks: Record<string, number>;
  metadata: Record<string, unknown>;
}

// Extended model with variant count for aggregated list views
export interface AggregatedModel extends ParsedModel {
  variantCount: number;
}

/**
 * Variant type priority for selecting the representative model
 * Lower number = higher priority (more likely to be selected as representative)
 * 
 * Priority logic:
 * 1. Models without variantType (null) are the "pure" base model - highest priority
 * 2. Common "standard" or "default" variants
 * 3. Non-reasoning variants (often the base capability)
 * 4. Other variants in alphabetical order
 */
function getVariantPriority(variantType: string | null): number {
  if (variantType === null) return 0; // Highest priority - pure base model
  
  const normalized = variantType.toLowerCase();
  
  // Standard/default variants
  if (normalized === "standard" || normalized === "default" || normalized === "base") return 1;
  
  // Non-reasoning often represents the base capability
  if (normalized === "non-reasoning" || normalized === "non-thinking") return 2;
  
  // Medium/balanced variants
  if (normalized === "medium" || normalized === "mid") return 3;
  
  // Reasoning/thinking variants (usually enhanced versions)
  if (normalized === "reasoning" || normalized === "thinking") return 4;
  
  // High/low performance variants
  if (normalized === "high" || normalized === "xhigh") return 5;
  if (normalized === "low" || normalized === "minimal") return 6;
  
  // Everything else
  return 10;
}

/**
 * Determine if modelA should be preferred over modelB as the group representative
 */
function shouldPreferAsRepresentative(modelA: Model, modelB: Model): boolean {
  const priorityA = getVariantPriority(modelA.variantType);
  const priorityB = getVariantPriority(modelB.variantType);
  
  // Lower priority number wins
  if (priorityA !== priorityB) {
    return priorityA < priorityB;
  }
  
  // If same priority, prefer the one with shorter variant name (more "standard")
  if (modelA.variantType && modelB.variantType) {
    return modelA.variantType.length < modelB.variantType.length;
  }
  
  // Otherwise keep the existing one
  return false;
}

// Helper to safely parse JSON fields (handles both JSON and string)
function parseJsonArray(value: Prisma.JsonValue | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

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

// Convert database model to parsed model
export function parseModel(model: Model): ParsedModel {
  return {
    ...model,
    modalitiesInput: parseJsonArray(model.modalitiesInput),
    modalitiesOutput: parseJsonArray(model.modalitiesOutput),
    languages: parseJsonArray(model.languages),
    fineTuningMethod: parseJsonArray(model.fineTuningMethod),
    quantizationAvailable: parseJsonArray(model.quantizationAvailable),
    inferenceFrameworks: parseJsonArray(model.inferenceFrameworks),
    benchmarks: parseJsonObject<Record<string, number>>(model.benchmarks),
    metadata: parseJsonObject<Record<string, unknown>>(model.metadata),
  };
}

// Filter options
export interface ModelFilters {
  search?: string;
  modelType?: "open" | "closed" | "";
  family?: string;
  developer?: string;
  architecture?: string;
  supportsVision?: boolean;
  supportsReasoning?: boolean;
  supportsToolUse?: boolean;
  minParams?: number;
  maxParams?: number;
  minContext?: number;
  maxContext?: number;
}

// Sort options
export type ModelSortField = 
  | "releaseDate" 
  | "name" 
  | "paramsTotal" 
  | "contextWindow" 
  | "scoreArenaElo"
  | "pricingInput";

export type ModelSortOrder = "asc" | "desc";

// Get all models with filters and pagination
export async function getModels(options: {
  filters?: ModelFilters;
  sortBy?: ModelSortField;
  sortOrder?: ModelSortOrder;
  page?: number;
  limit?: number;
} = {}): Promise<{ models: ParsedModel[]; total: number }> {
  const {
    filters = {},
    sortBy = "releaseDate",
    sortOrder = "desc",
    page = 1,
    limit = 24,
  } = options;

  // Build where clause
  const where: Prisma.ModelWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { developer: { contains: filters.search, mode: "insensitive" } },
      { family: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.modelType) {
    where.modelType = filters.modelType;
  }

  if (filters.family) {
    where.family = filters.family;
  }

  if (filters.developer) {
    where.developer = filters.developer;
  }

  if (filters.architecture) {
    where.architecture = filters.architecture;
  }

  if (filters.supportsVision !== undefined) {
    where.supportsVision = filters.supportsVision;
  }

  if (filters.supportsReasoning !== undefined) {
    where.supportsReasoning = filters.supportsReasoning;
  }

  if (filters.supportsToolUse !== undefined) {
    where.supportsToolUse = filters.supportsToolUse;
  }

  if (filters.minParams !== undefined || filters.maxParams !== undefined) {
    where.paramsTotal = {};
    if (filters.minParams !== undefined) {
      where.paramsTotal.gte = filters.minParams;
    }
    if (filters.maxParams !== undefined) {
      where.paramsTotal.lte = filters.maxParams;
    }
  }

  if (filters.minContext !== undefined || filters.maxContext !== undefined) {
    where.contextWindow = {};
    if (filters.minContext !== undefined) {
      where.contextWindow.gte = filters.minContext;
    }
    if (filters.maxContext !== undefined) {
      where.contextWindow.lte = filters.maxContext;
    }
  }

  // Build orderBy
  const orderBy: Prisma.ModelOrderByWithRelationInput = {};
  orderBy[sortBy] = sortOrder;

  // Get total count
  const total = await prisma.model.count({ where });

  // Get paginated results
  const models = await prisma.model.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    models: models.map(parseModel),
    total,
  };
}

// Get single model by slug
export async function getModelBySlug(slug: string): Promise<ParsedModel | null> {
  const model = await prisma.model.findUnique({
    where: { slug },
  });

  return model ? parseModel(model) : null;
}

// Get unique values for filters
export async function getFilterOptions(): Promise<{
  families: string[];
  developers: string[];
  architectures: string[];
}> {
  const [families, developers, architectures] = await Promise.all([
    prisma.model.findMany({
      where: { family: { not: null } },
      select: { family: true },
      distinct: ["family"],
    }),
    prisma.model.findMany({
      select: { developer: true },
      distinct: ["developer"],
    }),
    prisma.model.findMany({
      where: { architecture: { not: null } },
      select: { architecture: true },
      distinct: ["architecture"],
    }),
  ]);

  return {
    families: families.map((f) => f.family!).filter(Boolean).sort(),
    developers: developers.map((d) => d.developer).filter(Boolean).sort(),
    architectures: architectures.map((a) => a.architecture!).filter(Boolean).sort(),
  };
}

// Get models by family for family timeline (non-aggregated, for internal use)
async function getModelsByFamilyRaw(family: string): Promise<Model[]> {
  return prisma.model.findMany({
    where: { family },
    orderBy: { releaseDate: "asc" },
  });
}

// Get aggregated models by family for family timeline
export async function getModelsByFamily(family: string): Promise<AggregatedModel[]> {
  const allModels = await getModelsByFamilyRaw(family);
  
  // Group by baseModelName and aggregate (same logic as getAggregatedModels)
  const modelMap = new Map<string, { model: Model; count: number }>();
  
  for (const model of allModels) {
    const key = model.baseModelName || model.name;
    
    if (!modelMap.has(key)) {
      modelMap.set(key, { model, count: 1 });
    } else {
      const existing = modelMap.get(key)!;
      existing.count++;
      
      if (shouldPreferAsRepresentative(model, existing.model)) {
        existing.model = model;
      }
    }
  }

  // Convert to array, maintaining chronological order by representative's release date
  const aggregatedList = Array.from(modelMap.values())
    .sort((a, b) => {
      const dateA = a.model.releaseDate || "";
      const dateB = b.model.releaseDate || "";
      return dateA.localeCompare(dateB);
    });

  return aggregatedList.map(({ model, count }) => ({
    ...parseModel(model),
    variantCount: count,
  }));
}

// Get all variants of a model by base model name
export async function getModelVariants(baseModelName: string): Promise<ParsedModel[]> {
  const models = await prisma.model.findMany({
    where: { baseModelName },
    orderBy: [
      { variantType: "asc" },
      { releaseDate: "desc" },
    ],
  });

  return models.map(parseModel);
}

// Variant info type for UI display
export interface VariantInfo {
  slug: string;
  name: string;
  variantType: string | null;
  benchmarks: Record<string, number>;
}

// Get aggregated models (group variants together)
export async function getAggregatedModels(options: {
  filters?: ModelFilters;
  sortBy?: ModelSortField;
  sortOrder?: ModelSortOrder;
  page?: number;
  limit?: number;
} = {}): Promise<{ models: AggregatedModel[]; total: number }> {
  const {
    filters = {},
    sortBy = "releaseDate",
    sortOrder = "desc",
    page = 1,
    limit = 24,
  } = options;

  // Build where clause
  const where: Prisma.ModelWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { baseModelName: { contains: filters.search, mode: "insensitive" } },
      { developer: { contains: filters.search, mode: "insensitive" } },
      { family: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.modelType) {
    where.modelType = filters.modelType;
  }

  if (filters.family) {
    where.family = filters.family;
  }

  if (filters.developer) {
    where.developer = filters.developer;
  }

  if (filters.architecture) {
    where.architecture = filters.architecture;
  }

  if (filters.supportsVision !== undefined) {
    where.supportsVision = filters.supportsVision;
  }

  if (filters.supportsReasoning !== undefined) {
    where.supportsReasoning = filters.supportsReasoning;
  }

  if (filters.supportsToolUse !== undefined) {
    where.supportsToolUse = filters.supportsToolUse;
  }

  if (filters.minParams !== undefined || filters.maxParams !== undefined) {
    where.paramsTotal = {};
    if (filters.minParams !== undefined) {
      where.paramsTotal.gte = filters.minParams;
    }
    if (filters.maxParams !== undefined) {
      where.paramsTotal.lte = filters.maxParams;
    }
  }

  if (filters.minContext !== undefined || filters.maxContext !== undefined) {
    where.contextWindow = {};
    if (filters.minContext !== undefined) {
      where.contextWindow.gte = filters.minContext;
    }
    if (filters.maxContext !== undefined) {
      where.contextWindow.lte = filters.maxContext;
    }
  }

  // Build orderBy
  const orderBy: Prisma.ModelOrderByWithRelationInput = {};
  orderBy[sortBy] = sortOrder;

  // Get all matching models
  const allModels = await prisma.model.findMany({
    where,
    orderBy,
  });

  // Group by baseModelName and aggregate
  const modelMap = new Map<string, { model: Model; count: number }>();
  
  for (const model of allModels) {
    // Use baseModelName as key, fallback to name if no variants
    const key = model.baseModelName || model.name;
    
    if (!modelMap.has(key)) {
      // First model of this group - use it as the representative
      modelMap.set(key, { model, count: 1 });
    } else {
      // Increment count for existing group
      const existing = modelMap.get(key)!;
      existing.count++;
      
      // Determine if this model should be the new representative
      // Priority: 1. No variantType (base model), 2. Lower priority variant type
      if (shouldPreferAsRepresentative(model, existing.model)) {
        existing.model = model;
      }
    }
  }

  // Convert to array and apply pagination
  const aggregatedList = Array.from(modelMap.values());
  const total = aggregatedList.length;
  
  const paginatedList = aggregatedList.slice((page - 1) * limit, page * limit);

  // Convert to AggregatedModel
  const models: AggregatedModel[] = paginatedList.map(({ model, count }) => ({
    ...parseModel(model),
    variantCount: count,
  }));

  return { models, total };
}
