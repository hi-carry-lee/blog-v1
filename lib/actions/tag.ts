"use server";

import { prisma } from "../db";
import { TagFormData, tagSchema } from "../zod-validations";
import { logger } from "../logger";

// ✅ 更直观的类型定义
export type TagWithPosts = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  postCount: number; // 直接用 postCount，不用 _count
};

/**
 * 🔍 验证标签唯一性（通用函数）
 *
 * 用途：检查 slug 和 name 是否已被使用
 *
 * @param data - 要验证的标签数据 { name, slug }
 * @param excludeId - 可选，排除指定 ID（用于更新时排除自己）
 * @returns { valid: boolean, field?: string, error?: string }
 *
 * 使用场景：
 * - 创建：validateTagUniqueness(data) - 检查所有标签
 * - 更新：validateTagUniqueness(data, tagId) - 排除当前标签
 */
async function validateTagUniqueness(
  data: { name: string; slug: string },
  excludeId?: string
): Promise<
  { valid: true } | { valid: false; field: "slug" | "name"; error: string }
> {
  // 1️⃣ 检查 slug 唯一性
  const existingSlug = await prisma.tag.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  // 如果找到了 slug，且不是自己（更新场景）
  if (existingSlug && (!excludeId || existingSlug.id !== excludeId)) {
    logger.warn("Tag slug validation failed", {
      slug: data.slug,
      excludeId,
    });
    return {
      valid: false,
      field: "slug",
      error: "Slug already exists. Please use a different slug.",
    };
  }

  // 2️⃣ 检查 name 唯一性
  const existingName = await prisma.tag.findUnique({
    where: { name: data.name },
    select: { id: true },
  });

  // 如果找到了 name，且不是自己（更新场景）
  if (existingName && (!excludeId || existingName.id !== excludeId)) {
    logger.warn("Tag name validation failed", {
      name: data.name,
      excludeId,
    });
    return {
      valid: false,
      field: "name",
      error: "Name already exists. Please use a different name.",
    };
  }

  return { valid: true };
}

/**
 * 🔍 验证 Slug 是否唯一（仅用于前端实时验证）
 *
 * 💡 目的：给用户即时反馈，不必等到提交才知道 slug 重复
 *
 * @param slug - 要验证的 slug
 * @returns { success: boolean, error?: string }
 *
 * 使用场景：TagForm 组件中，用户输入 slug 后失焦时调用
 */
export async function slugUniqueValidate(slug: string) {
  try {
    if (!slug.trim()) {
      return { success: false, error: "Slug cannot be empty" };
    }

    const existingTag = await prisma.tag.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingTag) {
      return { success: false, error: "This slug is already taken" };
    }

    return { success: true };
  } catch (error) {
    logger.error("Tag slug validation error", error);
    return { success: false, error: "Validation failed" };
  }
}

/**
 * 📊 查询所有标签（支持分页）
 *
 * @param page - 当前页码（从 1 开始）
 * @param pageSize - 每页数量
 * @returns 包含标签列表、总页数、当前页、总数量的对象
 */
export async function queryAllTags(
  page: number = 1,
  pageSize: number = 10
): Promise<{
  tags: TagWithPosts[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}> {
  try {
    logger.info("Querying tags", { page, pageSize });

    // 1️⃣ 并行查询：标签列表 + 总数
    const [tags, totalCount] = await Promise.all([
      // 查询当前页的标签，并计算每个标签的文章数
      prisma.tag.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),

      // 查询总数量
      prisma.tag.count(),
    ]);

    // 2️⃣ 数据转换：将 _count.posts 转为 postCount
    const transformedTags: TagWithPosts[] = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt,
      postCount: tag._count.posts,
    }));

    // 3️⃣ 计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    logger.info("Tags query completed", {
      totalCount,
      totalPages,
      currentPage: page,
      returnedCount: transformedTags.length,
    });

    return {
      tags: transformedTags,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    logger.error("Query tags failed", error);
    throw new Error("Failed to fetch tags");
  }
}

/**
 * ➕ 创建新标签
 *
 * @param data - 标签表单数据 { name, slug }
 * @returns { success: boolean, message?: string, error?: string }
 */
export async function createTag(data: TagFormData) {
  try {
    logger.info("Creating tag", data);

    // 1️⃣ 数据验证
    const validatedData = tagSchema.parse(data);

    // 2️⃣ 唯一性检查
    const uniquenessCheck = await validateTagUniqueness(validatedData);
    if (!uniquenessCheck.valid) {
      logger.warn("Tag creation failed - uniqueness check", {
        field: uniquenessCheck.field,
        error: uniquenessCheck.error,
      });
      return {
        success: false,
        error: uniquenessCheck.error,
      };
    }

    // 3️⃣ 创建标签
    const newTag = await prisma.tag.create({
      data: validatedData,
    });

    logger.info("Tag created successfully", {
      id: newTag.id,
      name: newTag.name,
    });

    return {
      success: true,
      message: "Tag created successfully",
    };
  } catch (error) {
    logger.error("Create tag failed", error);
    return {
      success: false,
      error: "Failed to create tag",
    };
  }
}

/**
 * ✏️ 更新标签
 *
 * @param data - 更新的标签数据 { name, slug }
 * @param tagId - 要更新的标签 ID
 * @returns { success: boolean, message?: string, error?: string }
 */
export async function updateTag(data: TagFormData, tagId: string) {
  try {
    logger.info("Updating tag", { tagId, data });

    // 1️⃣ 数据验证
    const validatedData = tagSchema.parse(data);

    // 2️⃣ 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      logger.warn("Tag not found for update", { tagId });
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // 3️⃣ 唯一性检查（排除当前标签）
    const uniquenessCheck = await validateTagUniqueness(validatedData, tagId);
    if (!uniquenessCheck.valid) {
      logger.warn("Tag update failed - uniqueness check", {
        tagId,
        field: uniquenessCheck.field,
        error: uniquenessCheck.error,
      });
      return {
        success: false,
        error: uniquenessCheck.error,
      };
    }

    // 4️⃣ 更新标签
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: validatedData,
    });

    logger.info("Tag updated successfully", {
      id: updatedTag.id,
      name: updatedTag.name,
    });

    return {
      success: true,
      message: "Tag updated successfully",
    };
  } catch (error) {
    logger.error("Update tag failed", error);
    return {
      success: false,
      error: "Failed to update tag",
    };
  }
}

/**
 * 🗑️ 删除标签
 *
 * 安全检查：
 * - 检查是否有文章在使用此标签
 * - 如果有关联文章，禁止删除
 *
 * @param tagId - 要删除的标签 ID
 * @returns { success: boolean, message?: string, error?: string }
 */
export async function deleteTag(tagId: string) {
  try {
    logger.info("Attempting to delete tag", { tagId });

    // 1️⃣ 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existingTag) {
      logger.warn("Tag not found for deletion", { tagId });
      return {
        success: false,
        error: "Tag not found",
      };
    }

    // 2️⃣ 检查是否有关联的文章
    if (existingTag._count.posts > 0) {
      logger.warn("Tag deletion blocked - has associated posts", {
        tagId,
        postCount: existingTag._count.posts,
      });
      return {
        success: false,
        error: `Cannot delete tag "${existingTag.name}" because it has ${existingTag._count.posts} associated post(s). Please remove the tag from all posts first.`,
      };
    }

    // 3️⃣ 执行删除
    await prisma.tag.delete({
      where: { id: tagId },
    });

    logger.info("Tag deleted successfully", {
      tagId,
      name: existingTag.name,
    });

    return {
      success: true,
      message: `Tag "${existingTag.name}" deleted successfully`,
    };
  } catch (error) {
    logger.error("Delete tag failed", error);
    return {
      success: false,
      error: "Failed to delete tag",
    };
  }
}

/**
 * 🔍 根据 ID 查询单个标签
 *
 * @param tagId - 标签 ID
 * @returns 标签对象或 null
 */
export async function queryTagById(tagId: string) {
  try {
    logger.info("Querying tag by ID", { tagId });

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      logger.warn("Tag not found", { tagId });
      return null;
    }

    // 转换为统一格式
    const transformedTag: TagWithPosts = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.createdAt,
      postCount: tag._count.posts,
    };

    logger.info("Tag found", {
      tagId,
      name: tag.name,
      postCount: transformedTag.postCount,
    });

    return transformedTag;
  } catch (error) {
    logger.error("Query tag by ID failed", error);
    return null;
  }
}

/**
 * 📈 获取标签统计信息
 *
 * @returns 标签总数和最受欢迎的标签列表
 */
export async function getTagStats() {
  try {
    const [totalTags, popularTags] = await Promise.all([
      // 总标签数
      prisma.tag.count(),

      // 最受欢迎的标签（按文章数排序，取前5个）
      prisma.tag.findMany({
        take: 5,
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
    ]);

    return {
      totalTags,
      popularTags: popularTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        postCount: tag._count.posts,
      })),
    };
  } catch (error) {
    logger.error("Get tag stats failed", error);
    throw new Error("Failed to fetch tag statistics");
  }
}
