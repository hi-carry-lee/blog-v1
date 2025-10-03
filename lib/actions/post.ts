"use server";

import { prisma } from "../db";
import { PostFormData, postSchema } from "../zod-validations";
import { logger } from "../logger";
import { auth } from "@/auth";

// 博客文章类型（包含关联数据）
export type PostWithRelations = {
  id: string;
  title: string;
  slug: string;
  brief: string;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
};

/**
 * 🔍 验证 Slug 是否唯一
 */
export async function validatePostSlug(slug: string, excludeId?: string) {
  try {
    if (!slug.trim()) {
      return { success: false, error: "Slug cannot be empty" };
    }

    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    // 如果找到了且不是当前编辑的文章
    if (existingPost && (!excludeId || existingPost.id !== excludeId)) {
      return { success: false, error: "This slug is already taken" };
    }

    return { success: true };
  } catch (error) {
    logger.error("Post slug validation error", error);
    return { success: false, error: "Validation failed" };
  }
}

/**
 * 📊 查询所有文章（支持分页和搜索）
 */
export async function queryAllPosts(
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string
) {
  try {
    logger.info("Querying posts", { page, pageSize, searchTerm });

    // 构建搜索条件
    const whereCondition = searchTerm
      ? {
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" as const } },
            { brief: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        }
      : {};

    // 并行查询：文章列表 + 总数
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    logger.info("Posts query completed", {
      totalCount,
      totalPages,
      currentPage: page,
      returnedCount: posts.length,
    });

    return {
      success: true,
      posts: posts as PostWithRelations[],
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    logger.error("Query posts failed", error);
    return {
      success: false,
      error: "Failed to fetch posts",
      posts: [],
      totalPages: 0,
      currentPage: page,
      totalCount: 0,
    };
  }
}

/**
 * ➕ 创建新文章
 */
export async function createPost(data: PostFormData) {
  try {
    logger.info("Creating post", { title: data.title });

    // 获取当前用户
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to create a post",
      };
    }

    // 验证数据格式
    const validatedData = postSchema.parse(data);

    // 检查 slug 唯一性
    const slugCheck = await validatePostSlug(validatedData.slug);
    if (!slugCheck.success) {
      return {
        success: false,
        error: slugCheck.error,
      };
    }

    // 验证分类是否存在
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!categoryExists) {
      return {
        success: false,
        error: "Selected category does not exist",
      };
    }

    // 验证标签是否都存在
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const tagsCount = await prisma.tag.count({
        where: {
          id: { in: validatedData.tagIds },
        },
      });

      if (tagsCount !== validatedData.tagIds.length) {
        return {
          success: false,
          error: "One or more selected tags do not exist",
        };
      }
    }

    // 创建文章
    const newPost = await prisma.post.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        brief: validatedData.brief,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        categoryId: validatedData.categoryId,
        authorId: session.user.id,
        tagIds: validatedData.tagIds || [],
        published: validatedData.published,
        featured: validatedData.featured,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        publishedAt: validatedData.published ? new Date() : null,
      },
    });

    // 如果有标签，建立关联
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await prisma.post.update({
        where: { id: newPost.id },
        data: {
          tags: {
            connect: validatedData.tagIds.map((id) => ({ id })),
          },
        },
      });
    }

    logger.info("Post created successfully", {
      id: newPost.id,
      title: newPost.title,
    });

    return {
      success: true,
      message: "Post created successfully",
      post: newPost,
    };
  } catch (error) {
    logger.error("Create post failed", error);
    return {
      success: false,
      error: "Failed to create post",
    };
  }
}

/**
 * ✏️ 更新文章
 */
export async function updatePost(data: PostFormData, postId: string) {
  try {
    logger.info("Updating post", { postId, title: data.title });

    // 获取当前用户
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to update a post",
      };
    }

    // 验证数据格式
    const validatedData = postSchema.parse(data);

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        published: true,
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    // 检查权限（只有作者或管理员可以编辑）
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "You don't have permission to edit this post",
      };
    }

    // 检查 slug 唯一性（排除当前文章）
    const slugCheck = await validatePostSlug(validatedData.slug, postId);
    if (!slugCheck.success) {
      return {
        success: false,
        error: slugCheck.error,
      };
    }

    // 验证分类是否存在
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!categoryExists) {
      return {
        success: false,
        error: "Selected category does not exist",
      };
    }

    // 验证标签是否都存在
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const tagsCount = await prisma.tag.count({
        where: {
          id: { in: validatedData.tagIds },
        },
      });

      if (tagsCount !== validatedData.tagIds.length) {
        return {
          success: false,
          error: "One or more selected tags do not exist",
        };
      }
    }

    // 更新文章
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        brief: validatedData.brief,
        content: validatedData.content,
        coverImage: validatedData.coverImage || null,
        categoryId: validatedData.categoryId,
        tagIds: validatedData.tagIds || [],
        published: validatedData.published,
        featured: validatedData.featured,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        // 如果从未发布变为发布，设置发布时间
        publishedAt:
          validatedData.published && !existingPost.published
            ? new Date()
            : undefined,
        tags: {
          set: [], // 先清空现有关联
          connect: validatedData.tagIds?.map((id) => ({ id })) || [],
        },
      },
    });

    logger.info("Post updated successfully", {
      id: updatedPost.id,
      title: updatedPost.title,
    });

    return {
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    };
  } catch (error) {
    logger.error("Update post failed", error);
    return {
      success: false,
      error: "Failed to update post",
    };
  }
}

/**
 * 🗑️ 删除文章
 */
export async function deletePost(postId: string) {
  try {
    logger.info("Attempting to delete post", { postId });

    // 获取当前用户
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to delete a post",
      };
    }

    // 检查文章是否存在
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!existingPost) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    // 检查权限（只有作者或管理员可以删除）
    if (
      existingPost.authorId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "You don't have permission to delete this post",
      };
    }

    // 删除文章
    await prisma.post.delete({
      where: { id: postId },
    });

    logger.info("Post deleted successfully", {
      postId,
      title: existingPost.title,
    });

    return {
      success: true,
      message: `Post "${existingPost.title}" deleted successfully`,
    };
  } catch (error) {
    logger.error("Delete post failed", error);
    return {
      success: false,
      error: "Failed to delete post",
    };
  }
}

/**
 * 🔍 根据 ID 获取单个博客文章
 */
export async function getPostById(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, post };
  } catch (error) {
    logger.error("Failed to get post by ID", error);
    return { success: false, error: "Failed to fetch post" };
  }
}

/**
 * 📋 获取所有分类（用于下拉选择）
 */
export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return {
      success: true,
      categories,
    };
  } catch (error) {
    logger.error("Get all categories failed", error);
    return {
      success: false,
      error: "Failed to fetch categories",
      categories: [],
    };
  }
}

/**
 * 🏷️ 获取所有标签（用于多选）
 */
export async function getAllTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return {
      success: true,
      tags,
    };
  } catch (error) {
    logger.error("Get all tags failed", error);
    return {
      success: false,
      error: "Failed to fetch tags",
      tags: [],
    };
  }
}
