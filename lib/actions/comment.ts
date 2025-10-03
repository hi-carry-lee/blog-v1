"use server";

import { prisma } from "../db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 评论类型（带作者和回复信息）
export type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  parentId: string | null;
  replies: CommentWithAuthor[];
};

/**
 * 获取文章的所有评论（包含嵌套回复）
 */
export async function getPostComments(postId: string) {
  try {
    // 获取所有顶级评论（没有父评论的）
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
        approved: true, // 只显示已审核的评论
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          where: {
            approved: true,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            replies: {
              where: {
                approved: true,
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
              orderBy: {
                createdAt: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc", // 最新的评论在前
      },
    });

    return {
      success: true,
      comments: comments as unknown as CommentWithAuthor[],
    };
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return {
      success: false,
      error: "Failed to load comments",
      comments: [],
    };
  }
}

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
    console.error("Failed to create comment:", error);
    return {
      success: false,
      error: "Failed to post comment. Please try again.",
    };
  }
}

/**
 * 获取评论总数
 */
export async function getPostCommentsCount(postId: string) {
  try {
    const count = await prisma.comment.count({
      where: {
        postId,
        approved: true,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Failed to fetch comments count:", error);
    return { success: false, count: 0 };
  }
}
