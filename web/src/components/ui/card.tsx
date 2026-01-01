import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component - iOS/macOS Aesthetics
 * 
 * 设计规范：
 * - 超椭圆圆角 (rounded-[20px])
 * - 细腻扩散阴影 (iOS style shadow)
 * - 无边框线条
 * - 充足内边距
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styles
        "bg-card text-card-foreground",
        // Layout
        "flex flex-col",
        // iOS squircle corners
        "rounded-[20px]",
        // Subtle shadow instead of border
        "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.06)]",
        "dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_4px_24px_rgba(0,0,0,0.3)]",
        // Optional very subtle border for definition
        "ring-1 ring-black/[0.03] dark:ring-white/[0.05]",
        // Spacing
        "p-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "ml-auto",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
