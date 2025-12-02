import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Login Page Container
 *
 * 🔧 性能优化：将表单逻辑提取到 LoginForm 组件
 * - LoginForm 使用 useSearchParams()，必须用 Suspense 包裹
 * - 符合 Next.js 15 构建要求，避免预渲染错误
 * - 页面容器为 Server Component，提供更好的静态优化
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BrandLogo />

      <Suspense
        fallback={
          <Card className="w-full max-w-md bg-card shadow-xl border-border">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-card-foreground mb-2">
                  Log in to your account
                </h1>
                <p className="text-muted-foreground">Loading...</p>
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
        <LoginForm />
      </Suspense>
    </div>
  );
}
