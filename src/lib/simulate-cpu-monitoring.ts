/**
 * Frontend-only CPU monitoring simulation for Stage 05 Lesson 2.
 * Never reads host CPU information, processes, or priorities.
 * Never executes real shell commands or waits on real timers.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_CPU_USER = "bunsal";
export const SIMULATED_CPU_HOST = "cpu-lab";

export type CpuConditionId =
  | "idle"
  | "normal"
  | "high-cpu"
  | "saturation"
  | "io-wait"
  | "multi-core"
  | "single-core"
  | "steal";

export type MetricStatus = "normal" | "warning" | "critical";

export type SimulatedCpuProcess = {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  nice: number;
  priority: number;
  state: string;
  command: string;
};

export type PerCpuSample = {
  index: number;
  user: number;
  system: number;
  nice: number;
  idle: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
  /** Busy percent = 100 - idle (approx). */
  utilization: number;
};

export type SimulatedCpuState = {
  conditionId: CpuConditionId;
  hostname: string;
  uptimeHuman: string;
  clockTime: string;
  usersLoggedIn: number;
  modelName: string;
  architecture: string;
  physicalCores: number;
  logicalCpus: number;
  threadsPerCore: number;
  sockets: number;
  cpuUtilizationPercent: number;
  cpuUserPercent: number;
  cpuSystemPercent: number;
  cpuNicePercent: number;
  cpuIdlePercent: number;
  cpuIowaitPercent: number;
  cpuIrqPercent: number;
  cpuSoftirqPercent: number;
  cpuStealPercent: number;
  loadAvg: readonly [number, number, number];
  contextSwitchesPerSec: number;
  interruptsPerSec: number;
  runnableTasks: number;
  blockedTasks: number;
  perCpu: readonly PerCpuSample[];
  /** Recent overall CPU utilization samples for a simple historical chart. */
  history: readonly number[];
  processes: SimulatedCpuProcess[];
  appResponseMs: number;
  interpretation: string;
};

export type CpuConditionMeta = {
  id: CpuConditionId;
  label: string;
  symptom: string;
  rootCause: string;
  /** Shown on the interactive dashboard condition switcher. */
  dashboard: boolean;
};

export type SimulateCpuResult = {
  result: SimulateResult;
  state: SimulatedCpuState;
};

export const CPU_CONDITIONS: readonly CpuConditionMeta[] = [
  {
    id: "idle",
    label: "Idle Server",
    symptom: "Near-idle CPUs with load well below logical CPU count.",
    rootCause: "Baseline quiet host with spare capacity.",
    dashboard: true,
  },
  {
    id: "normal",
    label: "Normal Workload",
    symptom:
      "Moderate utilization; load near logical CPU count is not required.",
    rootCause: "Typical mixed application traffic on a healthy host.",
    dashboard: true,
  },
  {
    id: "high-cpu",
    label: "High CPU Usage",
    symptom: "Elevated user time and rising response time.",
    rootCause: "`node` and `java` consume most CPU cycles.",
    dashboard: true,
  },
  {
    id: "saturation",
    label: "CPU Saturation",
    symptom: "Near-100% busy CPUs; load far above logical CPU count.",
    rootCause: "Multiple compute-heavy processes keep all CPUs runnable.",
    dashboard: true,
  },
  {
    id: "io-wait",
    label: "High I/O Wait",
    symptom: "Moderate CPU busy time but unusually high %wa and blocked tasks.",
    rootCause: "`backup-worker` saturates storage; CPUs wait on disk.",
    dashboard: true,
  },
  {
    id: "multi-core",
    label: "Multi-Core Workload",
    symptom: "Work spread across logical CPUs with balanced utilization.",
    rootCause: "Multi-threaded services keep several cores busy evenly.",
    dashboard: true,
  },
  {
    id: "single-core",
    label: "Single-Core Bottleneck",
    symptom: "One logical CPU pegged while others stay mostly idle.",
    rootCause: "A single-threaded worker cannot use remaining cores.",
    dashboard: true,
  },
  {
    id: "steal",
    label: "CPU Steal Time",
    symptom: "Elevated %st on a virtual machine with delayed response time.",
    rootCause:
      "Hypervisor contention — guest is not receiving requested CPU time.",
    dashboard: false,
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  hostname                          Show the simulated hostname",
  "  nproc                             Show logical CPU count",
  "  lscpu                             Show CPU architecture summary",
  "  uptime                            Show uptime and load averages",
  "  top                               Show CPU / process snapshot",
  "  htop                              Show an htop-style snapshot",
  "  mpstat                            Show per-CPU utilization",
  "  mpstat -P ALL                     Show all logical CPU lines",
  "  vmstat                             Show activity summary",
  "  vmstat 1 5                        Show five predefined samples",
  "  ps aux                            List processes",
  "  ps aux --sort=-%cpu               Sort by CPU (descending)",
  "  renice <nice> -p <pid>            Change simulated nice value",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  lscpu",
  "  top",
  "  mpstat -P ALL",
  "  ps aux --sort=-%cpu",
  "  renice 10 -p 4521",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function sumBusy(parts: {
  user: number;
  system: number;
  nice: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
}): number {
  return (
    parts.user +
    parts.system +
    parts.nice +
    parts.iowait +
    parts.irq +
    parts.softirq +
    parts.steal
  );
}

function makePerCpu(
  logicalCpus: number,
  overall: {
    user: number;
    system: number;
    nice: number;
    idle: number;
    iowait: number;
    irq: number;
    softirq: number;
    steal: number;
  },
  pattern: "even" | "single-hot" | "spread" = "even",
): PerCpuSample[] {
  const samples: PerCpuSample[] = [];
  for (let i = 0; i < logicalCpus; i += 1) {
    let factor = 1;
    if (pattern === "single-hot") {
      factor = i === 0 ? 3.4 : 0.18;
    } else if (pattern === "spread") {
      factor = 0.85 + (i % 3) * 0.12;
    }

    const user = clampPercent(overall.user * factor);
    const system = clampPercent(overall.system * factor);
    const nice = clampPercent(overall.nice * factor);
    const iowait = clampPercent(overall.iowait * factor);
    const irq = clampPercent(overall.irq * factor);
    const softirq = clampPercent(overall.softirq * factor);
    const steal = clampPercent(overall.steal * factor);
    const busy = sumBusy({
      user,
      system,
      nice,
      iowait,
      irq,
      softirq,
      steal,
    });
    const idle =
      pattern === "single-hot" && i === 0
        ? clampPercent(Math.max(0, 100 - busy))
        : pattern === "single-hot"
          ? clampPercent(Math.min(100, 100 - busy * 0.4))
          : clampPercent(Math.max(0, 100 - busy));

    samples.push({
      index: i,
      user,
      system,
      nice,
      idle,
      iowait,
      irq,
      softirq,
      steal,
      utilization: clampPercent(100 - idle),
    });
  }
  return samples;
}

function makeHistory(points: readonly number[]): number[] {
  return points.map((point) => clampPercent(point));
}

function baseProcesses(): SimulatedCpuProcess[] {
  return [
    {
      pid: 1,
      user: "root",
      cpu: 0.0,
      mem: 0.1,
      nice: 0,
      priority: 20,
      state: "S",
      command: "systemd",
    },
    {
      pid: 420,
      user: "root",
      cpu: 0.1,
      mem: 0.2,
      nice: 0,
      priority: 20,
      state: "S",
      command: "sshd",
    },
    {
      pid: 1104,
      user: "www-data",
      cpu: 1.2,
      mem: 1.8,
      nice: 0,
      priority: 20,
      state: "S",
      command: "nginx",
    },
    {
      pid: 1840,
      user: "postgres",
      cpu: 2.4,
      mem: 8.5,
      nice: 0,
      priority: 20,
      state: "S",
      command: "postgres",
    },
    {
      pid: 2210,
      user: "app",
      cpu: 3.1,
      mem: 6.2,
      nice: 0,
      priority: 20,
      state: "S",
      command: "node",
    },
    {
      pid: 2388,
      user: "app",
      cpu: 2.0,
      mem: 12.4,
      nice: 0,
      priority: 20,
      state: "S",
      command: "java",
    },
    {
      pid: 2501,
      user: "redis",
      cpu: 0.8,
      mem: 2.1,
      nice: 0,
      priority: 20,
      state: "S",
      command: "redis",
    },
    {
      pid: 3100,
      user: "backup",
      cpu: 0.2,
      mem: 1.0,
      nice: 10,
      priority: 30,
      state: "S",
      command: "backup-worker",
    },
  ];
}

function cloneState(state: SimulatedCpuState): SimulatedCpuState {
  return {
    ...state,
    loadAvg: [...state.loadAvg] as [number, number, number],
    perCpu: state.perCpu.map((sample) => ({ ...sample })),
    history: [...state.history],
    processes: state.processes.map((process) => ({ ...process })),
  };
}

function buildState(
  conditionId: CpuConditionId,
  overrides: Partial<SimulatedCpuState> & { interpretation: string },
): SimulatedCpuState {
  const logicalCpus = overrides.logicalCpus ?? 4;
  const physicalCores = overrides.physicalCores ?? 2;
  const overall = {
    user: overrides.cpuUserPercent ?? 4,
    system: overrides.cpuSystemPercent ?? 1,
    nice: overrides.cpuNicePercent ?? 0,
    idle: overrides.cpuIdlePercent ?? 94,
    iowait: overrides.cpuIowaitPercent ?? 1,
    irq: overrides.cpuIrqPercent ?? 0,
    softirq: overrides.cpuSoftirqPercent ?? 0,
    steal: overrides.cpuStealPercent ?? 0,
  };

  return {
    conditionId,
    hostname: SIMULATED_CPU_HOST,
    uptimeHuman: "6 days, 3:42",
    clockTime: "11:18:04",
    usersLoggedIn: 2,
    modelName: "Rean Virtual CPU @ 2.40GHz",
    architecture: "x86_64",
    physicalCores,
    logicalCpus,
    threadsPerCore: overrides.threadsPerCore ?? 2,
    sockets: overrides.sockets ?? 1,
    cpuUtilizationPercent:
      overrides.cpuUtilizationPercent ??
      clampPercent(100 - (overrides.cpuIdlePercent ?? 94)),
    cpuUserPercent: overall.user,
    cpuSystemPercent: overall.system,
    cpuNicePercent: overall.nice,
    cpuIdlePercent: overall.idle,
    cpuIowaitPercent: overall.iowait,
    cpuIrqPercent: overall.irq,
    cpuSoftirqPercent: overall.softirq,
    cpuStealPercent: overall.steal,
    loadAvg: overrides.loadAvg ?? [0.18, 0.22, 0.2],
    contextSwitchesPerSec: overrides.contextSwitchesPerSec ?? 320,
    interruptsPerSec: overrides.interruptsPerSec ?? 180,
    runnableTasks: overrides.runnableTasks ?? 1,
    blockedTasks: overrides.blockedTasks ?? 0,
    perCpu: overrides.perCpu ?? makePerCpu(logicalCpus, overall, "even"),
    history:
      overrides.history ?? makeHistory([5, 4, 6, 5, 7, 4, 5, 6, 5, 4, 5, 6]),
    processes: overrides.processes ?? baseProcesses(),
    appResponseMs: overrides.appResponseMs ?? 72,
    interpretation: overrides.interpretation,
  };
}

function idleState(): SimulatedCpuState {
  return buildState("idle", {
    cpuUtilizationPercent: 3,
    cpuUserPercent: 2,
    cpuSystemPercent: 1,
    cpuNicePercent: 0,
    cpuIdlePercent: 96,
    cpuIowaitPercent: 1,
    cpuIrqPercent: 0,
    cpuSoftirqPercent: 0,
    cpuStealPercent: 0,
    loadAvg: [0.08, 0.12, 0.15],
    contextSwitchesPerSec: 210,
    interruptsPerSec: 140,
    runnableTasks: 0,
    blockedTasks: 0,
    history: makeHistory([4, 3, 5, 2, 4, 3, 2, 4, 3, 5, 2, 3]),
    appResponseMs: 48,
    interpretation:
      "Idle capacity: most time is %id. Load is far below 4 logical CPUs — spare CPU capacity is available.",
  });
}

function normalState(): SimulatedCpuState {
  const processes = baseProcesses();
  return buildState("normal", {
    cpuUtilizationPercent: 28,
    cpuUserPercent: 18,
    cpuSystemPercent: 6,
    cpuNicePercent: 1,
    cpuIdlePercent: 72,
    cpuIowaitPercent: 2,
    cpuIrqPercent: 0.5,
    cpuSoftirqPercent: 0.5,
    cpuStealPercent: 0,
    loadAvg: [1.15, 1.02, 0.88],
    contextSwitchesPerSec: 890,
    interruptsPerSec: 420,
    runnableTasks: 1,
    blockedTasks: 0,
    history: makeHistory([22, 26, 24, 30, 28, 25, 29, 27, 31, 26, 28, 27]),
    processes,
    appResponseMs: 110,
    interpretation:
      "Healthy mixed workload. Utilization is moderate; load stays below logical CPU count. High utilization alone is not required for a problem — compare to capacity and user latency.",
  });
}

function highCpuState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "node") {
      return { ...process, cpu: 48.5, state: "R", mem: 7.4 };
    }
    if (process.command === "java") {
      return { ...process, cpu: 31.2, state: "R", mem: 14.1 };
    }
    if (process.command === "postgres") {
      return { ...process, cpu: 8.4, state: "S" };
    }
    return process;
  });

  return buildState("high-cpu", {
    cpuUtilizationPercent: 78,
    cpuUserPercent: 62,
    cpuSystemPercent: 12,
    cpuNicePercent: 1,
    cpuIdlePercent: 22,
    cpuIowaitPercent: 2,
    cpuIrqPercent: 0.5,
    cpuSoftirqPercent: 0.5,
    cpuStealPercent: 0,
    loadAvg: [3.42, 2.9, 2.1],
    contextSwitchesPerSec: 2400,
    interruptsPerSec: 980,
    runnableTasks: 3,
    blockedTasks: 0,
    history: makeHistory([55, 62, 68, 71, 74, 76, 79, 77, 80, 78, 81, 78]),
    processes,
    appResponseMs: 420,
    interpretation:
      "High user time (%us) with rising load. Still some idle capacity, but CPU is the dominant host pressure — inspect top CPU processes next.",
  });
}

function saturationState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "node") {
      return { ...process, cpu: 92.0, state: "R", mem: 8.1 };
    }
    if (process.command === "java") {
      return { ...process, cpu: 88.4, state: "R", mem: 15.2 };
    }
    if (process.command === "postgres") {
      return { ...process, cpu: 42.1, state: "R" };
    }
    if (process.command === "nginx") {
      return { ...process, cpu: 18.6, state: "R" };
    }
    return process;
  });

  return buildState("saturation", {
    cpuUtilizationPercent: 97,
    cpuUserPercent: 78,
    cpuSystemPercent: 16,
    cpuNicePercent: 1,
    cpuIdlePercent: 2,
    cpuIowaitPercent: 1,
    cpuIrqPercent: 1,
    cpuSoftirqPercent: 1,
    cpuStealPercent: 0,
    loadAvg: [8.65, 7.4, 5.2],
    contextSwitchesPerSec: 5200,
    interruptsPerSec: 1600,
    runnableTasks: 7,
    blockedTasks: 0,
    history: makeHistory([88, 91, 94, 96, 97, 98, 97, 96, 98, 97, 99, 97]),
    processes,
    appResponseMs: 980,
    interpretation:
      "CPU saturation on 4 logical CPUs: nearly no idle time, load ≫ 4, many runnable tasks. Queues grow and latency rises — capacity is exhausted.",
  });
}

function ioWaitState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "backup-worker") {
      return {
        ...process,
        cpu: 6.5,
        state: "D",
        nice: 10,
        priority: 30,
        mem: 3.2,
      };
    }
    if (process.command === "postgres") {
      return { ...process, cpu: 4.2, state: "D" };
    }
    if (process.command === "node") {
      return { ...process, cpu: 5.1, state: "S" };
    }
    return process;
  });

  return buildState("io-wait", {
    cpuUtilizationPercent: 42,
    cpuUserPercent: 12,
    cpuSystemPercent: 8,
    cpuNicePercent: 2,
    cpuIdlePercent: 38,
    cpuIowaitPercent: 38,
    cpuIrqPercent: 1,
    cpuSoftirqPercent: 1,
    cpuStealPercent: 0,
    loadAvg: [6.8, 5.9, 4.1],
    contextSwitchesPerSec: 3100,
    interruptsPerSec: 2200,
    runnableTasks: 1,
    blockedTasks: 5,
    history: makeHistory([30, 34, 38, 40, 42, 45, 41, 43, 44, 42, 46, 42]),
    perCpu: makePerCpu(
      4,
      {
        user: 12,
        system: 8,
        nice: 2,
        idle: 38,
        iowait: 38,
        irq: 1,
        softirq: 1,
        steal: 0,
      },
      "even",
    ),
    processes,
    appResponseMs: 1450,
    interpretation:
      "High %wa with many blocked (D) tasks elevates load even though CPUs are not fully busy computing. Suspect disk I/O contention — not classic CPU saturation.",
  });
}

function multiCoreState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "node") {
      return { ...process, cpu: 22.4, state: "R" };
    }
    if (process.command === "java") {
      return { ...process, cpu: 24.1, state: "R" };
    }
    if (process.command === "postgres") {
      return { ...process, cpu: 18.6, state: "R" };
    }
    if (process.command === "nginx") {
      return { ...process, cpu: 12.2, state: "S" };
    }
    if (process.command === "redis") {
      return { ...process, cpu: 9.8, state: "R" };
    }
    return process;
  });

  return buildState("multi-core", {
    logicalCpus: 8,
    physicalCores: 4,
    threadsPerCore: 2,
    cpuUtilizationPercent: 55,
    cpuUserPercent: 42,
    cpuSystemPercent: 9,
    cpuNicePercent: 1,
    cpuIdlePercent: 45,
    cpuIowaitPercent: 2,
    cpuIrqPercent: 0.5,
    cpuSoftirqPercent: 0.5,
    cpuStealPercent: 0,
    loadAvg: [4.2, 3.9, 3.4],
    contextSwitchesPerSec: 4100,
    interruptsPerSec: 1500,
    runnableTasks: 4,
    blockedTasks: 0,
    history: makeHistory([48, 52, 50, 55, 54, 56, 53, 57, 55, 54, 56, 55]),
    perCpu: makePerCpu(
      8,
      {
        user: 42,
        system: 9,
        nice: 1,
        idle: 45,
        iowait: 2,
        irq: 0.5,
        softirq: 0.5,
        steal: 0,
      },
      "spread",
    ),
    processes,
    appResponseMs: 180,
    interpretation:
      "Multi-threaded work keeps several logical CPUs busy in a balanced way. Load ~4 on 8 logical CPUs still leaves headroom.",
  });
}

function singleCoreState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "java") {
      return { ...process, cpu: 99.2, state: "R", mem: 16.8 };
    }
    if (process.command === "node") {
      return { ...process, cpu: 2.1, state: "S" };
    }
    if (process.command === "postgres") {
      return { ...process, cpu: 1.4, state: "S" };
    }
    return process;
  });

  return buildState("single-core", {
    cpuUtilizationPercent: 28,
    cpuUserPercent: 24,
    cpuSystemPercent: 3,
    cpuNicePercent: 0,
    cpuIdlePercent: 72,
    cpuIowaitPercent: 1,
    cpuIrqPercent: 0,
    cpuSoftirqPercent: 0,
    cpuStealPercent: 0,
    loadAvg: [1.35, 1.2, 0.95],
    contextSwitchesPerSec: 780,
    interruptsPerSec: 360,
    runnableTasks: 1,
    blockedTasks: 0,
    history: makeHistory([24, 26, 25, 28, 27, 29, 28, 27, 30, 28, 29, 28]),
    perCpu: makePerCpu(
      4,
      {
        user: 24,
        system: 3,
        nice: 0,
        idle: 72,
        iowait: 1,
        irq: 0,
        softirq: 0,
        steal: 0,
      },
      "single-hot",
    ),
    processes,
    appResponseMs: 760,
    interpretation:
      "Overall utilization looks moderate, but CPU0 is pegged. A single-threaded bottleneck cannot use idle cores — mpstat -P ALL reveals the imbalance.",
  });
}

function stealState(): SimulatedCpuState {
  const processes = baseProcesses().map((process) => {
    if (process.command === "node") {
      return { ...process, cpu: 18.4, state: "R" };
    }
    if (process.command === "java") {
      return { ...process, cpu: 14.2, state: "S" };
    }
    return process;
  });

  return buildState("steal", {
    cpuUtilizationPercent: 58,
    cpuUserPercent: 28,
    cpuSystemPercent: 8,
    cpuNicePercent: 0,
    cpuIdlePercent: 32,
    cpuIowaitPercent: 2,
    cpuIrqPercent: 1,
    cpuSoftirqPercent: 1,
    cpuStealPercent: 28,
    loadAvg: [3.8, 3.2, 2.6],
    contextSwitchesPerSec: 1900,
    interruptsPerSec: 800,
    runnableTasks: 3,
    blockedTasks: 0,
    history: makeHistory([40, 45, 48, 52, 55, 58, 56, 60, 57, 59, 61, 58]),
    perCpu: makePerCpu(
      4,
      {
        user: 28,
        system: 8,
        nice: 0,
        idle: 32,
        iowait: 2,
        irq: 1,
        softirq: 1,
        steal: 28,
      },
      "even",
    ),
    processes,
    appResponseMs: 890,
    interpretation:
      "Elevated steal time (%st) means the hypervisor held CPU from this guest. Guest processes may look “busy waiting” while the host is oversubscribed.",
  });
}

export function formatCpuMonitoringPrompt(): string {
  return `${SIMULATED_CPU_USER}@${SIMULATED_CPU_HOST}:~$`;
}

export const DEFAULT_CPU_MONITORING_SUGGESTIONS = [
  "lscpu",
  "uptime",
  "top",
  "htop",
  "mpstat -P ALL",
  "ps aux --sort=-%cpu",
  "vmstat 1 5",
  "help",
] as const;

export function isCpuConditionId(value: string): value is CpuConditionId {
  return CPU_CONDITIONS.some((condition) => condition.id === value);
}

export function getCpuCondition(id: CpuConditionId): CpuConditionMeta {
  const found = CPU_CONDITIONS.find((condition) => condition.id === id);
  return found ?? CPU_CONDITIONS[0]!;
}

export function getDashboardCpuConditions(): readonly CpuConditionMeta[] {
  return CPU_CONDITIONS.filter((condition) => condition.dashboard);
}

export function createInitialCpuState(
  conditionId: CpuConditionId = "normal",
): SimulatedCpuState {
  switch (conditionId) {
    case "idle":
      return idleState();
    case "high-cpu":
      return highCpuState();
    case "saturation":
      return saturationState();
    case "io-wait":
      return ioWaitState();
    case "multi-core":
      return multiCoreState();
    case "single-core":
      return singleCoreState();
    case "steal":
      return stealState();
    case "normal":
    default:
      return normalState();
  }
}

export function cpuMetricStatus(
  kind:
    | "cpu"
    | "load"
    | "iowait"
    | "steal"
    | "idle"
    | "context-switches"
    | "app-response",
  state: SimulatedCpuState,
): MetricStatus {
  switch (kind) {
    case "cpu":
      if (state.cpuUtilizationPercent >= 90) return "critical";
      if (state.cpuUtilizationPercent >= 70) return "warning";
      return "normal";
    case "load":
      if (state.loadAvg[0] > state.logicalCpus * 1.5) return "critical";
      if (state.loadAvg[0] > state.logicalCpus) return "warning";
      return "normal";
    case "iowait":
      if (state.cpuIowaitPercent >= 25) return "critical";
      if (state.cpuIowaitPercent >= 10) return "warning";
      return "normal";
    case "steal":
      if (state.cpuStealPercent >= 15) return "critical";
      if (state.cpuStealPercent >= 5) return "warning";
      return "normal";
    case "idle":
      if (state.cpuIdlePercent <= 5) return "critical";
      if (state.cpuIdlePercent <= 20) return "warning";
      return "normal";
    case "context-switches":
      if (state.contextSwitchesPerSec >= 4000) return "warning";
      return "normal";
    case "app-response":
      if (state.appResponseMs >= 800) return "critical";
      if (state.appResponseMs >= 300) return "warning";
      return "normal";
    default:
      return "normal";
  }
}

/** Educational load interpretation helpers for 2/4/8 logical CPU examples. */
export function loadRelativeToCpus(
  load: number,
  logicalCpus: number,
): "low" | "near-capacity" | "oversubscribed" {
  if (load < logicalCpus * 0.7) return "low";
  if (load <= logicalCpus * 1.1) return "near-capacity";
  return "oversubscribed";
}

export const LOAD_AVERAGE_EXAMPLES = [
  {
    logicalCpus: 2,
    load1: 0.4,
    meaning: "Load 0.40 on 2 CPUs is light — spare capacity remains.",
  },
  {
    logicalCpus: 2,
    load1: 2.8,
    meaning:
      "Load 2.80 on 2 CPUs means demand exceeds capacity; queues are likely.",
  },
  {
    logicalCpus: 4,
    load1: 3.2,
    meaning:
      "Load 3.20 on 4 CPUs is near capacity but not automatically broken.",
  },
  {
    logicalCpus: 4,
    load1: 8.5,
    meaning:
      "Load 8.50 on 4 CPUs is oversubscribed — combine with %us/%wa/%st to see why.",
  },
  {
    logicalCpus: 8,
    load1: 4.1,
    meaning:
      "Load 4.10 on 8 CPUs still leaves headroom for more runnable work.",
  },
  {
    logicalCpus: 8,
    load1: 14.0,
    meaning:
      "Load 14 on 8 CPUs is high; check whether tasks are runnable (CPU) or blocked (I/O).",
  },
] as const;

function pad(value: string | number, width: number): string {
  const text = String(value);
  if (text.length >= width) {
    return text;
  }
  return text + " ".repeat(width - text.length);
}

function padStart(value: string | number, width: number): string {
  const text = String(value);
  if (text.length >= width) {
    return text;
  }
  return " ".repeat(width - text.length) + text;
}

function formatLoad(value: number): string {
  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return value.toFixed(1);
}

function formatUptime(state: SimulatedCpuState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  return [
    ` ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
  ];
}

function formatLscpu(state: SimulatedCpuState): string[] {
  return [
    `Architecture:                            ${state.architecture}`,
    `CPU(s):                                  ${state.logicalCpus}`,
    `On-line CPU(s) list:                     0-${state.logicalCpus - 1}`,
    `Thread(s) per core:                      ${state.threadsPerCore}`,
    `Core(s) per socket:                      ${state.physicalCores}`,
    `Socket(s):                               ${state.sockets}`,
    `Model name:                              ${state.modelName}`,
    `Hypervisor vendor:                       ReanSim`,
    `Virtualization type:                     full`,
    "",
    "(simulated lscpu — fictional CPU topology, not your host)",
  ];
}

function formatTop(state: SimulatedCpuState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  const byCpu = [...state.processes].sort((a, b) => b.cpu - a.cpu);
  const lines = [
    `top - ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
    `Tasks: ${state.processes.length} total,   ${state.runnableTasks} running,   ${state.processes.length - state.runnableTasks - state.blockedTasks} sleeping,   ${state.blockedTasks} blocked`,
    `%Cpu(s): ${padStart(state.cpuUserPercent.toFixed(1), 5)} us, ${padStart(state.cpuSystemPercent.toFixed(1), 5)} sy, ${padStart(state.cpuNicePercent.toFixed(1), 5)} ni, ${padStart(state.cpuIdlePercent.toFixed(1), 5)} id, ${padStart(state.cpuIowaitPercent.toFixed(1), 5)} wa, ${padStart(state.cpuIrqPercent.toFixed(1), 5)} hi, ${padStart(state.cpuSoftirqPercent.toFixed(1), 5)} si, ${padStart(state.cpuStealPercent.toFixed(1), 5)} st`,
    "",
    `${pad("PID", 6)} ${pad("USER", 8)} ${pad("NI", 4)} ${pad("PRI", 4)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} ${pad("S", 2)} COMMAND`,
  ];

  for (const process of byCpu) {
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.user, 8)} ${pad(process.nice, 4)} ${pad(process.priority, 4)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)} ${pad(process.state, 2)} ${process.command}`,
    );
  }

  lines.push(
    "",
    `Context switches/s (sim): ${state.contextSwitchesPerSec} · Interrupts/s (sim): ${state.interruptsPerSec}`,
    "(simulated snapshot — not live metrics from your computer)",
  );
  return lines;
}

function formatHtop(state: SimulatedCpuState): string[] {
  const lines = [
    `htop - ${SIMULATED_CPU_HOST} · ${state.logicalCpus} logical CPUs · load ${state.loadAvg.map(formatLoad).join(" ")}`,
  ];

  for (const cpu of state.perCpu) {
    const barWidth = 20;
    const filled = Math.round((cpu.utilization / 100) * barWidth);
    const bar = `${"|".repeat(filled)}${" ".repeat(Math.max(0, barWidth - filled))}`;
    lines.push(
      `CPU${cpu.index}[${bar}] ${padStart(cpu.utilization.toFixed(1), 5)}%`,
    );
  }

  lines.push(
    `Mem[||||||||            ] (simulated)`,
    `Swp[                    ] (simulated)`,
    "",
    `${pad("PID", 6)} ${pad("USER", 8)} ${pad("NI", 4)} ${pad("CPU%", 6)} ${pad("MEM%", 6)} ${pad("S", 2)} Command`,
  );

  const byCpu = [...state.processes].sort((a, b) => b.cpu - a.cpu);
  for (const process of byCpu.slice(0, 8)) {
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.user, 8)} ${pad(process.nice, 4)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)} ${pad(process.state, 2)} ${process.command}`,
    );
  }

  lines.push("", "(simulated htop-style view — educational only)");
  return lines;
}

function formatMpstat(state: SimulatedCpuState, all: boolean): string[] {
  const header =
    "Linux 6.8.0-rean (cpu-lab) \t11/19/2026 \t_x86_64_\t(" +
    `${state.logicalCpus} CPU)`;
  const lines = [
    header,
    "",
    `${pad("CPU", 5)} ${padStart("%usr", 6)} ${padStart("%nice", 6)} ${padStart("%sys", 6)} ${padStart("%iowait", 7)} ${padStart("%irq", 6)} ${padStart("%soft", 6)} ${padStart("%steal", 7)} ${padStart("%idle", 6)}`,
    `all   ${padStart(state.cpuUserPercent.toFixed(2), 6)} ${padStart(state.cpuNicePercent.toFixed(2), 6)} ${padStart(state.cpuSystemPercent.toFixed(2), 6)} ${padStart(state.cpuIowaitPercent.toFixed(2), 7)} ${padStart(state.cpuIrqPercent.toFixed(2), 6)} ${padStart(state.cpuSoftirqPercent.toFixed(2), 6)} ${padStart(state.cpuStealPercent.toFixed(2), 7)} ${padStart(state.cpuIdlePercent.toFixed(2), 6)}`,
  ];

  if (all) {
    for (const cpu of state.perCpu) {
      lines.push(
        `${pad(String(cpu.index), 5)} ${padStart(cpu.user.toFixed(2), 6)} ${padStart(cpu.nice.toFixed(2), 6)} ${padStart(cpu.system.toFixed(2), 6)} ${padStart(cpu.iowait.toFixed(2), 7)} ${padStart(cpu.irq.toFixed(2), 6)} ${padStart(cpu.softirq.toFixed(2), 6)} ${padStart(cpu.steal.toFixed(2), 7)} ${padStart(cpu.idle.toFixed(2), 6)}`,
      );
    }
  }

  lines.push(
    "",
    "(simulated mpstat — compare %usr/%sys/%iowait/%steal/%idle carefully)",
  );
  return lines;
}

function formatVmstat(state: SimulatedCpuState, samples: number): string[] {
  const header =
    "procs -----------memory---------- ---swap-- -----io---- -system-- ----------------------cpu----------------------";
  const columns =
    " r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st";

  const base = {
    r: state.runnableTasks,
    b: state.blockedTasks,
    in: Math.round(state.interruptsPerSec / 10),
    cs: Math.round(state.contextSwitchesPerSec / 10),
    us: Math.round(state.cpuUserPercent),
    sy: Math.round(state.cpuSystemPercent),
    id: Math.round(state.cpuIdlePercent),
    wa: Math.round(state.cpuIowaitPercent),
    st: Math.round(state.cpuStealPercent),
  };

  const lines = [header, columns];
  for (let i = 0; i < samples; i += 1) {
    const jitter = i % 2 === 0 ? 0 : 1;
    lines.push(
      [
        padStart(Math.max(0, base.r + (i % 3 === 0 ? 1 : 0)), 2),
        padStart(base.b, 2),
        padStart(0, 7),
        padStart(2_450_000 - i * 1200, 7),
        padStart(180_000, 6),
        padStart(3_050_000, 6),
        padStart(0, 5),
        padStart(0, 5),
        padStart(state.conditionId === "io-wait" ? 4200 + i * 40 : 18 + i, 5),
        padStart(state.conditionId === "io-wait" ? 6100 + i * 50 : 10 + i, 5),
        padStart(base.in + jitter, 5),
        padStart(base.cs + jitter * 2, 5),
        padStart(base.us, 3),
        padStart(base.sy, 3),
        padStart(base.id, 3),
        padStart(base.wa, 3),
        padStart(base.st, 3),
      ].join(" "),
    );
  }

  if (samples > 1) {
    lines.push(
      "",
      "(predefined simulated samples — returned immediately, no real delay)",
    );
  } else {
    lines.push("", "(simulated vmstat snapshot)");
  }
  return lines;
}

function formatPsAux(state: SimulatedCpuState, sortByCpu: boolean): string[] {
  const processes = sortByCpu
    ? [...state.processes].sort((a, b) => b.cpu - a.cpu)
    : [...state.processes];

  const lines = [
    `${pad("USER", 8)} ${pad("PID", 6)} ${pad("%CPU", 5)} ${pad("%MEM", 5)} ${pad("NI", 4)} ${pad("STAT", 4)} COMMAND`,
  ];

  for (const process of processes) {
    lines.push(
      `${pad(process.user, 8)} ${pad(process.pid, 6)} ${pad(formatPercent(process.cpu), 5)} ${pad(formatPercent(process.mem), 5)} ${pad(process.nice, 4)} ${pad(process.state, 4)} ${process.command}`,
    );
  }

  lines.push(
    "",
    "(simulated ps — fictional processes only; STAT: R=running, S=sleeping, D=uninterruptible I/O)",
  );
  return lines;
}

function parseRenice(command: string): { nice: number; pid: number } | null {
  const match = /^renice\s+(-?\d+)\s+-p\s+(\d+)$/.exec(command);
  if (!match) {
    return null;
  }
  const nice = Number(match[1]);
  const pid = Number(match[2]);
  if (!Number.isFinite(nice) || !Number.isFinite(pid)) {
    return null;
  }
  if (nice < -20 || nice > 19) {
    return null;
  }
  return { nice, pid };
}

function applyRenice(
  state: SimulatedCpuState,
  nice: number,
  pid: number,
): { state: SimulatedCpuState; lines: string[] } {
  const next = cloneState(state);
  const index = next.processes.findIndex((process) => process.pid === pid);
  if (index < 0) {
    return {
      state: next,
      lines: [
        `renice: failed to set priority for ${pid} (process not found in simulation)`,
      ],
    };
  }

  const process = next.processes[index]!;
  next.processes[index] = {
    ...process,
    nice,
    priority: 20 + nice,
  };

  return {
    state: next,
    lines: [
      `${pid}: old priority ${process.priority}, new priority ${20 + nice}`,
      "",
      "(simulated renice — changes only this in-memory process table)",
      "Note: adjusting nice does not automatically fix an underlying performance problem.",
    ],
  };
}

function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function simulateCpuMonitoringCommand(
  raw: string,
  state: SimulatedCpuState,
): SimulateCpuResult {
  let nextState = cloneState(state);
  const command = normalizeCommand(raw);

  if (command === "") {
    return { result: { kind: "empty" }, state: nextState };
  }

  if (command === "clear") {
    return { result: { kind: "clear" }, state: nextState };
  }

  if (command === "help") {
    return {
      result: { kind: "output", lines: [...HELP_OUTPUT] },
      state: nextState,
    };
  }

  if (command === "hostname") {
    return {
      result: { kind: "output", lines: [nextState.hostname] },
      state: nextState,
    };
  }

  if (command === "nproc") {
    return {
      result: { kind: "output", lines: [String(nextState.logicalCpus)] },
      state: nextState,
    };
  }

  if (command === "lscpu") {
    return {
      result: { kind: "output", lines: formatLscpu(nextState) },
      state: nextState,
    };
  }

  if (command === "uptime") {
    return {
      result: { kind: "output", lines: formatUptime(nextState) },
      state: nextState,
    };
  }

  if (command === "top") {
    return {
      result: { kind: "output", lines: formatTop(nextState) },
      state: nextState,
    };
  }

  if (command === "htop") {
    return {
      result: { kind: "output", lines: formatHtop(nextState) },
      state: nextState,
    };
  }

  if (command === "mpstat") {
    return {
      result: { kind: "output", lines: formatMpstat(nextState, false) },
      state: nextState,
    };
  }

  if (command === "mpstat -P ALL" || command === "mpstat -P all") {
    return {
      result: { kind: "output", lines: formatMpstat(nextState, true) },
      state: nextState,
    };
  }

  if (command === "vmstat") {
    return {
      result: { kind: "output", lines: formatVmstat(nextState, 1) },
      state: nextState,
    };
  }

  if (command === "vmstat 1 5") {
    return {
      result: { kind: "output", lines: formatVmstat(nextState, 5) },
      state: nextState,
    };
  }

  if (command === "ps aux") {
    return {
      result: { kind: "output", lines: formatPsAux(nextState, false) },
      state: nextState,
    };
  }

  if (command === "ps aux --sort=-%cpu" || command === "ps aux --sort=-pcpu") {
    return {
      result: { kind: "output", lines: formatPsAux(nextState, true) },
      state: nextState,
    };
  }

  const renice = parseRenice(command);
  if (renice) {
    const applied = applyRenice(nextState, renice.nice, renice.pid);
    nextState = applied.state;
    return {
      result: { kind: "output", lines: applied.lines },
      state: nextState,
    };
  }

  if (command.startsWith("renice ")) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: renice <nice> -p <pid>",
          "Example: renice 10 -p 4521",
          "Nice range in this simulator: -20 to 19",
        ],
      },
      state: nextState,
    };
  }

  if (command.startsWith("nice ")) {
    return {
      result: {
        kind: "output",
        lines: [
          "nice starts a new process with a niceness offset.",
          "In this lesson, practice priority changes with: renice <nice> -p <pid>",
          "Changing priority does not automatically solve the underlying performance problem.",
        ],
      },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state: nextState,
  };
}
