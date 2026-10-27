import type { LessonStatus } from "@/types/lesson";

export const SECURITY_LESSON_SLUGS = [
  "fundamentals",
  "access-control",
  "permissions-and-acls",
  "privilege-management",
  "ssh-hardening",
  "firewall-hardening",
  "security-updates",
  "security-auditing",
  "authentication-and-pam",
  "mandatory-access-control",
  "incident-response",
  "challenge",
] as const;

export type SecurityLessonSlug = (typeof SECURITY_LESSON_SLUGS)[number];

export type SecurityLesson = {
  number: number;
  slug: SecurityLessonSlug;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  status: LessonStatus;
  topics: readonly string[];
  href?: `/learn/security/${SecurityLessonSlug}`;
};

export const securityPath = {
  slug: "security",
  number: 4,
  eyebrow: "STAGE 04",
  title: "Linux Security and Hardening",
  badge: "ADVANCED",
  description:
    "Develop practical knowledge of Linux security, permissions, authentication, privilege management, system hardening, and security auditing.",
  level: "Advanced",
  lessonCount: 12,
  estimatedTime: "About 5–8 hours",
  status: "available" as const satisfies LessonStatus,
  seoTitle: "Linux Security and Hardening — Rean Linux",
  seoDescription:
    "Learn Linux security and hardening: access control, privileges, SSH and firewall hardening, updates, auditing, PAM, MAC, and incident response.",
} as const;

export const securityLessons: readonly SecurityLesson[] = [
  {
    number: 1,
    slug: "fundamentals",
    title: "Linux Security Fundamentals",
    description:
      "Understand confidentiality, integrity, availability, least privilege, and defense in depth.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "available",
    href: "/learn/security/fundamentals",
    topics: [
      "CIA triad",
      "Least privilege",
      "Defense in depth",
      "Threat awareness",
      "Security mindset",
    ],
  },
  {
    number: 2,
    slug: "access-control",
    title: "Users, Groups, and Access Control Review",
    description:
      "Review users, groups, and access decisions with a security-focused lens.",
    duration: "20–25 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Users",
      "Groups",
      "Access decisions",
      "Identity review",
      "Privilege boundaries",
    ],
  },
  {
    number: 3,
    slug: "permissions-and-acls",
    title: "Advanced File Permissions and ACLs",
    description:
      "Go beyond basic modes to special bits and access-control lists.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Special bits",
      "ACLs",
      "getfacl",
      "setfacl",
      "Permission hardening",
    ],
  },
  {
    number: 4,
    slug: "privilege-management",
    title: "sudo and Privilege Management",
    description:
      "Understand sudo policies and how privileged operations should be controlled.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "sudo",
      "sudoers",
      "Privileged operations",
      "Policy design",
      "Least privilege",
    ],
  },
  {
    number: 5,
    slug: "ssh-hardening",
    title: "SSH Security Hardening",
    description:
      "Recognize SSH risks and apply practical remote-access hardening choices.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "SSH hardening",
      "Key authentication",
      "sshd_config",
      "Exposure risk",
      "Remote access policy",
    ],
  },
  {
    number: 6,
    slug: "firewall-hardening",
    title: "Firewall Hardening and Network Exposure",
    description:
      "Reduce network exposure with deliberate firewall and service-facing decisions.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Network exposure",
      "Firewall policy",
      "Inbound control",
      "Service surface",
      "Hardening checklist",
    ],
  },
  {
    number: 7,
    slug: "security-updates",
    title: "Security Updates and Vulnerability Management",
    description:
      "Understand why updates matter and how vulnerability remediation fits operations.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Security updates",
      "Vulnerabilities",
      "Patch management",
      "Remediation",
      "Risk reduction",
    ],
  },
  {
    number: 8,
    slug: "security-auditing",
    title: "Linux Security Auditing",
    description:
      "Inspect security-related logs and spot signs of suspicious activity.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Security logs",
      "Audit trails",
      "Suspicious activity",
      "Evidence gathering",
      "Review habits",
    ],
  },
  {
    number: 9,
    slug: "authentication-and-pam",
    title: "Authentication and PAM Fundamentals",
    description:
      "Learn authentication concepts and how PAM shapes login and access flow.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: ["Authentication", "PAM", "Login flow", "Modules", "Access policy"],
  },
  {
    number: 10,
    slug: "mandatory-access-control",
    title: "Mandatory Access Control: AppArmor and SELinux",
    description:
      "Distinguish discretionary access control from mandatory access control.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "DAC vs MAC",
      "AppArmor",
      "SELinux",
      "Profiles and policies",
      "Containment",
    ],
  },
  {
    number: 11,
    slug: "incident-response",
    title: "Linux Security Incident Response",
    description:
      "Follow a safe, evidence-based workflow when something looks wrong.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Incident response",
      "Evidence",
      "Containment",
      "Safe workflow",
      "Post-incident review",
    ],
  },
  {
    number: 12,
    slug: "challenge",
    title: "Linux Security Challenge",
    description:
      "Apply Stage 04 security and hardening concepts in a final simulated challenge.",
    duration: "40–50 min",
    difficulty: "Advanced",
    status: "coming-soon",
    topics: [
      "Access control",
      "Privileges",
      "SSH hardening",
      "Firewalls",
      "Updates",
      "Auditing",
      "PAM",
      "MAC",
      "Incident response",
    ],
  },
];
