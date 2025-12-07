"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { loginSchema, type LoginFormData } from "@/lib/zod-validations";
import { useCredentialsLogin } from "@/lib/hooks/useCredentialsLogin";
import { useOAuth } from "@/lib/hooks/useOAuth";

/**
 * Login Form Component
 *
 * 🔧 性能优化：独立的客户端组件
 * - 使用 useSearchParams() 获取回调 URL
 * - 被 page.tsx 中的 Suspense 包裹，支持静态优化
 * - 包含所有表单逻辑、验证和第三方登录
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { handleCredentialsLogin } = useCredentialsLogin({ callbackUrl });
  const { handleOAuthLogin } = useOAuth({ callbackUrl });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await handleCredentialsLogin(data);
  };

  const handleForgotPassword = () => {
    // 导航到一个新的页面，并将该页面添加到浏览器的历史记录中
    // replace，不会将该页面添加到浏览器的历史记录中
    // router.prefetch	N/A	提前加载页面内容，优化性能
    router.push("/forgot-password");
  };

  return (
    <Card className="w-full max-w-md bg-card shadow-xl border-border">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-card-foreground mb-2">
            Log in to your account
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full placeholder:text-gray-400"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full placeholder:text-gray-400"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-primary hover:text-primary/90 text-sm font-medium"
                disabled={form.formState.isSubmitting}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-base disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "Signing in..." : "Log In"}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin("github")}
            disabled={form.formState.isSubmitting}
            className="w-full border-border bg-card hover:bg-accent text-card-foreground font-medium py-3 disabled:opacity-50"
          >
            <FaGithub className="w-5 h-5 mr-2" />
            Log in with GitHub
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin("google")}
            disabled={form.formState.isSubmitting}
            className="w-full border-border bg-card hover:bg-accent text-card-foreground font-medium py-3 disabled:opacity-50"
          >
            <FaGoogle className="w-5 h-5 mr-2 text-blue-500" />
            Log in with Google
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
