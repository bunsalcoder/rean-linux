import type { Lesson } from "@/types/lesson";
import {
  CHALLENGE_CATEGORIES,
  TOTAL_CHALLENGE_TASKS,
} from "@/lib/linux-essentials-challenge";

const overviewRows = CHALLENGE_CATEGORIES.map(
  (category) =>
    [
      `${category.number}. ${category.title}`,
      String(category.taskIds.length),
    ] as const,
);

export const linuxEssentialsChallengeLesson = {
  slug: "linux-essentials-challenge",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "35–45 min read",
  title: "Linux Essentials Challenge",
  description:
    "Put your Linux skills to the test with practical challenges covering commands, permissions, processes, packages, and shell scripting.",
  seoTitle: "Linux Essentials Challenge — Linux Essentials | Rean Linux",
  seoDescription:
    "Apply Linux Essentials skills in a safe simulated terminal: users, permissions, ownership, processes, packages, environment variables, pipes, searching, text tools, shell basics, and Bash scripting.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Linux Essentials Challenge" },
  ],
  navigation: {
    previous: {
      label: "Introduction to Bash Scripting",
      href: "/learn/essentials/bash-scripting",
    },
    next: {
      label: "Finish Linux Essentials",
      href: "/learn",
      emphasis: "finish",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "This is the final lesson of **Linux Essentials**. You will apply what you practiced across the stage in short, guided tasks — not a memorization exam.",
    },
  ],
  sections: [
    {
      id: "welcome-to-the-challenge",
      title: "Welcome to the Challenge",
      blocks: [
        {
          type: "paragraph",
          text: "Throughout Linux Essentials you learned how users, permissions, processes, packages, environment variables, pipes, search tools, text processing, the shell, and Bash scripts fit together. This challenge asks you to use those skills in practical sequences.",
        },
        {
          type: "heading",
          level: 3,
          text: "Challenge rules",
        },
        {
          type: "list",
          items: [
            "Complete each task using the simulated terminal in that category.",
            "Read each task carefully before entering commands.",
            "Use previous lessons as references when you need a reminder.",
            "The terminal is simulated and never executes real Linux commands.",
            "Challenge progress exists only in the current page session — refreshing resets it.",
          ],
        },
        {
          type: "callout",
          title: "Reinforce understanding",
          text: "The challenge is designed to reinforce understanding, not to test memorization. Hints stay hidden until you ask for them, and you can retry any task.",
        },
      ],
    },
    {
      id: "challenge-overview",
      title: "Challenge Overview",
      blocks: [
        {
          type: "paragraph",
          text: `There are **${TOTAL_CHALLENGE_TASKS} tasks** across **${CHALLENGE_CATEGORIES.length} categories**. Each category has its own simulated terminal matched to that lesson’s command set.`,
        },
        {
          type: "table",
          caption: "Challenge categories and task counts",
          headers: ["Category", "Tasks"],
          rows: [
            ...overviewRows,
            ["**Total**", `**${TOTAL_CHALLENGE_TASKS}**`],
          ],
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "progress",
        },
        {
          type: "note",
          text: "Progress updates as you complete tasks below. It is not saved after you leave or refresh the page.",
        },
      ],
    },
    {
      id: "challenge-1-users-and-groups",
      title: "Challenge 1 — Users and Groups",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm who you are in the simulated session and which groups you belong to.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "users-and-groups",
        },
      ],
    },
    {
      id: "challenge-2-file-permissions",
      title: "Challenge 2 — File Permissions",
      blocks: [
        {
          type: "paragraph",
          text: "Inspect permission strings and apply numeric modes with simulated `chmod`.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "file-permissions",
        },
      ],
    },
    {
      id: "challenge-3-ownership-and-sudo",
      title: "Challenge 3 — Ownership and sudo",
      blocks: [
        {
          type: "paragraph",
          text: "Read ownership details, then change owner and group with simulated `sudo`. No real password is ever requested.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "ownership-and-sudo",
        },
      ],
    },
    {
      id: "challenge-4-processes",
      title: "Challenge 4 — Processes",
      blocks: [
        {
          type: "paragraph",
          text: "List simulated processes, stop one by PID, and confirm it is gone. Nothing on your host is signaled.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "processes",
        },
      ],
    },
    {
      id: "challenge-5-package-management",
      title: "Challenge 5 — Package Management",
      blocks: [
        {
          type: "paragraph",
          text: "Search the simulated package index, install `curl`, and verify its status — with no real apt or network access.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "package-management",
        },
      ],
    },
    {
      id: "challenge-6-environment-variables",
      title: "Challenge 6 — Environment Variables",
      blocks: [
        {
          type: "paragraph",
          text: "Inspect `HOME`, export a new variable, and print it from the simulated environment.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "environment-variables",
        },
      ],
    },
    {
      id: "challenge-7-pipes-and-redirection",
      title: "Challenge 7 — Pipes and Redirection",
      blocks: [
        {
          type: "paragraph",
          text: "Practice `>` overwrite and `>>` append, then read the simulated file with `cat`.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "pipes-and-redirection",
        },
      ],
    },
    {
      id: "challenge-8-searching-and-finding-files",
      title: "Challenge 8 — Searching and Finding Files",
      blocks: [
        {
          type: "paragraph",
          text: "Use `find` and `grep` against the simulated filesystem and teaching `/etc/passwd` data.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "searching-and-finding-files",
        },
      ],
    },
    {
      id: "challenge-9-text-processing",
      title: "Challenge 9 — Text Processing",
      blocks: [
        {
          type: "paragraph",
          text: "Count lines, sort names, and remove adjacent duplicates with `wc`, `sort`, and `uniq`.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "text-processing",
        },
      ],
    },
    {
      id: "challenge-10-shell-basics",
      title: "Challenge 10 — Shell Basics",
      blocks: [
        {
          type: "paragraph",
          text: "Set a shell variable, print it, and chain `mkdir` with `cd` using `&&`.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "shell-basics",
        },
      ],
    },
    {
      id: "challenge-11-bash-scripting",
      title: "Challenge 11 — Bash Scripting",
      blocks: [
        {
          type: "paragraph",
          text: "Create a greeting script, run it with simulated `bash`, then write a short loop or conditional script. Use `nano`, a heredoc paste from a hint, or commands you remember from the previous lesson. Real Bash never runs.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "bash-scripting",
        },
      ],
    },
    {
      id: "final-challenge-summary",
      title: "Final Challenge Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Review your progress across every category. Completion is session-only — there are no certificates, badges, or saved achievements in this step.",
        },
        {
          type: "exercise",
          id: "linux-essentials-challenge-practice",
          challengeCategory: "summary",
        },
      ],
    },
  ],
} as const satisfies Lesson;
