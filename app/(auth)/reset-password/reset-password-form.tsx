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
import { useRouter } from "next/navigation";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/zod-validations";
import { resetPassword } from "@/lib/actions/user";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";

/**
 * Reset Password Form Component
 *
 * 🔧 性能优化：独立的客户端组件
 * - 接收 token 作为 prop
 * - 使用 react-hook-form + zodResolver 进行表单验证
 * - 调用 Server Action resetPassword 重置密码
 * - 使用 useSemanticToast 显示提示
 * - 成功后跳转到登录页
 */
export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { success, error } = useSemanticToast();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const result = await resetPassword(token, data);

      if (result.success) {
        success(
          "Password reset successful",
          result.message ||
            "Your password has been reset. Redirecting to login..."
        );
        // 清除表单
        form.reset();
        // 2 秒后跳转到登录页
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        error(
          "Reset failed",
          result.error || "An error occurred while resetting your password."
        );
      }
    } catch (err) {
      error("Something went wrong", "Please try again later.");
      console.error("Password reset error:", err);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card shadow-xl border-border">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-card-foreground mb-2">
            Reset your password
          </h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      className="w-full placeholder:text-gray-400"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
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
              {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-primary hover:text-primary/90 font-medium"
            >
              Back to login
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
