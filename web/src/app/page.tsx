import { Suspense } from "react";
import { ModelList } from "@/components/models/ModelList";
import { ModelListSkeleton } from "@/components/models/ModelListSkeleton";
import { SearchHero } from "@/components/models/SearchHero";
import { FilterSidebar } from "@/components/models/FilterSidebar";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    family?: string;
    developer?: string;
    architecture?: string;
    vision?: string;
    reasoning?: string;
    toolUse?: string;
    sort?: string;
    order?: string;
    view?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <SearchHero initialSearch={params.search} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <FilterSidebar searchParams={params} />
          </aside>

          {/* Model Grid */}
          <div className="flex-1">
            <Suspense fallback={<ModelListSkeleton />}>
              <ModelList searchParams={params} />
            </Suspense>
          </div>
        </div>
        </div>
    </div>
  );
}
