import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonLayout } from "@/components/learn/lesson-layout";
import { getLessonBySlug, getLessonSlugsByLevel } from "@/content/lessons";

type SecurityLessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLessonSlugsByLevel("security").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: SecurityLessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "security") {
    return { title: "Lesson" };
  }

  return {
    title: lesson.seoTitle ? { absolute: lesson.seoTitle } : lesson.title,
    description: lesson.seoDescription ?? lesson.description,
  };
}

export default async function SecurityLessonPage({
  params,
}: SecurityLessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "security") {
    notFound();
  }

  return <LessonLayout lesson={lesson} />;
}
