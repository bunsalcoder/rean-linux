import type { Lesson } from "@/types/lesson";

export const systemMonitoringLesson = {
  slug: "system-monitoring",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "System Monitoring and Resource Usage",
  description:
    "Learn to interpret CPU, memory, load averages, processes, swap, and disk capacity using a simulated monitoring lab — never your real host.",
  seoTitle:
    "System Monitoring and Resource Usage — Linux Administration | Rean Linux",
  seoDescription:
    "Practice Linux system monitoring with simulated uptime, free, top, ps, vmstat, and df — including CPU, memory, load, swap, and disk scenarios in the browser.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "System Monitoring and Resource Usage" },
  ],
  navigation: {
    previous: {
      label: "Scheduled Tasks",
      href: "/learn/administration/scheduled-tasks",
    },
    next: {
      label: "Backups and Recovery",
      href: "/learn/administration/backups-and-recovery",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Scheduled Tasks](/learn/administration/scheduled-tasks), you can automate work on a schedule. This lesson covers **system monitoring** — how administrators read CPU, memory, load, processes, and disk capacity when a host feels slow or unstable — entirely in a simulated environment that never inspects your real machine.",
    },
  ],
  sections: [
    {
      id: "why-monitoring-matters",
      title: "Why System Monitoring Matters",
      blocks: [
        {
          type: "paragraph",
          text: "Administrators monitor systems to **detect problems early**, explain performance symptoms, and gather evidence before changing configuration or terminating processes. Monitoring answers: Is the host CPU-bound? Memory-starved? Overloaded relative to its cores? Out of disk space?",
        },
        {
          type: "list",
          items: [
            "Separate symptoms (slowness, timeouts) from causes (CPU, RAM, I/O, disk full)",
            "Compare metrics against capacity (for example load vs CPU count)",
            "Find which processes consume resources",
            "Avoid guessing — diagnose before disruptive action",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Everything here is **simulated**. The app never reads your real CPU, memory, process table, or disks, never runs host shell tools, and never terminates real processes.",
        },
      ],
    },
    {
      id: "cpu-utilization",
      title: "CPU Utilization and Capacity",
      blocks: [
        {
          type: "paragraph",
          text: "**CPU utilization** describes how busy processors are. High utilization is **not automatically a problem** — a busy build server may be healthy. What matters is whether the work is expected, how long it lasts, and whether users feel the impact.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "CPU capacity",
              description:
                "How much parallel work the host can absorb — often approximated by the number of CPUs/cores (`nproc`).",
            },
            {
              term: "CPU pressure",
              description:
                "Demand that keeps CPUs saturated and queues building — look at utilization **and** load averages together.",
            },
          ],
        },
        {
          type: "code",
          code: "nproc\nuptime\ntop",
          title: "Inspect CPU capacity and activity",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "nproc", label: "nproc" },
            { command: "uptime", label: "uptime" },
            { command: "top", label: "top" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "CPU and capacity",
        },
      ],
    },
    {
      id: "memory-and-swap",
      title: "RAM, Available Memory, and Swap",
      blocks: [
        {
          type: "paragraph",
          text: "Linux memory accounting includes **caches and buffers**. A large “used” number does not always mean the system is out of RAM. Prefer the **available** figure from `free` — it estimates how much memory can still be given to new workloads without heavy swapping.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Total / used / free",
              description:
                "Headline RAM sizes. Free alone can look low even when plenty remains reclaimable from cache.",
            },
            {
              term: "Available",
              description:
                "Best first answer to “how much memory can apps still use?” Prefer this over treating all used memory as unavailable.",
            },
            {
              term: "Swap",
              description:
                "Disk-backed overflow for RAM. Elevated swap with low available memory often signals **memory pressure**.",
            },
          ],
        },
        {
          type: "code",
          code: "free\nfree -h",
          title: "Inspect memory (prefer available)",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "free -h", label: "free -h" },
            { command: "free", label: "free" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Memory commands",
        },
        {
          type: "note",
          text: "Memory pressure symptoms: very low available memory, rising swap used, and sometimes elevated I/O wait while the kernel pages data to disk.",
        },
      ],
    },
    {
      id: "load-averages",
      title: "Reading Load Averages",
      blocks: [
        {
          type: "paragraph",
          text: "**Load averages** (1, 5, and 15 minutes) summarize runnable (and uninterruptible) demand. They do **not** mean “percent CPU” by themselves. Interpret them **relative to CPU count**: on a 4-CPU host, a sustained load near 8 suggests more work queued than cores can run promptly.",
        },
        {
          type: "table",
          caption: "Load averages — what they do and do not indicate",
          headers: ["They help with", "They do not alone prove"],
          rows: [
            [
              "Whether demand exceeds CPU capacity over time",
              "Exactly which process is guilty",
            ],
            [
              "Seeing short spikes vs sustained overload",
              "That the disk is full",
            ],
            ["Comparing 1m vs 15m trend", "That available memory is healthy"],
          ],
        },
        {
          type: "code",
          code: "uptime\nnproc",
          title: "Load averages and CPU count together",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "uptime", label: "uptime" },
            { command: "nproc", label: "nproc" },
            { command: "hostname", label: "hostname" },
          ],
          suggestionsLabel: "Uptime and load",
        },
      ],
    },
    {
      id: "processes-and-resources",
      title: "Processes, PIDs, and Resource Percentages",
      blocks: [
        {
          type: "paragraph",
          text: "Each running program is a **process** with a **PID**. Tools like `top` and `ps` show **%CPU** and **%MEM** so you can find consumers. %CPU can exceed 100 on multi-core views depending on how the tool accounts for cores; in this lab, treat percentages as relative clues within the snapshot.",
        },
        {
          type: "list",
          items: [
            "`ps` — quick process snapshot",
            "`ps aux` — broader user/CPU/memory listing",
            "`ps -eo pid,comm,%cpu,%mem` — focused custom columns",
            "`top` — combined resource header plus process table",
          ],
        },
        {
          type: "code",
          code: "ps\nps aux\nps -eo pid,comm,%cpu,%mem\ntop",
          title: "Inspect processes and consumption",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "ps aux", label: "ps aux" },
            { command: "ps -eo pid,comm,%cpu,%mem", label: "ps -eo" },
            { command: "top", label: "top" },
          ],
          suggestionsLabel: "Process inspection",
        },
      ],
    },
    {
      id: "vmstat-activity",
      title: "Using vmstat for System Activity",
      blocks: [
        {
          type: "paragraph",
          text: "`vmstat` summarizes processes, memory, swap, I/O, and CPU in compact columns. `vmstat 1 5` would sample every second five times on a real host — in this lab it returns a **predefined simulated result immediately** (no real timer, no host sampling).",
        },
        {
          type: "table",
          caption: "Useful vmstat clues (conceptual)",
          headers: ["Area", "What to notice"],
          rows: [
            ["procs (r)", "Runnable processes waiting for CPU"],
            [
              "swap (si/so)",
              "Pages swapped in/out — elevated under memory pressure",
            ],
            ["cpu (us/sy/id/wa)", "User, system, idle, and I/O wait shares"],
          ],
        },
        {
          type: "code",
          code: "vmstat\nvmstat 1 5",
          title: "Virtual memory and activity summary",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "vmstat", label: "vmstat" },
            { command: "vmstat 1 5", label: "vmstat 1 5" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "vmstat",
        },
      ],
    },
    {
      id: "disk-versus-memory",
      title: "Disk Space Versus Memory Usage",
      blocks: [
        {
          type: "paragraph",
          text: "**Disk space** (filesystem capacity) and **memory** (RAM/swap) are different resources. A server can have free RAM and a full `/` filesystem — or the opposite. Use `df -h` for storage and `free -h` for memory; do not treat them as interchangeable.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Memory (`free`)",
              blocks: [
                {
                  type: "list",
                  variant: "plain",
                  items: [
                    "RAM and swap",
                    "Prefer **available**",
                    "Pressure → swap activity",
                  ],
                },
              ],
            },
            {
              title: "Disk (`df`)",
              blocks: [
                {
                  type: "list",
                  variant: "plain",
                  items: [
                    "Filesystem capacity",
                    "Watch Use% on mounts",
                    "Full `/` ≠ out of RAM",
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "code",
          code: "df -h\nfree -h",
          title: "Compare storage capacity and RAM",
        },
        {
          type: "terminal",
          preset: "system-monitoring",
          suggestions: [
            { command: "df -h", label: "df -h" },
            { command: "free -h", label: "free -h" },
            { command: "uptime", label: "uptime" },
          ],
          suggestionsLabel: "Disk vs memory",
        },
        {
          type: "note",
          text: "Disk numbers in this lesson reuse the same educational storage model style as Disk Usage and Mounts — still simulated, never your real disks.",
        },
      ],
    },
    {
      id: "pressure-symptoms",
      title: "Recognizing CPU, Memory, and Swap Pressure",
      blocks: [
        {
          type: "table",
          caption: "Common pressure patterns",
          headers: ["Pattern", "Typical evidence"],
          rows: [
            [
              "CPU pressure",
              "High %CPU on one or more processes; utilization high; load may rise with CPU count",
            ],
            [
              "Memory pressure",
              "Low **available** memory; elevated swap used; `vmstat` si/so activity",
            ],
            [
              "Excessive swapping",
              "Swap climbing while workloads stall; often paired with I/O wait",
            ],
            [
              "Disk space warning",
              "`df -h` Use% critical on a mount while RAM may still look fine",
            ],
            [
              "High system load",
              "Load averages sustained above CPU capacity; many runnable processes",
            ],
          ],
        },
        {
          type: "callout",
          title: "Diagnose before you act",
          text: "Do not terminate processes or change configuration until you can explain the symptom with evidence from uptime/load, CPU/process views, memory/swap, and disk checks when relevant.",
        },
      ],
    },
    {
      id: "monitoring-dashboard",
      title: "Interactive Resource Dashboard",
      blocks: [
        {
          type: "paragraph",
          text: "Use the dashboard to switch deterministic scenarios — healthy, high CPU, memory pressure, high load, and disk warning — and watch simulated gauges update. Confirm everything in the terminal; the bars are educational visualizations of the same snapshot.",
        },
        {
          type: "exercise",
          id: "system-monitoring-dashboard",
        },
      ],
    },
    {
      id: "troubleshooting-workflow",
      title: "A Systematic Monitoring Workflow",
      blocks: [
        {
          type: "paragraph",
          text: "When something feels wrong, follow a repeatable checklist instead of jumping to kill commands:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Identify the symptom and its scope (one service vs whole host)",
            "Check uptime and load averages (`uptime`, compare with `nproc`)",
            "Inspect CPU and process usage (`top`, `ps aux`)",
            "Inspect available memory and swap (`free -h`, optionally `vmstat`)",
            "Check disk space when storage issues are suspected (`df -h`)",
            "Compare the evidence before taking action",
            "Recheck metrics after a simulated corrective action",
          ],
        },
        {
          type: "code",
          code: "uptime\nnproc\ntop\nfree -h\ndf -h\nvmstat 1 5",
          title: "Example diagnostic sequence",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through eight scenarios: count CPUs, read available memory, find top CPU and memory consumers, interpret load vs capacity, recognize memory pressure, separate disk exhaustion from RAM issues, and choose the next diagnostic command.",
        },
        {
          type: "exercise",
          id: "system-monitoring-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "system-monitoring-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to monitor a Linux host thoughtfully:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why monitoring matters for administrators",
            "Interpret CPU utilization in context — busy is not always broken",
            "Prefer available memory over treating all used RAM as unavailable",
            "Read load averages relative to CPU capacity",
            "Inspect processes with `top` and `ps`",
            "Use `uptime`, `free`, `vmstat`, and `df` as complementary tools",
            "Distinguish disk-space problems from memory pressure",
            "Follow a diagnose-before-act troubleshooting checklist",
          ],
        },
        {
          type: "table",
          caption: "Command reference for system monitoring",
          headers: ["Command", "Purpose"],
          rows: [
            ["`hostname`", "Show the simulated hostname"],
            ["`nproc`", "Count processing units"],
            ["`uptime`", "Uptime and load averages"],
            ["`free` / `free -h`", "Memory and swap (prefer available)"],
            ["`top`", "Resource header and process table"],
            ["`ps` / `ps aux`", "Process snapshots"],
            ["`ps -eo pid,comm,%cpu,%mem`", "Custom process columns"],
            ["`vmstat` / `vmstat 1 5`", "Activity summary (simulated samples)"],
            ["`df` / `df -h`", "Filesystem disk capacity"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next you will study **Backups and Recovery** — protecting data and planning restores. That lesson is not published yet.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
