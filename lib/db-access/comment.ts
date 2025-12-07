import "server-only";

import { prisma } from "../db";
import { logger } from "../logger";

// 评论类型（带作者和回复信息）
export type CommentWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
    email?: string;
  };
  parentId: string | null;
  replies?: CommentWithAuthor[];
  post: {
    id: string;
    title: string;
    slug: string;
  };
  _count: {
    replies: number;
  };
  approved: boolean | null;
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
      // 限制三层嵌套评论查询，因为创建时已限制为3层
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
    logger.error("Failed to fetch comments:", error);
    return {
      success: false,
      error: "Failed to load comments",
      comments: [],
    };
  }
}

/**
 * 获取所有评论（管理员用）
 */
export async function getAllComments() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      comments,
    };
  } catch (error) {
    logger.error("Failed to fetch all comments:", error);
    return {
      success: false,
      error: "Failed to load comments",
      comments: [],
    };
  }
}
