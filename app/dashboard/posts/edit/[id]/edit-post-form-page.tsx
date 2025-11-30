"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MarkdownEditor from "@/components/markdown-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { postSchema } from "@/lib/zod-validations";
import { z } from "zod";
import {
  updatePost,
  validatePostSlug,
  getAllCategories,
  getAllTags,
} from "@/lib/actions/post";
import { useEffect, useState, useRef } from "react";
import { generateSlug } from "@/lib/slug-helper";
import { Loader2, X, ArrowLeft, Camera } from "lucide-react";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { logger } from "@/lib/logger";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PostWithRelations } from "@/lib/actions/post";
import Image from "next/image";
import { uploadImageFile } from "@/lib/utils/upload";
import { validateImageFile } from "@/lib/utils/file-validation";
import { UPLOAD_FOLDERS } from "@/lib/config/file-upload";
import { RequireAuth } from "@/components/auth/require-auth";

// 创建一个匹配 Zod schema 输入类型的类型
type PostFormInput = z.input<typeof postSchema>;

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type EditPostFormPageProps = {
  post: PostWithRelations;
};

export default function EditPostFormPage({ post }: EditPostFormPageProps) {
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const { success, error } = useSemanticToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PostFormInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
      slug: post.slug,
      brief: post.brief,
      content: post.content || "", // 使用 post.content 回显 markdown 内容
      coverImage: post.coverImage || "",
      categoryId: post.category.id,
      tagIds: post.tags.map((tag) => tag.id),
      published: post.published,
      featured: post.featured,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    },
  });

  // Initialize preview image URL when coverImage value changes
  useEffect(() => {
    const coverImageValue = form.watch("coverImage");
    if (coverImageValue && coverImageValue !== previewImageUrl) {
      setPreviewImageUrl(coverImageValue);
    }
  }, [form, previewImageUrl]);

  // 加载分类和标签
  useEffect(() => {
    const loadData = async () => {
      const [categoriesRes, tagsRes] = await Promise.all([
        getAllCategories(),
        getAllTags(),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.categories);
      }

      if (tagsRes.success) {
        setTags(tagsRes.tags);
      }
    };

    loadData();
  }, []);

  // 移除这个 useEffect，不再需要同步 selectedTags
  // useEffect(() => {
  //   setSelectedTags(post.tags.map((tag) => tag.id));
  // }, [post.tags]);

  // 自动生成 slug
  const handleTitleChange = (title: string) => {
    if (!form.getValues("slug") || form.getValues("slug") === post.slug) {
      const generatedSlug = generateSlug(title);
      form.setValue("slug", generatedSlug);
    }
  };

  // Slug 唯一性验证
  const handleSlugBlur = async () => {
    const slug = form.getValues("slug");

    if (!slug || slug === post.slug) {
      return;
    }

    setIsCheckingSlug(true);
    try {
      const result = await validatePostSlug(slug, post.id);
      if (!result.success) {
        form.setError("slug", {
          type: "manual",
          message: result.error || "Slug validation failed",
        });
      } else {
        form.clearErrors("slug");
      }
    } catch (err) {
      logger.error("Slug validation error", err);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // 处理标签选择
  const handleTagToggle = (tagId: string) => {
    const currentTagIds = form.getValues("tagIds") || [];
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];
    form.setValue("tagIds", newTagIds);
  };

  const onSubmit = async (data: PostFormInput) => {
    try {
      // 确保默认值被正确设置
      const formData = {
        ...data,
        tagIds: data.tagIds ?? [],
        published: data.published ?? false,
        featured: data.featured ?? false,
      };

      const result = await updatePost(formData, post.id);

      if (result.success) {
        success(result.message || "Post updated successfully!");
        router.push("/dashboard/posts");
      } else {
        error(result.error || "Failed to update post");
      }
    } catch (err) {
      logger.error("Post form submission error", err);
      error("An unexpected error occurred");
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/posts");
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      error(validation.error, validation.detail);
      return;
    }

    setIsUploadingImage(true);

    try {
      // 上传文件到 Cloudinary
      const uploadResponse = await uploadImageFile(
        file,
        UPLOAD_FOLDERS.COVER_IMAGES
      );

      if (uploadResponse.success) {
        // Update form field and preview
        form.setValue("coverImage", uploadResponse.url);
        setPreviewImageUrl(uploadResponse.url);
        success(
          "Image uploaded successfully!",
          "Cover image has been uploaded and set."
        );
      } else {
        error(
          "Upload failed",
          uploadResponse.error || "Failed to upload image. Please try again."
        );
      }
    } catch (err) {
      logger.error("Image upload error:", err);
      error("Upload failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    form.setValue("coverImage", "");
    setPreviewImageUrl("");
  };

  return (
    <RequireAuth>
      <div className="bg-background min-h-full">
        <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Edit Post
            </h1>
          </div>

          {/* Form */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post title"
                          disabled={form.formState.isSubmitting}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug Field */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="post-slug"
                            disabled={form.formState.isSubmitting}
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                              handleSlugBlur();
                            }}
                          />
                          {isCheckingSlug && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        URL-friendly identifier (auto-generated from title).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cover Image Field - 移动到更早的位置 */}
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {/* Image Preview */}
                          {previewImageUrl && (
                            <div className="relative inline-block">
                              <div className="relative w-64 h-40 overflow-hidden rounded-md border border-border bg-muted">
                                <Image
                                  src={previewImageUrl}
                                  alt="Cover preview"
                                  fill
                                  className="object-cover"
                                  priority={false}
                                  sizes="(max-width: 768px) 100vw, 256px"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={handleRemoveImage}
                                disabled={
                                  form.formState.isSubmitting ||
                                  isUploadingImage
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {/* Upload Button */}
                          <div className="flex flex-col space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleUploadClick}
                              disabled={
                                form.formState.isSubmitting || isUploadingImage
                              }
                              className="w-fit"
                            >
                              {isUploadingImage ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2 h-4 w-4" />
                                  Upload Cover Image
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brief Field */}
                <FormField
                  control={form.control}
                  name="brief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief / Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Short description of the post"
                          disabled={form.formState.isSubmitting}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Field */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Markdown)</FormLabel>
                      <FormControl>
                        <MarkdownEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Write your post content in Markdown..."
                          disabled={form.formState.isSubmitting}
                          minHeight={400}
                          showStats={true}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Supports Markdown formatting, code blocks, and images.
                        Use the toolbar to format text or upload images.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Field */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={form.formState.isSubmitting}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags Field */}
                <FormField
                  control={form.control}
                  name="tagIds"
                  render={() => {
                    const currentTagIds = form.watch("tagIds") || [];
                    return (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[60px]">
                          {tags.map((tag) => {
                            const isSelected = currentTagIds.includes(tag.id);
                            return (
                              <Badge
                                key={tag.id}
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer transition-colors"
                                onClick={() => handleTagToggle(tag.id)}
                              >
                                {tag.name}
                                {isSelected && <X className="ml-1 h-3 w-3" />}
                              </Badge>
                            );
                          })}
                          {tags.length === 0 && (
                            <span className="text-sm text-muted-foreground">
                              No tags available
                            </span>
                          )}
                        </div>
                        <FormDescription className="text-xs">
                          Click tags to select/deselect
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Published and Featured Checkboxes */}
                <div className="flex gap-6">
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={form.formState.isSubmitting}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Published
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            disabled={form.formState.isSubmitting}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Featured
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={form.formState.isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Post"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
