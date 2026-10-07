import type { Lesson } from "@/types/lesson";

export const logsAndJournaldLesson = {
  slug: "logs-and-journald",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Logs and Journald",
  description:
    "Learn how Linux systems generate logs, how systemd-journald collects them, and how to query them with journalctl.",
  seoTitle: "Logs and Journald — Linux Administration | Rean Linux",
  seoDescription:
    "Learn Linux logging with systemd-journald and journalctl: view recent logs, filter by service and priority, inspect boot logs, and troubleshoot services — in a safe simulated terminal.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Logs and Journald" },
  ],
  navigation: {
    previous: {
      label: "System Services and systemd",
      href: "/learn/administration/system-services",
    },
    next: {
      label: "Storage and Filesystems",
      href: "/learn/administration/storage-and-filesystems",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [System Services and systemd](/learn/administration/system-services) you learned how to inspect and manage services. This lesson adds the next administration habit: reading **logs** when something goes wrong — or when you want to understand what the system has been doing.",
    },
  ],
  sections: [
    {
      id: "why-linux-has-logs",
      title: "Why Linux Has Logs",
      blocks: [
        {
          type: "paragraph",
          text: "Linux systems generate **logs** to record events as they happen. A log entry is a timestamped message about something the system or an application did — or failed to do.",
        },
        {
          type: "paragraph",
          text: "Common examples of logged events:",
        },
        {
          type: "list",
          items: [
            "Services starting or stopping",
            "Login attempts (successful or failed)",
            "Network events",
            "Application errors",
            "System warnings",
            "Hardware or kernel events",
          ],
        },
        {
          type: "callout",
          title: "Why administrators rely on logs",
          text: "When a service fails, a login is rejected, or a machine behaves oddly, logs often provide the **evidence** of what happened and when. Status commands tell you the current state; logs help explain the story leading up to it.",
        },
      ],
    },
    {
      id: "what-is-journald",
      title: "What Is journald?",
      blocks: [
        {
          type: "paragraph",
          text: "**systemd-journald** is a system service that collects and manages journal data on many Linux systems that use systemd.",
        },
        {
          type: "list",
          items: [
            "It provides centralized system logging for systemd-based machines",
            "Services and the kernel can send messages into the journal",
            "Each journal entry typically includes a **timestamp**, **service/unit**, **priority**, and **message**",
          ],
        },
        {
          type: "note",
          text: "You do not need to understand how journal files are stored on disk for this lesson. Focus on reading and filtering entries with `journalctl`.",
        },
      ],
    },
    {
      id: "what-is-journalctl",
      title: "What Is journalctl?",
      blocks: [
        {
          type: "paragraph",
          text: "The main tool for querying the journal is:",
        },
        {
          type: "code",
          code: "journalctl",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`journalctl` reads journal entries and displays them in a readable form. A simulated example looks like this:",
        },
        {
          type: "code",
          code: "Oct 07 08:01:12 rean-linux systemd[1]: Started nginx.service.\nOct 07 08:01:15 rean-linux nginx[812]: Server started.\nOct 07 08:02:03 rean-linux sshd[921]: Accepted connection.",
          language: "text",
          title: "simulated output",
        },
        {
          type: "callout",
          title: "Simulated logs only",
          text: "These are **simulated** journal entries inside Rean Linux. The learning terminal never runs real `journalctl`, never reads `/var/log`, and never accesses your computer’s systemd journal.",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl", label: "journalctl" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Open the simulated journal",
        },
      ],
    },
    {
      id: "viewing-recent-logs",
      title: "Viewing Recent Logs",
      blocks: [
        {
          type: "paragraph",
          text: "Running `journalctl` with no options shows journal entries. When you only need the latest lines, limit the output with `-n`:",
        },
        {
          type: "code",
          code: "journalctl\njournalctl -n 10\njournalctl -n 20",
          language: "bash",
          title: "commands",
        },
        {
          type: "list",
          items: [
            "`journalctl` — display journal entries",
            "`-n` — limit how many **recent** entries are shown",
            "`journalctl -n 10` — last 10 entries",
            "`journalctl -n 20` — last 20 entries",
          ],
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl -n 10", label: "last 10" },
            { command: "journalctl -n 20", label: "last 20" },
            { command: "journalctl", label: "all (current set)" },
          ],
          suggestionsLabel: "Limit recent entries",
        },
      ],
    },
    {
      id: "following-logs",
      title: "Following Logs",
      blocks: [
        {
          type: "paragraph",
          text: "On a real system you can follow new log lines as they appear:",
        },
        {
          type: "code",
          code: "journalctl -f",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "The `-f` option means **follow** — keep watching for new entries. That is useful while you reproduce a problem or restart a service.",
        },
        {
          type: "code",
          code: "Following journal...\nWaiting for new entries...",
          language: "text",
          title: "simulated follow mode",
        },
        {
          type: "note",
          text: "Rean Linux is frontend-only. Follow mode here is a **safe simulation** — it does not open a live stream, start timers, or mimic a real OS logging process.",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl -f", label: "follow (simulated)" },
          ],
          suggestionsLabel: "Try simulated follow",
        },
      ],
    },
    {
      id: "filtering-by-service",
      title: "Filtering by Service",
      blocks: [
        {
          type: "paragraph",
          text: "To see logs for one service (systemd unit), use `-u`:",
        },
        {
          type: "code",
          code: "journalctl -u nginx\njournalctl -u ssh\njournalctl -u docker",
          language: "bash",
          title: "commands",
        },
        {
          type: "paragraph",
          text: "`-u` filters entries associated with a particular unit/service — the same simulated services from the previous lesson (`nginx`, `ssh`, `docker`, and others).",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl -u nginx", label: "nginx logs" },
            { command: "journalctl -u ssh", label: "ssh logs" },
            { command: "journalctl -u docker", label: "docker logs" },
          ],
          suggestionsLabel: "Filter by service",
        },
      ],
    },
    {
      id: "filtering-by-time",
      title: "Filtering by Time",
      blocks: [
        {
          type: "paragraph",
          text: "You can narrow the journal to a time window with `--since`:",
        },
        {
          type: "code",
          code: 'journalctl --since "today"\njournalctl --since "1 hour ago"',
          language: "bash",
          title: "commands",
        },
        {
          type: "paragraph",
          text: "On real systems, `--since` accepts many natural-language and timestamp forms. This simulator supports a small educational set:",
        },
        {
          type: "list",
          items: ['`"today"`', '`"1 hour ago"`', '`"30 minutes ago"`'],
        },
        {
          type: "note",
          text: "Filters use **deterministic simulated timestamps**, not your computer’s real clock or journal.",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            {
              command: 'journalctl --since "today"',
              label: 'since "today"',
            },
            {
              command: 'journalctl --since "1 hour ago"',
              label: 'since "1 hour ago"',
            },
            {
              command: 'journalctl --since "30 minutes ago"',
              label: 'since "30 minutes ago"',
            },
          ],
          suggestionsLabel: "Filter by time",
        },
      ],
    },
    {
      id: "filtering-by-priority",
      title: "Filtering by Priority",
      blocks: [
        {
          type: "paragraph",
          text: "Journal entries have a **priority** (severity). Common levels, from most to least severe:",
        },
        {
          type: "code",
          code: "emerg\nalert\ncrit\nerr\nwarning\nnotice\ninfo\ndebug",
          language: "text",
          title: "priorities",
        },
        {
          type: "paragraph",
          text: "To focus on problems, filter with `-p`:",
        },
        {
          type: "code",
          code: "journalctl -p err\njournalctl -p warning",
          language: "bash",
          title: "commands",
        },
        {
          type: "list",
          items: [
            "`-p err` — show error-level messages and more severe priorities",
            "`-p warning` — include warnings as well as errors and above",
          ],
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl -p err", label: "errors" },
            { command: "journalctl -p warning", label: "warnings+" },
            {
              command: "journalctl -u nginx -p err",
              label: "nginx errors",
            },
          ],
          suggestionsLabel: "Filter by priority",
        },
      ],
    },
    {
      id: "logs-for-a-service-problem",
      title: "Logs for a Service Problem",
      blocks: [
        {
          type: "paragraph",
          text: "Here is a practical troubleshooting pattern. Scenario: **Nginx is not working correctly.**",
        },
        {
          type: "paragraph",
          text: "Administrators often combine service status with logs:",
        },
        {
          type: "code",
          code: "systemctl status nginx\njournalctl -u nginx",
          language: "bash",
          title: "commands",
        },
        {
          type: "paragraph",
          text: "In this simulator, nginx has failed to start. The status output and journal both point at a configuration problem — for example:",
        },
        {
          type: "code",
          code: "nginx.service: Failed to start\nnginx: configuration file contains an invalid directive",
          language: "text",
          title: "simulated error hints",
        },
        {
          type: "callout",
          title: "Status + logs",
          text: "`systemctl status` shows the current state; `journalctl -u` shows the messages that explain why. You do not need to edit a real configuration file in this lesson — just practice finding the evidence.",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            {
              command: "systemctl status nginx",
              label: "status nginx",
            },
            { command: "journalctl -u nginx", label: "nginx logs" },
            {
              command: "journalctl -u nginx -p err",
              label: "nginx errors only",
            },
          ],
          suggestionsLabel: "Troubleshoot nginx",
        },
      ],
    },
    {
      id: "boot-logs",
      title: "Boot Logs",
      blocks: [
        {
          type: "paragraph",
          text: "To focus on the current boot’s journal entries:",
        },
        {
          type: "code",
          code: "journalctl -b",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`-b` means **this boot**. You may also see references to a previous boot:",
        },
        {
          type: "code",
          code: "journalctl -b -1",
          language: "bash",
          title: "previous boot (conceptual)",
        },
        {
          type: "note",
          text: "The simulator uses predefined boot data (`0` = current, `-1` = previous). It does not track real reboots of your machine.",
        },
        {
          type: "terminal",
          preset: "logs-and-journald",
          suggestions: [
            { command: "journalctl -b", label: "current boot" },
            { command: "journalctl -b -1", label: "previous boot" },
          ],
          suggestionsLabel: "Inspect boot journals",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through seven short exercises in one simulated terminal. You will view the journal, limit recent lines, filter by service and priority, inspect the current boot, and troubleshoot nginx.",
        },
        {
          type: "exercise",
          id: "logs-and-journald-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "logs-and-journald-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain and practice basic journal inspection:",
        },
        {
          type: "list",
          items: [
            "Linux systems generate logs to record events",
            "`systemd-journald` collects journal information",
            "`journalctl` queries the journal",
            "`-u` filters by service",
            "`-n` limits recent entries",
            "`-p` filters by priority",
            "`-b` focuses on a boot",
            "Logs are an important troubleshooting tool",
            "Combining `systemctl status` with `journalctl` helps diagnose service problems",
          ],
        },
        {
          type: "table",
          caption: "Command reference for logs and journald",
          headers: ["Command", "Purpose"],
          rows: [
            ["`journalctl`", "Show journal entries"],
            ["`journalctl -n 10`", "Last 10 entries"],
            ["`journalctl -f`", "Follow new entries (simulated here)"],
            ["`journalctl -u nginx`", "Filter by service"],
            ['`journalctl --since "today"`', "Filter by time"],
            ["`journalctl -p err`", "Filter by priority"],
            ["`journalctl -b`", "Current boot"],
            ["`journalctl -b -1`", "Previous boot (simulated)"],
            ["`systemctl status nginx`", "Inspect service state"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
