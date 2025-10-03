import { queryAllPosts } from "@/lib/actions/post";
import PostTable from "./post-table";

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const searchTerm = params.search || "";

  const result = await queryAllPosts(page, 10, searchTerm);

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
      <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-6xl mx-auto">
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
