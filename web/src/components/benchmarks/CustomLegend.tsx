"use client";

import { cn } from "@/lib/utils";

interface LegendPayloadItem {
  value: string;
  color: string;
  dataKey?: string;
  type?: string;
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
  className?: string;
}

/**
 * Apple 风格自定义图例组件
 * 
 * 特点：
 * - 圆形色点图标
 * - 宽松的间距
 * - 精致的字体样式
 * - 居中排列
 */
export function CustomLegend({ payload, className }: CustomLegendProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8 pb-2",
        className
      )}
    >
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-2.5 group cursor-default"
        >
          {/* 圆形色点 */}
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background transition-transform group-hover:scale-110"
            style={{
              backgroundColor: entry.color,
              ringColor: `${entry.color}40`,
            }}
          />
          {/* 图例文本 */}
          <span
            className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors tracking-tight"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

