import {
  Activity,
  FileCode,
  FolderTree,
  KeyRound,
  Network,
  Terminal,
  type LucideIcon,
} from "lucide-react";

export const GUIDE_DIFFICULTIES = ["Beginner", "Intermediate"] as const;

export type GuideDifficulty = (typeof GUIDE_DIFFICULTIES)[number];

export type FeaturedGuide = {
  title: string;
  description: string;
  category: string;
  difficulty: GuideDifficulty;
  readingTime: string;
  href: `/guides/${string}`;
  icon: LucideIcon;
};

export const featuredGuides: readonly FeaturedGuide[] = [
  {
    title: "Linux File Permissions Explained",
    description:
      "Understand users, groups, chmod, chown, and how Linux controls access to files.",
    category: "Linux Basics",
    difficulty: "Beginner",
    readingTime: "10 min",
    href: "/guides/linux-file-permissions",
    icon: KeyRound,
  },
  {
    title: "30 Linux Commands You Should Know",
    description:
      "Build your command-line foundation with the most useful Linux commands.",
    category: "Terminal",
    difficulty: "Beginner",
    readingTime: "15 min",
    href: "/guides/linux-commands",
    icon: Terminal,
  },
  {
    title: "Understanding the Linux Filesystem",
    description:
      "Learn what /etc, /var, /home, /usr, /tmp and other directories are used for.",
    category: "Filesystem",
    difficulty: "Beginner",
    readingTime: "12 min",
    href: "/guides/linux-filesystem",
    icon: FolderTree,
  },
  {
    title: "SSH: Connect to a Linux Server",
    description:
      "Learn how SSH works and how to securely connect to a remote Linux machine.",
    category: "Networking",
    difficulty: "Beginner",
    readingTime: "15 min",
    href: "/guides/ssh",
    icon: Network,
  },
  {
    title: "Linux Processes Explained",
    description:
      "Understand processes, PIDs, signals, jobs, and how to manage running programs.",
    category: "Processes",
    difficulty: "Intermediate",
    readingTime: "15 min",
    href: "/guides/linux-processes",
    icon: Activity,
  },
  {
    title: "Getting Started with Bash",
    description:
      "Learn the fundamentals of Bash and start automating repetitive tasks.",
    category: "Bash",
    difficulty: "Intermediate",
    readingTime: "20 min",
    href: "/guides/bash-basics",
    icon: FileCode,
  },
];
