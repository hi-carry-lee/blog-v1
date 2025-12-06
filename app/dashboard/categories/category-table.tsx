"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { CategoryWithPosts } from "@/lib/db-access/category";
import { deleteCategory } from "@/lib/actions/category";
import Pagination from "@/components/pagination";
import CategoryForm from "./category-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const { success, error } = useSemanticToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);

  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handle new category
  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  // Handle edit category
  const handleEdit = (categoryId: string) => {
    const category = initialCategories.find((c) => c.id === categoryId);
    if (category) {
      setEditingCategory({
        id: category.id,
        name: category.name,
        slug: category.slug,
      });
      setIsFormOpen(true);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // 打开删除确认对话框
  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteConfirmOpen(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete.id);
    setDeleteConfirmOpen(false); // 立即关闭对话框

    try {
      const result = await deleteCategory(categoryToDelete.id);

      if (result.success) {
        success(result.message || "Category deleted successfully!");
        // Refresh the server component data
        startTransition(() => {
          router.refresh();
        });
      } else {
        error(result.error || "Failed to delete category");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
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
      {/* Category Form Dialog */}
      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Are you sure?"
        description={
          <>
            This will permanently delete the category{" "}
            <span className="font-semibold text-foreground">
              &quot;{categoryToDelete?.name}&quot;
            </span>
            . This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deletingId === categoryToDelete?.id}
      />

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
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Slug</TableHead>
              <TableHead className="text-muted-foreground">Posts</TableHead>
              <TableHead className="text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No categories found. Create your first category to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              initialCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-foreground">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.postCount}
                  </TableCell>
                  <TableCell>
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
                          handleDeleteClick(category.id, category.name)
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
