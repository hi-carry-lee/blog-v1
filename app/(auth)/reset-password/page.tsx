import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import ResetPasswordForm from "./reset-password-form";
import { Card, CardContent } from "@/components/ui/card";
import { verifyPasswordResetToken } from "@/lib/actions/user";

/**
 * Reset Password Page Container
 *
 * 🔧 性能优化：Server Component
 * - 从 URL 查询参数获取 token
 * - 验证 token 有效性（调用 Server Action）
 * - 无效时显示错误信息
 * - 有效时渲染重置密码表单组件
 * - 使用 Suspense 处理异步验证
 */

async function ResetPasswordContent({ token }: { token: string }) {
  // 验证 token
  const verification = await verifyPasswordResetToken(token);

  if (!verification.valid) {
    return (
      <Card className="w-full max-w-md bg-card shadow-xl border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-card-foreground mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-muted-foreground mb-6">
              {verification.error ||
                "The password reset link is invalid or has expired."}
            </p>
            <a
              href="/forgot-password"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Request a new reset link
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordForm token={token} />;
}

async function TokenVerificationWrapper({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token || "";

  if (!token) {
    return (
      <Card className="w-full max-w-md bg-card shadow-xl border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-card-foreground mb-2">
              Missing Reset Link
            </h1>
            <p className="text-muted-foreground mb-6">
              The password reset link is missing or invalid.
            </p>
            <a
              href="/forgot-password"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Request a new reset link
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordContent token={token} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BrandLogo />

      <Suspense
        fallback={
          <Card className="w-full max-w-md bg-card shadow-xl border-border">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-card-foreground mb-2">
                  Reset your password
                </h1>
                <p className="text-muted-foreground">Verifying link...</p>
              </div>
              <div className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <TokenVerificationWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
