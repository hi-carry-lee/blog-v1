"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { useCallback } from "react";
import type { LoginFormData } from "@/lib/zod-validations";
import { logger } from "@/lib/logger";

interface UseCredentialsLoginOptions {
  callbackUrl?: string;
  defaultCallbackUrl?: string;
}

/**
 * 凭证登录 Hook
 *
 * 处理邮箱密码登录逻辑，包括：
 * - 调用 NextAuth signIn
 * - 错误处理和用户提示
 * - 成功后的路由跳转
 */
export function useCredentialsLogin(options: UseCredentialsLoginOptions = {}) {
  const router = useRouter();
  const { success, error } = useSemanticToast();
  const { callbackUrl, defaultCallbackUrl = "/" } = options;

  // 可以不使用 useCallback，使用 useCallback 的场景：
  //  1. 函数作为 props 传递给用 React.memo 包装的子组件，避免因函数引用变化导致子组件不必要的重渲染
  //  2. 函数作为其他 hooks 的依赖项，如 useEffect, useMemo, useCallback 的依赖数组
  //  3. 函数创建成本很高（罕见）
  const handleCredentialsLogin = useCallback(
    async (data: LoginFormData) => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          error(
            "Login failed",
            "Please check your email and password and try again."
          );
          return;
        }

        if (result?.ok) {
          success(
            "Login successful!",
            "Welcome back! Redirecting to dashboard..."
          );
          // 使用 replace 进行跳转，可以避免用户返回登录页
          router.replace(callbackUrl || defaultCallbackUrl);
        }
      } catch (err) {
        logger.error("Login error:", err);
        error("An unexpected error occurred", "Please try again later.");
      }
    },
    [router, success, error, callbackUrl, defaultCallbackUrl]
  );

  return {
    handleCredentialsLogin,
  };
}
