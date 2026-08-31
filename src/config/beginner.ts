export const BEGINNER_LESSON_SLUGS = [
  "what-is-linux",
  "linux-distributions",
  "installing-linux",
  "terminal",
  "first-commands",
  "filesystem",
] as const;

export type BeginnerLessonSlug = (typeof BEGINNER_LESSON_SLUGS)[number];

export type BeginnerLesson = {
  number: number;
  title: string;
  description: string;
  duration: string;
  href: `/learn/beginner/${BeginnerLessonSlug}`;
};

export const beginnerPath = {
  eyebrow: "LEVEL 01",
  title: "Linux Beginner",
  badge: "BEGINNER",
  description:
    "Start your Linux journey by understanding the fundamentals, setting up your environment, and becoming comfortable with the terminal.",
  level: "Beginner",
  lessonCount: 6,
  estimatedTime: "About 1–2 hours",
} as const;

export const beginnerLessons: readonly BeginnerLesson[] = [
  {
    number: 1,
    title: "What is Linux?",
    description:
      "Understand what Linux is, where it came from, and why it powers everything from personal computers to servers.",
    duration: "8 min",
    href: "/learn/beginner/what-is-linux",
  },
  {
    number: 2,
    title: "Linux Distributions",
    description:
      "Learn what a Linux distribution is and understand the differences between popular distributions.",
    duration: "10 min",
    href: "/learn/beginner/linux-distributions",
  },
  {
    number: 3,
    title: "Installing Linux",
    description:
      "Understand the different ways to install Linux and what you should prepare before starting.",
    duration: "12 min",
    href: "/learn/beginner/installing-linux",
  },
  {
    number: 4,
    title: "The Linux Terminal",
    description:
      "Meet the command line and learn why the terminal is one of the most important tools in Linux.",
    duration: "10 min",
    href: "/learn/beginner/terminal",
  },
  {
    number: 5,
    title: "Your First Linux Commands",
    description:
      "Learn your first essential commands and start navigating a Linux system.",
    duration: "15 min",
    href: "/learn/beginner/first-commands",
  },
  {
    number: 6,
    title: "Understanding the Linux Filesystem",
    description:
      "Learn how Linux organizes files and directories and why paths like /home and /etc matter.",
    duration: "12 min",
    href: "/learn/beginner/filesystem",
  },
];
