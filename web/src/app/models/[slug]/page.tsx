import { notFound } from "next/navigation";
import { getModelBySlug, getModelsByFamily } from "@/lib/db/models";
import { ModelHeader } from "@/components/models/detail/ModelHeader";
import { TechSpecsCard } from "@/components/models/detail/TechSpecsCard";
import { CapabilitiesCard } from "@/components/models/detail/CapabilitiesCard";
import { BenchmarksCard } from "@/components/models/detail/BenchmarksCard";
import { ResourcesCard } from "@/components/models/detail/ResourcesCard";
import { PricingCard } from "@/components/models/detail/PricingCard";
import { FamilyTimeline } from "@/components/models/detail/FamilyTimeline";
import { ActionBar } from "@/components/models/detail/ActionBar";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    return {
      title: "模型未找到 - LMWiki",
    };
  }

  return {
    title: `${model.name} - LMWiki`,
    description: model.description || `${model.name} 是由 ${model.developer} 开发的${model.modelType === "open" ? "开源" : "闭源"}大语言模型。`,
    openGraph: {
      title: `${model.name} - LMWiki`,
      description: model.description || `探索 ${model.name} 的详细信息`,
      images: model.logoUrl ? [model.logoUrl] : undefined,
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  // Get family models for timeline
  const familyModels = model.family
    ? await getModelsByFamily(model.family)
    : [];

  return (
    <div className="min-h-screen pb-24">
      {/* Header Section */}
      <ModelHeader model={model} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Specs */}
            <TechSpecsCard model={model} />

            {/* Benchmarks with Radar Chart */}
            {Object.keys(model.benchmarks).length > 0 && (
              <BenchmarksCard model={model} />
            )}

            {/* Family Timeline */}
            {familyModels.length > 1 && (
              <FamilyTimeline
                models={familyModels}
                currentSlug={model.slug}
                familyName={model.family || ""}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capabilities */}
            <CapabilitiesCard model={model} />

            {/* Pricing */}
            {(model.pricingInput !== null || model.pricingOutput !== null) && (
              <PricingCard model={model} />
            )}

            {/* Resources */}
            <ResourcesCard model={model} />
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <ActionBar model={model} />
    </div>
  );
}

