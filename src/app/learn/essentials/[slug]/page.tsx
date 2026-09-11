import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonLayout } from "@/components/learn/lesson-layout";
import {
  getLessonBySlug,
  getLessonSlugsByLevel,
} from "@/content/lessons";

type EssentialsLessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLessonSlugsByLevel("essentials").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: EssentialsLessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "essentials") {
    return { title: "Lesson" };
  }

  return {
    title: lesson.seoTitle ? { absolute: lesson.seoTitle } : lesson.title,
    description: lesson.seoDescription ?? lesson.description,
  };
}

export default async function EssentialsLessonPage({
  params,
}: EssentialsLessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson || lesson.level !== "essentials") {
    notFound();
  }

  return <LessonLayout lesson={lesson} />;
}
