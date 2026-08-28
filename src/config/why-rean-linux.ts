import {
  BookOpen,
  GitBranch,
  Server,
  Terminal,
  type LucideIcon,
} from "lucide-react";

export type WhyReanLinuxFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
};

export const whyReanLinuxFeatures: readonly WhyReanLinuxFeature[] = [
  {
    title: "Learn by doing",
    description:
      "See commands in context, understand what they actually do, and practice with real examples.",
    icon: Terminal,
    label: "hands-on",
  },
  {
    title: "A path that makes sense",
    description:
      "Start with the fundamentals and gradually move into administration, servers, networking, and DevOps.",
    icon: GitBranch,
    label: "structured-path",
  },
  {
    title: "Built for real systems",
    description:
      "Focus on skills you'll use when working with Linux machines, servers, applications, and infrastructure.",
    icon: Server,
    label: "production-ready",
  },
  {
    title: "Complex topics, explained clearly",
    description:
      "Linux can be intimidating at first. Rean Linux breaks difficult concepts into smaller, understandable pieces.",
    icon: BookOpen,
    label: "clear-explanations",
  },
] as const;
