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

// 重新导出类型以便向后兼容
export type { UserWithPosts } from "../db-access/user";

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
    logger.error("Registration error:", error);

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
    logger.error("Profile update error:", error);

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
    logger.error("Avatar update error:", error);

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
