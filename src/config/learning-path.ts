import {
  BookOpen,
  Boxes,
  FolderTree,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";

export const LEARNING_LEVEL_SLUGS = [
  "beginner",
  "user",
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
  recommended?: boolean;
};

export const learningLevels: readonly LearningLevel[] = [
  {
    slug: "beginner",
    indicator: "01",
    title: "Linux Beginner",
    label: "Start here",
    description:
      "Build your foundation and understand what Linux is, how it works, and how to use the terminal.",
    topics: [
      "Linux fundamentals",
      "Distributions",
      "Installation",
      "Terminal basics",
    ],
    icon: BookOpen,
    recommended: true,
  },
  {
    slug: "user",
    indicator: "02",
    title: "Linux User",
    label: "Build your confidence",
    description:
      "Learn to work with files, permissions, users, packages, and everyday Linux tasks.",
    topics: [
      "Files & directories",
      "Permissions",
      "Users & groups",
      "Package management",
    ],
    icon: FolderTree,
  },
  {
    slug: "power-user",
    indicator: "03",
    title: "Linux Power User",
    label: "Master the command line",
    description:
      "Become productive with Bash, processes, environment variables, and shell scripting.",
    topics: ["Bash", "Processes", "Jobs", "Shell scripting"],
    icon: Terminal,
  },
  {
    slug: "administrator",
    indicator: "04",
    title: "Linux Administrator",
    label: "Manage real systems",
    description:
      "Learn the skills required to operate and maintain Linux machines and servers.",
    topics: ["Networking", "SSH", "Services", "Logs", "Storage"],
    icon: Server,
  },
  {
    slug: "devops",
    indicator: "05",
    title: "Linux & DevOps",
    label: "Go beyond Linux",
    description:
      "Apply your Linux knowledge to containers, infrastructure, automation, and DevOps.",
    topics: ["Docker", "Kubernetes", "Nginx", "CI/CD", "Cloud"],
    icon: Boxes,
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
