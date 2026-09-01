import type { LessonConfig, LessonSection } from "@/types/lesson";

export const WHAT_IS_LINUX_SECTIONS = {
  simpleTerms: {
    id: "linux-in-simple-terms",
    title: "Linux in simple terms",
  },
  kernel: {
    id: "what-is-the-linux-kernel",
    title: "What is the Linux kernel?",
  },
  vsDistribution: {
    id: "linux-vs-a-linux-distribution",
    title: "Linux vs a Linux distribution",
  },
  popularity: {
    id: "why-is-linux-so-popular",
    title: "Why is Linux so popular?",
  },
  whereUsed: {
    id: "where-is-linux-used",
    title: "Where is Linux used?",
  },
  distributions: {
    id: "linux-distributions",
    title: "Linux distributions",
  },
  nextSteps: {
    id: "what-should-you-learn-next",
    title: "What should you learn next?",
  },
} as const satisfies Record<string, LessonSection>;

export const whatIsLinuxSections: readonly LessonSection[] = Object.values(
  WHAT_IS_LINUX_SECTIONS,
);

export const whatIsLinuxLesson: LessonConfig = {
  title: "What is Linux?",
  description:
    "Linux is an open-source operating system kernel that powers everything from personal computers and smartphones to web servers and cloud infrastructure.",
  category: "Linux Fundamentals",
  level: "Beginner",
  readingTime: "8 min",
  sections: whatIsLinuxSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "What is Linux?" },
  ],
  navigation: {
    previous: { label: "Beginner Path", href: "/learn/beginner" },
    next: {
      label: "Linux Distributions",
      href: "/learn/beginner/linux-distributions",
    },
  },
};
