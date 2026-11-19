import type { LessonStatus } from "@/types/lesson";

export const PERFORMANCE_LESSON_SLUGS = [
  "fundamentals",
  "cpu-monitoring",
  "memory-and-swap",
  "disk-io-performance",
  "process-performance",
  "system-load-bottlenecks",
  "network-performance",
  "logs-and-performance-diagnosis",
  "boot-performance",
  "application-performance",
  "performance-optimization",
  "challenge",
] as const;

export type PerformanceLessonSlug = (typeof PERFORMANCE_LESSON_SLUGS)[number];

export type PerformanceLesson = {
  number: number;
  slug: PerformanceLessonSlug;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  status: LessonStatus;
  topics: readonly string[];
  /** Planned learning outcomes — shown when the lesson is implemented. */
  objectives: readonly string[];
  /** Planned lesson route — omitted from links while status is coming-soon. */
  href?: `/learn/performance/${PerformanceLessonSlug}`;
};

export const performancePath = {
  slug: "performance",
  number: 5,
  eyebrow: "STAGE 05",
  title: "Linux Performance and Troubleshooting",
  badge: "ADVANCED",
  description:
    "Learn how to monitor Linux system resources, diagnose performance bottlenecks, troubleshoot common system problems, and improve overall system performance through practical exercises and safe simulations.",
  level: "Advanced",
  lessonCount: 12,
  estimatedTime: "About 5–8 hours",
  status: "available" as const satisfies LessonStatus,
  seoTitle: "Linux Performance and Troubleshooting — Rean Linux",
  seoDescription:
    "Learn Linux performance and troubleshooting: CPU, memory, disk I/O, process tuning, load analysis, network metrics, boot timing, and optimization — in safe frontend simulations.",
} as const;

export const performanceLessons: readonly PerformanceLesson[] = [
  {
    number: 1,
    slug: "fundamentals",
    title: "Linux Performance Fundamentals",
    description:
      "Learn performance metrics and system bottlenecks across CPU, memory, disk, and network.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "available",
    href: "/learn/performance/fundamentals",
    topics: [
      "Performance metrics",
      "Bottlenecks",
      "CPU",
      "Memory",
      "Disk",
      "Network",
      "Latency",
      "Throughput",
      "Utilization",
    ],
    objectives: [
      "Identify the four common resource dimensions that drive Linux performance",
      "Distinguish latency, throughput, and utilization in practical terms",
      "Recognize what a bottleneck means for end-user and system behavior",
      "Follow a systematic investigate-before-optimize troubleshooting workflow",
    ],
  },
  {
    number: 2,
    slug: "cpu-monitoring",
    title: "CPU Monitoring and Analysis",
    description:
      "Interpret CPU utilization and load, including user, system, idle, and I/O wait time.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "available",
    href: "/learn/performance/cpu-monitoring",
    topics: [
      "CPU utilization",
      "Load average",
      "User time",
      "System time",
      "Idle",
      "I/O wait",
      "top",
      "htop",
      "mpstat",
      "lscpu",
    ],
    objectives: [
      "Read CPU utilization breakdowns and explain what each state means",
      "Relate load average to runnable and blocked work",
      "Practice interpreting simulated top, htop, mpstat, and lscpu output",
    ],
  },
  {
    number: 3,
    slug: "memory-and-swap",
    title: "Memory and Swap Management",
    description:
      "Understand RAM, buffers, cache, available memory, swap usage, and memory pressure.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/memory-and-swap",
    topics: [
      "RAM",
      "Buffers",
      "Cache",
      "Available memory",
      "Swap",
      "Memory pressure",
      "free",
      "vmstat",
      "/proc/meminfo",
    ],
    objectives: [
      "Explain how free, used, buffer, and cache memory relate on Linux",
      "Detect swap pressure and decide when it indicates a real problem",
      "Interpret simulated free, vmstat, and /proc/meminfo output",
    ],
  },
  {
    number: 4,
    slug: "disk-io-performance",
    title: "Disk I/O Performance",
    description:
      "Measure disk throughput and IOPS, and recognize I/O latency and storage bottlenecks.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/disk-io-performance",
    topics: [
      "Throughput",
      "IOPS",
      "I/O latency",
      "Disk bottlenecks",
      "iostat",
      "iotop",
      "lsblk",
    ],
    objectives: [
      "Distinguish throughput, IOPS, and latency for storage workloads",
      "Spot saturated disks and wait-heavy I/O patterns",
      "Practice reading simulated iostat, iotop, and lsblk output",
    ],
  },
  {
    number: 5,
    slug: "process-performance",
    title: "Process Performance Troubleshooting",
    description:
      "Investigate process states and resource consumption for CPU- and memory-heavy workloads.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/process-performance",
    topics: [
      "Process states",
      "Resource consumption",
      "CPU-intensive processes",
      "Memory-intensive processes",
      "ps",
      "top",
      "nice",
      "renice",
    ],
    objectives: [
      "Locate processes that dominate CPU or memory",
      "Interpret process state signals during performance incidents",
      "Use simulated ps, top, nice, and renice workflows safely",
    ],
  },
  {
    number: 6,
    slug: "system-load-bottlenecks",
    title: "System Load and Resource Bottlenecks",
    description:
      "Interpret load average and distinguish CPU-bound versus I/O-bound saturation.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/system-load-bottlenecks",
    topics: [
      "Load average",
      "CPU-bound",
      "I/O-bound",
      "Resource saturation",
      "Bottleneck identification",
    ],
    objectives: [
      "Interpret load average in context of CPU count and wait states",
      "Classify workloads as CPU-bound or I/O-bound from evidence",
      "Identify which resource is saturated before proposing a fix",
    ],
  },
  {
    number: 7,
    slug: "network-performance",
    title: "Network Performance Troubleshooting",
    description:
      "Diagnose latency, packet loss, and throughput using connection and interface statistics.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/network-performance",
    topics: [
      "Latency",
      "Packet loss",
      "Throughput",
      "Interface statistics",
      "ping",
      "ss",
      "ip",
      "iperf3",
    ],
    objectives: [
      "Separate latency, loss, and throughput as different network symptoms",
      "Read connection and interface counters for abnormal patterns",
      "Interpret simulated ping, ss, ip, and iperf3 output",
    ],
  },
  {
    number: 8,
    slug: "logs-and-performance-diagnosis",
    title: "System Logs and Performance Diagnosis",
    description:
      "Find performance-related errors and correlate logs with resource metrics.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/logs-and-performance-diagnosis",
    topics: [
      "Performance-related errors",
      "Log correlation",
      "journal",
      "Kernel logs",
      "Evidence timeline",
    ],
    objectives: [
      "Spot log messages that explain resource pressure or failures",
      "Correlate journal and kernel evidence with metric timelines",
      "Build a diagnosis from logs plus performance counters",
    ],
  },
  {
    number: 9,
    slug: "boot-performance",
    title: "Boot Performance and Startup Troubleshooting",
    description:
      "Understand boot sequence fundamentals, startup services, and boot diagnostics.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/boot-performance",
    topics: [
      "Boot sequence",
      "Startup services",
      "Dependencies",
      "systemd-analyze",
      "Boot diagnostics",
    ],
    objectives: [
      "Explain the major phases of a Linux boot sequence",
      "Identify slow services and dependency chains at startup",
      "Interpret simulated systemd-analyze and related boot diagnostics",
    ],
  },
  {
    number: 10,
    slug: "application-performance",
    title: "Application Performance Troubleshooting",
    description:
      "Investigate slow applications, service bottlenecks, and dependency-related delays.",
    duration: "25–30 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/application-performance",
    topics: [
      "Slow applications",
      "Service bottlenecks",
      "Resource consumption",
      "Dependency analysis",
      "Health metrics",
    ],
    objectives: [
      "Trace application slowness to resource or dependency causes",
      "Compare service health signals with host-level metrics",
      "Practice reading simulated application performance evidence",
    ],
  },
  {
    number: 11,
    slug: "performance-optimization",
    title: "Linux Performance Optimization",
    description:
      "Apply safe optimization strategies, tune services, and measure before-and-after results.",
    duration: "30–40 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/performance-optimization",
    topics: [
      "Optimization strategies",
      "Service tuning",
      "Process tuning",
      "Safe configuration",
      "Before and after measurement",
    ],
    objectives: [
      "Choose optimization strategies that match the diagnosed bottleneck",
      "Apply safe, reversible configuration improvements in simulation",
      "Measure performance before and after a change to verify impact",
    ],
  },
  {
    number: 12,
    slug: "challenge",
    title: "Linux Performance and Troubleshooting Challenge",
    description:
      "Run an integrated performance investigation: find bottlenecks, diagnose incidents, apply fixes, and verify results.",
    duration: "40–50 min",
    difficulty: "Advanced",
    status: "coming-soon",
    href: "/learn/performance/challenge",
    topics: [
      "Integrated investigation",
      "Bottleneck identification",
      "Incident diagnosis",
      "Simulated improvements",
      "Verification",
    ],
    objectives: [
      "Investigate a multi-symptom performance incident end to end",
      "Identify the primary bottleneck and supporting evidence",
      "Apply simulated improvements and verify whether performance improved",
    ],
  },
];
