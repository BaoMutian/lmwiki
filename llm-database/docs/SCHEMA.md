# LLM 数据集字段说明

本文档描述 `llm_database.jsonl` 数据集中各字段的含义和用途。

## 数据格式

数据以 JSONL (JSON Lines) 格式存储，每行一个 JSON 对象，代表一个 LLM 模型。

---

## 字段分类

### 1. 基础身份信息 (Identity)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `name` | String | 模型全名 | "GPT-4o", "Llama 3.3 Instruct 70B" |
| `short_name` | String | 简短名称 | "GPT-4o", "Llama 3.3" |
| `slug` | String | URL 友好的唯一标识符 | "gpt-4o", "llama-3-3-instruct-70b" |
| `developer` | String | 开发机构/公司 | "OpenAI", "Meta", "Anthropic" |
| `release_date` | String | 发布日期 (YYYY-MM-DD) | "2024-05-13" |
| `version` | String | 版本号（一般不用） | "v1", "v2" |
| `family` | String | 所属家族 | "GPT", "Llama", "Claude", "Gemini" |
| `model_series` | String | 所属系列 | "GPT-4", "Llama-3.3", "Claude-3.5" |
| `branch_type` | String | 分支类型 | "Instruct", "Base", "Vision", "Code", "Reasoning" |
| `description` | String | 模型简介 | |
| `logo_url` | String | Logo 图片 URL 或本地路径 | "imgs/grok.png" |

### 2. 模型类型

| 字段 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| `model_type` | String | 开源/闭源 | "open", "closed" |

---

### 3. 技术规格 (Technical Specs)

> 注：闭源模型通常只有 `context_window`、`max_output_tokens`、`knowledge_cutoff`

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `architecture` | String | 架构类型 | "Transformer", "MoE", "Mamba/SSM" |
| `params_total` | Float | 总参数量 (Billion) | 70.0 |
| `params_active` | Float | 激活参数量 (针对 MoE) | 13.0 |
| `context_window` | Integer | 上下文窗口长度 | 128000 |
| `max_output_tokens` | Integer | 最大输出 token 数 | 4096 |
| `training_tokens` | Float | 训练数据量 (Trillion tokens) | 15.0 |
| `vocab_size` | Integer | 词表大小 | 128000 |
| `knowledge_cutoff` | String | 知识截止日期 | "2024-04" |
| `fine_tuning_method` | Array | 微调方式 | ["Pre-trained", "SFT", "RL"] |
| `layers` | Integer | 网络层数 | 80 |
| `attention_mechanism` | String | 注意力机制 | "GQA", "MHA", "MQA" |

---

### 4. 商用与授权 (Commercial & Licensing)

> 注：闭源模型只有 `pricing_input` 和 `pricing_output`

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `license` | String | 许可协议 | "Apache 2.0", "MIT", "Llama Community License" |
| `commercial_use_allowed` | Boolean | 是否允许商用 | true |
| `pricing_input` | Float | 输入价格 ($/1M tokens) | 2.5 |
| `pricing_output` | Float | 输出价格 ($/1M tokens) | 10.0 |
| `free_tier_available` | Boolean | 是否有免费层级 | true |

---

### 5. 能力与模态 (Capabilities & Modalities)

| 字段 | 类型 | 说明 | 可选值/示例 |
|------|------|------|-------------|
| `modalities_input` | Array | 输入模态 | ["Text", "Image", "Audio", "Video", "PDF"] |
| `modalities_output` | Array | 输出模态 | ["Text", "Image", "Audio", "Video"] |
| `languages` | Array | 支持语言 | ["English", "Chinese", "Multilingual"] |
| `supports_tool_use` | Boolean | 支持工具调用 | true |
| `supports_json_mode` | Boolean | 支持 JSON 输出模式 | true |
| `supports_vision` | Boolean | 支持视觉/图像理解 | true |
| `coding_capable` | Boolean | 代码能力突出 | true |
| `supports_reasoning` | Boolean | 支持思考/推理 | true |

---

### 6. 部署与硬件 (Deployment & Hardware)

> 注：仅开源模型有此部分

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `model_size` | Float | 模型文件大小 (GB) | 140.0 |
| `tensor_type` | String | Tensor 类型 | "BF16", "FP16", "FP32" |
| `model_format` | String | 模型格式 | "safetensors", "pytorch", "GGUF" |
| `num_files` | Integer | 文件数量 | 30 |
| `quantization_available` | Array | 可用量化版本 | ["GGUF-Q4", "AWQ", "GPTQ"] |
| `inference_frameworks` | Array | 推理框架 | ["vLLM", "TGI", "llama.cpp", "Ollama"] |

---

### 7. 评分与基准测试 (Benchmarks)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `score_arena_elo` | Integer | Chatbot Arena Elo 分数 | 1287 |
| `benchmarks` | Object | 各项基准测试分数 | 见下方 |

#### benchmarks 对象示例（可自行添加）

```json
{
  "MMLU-Pro": 77.5,
  "GPQA": 67.2,
  "LiveCodeBench": 70.7,
  "MATH-500": 85.0,
  "AIME 2025": 66.7,
  "AA Intelligence Index": 47.5,
  "AA Coding Index": 37.2,
  "AA Math Index": 66.7
}
```

---

### 8. 外部资源 (Resources & Links)

| 字段 | 类型 | 说明 |
|------|------|------|
| `url_paper` | String | 论文链接 (arXiv) |
| `url_huggingface` | String | Hugging Face 仓库 |
| `url_demo` | String | 官方 Demo 链接 |
| `url_github` | String | GitHub 代码仓库 |
| `url_api_docs` | String | API 文档 |
| `url_blog` | String | 官方博客文章 |
| `url_website` | String | 官网链接 |

---

### 9. 元数据 (Metadata)

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata` | Object | 自定义键值对，存储额外信息 |
| `created_at` | String | 记录创建时间 (ISO 8601) |
| `updated_at` | String | 记录更新时间 (ISO 8601) |

#### metadata 对象示例

```json
{
  "source_id": "uuid-xxx",
  "median_output_tokens_per_second": 112.5,
  "median_time_to_first_token_seconds": 0.45
}
```

---

## 开源 vs 闭源模型字段差异

| 字段类别 | 开源模型 | 闭源模型 |
|----------|----------|----------|
| 技术规格 | 完整 | 仅 context_window, max_output_tokens, knowledge_cutoff |
| 商用授权 | 完整 | 仅 pricing_input, pricing_output |
| 部署硬件 | 有 | 无 |
| 能力模态 | 完整 | 完整 |
| 评分基准 | 完整 | 完整 |

---

## 分支类型 (branch_type) 说明

| 值 | 说明 |
|----|------|
| Base | 基座模型，未经指令微调 |
| Instruct | 指令微调模型 |
| Chat | 对话优化模型 |
| Vision | 视觉/多模态模型 |
| Audio | 音频模型 |
| Code | 代码专用模型 |
| Math | 数学专用模型 |
| Reasoning | 推理/思考模型 |
| Multimodal | 多模态模型 |

---

## 示例数据

```json
{
  "model_type": "closed",
  "name": "GPT-4o",
  "short_name": "GPT-4o",
  "slug": "gpt-4o",
  "developer": "OpenAI",
  "release_date": "2024-05-13",
  "family": "GPT",
  "model_series": "GPT-4o",
  "branch_type": "",
  "context_window": 128000,
  "max_output_tokens": 4096,
  "pricing_input": 2.5,
  "pricing_output": 10.0,
  "supports_vision": true,
  "supports_tool_use": true,
  "benchmarks": {
    "MMLU-Pro": 72.6,
    "GPQA": 53.6
  },
  "logo_url": "https://upload.wikimedia.org/wikipedia/commons/e/ef/ChatGPT-Logo.svg"
}
```
