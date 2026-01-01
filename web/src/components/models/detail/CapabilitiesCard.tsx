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
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedModel } from "@/lib/db/models";

interface CapabilitiesCardProps {
  model: ParsedModel;
}

export function CapabilitiesCard({ model }: CapabilitiesCardProps) {
  const capabilities = [
    { 
      icon: Eye, 
      label: "视觉理解", 
      enabled: model.supportsVision,
      color: "text-purple-500"
    },
    { 
      icon: Brain, 
      label: "推理思考", 
      enabled: model.supportsReasoning,
      color: "text-blue-500"
    },
    { 
      icon: Wrench, 
      label: "工具调用", 
      enabled: model.supportsToolUse,
      color: "text-green-500"
    },
    { 
      icon: Code, 
      label: "代码能力", 
      enabled: model.codingCapable,
      color: "text-orange-500"
    },
    { 
      icon: FileJson, 
      label: "JSON模式", 
      enabled: model.supportsJsonMode,
      color: "text-yellow-500"
    },
  ];

  const modalityIcons: Record<string, typeof Globe> = {
    Text: FileText,
    Image: Image,
    Audio: Music,
    Video: Video,
    PDF: FileText,
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          能力特性
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capability Toggles */}
        <div className="grid grid-cols-2 gap-3">
          {capabilities.map(({ icon: Icon, label, enabled, color }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                enabled
                  ? "bg-muted/50 border-border/50"
                  : "bg-muted/20 border-transparent opacity-50"
              )}
            >
              <Icon className={cn("h-4 w-4", enabled ? color : "text-muted-foreground")} />
              <span className="text-sm font-medium">{label}</span>
              {enabled && (
                <span className="ml-auto text-xs text-green-500">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Input Modalities */}
        {model.modalitiesInput.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              输入模态
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.modalitiesInput.map((modality) => {
                const Icon = modalityIcons[modality] || Globe;
                return (
                  <Badge key={modality} variant="secondary" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {modality}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Output Modalities */}
        {model.modalitiesOutput.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              输出模态
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.modalitiesOutput.map((modality) => {
                const Icon = modalityIcons[modality] || Globe;
                return (
                  <Badge key={modality} variant="outline" className="gap-1">
                    <Icon className="h-3 w-3" />
                    {modality}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Languages */}
        {model.languages.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              支持语言
            </h4>
            <div className="flex flex-wrap gap-2">
              {model.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="bg-muted/30">
                  <Globe className="h-3 w-3 mr-1" />
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

