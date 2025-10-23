import {
  queryPublishedPosts,
  searchPostsWithFilters,
  getAllCategories,
  getAllTags,
} from "@/lib/actions/post";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostFilters } from "./post-filters";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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
  const page = Number((await searchParams).page) || 1;
  const searchTerm = (await searchParams).search || "";
  const categorySlug = (await searchParams).category || "";
  const tagSlug = (await searchParams).tag || "";
  const pageSize = 9; // 3x3 grid

  // 决定使用向量搜索还是传统查询
  const useVectorSearch = Boolean(searchTerm.trim());
  console.log("useVectorSearch", useVectorSearch);

  // Fetch posts, categories and tags in parallel
  const [result, categoriesResult, tagsResult] = await Promise.all([
    useVectorSearch
      ? searchPostsWithFilters(searchTerm, {
          page,
          pageSize,
          categorySlug,
          tagSlug,
          onlyPublished: true,
        })
      : queryPublishedPosts(page, pageSize, "", categorySlug, tagSlug),
    getAllCategories(),
    getAllTags(),
  ]);

  const categories = categoriesResult.success
    ? categoriesResult.categories
    : [];
  const tags = tagsResult.success ? tagsResult.tags : [];

  // Calculate reading time helper
  const getReadingTime = (content: string) => {
    const wordsCount = content.split(/\s+/).length;
    return Math.ceil(wordsCount / 200);
  };

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
                    <span> · Found {result.totalCount} relevant articles</span>
                  )}
                </span>
              </div>
            )}

            {/* Filters */}
            <PostFilters categories={categories} tags={tags} />
          </div>

          {/* Posts Grid */}
          {result.success && result.posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {result.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-border hover:scale-101">
                      {/* Cover Image */}
                      <div className="relative w-full h-56 bg-muted overflow-hidden">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-101 transition-transform duration-500 p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-5xl font-bold text-primary/30">
                              {post.title[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold uppercase tracking-wide"
                          >
                            {post.category.name}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h2>

                        {/* Brief */}
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                          {post.brief}
                        </p>

                        {/* Meta Information */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getReadingTime(post.content)} min read</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  {/* Previous Button */}
                  {result.currentPage > 1 && (
                    <Link
                      href={`/posts?page=${result.currentPage - 1}${
                        searchTerm ? `&search=${searchTerm}` : ""
                      }${categorySlug ? `&category=${categorySlug}` : ""}${
                        tagSlug ? `&tag=${tagSlug}` : ""
                      }`}
                    >
                      <Button variant="ghost" size="icon" className="w-10 h-10">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                      .filter((pageNum) => {
                        // Show first 3 pages, last page, current page and adjacent pages
                        if (pageNum <= 3) return true;
                        if (pageNum === result.totalPages) return true;
                        if (Math.abs(pageNum - result.currentPage) <= 1)
                          return true;
                        return false;
                      })
                      .map((pageNum, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && pageNum - prevPage > 1;

                        return (
                          <div key={pageNum} className="flex items-center">
                            {showEllipsis && (
                              <span className="px-2 text-muted-foreground text-sm">
                                ...
                              </span>
                            )}
                            <Link
                              href={`/posts?page=${pageNum}${
                                searchTerm ? `&search=${searchTerm}` : ""
                              }${
                                categorySlug ? `&category=${categorySlug}` : ""
                              }${tagSlug ? `&tag=${tagSlug}` : ""}`}
                            >
                              <Button
                                variant={
                                  result.currentPage === pageNum
                                    ? "default"
                                    : "ghost"
                                }
                                size="icon"
                                className="w-10 h-10"
                              >
                                {pageNum}
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next Button */}
                  {result.currentPage < result.totalPages && (
                    <Link
                      href={`/posts?page=${result.currentPage + 1}${
                        searchTerm ? `&search=${searchTerm}` : ""
                      }${categorySlug ? `&category=${categorySlug}` : ""}${
                        tagSlug ? `&tag=${tagSlug}` : ""
                      }`}
                    >
                      <Button variant="ghost" size="icon" className="w-10 h-10">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                {searchTerm || categorySlug || tagSlug
                  ? "No posts found with the selected filters"
                  : "No posts available yet"}
              </p>
              {(categorySlug || tagSlug) && (
                <Link href="/posts">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
