"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, AlertTriangle } from "lucide-react";
import { deleteComment, approveComment } from "@/lib/actions/comment";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommentActionsProps {
  comment: {
    id: string;
    approved: boolean | null;
    _count: {
      replies: number;
    };
  };
}

export function CommentActions({ comment }: CommentActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useSemanticToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleApprove = (approved: boolean) => {
    startTransition(async () => {
      const result = await approveComment(comment.id, approved);
      if (result.success) {
        success(result.message || "Comment status updated");
        window.location.reload();
      } else {
        error(result.error || "Failed to update comment status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteComment(comment.id);
      if (result.success) {
        success(result.message || "Comment deleted successfully");
        window.location.reload();
      } else {
        error(result.error || "Failed to delete comment");
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {comment.approved === null || comment.approved === false ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleApprove(true)}
          disabled={isPending}
          className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleApprove(false)}
          disabled={isPending}
          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Comment
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment?
              {comment._count.replies > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This comment has {comment._count.replies} replies.
                    Deleting it will also delete all replies permanently.
                  </p>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Comment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
