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
    <section className="relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 pt-6 pb-10">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Logo - iOS style rounded square */}
          <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-[24px] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden ring-1 ring-black/[0.04] dark:ring-white/[0.08] shadow-xl shadow-black/5">
            <ModelIcon 
              name={model.name}
              developer={model.developer}
              family={model.family}
              size={56}
              className="text-foreground"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Title Row */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {model.name}
              </h1>
              {isOpen ? (
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-0 rounded-lg px-2.5 py-1">
                  <Unlock className="h-3.5 w-3.5 mr-1.5" />
                  开源
                </Badge>
              ) : (
                <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0 rounded-lg px-2.5 py-1">
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  闭源
                </Badge>
              )}
              {model.branchType && (
                <Badge variant="secondary" className="rounded-lg">{model.branchType}</Badge>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{model.developer}</span>
              </div>
              {model.releaseDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{model.releaseDate}</span>
                </div>
              )}
              {model.family && (
                <div className="flex items-center gap-2">
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
              <p className="text-muted-foreground max-w-3xl leading-relaxed text-[15px]">
                {model.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
