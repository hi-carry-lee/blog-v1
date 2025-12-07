"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/zod-validations";
import { requestPasswordReset } from "@/lib/actions/user";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

/**
 * Forgot Password Form Component
 *
 * 🔧 性能优化：独立的客户端组件
 * - 使用 react-hook-form + zodResolver 进行表单验证
 * - 调用 Server Action requestPasswordReset 发送重置邮件
 * - 使用 useSemanticToast 显示提示
 * - 成功后显示确认消息
 */
export default function ForgotPasswordForm() {
  const router = useRouter();
  const { success, error } = useSemanticToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await requestPasswordReset(data);

      if (result.success) {
        success(
          "Check your email",
          "If an account with that email exists, we've sent a password reset link."
        );
        // 清除表单
        form.reset();
        // 可选：2 秒后跳转回登录页
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        error(
          "Request failed",
          result.error || "An error occurred while processing your request."
        );
      }
    } catch (err) {
      error("Something went wrong", "Please try again later.");
      console.error("Forgot password error:", err);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card shadow-xl border-border">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-card-foreground mb-2">
            Reset your password
          </h1>
          <p className="text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-base disabled:opacity-50"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Back to login
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
