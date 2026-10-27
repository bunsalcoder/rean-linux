import type { Lesson } from "@/types/lesson";
import {
  ADMIN_INCIDENTS,
  TOTAL_ADMIN_INCIDENTS,
} from "@/lib/linux-administration-challenge";

const overviewRows = ADMIN_INCIDENTS.map(
  (incident) =>
    [`${incident.number}. ${incident.topic}`, "1 incident"] as const,
);

export const linuxAdministrationChallengeLesson = {
  slug: "challenge",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "40–50 min read",
  title: "Linux Administration Challenge",
  description:
    "Diagnose and resolve simulated Linux administration incidents across services, logs, storage, networking, SSH, firewalls, scheduling, monitoring, and backups.",
  seoTitle:
    "Linux Administration Challenge — Linux Administration | Rean Linux",
  seoDescription:
    "Capstone challenge for Stage 03: investigate simulated incidents with systemd, journald, disks, networking, SSH, firewalls, cron, monitoring, and backups — entirely in the browser.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Linux Administration Challenge" },
  ],
  navigation: {
    previous: {
      label: "Backups and Recovery",
      href: "/learn/administration/backups-and-recovery",
    },
    next: {
      label: "Continue to Linux Security and Hardening",
      href: "/learn/security",
      emphasis: "finish",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "This is the final lesson of **Linux Administration**. You will investigate simulated incidents using the same safe terminals from earlier lessons — not a memorization quiz and not a real server.",
    },
  ],
  sections: [
    {
      id: "welcome-to-the-challenge",
      title: "Welcome to the Challenge",
      blocks: [
        {
          type: "paragraph",
          text: "Across Stage 03 you practiced services, logs, disks, networking, SSH, firewalls, scheduled tasks, monitoring, and backups. This challenge asks you to apply those skills when something looks wrong.",
        },
        {
          type: "heading",
          level: 3,
          text: "Challenge rules",
        },
        {
          type: "list",
          items: [
            "Read each incident report before touching the terminal.",
            "Use supported diagnostic commands to gather evidence.",
            "Apply a supported simulated fix when the objectives require it.",
            "Submit only after acceptance criteria look met — validation checks simulated state, not command text alone.",
            "Hints are optional. Exploring harmless commands is encouraged.",
            "The terminal never executes real Linux commands on your computer.",
            "Scoring and incident state exist only in this page session — refreshing resets everything.",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Completing this challenge does **not** award a certification or claim real-world administrative competence. It reinforces Stage 03 concepts in a simulated lab.",
        },
      ],
    },
    {
      id: "challenge-overview",
      title: "Challenge Overview",
      blocks: [
        {
          type: "paragraph",
          text: `There are **${TOTAL_ADMIN_INCIDENTS} incidents** — one for each Stage 03 topic area. Each incident has its own isolated simulated environment.`,
        },
        {
          type: "table",
          caption: "Incidents and topic areas",
          headers: ["Incident focus", "Count"],
          rows: [
            ...overviewRows,
            ["**Total**", `**${TOTAL_ADMIN_INCIDENTS}**`],
          ],
        },
        {
          type: "exercise",
          id: "linux-administration-challenge-practice",
          adminChallengePanel: "progress",
        },
        {
          type: "note",
          text: "Progress updates as you resolve incidents below. It is not saved after you leave or refresh the page.",
        },
      ],
    },
    ...ADMIN_INCIDENTS.map((incident) => ({
      id: incident.sectionId,
      title: incident.title,
      blocks: [
        {
          type: "paragraph" as const,
          text: `Investigate the report, use the simulated terminal, then submit when the objectives are met.`,
        },
        {
          type: "exercise" as const,
          id: "linux-administration-challenge-practice" as const,
          adminChallengePanel: incident.id,
        },
      ],
    })),
    {
      id: "final-challenge-summary",
      title: "Final Challenge Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Review your session results. There are no certificates, badges, or saved achievements in this step.",
        },
        {
          type: "exercise",
          id: "linux-administration-challenge-practice",
          adminChallengePanel: "summary",
        },
      ],
    },
  ],
} as const satisfies Lesson;
