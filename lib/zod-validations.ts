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

// Type definition
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
