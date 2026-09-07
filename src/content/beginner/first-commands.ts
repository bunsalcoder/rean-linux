import type { LessonConfig, LessonSection } from "@/types/lesson";

export const FIRST_COMMANDS_SECTIONS = {
  meetCli: {
    id: "meet-the-command-line",
    title: "Meet the Command Line",
  },
  whereAmI: {
    id: "where-am-i",
    title: "Where Am I?",
  },
  listFiles: {
    id: "list-files",
    title: "List Files",
  },
  moveAround: {
    id: "move-around",
    title: "Move Around",
  },
  createDirectory: {
    id: "create-a-directory",
    title: "Create a Directory",
  },
  createFile: {
    id: "create-a-file",
    title: "Create a File",
  },
  readFile: {
    id: "read-a-file",
    title: "Read a File",
  },
  copyMove: {
    id: "copy-and-move-files",
    title: "Copy and Move Files",
  },
  removeFiles: {
    id: "remove-files",
    title: "Remove Files",
  },
  practice: {
    id: "a-small-practice-session",
    title: "A Small Practice Session",
  },
  summary: {
    id: "summary",
    title: "Summary",
  },
} as const satisfies Record<string, LessonSection>;

export const firstCommandsSections: readonly LessonSection[] = Object.values(
  FIRST_COMMANDS_SECTIONS,
);

export const firstCommandsLesson: LessonConfig = {
  title: "Your First Linux Commands",
  description:
    "Start working with files and directories using the commands you'll use every day.",
  levelNumber: "05",
  level: "Beginner",
  readingTime: "15 min read",
  sections: firstCommandsSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Your First Linux Commands" },
  ],
  navigation: {
    previous: {
      label: "The Linux Terminal",
      href: "/learn/beginner/terminal",
    },
    next: {
      label: "Understanding the Linux Filesystem",
      href: "/learn/beginner/filesystem",
    },
  },
};
