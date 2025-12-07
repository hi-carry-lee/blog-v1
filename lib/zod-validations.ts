import * as z from "zod";
// ---------------- Schema definition ----------------
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password cannot be empty")
    .min(6, "At least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "At least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "At least 6 characters"),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    //   "Password must contain uppercase and lowercase letters and numbers")
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  email: z.email("Please enter a valid email address"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  slug: z.string().min(2, "At least 2 characters"),
});

export const tagSchema = z.object({
  name: z.string().min(2, "At least 2 characters"),
  slug: z.string().min(2, "At least 2 characters"),
});

export const postSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  brief: z.string().min(10, "Brief must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  });

// Type definition
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
