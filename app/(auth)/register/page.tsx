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
import { registerSchema, type RegisterFormData } from "@/lib/zod-validations";
import { registerUser } from "@/lib/actions/user";
import { toast } from "sonner";

export default function RegisterPage() {
  useAppTheme(); // Initialize theme

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser(data);

      if (result.success) {
        toast.success(result.message || "Account created successfully!", {
          description: "You can now sign in to your account.",
        });
        form.reset();
      } else {
        toast.error(result.error || "Registration failed", {
          description: "Please check your information and try again.",
        });
      }
    } catch (error) {
      // TODO use logger
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again later.",
      });
    }
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

      {/* Registration Form */}
      <Card className="w-full max-w-md bg-card shadow-xl border-border">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-card-foreground mb-2">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Join our community of content creators.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="w-full placeholder:text-gray-400"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
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
                        placeholder="Confirm your password"
                        className="w-full placeholder:text-gray-400"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-base disabled:opacity-50"
              >
                {form.formState.isSubmitting
                  ? "Creating account..."
                  : "Sign Up"}
              </Button>
            </form>
          </Form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/90 font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
