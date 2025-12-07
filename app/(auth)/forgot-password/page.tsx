import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import ForgotPasswordForm from "./forgot-password-form";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Forgot Password Page Container
 *
 * 🔧 性能优化：将表单逻辑提取到 ForgotPasswordForm 组件
 * - ForgotPasswordForm 为 Client Component，包含所有表单逻辑
 * - 页面容器为 Server Component，提供更好的静态优化
 */
export default function ForgotPasswordPage() {
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
                <p className="text-muted-foreground">Loading...</p>
              </div>
              <div className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
