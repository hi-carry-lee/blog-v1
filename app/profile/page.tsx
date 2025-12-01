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
import { Camera } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/zod-validations";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { updateUserProfile } from "@/lib/actions/user";
import { getInitials } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { uploadAndUpdateAvatar } from "@/lib/utils/avatar-upload";
import { RequireAuth } from "@/components/auth/require-auth";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { success, error } = useSemanticToast();
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // 本地图片状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    id: userId,
    image: userImage,
    name: userName,
    email: userEmail,
  } = session?.user || {};

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
    },
  });

  // 初始化本地图片状态
  useEffect(() => {
    if (userImage) {
      setCurrentImageUrl(userImage);
    }
  }, [userImage]);

  // 提交更新用户信息
  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      if (!userId) {
        error(
          "Authentication required",
          "Please log in to update your profile."
        );
        return;
      }

      const result = await updateUserProfile(data, userId);

      if (result.success && result.user) {
        success(
          "Profile updated successfully!",
          "Your profile information has been updated."
        );
        // Update the session with new user data
        await update({
          user: {
            ...session?.user,
            name: result.user.name,
            email: result.user.email,
          },
        });
      } else {
        error("Update failed", result.error || "Please try again later.");
      }
    } catch (err) {
      logger.error("Profile update error:", err);
      error("An unexpected error occurred", "Please try again later.");
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!userId) {
      error("Authentication required", "Please log in to update your avatar.");
      return;
    }

    setIsUploading(true);

    try {
      // 调用业务逻辑函数处理上传和更新
      const result = await uploadAndUpdateAvatar(file, userId);

      if (result.success && result.user) {
        success(
          "Avatar updated successfully!",
          "Your profile picture has been updated."
        );

        // 更新本地图片状态
        setCurrentImageUrl(result.user.image);

        // 更新 session，这会触发 jwt callback 的 trigger === "update"
        await update({
          user: {
            ...session?.user,
            image: result.user.image,
          },
        });
      } else {
        const errorMessage =
          result.success === false ? result.error : "Please try again later.";
        error("Upload failed", errorMessage);
      }
    } catch (err) {
      logger.error("Avatar upload error:", err);
      error("Upload failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <BrandLogo />

        {/* Profile Update Form */}
        <Card className="w-full max-w-md bg-card shadow-xl border-border">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-card-foreground mb-2">
                Update Profile
              </h1>
              <p className="text-muted-foreground">
                Keep your personal information up to date.
              </p>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {currentImageUrl ? (
                  <Image
                    key={currentImageUrl} // 使用 URL 作为 key，URL 变化时会自动更新
                    src={currentImageUrl}
                    alt="User avatar"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-primary/20"
                    priority
                  />
                ) : (
                  <div className="w-30 h-30 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl border-4 border-primary/20">
                    {getInitials(userName || userEmail || "U")}
                  </div>
                )}

                {/* Camera Icon Overlay */}
                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isUploading ? "Uploading..." : "Upload new avatar"}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                {isUploading
                  ? "Uploading your avatar..."
                  : "Click the camera to upload a new avatar"}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full placeholder:text-gray-400"
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Save Changes Button */}
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-base disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
