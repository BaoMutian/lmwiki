/**
 * Model Types - 前后端共享的类型定义
 * 
 * 这些类型定义确保 API 响应和 UI 组件之间的类型一致性。
 * 所有组件应该使用这些类型，而不是直接依赖 Prisma 类型。
 */

// 基础模型信息
export interface ModelIdentity {
  id: number;
  name: string;
  shortName: string | null;
  slug: string;
  developer: string;
  releaseDate: string | null;
  version: string | null;
  family: string | null;
  modelSeries: string | null;
  branchType: string | null;
  description: string | null;
  logoUrl: string | null;
  modelType: "open" | "closed";
}

// 技术规格
export interface ModelTechSpecs {
  architecture: string | null;
  paramsTotal: number | null;
  paramsActive: number | null;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  trainingTokens: number | null;
  vocabSize: number | null;
  knowledgeCutoff: string | null;
  fineTuningMethod: string[];
  layers: number | null;
  attentionMechanism: string | null;
}

// 商用授权
export interface ModelLicensing {
  license: string | null;
  commercialUseAllowed: boolean | null;
  pricingInput: number | null;
  pricingOutput: number | null;
  freeTierAvailable: boolean | null;
}

// 能力与模态
export interface ModelCapabilities {
  modalitiesInput: string[];
  modalitiesOutput: string[];
  languages: string[];
  supportsToolUse: boolean | null;
  supportsJsonMode: boolean | null;
  supportsVision: boolean | null;
  codingCapable: boolean | null;
  supportsReasoning: boolean | null;
}

// 部署信息
export interface ModelDeployment {
  modelSize: number | null;
  tensorType: string | null;
  modelFormat: string | null;
  numFiles: number | null;
  quantizationAvailable: string[];
  inferenceFrameworks: string[];
}

// 评测基准
export interface ModelBenchmarks {
  scoreArenaElo: number | null;
  benchmarks: Record<string, number>;
}

// 资源链接
export interface ModelResources {
  urlPaper: string | null;
  urlHuggingface: string | null;
  urlDemo: string | null;
  urlGithub: string | null;
  urlApiDocs: string | null;
  urlBlog: string | null;
  urlWebsite: string | null;
}

// 元数据
export interface ModelMeta {
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 完整模型数据 (API 返回格式)
export interface ModelData extends 
  ModelIdentity, 
  ModelTechSpecs, 
  ModelLicensing, 
  ModelCapabilities, 
  ModelDeployment, 
  ModelBenchmarks, 
  ModelResources,
  ModelMeta {}

// API 响应类型
export interface ModelsListResponse {
  models: ModelData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModelDetailResponse {
  model: ModelData;
  familyModels?: ModelData[];
}

export interface FilterOptionsResponse {
  families: string[];
  developers: string[];
  architectures: string[];
}

// 查询参数类型
export interface ModelFiltersParams {
  search?: string;
  type?: "open" | "closed";
  family?: string;
  developer?: string;
  architecture?: string;
  vision?: "true" | "false";
  reasoning?: "true" | "false";
  toolUse?: "true" | "false";
  minParams?: string;
  maxParams?: string;
  minContext?: string;
  maxContext?: string;
}

export interface ModelSortParams {
  sort?: "releaseDate" | "name" | "paramsTotal" | "contextWindow" | "scoreArenaElo" | "pricingInput";
  order?: "asc" | "desc";
}

export interface PaginationParams {
  page?: string;
  limit?: string;
}

export interface ModelQueryParams extends ModelFiltersParams, ModelSortParams, PaginationParams {}

