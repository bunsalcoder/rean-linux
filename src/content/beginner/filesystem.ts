import type { LessonConfig, LessonSection } from "@/types/lesson";

export const FILESYSTEM_SECTIONS = {
  root: {
    id: "everything-starts-at-root",
    title: "Everything Starts at /",
  },
  hierarchy: {
    id: "the-linux-filesystem-hierarchy",
    title: "The Linux Filesystem Hierarchy",
  },
  home: {
    id: "your-home-directory",
    title: "Your Home Directory",
  },
  paths: {
    id: "absolute-and-relative-paths",
    title: "Absolute and Relative Paths",
  },
  dots: {
    id: "dot-and-dot-dot",
    title: ". and ..",
  },
  tilde: {
    id: "the-tilde-shortcut",
    title: "The ~ Shortcut",
  },
  navigating: {
    id: "navigating-the-filesystem",
    title: "Navigating the Filesystem",
  },
  explore: {
    id: "explore-the-filesystem",
    title: "Explore the Filesystem",
  },
  practice: {
    id: "a-small-practice-session",
    title: "A Small Practice Session",
  },
  mistakes: {
    id: "common-path-mistakes",
    title: "Common Path Mistakes",
  },
  summary: {
    id: "summary",
    title: "Summary",
  },
} as const satisfies Record<string, LessonSection>;

export const filesystemSections: readonly LessonSection[] =
  Object.values(FILESYSTEM_SECTIONS);

export const filesystemLesson: LessonConfig = {
  title: "Understanding the Linux Filesystem",
  description:
    "Learn how Linux organizes files, directories, and paths — and how to navigate them with confidence.",
  levelNumber: "06",
  level: "Beginner",
  readingTime: "15 min read",
  sections: filesystemSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Understanding the Linux Filesystem" },
  ],
  navigation: {
    previous: {
      label: "Your First Linux Commands",
      href: "/learn/beginner/first-commands",
    },
    next: {
      label: "Finish Beginner Foundations",
      href: "/learn/beginner",
      emphasis: "finish",
    },
  },
};
