"use client";

import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Bookmark, 
  Share2, 
  GitCompare
} from "lucide-react";
import type { ParsedModel } from "@/lib/db/models";

interface ActionBarProps {
  model: ParsedModel;
}

export function ActionBar({ model }: ActionBarProps) {
  // Get the best "try it" URL
  const tryUrl = model.urlDemo || model.urlWebsite || model.urlHuggingface;

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${model.name} - LMWiki`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert("链接已复制到剪贴板");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Model Info Summary */}
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{model.name}</span>
            {model.paramsTotal && <span>{model.paramsTotal}B 参数</span>}
            {model.pricingInput !== null && (
              <span>${model.pricingInput}/1M 输入</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled
              title="即将推出"
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">收藏</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled
              title="即将推出"
            >
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">对比</span>
            </Button>

            {tryUrl && (
              <a href={tryUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  去试用
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

