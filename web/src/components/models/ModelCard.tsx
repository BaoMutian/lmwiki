"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Eye, 
  Wrench, 
  Code, 
  ExternalLink,
  Lock,
  Unlock
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";
import { ModelIcon } from "@/lib/icons";

interface ModelCardProps {
  model: ParsedModel;
  view?: "grid" | "list";
}

export function ModelCard({ model, view = "grid" }: ModelCardProps) {
  const isOpen = model.modelType === "open";
  
  // Get capability icons
  const capabilities = [
    { key: "vision", icon: Eye, label: "视觉", enabled: model.supportsVision },
    { key: "reasoning", icon: Brain, label: "推理", enabled: model.supportsReasoning },
    { key: "tool", icon: Wrench, label: "工具", enabled: model.supportsToolUse },
    { key: "code", icon: Code, label: "代码", enabled: model.codingCapable },
  ].filter((c) => c.enabled);

  if (view === "list") {
    return (
      <Link href={`/models/${model.slug}`}>
        <Card className="group hover-lift border-border/50 hover:border-primary/30 transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="shrink-0 w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                <ModelIcon 
                  name={model.name}
                  developer={model.developer}
                  family={model.family}
                  size={28}
                  className="text-foreground"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {model.name}
                  </h3>
                  {isOpen ? (
                    <Badge variant="outline" className="shrink-0 text-green-600 border-green-600/30 bg-green-500/10">
                      <Unlock className="h-3 w-3 mr-1" />
                      开源
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-blue-600 border-blue-600/30 bg-blue-500/10">
                      <Lock className="h-3 w-3 mr-1" />
                      闭源
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {model.developer}
                  {model.releaseDate && ` · ${model.releaseDate}`}
                </p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                {model.paramsTotal && (
                  <div className="text-center">
                    <div className="font-medium">{model.paramsTotal}B</div>
                    <div className="text-xs text-muted-foreground">参数</div>
                  </div>
                )}
                {model.contextWindow && (
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(model.contextWindow)}</div>
                    <div className="text-xs text-muted-foreground">上下文</div>
                  </div>
                )}
                {model.pricingInput !== null && (
                  <div className="text-center">
                    <div className="font-medium">${model.pricingInput}</div>
                    <div className="text-xs text-muted-foreground">/1M输入</div>
                  </div>
                )}
              </div>

              {/* Capabilities */}
              <div className="hidden lg:flex items-center gap-1">
                {capabilities.map(({ key, icon: Icon, label }) => (
                  <div
                    key={key}
                    className="p-1.5 rounded-md bg-muted text-muted-foreground"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/models/${model.slug}`}>
      <Card className="group h-full hover-lift border-border/50 hover:border-primary/30 transition-all duration-200 overflow-hidden">
        <CardContent className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Logo */}
            <div className="shrink-0 w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              <ModelIcon 
                name={model.name}
                developer={model.developer}
                family={model.family}
                size={32}
                className="text-foreground"
              />
            </div>

            {/* Type Badge */}
            {isOpen ? (
              <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/10">
                <Unlock className="h-3 w-3 mr-1" />
                开源
              </Badge>
            ) : (
              <Badge variant="outline" className="text-blue-600 border-blue-600/30 bg-blue-500/10">
                <Lock className="h-3 w-3 mr-1" />
                闭源
              </Badge>
            )}
          </div>

          {/* Model Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {model.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {model.developer}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              {model.paramsTotal && (
                <Badge variant="secondary" className="font-normal">
                  {model.paramsTotal}B 参数
                </Badge>
              )}
              {model.contextWindow && (
                <Badge variant="secondary" className="font-normal">
                  {formatNumber(model.contextWindow)} ctx
                </Badge>
              )}
              {model.architecture && (
                <Badge variant="secondary" className="font-normal">
                  {model.architecture}
                </Badge>
              )}
            </div>

            {/* Capabilities Icons */}
            {capabilities.length > 0 && (
              <div className="flex items-center gap-1.5">
                {capabilities.map(({ key, icon: Icon, label }) => (
                  <div
                    key={key}
                    className="p-1.5 rounded-md bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            {model.releaseDate && (
              <span className="text-xs text-muted-foreground">
                {model.releaseDate}
              </span>
            )}
            {model.pricingInput !== null && (
              <span className="text-xs font-medium">
                ${model.pricingInput}/1M
              </span>
            )}
            {!model.releaseDate && model.pricingInput === null && (
              <span className="text-xs text-muted-foreground">
                {model.family || "Unknown"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
}
