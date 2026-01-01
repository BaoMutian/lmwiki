"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedModel } from "@/lib/db/models";

interface VariantSwitcherProps {
  variants: ParsedModel[];
  currentSlug: string;
  baseModelName: string;
}

export function VariantSwitcher({ variants, currentSlug, baseModelName }: VariantSwitcherProps) {
  // Don't show if only one variant
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Layers className="h-4 w-4" />
        <span>{baseModelName}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {variants.map((variant) => {
          const isCurrent = variant.slug === currentSlug;
          const label = variant.variantType || "Standard";
          
          return (
            <Link key={variant.slug} href={`/models/${variant.slug}`}>
              <Badge
                variant={isCurrent ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  isCurrent 
                    ? "shadow-sm" 
                    : "hover:bg-muted"
                )}
              >
                {label}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

