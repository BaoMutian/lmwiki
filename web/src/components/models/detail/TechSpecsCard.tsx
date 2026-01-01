"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Layers, Hash, Database, Clock, Zap } from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface TechSpecsCardProps {
  model: ParsedModel;
}

export function TechSpecsCard({ model }: TechSpecsCardProps) {
  const isOpen = model.modelType === "open";

  // 核心规格 - 过滤掉空值
  const specs = [
    {
      icon: Cpu,
      label: "架构",
      value: model.architecture,
      show: isOpen && model.architecture,
    },
    {
      icon: Hash,
      label: "总参数量",
      value: model.paramsTotal ? `${model.paramsTotal}B` : null,
      show: model.paramsTotal,
    },
    {
      icon: Zap,
      label: "激活参数",
      value: model.paramsActive ? `${model.paramsActive}B` : null,
      show: model.paramsActive,
    },
    {
      icon: Database,
      label: "上下文窗口",
      value: model.contextWindow ? formatNumber(model.contextWindow) : null,
      show: model.contextWindow,
    },
    {
      icon: Layers,
      label: "最大输出",
      value: model.maxOutputTokens ? formatNumber(model.maxOutputTokens) : null,
      show: model.maxOutputTokens,
    },
    {
      icon: Clock,
      label: "知识截止",
      value: model.knowledgeCutoff,
      show: model.knowledgeCutoff,
    },
  ].filter((s) => s.show);

  // 部署规格 (仅开源模型)
  const deploymentSpecs = isOpen
    ? [
        { label: "模型大小", value: model.modelSize ? `${model.modelSize} GB` : null },
        { label: "Tensor类型", value: model.tensorType },
        { label: "模型格式", value: model.modelFormat },
        { label: "文件数量", value: model.numFiles?.toString() },
        { label: "词表大小", value: model.vocabSize ? formatNumber(model.vocabSize) : null },
        { label: "网络层数", value: model.layers?.toString() },
        { label: "注意力机制", value: model.attentionMechanism },
      ].filter((s) => s.value)
    : [];

  const hasSpecs = specs.length > 0;
  const hasDeployment = deploymentSpecs.length > 0;
  const hasFineTuning = model.fineTuningMethod.length > 0;
  const hasFrameworks = model.inferenceFrameworks.length > 0;
  const hasQuantization = model.quantizationAvailable.length > 0;

  // 如果没有任何技术规格数据，不渲染整个卡片
  if (!hasSpecs && !hasDeployment && !hasFineTuning && !hasFrameworks && !hasQuantization) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/5">
            <Cpu className="h-4 w-4 text-blue-500" />
          </div>
          技术规格
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Specs Grid */}
        {hasSpecs && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-4 rounded-2xl bg-muted/40 ring-1 ring-black/[0.02] dark:ring-white/[0.04]"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <div className="text-base font-semibold">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Deployment Specs (Open Source Only) */}
        {hasDeployment && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              部署信息
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
              {deploymentSpecs.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5 text-sm">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fine-tuning Methods */}
        {hasFineTuning && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              微调方式
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.fineTuningMethod.map((method) => (
                <Badge key={method} variant="secondary" className="rounded-lg px-2.5 py-1">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inference Frameworks */}
        {hasFrameworks && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              推理框架
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.inferenceFrameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="rounded-lg px-2.5 py-1">
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quantization Options */}
        {hasQuantization && (
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              量化版本
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.quantizationAvailable.map((quant) => (
                <Badge key={quant} variant="outline" className="rounded-lg px-2.5 py-1 bg-muted/30">
                  {quant}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toLocaleString();
}
