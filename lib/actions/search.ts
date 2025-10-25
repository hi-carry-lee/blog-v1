"use server";

import { searchPosts } from "@/lib/actions/post-embedding";

export async function searchPostsAction(
  query: string,
  options: {
    page?: number;
    limit?: number;
    minSimilarity?: number;
  } = {}
) {
  try {
    if (!query.trim()) {
      return {
        success: false,
        error: "搜索内容不能为空",
        posts: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        searchQuery: query,
      };
    }

    const result = await searchPosts(query, options);
    return result;
  } catch (error) {
    console.error("Search action error:", error);
    return {
      success: false,
      error: "搜索失败，请稍后重试",
      posts: [],
      totalCount: 0,
      currentPage: options.page || 1,
      totalPages: 0,
      searchQuery: query,
    };
  }
}
