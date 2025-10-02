"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryWithPosts, deleteCategory } from "@/lib/actions/category";
import { toast } from "sonner";

type Props = {
  initialCategories: CategoryWithPosts[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

export default function CategoryTable({
  initialCategories,
  totalPages,
  currentPage,
  totalCount,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate display range
  const startIndex = (currentPage - 1) * 5 + 1;
  const endIndex = Math.min(currentPage * 5, totalCount);

  // Handle new category
  const handleNewCategory = () => {
    // TODO: Open dialog/modal for creating new category
    toast.info("Create category dialog - To be implemented");
  };

  // Handle edit category
  const handleEdit = (categoryId: string) => {
    // TODO: Open dialog/modal for editing category
    toast.info(`Edit category ${categoryId} - To be implemented`);
  };

  // Handle delete category
  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    setDeletingId(categoryId);

    try {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        toast.success(result.message);
        // Refresh the server component data
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`/dashboard/categories?page=${page}`);
    });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Categories
        </h1>
        <Button
          onClick={handleNewCategory}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-muted-foreground">
                  Slug
                </th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-muted-foreground">
                  Posts
                </th>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 md:px-6 py-8 text-center text-muted-foreground"
                  >
                    No categories found. Create your first category to get
                    started.
                  </td>
                </tr>
              ) : (
                initialCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4 md:py-5 text-sm font-medium text-foreground">
                      {category.name}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5 text-sm text-muted-foreground">
                      {category.postCount}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-5">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category.id)}
                          className="h-8 w-8"
                          disabled={isPending}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(category.id, category.name)
                          }
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? (
                            <span className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
              >
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      disabled={isPending}
                      className={cn(
                        "w-8 h-8 p-0",
                        currentPage === page &&
                          "bg-primary text-primary-foreground"
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
