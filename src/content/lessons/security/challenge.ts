import type { Lesson } from "@/types/lesson";
import {
  SECURITY_CHALLENGE_CATEGORIES,
  SECURITY_CHALLENGE_HOST,
  TOTAL_SECURITY_CHALLENGE_TASKS,
} from "@/lib/linux-security-challenge";

const overviewRows = SECURITY_CHALLENGE_CATEGORIES.map(
  (category) =>
    [
      `${category.number}. ${category.title}`,
      String(category.taskIds.length),
    ] as const,
);

export const securityChallengeLesson = {
  slug: "challenge",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "40–50 min read",
  title: "Linux Security Challenge",
  description:
    "Investigate a fictional Linux server, identify security weaknesses, prioritize risks, choose remediations, and verify the final posture.",
  seoTitle:
    "Linux Security Challenge — Linux Security and Hardening | Rean Linux",
  seoDescription:
    "Capstone challenge for Stage 04: assess a fictional Linux host across access control, SSH, firewalls, updates, auditing, PAM, MAC, and incident response — entirely in the browser.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Linux Security Challenge" },
  ],
  navigation: {
    previous: {
      label: "Linux Security Incident Response",
      href: "/learn/security/incident-response",
    },
    next: {
      label: "Finish Linux Security and Hardening",
      href: "/learn",
      emphasis: "finish",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: `This is the final lesson of **Linux Security and Hardening**. You will assess the fictional host **${SECURITY_CHALLENGE_HOST}** — identify findings, prioritize risk, choose remediations, and verify posture. **${SECURITY_CHALLENGE_HOST}** synthesizes scenarios from earlier Stage 04 labs; hostnames, demo advisory IDs, and exact UIDs may differ from per-lesson hosts such as rean-audit or rean-ir. This is not a memorization quiz and not a real server.`,
    },
  ],
  sections: [
    {
      id: "welcome-to-the-challenge",
      title: "Welcome to the Challenge",
      blocks: [
        {
          type: "paragraph",
          text: "Across Stage 04 you practiced security fundamentals, access control, permissions and ACLs, sudo, SSH hardening, firewalls, updates, auditing, PAM, mandatory access control, and incident response. This challenge asks you to apply those skills as one coherent assessment.",
        },
        {
          type: "heading",
          level: 3,
          text: "Challenge rules",
        },
        {
          type: "list",
          items: [
            "Inspect the shared fictional environment evidence before answering.",
            "Tasks mix multiple-choice, short answers, severity reasoning, and remediation decisions.",
            "Validation checks your decision against teaching evidence and simulated state — not arbitrary spelling tricks.",
            "Hints are optional and slightly reduce score for that task.",
            "Incorrect submissions earn no points for that attempt; you can retry.",
            "Nothing executes on your real system. All data is in-memory fiction.",
            "Scoring and environment state exist only in this page session — refreshing resets everything.",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Completing this challenge does **not** award a certification or claim real-world security competence. It reinforces Stage 04 concepts in a simulated lab.",
        },
      ],
    },
    {
      id: "challenge-overview",
      title: "Challenge Overview",
      blocks: [
        {
          type: "paragraph",
          text: `There are **${TOTAL_SECURITY_CHALLENGE_TASKS} tasks** across **${SECURITY_CHALLENGE_CATEGORIES.length} categories**, all set on the same fictional host **${SECURITY_CHALLENGE_HOST}**.`,
        },
        {
          type: "table",
          caption: "Challenge categories and task counts",
          headers: ["Category", "Tasks"],
          rows: [
            ...overviewRows,
            ["**Total**", `**${TOTAL_SECURITY_CHALLENGE_TASKS}**`],
          ],
        },
        {
          type: "exercise",
          id: "linux-security-challenge-practice",
          securityChallengePanel: "progress",
        },
        {
          type: "note",
          text: "Progress and the shared host posture update as you work below. Nothing is saved after you leave or refresh the page.",
        },
      ],
    },
    ...SECURITY_CHALLENGE_CATEGORIES.map((category) => ({
      id: category.sectionId,
      title: `Challenge ${category.number} — ${category.title}`,
      blocks: [
        {
          type: "paragraph" as const,
          text: category.description,
        },
        {
          type: "exercise" as const,
          id: "linux-security-challenge-practice" as const,
          securityChallengePanel: category.id,
        },
      ],
    })),
    {
      id: "final-challenge-summary",
      title: "Final Challenge Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Review your session score, category performance, and tasks that need another look. There are no certificates, badges, or saved achievements in this step.",
        },
        {
          type: "exercise",
          id: "linux-security-challenge-practice",
          securityChallengePanel: "summary",
        },
      ],
    },
  ],
} as const satisfies Lesson;
