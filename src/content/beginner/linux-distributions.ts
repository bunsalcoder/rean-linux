import type { LessonConfig, LessonSection } from "@/types/lesson";

export const LINUX_DISTRIBUTIONS_SECTIONS = {
  whatIs: {
    id: "what-is-a-linux-distribution",
    title: "What is a Linux distribution?",
  },
  whySoMany: {
    id: "why-are-there-so-many-distributions",
    title: "Why are there so many distributions?",
  },
  popular: {
    id: "popular-linux-distributions",
    title: "Popular Linux distributions",
  },
  packageManagers: {
    id: "package-managers",
    title: "Package managers",
  },
  whichChoose: {
    id: "which-distribution-should-a-beginner-choose",
    title: "Which distribution should a beginner choose?",
  },
  vsDesktop: {
    id: "distribution-vs-desktop-environment",
    title: "Distribution vs Desktop Environment",
  },
  nextSteps: {
    id: "what-should-you-learn-next",
    title: "What should you learn next?",
  },
} as const satisfies Record<string, LessonSection>;

export const linuxDistributionsSections: readonly LessonSection[] =
  Object.values(LINUX_DISTRIBUTIONS_SECTIONS);

export const linuxDistributionsLesson: LessonConfig = {
  title: "Linux Distributions",
  description:
    "Linux comes in many distributions, each packaged with its own tools, defaults, and goals. Understanding the differences helps you choose the right environment for learning.",
  levelNumber: "02",
  level: "Beginner",
  readingTime: "10 min read",
  sections: linuxDistributionsSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Linux Distributions" },
  ],
  navigation: {
    previous: {
      label: "What is Linux?",
      href: "/learn/beginner/what-is-linux",
    },
    next: {
      label: "Installing Linux",
      href: "/learn/beginner/installing-linux",
    },
  },
};
