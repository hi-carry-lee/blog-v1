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
import { createTag } from "@/lib/actions/tag";
import { generateSlug } from "@/lib/slug-helper";
import { Loader2 } from "lucide-react";
import { useSemanticToast } from "@/lib/hooks/useSemanticToast";
import { logger } from "@/lib/logger";
import { useState } from "react";

type TagCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (tag: { id: string; name: string; slug: string }) => void;
};

export default function TagCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: TagCreateDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { success, error } = useSemanticToast();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
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

  const onSubmit = async (data: TagFormData) => {
    setIsCreating(true);
    try {
      const result = await createTag(data);
      if (result.success && result.tag) {
        success("Tag created successfully!", "New tag has been created.");
        onSuccess(result.tag);
        handleOpenChange(false);
      } else {
        error("Failed to create tag", "Please try again.");
      }
    } catch (err) {
      logger.error("Create tag error", err);
      error("Failed to create tag", "An unexpected error occurred.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new tag.
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
                      placeholder="Enter tag name"
                      disabled={isCreating}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
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
