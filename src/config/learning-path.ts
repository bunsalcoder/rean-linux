import {
  BookOpen,
  Boxes,
  FolderTree,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import type { LessonStatus } from "@/types/lesson";

export const LEARNING_LEVEL_SLUGS = [
  "beginner",
  "essentials",
  "power-user",
  "administrator",
  "devops",
] as const;

export type LearningLevelSlug = (typeof LEARNING_LEVEL_SLUGS)[number];

export type LearningLevel = {
  slug: LearningLevelSlug;
  indicator: string;
  title: string;
  label: string;
  description: string;
  topics: readonly string[];
  icon: LucideIcon;
  status: LessonStatus;
  difficulty: string;
  lessonCount?: number;
  recommended?: boolean;
};

export const learningLevels: readonly LearningLevel[] = [
  {
    slug: "beginner",
    indicator: "01",
    title: "Beginner Foundations",
    label: "Completed",
    description:
      "Build your foundation and understand what Linux is, how it works, and how to use the terminal.",
    topics: [
      "Linux fundamentals",
      "Distributions",
      "Installation",
      "Terminal basics",
      "Filesystem",
    ],
    icon: BookOpen,
    status: "completed",
    difficulty: "Beginner",
    lessonCount: 6,
    recommended: true,
  },
  {
    slug: "essentials",
    indicator: "02",
    title: "Linux Essentials",
    label: "Next up",
    description:
      "Build practical Linux skills by learning users, permissions, processes, packages, environment variables, and essential shell techniques.",
    topics: [
      "Users & permissions",
      "Processes",
      "Packages",
      "Shell techniques",
      "Bash scripting",
    ],
    icon: FolderTree,
    status: "available",
    difficulty: "Intermediate",
    lessonCount: 12,
  },
  {
    slug: "power-user",
    indicator: "03",
    title: "Linux Power User",
    label: "Coming soon",
    description:
      "Go deeper on productivity, automation habits, and advanced command-line workflows.",
    topics: ["Advanced Bash", "Jobs", "Automation habits", "Tooling"],
    icon: Terminal,
    status: "coming-soon",
    difficulty: "Advanced",
  },
  {
    slug: "administrator",
    indicator: "04",
    title: "Linux Administration",
    label: "Coming soon",
    description:
      "Learn the skills required to operate and maintain Linux machines and servers.",
    topics: ["Networking", "SSH", "Services", "Logs", "Storage"],
    icon: Server,
    status: "coming-soon",
    difficulty: "Advanced",
  },
  {
    slug: "devops",
    indicator: "05",
    title: "Linux & DevOps",
    label: "Coming soon",
    description:
      "Apply your Linux knowledge to containers, infrastructure, automation, and DevOps.",
    topics: ["Docker", "Kubernetes", "Nginx", "CI/CD", "Cloud"],
    icon: Boxes,
    status: "coming-soon",
    difficulty: "Advanced",
  },
];

export function getLearningLevelHref(
  slug: LearningLevelSlug,
): `/learn/${LearningLevelSlug}` {
  return `/learn/${slug}`;
}

export function getLearningLevel(slug: string): LearningLevel | undefined {
  return learningLevels.find((level) => level.slug === slug);
}

export function getLessonStatusLabel(status: LessonStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "completed":
      return "Completed";
    case "coming-soon":
      return "Coming soon";
  }
}
