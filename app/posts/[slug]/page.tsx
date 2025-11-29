import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, incrementPostViews } from "@/lib/actions/post";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PostDetailSkeleton } from "@/components/post-detail-skeleton";
import { PostDetailContent } from "./post-detail-content";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublishedPostBySlug(slug);

  if (!result.success || !result.post) {
    notFound();
  }

  const post = result.post;

  // 异步增加浏览量（不阻塞页面渲染）
  incrementPostViews(post.id).catch((error) =>
    console.error("Failed to increment views:", error)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PostDetailSkeleton />}>
          <PostDetailContent post={post} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
