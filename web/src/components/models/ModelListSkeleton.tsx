import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ModelListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />

                {/* Tags */}
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* Icons */}
                <div className="flex gap-1.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="w-8 h-8 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

