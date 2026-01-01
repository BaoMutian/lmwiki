"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowDownLeft, ArrowUpRight, Gift, Check, X } from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface PricingCardProps {
  model: ParsedModel;
}

export function PricingCard({ model }: PricingCardProps) {
  const isOpen = model.modelType === "open";
  const hasLicense = model.license || model.commercialUseAllowed !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/5">
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          定价信息
          {model.freeTierAvailable && (
            <Badge 
              variant="outline" 
              className="ml-auto gap-1 rounded-lg text-green-600 border-green-500/30 bg-green-500/10"
            >
              <Gift className="h-3 w-3" />
              免费额度
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* API Pricing */}
        <div className="grid grid-cols-2 gap-3">
          {model.pricingInput !== null && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-600/10 ring-1 ring-blue-500/10 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500/70 mb-2">
                <ArrowDownLeft className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">输入</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${model.pricingInput}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/1M tokens</div>
            </div>
          )}
          {model.pricingOutput !== null && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-purple-600/10 ring-1 ring-purple-500/10 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500/70 mb-2">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">输出</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${model.pricingOutput}
              </div>
              <div className="text-xs text-muted-foreground mt-1">/1M tokens</div>
            </div>
          )}
        </div>

        {/* Open Source Licensing */}
        {isOpen && hasLicense && (
          <div className="space-y-3 pt-2">
            {model.license && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">许可协议</span>
                <Badge variant="secondary" className="rounded-lg">{model.license}</Badge>
              </div>
            )}
            {model.commercialUseAllowed !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">商用许可</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  model.commercialUseAllowed 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-500"
                }`}>
                  {model.commercialUseAllowed ? (
                    <>
                      <Check className="h-4 w-4" />
                      允许
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      不允许
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
