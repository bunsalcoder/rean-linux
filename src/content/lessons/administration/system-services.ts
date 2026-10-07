import type { Lesson } from "@/types/lesson";

export const systemServicesLesson = {
  slug: "system-services",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "System Services and systemd",
  description:
    "Learn how Linux services work and how to inspect, start, stop, enable, and disable them with systemctl.",
  seoTitle: "System Services and systemd — Linux Administration | Rean Linux",
  seoDescription:
    "Learn Linux services and systemd: systemctl status, start, stop, restart, enable, disable, and the difference between active and enabled — in a safe simulated terminal.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "System Services and systemd" },
  ],
  navigation: {
    previous: {
      label: "Linux Essentials Challenge",
      href: "/learn/essentials/linux-essentials-challenge",
    },
    next: {
      label: "Logs and Journald",
      href: "/learn/administration/logs-and-journald",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Linux Essentials](/learn/essentials) you learned users, permissions, processes, and packages. Administration adds another everyday skill: managing **services** — the background programs that keep a Linux system useful.",
    },
  ],
  sections: [
    {
      id: "what-is-a-linux-service",
      title: "What Is a Linux Service?",
      blocks: [
        {
          type: "paragraph",
          text: "A **service** is a background program that provides functionality to the system or to other applications. You usually do not interact with it like a normal interactive command — it keeps running and waiting to do work.",
        },
        {
          type: "paragraph",
          text: "Common examples:",
        },
        {
          type: "list",
          items: [
            "**Web server** — serves websites (for example nginx)",
            "**SSH server** — lets you log in remotely",
            "**Database server** — stores application data",
            "**Network service** — manages networking pieces of the system",
            "**Logging service** — collects and stores log messages",
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Interactive command",
              blocks: [
                {
                  type: "paragraph",
                  text: "You type it, it runs, it finishes (or you stop it). Example: `ls`, `cat notes.txt`.",
                },
              ],
            },
            {
              title: "Long-running service",
              blocks: [
                {
                  type: "paragraph",
                  text: "Starts once (often at boot), stays in the background, and keeps providing a capability. Example: `ssh`, `nginx`.",
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Why this matters for administration",
          text: "When something “is not working,” administrators often check whether the related service is running, enabled at boot, or failing — before diving into deeper troubleshooting.",
        },
      ],
    },
    {
      id: "what-is-systemd",
      title: "What Is systemd?",
      blocks: [
        {
          type: "paragraph",
          text: "**systemd** is a system and service manager used by many modern Linux distributions.",
        },
        {
          type: "list",
          items: [
            "It commonly starts early during the Linux boot process",
            "It manages **services** and other **units**",
            "It can start, stop, restart, and inspect services",
            "Administrators usually talk to it with the `systemctl` command",
          ],
        },
        {
          type: "paragraph",
          text: "A **unit** is a systemd object that describes something to manage. The most common unit type for this lesson is a **service unit** (`.service`). Other unit types exist, but you do not need them yet.",
        },
        {
          type: "note",
          text: "This lesson stays practical: how to inspect and control services safely. It does not cover writing unit files, targets, or advanced dependency graphs.",
        },
      ],
    },
    {
      id: "service-units",
      title: "Service Units",
      blocks: [
        {
          type: "paragraph",
          text: "Services are commonly represented by `.service` units. For example:",
        },
        {
          type: "code",
          code: "ssh.service",
          language: "bash",
          title: "unit name",
        },
        {
          type: "paragraph",
          text: "In day-to-day work you usually type the short service name:",
        },
        {
          type: "code",
          code: "ssh",
          language: "bash",
          title: "short name",
        },
        {
          type: "paragraph",
          text: "`systemctl` understands both. These are equivalent for learning purposes:",
        },
        {
          type: "code",
          code: "systemctl status ssh\nsystemctl status ssh.service",
          language: "bash",
          title: "equivalent forms",
        },
      ],
    },
    {
      id: "checking-service-status",
      title: "Checking Service Status",
      blocks: [
        {
          type: "paragraph",
          text: "The first habit of service management is inspection:",
        },
        {
          type: "code",
          code: "systemctl status ssh",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "A simulated status result looks like this:",
        },
        {
          type: "code",
          code: "● ssh.service - OpenSSH server daemon\n     Loaded: loaded (enabled; vendor preset: enabled)\n     Active: active (running)\n   Main PID: 812\n\nOct 07 08:00:01 rean-linux systemd[1]: Started OpenSSH server daemon.",
          language: "text",
          title: "simulated output",
        },
        {
          type: "paragraph",
          text: "Useful parts to read first:",
        },
        {
          type: "list",
          items: [
            "**Loaded** — whether systemd knows about the unit, and often whether it is enabled",
            "**Active** — whether it is running *right now*",
            "**Main PID** — the main process ID while it is active",
            "**Recent log messages** — short hints about start/stop or errors",
          ],
        },
        {
          type: "terminal",
          preset: "system-services",
          suggestions: [
            { command: "systemctl status ssh", label: "status ssh" },
            { command: "systemctl status nginx", label: "status nginx" },
            { command: "systemctl status cron", label: "status cron" },
          ],
          suggestionsLabel: "Inspect simulated services",
        },
        {
          type: "note",
          text: "In Rean Linux, `ssh` starts active and enabled. `nginx` starts inactive and disabled — useful for practicing start and enable separately.",
        },
      ],
    },
    {
      id: "starting-and-stopping-services",
      title: "Starting and Stopping Services",
      blocks: [
        {
          type: "paragraph",
          text: "To change the **current** state of a service:",
        },
        {
          type: "code",
          code: "sudo systemctl start nginx\nsudo systemctl stop nginx",
          language: "bash",
          title: "commands",
        },
        {
          type: "list",
          items: [
            "`start` — starts the service **now**",
            "`stop` — stops the service **now**",
          ],
        },
        {
          type: "paragraph",
          text: "These commands typically need elevated privileges, so this lesson uses `sudo` for start and stop — just like many real systems.",
        },
        {
          type: "callout",
          title: "Simulated only",
          text: "Commands in this terminal affect the **simulated** environment only. They never start or stop services on your computer.",
        },
        {
          type: "terminal",
          preset: "system-services",
          suggestions: [
            { command: "systemctl status nginx", label: "status nginx" },
            {
              command: "sudo systemctl start nginx",
              label: "start nginx",
            },
            { command: "systemctl status nginx", label: "status again" },
            { command: "sudo systemctl stop nginx", label: "stop nginx" },
          ],
          suggestionsLabel: "Start and stop nginx",
        },
      ],
    },
    {
      id: "restarting-services",
      title: "Restarting Services",
      blocks: [
        {
          type: "paragraph",
          text: "Restarting stops a service and starts it again in one step:",
        },
        {
          type: "code",
          code: "sudo systemctl restart nginx",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Restarting is useful after configuration changes, when a service seems stuck, or when you want a clean start without thinking about stop and start separately.",
        },
        {
          type: "code",
          code: "Stopping nginx...\nStarting nginx...\nnginx restarted successfully.",
          language: "text",
          title: "simulated restart output",
        },
        {
          type: "terminal",
          preset: "system-services",
          suggestions: [
            {
              command: "sudo systemctl restart nginx",
              label: "restart nginx",
            },
            { command: "systemctl status nginx", label: "verify status" },
            { command: "systemctl is-active nginx", label: "is-active" },
          ],
          suggestionsLabel: "Restart and verify",
        },
      ],
    },
    {
      id: "enable-and-disable",
      title: "Enable and Disable",
      blocks: [
        {
          type: "paragraph",
          text: "`enable` and `disable` control **boot behavior**, not whether the service is running right this second:",
        },
        {
          type: "code",
          code: "sudo systemctl enable nginx\nsudo systemctl disable nginx",
          language: "bash",
          title: "commands",
        },
        {
          type: "list",
          items: [
            "`enable` — configure the service to start **automatically during boot**",
            "`disable` — prevent automatic startup during boot",
          ],
        },
        {
          type: "paragraph",
          text: "This is the most important distinction in the lesson:",
        },
        {
          type: "table",
          caption: "Current state vs boot behavior",
          headers: ["Command", "Purpose"],
          rows: [
            ["`start`", "Start now"],
            ["`stop`", "Stop now"],
            ["`restart`", "Restart now"],
            ["`enable`", "Start automatically at boot"],
            ["`disable`", "Do not start automatically at boot"],
            ["`status`", "Inspect current state"],
          ],
        },
        {
          type: "callout",
          title: "Enabled ≠ active",
          text: "A service can be **enabled** (will start at boot) and still be **inactive** right now. That combination is normal and useful — for example after you stop a service for maintenance without disabling it permanently.",
        },
        {
          type: "terminal",
          preset: "system-services",
          suggestions: [
            {
              command: "sudo systemctl enable nginx",
              label: "enable nginx",
            },
            {
              command: "systemctl is-enabled nginx",
              label: "is-enabled",
            },
            { command: "systemctl is-active nginx", label: "is-active" },
            {
              command: "sudo systemctl disable nginx",
              label: "disable nginx",
            },
          ],
          suggestionsLabel: "Enable without assuming it is running",
        },
      ],
    },
    {
      id: "common-systemctl-commands",
      title: "Common systemctl Commands",
      blocks: [
        {
          type: "paragraph",
          text: "Here is the focused set used in this lesson:",
        },
        {
          type: "code",
          code: "systemctl status SERVICE\nsystemctl start SERVICE\nsystemctl stop SERVICE\nsystemctl restart SERVICE\nsystemctl enable SERVICE\nsystemctl disable SERVICE\nsystemctl is-active SERVICE\nsystemctl is-enabled SERVICE",
          language: "bash",
          title: "common commands",
        },
        {
          type: "definitions",
          items: [
            {
              term: "status",
              description: "Show a readable snapshot of the service.",
            },
            {
              term: "start / stop / restart",
              description:
                "Change whether the service is running **right now** (use `sudo` in this simulator).",
            },
            {
              term: "enable / disable",
              description:
                "Change whether the service should start **at boot** (use `sudo` here).",
            },
            {
              term: "is-active",
              description: "Print `active` or `inactive` — a quick check.",
            },
            {
              term: "is-enabled",
              description:
                "Print `enabled` or `disabled` — boot configuration.",
            },
          ],
        },
        {
          type: "note",
          text: "Do not worry about advanced systemd commands yet. Master this small set first.",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through six short exercises in one simulated terminal. Completing them in order reinforces the difference between current state and boot behavior.",
        },
        {
          type: "exercise",
          id: "system-services-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "system-services-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain and practice basic service management:",
        },
        {
          type: "list",
          items: [
            "Services run in the background and provide ongoing functionality",
            "`systemd` manages many Linux services (and other units)",
            "`systemctl` is the common tool for interacting with systemd",
            "`start` and `stop` affect the **current** state",
            "`enable` and `disable` affect **boot** behavior",
            "`status` (and `is-active` / `is-enabled`) help you inspect safely",
            "A service can be enabled without currently running",
          ],
        },
        {
          type: "table",
          caption: "Command reference for system services",
          headers: ["Command", "Purpose"],
          rows: [
            ["`systemctl status SERVICE`", "Inspect a service"],
            ["`sudo systemctl start SERVICE`", "Start now"],
            ["`sudo systemctl stop SERVICE`", "Stop now"],
            ["`sudo systemctl restart SERVICE`", "Restart now"],
            ["`sudo systemctl enable SERVICE`", "Enable at boot"],
            ["`sudo systemctl disable SERVICE`", "Disable at boot"],
            ["`systemctl is-active SERVICE`", "Quick active check"],
            ["`systemctl is-enabled SERVICE`", "Quick enabled check"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
