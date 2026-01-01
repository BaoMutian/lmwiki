/**
 * Model Icon Mapping
 * 
 * 使用 @lobehub/icons 为模型提供统一的图标
 * 参考: https://icons.lobehub.com/
 */

"use client";

import {
  OpenAI,
  Anthropic,
  Meta,
  Google,
  Mistral,
  Cohere,
  Ai21,
  Zhipu,
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
  Groq,
  Together,
  Claude,
  Gemini,
  ChatGLM,
  Spark,
  Grok,
  XAI,
  HuggingFace,
  Ollama,
  type IconType,
} from "@lobehub/icons";
import { Sparkles } from "lucide-react";
import type { ComponentType, FC } from "react";

export interface ModelIconProps {
  size?: number;
  className?: string;
}

// Developer to Icon mapping
const developerIcons: Record<string, IconType> = {
  // Major providers
  "OpenAI": OpenAI,
  "Anthropic": Anthropic,
  "Meta": Meta,
  "Google": Google,
  "Google DeepMind": Google,
  "Mistral AI": Mistral,
  "Mistral": Mistral,
  "Cohere": Cohere,
  "AI21 Labs": Ai21,
  "AI21": Ai21,
  
  // xAI
  "xAI": XAI,
  "X.AI": XAI,
  
  // Chinese providers
  "智谱AI": Zhipu,
  "Zhipu AI": Zhipu,
  "Zhipu": Zhipu,
  "百川智能": Baichuan,
  "Baichuan": Baichuan,
  "月之暗面": Moonshot,
  "Moonshot AI": Moonshot,
  "Moonshot": Moonshot,
  "DeepSeek": DeepSeek,
  "深度求索": DeepSeek,
  "Alibaba": Alibaba,
  "阿里巴巴": Alibaba,
  "阿里云": Qwen,
  "Qwen": Qwen,
  "通义千问": Qwen,
  "零一万物": Yi,
  "01.AI": Yi,
  "Yi": Yi,
  "MiniMax": Minimax,
  "百度": Wenxin,
  "Baidu": Wenxin,
  "腾讯": Hunyuan,
  "Tencent": Hunyuan,
  "字节跳动": Doubao,
  "ByteDance": Doubao,
  "科大讯飞": Spark,
  "iFlytek": Spark,
  
  // Other providers
  "NVIDIA": Nvidia,
  "Nvidia": Nvidia,
  "Perplexity": Perplexity,
  "Perplexity AI": Perplexity,
  "Groq": Groq,
  "Together AI": Together,
  "Together": Together,
  "Hugging Face": HuggingFace,
  "HuggingFace": HuggingFace,
  "Ollama": Ollama,
};

// Model family to Icon mapping (fallback if developer not found)
const familyIcons: Record<string, IconType> = {
  "GPT": OpenAI,
  "Claude": Claude,
  "Gemini": Gemini,
  "Llama": Meta,
  "Qwen": Qwen,
  "GLM": ChatGLM,
  "ChatGLM": ChatGLM,
  "Mistral": Mistral,
  "Mixtral": Mistral,
  "DeepSeek": DeepSeek,
  "Yi": Yi,
  "Baichuan": Baichuan,
  "ERNIE": Wenxin,
  "Doubao": Doubao,
  "Moonshot": Moonshot,
  "Kimi": Moonshot,
  "MiniMax": Minimax,
  "Spark": Spark,
  "Hunyuan": Hunyuan,
  "Phi": OpenAI,
  "Command": Cohere,
  "Jamba": Ai21,
  "Grok": Grok,
};

// Model name keywords to Icon mapping (most specific)
const modelKeywordIcons: Record<string, IconType> = {
  "gpt": OpenAI,
  "o1": OpenAI,
  "o3": OpenAI,
  "o4": OpenAI,
  "claude": Claude,
  "gemini": Gemini,
  "gemma": Google,
  "llama": Meta,
  "qwen": Qwen,
  "glm": ChatGLM,
  "deepseek": DeepSeek,
  "mistral": Mistral,
  "mixtral": Mistral,
  "codestral": Mistral,
  "yi-": Yi,
  "baichuan": Baichuan,
  "ernie": Wenxin,
  "doubao": Doubao,
  "moonshot": Moonshot,
  "kimi": Moonshot,
  "minimax": Minimax,
  "spark": Spark,
  "hunyuan": Hunyuan,
  "command": Cohere,
  "phi-": OpenAI,
  "grok": Grok,
};

// Fallback icon component
const FallbackIcon: FC<ModelIconProps> = ({ size = 24, className }) => (
  <Sparkles size={size} className={className} />
);

/**
 * 获取模型对应的图标组件
 */
export function getModelIcon(
  modelName: string,
  developer: string,
  family?: string | null
): ComponentType<ModelIconProps> {
  const nameLower = modelName.toLowerCase();
  
  // 1. Try to match by model name keywords (most specific)
  for (const [keyword, Icon] of Object.entries(modelKeywordIcons)) {
    if (nameLower.includes(keyword)) {
      return Icon as unknown as ComponentType<ModelIconProps>;
    }
  }
  
  // 2. Try to match by developer
  if (developerIcons[developer]) {
    return developerIcons[developer] as unknown as ComponentType<ModelIconProps>;
  }
  
  // 3. Try to match by family
  if (family && familyIcons[family]) {
    return familyIcons[family] as unknown as ComponentType<ModelIconProps>;
  }
  
  // 4. Fallback to generic icon
  return FallbackIcon;
}

/**
 * React 组件：根据模型信息自动选择图标
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
  const IconComponent = getModelIcon(name, developer, family);
  
  return (
    <IconComponent 
      size={size} 
      className={className}
    />
  );
}
