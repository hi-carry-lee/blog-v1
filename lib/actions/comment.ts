"use server";

import { prisma } from "../db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { checkCommentRateLimit } from "../rate-limit";
import { logger } from "../logger";

// 重新导出类型以便向后兼容
export type { CommentWithAuthor } from "../db-access/comment";

/**
 * 计算评论的嵌套深度
 */
async function getCommentDepth(commentId: string): Promise<number> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { parentId: true },
  });

  if (!comment || !comment.parentId) {
    return 1; // 顶级评论深度为1
  }

  // 递归计算父评论的深度
  return 1 + (await getCommentDepth(comment.parentId));
}

/**
 * 创建新评论
 */
/**
 * 创建新评论
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
) {
  try {
    // 检查用户是否登录
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please log in first to comment",
      };
    }

    // 限流检查
    const canComment = await checkCommentRateLimit(session.user.id);
    if (!canComment) {
      return {
        success: false,
        error: "Too many comments. Please wait a moment and try again.",
      };
    }

    // 验证内容
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: "Comment content cannot be empty",
      };
    }

    if (content.length > 1000) {
      return {
        success: false,
        error: "Comment is too long (max 1000 characters)",
      };
    }

    // 验证文章是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    // 如果是回复评论，验证父评论是否存在并检查嵌套深度
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return {
          success: false,
          error: "Parent comment not found",
        };
      }

      // 检查嵌套深度（限制为3层：顶级评论 + 2层回复）
      const currentDepth = await getCommentDepth(parentId);
      if (currentDepth >= 3) {
        return {
          success: false,
          error:
            "Reply depth limit reached. Please start a new comment thread.",
        };
      }
    }

    // 创建评论（自动审核通过）
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
        approved: true, // 自动审核通过
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 重新验证页面以显示新评论
    revalidatePath(`/posts/${post.slug}`);

    return {
      success: true,
      message: "Comment posted successfully",
      comment,
    };
  } catch (error) {
    logger.error("Failed to create comment:", error);
    return {
      success: false,
      error: "Failed to post comment. Please try again.",
    };
  }
}

/**
 * 删除评论（级联删除子评论）
 */
export async function deleteComment(commentId: string) {
  try {
    // 检查用户权限
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please log in first",
      };
    }

    // 检查是否为管理员
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // 递归删除所有子评论
    async function deleteCommentAndReplies(commentId: string) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          replies: true,
        },
      });

      if (comment) {
        // 先删除所有子评论
        for (const reply of comment.replies) {
          await deleteCommentAndReplies(reply.id);
        }

        // 删除当前评论
        await prisma.comment.delete({
          where: { id: commentId },
        });
      }
    }

    await deleteCommentAndReplies(commentId);

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    logger.error("Failed to delete comment:", error);
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}

/**
 * 审核评论
 */
export async function approveComment(commentId: string, approved: boolean) {
  try {
    // 检查用户权限
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please log in first",
      };
    }

    // 检查是否为管理员
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { approved },
    });

    return {
      success: true,
      message: approved ? "Comment approved" : "Comment rejected",
    };
  } catch (error) {
    logger.error("Failed to approve comment:", error);
    return {
      success: false,
      error: "Failed to update comment status",
    };
  }
}
