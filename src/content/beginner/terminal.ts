import type { LessonConfig, LessonSection } from "@/types/lesson";

export const TERMINAL_SECTIONS = {
  whatIs: {
    id: "what-is-a-terminal",
    title: "What Is a Terminal?",
  },
  vsShell: {
    id: "terminal-vs-shell",
    title: "Terminal vs Shell",
  },
  whyUse: {
    id: "why-use-the-terminal",
    title: "Why Use the Terminal?",
  },
  firstCommands: {
    id: "your-first-commands",
    title: "Your First Commands",
  },
  structure: {
    id: "understanding-command-structure",
    title: "Understanding Command Structure",
  },
  tryIt: {
    id: "try-it-yourself",
    title: "Try It Yourself",
  },
  tips: {
    id: "terminal-tips",
    title: "Terminal Tips",
  },
  summary: {
    id: "summary",
    title: "Summary",
  },
} as const satisfies Record<string, LessonSection>;

export const terminalSections: readonly LessonSection[] = Object.values(
  TERMINAL_SECTIONS,
);

export const terminalLesson: LessonConfig = {
  title: "The Linux Terminal",
  description:
    "Learn what the terminal is, why Linux users rely on it, and how to start thinking in commands.",
  levelNumber: "04",
  level: "Beginner",
  readingTime: "10 min read",
  sections: terminalSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "The Linux Terminal" },
  ],
  navigation: {
    previous: {
      label: "Installing Linux",
      href: "/learn/beginner/installing-linux",
    },
    next: {
      label: "Your First Linux Commands",
      href: "/learn/beginner/first-commands",
    },
  },
};
