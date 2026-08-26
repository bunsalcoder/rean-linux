import {
  Activity,
  BookOpen,
  Container,
  FileCode,
  FolderTree,
  Network,
  Server,
  Shield,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react";

export const TOPIC_SLUGS = [
  "fundamentals",
  "terminal",
  "filesystem",
  "permissions",
  "processes",
  "networking",
  "bash",
  "administration",
  "security",
  "devops",
] as const;

export type TopicSlug = (typeof TOPIC_SLUGS)[number];

export type LinuxTopic = {
  id: TopicSlug;
  title: string;
  description: string;
  icon: LucideIcon;
  topics: readonly string[];
  href: `/learn/${TopicSlug}`;
};

export const linuxTopics: readonly LinuxTopic[] = [
  {
    id: "fundamentals",
    title: "Linux Fundamentals",
    description:
      "Learn the core concepts behind Linux and understand how Linux systems work.",
    icon: BookOpen,
    topics: [
      "Linux basics",
      "Distributions",
      "Installation",
      "Desktop vs server",
    ],
    href: "/learn/fundamentals",
  },
  {
    id: "terminal",
    title: "Terminal & Commands",
    description:
      "Master the command line and become comfortable working without a graphical interface.",
    icon: Terminal,
    topics: ["Basic commands", "File operations", "Pipes", "Redirection"],
    href: "/learn/terminal",
  },
  {
    id: "filesystem",
    title: "Filesystem",
    description:
      "Understand how Linux organizes files, directories, devices, and system resources.",
    icon: FolderTree,
    topics: ["/", "/home", "/etc", "/var", "/tmp"],
    href: "/learn/filesystem",
  },
  {
    id: "permissions",
    title: "Users & Permissions",
    description:
      "Learn how Linux controls access to files and system resources.",
    icon: Users,
    topics: ["Users", "Groups", "chmod", "chown", "sudo"],
    href: "/learn/permissions",
  },
  {
    id: "processes",
    title: "Processes",
    description:
      "Understand what is running inside your Linux system and how to control it.",
    icon: Activity,
    topics: ["Processes", "Jobs", "Signals", "systemd", "Services"],
    href: "/learn/processes",
  },
  {
    id: "networking",
    title: "Networking",
    description:
      "Learn how Linux communicates with other machines and networks.",
    icon: Network,
    topics: ["IP", "DNS", "Ports", "TCP/IP", "Network tools"],
    href: "/learn/networking",
  },
  {
    id: "bash",
    title: "Shell & Bash",
    description:
      "Automate repetitive tasks and become productive with shell scripting.",
    icon: FileCode,
    topics: ["Bash", "Variables", "Conditions", "Loops", "Scripts"],
    href: "/learn/bash",
  },
  {
    id: "administration",
    title: "System Administration",
    description: "Learn how to manage and maintain Linux servers.",
    icon: Server,
    topics: ["SSH", "Users", "Services", "Logs", "Storage"],
    href: "/learn/administration",
  },
  {
    id: "security",
    title: "Security",
    description: "Understand the fundamentals of securing Linux systems.",
    icon: Shield,
    topics: ["Permissions", "SSH security", "Firewall", "Updates", "Hardening"],
    href: "/learn/security",
  },
  {
    id: "devops",
    title: "DevOps & Infrastructure",
    description: "Apply Linux knowledge to modern infrastructure and DevOps.",
    icon: Container,
    topics: ["Docker", "Kubernetes", "Nginx", "CI/CD", "Cloud"],
    href: "/learn/devops",
  },
];

export function getTopic(slug: string): LinuxTopic | undefined {
  return linuxTopics.find((topic) => topic.id === slug);
}
