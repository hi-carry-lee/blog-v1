import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db-access/post";
import EditPostFormPage from "@/app/dashboard/posts/edit/[id]/edit-post-form-page";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const result = await getPostById(id, true); // 允许查询未发布的文章（Dashboard 编辑页面）

  if (!result.success || !result.post) {
    notFound();
  }

  return <EditPostFormPage post={result.post} />;
}
