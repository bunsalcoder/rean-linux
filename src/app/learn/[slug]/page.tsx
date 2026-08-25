import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getLearningLevel, LEARNING_LEVEL_SLUGS } from "@/config/learning-path";

type LearnLevelPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEARNING_LEVEL_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LearnLevelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const level = getLearningLevel(slug);

  if (!level) {
    return { title: "Learn" };
  }

  return {
    title: level.title,
    description: level.description,
  };
}

export default async function LearnLevelPage({ params }: LearnLevelPageProps) {
  const { slug } = await params;
  const level = getLearningLevel(slug);

  if (!level) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        title={level.title}
        description={`${level.description} Lessons for this path will be published here.`}
      />
    </PageContainer>
  );
}
