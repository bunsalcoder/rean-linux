import type { Lesson } from "@/types/lesson";

export const memoryAndSwapLesson = {
  slug: "memory-and-swap",
  level: "performance",
  levelNumber: "05",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Memory and Swap Management",
  description:
    "Understand how Linux manages RAM, buffers, page cache, and swap — and learn to identify real memory pressure versus normal cache behavior in a safe simulated environment.",
  seoTitle: "Memory and Swap Management — Linux Performance | Rean Linux",
  seoDescription:
    "Practice Linux memory monitoring: free vs. available, buffers/cache, RSS vs. VSZ, swap activity, memory pressure, and OOM — never reading real host memory.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    {
      label: "Linux Performance and Troubleshooting",
      href: "/learn/performance",
    },
    { label: "Memory and Swap Management" },
  ],
  navigation: {
    previous: {
      label: "CPU Monitoring and Analysis",
      href: "/learn/performance/cpu-monitoring",
    },
    next: {
      label: "Disk I/O Performance",
      href: "/learn/performance/disk-io-performance",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [CPU Monitoring and Analysis](/learn/performance/cpu-monitoring), this lesson focuses on **memory**: how Linux allocates and reclaims RAM, what free versus available means, how page cache works, and how to detect real memory pressure versus normal cache behavior.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never reads your real memory, swap, or /proc/meminfo. No real memory is allocated. All values are fictional bounded in-memory state.",
    },
  ],
  sections: [
    {
      id: "memory-fundamentals",
      title: "Linux Memory Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "Applications do **not** talk to physical RAM chips directly. The kernel presents each process with a private **virtual address space**, then maps pages of that space onto physical frames (or to disk/swap when needed). That indirection enables isolation, shared libraries, overcommit of virtual size, and efficient caching.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Physical RAM",
              description:
                "The actual memory installed (e.g. 8 GiB). Once full, the kernel must reclaim or swap to satisfy new allocations.",
            },
            {
              term: "Virtual memory",
              description:
                "An abstraction where each process sees a large contiguous address space. The MMU and kernel translate virtual addresses to physical frames (or signal a page fault).",
            },
            {
              term: "Address space",
              description:
                "The range of virtual addresses a process can use. Processes normally cannot read or write another process’s address space without explicit sharing.",
            },
            {
              term: "Pages and page allocation",
              description:
                "Memory is managed in fixed-size pages (commonly 4 KiB). The kernel allocates and tracks pages, mapping them into address spaces as programs run.",
            },
            {
              term: "Kernel memory",
              description:
                "Memory reserved for the operating system itself — slab caches, page tables, networking buffers, and other kernel structures.",
            },
            {
              term: "User-space memory",
              description:
                "Memory belonging to applications (heaps, stacks, mapped files). Visible in process tools as RSS/VSZ for user processes.",
            },
          ],
        },
        {
          type: "callout",
          title: "Why virtual memory exists",
          text: "Virtual memory lets the kernel isolate processes, share read-only pages (libraries), delay physical allocation until pages are touched, and move cold pages to swap under pressure — without every application managing raw physical frames.",
        },
      ],
    },
    {
      id: "understanding-usage",
      title: "Understanding Memory Usage",
      blocks: [
        {
          type: "paragraph",
          text: "Linux memory accounting can be confusing at first. The key insight is that **high buff/cache with high available is normal and healthy**, not a warning sign. Low free memory alone does **not** mean the system is out of memory.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Total memory",
              description:
                "Physical RAM installed — the fixed capacity the host can use without swap.",
            },
            {
              term: "Used memory",
              description:
                "Roughly application + kernel footprint (total − free − buff/cache in `free` output).",
            },
            {
              term: "Free memory (MemFree)",
              description:
                "Truly unallocated pages. Linux intentionally keeps this low by filling spare RAM with page cache.",
            },
            {
              term: "Available (MemAvailable)",
              description:
                "The best indicator of real headroom: free + reclaimable cache + reclaimable buffers. This is what a new allocation can actually use.",
            },
            {
              term: "Buffers and page cache",
              description:
                "Buffers hold block-device metadata; page cache holds file data. Both are largely reclaimable when applications need RAM.",
            },
            {
              term: "Shared / cached memory",
              description:
                "Shared memory covers tmpfs and IPC shared mappings. Cached (page cache) is file-backed data kept in RAM for speed.",
            },
          ],
        },
        {
          type: "callout",
          title: "Free is not the right metric",
          text: "On a healthy Linux system, `free` will often appear low because the kernel uses spare RAM as disk cache. Use `available` to judge real memory headroom.",
        },
        {
          type: "table",
          caption: "free -h output fields",
          headers: ["Field", "Meaning", "What it tells you"],
          rows: [
            ["total", "Physical RAM installed", "Fixed hardware capacity"],
            [
              "used",
              "total − free − buff/cache",
              "Approximate application + kernel footprint",
            ],
            [
              "free",
              "Unallocated pages",
              "Usually low on healthy systems — not a problem alone",
            ],
            [
              "shared",
              "tmpfs and IPC shared memory",
              "Rises with heavy shared memory usage",
            ],
            [
              "buff/cache",
              "Kernel buffers + page cache",
              "Largely reclaimable — does not count against apps",
            ],
            [
              "available",
              "free + reclaimable cache",
              "Best single indicator of real headroom",
            ],
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Cache-heavy (normal)",
              blocks: [
                {
                  type: "paragraph",
                  text: "free=180 MiB, cached=4800 MiB, available=4600 MiB — Linux has filled spare RAM with reclaimable file data. Applications can get 4.6 GiB on demand. This is a **performance feature**, not a problem.",
                },
              ],
            },
            {
              title: "Memory pressure (abnormal)",
              blocks: [
                {
                  type: "paragraph",
                  text: "free=92 MiB, cached=310 MiB, available=380 MiB — applications have consumed most RAM and displaced cache. Only 380 MiB remains available. Active reclaim and elevated page faults follow.",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          text: "Per-process memory is reported as **RSS** (Resident Set Size) and **VSZ** (Virtual Size). Use RSS to understand physical memory consumption; VSZ is usually much larger because it includes mappings not yet loaded into RAM.",
        },
        {
          type: "table",
          caption: "Process memory metrics",
          headers: ["Metric", "Meaning", "When it matters"],
          rows: [
            [
              "RSS",
              "Pages currently in physical RAM",
              "Actual pressure on physical memory",
            ],
            [
              "VSZ",
              "Total virtual address space",
              "May be large but only RSS is in RAM",
            ],
            ["%MEM", "RSS / total RAM × 100", "Quick proportional indicator"],
          ],
        },
        {
          type: "note",
          text: "High VSZ with modest RSS is normal — many processes reserve large virtual ranges that are only loaded on demand (memory-mapped files, lazy allocations, shared libraries).",
        },
      ],
    },
    {
      id: "memory-pressure",
      title: "Memory Pressure and Page Faults",
      blocks: [
        {
          type: "paragraph",
          text: "**Memory pressure** occurs when application demand exceeds available pages. The kernel responds by reclaiming cache and, if needed, swapping anonymous pages to disk.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Minor page fault",
              description:
                "A page reference that can be resolved without disk I/O (page already mapped, copy-on-write, etc.). Very common and fast.",
            },
            {
              term: "Major page fault",
              description:
                "A page reference that requires reading data from disk or swap. Each one adds disk latency — elevated rates indicate memory pressure.",
            },
            {
              term: "Memory pressure level",
              description:
                "A classification (low / moderate / high / critical) reflecting how aggressively the kernel is reclaiming pages.",
            },
            {
              term: "Reclaim activity",
              description:
                "The kernel evicting page cache and buffers to satisfy allocations. Idle → light → elevated → aggressive.",
            },
            {
              term: "Memory leak",
              description:
                "A process keeps allocating memory without releasing it. RSS climbs over time even when load is steady — investigate trends, not a single snapshot.",
            },
            {
              term: "OOM killer",
              description:
                "Last-resort mechanism: when both RAM and swap are exhausted, the kernel terminates a process to recover pages. Conceptual only here — never triggered on your host.",
            },
          ],
        },
        {
          type: "callout",
          title: "Pressure signals to watch",
          text: "Major fault rate rising, available memory declining trend, elevated reclaim activity, si/so rates increasing, and application response time growing together are the key signals of genuine memory pressure. Pressure hurts responsiveness because reclaim and swap add latency before allocations complete.",
        },
        {
          type: "paragraph",
          text: "The `swappiness` kernel parameter (default 60) controls whether the kernel prefers to reclaim page cache or to swap anonymous memory first. Lower values prefer cache reclaim; higher values prefer swap. Changing it without investigation often makes things worse.",
        },
      ],
    },
    {
      id: "swap-management",
      title: "Swap Usage and Active Swapping",
      blocks: [
        {
          type: "paragraph",
          text: "Swap is disk space used as an overflow area for RAM. It is a safety net — not a performance resource. Understanding the difference between **swap allocated** (non-zero SwapUsed) and **active swapping** (high si/so rates) is critical. Swap usage alone does **not** prove an ongoing memory problem.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Swap partition",
              description:
                "A dedicated disk partition marked for swap. Common on traditional installs; appears as a block device in `swapon --show`.",
            },
            {
              term: "Swap file",
              description:
                "A regular file on a filesystem activated as swap. Flexible to create or resize without repartitioning; still limited by disk latency.",
            },
            {
              term: "Swap-in / swap-out",
              description:
                "Moving pages from swap back to RAM (si) or from RAM to swap (so). Persistent high rates mean active pressure and disk-bound latency.",
            },
            {
              term: "Swappiness",
              description:
                "Kernel preference for reclaiming page cache versus swapping anonymous memory (default often 60). Tuning without diagnosis can worsen latency.",
            },
          ],
        },
        {
          type: "table",
          caption: "Swap-related fields in vmstat and free",
          headers: ["Field", "Source", "Meaning"],
          rows: [
            ["SwapTotal", "free, /proc/meminfo", "Total swap device capacity"],
            [
              "SwapUsed",
              "free",
              "Pages currently on swap device — may be from earlier pressure",
            ],
            ["SwapFree", "free", "Remaining swap capacity"],
            [
              "si (swap-in)",
              "vmstat",
              "Pages fetched from swap to RAM per second — active retrieval",
            ],
            [
              "so (swap-out)",
              "vmstat",
              "Pages moved from RAM to swap per second — active eviction",
            ],
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Swap allocated (not thrashing)",
              blocks: [
                {
                  type: "paragraph",
                  text: "SwapUsed=400 MiB, si=0/s, so=0/s — pages were moved to swap earlier but are not being accessed. No current disk I/O for swap. Usually not causing latency.",
                },
              ],
            },
            {
              title: "Active swapping (thrashing)",
              blocks: [
                {
                  type: "paragraph",
                  text: "SwapUsed=1024 MiB, si=42/s, so=68/s — the kernel is constantly moving pages between RAM and disk. Each swap-in adds disk read latency. App response time rises significantly.",
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "**Having swap enabled is not a problem.** It is a safety net. The problem is when si/so rates are persistently high, indicating the system is under active memory pressure and paying disk latency repeatedly.",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Test your understanding of free vs. available, buff/cache behavior, RSS vs. VSZ, and si/so before the monitoring labs.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-knowledge-check",
        },
      ],
    },
    {
      id: "monitoring-commands",
      title: "Memory Monitoring Commands",
      blocks: [
        {
          type: "paragraph",
          text: "Several Linux tools expose memory statistics at different levels of detail. Each is useful for a different diagnostic stage.",
        },
        {
          type: "table",
          caption: "Memory monitoring commands",
          headers: ["Command", "Output", "Best for"],
          rows: [
            [
              "`free -h`",
              "Total/used/free/buff-cache/available + swap summary",
              "Quick health check",
            ],
            [
              "`cat /proc/meminfo`",
              "Detailed kernel memory fields (MemFree, MemAvailable, Cached, SwapFree, etc.)",
              "Detailed field inspection",
            ],
            [
              "`vmstat 1 5`",
              "Snapshot + 5 samples: memory, swap si/so, I/O, CPU",
              "Swap activity rates (si/so)",
            ],
            [
              "`top`",
              "Mem: / Swap: header + process RSS/%MEM",
              "Live process memory overview",
            ],
            [
              "`ps aux --sort=-%mem`",
              "Process list sorted by %MEM / RSS",
              "Top memory consumers",
            ],
            [
              "`swapon --show`",
              "Swap device list with utilization",
              "Swap device inspection",
            ],
            [
              "`sar -r`",
              "Memory utilization report with timestamps",
              "Historical trends",
            ],
          ],
        },
        {
          type: "callout",
          title: "Investigation workflow",
          text: "Start with `free -h` for the summary. If available is low, check `cat /proc/meminfo` for detail. Run `vmstat 1 5` to see si/so rates. Use `ps aux --sort=-%mem` to find the top consumers.",
        },
      ],
    },
    {
      id: "memory-dashboard",
      title: "Memory and Swap Dashboard",
      blocks: [
        {
          type: "paragraph",
          text: "Explore seven fictional memory conditions. Switch between them to see how the metrics change. Use the embedded terminal to run `free -h`, `vmstat`, and other commands against each condition.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-dashboard",
        },
      ],
    },
    {
      id: "terminal-lab",
      title: "Terminal Practice",
      blocks: [
        {
          type: "paragraph",
          text: "Practice memory commands in the terminal. The host is a fictional system — values are simulated and never reflect your real machine.",
        },
        {
          type: "terminal",
          preset: "memory-and-swap",
          suggestionsLabel: "Memory commands",
          suggestions: [
            { command: "free -h", label: "free -h" },
            { command: "vmstat 1 5", label: "vmstat 1 5" },
            { command: "cat /proc/meminfo", label: "/proc/meminfo" },
            { command: "top", label: "top" },
            { command: "ps aux --sort=-%mem", label: "ps aux" },
            { command: "swapon --show", label: "swapon --show" },
            { command: "help", label: "help" },
          ],
        },
      ],
    },
    {
      id: "troubleshooting-lab",
      title: "Troubleshooting Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work through five fictional memory incidents. Match symptoms and simulated metrics to the best diagnostic reasoning.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-practice",
        },
      ],
    },
    {
      id: "allocation-exercise",
      title: "Allocation Exercise",
      blocks: [
        {
          type: "paragraph",
          text: "Interactively allocate and release memory for fictional applications. Observe cache reclaim, pressure levels, and swap activity in real time.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-allocation-lab",
        },
      ],
    },
    {
      id: "final-investigation",
      title: "Final Investigation",
      blocks: [
        {
          type: "paragraph",
          text: "Walk through a structured multi-step investigation of a fictional server showing slow response times. Apply everything you have learned — available vs. free, page faults, swap activity, and process RSS.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-assessment",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Ten questions covering all major memory and swap concepts from this lesson.",
        },
        {
          type: "exercise",
          id: "memory-and-swap-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Linux memory management is designed to maximize RAM utilization through aggressive caching. The key takeaways:",
        },
        {
          type: "list",
          items: [
            "Use **available** (MemAvailable), not **free**, to assess real memory headroom",
            "High buff/cache with high available is **normal** — page cache is reclaimable on demand",
            "Major page faults + elevated si/so + declining available = genuine memory pressure",
            "Swap **allocated** (zero si/so) differs from swap **thrashing** (high si/so rates)",
            "Use RSS for physical memory consumption; VSZ includes virtual ranges not yet in RAM",
            "A memory leak shows monotonically growing RSS that never releases between workload cycles",
            "The OOM killer fires only when both RAM and swap are exhausted after reclaim attempts",
          ],
        },
        {
          type: "callout",
          title: "Next up: Disk I/O Performance",
          text: "In [Disk I/O Performance](/learn/performance/disk-io-performance), you will learn to measure disk throughput, IOPS, and latency — and how disk bottlenecks appear in both I/O wait metrics and memory swap activity.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
