import prisma from "./prisma";
import type { Model } from "@prisma/client";

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

// Helper to parse JSON fields
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function parseJsonObject<T>(value: string | null): T {
  if (!value) return {} as T;
  try {
    return JSON.parse(value);
  } catch {
    return {} as T;
  }
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
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { developer: { contains: filters.search } },
      { family: { contains: filters.search } },
      { description: { contains: filters.search } },
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
      (where.paramsTotal as Record<string, number>).gte = filters.minParams;
    }
    if (filters.maxParams !== undefined) {
      (where.paramsTotal as Record<string, number>).lte = filters.maxParams;
    }
  }

  if (filters.minContext !== undefined || filters.maxContext !== undefined) {
    where.contextWindow = {};
    if (filters.minContext !== undefined) {
      (where.contextWindow as Record<string, number>).gte = filters.minContext;
    }
    if (filters.maxContext !== undefined) {
      (where.contextWindow as Record<string, number>).lte = filters.maxContext;
    }
  }

  // Build orderBy
  const orderBy: Record<string, string> = {};
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

// Get models by family for family timeline
export async function getModelsByFamily(family: string): Promise<ParsedModel[]> {
  const models = await prisma.model.findMany({
    where: { family },
    orderBy: { releaseDate: "asc" },
  });

  return models.map(parseModel);
}

