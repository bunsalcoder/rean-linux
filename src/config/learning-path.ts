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
  description: string;
  topics: readonly string[];
};

export const learningLevels: readonly LearningLevel[] = [
  {
    slug: "beginner",
    indicator: "01",
    title: "Linux Beginner",
    description: "Understand what Linux is and learn the fundamentals.",
    topics: [
      "What is Linux?",
      "Linux distributions",
      "Installing Linux",
      "Terminal basics",
    ],
  },
  {
    slug: "user",
    indicator: "02",
    title: "Linux User",
    description: "Become comfortable working with Linux every day.",
    topics: [
      "Files and directories",
      "Permissions",
      "Users and groups",
      "Package management",
    ],
  },
  {
    slug: "power-user",
    indicator: "03",
    title: "Linux Power User",
    description:
      "Go deeper into the system and become productive from the command line.",
    topics: ["Bash", "Processes", "Environment variables", "Shell scripting"],
  },
  {
    slug: "administrator",
    indicator: "04",
    title: "Linux Administrator",
    description: "Learn how to operate and maintain real Linux systems.",
    topics: ["Networking", "SSH", "Services", "System administration"],
  },
  {
    slug: "devops",
    indicator: "05",
    title: "Linux / DevOps Expert",
    description:
      "Apply Linux knowledge to servers, infrastructure, and modern DevOps.",
    topics: ["Docker", "Kubernetes", "Nginx", "CI/CD", "Cloud infrastructure"],
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
