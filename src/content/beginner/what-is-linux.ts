import type { LessonConfig, LessonSection } from "@/types/lesson";

export const WHAT_IS_LINUX_SECTIONS = {
  whatIs: {
    id: "what-is-linux",
    title: "What is Linux?",
  },
  kernel: {
    id: "the-linux-kernel",
    title: "The Linux Kernel",
  },
  gnuLinux: {
    id: "gnu-linux",
    title: "GNU/Linux",
  },
  distributions: {
    id: "linux-distributions",
    title: "Linux Distributions",
  },
  whyLearn: {
    id: "why-learn-linux",
    title: "Why Learn Linux?",
  },
  everywhere: {
    id: "linux-is-everywhere",
    title: "Linux Is Everywhere",
  },
  summary: {
    id: "summary",
    title: "Summary",
  },
} as const satisfies Record<string, LessonSection>;

export const whatIsLinuxSections: readonly LessonSection[] = Object.values(
  WHAT_IS_LINUX_SECTIONS,
);

export const whatIsLinuxLesson: LessonConfig = {
  title: "What is Linux?",
  description:
    "A beginner-friendly introduction to the operating system that powers servers, desktops, cloud infrastructure, and much more.",
  levelNumber: "01",
  level: "Beginner",
  readingTime: "8 min read",
  sections: whatIsLinuxSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "What is Linux?" },
  ],
  navigation: {
    next: {
      label: "Linux Distributions",
      href: "/learn/beginner/linux-distributions",
    },
  },
};
