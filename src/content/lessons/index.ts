import { filesystemLesson } from "@/content/lessons/beginner/filesystem";
import { firstCommandsLesson } from "@/content/lessons/beginner/first-commands";
import { installingLinuxLesson } from "@/content/lessons/beginner/installing-linux";
import { linuxDistributionsLesson } from "@/content/lessons/beginner/linux-distributions";
import { terminalLesson } from "@/content/lessons/beginner/terminal";
import { whatIsLinuxLesson } from "@/content/lessons/beginner/what-is-linux";
import { filePermissionsLesson } from "@/content/lessons/essentials/file-permissions";
import { usersAndGroupsLesson } from "@/content/lessons/essentials/users-and-groups";
import type { Lesson, LessonLevel } from "@/types/lesson";

export const lessons = [
  whatIsLinuxLesson,
  linuxDistributionsLesson,
  installingLinuxLesson,
  terminalLesson,
  firstCommandsLesson,
  filesystemLesson,
  usersAndGroupsLesson,
  filePermissionsLesson,
] as const satisfies readonly Lesson[];

export type LessonSlug = (typeof lessons)[number]["slug"];

const lessonsBySlug = new Map<string, Lesson>(
  lessons.map((lesson) => [lesson.slug, lesson]),
);

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessonsBySlug.get(slug);
}

export function getLessonsByLevel(level: LessonLevel): readonly Lesson[] {
  return lessons.filter((lesson) => lesson.level === level);
}

export function getAllLessonSlugs(): readonly LessonSlug[] {
  return lessons.map((lesson) => lesson.slug);
}

export function getLessonSlugsByLevel(
  level: LessonLevel,
): readonly LessonSlug[] {
  return getLessonsByLevel(level).map((lesson) => lesson.slug as LessonSlug);
}
