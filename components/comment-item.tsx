"use client";

import { useState } from "react";
import { CommentWithAuthor } from "@/lib/actions/comment";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import UserAvatar from "./user-avatar";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

interface CommentItemProps {
  comment: CommentWithAuthor;
  onReply: (commentId: string, authorName: string) => void;
  isReply?: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  onReply,
  isReply = false,
  depth = 1,
}: CommentItemProps) {
  const [showReplies] = useState(true);
  const { data: session } = useSession();
  const { error } = useSemanticToast();

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: false,
  });

  return (
    <div className={`${isReply ? "ml-8 md:ml-12" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <UserAvatar user={comment.author} isNavbar={false} />

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground text-sm">
              {comment.author.name}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo} ago</span>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-md text-foreground leading-relaxed">
              {comment.content}
            </p>

            {/* Reply Button */}
            {session?.user.name !== comment.author.name && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (depth < 3) {
                    onReply(comment.id, comment.author.name);
                  } else {
                    error(
                      "Maximum reply depth reached. Please start a new comment thread."
                    );
                  }
                }}
                className="text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium whitespace-nowrap"
              >
                Reply
              </Button>
            )}
          </div>
          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {showReplies &&
                comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    isReply={true}
                    depth={depth + 1}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
