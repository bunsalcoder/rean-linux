import type { Lesson } from "@/types/lesson";

export const scheduledTasksLesson = {
  slug: "scheduled-tasks",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "20–25 min read",
  title: "Scheduled Tasks",
  description:
    "Learn cron jobs, crontab management, schedule expressions, job environments, and one-time at scheduling — entirely in a simulated terminal.",
  seoTitle: "Scheduled Tasks — Linux Administration | Rean Linux",
  seoDescription:
    "Practice Linux scheduled tasks with simulated crontab, cron service status, expression parsing, execution history, and at queues — safely in the browser.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Scheduled Tasks" },
  ],
  navigation: {
    previous: {
      label: "Firewall Basics",
      href: "/learn/administration/firewall-basics",
    },
    next: {
      label: "System Monitoring and Resource Usage",
      href: "/learn/administration/system-monitoring",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Firewall Basics](/learn/administration/firewall-basics), you can control which traffic reaches a host. This lesson covers **scheduled tasks** — how administrators run backups, reports, and cleanup work automatically — still entirely in a simulated terminal that never touches your real crontab.",
    },
  ],
  sections: [
    {
      id: "what-are-scheduled-tasks",
      title: "What Scheduled Tasks Are",
      blocks: [
        {
          type: "paragraph",
          text: "Administrators use **scheduled tasks** to run commands or scripts at defined times without sitting at a terminal. Typical uses include backups, log rotation helpers, report generation, certificate checks, and cleanup jobs.",
        },
        {
          type: "list",
          items: [
            "Reduce manual, easy-to-forget maintenance work",
            "Run jobs overnight or during low-traffic windows",
            "Repeat the same command on a predictable schedule",
            "Separate recurring automation from one-time deferred work",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Everything here is **simulated**. The app never creates real cron jobs, never starts host timers, never executes shell scripts, and never modifies your system crontab or services.",
        },
      ],
    },
    {
      id: "recurring-vs-one-time",
      title: "Recurring Tasks Versus One-Time Tasks",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Recurring (cron)",
              description:
                "Jobs that repeat on a schedule — every night, every Monday, every 15 minutes, and so on. Managed mainly with `crontab` and the `cron` / `crond` service.",
            },
            {
              term: "One-time (at)",
              description:
                "Jobs that should run **once** at a future time — for example a reboot notice later today. Inspected with `atq` / `at -l` where available.",
            },
          ],
        },
        {
          type: "note",
          text: "systemd timers are another modern scheduling option. This lesson focuses on classic cron and a brief introduction to `at`.",
        },
      ],
    },
    {
      id: "cron-and-service",
      title: "What Cron and the Cron Service Do",
      blocks: [
        {
          type: "paragraph",
          text: "**cron** (often packaged as `cron` or `crond`) is the background service that reads schedule tables and launches matching commands. If the service is stopped, crontab entries can still exist — but they will not run.",
        },
        {
          type: "code",
          code: "systemctl status cron\nsystemctl start cron\nsystemctl stop cron",
          title: "Inspect and control the simulated cron service",
        },
        {
          type: "terminal",
          preset: "scheduled-tasks",
          suggestions: [
            { command: "systemctl status cron", label: "status cron" },
            { command: "systemctl stop cron", label: "stop cron" },
            { command: "systemctl start cron", label: "start cron" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect the cron service",
        },
        {
          type: "callout",
          title: "Timezone",
          text: "Cron schedules use the system's configured time and timezone. This lab reports schedules in **UTC**. On a real host, confirm `timedatectl` (or equivalent) before trusting wall-clock expectations.",
        },
      ],
    },
    {
      id: "user-vs-system",
      title: "User Crontabs and System-Wide Schedules",
      blocks: [
        {
          type: "paragraph",
          text: "Each user can have a personal crontab. System-wide schedules may also live in directories such as `/etc/cron.d` or distribution-specific hourly/daily folders. This lesson focuses on the **current user's crontab** — the view you manage with `crontab -l`, `crontab -e`, and `crontab -r`.",
        },
        {
          type: "table",
          caption: "Where schedules live (conceptual)",
          headers: ["Scope", "Typical tool / location", "Who runs it"],
          rows: [
            ["User crontab", "`crontab -e` for that user", "That user"],
            ["System crontabs", "`/etc/cron.d`, `/etc/crontab`", "Often root"],
            ["One-time queue", "`at` / `atq`", "Submitting user"],
          ],
        },
      ],
    },
    {
      id: "five-fields",
      title: "The Five Fields in a Cron Expression",
      blocks: [
        {
          type: "paragraph",
          text: "A standard cron schedule has **five fields**, then the command:",
        },
        {
          type: "table",
          caption: "Standard cron fields",
          headers: ["Field", "Meaning", "Typical range"],
          rows: [
            ["1", "Minute", "0–59"],
            ["2", "Hour", "0–23"],
            ["3", "Day of month", "1–31"],
            ["4", "Month", "1–12"],
            ["5", "Day of week", "0–7 (Sun = 0 or 7)"],
          ],
        },
        {
          type: "code",
          code: "# m h dom mon dow  command\n0 2 * * * /usr/local/bin/backup.sh",
          title: "Example crontab line",
        },
        {
          type: "note",
          text: "When both day-of-month and day-of-week are restricted, matching can vary between cron implementations (some treat the combination as OR, others differ). Prefer simple schedules when you are learning.",
        },
      ],
    },
    {
      id: "cron-syntax",
      title: "Common Cron Syntax",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "`*`",
              description: "Any value — every minute, every hour, and so on.",
            },
            {
              term: "Number",
              description: "An exact value, such as `30` for minute 30.",
            },
            {
              term: "Range",
              description: "`1-5` means values from 1 through 5 inclusive.",
            },
            {
              term: "List",
              description: "`1,3,5` means each listed value.",
            },
            {
              term: "Step",
              description:
                "`*/15` means every 15 units; `0-30/10` steps through a range.",
            },
          ],
        },
        {
          type: "table",
          caption: "Common schedules to recognize",
          headers: ["Expression", "Meaning"],
          rows: [
            ["`* * * * *`", "Every minute"],
            ["`0 0 * * *`", "Every day at midnight"],
            ["`30 2 * * *`", "Every day at 02:30"],
            ["`0 9 * * 1`", "Every Monday at 09:00"],
            ["`*/15 * * * *`", "Every 15 minutes"],
          ],
        },
        {
          type: "exercise",
          id: "scheduled-tasks-cron-explainer",
        },
      ],
    },
    {
      id: "managing-crontab",
      title: "Managing Scheduled Tasks with crontab",
      blocks: [
        {
          type: "table",
          caption: "Core crontab commands in this lab",
          headers: ["Command", "Purpose"],
          rows: [
            ["`crontab -l`", "List the current user's crontab"],
            ["`crontab -e`", "Open the simulated editor help"],
            ["`crontab -r`", "Remove the current user's crontab"],
            ['`crontab-add "…"`', "Educational helper to add an entry safely"],
            ["`crontab-remove N`", "Educational helper to remove entry N"],
          ],
        },
        {
          type: "code",
          code: 'crontab -l\ncrontab -e\ncrontab-add "0 0 * * * /usr/local/bin/daily-task.sh"\ncrontab -l',
          title: "List, learn the editor flow, then add an entry (simulated)",
        },
        {
          type: "terminal",
          preset: "scheduled-tasks",
          suggestions: [
            { command: "crontab -l", label: "crontab -l" },
            { command: "crontab -e", label: "crontab -e" },
            {
              command: 'crontab-add "0 0 * * * /usr/local/bin/daily-task.sh"',
              label: "add daily",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Manage the user crontab",
        },
        {
          type: "callout",
          title: "Common mistake",
          text: "`crontab -r` removes the **entire** user crontab. There is no undo in this lab beyond resetting the scenario — on a real system, treat `-r` carefully.",
        },
      ],
    },
    {
      id: "environments",
      title: "Interactive Shells Versus Scheduled Job Environments",
      blocks: [
        {
          type: "paragraph",
          text: "A script that works in your interactive shell can fail under cron. Cron typically starts jobs with a **minimal environment**: a short `PATH`, no interactive aliases, and often without sourcing your `~/.bashrc`.",
        },
        {
          type: "list",
          items: [
            "Prefer absolute paths to commands and scripts",
            "Set required variables inside the script or crontab line",
            "Redirect stdout/stderr so failures leave evidence",
            "Check exit status in logs when a job misbehaves",
          ],
        },
        {
          type: "code",
          code: "# Fragile under cron (relative command / interactive PATH)\ndeploy-helper.sh\n\n# More robust pattern\n/home/bunsal/bin/deploy-helper.sh >> /var/log/deploy-helper.log 2>&1",
          title: "Environment and redirection patterns",
        },
        {
          type: "terminal",
          preset: "scheduled-tasks",
          suggestions: [
            { command: "crontab -l", label: "crontab -l" },
            { command: "journalctl -u cron -n 10", label: "recent logs" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare crontab and logs",
        },
      ],
    },
    {
      id: "logging-and-failures",
      title: "Logging, Exit Status, and Common Failures",
      blocks: [
        {
          type: "paragraph",
          text: "When jobs do not behave, gather evidence before rewriting schedules:",
        },
        {
          type: "table",
          caption: "Failure patterns",
          headers: ["Symptom", "Likely cause", "Next check"],
          rows: [
            [
              "Entries exist; nothing runs",
              "cron service stopped",
              "`systemctl status cron`",
            ],
            [
              "Wrong wall-clock time",
              "Timezone / expression mismatch",
              "Validate fields + timezone",
            ],
            [
              "Exit 127 / not found",
              "PATH / relative command",
              "Use absolute paths",
            ],
            [
              "Repeated non-zero exits",
              "Script error / permissions",
              "`journalctl -u cron`",
            ],
            [
              "Works interactively only",
              "Missing env vars",
              "Compare shell vs cron env",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "scheduled-tasks",
          suggestions: [
            { command: "systemctl status cron", label: "status cron" },
            { command: "journalctl -u cron -n 10", label: "journal -n 10" },
            { command: "crontab -l", label: "crontab -l" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Diagnose with logs",
        },
      ],
    },
    {
      id: "one-time-at",
      title: "One-Time Scheduling with at",
      blocks: [
        {
          type: "paragraph",
          text: "Where available, **`at`** schedules a command to run **once**. Use `atq` or `at -l` to list the queue. Creating new at jobs interactively is out of scope here — this lab only inspects a simulated queue.",
        },
        {
          type: "code",
          code: "atq\nat -l",
          title: "List one-time jobs (simulated)",
        },
        {
          type: "terminal",
          preset: "scheduled-tasks",
          suggestions: [
            { command: "atq", label: "atq" },
            { command: "at -l", label: "at -l" },
            { command: "crontab -l", label: "crontab -l" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare cron vs at",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting Checklist",
      blocks: [
        {
          type: "paragraph",
          text: "Use this reusable checklist whenever a scheduled task misbehaves:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Confirm the scheduled entry exists (`crontab -l`)",
            "Validate the cron expression",
            "Check whether the cron service is active",
            "Inspect execution logs and exit status",
            "Verify paths, permissions, and environment assumptions",
            "Check the system timezone and expected execution time",
            "Re-test using a safe simulated example",
          ],
        },
        {
          type: "callout",
          title: "Output redirection",
          text: "Cron often mails or discards command output depending on configuration. Redirecting to a log file (`>> /path/to/job.log 2>&1`) makes failures easier to inspect.",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through eight scenarios: list the crontab, interpret an expression, build a daily job, build an every-15-minutes job, diagnose a stopped cron service, spot a repeatedly failing job, explain an environment trap, and inspect the one-time at queue.",
        },
        {
          type: "exercise",
          id: "scheduled-tasks-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "scheduled-tasks-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about scheduled tasks safely:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why administrators schedule recurring and one-time work",
            "Describe what cron / crond does",
            "Read and construct basic five-field cron expressions",
            "Manage a user crontab with list / edit / remove workflows",
            "Check the cron service and inspect execution history",
            "Account for minimal job environments and common failures",
            "Inspect a one-time at queue where available",
          ],
        },
        {
          type: "table",
          caption: "Command reference for scheduled tasks",
          headers: ["Command", "Purpose"],
          rows: [
            ["`crontab -l`", "List the user crontab"],
            ["`crontab -e`", "Simulated editor help"],
            ["`crontab -r`", "Remove the user crontab"],
            ['`crontab-add "…"`', "Add an entry (lab helper)"],
            ["`crontab-remove N`", "Remove entry N (lab helper)"],
            ["`systemctl status cron`", "Show cron service status"],
            ["`systemctl start cron`", "Start cron"],
            ["`systemctl stop cron`", "Stop cron"],
            ["`journalctl -u cron`", "Show cron logs"],
            ["`journalctl -u cron -n 10`", "Last 10 cron log lines"],
            ["`atq` / `at -l`", "List one-time at jobs"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [System Monitoring and Resource Usage](/learn/administration/system-monitoring) — watching CPU, memory, load, and processes safely in a simulated lab.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
