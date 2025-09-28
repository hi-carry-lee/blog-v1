"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema, type RegisterFormData } from "@/lib/zod-validations";

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
