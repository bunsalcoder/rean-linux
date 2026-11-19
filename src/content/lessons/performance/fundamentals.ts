import type { Lesson } from "@/types/lesson";

export const performanceFundamentalsLesson = {
  slug: "fundamentals",
  level: "performance",
  levelNumber: "05",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Linux Performance Fundamentals",
  description:
    "Learn how to interpret Linux performance metrics, recognize bottlenecks across CPU, memory, disk, and network, and investigate problems systematically — in a safe simulated lab.",
  seoTitle: "Linux Performance Fundamentals — Linux Performance | Rean Linux",
  seoDescription:
    "Practice Linux performance fundamentals: utilization vs latency, the four resource areas, bottlenecks, troubleshooting methodology, and simulated dashboards — never real host monitoring.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    {
      label: "Linux Performance and Troubleshooting",
      href: "/learn/performance",
    },
    { label: "Linux Performance Fundamentals" },
  ],
  navigation: {
    previous: {
      label: "Linux Security and Hardening",
      href: "/learn/security",
    },
    next: {
      label: "CPU Monitoring and Analysis",
      href: "/learn/performance/cpu-monitoring",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Welcome to **Stage 05 — Linux Performance and Troubleshooting**. After [Linux Security and Hardening](/learn/security), you can harden hosts. This lesson builds a **performance mindset**: how to read metrics, spot bottlenecks, and investigate systematically before optimizing.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never reads your real CPU, memory, disk, network, or processes, never runs host shell tools, and never monitors live systems.",
    },
  ],
  sections: [
    {
      id: "understanding-performance",
      title: "Understanding Linux Performance",
      blocks: [
        {
          type: "paragraph",
          text: "**System performance** describes how well a Linux host delivers useful work for users and applications — not only how busy charts look.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Performance",
              description:
                "Outcomes that matter: response time, throughput, error rates, and whether SLOs are met.",
            },
            {
              term: "Resource utilization",
              description:
                "How busy a resource is (CPU %, disk %util, memory used). High utilization is a clue — not automatically a failure.",
            },
            {
              term: "Response time / latency",
              description:
                "How long one unit of work takes (for example a request or I/O operation).",
            },
            {
              term: "Throughput",
              description:
                "How much work completes per unit time (requests/s, MiB/s, IOPS).",
            },
            {
              term: "Capacity and saturation",
              description:
                "Capacity is what the resource can absorb; saturation means demand meets or exceeds that capacity and queues grow.",
            },
          ],
        },
        {
          type: "callout",
          title: "Low CPU can still feel slow",
          text: "A system can feel slow with **low CPU utilization** when work is waiting on memory reclaim, disk I/O, network latency, locks, or remote dependencies. Idle CPUs mean processors are free — not that every layer is healthy.",
        },
      ],
    },
    {
      id: "four-resource-areas",
      title: "The Four Major Resource Areas",
      blocks: [
        {
          type: "paragraph",
          text: "Most host-level performance investigations start with four areas: **CPU**, **memory**, **disk**, and **network**.",
        },
        {
          type: "heading",
          level: 3,
          text: "CPU",
        },
        {
          type: "list",
          items: [
            "**Utilization** — share of time CPUs are busy",
            "**User vs system time** — application code vs kernel work",
            "**Idle time** — spare CPU capacity",
            "**I/O wait** — CPU time spent waiting on storage",
            "**CPU-bound workloads** — progress limited by compute, not waiting",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Memory",
        },
        {
          type: "list",
          items: [
            "**Physical RAM** — the working set the kernel manages",
            "**Used vs available** — prefer **available** over treating all used bytes as gone",
            "**Buffers and cache** — reclaimable memory that can inflate “used”",
            "**Swap** — disk-backed overflow; rising swap with low available often signals pressure",
            "**Memory pressure** — shortage that forces reclaim/swap and slows workloads",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Disk",
        },
        {
          type: "list",
          items: [
            "**Read/write throughput** — data volume per second",
            "**IOPS** — I/O operations per second",
            "**I/O latency** — how long each operation waits (for example await)",
            "**Disk utilization** — how busy the device is",
            "**I/O-bound workloads** — progress limited by storage waits",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Network",
        },
        {
          type: "list",
          items: [
            "**Bandwidth** — link capacity",
            "**Latency** — path delay",
            "**Throughput** — useful data transferred over time",
            "**Packet loss** — dropped packets that force retries",
            "**Congestion** — path overload that raises latency and loss",
          ],
        },
        {
          type: "table",
          caption: "Quick resource cues",
          headers: ["Area", "Common signals", "What alone cannot prove"],
          rows: [
            ["CPU", "High util, load ≫ CPU count", "Which dependency is slow"],
            [
              "Memory",
              "Low available, rising swap",
              "That the disk filesystem is full",
            ],
            ["Disk", "High await/%util/iowait", "That more vCPUs will fix it"],
            ["Network", "High latency or loss", "That local RAM is exhausted"],
          ],
        },
      ],
    },
    {
      id: "performance-metrics",
      title: "Performance Metrics",
      blocks: [
        {
          type: "paragraph",
          text: "Metrics are evidence. Each one answers a narrow question — and leaves others open.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "CPU utilization %",
              description:
                "How busy processors are. High can be healthy for batch work; low does not prove the app is fast.",
            },
            {
              term: "Load average",
              description:
                "Demand over 1/5/15 minutes. Interpret **relative to CPU count**, not as a universal “percent busy.”",
            },
            {
              term: "Memory utilization / available",
              description:
                "Prefer available memory. Used includes reclaimable cache and can look scary without pressure.",
            },
            {
              term: "Swap usage",
              description:
                "Shows overflow onto disk. Elevated swap with low available often correlates with stalls.",
            },
            {
              term: "Disk I/O throughput",
              description:
                "Volume moved per second. High throughput can be fine; pair with latency and %util.",
            },
            {
              term: "I/O wait",
              description:
                "CPU time waiting on storage. Elevated iowait with moderate CPU often hints at disk bottlenecks.",
            },
            {
              term: "Network throughput",
              description:
                "Bytes moved over the wire. Does not alone explain high latency or loss.",
            },
            {
              term: "Application response time",
              description:
                "What users feel. Host charts can look quiet while response time is still poor.",
            },
          ],
        },
        {
          type: "note",
          text: "No single metric diagnoses a root cause alone. Combine related signals and compare against a baseline.",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Check your understanding of performance versus utilization, latency versus throughput, and why low CPU is not automatically “healthy.”",
        },
        {
          type: "exercise",
          id: "performance-fundamentals-knowledge-check",
        },
      ],
    },
    {
      id: "understanding-bottlenecks",
      title: "Understanding Bottlenecks",
      blocks: [
        {
          type: "paragraph",
          text: "A **bottleneck** is the resource or layer that limits overall progress. Identifying it should happen **before** optimization.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "CPU bottleneck",
              blocks: [
                {
                  type: "paragraph",
                  text: "High utilization and/or load far above CPU count; memory and iowait look comparatively fine.",
                },
              ],
            },
            {
              title: "Memory bottleneck",
              blocks: [
                {
                  type: "paragraph",
                  text: "Very low available memory, rising swap, often climbing response time with only moderate CPU.",
                },
              ],
            },
            {
              title: "Disk I/O bottleneck",
              blocks: [
                {
                  type: "paragraph",
                  text: "Elevated iowait, high await/%util, moderate CPU — processors wait on storage.",
                },
              ],
            },
            {
              title: "Network bottleneck",
              blocks: [
                {
                  type: "paragraph",
                  text: "Healthy local CPU/RAM/disk with high latency, loss, or saturated path/throughput.",
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Application-level bottlenecks",
          text: "When CPU, memory, disk, and network look normal but users are still slow, investigate **application behavior and dependencies** (locks, queries, remote APIs). Do not force a hardware story the evidence does not support.",
        },
        {
          type: "note",
          text: "Evidence can be incomplete. Prefer “most likely investigation area” over absolute claims when multiple causes remain possible.",
        },
      ],
    },
    {
      id: "troubleshooting-methodology",
      title: "Performance Troubleshooting Methodology",
      blocks: [
        {
          type: "paragraph",
          text: "Use a repeatable workflow so you diagnose before you change production systems:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Observe the symptoms (who is affected, since when, what changed)",
            "Establish a baseline (what “normal” looked like)",
            "Collect relevant metrics across CPU, memory, disk, network, and app latency",
            "Identify unusual resource behavior versus the baseline",
            "Form a hypothesis about the likely bottleneck",
            "Investigate the suspected bottleneck more deeply",
            "Apply a **controlled** improvement (one change at a time when possible)",
            "Compare before-and-after measurements",
            "Verify that the issue is resolved for users",
          ],
        },
        {
          type: "callout",
          title: "One change at a time",
          text: "Changing CPU, memory, disk, network, and application settings **simultaneously** makes it hard to know which action helped, hurt, or did nothing. Controlled experiments keep troubleshooting scientific.",
        },
      ],
    },
    {
      id: "metrics-dashboard",
      title: "Performance Metrics Dashboard",
      blocks: [
        {
          type: "paragraph",
          text: "Explore six deterministic simulated conditions: healthy, high CPU, memory pressure, disk I/O bottleneck, network congestion, and application-level slowdown. Watch metric cards update, then confirm with terminal commands.",
        },
        {
          type: "exercise",
          id: "performance-fundamentals-dashboard",
        },
      ],
    },
    {
      id: "simulator-commands",
      title: "Performance Troubleshooting Simulator",
      blocks: [
        {
          type: "paragraph",
          text: "Practice reading educational output from common inspection commands. Every line is simulated and returned immediately — including multi-sample `vmstat` / `iostat` forms.",
        },
        {
          type: "table",
          caption: "Important fields to notice",
          headers: ["Command", "Focus on"],
          rows: [
            ["`uptime`", "Load averages vs CPU count"],
            ["`free -h`", "Available memory and swap used"],
            ["`top`", "CPU breakdown, iowait, top processes"],
            ["`vmstat`", "r/b, si/so, us/sy/id/wa"],
            ["`iostat`", "await, %util, rkB/s, wkB/s, %iowait"],
            ["`df -h`", "Filesystem capacity (separate from RAM)"],
            ["`ss -s`", "Socket summary plus simulated path latency/loss cues"],
          ],
        },
        {
          type: "code",
          code: "uptime\nfree -h\ntop\nvmstat 1 5\niostat -x 1 3\ndf -h\nss -s",
          title: "Suggested diagnostic sequence",
        },
        {
          type: "terminal",
          preset: "performance-fundamentals",
          suggestions: [
            { command: "uptime", label: "uptime" },
            { command: "free -h", label: "free -h" },
            { command: "top", label: "top" },
            { command: "vmstat 1 5", label: "vmstat 1 5" },
            { command: "iostat -x 1 3", label: "iostat -x" },
            { command: "df -h", label: "df -h" },
            { command: "ss -s", label: "ss -s" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Performance commands",
        },
      ],
    },
    {
      id: "bottleneck-lab",
      title: "Interactive Bottleneck Identification Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work five fictional server situations. Match symptoms and metrics to the most likely bottleneck — and respect uncertainty when evidence is incomplete.",
        },
        {
          type: "exercise",
          id: "performance-fundamentals-practice",
        },
      ],
    },
    {
      id: "final-investigation",
      title: "Practical Final Exercise",
      blocks: [
        {
          type: "paragraph",
          text: "Investigate a slower application server end to end: review metrics, mark abnormal values, name the likely bottleneck, justify the reasoning, choose the next diagnostic area, recommend a controlled investigation, and verify with simulated `iostat` output.",
        },
        {
          type: "exercise",
          id: "performance-fundamentals-assessment",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "performance-fundamentals-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now have a foundation for Linux performance analysis:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Separate performance outcomes from resource utilization",
            "Explain latency, throughput, capacity, and saturation",
            "Inspect CPU, memory, disk, and network as four major areas",
            "Read core metrics without over-claiming from a single number",
            "Recognize common bottleneck patterns — including application-level cases",
            "Follow a systematic investigate-before-optimize workflow",
            "Practice with simulated dashboards and educational command output",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`hostname` / `nproc`", "Host identity and CPU count"],
            ["`uptime`", "Uptime and load averages"],
            ["`free` / `free -h`", "Memory and swap (prefer available)"],
            ["`top`", "CPU breakdown and process snapshot"],
            ["`vmstat` / `vmstat 1 5`", "Activity summary (simulated samples)"],
            ["`iostat` / `iostat -x 1 3`", "Disk I/O summary (simulated)"],
            ["`df -h`", "Filesystem capacity"],
            ["`ss -s`", "Socket summary and simulated path cues"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: **[CPU Monitoring and Analysis](/learn/performance/cpu-monitoring)** — deeper practice with utilization breakdowns, load, and CPU-focused tools.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
