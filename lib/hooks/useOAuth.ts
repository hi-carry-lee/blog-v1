"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { useCallback } from "react";
import { logger } from "@/lib/logger";

type OAuthProvider = "github" | "google";

interface UseOAuthOptions {
  callbackUrl?: string;
  defaultCallbackUrl?: string;
}

/**
 * OAuth 登录 Hook
 * 
 * 统一处理 GitHub 和 Google OAuth 登录逻辑，包括：
 * - 调用 NextAuth signIn
 * - 错误处理和用户提示
 * - 成功后的路由跳转
 * - 消除重复代码
 */
export function useOAuth(options: UseOAuthOptions = {}) {
  const router = useRouter();
  const { success, error } = useSemanticToast();
  const { callbackUrl, defaultCallbackUrl = "/" } = options;

  const handleOAuthLogin = useCallback(
    async (provider: OAuthProvider) => {
      try {
        const result = await signIn(provider, {
          callbackUrl: callbackUrl || defaultCallbackUrl,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "OAuthAccountNotLinked") {
            const providerName =
              provider === "github" ? "GitHub" : "Google";
            error(
              "Account linking failed",
              `Unable to link your ${providerName} account. Please contact support if this issue persists.`
            );
          } else {
            const providerName =
              provider === "github" ? "GitHub" : "Google";
            error(
              `${providerName} login failed`,
              "Please try again later."
            );
          }
          return;
        }

        if (result?.ok || result?.url) {
          const providerName =
            provider === "github" ? "GitHub" : "Google";
          const successMessage =
            provider === "github"
              ? "Your GitHub account has been linked successfully."
              : "Welcome! You have been logged in successfully.";

          success(
            `${providerName} login successful!`,
            successMessage
          );

          // 延迟跳转，让用户看到成功消息
          setTimeout(() => {
            router.replace(result?.url || callbackUrl || defaultCallbackUrl);
          }, 1000);
        }
      } catch (err) {
        const providerName = provider === "github" ? "GitHub" : "Google";
        logger.error(`${provider} login error:`, err);
        error(
          `${providerName} login failed`,
          "Please try again later."
        );
      }
    },
    [router, success, error, callbackUrl, defaultCallbackUrl]
  );

  return {
    handleOAuthLogin,
  };
}

