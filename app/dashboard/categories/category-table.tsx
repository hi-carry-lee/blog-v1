"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CategoryWithPosts, deleteCategory } from "@/lib/actions/category";
import { toast } from "sonner";
import Pagination from "@/components/pagination";

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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={totalCount}
            pageSize={5}
            isLoading={isPending}
          />
        )}
      </div>
    </>
  );
}
