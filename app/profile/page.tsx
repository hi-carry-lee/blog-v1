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
import { Triangle, Camera } from "lucide-react";
import Link from "next/link";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/zod-validations";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { updateUserProfile, updateUserAvatar } from "@/lib/actions/user";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { success, error } = useSemanticToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0); // 用于强制重新渲染图片
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // 本地图片状态
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  // 初始化本地图片状态
  useEffect(() => {
    if (session?.user?.image) {
      setCurrentImageUrl(session.user.image);
    }
  }, [session?.user?.image]);

  // 提交更新用户信息
  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      if (!session?.user?.id) {
        error(
          "Authentication required",
          "Please log in to update your profile."
        );
        return;
      }

      const result = await updateUserProfile(data, session.user.id);

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
      console.error("Profile update error:", err);
      error("An unexpected error occurred", "Please try again later.");
    }
  };

  // 隐藏的，用来存储图片url的Input元素，它的值变化时会出发这个事件
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      error("Invalid file type", "Please select a JPEG, PNG, or WebP image.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      error("File too large", "Please select an image smaller than 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      // Upload to Cloudinary
      const uploadResponse = await uploadImage(formData);

      // 上传Cloudinary成功后，更新user表中的图片url
      if (uploadResponse.success && session?.user?.id) {
        // 上传成功后，更新user表中的图片url
        const result = await updateUserAvatar(
          uploadResponse.url,
          session.user.id
        );

        if (result.success && result.user) {
          success(
            "Avatar updated successfully!",
            "Your profile picture has been updated."
          );

          // 更新本地图片状态
          setCurrentImageUrl(result.user.image);
          // 强制重新渲染图片组件
          setImageKey((prev) => prev + 1);

          // 更新 session，这会触发 jwt callback 的 trigger === "update"
          await update({
            user: {
              ...session?.user,
              image: result.user.image,
            },
          });
        } else {
          error(
            "Avatar update failed",
            result.error || "Please try again later."
          );
        }
      } else {
        error(
          "Upload failed",
          uploadResponse.error || "Failed to upload image. Please try again."
        );
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      error("Upload failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadImage = async (
    formData: FormData
  ): Promise<{
    success: boolean;
    url: string;
    public_id: string;
    error?: string;
  }> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      const res = {
        success: true,
        url: data.url,
        public_id: data.public_id,
      };
      return res;
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        url: "",
        public_id: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card shadow-xl border-border">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-card-foreground mb-4">
              Authentication Required
            </h1>
            <p className="text-muted-foreground mb-6">
              Please log in to view your profile.
            </p>
            <Link href="/login">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Log In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <>
                  {console.log(
                    "Rendering image with URL:",
                    currentImageUrl,
                    "key:",
                    imageKey
                  )}
                  <Image
                    key={imageKey} // 添加 key 强制重新渲染
                    src={currentImageUrl}
                    alt={session.user?.name || "User"}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-primary/20"
                    priority
                  />
                </>
              ) : (
                <div className="w-30 h-30 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl border-4 border-primary/20">
                  {getInitials(
                    session.user?.name || session.user?.email || "U"
                  )}
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
  );
}
