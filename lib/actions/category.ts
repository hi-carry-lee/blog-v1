"use server";

import { prisma } from "../db";
import { CategoryFormData, categorySchema } from "../zod-validations";

// ✅ 更直观的类型定义
export type CategoryWithPosts = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  postCount: number; // 直接用 postCount，不用 _count
};

export async function slugUniqueValidate(data: string) {
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
    const validatedData = categorySchema.parse(data);
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
    console.error("Category creation error:", error);
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
    const validatedData = categorySchema.parse(data);
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
    console.error("Category update error:", error);
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

// query all categories with pagination
// page should have default value 1
// limit should have default value 5
// should return total pages
export async function queryAllCategories(page: number = 1, limit: number = 5) {
  try {
    const totalCount = await prisma.category.count();

    const categoriesRaw = await prisma.category.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // ✅ 转换为更直观的数据结构
    const categories: CategoryWithPosts[] = categoriesRaw.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      createdAt: category.createdAt,
      postCount: category._count.posts, // 转换为 postCount
    }));

    return {
      success: true,
      categories,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    };
  } catch (error) {
    console.error("Category query error:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        categories: [],
        totalPages: 0,
        totalCount: 0,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred",
      categories: [],
      totalPages: 0,
      totalCount: 0,
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
    console.error("Category deletion error:", error);
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
