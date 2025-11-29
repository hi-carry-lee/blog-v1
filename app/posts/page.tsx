import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PostsGridSkeleton } from "@/components/posts-grid-skeleton";
import { PostsContent } from "./posts-content";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              All Articles
            </h1>
          </div>

          {/* Posts Content with Suspense */}
          <Suspense fallback={<PostsGridSkeleton />}>
            <PostsContent searchParams={params} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
