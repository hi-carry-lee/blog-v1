import { notFound } from "next/navigation";
import { getPostById } from "@/lib/actions/post";
import EditPostFormPage from "@/app/dashboard/posts/edit/[id]/edit-post-form-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const result = await getPostById(id);

  if (!result.success || !result.post) {
    notFound();
  }

  return <EditPostFormPage post={result.post} />;
}
