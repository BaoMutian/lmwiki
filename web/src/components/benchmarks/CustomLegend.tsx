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
  /** 当前高亮的 dataKey（悬停时） */
  activeDataKey?: string | null;
  /** 悬停回调 */
  onHover?: (dataKey: string | null) => void;
}

/**
 * Apple 风格自定义图例组件
 * 
 * 特点：
 * - 圆形色点图标
 * - 宽松的间距
 * - 精致的字体样式
 * - 居中排列
 * - 悬停高亮交互
 */
export function CustomLegend({
  payload,
  className,
  activeDataKey,
  onHover,
}: CustomLegendProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8 pb-2",
        className
      )}
      onMouseLeave={() => onHover?.(null)}
    >
      {payload.map((entry, index) => {
        const dataKey = entry.dataKey || entry.value;
        const isActive = activeDataKey === null || activeDataKey === dataKey;
        const isHighlighted = activeDataKey === dataKey;

        return (
          <div
            key={`legend-${index}`}
            className={cn(
              "flex items-center gap-2.5 cursor-pointer select-none transition-all duration-200",
              isActive ? "opacity-100" : "opacity-30"
            )}
            onMouseEnter={() => onHover?.(dataKey)}
          >
            {/* 圆形色点 */}
            <span
              className={cn(
                "w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-background transition-all duration-200",
                isHighlighted && "scale-125 ring-4"
              )}
              style={{
                backgroundColor: entry.color,
                // @ts-expect-error CSS custom property
                "--tw-ring-color": `${entry.color}40`,
              }}
            />
            {/* 图例文本 */}
            <span
              className={cn(
                "text-[13px] font-medium transition-colors duration-200 tracking-tight",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
              }}
            >
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
