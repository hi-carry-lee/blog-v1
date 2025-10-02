"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { tagSchema, type TagFormData } from "@/lib/zod-validations";
import { createTag, updateTag, slugUniqueValidate } from "@/lib/actions/tag";
import { useEffect, useState } from "react";
import { generateSlug } from "@/lib/slug-helper";
import { Loader2 } from "lucide-react";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { logger } from "@/lib/logger";

type TagFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  onSuccess: () => void;
};

export default function TagForm({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: TagFormProps) {
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const isEditMode = !!tag;
  const { success, error } = useSemanticToast();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  /**
   * 🔄 表单数据同步 Effect
   *
   * 作用：当 dialog 打开/关闭或 tag 变化时，同步表单数据
   *
   * 两种情况：
   * 1. tag 存在（编辑模式）：填充现有数据
   * 2. tag 为 null（创建模式）：清空表单
   *
   * 💡 最佳实践：每次打开表单都从干净状态开始，避免残留上次失败的数据
   * 这样用户体验更好，不会因为上次的错误数据而困惑
   *
   * 🔑 关键：
   * - 依赖 `open` 确保每次打开 Dialog 都重新初始化表单
   * - 这解决了：创建成功后再次打开时，tag 仍为 null 导致 useEffect 不触发的问题
   * - form.reset() 会清除字段值、错误状态、touched 状态等，确保完全干净的表单
   */
  useEffect(() => {
    if (!open) return; // Dialog 关闭时不执行

    if (tag) {
      // 编辑模式：填充现有标签数据
      // keepErrors: false 确保清除之前的错误状态
      form.reset(
        {
          name: tag.name,
          slug: tag.slug,
        },
        {
          keepErrors: false, // 清除所有错误
          keepDirty: false, // 重置 dirty 状态
          keepTouched: false, // 重置 touched 状态
        }
      );
    } else {
      // 创建模式：清空表单（包括上次失败的数据和错误状态）
      form.reset(
        {
          name: "",
          slug: "",
        },
        {
          keepErrors: false, // 清除所有错误（重要！）
          keepDirty: false,
          keepTouched: false,
        }
      );
    }
  }, [open, tag, form]);

  /**
   * 📝 实时生成 Slug 函数
   *
   * 原理：
   * 1. 当用户在 name 输入框输入时，onChange 事件触发
   * 2. 该函数被调用，接收最新的 name 值
   * 3. 通过 generateSlug(name) 将中文/特殊字符转换为 URL 友好格式
   *    例如："前端开发" -> "frontend-development"
   * 4. 通过 form.setValue() 立即更新 slug 字段的值
   * 5. React Hook Form 触发重新渲染，slug 输入框显示新值
   *
   * 条件控制：
   * - 创建模式：总是自动生成
   * - 编辑模式：只在 slug 为空时生成（避免覆盖用户手动修改的 slug）
   *
   * 💡 性能考虑：
   * - generateSlug 是纯字符串处理（无 I/O 操作），性能开销极小
   * - 每次输入约 0.1-0.5ms，用户完全感觉不到延迟
   * - 无需 debounce，实时反馈用户体验更好
   *
   * 🎯 最佳实践：✅
   * - 减少用户手动输入，提升效率
   * - 实时反馈，所见即所得
   * - 保证 URL 格式规范，避免后续错误
   */
  const handleNameChange = (name: string) => {
    // 只在创建模式或 slug 为空时自动生成
    // 这样不会覆盖用户在编辑模式下手动修改的 slug
    if (!isEditMode || !form.getValues("slug")) {
      const generatedSlug = generateSlug(name);
      form.setValue("slug", generatedSlug);
    }
  };

  /**
   * Slug 唯一性验证函数
   *
   * 触发时机：用户在 slug 输入框失焦时（onBlur）
   *
   * 验证逻辑：
   * 1. 跳过空 slug
   * 2. 编辑模式下，如果 slug 未改变则跳过验证（避免不必要的请求）
   * 3. 调用服务器端验证函数检查唯一性
   * 4. 显示加载指示器（输入框右侧的旋转图标）
   * 5. 验证失败时设置表单错误，成功时清除错误
   *
   * 💡 性能优化：
   * - 只在失焦时验证，不在每次输入时验证（避免频繁请求）
   * - 编辑模式下跳过未修改的 slug（减少不必要的数据库查询）
   */
  const handleSlugBlur = async () => {
    const slug = form.getValues("slug");

    // 跳过验证的情况：空 slug 或编辑模式下未修改的 slug
    if (!slug || (isEditMode && slug === tag?.slug)) {
      return;
    }

    setIsCheckingSlug(true);
    try {
      const result = await slugUniqueValidate(slug);
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

  const onSubmit = async (data: TagFormData) => {
    try {
      let result;
      if (isEditMode && tag) {
        result = await updateTag(data, tag.id);
      } else {
        result = await createTag(data);
      }

      if (result.success) {
        success(
          result.message ||
            `Tag ${isEditMode ? "updated" : "created"} successfully!`
        );
        // ✅ 关闭 Dialog，清空表单由 handleDialogOpenChange 统一处理
        onOpenChange(false);
        onSuccess();
      } else {
        error(
          result.error || `Failed to ${isEditMode ? "update" : "create"} tag`
        );
      }
    } catch (err) {
      logger.error("Tag form submission error", err);
      error("An unexpected error occurred");
    }
  };

  /**
   * 🚪 关闭处理函数
   *
   * 注意：不要在这里调用 form.reset()
   * 原因：
   * 1. 会与 useEffect 的清空逻辑冲突
   * 2. form.reset() 不会清除表单错误状态
   * 3. 统一由 useEffect 在下次打开时处理更可靠
   *
   * 工作流程：
   * Cancel/X/ESC/外部点击 → onOpenChange(false) → Dialog 关闭
   * 下次打开 → useEffect 触发 → form.reset() 清空表单 + 清除错误
   */
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Tag" : "Create New Tag"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the tag information below."
              : "Fill in the details to create a new tag."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 
              📝 Name 输入框 - 实时生成 Slug 的核心实现
              
              关键代码：onChange={(e) => { field.onChange(e); handleNameChange(e.target.value); }}
              
              工作流程：
              1. 用户输入一个字符（如 "前"）
              2. onChange 事件触发
              3. field.onChange(e) - 更新 React Hook Form 的 name 字段状态
              4. handleNameChange(e.target.value) - 同时调用自定义处理函数
              5. handleNameChange 内部调用 form.setValue("slug", ...) 更新 slug 字段
              6. React Hook Form 检测到 slug 字段变化，触发重新渲染
              7. 下面的 Slug 输入框显示新值（实时显示效果）
              
              整个过程发生在几毫秒内，用户感觉是"同步"的
            */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tag name"
                      disabled={form.formState.isSubmitting}
                      {...field}
                      onChange={(e) => {
                        // ⚡ 双重更新：既更新 name 字段，又触发 slug 生成
                        field.onChange(e); // 更新 name 字段
                        handleNameChange(e.target.value); // 同时生成并更新 slug
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The display name for this tag.
                  </FormDescription>
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
                        placeholder="tag-slug"
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
                    URL-friendly identifier (auto-generated from name).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Tag"
                ) : (
                  "Create Tag"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
