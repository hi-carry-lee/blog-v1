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
import { BrandLogo } from "@/components/brand-logo";
import { loginSchema, type LoginFormData } from "@/lib/zod-validations";
import { useSearchParams } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useCredentialsLogin } from "@/lib/hooks/useCredentialsLogin";
import { useOAuth } from "@/lib/hooks/useOAuth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { handleCredentialsLogin } = useCredentialsLogin({
    callbackUrl,
  });

  const { handleOAuthLogin } = useOAuth({
    callbackUrl,
  });

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
    console.log("Forgot password clicked");
    // Here you would navigate to forgot password page
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <BrandLogo />

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
    </div>
  );
}
