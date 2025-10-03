import { getAllComments } from "@/lib/actions/comment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { CommentActions } from "@/app/dashboard/comments/comment-actions";

export default async function CommentsPage() {
  const result = await getAllComments();

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Failed to load comments: {result.error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const comments = result.comments;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Comments</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {comments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No comments yet
              </h3>
              <p className="text-muted-foreground">
                Comments will appear here once users start commenting on your
                posts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Author
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Content
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Post
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Replies
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.author.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                              {comment.author.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {comment.author.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {"email" in comment.author
                                ? comment.author.email
                                : "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground max-w-xs truncate">
                          {comment.content}
                        </p>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/posts/${comment.post.slug}`}
                          className="text-primary hover:underline text-sm"
                        >
                          {comment.post.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          <span>{comment._count.replies}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={comment.approved ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {comment.approved ? "Approved" : "Pending"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <CommentActions comment={comment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
