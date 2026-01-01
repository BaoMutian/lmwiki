/**
 * JSONL Import Script
 * Imports model data from llm_database.jsonl into SQLite database
 * 
 * Usage: npx tsx scripts/import-jsonl.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Initialize Prisma Client
const prisma = new PrismaClient();

interface JsonlModel {
  model_type: string;
  name: string;
  short_name?: string;
  slug: string;
  developer: string;
  release_date?: string;
  version?: string;
  family?: string;
  model_series?: string;
  branch_type?: string;
  description?: string;
  logo_url?: string;
  architecture?: string;
  params_total?: number;
  params_active?: number;
  context_window?: number;
  max_output_tokens?: number;
  training_tokens?: number;
  vocab_size?: number;
  knowledge_cutoff?: string;
  fine_tuning_method?: string[];
  layers?: number;
  attention_mechanism?: string;
  license?: string;
  commercial_use_allowed?: boolean;
  pricing_input?: number;
  pricing_output?: number;
  free_tier_available?: boolean;
  modalities_input?: string[];
  modalities_output?: string[];
  languages?: string[];
  supports_tool_use?: boolean;
  supports_json_mode?: boolean;
  supports_vision?: boolean;
  coding_capable?: boolean;
  supports_reasoning?: boolean;
  model_size?: number;
  tensor_type?: string;
  model_format?: string;
  num_files?: number;
  quantization_available?: string[];
  inference_frameworks?: string[];
  score_arena_elo?: number;
  benchmarks?: Record<string, number>;
  url_paper?: string;
  url_huggingface?: string;
  url_demo?: string;
  url_github?: string;
  url_api_docs?: string;
  url_blog?: string;
  url_website?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

async function importJsonl() {
  // Path to the JSONL file
  const jsonlPath = path.resolve(__dirname, "../../llm-database/llm_database.jsonl");
  
  if (!fs.existsSync(jsonlPath)) {
    console.error(`Error: JSONL file not found at ${jsonlPath}`);
    process.exit(1);
  }

  console.log(`📂 Reading from: ${jsonlPath}`);

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.model.deleteMany();

  // Read and parse JSONL file
  const fileStream = fs.createReadStream(jsonlPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  let errors = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const data: JsonlModel = JSON.parse(line);
      
      await prisma.model.create({
        data: {
          name: data.name,
          shortName: data.short_name || null,
          slug: data.slug,
          developer: data.developer,
          releaseDate: data.release_date || null,
          version: data.version || null,
          family: data.family || null,
          modelSeries: data.model_series || null,
          branchType: data.branch_type || null,
          description: data.description || null,
          logoUrl: data.logo_url || null,
          modelType: data.model_type,
          architecture: data.architecture || null,
          paramsTotal: data.params_total ?? null,
          paramsActive: data.params_active ?? null,
          contextWindow: data.context_window ?? null,
          maxOutputTokens: data.max_output_tokens ?? null,
          trainingTokens: data.training_tokens ?? null,
          vocabSize: data.vocab_size ?? null,
          knowledgeCutoff: data.knowledge_cutoff || null,
          fineTuningMethod: data.fine_tuning_method ? JSON.stringify(data.fine_tuning_method) : null,
          layers: data.layers ?? null,
          attentionMechanism: data.attention_mechanism || null,
          license: data.license || null,
          commercialUseAllowed: data.commercial_use_allowed ?? null,
          pricingInput: data.pricing_input ?? null,
          pricingOutput: data.pricing_output ?? null,
          freeTierAvailable: data.free_tier_available ?? null,
          modalitiesInput: data.modalities_input ? JSON.stringify(data.modalities_input) : null,
          modalitiesOutput: data.modalities_output ? JSON.stringify(data.modalities_output) : null,
          languages: data.languages ? JSON.stringify(data.languages) : null,
          supportsToolUse: data.supports_tool_use ?? null,
          supportsJsonMode: data.supports_json_mode ?? null,
          supportsVision: data.supports_vision ?? null,
          codingCapable: data.coding_capable ?? null,
          supportsReasoning: data.supports_reasoning ?? null,
          modelSize: data.model_size ?? null,
          tensorType: data.tensor_type || null,
          modelFormat: data.model_format || null,
          numFiles: data.num_files ?? null,
          quantizationAvailable: data.quantization_available ? JSON.stringify(data.quantization_available) : null,
          inferenceFrameworks: data.inference_frameworks ? JSON.stringify(data.inference_frameworks) : null,
          scoreArenaElo: data.score_arena_elo ?? null,
          benchmarks: data.benchmarks ? JSON.stringify(data.benchmarks) : null,
          urlPaper: data.url_paper || null,
          urlHuggingface: data.url_huggingface || null,
          urlDemo: data.url_demo || null,
          urlGithub: data.url_github || null,
          urlApiDocs: data.url_api_docs || null,
          urlBlog: data.url_blog || null,
          urlWebsite: data.url_website || null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      count++;
      if (count % 50 === 0) {
        console.log(`   Imported ${count} models...`);
      }
    } catch (err) {
      errors++;
      console.error(`   Error parsing line: ${(err as Error).message}`);
    }
  }

  console.log("\n✅ Import complete!");
  console.log(`   Total models imported: ${count}`);
  if (errors > 0) {
    console.log(`   Errors: ${errors}`);
  }
}

importJsonl()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
