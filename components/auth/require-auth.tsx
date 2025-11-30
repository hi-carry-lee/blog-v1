"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Home, LogIn } from "lucide-react";
import { Loader2 } from "lucide-react";

/**
 * 为什么需要在 Client Component 中进行认证检查？
 *
 * 虽然我们已经在 middleware.ts 中实现了路由级别的保护，但在 Client Component 中
 * 再次进行认证检查仍然是必要的，原因如下：
 *
 * 1. **客户端状态同步问题**
 *    - 客户端导航时，session 可能尚未完全加载
 *    - 直接访问 URL 时，客户端状态可能与服务端状态不一致
 *    - useSession() 的初始状态可能是 undefined，需要等待加载完成
 *
 * 2. **Session 过期处理**
 *    - 用户的 session 可能在 middleware 检查之后过期
 *    - 客户端需要实时响应 session 状态变化
 *    - 提供更好的用户体验（显示友好提示而非空白页）
 *
 * 3. **多层防护策略**
 *    - Middleware：第一层防护，快速路由拦截（基于 Cookie 的乐观检查）
 *    - Component：第二层防护，完整的客户端状态验证
 *    - 符合 Next.js 官方推荐的安全最佳实践
 *
 * 4. **用户体验优化**
 *    - 可以显示加载状态，避免闪烁
 *    - 可以显示友好的错误提示和操作指引
 *    - 可以处理边缘情况（如网络问题导致的 session 加载失败）
 */

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // 自定义未登录时显示的 fallback UI，如果不提供，将使用默认的登录提示界面
  loginPath?: string; // 登录页面的路径，默认为 "/login"
}

/**
 * 要求用户已登录的保护组件
 *
 * 使用示例：
 * ```tsx
 * <RequireAuth>
 *   <YourProtectedComponent />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({
  children,
  fallback,
  loginPath = "/login",
}: RequireAuthProps) {
  const { data: session, status } = useSession();

  // 加载中状态：显示加载指示器
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // 未登录状态：显示登录提示
  if (!session) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card shadow-xl border-border">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-4">
              Authentication Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please log in to access this page.
            </p>
            <Link href={loginPath}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 已登录：渲染子组件
  return <>{children}</>;
}

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: string[]; // 允许访问的角色列表，用户必须拥有其中一个角色才能访问
  fallback?: React.ReactNode; // 自定义权限不足时显示的 fallback UI，如果不提供，将使用默认的权限拒绝界面
  title?: string; // 权限拒绝时显示的标题
  message?: string; // 权限拒绝时显示的消息
}

/**
 * 要求用户拥有特定角色的保护组件
 *
 * 使用示例：
 * ```tsx
 * <RequireRole allowedRoles={["admin"]}>
 *   <AdminDashboard />
 * </RequireRole>
 * ```
 */
export function RequireRole({
  children,
  allowedRoles,
  fallback,
  title = "Access Denied",
  message,
}: RequireRoleProps) {
  const { data: session, status } = useSession();

  // 加载中状态
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // 未登录：先要求登录
  if (!session) {
    return (
      <RequireAuth>
        <>{children}</>
      </RequireAuth>
    );
  }

  // 检查角色权限
  const userRole = session.user?.role;
  const hasPermission = userRole && allowedRoles.includes(userRole);

  // 权限不足：显示拒绝界面
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const defaultMessage =
      message ||
      `You don't have permission to access this page. This area is restricted to ${allowedRoles.join(
        ", "
      )} only.`;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {defaultMessage}
            </p>

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>

              <Link href="/posts" className="block">
                <Button variant="outline" className="w-full">
                  Browse Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 权限足够：渲染子组件
  return <>{children}</>;
}
