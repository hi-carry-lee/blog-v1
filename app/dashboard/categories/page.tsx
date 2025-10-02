import { CategoryWithPosts, queryAllCategories } from "@/lib/actions/category";
import CategoryTable from "./category-table";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoriesPage({ searchParams }: Props) {
  // Get page from URL search params
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  // Fetch categories data (Server Component)
  const result = await queryAllCategories(currentPage, 5);

  return (
    <div className="bg-background min-h-full">
      <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 max-w-6xl mx-auto">
        {/* Categories Table - pass data to client component */}
        <CategoryTable
          initialCategories={result.categories as CategoryWithPosts[]}
          totalPages={result.totalPages}
          currentPage={currentPage}
          totalCount={result.totalCount}
        />
      </div>
    </div>
  );
}
