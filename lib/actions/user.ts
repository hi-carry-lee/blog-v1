"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  registerSchema,
  type RegisterFormData,
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/zod-validations";
import { logger } from "../logger";

// ✅ 用户列表数据类型定义
export type UserWithPosts = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  postCount: number;
};

/**
 * 分页查询所有用户
 *
 * @param page - 当前页码（从 1 开始）
 * @param pageSize - 每页数量
 * @returns 包含用户列表、总页数、当前页、总数量的对象
 */
export async function queryAllUsers(
  page: number = 1,
  pageSize: number = 10
): Promise<{
  users: UserWithPosts[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}> {
  try {
    logger.info("Querying users", { page, pageSize });

    // 1️⃣ 并行查询：用户列表 + 总数
    const [users, totalCount] = await Promise.all([
      // 查询当前页的用户，并计算每个用户的文章数
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          _count: {
            select: { Post: true },
          },
        },
      }),

      // 查询总数量
      prisma.user.count(),
    ]);

    // 2️⃣ 数据转换：将 _count.Post 转为 postCount
    const transformedUsers: UserWithPosts[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      postCount: user._count.Post,
    }));

    // 3️⃣ 计算总页数
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      users: transformedUsers,
      totalPages,
      currentPage: page,
      totalCount,
    };
  } catch (error) {
    logger.error("Query users failed", error);
    throw new Error("Failed to fetch users");
  }
}

/**
 * 🔍 根据 ID 查询单个用户
 *
 * @param userId - 用户 ID
 * @returns 用户对象或 null
 */
export async function queryUserById(userId: string) {
  try {
    logger.info("Querying user by ID", { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: { Post: true },
        },
      },
    });

    if (!user) {
      logger.warn("User not found", { userId });
      return null;
    }

    // 转换为统一格式
    const transformedUser: UserWithPosts = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      postCount: user._count.Post,
    };

    return transformedUser;
  } catch (error) {
    logger.error("Query user by ID failed", error);
    return null;
  }
}

export async function registerUser(data: RegisterFormData) {
  try {
    // 验证表单数据
    const validatedData = registerSchema.parse(data);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // 哈希密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: "Account created successfully!",
      user,
    };
  } catch (error) {
    console.error("Registration error:", error);

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

export async function updateUserProfile(
  data: ProfileUpdateFormData,
  userId: string
) {
  try {
    // 验证表单数据
    const validatedData = profileUpdateSchema.parse(data);

    // 检查邮箱是否已被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: "Profile updated successfully!",
      user,
    };
  } catch (error) {
    console.error("Profile update error:", error);

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

export async function updateUserAvatar(imageUrl: string, userId: string) {
  try {
    // 更新用户头像
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: "Avatar updated successfully!",
      user,
    };
  } catch (error) {
    console.error("Avatar update error:", error);

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
