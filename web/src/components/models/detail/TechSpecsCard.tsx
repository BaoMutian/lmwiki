import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Layers, Hash, Database, Clock, Zap } from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface TechSpecsCardProps {
  model: ParsedModel;
}

export function TechSpecsCard({ model }: TechSpecsCardProps) {
  const isOpen = model.modelType === "open";

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

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          技术规格
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specs.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-muted/50 border border-border/50"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <div className="text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* Deployment Specs (Open Source Only) */}
        {deploymentSpecs.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              部署信息
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {deploymentSpecs.map(({ label, value }) => (
                <div key={label} className="text-sm">
                  <span className="text-muted-foreground">{label}: </span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fine-tuning Methods */}
        {model.fineTuningMethod.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              微调方式
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.fineTuningMethod.map((method) => (
                <Badge key={method} variant="secondary">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inference Frameworks */}
        {model.inferenceFrameworks.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              推理框架
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.inferenceFrameworks.map((framework) => (
                <Badge key={framework} variant="outline">
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quantization Options */}
        {model.quantizationAvailable.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              量化版本
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.quantizationAvailable.map((quant) => (
                <Badge key={quant} variant="outline" className="bg-muted/50">
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

