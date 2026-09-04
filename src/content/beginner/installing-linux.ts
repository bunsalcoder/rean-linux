import type { LessonConfig, LessonSection } from "@/types/lesson";

export const INSTALLING_LINUX_SECTIONS = {
  beforeInstall: {
    id: "before-you-install-linux",
    title: "Before You Install Linux",
  },
  chooseHow: {
    id: "choose-how-you-want-to-install-linux",
    title: "Choose How You Want to Install Linux",
  },
  virtualMachines: {
    id: "virtual-machines",
    title: "Virtual Machines",
  },
  dualBoot: {
    id: "dual-boot",
    title: "Dual Boot",
  },
  physicalMachine: {
    id: "installing-on-a-physical-machine",
    title: "Installing on a Physical Machine",
  },
  server: {
    id: "linux-on-a-server",
    title: "Linux on a Server",
  },
  whatYouNeed: {
    id: "what-you-need-before-installation",
    title: "What You Need Before Installation",
  },
  duringInstall: {
    id: "what-happens-during-installation",
    title: "What Happens During Installation?",
  },
  afterInstall: {
    id: "after-installation",
    title: "After Installation",
  },
  summary: {
    id: "summary",
    title: "Summary",
  },
} as const satisfies Record<string, LessonSection>;

export const installingLinuxSections: readonly LessonSection[] = Object.values(
  INSTALLING_LINUX_SECTIONS,
);

export const installingLinuxLesson: LessonConfig = {
  title: "Installing Linux",
  description:
    "Understand the different ways to install Linux and prepare your system before taking the first step.",
  levelNumber: "03",
  level: "Beginner",
  readingTime: "12 min read",
  sections: installingLinuxSections,
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Installing Linux" },
  ],
  navigation: {
    previous: {
      label: "Linux Distributions",
      href: "/learn/beginner/linux-distributions",
    },
    next: {
      label: "The Linux Terminal",
      href: "/learn/beginner/terminal",
    },
  },
};
