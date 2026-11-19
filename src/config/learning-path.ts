import {
  Activity,
  BookOpen,
  Boxes,
  FolderTree,
  Server,
  Shield,
  type LucideIcon,
} from "lucide-react";

import type { LessonStatus } from "@/types/lesson";

export const LEARNING_LEVEL_SLUGS = [
  "beginner",
  "essentials",
  "administration",
  "security",
  "performance",
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
    slug: "administration",
    indicator: "03",
    title: "Linux Administration",
    label: "Up next",
    description:
      "Learn how to manage Linux services, monitor system activity, configure networking, manage storage, and maintain a Linux system.",
    topics: ["Services", "Logs", "Networking", "Storage", "SSH"],
    icon: Server,
    status: "available",
    difficulty: "Advanced",
    lessonCount: 12,
  },
  {
    slug: "security",
    indicator: "04",
    title: "Linux Security and Hardening",
    label: "Up next",
    description:
      "Develop practical knowledge of Linux security, permissions, authentication, privilege management, system hardening, and security auditing.",
    topics: [
      "Access control",
      "Hardening",
      "SSH & firewalls",
      "Auditing",
      "Incident response",
    ],
    icon: Shield,
    status: "available",
    difficulty: "Advanced",
    lessonCount: 12,
  },
  {
    slug: "performance",
    indicator: "05",
    title: "Linux Performance and Troubleshooting",
    label: "Up next",
    description:
      "Learn how to monitor Linux system resources, diagnose performance bottlenecks, troubleshoot common system problems, and improve overall system performance through practical exercises and safe simulations.",
    topics: [
      "CPU & memory",
      "Disk I/O",
      "Load & bottlenecks",
      "Network performance",
      "Optimization",
    ],
    icon: Activity,
    status: "available",
    difficulty: "Advanced",
    lessonCount: 12,
  },
  {
    slug: "devops",
    indicator: "06",
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
