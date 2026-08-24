import type { ContentCategorySlug } from "@/types/content";

export type ContentCategory = {
  slug: ContentCategorySlug;
  title: string;
  description: string;
};

export const contentCategories: readonly ContentCategory[] = [
  {
    slug: "linux-basics",
    title: "Linux Basics",
    description: "Core concepts for getting started with Linux.",
  },
  {
    slug: "terminal",
    title: "Terminal",
    description: "Working in the shell, commands, and everyday CLI workflows.",
  },
  {
    slug: "filesystem",
    title: "Filesystem",
    description: "Paths, permissions, users, and how Linux organizes files.",
  },
  {
    slug: "networking",
    title: "Networking",
    description: "Hosts, ports, SSH, and how Linux systems communicate.",
  },
  {
    slug: "administration",
    title: "Administration",
    description: "Services, packages, and day-to-day system administration.",
  },
  {
    slug: "devops",
    title: "DevOps",
    description: "Servers, containers, and tooling used to ship software.",
  },
  {
    slug: "security",
    title: "Security",
    description: "Hardening, permissions, and safer Linux operations.",
  },
];
