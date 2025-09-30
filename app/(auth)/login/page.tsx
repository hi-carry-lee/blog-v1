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
import { Triangle } from "lucide-react";
import Link from "next/link";
import { useAppTheme } from "@/lib/hooks/useAppTheme";
import { loginSchema, type LoginFormData } from "@/lib/zod-validations";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  useAppTheme(); // Initialize theme
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { success, error } = useSemanticToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
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
      } else if (result?.ok) {
        success(
          "Login successful!",
          "Welcome back! Redirecting to dashboard..."
        );
        // 使用 replace 进行跳转，可以避免用户返回登录页
        router.replace(callbackUrl);
      }
    } catch (err) {
      console.error("Login error:", err);
      error("An unexpected error occurred", "Please try again later.");
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const result = await signIn("github", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "OAuthAccountNotLinked") {
          error(
            "Account linking failed",
            "Unable to link your GitHub account. Please contact support if this issue persists."
          );
        } else {
          error("GitHub login failed", "Please try again later.");
        }
      } else if (result?.ok || result?.url) {
        success(
          "GitHub login successful!",
          "Your GitHub account has been linked successfully."
        );
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          router.replace(result?.url || callbackUrl);
        }, 1000);
      }
    } catch (err) {
      console.error("GitHub login error:", err);
      error("GitHub login failed", "Please try again later.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "OAuthAccountNotLinked") {
          error(
            "Account linking failed",
            "Unable to link your Google account. Please contact support if this issue persists."
          );
        } else {
          error("Google login failed", "Please try again later.");
        }
      } else if (result?.ok || result?.url) {
        success(
          "Google login successful!",
          "Welcome! You have been logged in successfully."
        );
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          router.replace(result?.url || callbackUrl);
        }, 1000);
      }
    } catch (err) {
      console.error("Google login error:", err);
      error("Google login failed", "Please try again later.");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Here you would navigate to forgot password page
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Logo/Brand */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <Triangle className="w-6 h-6 text-primary fill-primary" />
          <span className="font-semibold text-lg text-foreground">
            AI Blog Platform
          </span>
        </Link>
      </div>

      {/* Login Form */}
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
              onClick={handleGitHubLogin}
              disabled={form.formState.isSubmitting}
              className="w-full border-border bg-card hover:bg-accent text-card-foreground font-medium py-3 disabled:opacity-50"
            >
              <FaGithub className="w-5 h-5 mr-2" />
              Log in with GitHub
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
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
    </div>
  );
}
