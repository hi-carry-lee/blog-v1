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
import { categorySchema, type CategoryFormData } from "@/lib/zod-validations";
import { createCategory } from "@/lib/actions/category";
import { generateSlug } from "@/lib/slug-helper";
import { Loader2 } from "lucide-react";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { logger } from "@/lib/logger";
import { useState } from "react";

type CategoryCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (category: { id: string; name: string; slug: string }) => void;
};

export default function CategoryCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CategoryCreateDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { success, error } = useSemanticToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // 重置表单当对话框打开/关闭时
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  // 自动生成slug
  const handleNameChange = (name: string) => {
    const generatedSlug = generateSlug(name);
    form.setValue("slug", generatedSlug);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsCreating(true);
    try {
      const result = await createCategory(data);
      if (result.success && result.category) {
        success(
          "Category created successfully!",
          "New category has been created."
        );
        onSuccess(result.category);
        handleOpenChange(false);
      } else {
        error("Failed to create category", "Please try again.");
      }
    } catch (err) {
      logger.error("Create category error", err);
      error("Failed to create category", "An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      disabled={isCreating}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The display name for this category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
