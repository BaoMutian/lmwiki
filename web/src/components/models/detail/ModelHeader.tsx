"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Calendar,
  Building2,
  GitBranch
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";
import { ModelIcon } from "@/lib/icons";

interface ModelHeaderProps {
  model: ParsedModel;
}

export function ModelHeader({ model }: ModelHeaderProps) {
  const isOpen = model.modelType === "open";

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Logo */}
          <div className="shrink-0 w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border/50">
            <ModelIcon 
              name={model.name}
              developer={model.developer}
              family={model.family}
              size={56}
              className="text-foreground"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                {model.name}
              </h1>
              {isOpen ? (
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30">
                  <Unlock className="h-3 w-3 mr-1" />
                  开源
                </Badge>
              ) : (
                <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 hover:bg-blue-500/30">
                  <Lock className="h-3 w-3 mr-1" />
                  闭源
                </Badge>
              )}
              {model.branchType && (
                <Badge variant="outline">{model.branchType}</Badge>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>{model.developer}</span>
              </div>
              {model.releaseDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{model.releaseDate}</span>
                </div>
              )}
              {model.family && (
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4" />
                  <span>{model.family}</span>
                  {model.modelSeries && model.modelSeries !== model.family && (
                    <span className="text-muted-foreground/60">
                      · {model.modelSeries}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {model.description && (
              <p className="text-muted-foreground max-w-3xl leading-relaxed">
                {model.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
