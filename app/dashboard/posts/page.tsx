import { queryAllPosts, searchPostsWithFilters } from "@/lib/actions/post";
import PostTable from "./post-table";
import { Sparkles } from "lucide-react";

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const searchTerm = params.search || "";

  // 使用向量搜索或传统查询
  const useVectorSearch = Boolean(searchTerm.trim());

  const result = useVectorSearch
    ? await searchPostsWithFilters(searchTerm, {
        page,
        pageSize: 10,
        onlyPublished: false, // 管理员可以看到所有文章
      })
    : await queryAllPosts(page, 10, "");

  if (!result.success) {
    return (
      <div className="bg-background min-h-full">
        <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-6xl mx-auto">
          <div className="text-center text-destructive">
            Failed to load posts: {result.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-7xl mx-auto">
        {/* Search Result Info */}
        {useVectorSearch && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>
              AI-powered search results for{" "}
              <span className="font-semibold text-foreground">
                &quot;{searchTerm}&quot;
              </span>
              {result.success && result.totalCount > 0 && (
                <span> · Found {result.totalCount} articles</span>
              )}
            </span>
          </div>
        )}

        <PostTable
          initialPosts={result.posts}
          totalPages={result.totalPages}
          currentPage={result.currentPage}
          totalCount={result.totalCount}
        />
      </div>
    </div>
  );
}
