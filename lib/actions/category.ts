"use server";

import { prisma } from "../db";
import { CategoryFormData, categorySchema } from "../zod-validations";
import { logger } from "../logger";

// 重新导出类型以便向后兼容
export type { CategoryWithPosts } from "../db-access/category";

/**
 * 🔍 验证分类唯一性（通用函数）
 *
 * 用途：检查 slug 和 name 是否已被使用
 *
 * @param data - 要验证的分类数据 { name, slug }
 * @param excludeId - 可选，排除指定 ID（用于更新时排除自己）
 * @returns { valid: boolean, field?: string, error?: string }
 *
 * 使用场景：
 * - 创建：validateCategoryUniqueness(data) - 检查所有分类
 * - 更新：validateCategoryUniqueness(data, categoryId) - 排除当前分类
 */
async function validateCategoryUniqueness(
  data: { name: string; slug: string },
  excludeId?: string
): Promise<
  { valid: true } | { valid: false; field: "slug" | "name"; error: string }
> {
  // 1️⃣ 检查 slug 唯一性
  const existingSlug = await prisma.category.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  // 如果找到了 slug，且不是自己（更新场景）
  if (existingSlug && (!excludeId || existingSlug.id !== excludeId)) {
    logger.warn("Category slug validation failed", {
      slug: data.slug,
      excludeId,
    });
    return {
      valid: false,
      field: "slug",
      error: "Slug already exists. Please use a different slug.",
    };
  }

  // 2️⃣ 检查 name 唯一性（不区分大小写）
  const existingName = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive", // 不区分大小写
      },
      // 更新时排除当前分类
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: { id: true, name: true },
  });

  if (existingName) {
    logger.warn("Category name validation failed", {
      name: data.name,
      existingName: existingName.name,
      excludeId,
    });
    return {
      valid: false,
      field: "name",
      error: `Category name "${existingName.name}" already exists. Please use a different name.`,
    };
  }

  // ✅ 验证通过
  return { valid: true };
}

export async function slugUniqueValidate(data: string | null | undefined) {
  // 输入验证
  if (!data || typeof data !== "string" || data.trim().length === 0) {
    return {
      success: false,
      error: "Invalid slug provided",
    };
  }

  // 清理输入（移除前后空格）
  const cleanSlug = data.trim();
  try {
    // slug field is unique, so we use findUnique function
    const category = await prisma.category.findUnique({
      where: {
        slug: cleanSlug,
      },
    });

    if (category) {
      return {
        success: false,
        error: "Slug already exists",
      };
    }

    return {
      success: true,
      message: "Slug is unique",
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function createCategory(data: CategoryFormData) {
  try {
    // 1️⃣ 验证数据格式
    const validatedData = categorySchema.parse(data);

    // 2️⃣ 服务器端验证：检查唯一性
    const validation = await validateCategoryUniqueness(validatedData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 3️⃣ 创建分类
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Category created successfully!",
      category,
    };
  } catch (error) {
    logger.error("Category creation error", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updateCategory(
  data: CategoryFormData,
  categoryId: string
) {
  try {
    // 1️⃣ 验证数据格式
    const validatedData = categorySchema.parse(data);

    // 2️⃣ 检查目标分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true, name: true },
    });

    if (!existingCategory) {
      logger.warn("Attempt to update non-existent category", { categoryId });
      return {
        success: false,
        error: "Category not found",
      };
    }

    // 3️⃣ 服务器端验证：检查唯一性（排除当前分类）
    const validation = await validateCategoryUniqueness(
      validatedData,
      categoryId
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 4️⃣ 更新分类
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
    });

    return {
      success: true,
      message: "Category updated successfully!",
      category,
    };
  } catch (error) {
    logger.error("Category update error", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Delete category by ID
export async function deleteCategory(categoryId: string) {
  try {
    // Check if category has any posts
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        posts: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    if (category.posts.length > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category.posts.length} associated posts`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return {
      success: true,
      message: "Category deleted successfully!",
    };
  } catch (error) {
    logger.error("Category deletion error:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
