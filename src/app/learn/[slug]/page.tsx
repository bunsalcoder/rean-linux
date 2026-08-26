import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { getLearningLevel, LEARNING_LEVEL_SLUGS } from "@/config/learning-path";
import { getTopic, TOPIC_SLUGS } from "@/config/topics";

type LearnSlugPageProps = {
  params: Promise<{ slug: string }>;
};

const LEARN_PAGE_SLUGS = Array.from(
  new Set<string>([...LEARNING_LEVEL_SLUGS, ...TOPIC_SLUGS]),
);

export function generateStaticParams() {
  return LEARN_PAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

function getLearnPlaceholder(slug: string) {
  const level = getLearningLevel(slug);

  if (level) {
    return {
      title: level.title,
      description: `${level.description} Lessons for this path will be published here.`,
    };
  }

  const topic = getTopic(slug);

  if (topic) {
    return {
      title: topic.title,
      description: `${topic.description} Lessons for this topic will be published here.`,
    };
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: LearnSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLearnPlaceholder(slug);

  if (!page) {
    return { title: "Learn" };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function LearnSlugPage({ params }: LearnSlugPageProps) {
  const { slug } = await params;
  const page = getLearnPlaceholder(slug);

  if (!page) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader title={page.title} description={page.description} />
    </PageContainer>
  );
}
