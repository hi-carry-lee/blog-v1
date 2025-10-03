"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type FilterProps = {
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
};

export function PostFilters({ categories, tags }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get("category") || "";
  const tagSlug = searchParams.get("tag") || "";

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to first page
    router.push(`/posts?${params.toString()}`);
  };

  const handleTagChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("tag", value);
    } else {
      params.delete("tag");
    }
    params.delete("page"); // Reset to first page
    router.push(`/posts?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Category Filter */}
      <div className="relative">
        <select
          className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-foreground hover:bg-accent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          value={categorySlug}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Tag Filter */}
      <div className="relative">
        <select
          className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium text-foreground hover:bg-accent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          value={tagSlug}
          onChange={(e) => handleTagChange(e.target.value)}
        >
          <option value="">Tag</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.slug}>
              {tag.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Clear Filters */}
      {(categorySlug || tagSlug) && (
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="text-sm">
            Clear Filters
          </Button>
        </Link>
      )}
    </div>
  );
}
