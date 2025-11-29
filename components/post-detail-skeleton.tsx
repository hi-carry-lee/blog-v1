import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function PostDetailSkeleton() {
  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Cover Image Skeleton */}
      <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden mb-8">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-32 mb-6" />

      {/* Category Badge Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Title Skeleton */}
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-12 w-4/5 mb-6" />

      {/* Brief Skeleton */}
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-5/6 mb-8" />

      {/* Author & Meta Info Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-8 mb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback>
              <Skeleton className="w-full h-full rounded-full" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Tags Skeleton */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
      </div>

      {/* Article Content Skeleton */}
      <div className="mb-12 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Comments Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 pb-4 border-b border-border">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                <Skeleton className="w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
