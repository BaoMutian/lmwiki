import { notFound } from "next/navigation";
import { getModelBySlug, getModelsByFamily, getModelVariants } from "@/lib/db/models";
import { ModelHeader } from "@/components/models/detail/ModelHeader";
import { TechSpecsCard } from "@/components/models/detail/TechSpecsCard";
import { CapabilitiesCard } from "@/components/models/detail/CapabilitiesCard";
import { BenchmarksCard } from "@/components/models/detail/BenchmarksCard";
import { ResourcesCard } from "@/components/models/detail/ResourcesCard";
import { PricingCard } from "@/components/models/detail/PricingCard";
import { FamilyTimeline } from "@/components/models/detail/FamilyTimeline";
import { ActionBar } from "@/components/models/detail/ActionBar";
import { VariantSwitcher } from "@/components/models/detail/VariantSwitcher";
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
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  // Get family models for timeline and variants
  const [familyModels, variants] = await Promise.all([
    model.family ? getModelsByFamily(model.family) : Promise.resolve([]),
    model.baseModelName ? getModelVariants(model.baseModelName) : Promise.resolve([]),
  ]);

  const hasBenchmarks = Object.keys(model.benchmarks).length > 0;
  const hasPricing = model.pricingInput !== null || model.pricingOutput !== null;
  const hasVariants = variants.length > 1;

  return (
    <div className="min-h-screen pb-28">
      {/* Header Section */}
      <ModelHeader model={model} />

      {/* Main Content - Increased spacing */}
      <div className="container mx-auto px-4 py-10 lg:py-12">
        {/* Variant Switcher - Shows when model has variants */}
        {hasVariants && (
          <div className="mb-8">
            <VariantSwitcher
              variants={variants}
              currentSlug={model.slug}
              baseModelName={model.baseModelName!}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Column - 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            {/* Technical Specs - Only renders if has data */}
            <TechSpecsCard model={model} />

            {/* Benchmarks with Radar Chart */}
            {hasBenchmarks && (
              <BenchmarksCard model={model} />
            )}

            {/* Family Timeline */}
            {familyModels.length > 1 && (
              <FamilyTimeline
                models={familyModels}
                currentSlug={model.slug}
                currentBaseModelName={model.baseModelName}
                familyName={model.family || ""}
              />
            )}
          </div>

          {/* Sidebar - 4 cols */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Capabilities - Only shows enabled ones */}
            <CapabilitiesCard model={model} />

            {/* Pricing */}
            {hasPricing && (
              <PricingCard model={model} />
            )}

            {/* Resources */}
            <ResourcesCard model={model} />
          </aside>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <ActionBar model={model} />
    </div>
  );
}
