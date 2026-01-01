import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowDown, ArrowUp, Gift } from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface PricingCardProps {
  model: ParsedModel;
}

export function PricingCard({ model }: PricingCardProps) {
  const isOpen = model.modelType === "open";

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          定价信息
          {model.freeTierAvailable && (
            <Badge variant="outline" className="ml-2 text-green-600 border-green-500/30">
              <Gift className="h-3 w-3 mr-1" />
              有免费额度
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Pricing */}
        <div className="grid grid-cols-2 gap-4">
          {model.pricingInput !== null && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <ArrowDown className="h-4 w-4" />
                <span className="text-xs">输入</span>
              </div>
              <div className="text-2xl font-bold">
                ${model.pricingInput}
              </div>
              <div className="text-xs text-muted-foreground">/1M tokens</div>
            </div>
          )}
          {model.pricingOutput !== null && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <ArrowUp className="h-4 w-4" />
                <span className="text-xs">输出</span>
              </div>
              <div className="text-2xl font-bold">
                ${model.pricingOutput}
              </div>
              <div className="text-xs text-muted-foreground">/1M tokens</div>
            </div>
          )}
        </div>

        {/* Open Source Licensing */}
        {isOpen && (
          <div className="pt-4 border-t border-border/50 space-y-3">
            {model.license && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">许可协议</span>
                <Badge variant="outline">{model.license}</Badge>
              </div>
            )}
            {model.commercialUseAllowed !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">商用许可</span>
                <span className={model.commercialUseAllowed ? "text-green-500" : "text-red-500"}>
                  {model.commercialUseAllowed ? "✓ 允许" : "✗ 不允许"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

