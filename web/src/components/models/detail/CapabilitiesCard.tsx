"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Brain, 
  Wrench, 
  Code, 
  FileJson,
  Globe,
  Image,
  Music,
  Video,
  FileText,
  Sparkles
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface CapabilitiesCardProps {
  model: ParsedModel;
}

export function CapabilitiesCard({ model }: CapabilitiesCardProps) {
  // Only include capabilities that are enabled
  const capabilities = [
    { 
      icon: Eye, 
      label: "视觉理解", 
      enabled: model.supportsVision,
      gradient: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-500"
    },
    { 
      icon: Brain, 
      label: "推理思考", 
      enabled: model.supportsReasoning,
      gradient: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-500"
    },
    { 
      icon: Wrench, 
      label: "工具调用", 
      enabled: model.supportsToolUse,
      gradient: "from-green-500/20 to-green-600/10",
      iconColor: "text-green-500"
    },
    { 
      icon: Code, 
      label: "代码能力", 
      enabled: model.codingCapable,
      gradient: "from-orange-500/20 to-orange-600/10",
      iconColor: "text-orange-500"
    },
    { 
      icon: FileJson, 
      label: "JSON模式", 
      enabled: model.supportsJsonMode,
      gradient: "from-yellow-500/20 to-yellow-600/10",
      iconColor: "text-yellow-600"
    },
  ].filter(c => c.enabled); // 只保留启用的能力

  const modalityIcons: Record<string, typeof Globe> = {
    Text: FileText,
    Image: Image,
    Audio: Music,
    Video: Video,
    PDF: FileText,
  };

  const hasModalities = model.modalitiesInput.length > 0 || model.modalitiesOutput.length > 0;
  const hasLanguages = model.languages.length > 0;
  const hasCapabilities = capabilities.length > 0;

  // 如果没有任何内容，不渲染卡片
  if (!hasCapabilities && !hasModalities && !hasLanguages) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          能力特性
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Capability Tags - Only show enabled ones */}
        {hasCapabilities && (
          <div className="flex flex-wrap gap-2">
            {capabilities.map(({ icon: Icon, label, gradient, iconColor }) => (
              <div
                key={label}
                className={`
                  flex items-center gap-2 px-3 py-2 
                  rounded-xl bg-gradient-to-r ${gradient}
                  ring-1 ring-black/[0.03] dark:ring-white/[0.06]
                `}
              >
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input Modalities */}
        {model.modalitiesInput.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              输入模态
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.modalitiesInput.map((modality) => {
                const Icon = modalityIcons[modality] || Globe;
                return (
                  <Badge 
                    key={modality} 
                    variant="secondary" 
                    className="gap-1.5 px-2.5 py-1 rounded-lg"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {modality}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Output Modalities */}
        {model.modalitiesOutput.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              输出模态
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.modalitiesOutput.map((modality) => {
                const Icon = modalityIcons[modality] || Globe;
                return (
                  <Badge 
                    key={modality} 
                    variant="outline" 
                    className="gap-1.5 px-2.5 py-1 rounded-lg"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {modality}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Languages */}
        {model.languages.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              支持语言
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.languages.map((lang) => (
                <Badge 
                  key={lang} 
                  variant="outline" 
                  className="gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30"
                >
                  <Globe className="h-3 w-3" />
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
