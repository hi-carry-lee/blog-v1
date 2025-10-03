"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import {
  PostWithRelations,
  deletePost,
  togglePublishPost,
} from "@/lib/actions/post";
import Pagination from "@/components/pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  initialPosts: PostWithRelations[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

export default function PostTable({
  initialPosts,
  totalPages,
  currentPage,
  totalCount,
}: Props) {
  const { success, error } = useSemanticToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Handle new post
  const handleNewPost = () => {
    router.push("/dashboard/posts/create");
  };

  // Handle edit post
  const handleEdit = (post: PostWithRelations) => {
    router.push(`/dashboard/posts/edit/${post.id}`);
  };

  // 打开删除确认对话框
  const handleDeleteClick = (postId: string, postTitle: string) => {
    setPostToDelete({ id: postId, title: postTitle });
    setDeleteConfirmOpen(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    setDeletingId(postToDelete.id);
    setDeleteConfirmOpen(false);

    try {
      const result = await deletePost(postToDelete.id);

      if (result.success) {
        success(result.message || "Post deleted successfully!");
        startTransition(() => {
          router.refresh();
        });
      } else {
        error(result.error || "Failed to delete post");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
      setPostToDelete(null);
    }
  };

  // 切换发布状态
  const handleTogglePublish = async (postId: string) => {
    setPublishingId(postId);

    try {
      const result = await togglePublishPost(postId);

      if (result.success) {
        success(result.message || "Post status updated successfully!");
        startTransition(() => {
          router.refresh();
        });
      } else {
        error(result.error || "Failed to update post status");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setPublishingId(null);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      }
      router.push(`/dashboard/posts?${params.toString()}`);
    });
  };

  // Handle search
  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      params.set("page", "1");
      if (searchTerm) {
        params.set("search", searchTerm);
      }
      router.push(`/dashboard/posts?${params.toString()}`);
    });
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Are you sure?"
        description={
          <>
            This will permanently delete the post{" "}
            <span className="font-semibold text-foreground">
              &quot;{postToDelete?.title}&quot;
            </span>
            . This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deletingId === postToDelete?.id}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          All Posts
        </h1>
        <Button
          onClick={handleNewPost}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {/* Posts Table with Search */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isPending}>
              Search
            </Button>
          </div>
        </div>
        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 md:px-6">Title</TableHead>
              <TableHead className="px-4 md:px-6">Status</TableHead>
              <TableHead className="px-4 md:px-6">Featured</TableHead>
              <TableHead className="px-4 md:px-6">Category</TableHead>
              <TableHead className="px-4 md:px-6">Date</TableHead>
              <TableHead className="px-4 md:px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 md:px-6 py-8 text-center text-muted-foreground"
                >
                  No posts found. Create your first post to get started.
                </TableCell>
              </TableRow>
            ) : (
              initialPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5">
                    <div className="text-sm font-medium text-foreground">
                      {post.title}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5">
                    <Badge
                      variant={post.published ? "default" : "outline"}
                      className={
                        post.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5">
                    {post.featured ? (
                      <Badge variant="secondary" className="text-xs">
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5 text-sm text-muted-foreground">
                    {post.category.name}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5 text-sm text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-4 md:py-5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                        className="h-8 w-8"
                        disabled={isPending}
                        title="Edit post"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(post.id)}
                        className={`h-8 w-8 ${
                          post.published
                            ? "text-orange-600 hover:text-orange-700"
                            : "text-green-600 hover:text-green-700"
                        }`}
                        disabled={publishingId === post.id || isPending}
                        title={
                          post.published ? "Unpublish post" : "Publish post"
                        }
                      >
                        {publishingId === post.id ? (
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : post.published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(post.id, post.title)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deletingId === post.id || isPending}
                        title="Delete post"
                      >
                        {deletingId === post.id ? (
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
            pageSize={10}
            isLoading={isPending}
          />
        )}
      </div>
    </>
  );
}
