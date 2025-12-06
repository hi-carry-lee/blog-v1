"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { TagWithPosts } from "@/lib/db-access/tag";
import { deleteTag } from "@/lib/actions/tag";
import Pagination from "@/components/pagination";
import TagForm from "./tag-form";
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
  initialTags: TagWithPosts[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

export default function TagTable({
  initialTags,
  totalPages,
  currentPage,
  totalCount,
}: Props) {
  const { success, error } = useSemanticToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);

  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handle new tag
  const handleNewTag = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  // Handle edit tag
  const handleEdit = (tagId: string) => {
    const tag = initialTags.find((t) => t.id === tagId);
    if (tag) {
      setEditingTag({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
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
  const handleDeleteClick = (tagId: string, tagName: string) => {
    setTagToDelete({ id: tagId, name: tagName });
    setDeleteConfirmOpen(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    setDeletingId(tagToDelete.id);
    setDeleteConfirmOpen(false); // 立即关闭对话框

    try {
      const result = await deleteTag(tagToDelete.id);

      if (result.success) {
        success(result.message || "Tag deleted successfully!");
        // Refresh the server component data
        startTransition(() => {
          router.refresh();
        });
      } else {
        error(result.error || "Failed to delete tag");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
      setTagToDelete(null);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`/dashboard/tags?page=${page}`);
    });
  };

  return (
    <>
      {/* Tag Form Dialog */}
      <TagForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tag={editingTag}
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
            This will permanently delete the tag{" "}
            <span className="font-semibold text-foreground">
              &quot;{tagToDelete?.name}&quot;
            </span>
            . This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deletingId === tagToDelete?.id}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tags</h1>
        <Button
          onClick={handleNewTag}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </Button>
      </div>

      {/* Tags Table */}
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
            {initialTags.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No tags found. Create your first tag to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium text-foreground">
                    {tag.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tag.postCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tag.id)}
                        className="h-8 w-8"
                        disabled={isPending}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(tag.id, tag.name)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deletingId === tag.id}
                      >
                        {deletingId === tag.id ? (
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
