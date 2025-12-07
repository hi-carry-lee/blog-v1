import PostFormPage from "@/app/dashboard/posts/create/post-form-page";
import { getAllCategories, getAllTags } from "@/lib/db-access/post";

export default async function CreatePostPage() {
  const [categoriesRes, tagsRes] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <PostFormPage
      categoriesProps={categoriesRes.categories}
      tagsProps={tagsRes.tags}
    />
  );
}
