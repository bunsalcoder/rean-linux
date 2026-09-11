import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { getLessonBySlug, getLessonSlugsByLevel } from "@/content/lessons";

type BeginnerLessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLessonSlugsByLevel("beginner").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: BeginnerLessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "beginner") {
    return { title: "Lesson" };
  }

  return {
    title: lesson.seoTitle ? { absolute: lesson.seoTitle } : lesson.title,
    description: lesson.seoDescription ?? lesson.description,
  };
}

export default async function BeginnerLessonPage({
  params,
}: BeginnerLessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "beginner") {
    notFound();
  }

  return <LessonLayout lesson={lesson} />;
}
