import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="h-full overflow-hidden">
          {/* Cover Image Skeleton */}
          <div className="relative w-full h-56 bg-muted">
            <Skeleton className="w-full h-full" />
          </div>

          <CardContent className="p-6">
            {/* Category Badge Skeleton */}
            <div className="mb-3">
              <Skeleton className="h-5 w-20" />
            </div>

            {/* Title Skeleton */}
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-3" />

            {/* Brief Skeleton */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />

            {/* Meta Information Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
