"use client";

import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { CommentWithAuthor } from "@/lib/db-access/comment";
import { createComment } from "@/lib/actions/comment";
import { CommentItem } from "./comment-item";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserAvatar from "./user-avatar";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
}

export function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const { success, error } = useSemanticToast();
  const [isPending, startTransition] = useTransition();

  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!session?.user) {
      error("Please log in first to comment");
      return;
    }

    if (!comment.trim()) {
      error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await createComment(
        postId,
        comment.trim(),
        replyingTo?.id
      );

      if (result.success) {
        success(result.message || "Comment posted successfully");
        setComment("");
        setReplyingTo(null);
      } else {
        error(result.error || "Failed to post comment");
      }
    });
  };

  const handleReply = (commentId: string, authorName: string) => {
    if (!session?.user) {
      error("Please log in first to comment");
      return;
    }
    setReplyingTo({ id: commentId, name: authorName });
    // Focus on textarea
    document.getElementById("comment-textarea")?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Comments</h2>

      {/* Comment Form */}
      <div className="mb-8">
        {session?.user ? (
          <div className="flex gap-3">
            <UserAvatar user={session.user} isNavbar={false} />

            <div className="flex-1">
              {/* Reply indicator */}
              {replyingTo && (
                <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                  <span>
                    Replying to{" "}
                    <span className="font-semibold">{replyingTo.name}</span>
                  </span>
                  <button
                    onClick={cancelReply}
                    className="text-primary hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="relative">
                <textarea
                  id="comment-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] p-4 rounded-lg bg-accent/30 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm text-foreground placeholder:text-muted-foreground"
                  disabled={isPending}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || !comment.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-accent/30 border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in first to comment
            </p>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Log In
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {initialComments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          initialComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              depth={1}
            />
          ))
        )}
      </div>
    </div>
  );
}
