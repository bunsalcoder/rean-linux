import type { Lesson } from "@/types/lesson";

export const cpuMonitoringLesson = {
  slug: "cpu-monitoring",
  level: "performance",
  levelNumber: "05",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "CPU Monitoring and Analysis",
  description:
    "Learn how to monitor CPU activity, interpret utilization and load, identify CPU bottlenecks, and investigate high CPU usage — in a safe simulated lab.",
  seoTitle: "CPU Monitoring and Analysis — Linux Performance | Rean Linux",
  seoDescription:
    "Practice Linux CPU monitoring: utilization breakdowns, load average, CPU-bound vs I/O-bound workloads, top/htop/mpstat/lscpu, and bottleneck investigation — never real host monitoring.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    {
      label: "Linux Performance and Troubleshooting",
      href: "/learn/performance",
    },
    { label: "CPU Monitoring and Analysis" },
  ],
  navigation: {
    previous: {
      label: "Linux Performance Fundamentals",
      href: "/learn/performance/fundamentals",
    },
    next: {
      label: "Memory and Swap Management",
      href: "/learn/performance/memory-and-swap",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Linux Performance Fundamentals](/learn/performance/fundamentals), this lesson focuses on the **CPU**: how processors schedule work, what utilization fields mean, how load average relates to logical CPUs, and how to investigate bottlenecks systematically.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never reads your real CPU topology, never inspects host processes, never changes real priorities, and never executes system monitoring commands on your machine.",
    },
  ],
  sections: [
    {
      id: "cpu-architecture",
      title: "CPU Architecture Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "The **CPU** executes instructions for the kernel and user programs. Capacity depends on how many cores and logical processors are available — and how work is scheduled onto them.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Physical core",
              description:
                "A hardware execution unit that can run instructions. More cores generally mean more parallel compute capacity.",
            },
            {
              term: "Logical CPU / processor",
              description:
                "What the operating system schedules work onto. With SMT/hyper-threading, logical CPUs can outnumber physical cores.",
            },
            {
              term: "Thread and multitasking",
              description:
                "Processes and threads share time on logical CPUs. The scheduler switches among runnable tasks so many programs appear to run at once.",
            },
            {
              term: "CPU scheduling (high level)",
              description:
                "The kernel chooses which runnable task runs next on each logical CPU, balancing fairness, priority (nice), and responsiveness.",
            },
            {
              term: "Available CPU capacity",
              description:
                "Spare idle time and headroom versus logical CPU count. Capacity matters because saturation creates queues and latency even when “the box is powerful.”",
            },
          ],
        },
        {
          type: "callout",
          title: "Why capacity matters",
          text: "If demand exceeds available logical CPUs, runnable tasks wait. Latency rises even if the machine previously looked fine under lighter load.",
        },
      ],
    },
    {
      id: "cpu-utilization",
      title: "Understanding CPU Utilization",
      blocks: [
        {
          type: "paragraph",
          text: "CPU time is split into categories that reveal **what kind of work** (or waiting) is happening — not only how “busy” charts look.",
        },
        {
          type: "table",
          caption: "Common CPU time categories",
          headers: ["Field", "Meaning", "Diagnostic clue"],
          rows: [
            [
              "`us` (user)",
              "Time in user-space application code",
              "High with compute-heavy apps / interpreters",
            ],
            [
              "`sy` (system)",
              "Time in kernel / system work",
              "High with heavy syscalls, networking stack work, etc.",
            ],
            [
              "`id` (idle)",
              "Spare CPU capacity",
              "High idle ≠ automatically healthy app latency",
            ],
            [
              "`wa` (I/O wait)",
              "CPU time waiting on storage I/O",
              "Elevated with disk bottlenecks / blocked tasks",
            ],
            [
              "`ni` (nice)",
              "User time at adjusted niceness",
              "Shows lower-priority user work share",
            ],
            [
              "`hi` / `si`",
              "Hardware / soft interrupt time",
              "Can rise with interrupt-heavy device activity",
            ],
            [
              "`st` (steal)",
              "Time stolen by hypervisor from a VM",
              "Elevated when the host withholds vCPU time",
            ],
          ],
        },
        {
          type: "note",
          text: "**High CPU utilization does not automatically mean a problem.** Batch jobs may happily run near 100% while still meeting goals. Pair utilization with latency, errors, load, and wait states.",
        },
      ],
    },
    {
      id: "load-average",
      title: "Understanding Load Average",
      blocks: [
        {
          type: "paragraph",
          text: "**Load average** summarizes demand over **1, 5, and 15 minutes**. It reflects runnable tasks and tasks waiting for resources (commonly uninterruptible I/O) — not a direct “percent CPU busy.”",
        },
        {
          type: "list",
          items: [
            "Interpret load **relative to logical CPU count**",
            "Load can rise from CPU run queues **or** from I/O-blocked tasks",
            "Load average is **not** the same metric as CPU utilization %",
            "High load with high `%wa` often points to I/O contention, not pure compute saturation",
          ],
        },
        {
          type: "table",
          caption: "Example interpretations",
          headers: ["Logical CPUs", "1-minute load", "Reading"],
          rows: [
            ["2", "0.40", "Light — spare capacity"],
            ["2", "2.80", "Oversubscribed — queues likely"],
            ["4", "3.20", "Near capacity — watch latency"],
            ["4", "8.50", "High — check %us vs %wa vs %st"],
            ["8", "4.10", "Headroom remains"],
            ["8", "14.0", "High — classify runnable vs blocked"],
          ],
        },
        {
          type: "callout",
          title: "Load ≠ utilization",
          text: "A host can show high load while CPUs are waiting on disk (`%wa`), or moderate overall utilization while one logical CPU is pegged. Always combine signals.",
        },
      ],
    },
    {
      id: "workload-types",
      title: "CPU-Bound and I/O-Bound Workloads",
      blocks: [
        {
          type: "compare-grid",
          columns: [
            {
              title: "CPU-bound",
              blocks: [
                {
                  type: "paragraph",
                  text: "Progress limited by compute. Expect high `%us`/`%sy`, low `%wa`, runnable (R) tasks, and rising latency when saturated.",
                },
              ],
            },
            {
              title: "I/O-bound",
              blocks: [
                {
                  type: "paragraph",
                  text: "Progress limited by storage waits. Expect elevated `%wa`, D-state processes, and load that can climb even when CPUs are not fully busy computing.",
                },
              ],
            },
          ],
        },
        {
          type: "definitions",
          items: [
            {
              term: "Multi-threaded applications",
              description:
                "Can spread work across logical CPUs — balanced mpstat lines when scaling well.",
            },
            {
              term: "Single-threaded applications",
              description:
                "May peg one logical CPU while others stay idle — aggregate utilization can look “fine.”",
            },
            {
              term: "CPU contention",
              description:
                "Too many runnable tasks compete for limited logical CPUs; scheduling delays grow.",
            },
            {
              term: "Context switching",
              description:
                "The kernel switches CPUs between tasks. Some switching is normal; extreme rates can add overhead under heavy contention.",
            },
            {
              term: "CPU saturation",
              description:
                "Demand meets or exceeds CPU capacity — little idle, often load above logical CPU count, growing queues.",
            },
          ],
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Check cores versus logical CPUs, user versus system time, and I/O wait before diving into the dashboard labs.",
        },
        {
          type: "exercise",
          id: "cpu-monitoring-knowledge-check",
        },
      ],
    },
    {
      id: "monitoring-commands",
      title: "Monitoring CPU Activity",
      blocks: [
        {
          type: "paragraph",
          text: "These commands are the everyday toolkit for CPU inspection. In this course, every output line is **simulated**.",
        },
        {
          type: "table",
          caption: "Commands and focus areas",
          headers: ["Command", "Purpose", "Important fields"],
          rows: [
            [
              "`lscpu`",
              "CPU topology summary",
              "CPU(s), cores, threads per core, model",
            ],
            [
              "`top`",
              "Live-style snapshot of CPU + processes",
              "`%us/%sy/%id/%wa/%st`, PID, %CPU, state",
            ],
            [
              "`htop`",
              "Readable per-CPU bars + process table",
              "Per-CPU bars, nice, states",
            ],
            [
              "`mpstat`",
              "CPU utilization breakdown",
              "`%usr/%sys/%iowait/%steal/%idle`; `-P ALL` per CPU",
            ],
            [
              "`uptime`",
              "Uptime + load averages",
              "1/5/15-minute load vs CPU count",
            ],
            ["`ps`", "Process listing", "PID, %CPU, STAT, nice; sort by CPU"],
            ["`vmstat`", "Activity summary", "`r`/`b`, `cs`, `us/sy/id/wa/st`"],
          ],
        },
        {
          type: "code",
          code: "lscpu\nuptime\ntop\nhtop\nmpstat -P ALL\nps aux --sort=-%cpu\nvmstat 1 5",
          title: "Suggested CPU inspection sequence",
        },
      ],
    },
    {
      id: "cpu-dashboard",
      title: "Interactive CPU Monitoring Dashboard",
      blocks: [
        {
          type: "paragraph",
          text: "Explore seven simulated conditions: idle, normal, high CPU, saturation, high I/O wait, multi-core workload, and single-core bottleneck. Metrics, history bars, per-CPU lines, and processes stay consistent with each condition.",
        },
        {
          type: "exercise",
          id: "cpu-monitoring-dashboard",
        },
      ],
    },
    {
      id: "terminal-lab",
      title: "CPU Monitoring Terminal Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Practice educational command output. Multi-sample `vmstat` forms return predefined lines immediately — no real delays or host inspection.",
        },
        {
          type: "terminal",
          preset: "cpu-monitoring",
          suggestions: [
            { command: "lscpu", label: "lscpu" },
            { command: "uptime", label: "uptime" },
            { command: "top", label: "top" },
            { command: "htop", label: "htop" },
            { command: "mpstat -P ALL", label: "mpstat -P ALL" },
            { command: "ps aux --sort=-%cpu", label: "ps aux" },
            { command: "vmstat 1 5", label: "vmstat" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "CPU commands",
        },
      ],
    },
    {
      id: "bottleneck-lab",
      title: "CPU Bottleneck Investigation Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work five incidents: CPU saturation, high load average, high I/O wait, single-core bottleneck, and CPU steal time. Each includes symptoms, metrics, evidence, hints, and feedback.",
        },
        {
          type: "exercise",
          id: "cpu-monitoring-practice",
        },
      ],
    },
    {
      id: "process-analysis",
      title: "CPU Process Analysis",
      blocks: [
        {
          type: "paragraph",
          text: "Compare fictional processes (`nginx`, `postgres`, `node`, `java`, `redis`, `backup-worker`), interpret states and nice values, and try simulated `renice`. Changing priority does **not** automatically fix the underlying problem.",
        },
        {
          type: "exercise",
          id: "cpu-monitoring-process-lab",
        },
      ],
    },
    {
      id: "final-investigation",
      title: "Practical Final Exercise",
      blocks: [
        {
          type: "paragraph",
          text: "Investigate slow application response times end to end: inspect CPU info, interpret utilization, compare load to logical CPUs, identify dominant behavior, inspect processes, diagnose, recommend the next step, and verify with simulated commands.",
        },
        {
          type: "exercise",
          id: "cpu-monitoring-assessment",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "cpu-monitoring-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to interpret CPU performance metrics systematically:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain physical cores versus logical CPUs and why capacity matters",
            "Read `%us/%sy/%id/%wa/%ni/%hi/%si/%st` without over-claiming",
            "Interpret load average relative to logical CPU count",
            "Distinguish CPU-bound, I/O-bound, saturated, and single-thread bottleneck patterns",
            "Use simulated `lscpu`, `top`/`htop`, `mpstat`, `uptime`, `ps`, and `vmstat`",
            "Inspect processes and treat `nice`/`renice` as priority tools — not automatic fixes",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`lscpu` / `nproc`", "Topology and logical CPU count"],
            ["`uptime`", "Uptime and load averages"],
            ["`top` / `htop`", "CPU breakdown and process snapshot"],
            ["`mpstat` / `mpstat -P ALL`", "All-CPU and per-CPU utilization"],
            ["`ps aux` / `--sort=-%cpu`", "Process CPU inspection"],
            ["`vmstat` / `vmstat 1 5`", "Runnable/blocked and CPU fields"],
            ["`renice <n> -p <pid>`", "Simulated priority change"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [**Memory and Swap Management**](/learn/performance/memory-and-swap) — available memory, page cache, swap pressure, major faults, and memory-focused tools.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
