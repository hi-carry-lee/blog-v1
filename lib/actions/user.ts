"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  registerSchema,
  type RegisterFormData,
  profileUpdateSchema,
  type ProfileUpdateFormData,
  forgotPasswordSchema,
  type ForgotPasswordFormData,
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/zod-validations";
import { logger } from "../logger";
import { checkPasswordResetRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset";
import { randomBytes } from "crypto";

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

/**
 * 请求密码重置
 * - 验证邮箱格式
 * - 检查速率限制
 * - 检查用户是否存在且有密码（排除 OAuth 用户）
 * - 生成 token（32 字节，base64url 编码）
 * - 保存到数据库（设置过期时间）
 * - 发送邮件
 * - 返回结果
 */
export async function requestPasswordReset(data: ForgotPasswordFormData) {
  try {
    // 验证表单数据
    const validatedData = forgotPasswordSchema.parse(data);
    const email = validatedData.email;

    // 检查速率限制（15 分钟内最多 3 次）
    const isAllowed = await checkPasswordResetRateLimit(email);
    if (!isAllowed) {
      return {
        success: false,
        error:
          "Too many password reset requests. Please try again in 15 minutes.",
      };
    }

    // 检查用户是否存在且有密码（排除 OAuth 用户）
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
      },
    });

    // 无论用户是否存在，都返回相同的消息（安全考虑）
    if (!user || !user.password) {
      return {
        success: true,
        message:
          "If an account with that email exists, a password reset link will be sent.",
      };
    }

    // 生成 token（32 字节，base64url 编码）
    const tokenBuffer = randomBytes(32);
    const token = tokenBuffer.toString("base64url");

    // 计算过期时间（默认 1 小时 = 3600 秒）
    const expirationSeconds =
      parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || "3600", 10) ||
      3600;
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

    // 保存 token 到数据库
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 发送邮件
    const emailSent = await sendPasswordResetEmail(email, token);

    if (!emailSent) {
      // 如果邮件发送失败，删除已保存的 token
      await prisma.passwordResetToken.deleteMany({
        where: { token },
      });

      return {
        success: false,
        error: "Failed to send password reset email. Please try again later.",
      };
    }

    return {
      success: true,
      message:
        "If an account with that email exists, a password reset link will be sent.",
    };
  } catch (error) {
    logger.error("Password reset request error:", error);

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

/**
 * 验证密码重置 token
 * - 查询 token
 * - 验证是否过期
 * - 验证是否已使用
 * - 返回验证结果和用户信息
 */
export async function verifyPasswordResetToken(token: string) {
  try {
    // 查询 token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // token 不存在
    if (!resetToken) {
      return {
        valid: false,
        error: "Invalid or expired reset link",
      };
    }

    // token 已过期
    if (resetToken.expiresAt < new Date()) {
      return {
        valid: false,
        error: "Reset link has expired",
      };
    }

    // token 已使用
    if (resetToken.usedAt) {
      return {
        valid: false,
        error: "This reset link has already been used",
      };
    }

    return {
      valid: true,
      userId: resetToken.userId,
      email: resetToken.user.email,
    };
  } catch (error) {
    logger.error("Password reset token verification error:", error);

    return {
      valid: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * 重置密码
 * - 验证 token
 * - 哈希新密码
 * - 更新用户密码
 * - 标记 token 为已使用
 * - 删除该用户的所有其他未使用 token
 * - 返回结果
 */
export async function resetPassword(
  token: string,
  data: ResetPasswordFormData
) {
  try {
    // 验证表单数据
    const validatedData = resetPasswordSchema.parse(data);

    // 验证 token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    // token 不存在或已过期或已使用
    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    // 哈希新密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // 在事务中执行：更新密码、标记 token 为已使用、删除其他未使用 token
    await prisma.$transaction([
      // 更新用户密码
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
        },
      }),

      // 标记当前 token 为已使用
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          usedAt: new Date(),
        },
      }),

      // 删除该用户的所有其他未使用 token
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          NOT: { id: resetToken.id },
          usedAt: null,
        },
      }),
    ]);

    return {
      success: true,
      message:
        "Password reset successfully! You can now log in with your new password.",
    };
  } catch (error) {
    logger.error("Password reset error:", error);

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
