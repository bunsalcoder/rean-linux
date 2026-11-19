import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { getLessonBySlug, getLessonSlugsByLevel } from "@/content/lessons";

type PerformanceLessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLessonSlugsByLevel("performance").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PerformanceLessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug, "performance");

  if (!lesson) {
    return { title: "Lesson" };
  }

  return {
    title: lesson.seoTitle ? { absolute: lesson.seoTitle } : lesson.title,
    description: lesson.seoDescription ?? lesson.description,
  };
}

export default async function PerformanceLessonPage({
  params,
}: PerformanceLessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug, "performance");

  if (!lesson) {
    notFound();
  }

  return <LessonLayout lesson={lesson} />;
}
