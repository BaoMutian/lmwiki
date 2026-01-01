/**
 * Model Icon Mapping
 * 
 * 使用 @lobehub/icons 为模型提供统一的彩色图标
 * 参考: https://icons.lobehub.com/
 */

"use client";

import {
  OpenAI,
  Anthropic,
  Meta,
  Google,
  Mistral,
  Zhipu,
  ZAI,
  Baichuan,
  Moonshot,
  DeepSeek,
  Alibaba,
  Qwen,
  Yi,
  Minimax,
  Wenxin,
  Hunyuan,
  Doubao,
  Nvidia,
  Perplexity,
  Claude,
  Gemini,
  Spark,
  Grok,
  XAI,
  HuggingFace,
  Ollama,
} from "@lobehub/icons";
import { Sparkles } from "lucide-react";
import type { FC, ReactNode } from "react";

export interface ModelIconProps {
  size?: number;
  className?: string;
}

// Icon with Color variant type
interface IconWithColor {
  (props: { size?: number; className?: string }): ReactNode;
  Color: FC<{ size?: number; className?: string }>;
}

// Developer to Icon mapping (using Color variants)
const developerColorIcons: Record<string, IconWithColor> = {
  // Major providers
  "OpenAI": OpenAI as unknown as IconWithColor,
  "Anthropic": Anthropic as unknown as IconWithColor,
  "Meta": Meta as unknown as IconWithColor,
  "Google": Google as unknown as IconWithColor,
  "Google DeepMind": Google as unknown as IconWithColor,
  "Mistral AI": Mistral as unknown as IconWithColor,
  "Mistral": Mistral as unknown as IconWithColor,

  
  // xAI
  "xAI": XAI as unknown as IconWithColor,
  "X.AI": XAI as unknown as IconWithColor,
  
  // Chinese providers
  "智谱AI": Zhipu as unknown as IconWithColor,
  "Zhipu AI": Zhipu as unknown as IconWithColor,
  "Zhipu": Zhipu as unknown as IconWithColor,
  "Z AI": ZAI as unknown as IconWithColor,
  "百川智能": Baichuan as unknown as IconWithColor,
  "Baichuan": Baichuan as unknown as IconWithColor,
  "月之暗面": Moonshot as unknown as IconWithColor,
  "Moonshot AI": Moonshot as unknown as IconWithColor,
  "Moonshot": Moonshot as unknown as IconWithColor,
  "Kimi": Moonshot as unknown as IconWithColor,
  "DeepSeek": DeepSeek as unknown as IconWithColor,
  "深度求索": DeepSeek as unknown as IconWithColor,
  "Alibaba": Alibaba as unknown as IconWithColor,
  "阿里巴巴": Alibaba as unknown as IconWithColor,
  "阿里云": Qwen as unknown as IconWithColor,
  "Qwen": Qwen as unknown as IconWithColor,
  "通义千问": Qwen as unknown as IconWithColor,
  "零一万物": Yi as unknown as IconWithColor,
  "01.AI": Yi as unknown as IconWithColor,
  "Yi": Yi as unknown as IconWithColor,
  "MiniMax": Minimax as unknown as IconWithColor,
  "百度": Wenxin as unknown as IconWithColor,
  "Baidu": Wenxin as unknown as IconWithColor,
  "腾讯": Hunyuan as unknown as IconWithColor,
  "Tencent": Hunyuan as unknown as IconWithColor,
  "字节跳动": Doubao as unknown as IconWithColor,
  "ByteDance": Doubao as unknown as IconWithColor,
  "科大讯飞": Spark as unknown as IconWithColor,
  "iFlytek": Spark as unknown as IconWithColor,
  
  // Other providers
  "NVIDIA": Nvidia as unknown as IconWithColor,
  "Nvidia": Nvidia as unknown as IconWithColor,
  "Perplexity": Perplexity as unknown as IconWithColor,
  "Perplexity AI": Perplexity as unknown as IconWithColor,
  "Hugging Face": HuggingFace as unknown as IconWithColor,
  "HuggingFace": HuggingFace as unknown as IconWithColor,
  "Ollama": Ollama as unknown as IconWithColor,
};

// Model family to Icon mapping (fallback if developer not found)
const familyColorIcons: Record<string, IconWithColor> = {
  "GPT": OpenAI as unknown as IconWithColor,
  "Claude": Claude as unknown as IconWithColor,
  "Gemini": Gemini as unknown as IconWithColor,
  "Llama": Meta as unknown as IconWithColor,
  "Qwen": Qwen as unknown as IconWithColor,
  "GLM": ZAI as unknown as IconWithColor,
  "Mistral": Mistral as unknown as IconWithColor,
  "Mixtral": Mistral as unknown as IconWithColor,
  "DeepSeek": DeepSeek as unknown as IconWithColor,
  "Yi": Yi as unknown as IconWithColor,
  "Baichuan": Baichuan as unknown as IconWithColor,
  "ERNIE": Wenxin as unknown as IconWithColor,
  "Doubao": Doubao as unknown as IconWithColor,
  "Moonshot": Moonshot as unknown as IconWithColor,
  "Kimi": Moonshot as unknown as IconWithColor,
  "MiniMax": Minimax as unknown as IconWithColor,
  "Spark": Spark as unknown as IconWithColor,
  "Hunyuan": Hunyuan as unknown as IconWithColor,
  "Phi": OpenAI as unknown as IconWithColor,
  "Grok": Grok as unknown as IconWithColor,
};

// Model name keywords to Icon mapping (most specific)
const modelKeywordColorIcons: Record<string, IconWithColor> = {
  "gpt": OpenAI as unknown as IconWithColor,
  "o1": OpenAI as unknown as IconWithColor,
  "o3": OpenAI as unknown as IconWithColor,
  "o4": OpenAI as unknown as IconWithColor,
  "claude": Claude as unknown as IconWithColor,
  "gemini": Gemini as unknown as IconWithColor,
  "gemma": Google as unknown as IconWithColor,
  "llama": Meta as unknown as IconWithColor,
  "qwen": Qwen as unknown as IconWithColor,
  "glm": ZAI as unknown as IconWithColor,
  "deepseek": DeepSeek as unknown as IconWithColor,
  "mistral": Mistral as unknown as IconWithColor,
  "mixtral": Mistral as unknown as IconWithColor,
  "codestral": Mistral as unknown as IconWithColor,
  "yi-": Yi as unknown as IconWithColor,
  "baichuan": Baichuan as unknown as IconWithColor,
  "ernie": Wenxin as unknown as IconWithColor,
  "doubao": Doubao as unknown as IconWithColor,
  "moonshot": Moonshot as unknown as IconWithColor,
  "kimi": Moonshot as unknown as IconWithColor,
  "minimax": Minimax as unknown as IconWithColor,
  "spark": Spark as unknown as IconWithColor,
  "hunyuan": Hunyuan as unknown as IconWithColor,
  "phi-": OpenAI as unknown as IconWithColor,
  "grok": Grok as unknown as IconWithColor,
};

/**
 * 获取模型对应的彩色图标组件
 */
function getColorIcon(
  modelName: string,
  developer: string,
  family?: string | null
): IconWithColor | null {
  const nameLower = modelName.toLowerCase();
  
  // 1. Try to match by model name keywords (most specific)
  for (const [keyword, Icon] of Object.entries(modelKeywordColorIcons)) {
    if (nameLower.includes(keyword)) {
      return Icon;
    }
  }
  
  // 2. Try to match by developer
  if (developerColorIcons[developer]) {
    return developerColorIcons[developer];
  }
  
  // 3. Try to match by family
  if (family && familyColorIcons[family]) {
    return familyColorIcons[family];
  }
  
  return null;
}

/**
 * React 组件：根据模型信息自动选择彩色图标
 */
export function ModelIcon({
  name,
  developer,
  family,
  size = 24,
  className = "",
}: {
  name: string;
  developer: string;
  family?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = getColorIcon(name, developer, family);
  
  // 使用彩色版本 (.Color)，如果没有则使用普通版本
  if (Icon) {
    if (Icon.Color) {
      const ColorIcon = Icon.Color;
      return <ColorIcon size={size} className={className} />;
    }
    // 如果没有 Color 变体，直接使用图标本身
    return <Icon size={size} className={className} />;
  }
  
  // Fallback to Sparkles icon
  return <Sparkles size={size} className={className} />;
}

/**
 * React 组件：单色图标版本（备用）
 */
export function ModelIconMono({
  name,
  developer,
  family,
  size = 24,
  className = "",
}: {
  name: string;
  developer: string;
  family?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = getColorIcon(name, developer, family);
  
  if (Icon) {
    return <Icon size={size} className={className} />;
  }
  
  return <Sparkles size={size} className={className} />;
}
