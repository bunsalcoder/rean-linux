import type { LessonStatus } from "@/types/lesson";

export const ADMINISTRATION_LESSON_SLUGS = [
  "system-services",
  "logs-and-journald",
  "storage-and-filesystems",
  "disk-usage-and-mounts",
  "networking-fundamentals",
  "network-troubleshooting",
  "ssh-and-remote-access",
  "firewall-basics",
  "scheduled-tasks",
  "system-monitoring",
  "backups-and-recovery",
  "challenge",
] as const;

export type AdministrationLessonSlug =
  (typeof ADMINISTRATION_LESSON_SLUGS)[number];

export type AdministrationLesson = {
  number: number;
  slug: AdministrationLessonSlug;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  status: LessonStatus;
  topics: readonly string[];
  href?: `/learn/administration/${AdministrationLessonSlug}`;
};

export const administrationPath = {
  slug: "administration",
  number: 3,
  eyebrow: "STAGE 03",
  title: "Linux Administration",
  badge: "ADVANCED",
  description:
    "Learn how to manage Linux services, monitor system activity, configure networking, manage storage, and maintain a Linux system.",
  level: "Advanced",
  lessonCount: 12,
  estimatedTime: "About 5–8 hours",
  status: "available" as const satisfies LessonStatus,
  seoTitle: "Linux Administration — Rean Linux",
  seoDescription:
    "Learn Linux administration: services, logs, storage, networking, SSH, firewalls, monitoring, backups, and system maintenance.",
} as const;

export const administrationLessons: readonly AdministrationLesson[] = [
  {
    number: 1,
    slug: "system-services",
    title: "System Services and systemd",
    description:
      "Learn how Linux services work and how to inspect and manage them.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "available",
    href: "/learn/administration/system-services",
    topics: [
      "systemd",
      "Services",
      "systemctl",
      "Units",
      "Start and stop",
      "Enable and disable",
    ],
  },
  {
    number: 2,
    slug: "logs-and-journald",
    title: "Logs and Journald",
    description:
      "Learn how to inspect system logs and understand common log messages.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "available",
    href: "/learn/administration/logs-and-journald",
    topics: [
      "journald",
      "journalctl",
      "Syslog",
      "Log levels",
      "Filtering logs",
      "Troubleshooting with logs",
    ],
  },
  {
    number: 3,
    slug: "storage-and-filesystems",
    title: "Storage and Filesystems",
    description:
      "Understand disks, partitions, filesystems, and storage concepts.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Disks",
      "Partitions",
      "Filesystems",
      "Block devices",
      "ext4",
      "LVM basics",
    ],
  },
  {
    number: 4,
    slug: "disk-usage-and-mounts",
    title: "Disk Usage and Mounts",
    description:
      "Learn how to inspect disk usage and understand filesystem mounts.",
    duration: "20–25 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["df", "du", "mount", "umount", "fstab", "Mount points"],
  },
  {
    number: 5,
    slug: "networking-fundamentals",
    title: "Networking Fundamentals",
    description:
      "Understand IP addresses, interfaces, gateways, DNS, and ports.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["IP addresses", "Interfaces", "Gateways", "DNS", "Ports", "ip"],
  },
  {
    number: 6,
    slug: "network-troubleshooting",
    title: "Network Troubleshooting",
    description: "Learn how to diagnose common network connectivity problems.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["ping", "traceroute", "DNS checks", "Connectivity", "ss", "curl"],
  },
  {
    number: 7,
    slug: "ssh-and-remote-access",
    title: "SSH and Remote Access",
    description:
      "Understand SSH, remote connections, and basic key-based authentication.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "SSH",
      "Remote login",
      "SSH keys",
      "scp",
      "sshd",
      "Key-based auth",
    ],
  },
  {
    number: 8,
    slug: "firewall-basics",
    title: "Firewall Basics",
    description: "Learn firewall concepts, rules, and basic traffic filtering.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Firewalls",
      "Inbound rules",
      "Outbound rules",
      "Ports",
      "ufw",
      "Traffic filtering",
    ],
  },
  {
    number: 9,
    slug: "scheduled-tasks",
    title: "Scheduled Tasks",
    description: "Understand cron jobs and systemd timers.",
    duration: "20–25 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["cron", "crontab", "systemd timers", "Scheduling", "Automation"],
  },
  {
    number: 10,
    slug: "system-monitoring",
    title: "System Monitoring and Resource Usage",
    description:
      "Learn how to monitor CPU, memory, processes, and system resources.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["CPU", "Memory", "top", "htop", "free", "Resource usage"],
  },
  {
    number: 11,
    slug: "backups-and-recovery",
    title: "Backups and Recovery",
    description:
      "Understand backup strategies, recovery planning, and data protection.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Backup strategies",
      "Recovery planning",
      "Snapshots",
      "Data protection",
      "Restore basics",
    ],
  },
  {
    number: 12,
    slug: "challenge",
    title: "Linux Administration Challenge",
    description: "A future hands-on challenge covering the entire stage.",
    duration: "40–50 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Services",
      "Logs",
      "Storage",
      "Networking",
      "SSH",
      "Firewalls",
      "Monitoring",
      "Backups",
    ],
  },
];
