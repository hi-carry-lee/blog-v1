// Recommended return type for searchPosts
export interface SearchPostResult {
  success: boolean;
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    brief: string;
    content: string;
    coverImage: string | null;
    publishedAt: Date | null;
    views: number;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    author: {
      id: string;
      name: string;
      image: string | null;
    };
    tags: {
      id: string;
      name: string;
      slug: string;
    }[];
    similarity: number; // Keep this for search relevance
    snippet: string; // Keep this for search context
  }>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
}
