import { notFound } from "next/navigation";
import {
  getPostById,
  getAllCategories,
  getAllTags,
} from "@/lib/db-access/post";
import EditPostFormPage from "@/app/dashboard/posts/edit/[id]/edit-post-form-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const [postResult, categoriesResult, tagsResult] = await Promise.all([
    getPostById(id, true),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!postResult.success || !postResult.post) {
    notFound();
  }

  return (
    <EditPostFormPage
      post={postResult.post}
      categories={categoriesResult.categories}
      tags={tagsResult.tags}
    />
  );
}
