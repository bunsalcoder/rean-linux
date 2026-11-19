/**
 * Frontend-only performance-fundamentals simulation for Stage 05 Lesson 1.
 * Never reads host CPU, memory, disk, network, or process statistics.
 * Never executes real shell commands or waits on real timers.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PERF_USER = "bunsal";
export const SIMULATED_PERF_HOST = "app-lab";

export type PerformanceScenarioId =
  | "healthy"
  | "high-cpu"
  | "memory-pressure"
  | "disk-io"
  | "network-congestion"
  | "application-slowdown";

export type MetricStatus = "normal" | "warning" | "critical";

export type PerformanceMetricTone = MetricStatus;

export type SimulatedPerfProcess = {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  command: string;
  state: string;
};

export type SimulatedPerfMemory = {
  totalMiB: number;
  usedMiB: number;
  freeMiB: number;
  sharedMiB: number;
  buffCacheMiB: number;
  availableMiB: number;
  swapTotalMiB: number;
  swapUsedMiB: number;
  swapFreeMiB: number;
};

export type SimulatedDiskMount = {
  filesystem: string;
  size: string;
  used: string;
  avail: string;
  usePercent: string;
  mountedOn: string;
};

export type SimulatedDiskIo = {
  /** Read throughput in KiB/s. */
  readKiBs: number;
  /** Write throughput in KiB/s. */
  writeKiBs: number;
  /** Approximate IOPS. */
  iops: number;
  /** Average service time in ms. */
  awaitMs: number;
  /** Device utilization percent. */
  utilPercent: number;
  /** CPU I/O wait percent. */
  ioWaitPercent: number;
};

export type SimulatedNetwork = {
  /** Receive throughput in Mbps. */
  rxMbps: number;
  /** Transmit throughput in Mbps. */
  txMbps: number;
  /** Round-trip latency in ms. */
  latencyMs: number;
  /** Packet loss percent. */
  packetLossPercent: number;
  established: number;
  listen: number;
  timeWait: number;
};

export type VmstatSample = {
  procsR: number;
  procsB: number;
  memSwpd: number;
  memFree: number;
  memBuff: number;
  memCache: number;
  swapSi: number;
  swapSo: number;
  ioBi: number;
  ioBo: number;
  systemIn: number;
  systemCs: number;
  cpuUs: number;
  cpuSy: number;
  cpuId: number;
  cpuWa: number;
};

export type SimulatedPerformanceState = {
  scenarioId: PerformanceScenarioId;
  hostname: string;
  uptimeHuman: string;
  clockTime: string;
  usersLoggedIn: number;
  cpuCount: number;
  /** Overall CPU utilization percent (0–100). */
  cpuUtilizationPercent: number;
  cpuUserPercent: number;
  cpuSystemPercent: number;
  cpuIdlePercent: number;
  loadAvg: readonly [number, number, number];
  memory: SimulatedPerfMemory;
  diskIo: SimulatedDiskIo;
  network: SimulatedNetwork;
  /** Application response time in ms. */
  appResponseMs: number;
  processes: SimulatedPerfProcess[];
  disks: SimulatedDiskMount[];
  vmstatSamples: readonly VmstatSample[];
  interpretation: string;
};

export type PerformanceScenarioMeta = {
  id: PerformanceScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
  primaryBottleneck:
    "none" | "cpu" | "memory" | "disk" | "network" | "application";
};

export type SimulatePerformanceResult = {
  result: SimulateResult;
  state: SimulatedPerformanceState;
};

export const PERFORMANCE_SCENARIOS: readonly PerformanceScenarioMeta[] = [
  {
    id: "healthy",
    label: "Healthy System",
    symptom: "CPU, memory, disk, network, and response time look normal.",
    rootCause: "Baseline educational snapshot with spare capacity.",
    primaryBottleneck: "none",
  },
  {
    id: "high-cpu",
    label: "High CPU Usage",
    symptom: "CPU near saturation; load exceeds CPU capacity.",
    rootCause: "`batch-worker` pegs CPU; memory and disk remain healthy.",
    primaryBottleneck: "cpu",
  },
  {
    id: "memory-pressure",
    label: "Memory Pressure",
    symptom: "Available memory is very low and swap usage is climbing.",
    rootCause:
      "`data-cache` holds a large working set; the kernel is swapping.",
    primaryBottleneck: "memory",
  },
  {
    id: "disk-io",
    label: "Disk I/O Bottleneck",
    symptom: "Elevated I/O wait, high disk latency, rising response time.",
    rootCause: "Storage is saturated by `report-export` heavy writes.",
    primaryBottleneck: "disk",
  },
  {
    id: "network-congestion",
    label: "Network Congestion",
    symptom: "High network latency and elevated packet loss.",
    rootCause: "Path congestion to upstream API; host CPU/RAM look fine.",
    primaryBottleneck: "network",
  },
  {
    id: "application-slowdown",
    label: "Application-Level Slowdown",
    symptom: "Host metrics look healthy but application response time is high.",
    rootCause:
      "Application dependency delay (lock wait / slow query) — not a host resource bottleneck.",
    primaryBottleneck: "application",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  hostname                          Show the simulated hostname",
  "  nproc                             Show the number of processing units",
  "  uptime                            Show uptime and load averages",
  "  free                              Show memory usage (MiB)",
  "  free -h                           Show memory usage (human-readable)",
  "  top                               Show a process / resource snapshot",
  "  vmstat                             Show a virtual-memory summary",
  "  vmstat 1 5                        Show five predefined samples",
  "  iostat                             Show disk I/O summary",
  "  iostat -x 1 3                     Extended disk stats (simulated)",
  "  df -h                             Human-readable disk space",
  "  ss -s                             Socket statistics summary",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  uptime",
  "  free -h",
  "  top",
  "  vmstat 1 5",
  "  iostat -x 1 3",
  "  df -h",
  "  ss -s",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const HEALTHY_DISKS: readonly SimulatedDiskMount[] = [
  {
    filesystem: "/dev/sda1",
    size: "40G",
    used: "14G",
    avail: "26G",
    usePercent: "35%",
    mountedOn: "/",
  },
  {
    filesystem: "/dev/sda2",
    size: "100G",
    used: "42G",
    avail: "58G",
    usePercent: "42%",
    mountedOn: "/var",
  },
];

function baseProcesses(): SimulatedPerfProcess[] {
  return [
    {
      pid: 1,
      user: "root",
      cpu: 0.0,
      mem: 0.1,
      command: "systemd",
      state: "S",
    },
    {
      pid: 420,
      user: "root",
      cpu: 0.1,
      mem: 0.3,
      command: "sshd",
      state: "S",
    },
    {
      pid: 1200,
      user: "bunsal",
      cpu: 0.2,
      mem: 0.4,
      command: "bash",
      state: "S",
    },
    {
      pid: 2345,
      user: "app",
      cpu: 4.2,
      mem: 6.5,
      command: "node app-server",
      state: "S",
    },
    {
      pid: 2401,
      user: "app",
      cpu: 1.1,
      mem: 2.0,
      command: "postgres",
      state: "S",
    },
    {
      pid: 3100,
      user: "root",
      cpu: 0.0,
      mem: 0.2,
      command: "cron",
      state: "S",
    },
  ];
}

function healthyMemory(): SimulatedPerfMemory {
  return {
    totalMiB: 8192,
    usedMiB: 2400,
    freeMiB: 2600,
    sharedMiB: 140,
    buffCacheMiB: 3192,
    availableMiB: 5100,
    swapTotalMiB: 2048,
    swapUsedMiB: 0,
    swapFreeMiB: 2048,
  };
}

function healthyDiskIo(): SimulatedDiskIo {
  return {
    readKiBs: 420,
    writeKiBs: 180,
    iops: 85,
    awaitMs: 2.4,
    utilPercent: 8,
    ioWaitPercent: 1,
  };
}

function healthyNetwork(): SimulatedNetwork {
  return {
    rxMbps: 12,
    txMbps: 8,
    latencyMs: 8,
    packetLossPercent: 0,
    established: 48,
    listen: 6,
    timeWait: 14,
  };
}

function healthyVmstat(): VmstatSample[] {
  return [
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_662_400,
      memBuff: 180_000,
      memCache: 3_090_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 18,
      ioBo: 10,
      systemIn: 220,
      systemCs: 390,
      cpuUs: 6,
      cpuSy: 2,
      cpuId: 91,
      cpuWa: 1,
    },
    {
      procsR: 0,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_655_000,
      memBuff: 180_200,
      memCache: 3_095_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 8,
      ioBo: 4,
      systemIn: 190,
      systemCs: 340,
      cpuUs: 4,
      cpuSy: 2,
      cpuId: 93,
      cpuWa: 1,
    },
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_650_000,
      memBuff: 180_400,
      memCache: 3_098_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 12,
      ioBo: 6,
      systemIn: 210,
      systemCs: 360,
      cpuUs: 5,
      cpuSy: 2,
      cpuId: 92,
      cpuWa: 1,
    },
    {
      procsR: 0,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_648_000,
      memBuff: 180_500,
      memCache: 3_100_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 4,
      ioBo: 2,
      systemIn: 180,
      systemCs: 310,
      cpuUs: 3,
      cpuSy: 1,
      cpuId: 95,
      cpuWa: 1,
    },
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_645_000,
      memBuff: 180_600,
      memCache: 3_102_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 10,
      ioBo: 5,
      systemIn: 200,
      systemCs: 350,
      cpuUs: 5,
      cpuSy: 2,
      cpuId: 92,
      cpuWa: 1,
    },
  ];
}

function cloneState(
  state: SimulatedPerformanceState,
): SimulatedPerformanceState {
  return {
    ...state,
    loadAvg: [...state.loadAvg] as [number, number, number],
    memory: { ...state.memory },
    diskIo: { ...state.diskIo },
    network: { ...state.network },
    processes: state.processes.map((process) => ({ ...process })),
    disks: state.disks.map((disk) => ({ ...disk })),
    vmstatSamples: state.vmstatSamples.map((sample) => ({ ...sample })),
  };
}

function buildState(
  scenarioId: PerformanceScenarioId,
  overrides: Partial<SimulatedPerformanceState> & {
    interpretation: string;
  },
): SimulatedPerformanceState {
  return {
    scenarioId,
    hostname: SIMULATED_PERF_HOST,
    uptimeHuman: "4 days, 6:18",
    clockTime: "10:42:15",
    usersLoggedIn: 2,
    cpuCount: 4,
    cpuUtilizationPercent: 12,
    cpuUserPercent: 8,
    cpuSystemPercent: 3,
    cpuIdlePercent: 87,
    loadAvg: [0.42, 0.38, 0.35],
    memory: healthyMemory(),
    diskIo: healthyDiskIo(),
    network: healthyNetwork(),
    appResponseMs: 85,
    processes: baseProcesses(),
    disks: [...HEALTHY_DISKS],
    vmstatSamples: healthyVmstat(),
    ...overrides,
  };
}

function highCpuState(): SimulatedPerformanceState {
  const processes = baseProcesses();
  processes.push({
    pid: 4521,
    user: "app",
    cpu: 92.4,
    mem: 4.8,
    command: "batch-worker",
    state: "R",
  });
  const appServer = processes[3];
  if (appServer) {
    processes[3] = {
      ...appServer,
      cpu: 18.5,
      mem: 7.2,
    };
  }

  return buildState("high-cpu", {
    cpuUtilizationPercent: 96,
    cpuUserPercent: 78,
    cpuSystemPercent: 14,
    cpuIdlePercent: 3,
    loadAvg: [8.52, 7.1, 4.8],
    diskIo: {
      ...healthyDiskIo(),
      ioWaitPercent: 2,
    },
    appResponseMs: 640,
    processes,
    vmstatSamples: [
      {
        procsR: 7,
        procsB: 0,
        memSwpd: 0,
        memFree: 2_400_000,
        memBuff: 170_000,
        memCache: 2_900_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 20,
        ioBo: 12,
        systemIn: 900,
        systemCs: 1800,
        cpuUs: 78,
        cpuSy: 14,
        cpuId: 6,
        cpuWa: 2,
      },
      {
        procsR: 8,
        procsB: 0,
        memSwpd: 0,
        memFree: 2_380_000,
        memBuff: 170_000,
        memCache: 2_890_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 16,
        ioBo: 10,
        systemIn: 950,
        systemCs: 1900,
        cpuUs: 80,
        cpuSy: 13,
        cpuId: 5,
        cpuWa: 2,
      },
      {
        procsR: 6,
        procsB: 0,
        memSwpd: 0,
        memFree: 2_370_000,
        memBuff: 170_200,
        memCache: 2_880_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 14,
        ioBo: 8,
        systemIn: 920,
        systemCs: 1850,
        cpuUs: 79,
        cpuSy: 14,
        cpuId: 5,
        cpuWa: 2,
      },
      {
        procsR: 7,
        procsB: 0,
        memSwpd: 0,
        memFree: 2_360_000,
        memBuff: 170_200,
        memCache: 2_870_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 18,
        ioBo: 11,
        systemIn: 940,
        systemCs: 1880,
        cpuUs: 81,
        cpuSy: 13,
        cpuId: 4,
        cpuWa: 2,
      },
      {
        procsR: 8,
        procsB: 0,
        memSwpd: 0,
        memFree: 2_350_000,
        memBuff: 170_400,
        memCache: 2_860_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 15,
        ioBo: 9,
        systemIn: 960,
        systemCs: 1920,
        cpuUs: 82,
        cpuSy: 12,
        cpuId: 4,
        cpuWa: 2,
      },
    ],
    interpretation:
      "CPU utilization and load averages are far above capacity for a 4-vCPU host. Memory available and I/O wait remain healthy — investigate CPU-bound work first.",
  });
}

function memoryPressureState(): SimulatedPerformanceState {
  const processes = baseProcesses();
  processes.push({
    pid: 5102,
    user: "app",
    cpu: 12.0,
    mem: 48.5,
    command: "data-cache",
    state: "D",
  });
  const appServer = processes[3];
  if (appServer) {
    processes[3] = {
      ...appServer,
      cpu: 8.0,
      mem: 18.2,
    };
  }

  return buildState("memory-pressure", {
    cpuUtilizationPercent: 42,
    cpuUserPercent: 28,
    cpuSystemPercent: 10,
    cpuIdlePercent: 42,
    loadAvg: [3.2, 2.8, 2.1],
    memory: {
      totalMiB: 8192,
      usedMiB: 7600,
      freeMiB: 120,
      sharedMiB: 280,
      buffCacheMiB: 472,
      availableMiB: 210,
      swapTotalMiB: 2048,
      swapUsedMiB: 1480,
      swapFreeMiB: 568,
    },
    diskIo: {
      readKiBs: 2800,
      writeKiBs: 3200,
      iops: 420,
      awaitMs: 18,
      utilPercent: 55,
      ioWaitPercent: 12,
    },
    appResponseMs: 920,
    processes,
    vmstatSamples: [
      {
        procsR: 2,
        procsB: 2,
        memSwpd: 1_515_520,
        memFree: 122_880,
        memBuff: 40_000,
        memCache: 443_000,
        swapSi: 420,
        swapSo: 680,
        ioBi: 900,
        ioBo: 1100,
        systemIn: 700,
        systemCs: 1400,
        cpuUs: 28,
        cpuSy: 10,
        cpuId: 50,
        cpuWa: 12,
      },
      {
        procsR: 3,
        procsB: 1,
        memSwpd: 1_520_000,
        memFree: 110_000,
        memBuff: 38_000,
        memCache: 430_000,
        swapSi: 480,
        swapSo: 720,
        ioBi: 950,
        ioBo: 1200,
        systemIn: 720,
        systemCs: 1450,
        cpuUs: 30,
        cpuSy: 11,
        cpuId: 46,
        cpuWa: 13,
      },
      {
        procsR: 2,
        procsB: 2,
        memSwpd: 1_530_000,
        memFree: 100_000,
        memBuff: 36_000,
        memCache: 420_000,
        swapSi: 510,
        swapSo: 760,
        ioBi: 980,
        ioBo: 1250,
        systemIn: 740,
        systemCs: 1500,
        cpuUs: 27,
        cpuSy: 12,
        cpuId: 48,
        cpuWa: 13,
      },
      {
        procsR: 2,
        procsB: 3,
        memSwpd: 1_540_000,
        memFree: 95_000,
        memBuff: 35_000,
        memCache: 410_000,
        swapSi: 540,
        swapSo: 800,
        ioBi: 1000,
        ioBo: 1300,
        systemIn: 760,
        systemCs: 1550,
        cpuUs: 26,
        cpuSy: 12,
        cpuId: 48,
        cpuWa: 14,
      },
      {
        procsR: 3,
        procsB: 2,
        memSwpd: 1_515_520,
        memFree: 122_880,
        memBuff: 40_000,
        memCache: 443_000,
        swapSi: 460,
        swapSo: 700,
        ioBi: 920,
        ioBo: 1150,
        systemIn: 710,
        systemCs: 1420,
        cpuUs: 29,
        cpuSy: 10,
        cpuId: 49,
        cpuWa: 12,
      },
    ],
    interpretation:
      "Available memory is critically low and swap is heavily used. Moderate CPU with rising application latency often follows memory pressure — investigate RAM consumers and swap activity before tuning CPU.",
  });
}

function diskIoState(): SimulatedPerformanceState {
  const processes = baseProcesses();
  processes.push({
    pid: 6204,
    user: "app",
    cpu: 6.5,
    mem: 3.8,
    command: "report-export",
    state: "D",
  });
  const appServer = processes[3];
  if (appServer) {
    processes[3] = {
      ...appServer,
      cpu: 9.0,
      mem: 8.1,
      state: "D",
    };
  }

  return buildState("disk-io", {
    cpuUtilizationPercent: 38,
    cpuUserPercent: 18,
    cpuSystemPercent: 8,
    cpuIdlePercent: 36,
    loadAvg: [5.4, 4.2, 3.1],
    memory: {
      ...healthyMemory(),
      availableMiB: 4200,
      usedMiB: 2800,
    },
    diskIo: {
      readKiBs: 12_400,
      writeKiBs: 18_600,
      iops: 2100,
      awaitMs: 42,
      utilPercent: 94,
      ioWaitPercent: 28,
    },
    appResponseMs: 1100,
    processes,
    vmstatSamples: [
      {
        procsR: 1,
        procsB: 5,
        memSwpd: 0,
        memFree: 2_400_000,
        memBuff: 200_000,
        memCache: 2_800_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 3200,
        ioBo: 4800,
        systemIn: 600,
        systemCs: 1200,
        cpuUs: 18,
        cpuSy: 8,
        cpuId: 46,
        cpuWa: 28,
      },
      {
        procsR: 2,
        procsB: 6,
        memSwpd: 0,
        memFree: 2_380_000,
        memBuff: 200_000,
        memCache: 2_790_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 3400,
        ioBo: 5000,
        systemIn: 620,
        systemCs: 1250,
        cpuUs: 17,
        cpuSy: 9,
        cpuId: 44,
        cpuWa: 30,
      },
      {
        procsR: 1,
        procsB: 5,
        memSwpd: 0,
        memFree: 2_370_000,
        memBuff: 201_000,
        memCache: 2_780_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 3100,
        ioBo: 4700,
        systemIn: 610,
        systemCs: 1220,
        cpuUs: 19,
        cpuSy: 8,
        cpuId: 46,
        cpuWa: 27,
      },
      {
        procsR: 2,
        procsB: 4,
        memSwpd: 0,
        memFree: 2_360_000,
        memBuff: 201_000,
        memCache: 2_770_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 3300,
        ioBo: 4900,
        systemIn: 630,
        systemCs: 1280,
        cpuUs: 18,
        cpuSy: 9,
        cpuId: 45,
        cpuWa: 28,
      },
      {
        procsR: 1,
        procsB: 6,
        memSwpd: 0,
        memFree: 2_350_000,
        memBuff: 202_000,
        memCache: 2_760_000,
        swapSi: 0,
        swapSo: 0,
        ioBi: 3500,
        ioBo: 5100,
        systemIn: 640,
        systemCs: 1300,
        cpuUs: 16,
        cpuSy: 8,
        cpuId: 46,
        cpuWa: 30,
      },
    ],
    interpretation:
      "I/O wait and disk latency are elevated while CPU and available memory look only moderately busy. Storage saturation is the leading host-level suspect for the slow application responses.",
  });
}

function networkCongestionState(): SimulatedPerformanceState {
  return buildState("network-congestion", {
    cpuUtilizationPercent: 18,
    cpuUserPercent: 12,
    cpuSystemPercent: 4,
    cpuIdlePercent: 80,
    loadAvg: [0.9, 0.8, 0.7],
    network: {
      rxMbps: 95,
      txMbps: 88,
      latencyMs: 180,
      packetLossPercent: 4.5,
      established: 120,
      listen: 6,
      timeWait: 40,
    },
    appResponseMs: 780,
    interpretation:
      "Host CPU, memory, and disk look healthy, but network latency and packet loss are elevated. Investigate path congestion, DNS, or remote dependency delay before resizing the host.",
  });
}

function applicationSlowdownState(): SimulatedPerformanceState {
  const processes = baseProcesses();
  const appServer = processes[3];
  if (appServer) {
    processes[3] = {
      ...appServer,
      cpu: 6.0,
      mem: 7.0,
      state: "S",
    };
  }
  const postgres = processes[4];
  if (postgres) {
    processes[4] = {
      ...postgres,
      cpu: 3.5,
      mem: 4.2,
      state: "S",
    };
  }

  return buildState("application-slowdown", {
    cpuUtilizationPercent: 16,
    cpuUserPercent: 10,
    cpuSystemPercent: 4,
    cpuIdlePercent: 82,
    loadAvg: [0.65, 0.58, 0.5],
    appResponseMs: 1450,
    processes,
    interpretation:
      "CPU, memory, disk, and network metrics appear normal, yet application response time is high. Suspect application logic, locks, slow queries, or dependency waits — not a saturated host resource.",
  });
}

export function formatPerformanceFundamentalsPrompt(): string {
  return `${SIMULATED_PERF_USER}@${SIMULATED_PERF_HOST}:~$`;
}

export const DEFAULT_PERFORMANCE_FUNDAMENTALS_SUGGESTIONS = [
  "uptime",
  "free -h",
  "top",
  "vmstat 1 5",
  "iostat -x 1 3",
  "df -h",
  "ss -s",
  "help",
] as const;

export function isPerformanceScenarioId(
  value: string,
): value is PerformanceScenarioId {
  return PERFORMANCE_SCENARIOS.some((scenario) => scenario.id === value);
}

export function getPerformanceScenario(
  id: PerformanceScenarioId,
): PerformanceScenarioMeta {
  const found = PERFORMANCE_SCENARIOS.find((scenario) => scenario.id === id);
  return found ?? PERFORMANCE_SCENARIOS[0]!;
}

export function createInitialPerformanceState(
  scenarioId: PerformanceScenarioId = "healthy",
): SimulatedPerformanceState {
  switch (scenarioId) {
    case "high-cpu":
      return highCpuState();
    case "memory-pressure":
      return memoryPressureState();
    case "disk-io":
      return diskIoState();
    case "network-congestion":
      return networkCongestionState();
    case "application-slowdown":
      return applicationSlowdownState();
    case "healthy":
    default:
      return buildState("healthy", {
        interpretation:
          "All major resources have spare capacity. Treat this as a healthy baseline for comparison.",
      });
  }
}

export function metricStatus(
  kind:
    | "cpu"
    | "load"
    | "memory"
    | "swap"
    | "disk-util"
    | "io-wait"
    | "network-latency"
    | "packet-loss"
    | "app-response",
  state: SimulatedPerformanceState,
): MetricStatus {
  switch (kind) {
    case "cpu":
      if (state.cpuUtilizationPercent >= 85) return "critical";
      if (state.cpuUtilizationPercent >= 60) return "warning";
      return "normal";
    case "load":
      if (state.loadAvg[0] > state.cpuCount * 1.5) return "critical";
      if (state.loadAvg[0] > state.cpuCount) return "warning";
      return "normal";
    case "memory":
      if (state.memory.availableMiB < 512) return "critical";
      if (state.memory.availableMiB < 1536) return "warning";
      return "normal";
    case "swap": {
      const pct =
        state.memory.swapTotalMiB <= 0
          ? 0
          : (state.memory.swapUsedMiB / state.memory.swapTotalMiB) * 100;
      if (pct >= 50) return "critical";
      if (pct >= 15) return "warning";
      return "normal";
    }
    case "disk-util":
      if (state.diskIo.utilPercent >= 85) return "critical";
      if (state.diskIo.utilPercent >= 60) return "warning";
      return "normal";
    case "io-wait":
      if (state.diskIo.ioWaitPercent >= 20) return "critical";
      if (state.diskIo.ioWaitPercent >= 10) return "warning";
      return "normal";
    case "network-latency":
      if (state.network.latencyMs >= 100) return "critical";
      if (state.network.latencyMs >= 40) return "warning";
      return "normal";
    case "packet-loss":
      if (state.network.packetLossPercent >= 2) return "critical";
      if (state.network.packetLossPercent >= 0.5) return "warning";
      return "normal";
    case "app-response":
      if (state.appResponseMs >= 800) return "critical";
      if (state.appResponseMs >= 300) return "warning";
      return "normal";
    default:
      return "normal";
  }
}

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

function formatHumanMiB(mib: number): string {
  if (mib >= 1024) {
    const gib = mib / 1024;
    const rounded = Math.round(gib * 10) / 10;
    return `${rounded}Gi`;
  }
  return `${Math.round(mib)}Mi`;
}

function formatMib(mib: number): string {
  return String(Math.round(mib));
}

function formatUptime(state: SimulatedPerformanceState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  return [
    ` ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
  ];
}

function formatFree(
  state: SimulatedPerformanceState,
  human: boolean,
): string[] {
  const mem = state.memory;
  const fmt = human ? formatHumanMiB : formatMib;

  const header = `${pad("", 8)} ${padStart("total", 7)} ${padStart("used", 7)} ${padStart("free", 7)} ${padStart("shared", 7)} ${padStart("buff/cache", 10)} ${padStart("available", 9)}`;
  const memLine = `Mem:     ${padStart(fmt(mem.totalMiB), 7)} ${padStart(fmt(mem.usedMiB), 7)} ${padStart(fmt(mem.freeMiB), 7)} ${padStart(fmt(mem.sharedMiB), 7)} ${padStart(fmt(mem.buffCacheMiB), 10)} ${padStart(fmt(mem.availableMiB), 9)}`;
  const swapLine = `Swap:    ${padStart(fmt(mem.swapTotalMiB), 7)} ${padStart(fmt(mem.swapUsedMiB), 7)} ${padStart(fmt(mem.swapFreeMiB), 7)}`;

  return [
    header,
    memLine,
    swapLine,
    "",
    "(simulated — prefer available over treating all used memory as unavailable)",
  ];
}

function formatTop(state: SimulatedPerformanceState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  const byCpu = [...state.processes].sort((a, b) => b.cpu - a.cpu);
  const mem = state.memory;

  const lines = [
    `top - ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
    `Tasks: ${state.processes.length} total`,
    `%Cpu(s): ${padStart(state.cpuUserPercent.toFixed(1), 5)} us, ${padStart(state.cpuSystemPercent.toFixed(1), 5)} sy,  0.0 ni, ${padStart(state.cpuIdlePercent.toFixed(1), 5)} id, ${padStart(state.diskIo.ioWaitPercent.toFixed(1), 5)} wa`,
    `MiB Mem : ${padStart(mem.totalMiB.toFixed(1), 8)} total, ${padStart(mem.freeMiB.toFixed(1), 8)} free, ${padStart(mem.usedMiB.toFixed(1), 8)} used, ${padStart(mem.buffCacheMiB.toFixed(1), 8)} buff/cache`,
    `MiB Swap: ${padStart(mem.swapTotalMiB.toFixed(1), 8)} total, ${padStart(mem.swapFreeMiB.toFixed(1), 8)} free, ${padStart(mem.swapUsedMiB.toFixed(1), 8)} used. ${padStart(mem.availableMiB.toFixed(1), 8)} avail Mem`,
    "",
    `${pad("PID", 6)} ${pad("USER", 8)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} ${pad("S", 2)} COMMAND`,
  ];

  for (const process of byCpu) {
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.user, 8)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)} ${pad(process.state, 2)} ${process.command}`,
    );
  }

  lines.push("", "(simulated snapshot — not live metrics from your computer)");
  return lines;
}

function formatVmstatHeader(): string {
  return "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----";
}

function formatVmstatColumns(): string {
  return " r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa";
}

function formatVmstatRow(sample: VmstatSample): string {
  return [
    padStart(sample.procsR, 2),
    padStart(sample.procsB, 2),
    padStart(sample.memSwpd, 7),
    padStart(sample.memFree, 7),
    padStart(sample.memBuff, 6),
    padStart(sample.memCache, 6),
    padStart(sample.swapSi, 5),
    padStart(sample.swapSo, 5),
    padStart(sample.ioBi, 5),
    padStart(sample.ioBo, 5),
    padStart(sample.systemIn, 5),
    padStart(sample.systemCs, 5),
    padStart(sample.cpuUs, 3),
    padStart(sample.cpuSy, 3),
    padStart(sample.cpuId, 3),
    padStart(sample.cpuWa, 3),
  ].join(" ");
}

function formatVmstat(
  state: SimulatedPerformanceState,
  samples: number,
): string[] {
  const count = Math.min(samples, state.vmstatSamples.length);
  const lines = [
    formatVmstatHeader(),
    formatVmstatColumns(),
    ...state.vmstatSamples.slice(0, count).map(formatVmstatRow),
  ];
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

function formatIostat(state: SimulatedPerformanceState): string[] {
  const io = state.diskIo;
  return [
    "Linux 6.8.0-rean (app-lab) \t11/19/2026 \t_x86_64_\t(4 CPU)",
    "",
    "avg-cpu:  %user   %nice %system %iowait  %steal   %idle",
    `         ${padStart(state.cpuUserPercent.toFixed(2), 6)}    0.00 ${padStart(state.cpuSystemPercent.toFixed(2), 6)} ${padStart(io.ioWaitPercent.toFixed(2), 7)}    0.00 ${padStart(state.cpuIdlePercent.toFixed(2), 6)}`,
    "",
    "Device            r/s     w/s     rkB/s     wkB/s   await  %util",
    `sda            ${padStart((io.iops * 0.4).toFixed(1), 6)} ${padStart((io.iops * 0.6).toFixed(1), 7)} ${padStart(io.readKiBs.toFixed(1), 9)} ${padStart(io.writeKiBs.toFixed(1), 9)} ${padStart(io.awaitMs.toFixed(1), 7)} ${padStart(io.utilPercent.toFixed(1), 6)}`,
    "",
    "(simulated iostat — educational fields only, not host devices)",
  ];
}

function formatIostatExtended(state: SimulatedPerformanceState): string[] {
  const io = state.diskIo;
  const lines = [
    "Linux 6.8.0-rean (app-lab) \t11/19/2026 \t_x86_64_\t(4 CPU)",
    "",
    "avg-cpu:  %user   %nice %system %iowait  %steal   %idle",
    `         ${padStart(state.cpuUserPercent.toFixed(2), 6)}    0.00 ${padStart(state.cpuSystemPercent.toFixed(2), 6)} ${padStart(io.ioWaitPercent.toFixed(2), 7)}    0.00 ${padStart(state.cpuIdlePercent.toFixed(2), 6)}`,
    "",
    "Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  await  aqu-sz  %util",
  ];

  for (let i = 0; i < 3; i += 1) {
    const factor = 1 + i * 0.02;
    lines.push(
      `sda            ${padStart((io.iops * 0.4 * factor).toFixed(1), 6)} ${padStart((io.iops * 0.6 * factor).toFixed(1), 7)} ${padStart((io.readKiBs * factor).toFixed(1), 9)} ${padStart((io.writeKiBs * factor).toFixed(1), 9)}     0.20     1.40 ${padStart((io.awaitMs * factor).toFixed(1), 7)}    ${(io.utilPercent / 40).toFixed(2)} ${padStart(Math.min(100, io.utilPercent * factor).toFixed(1), 6)}`,
    );
  }

  lines.push(
    "",
    "(predefined simulated samples — returned immediately, no real delay)",
  );
  return lines;
}

function formatDfH(state: SimulatedPerformanceState): string[] {
  const lines = ["Filesystem      Size  Used Avail Use% Mounted on"];
  for (const disk of state.disks) {
    lines.push(
      `${pad(disk.filesystem, 14)} ${padStart(disk.size, 5)} ${padStart(disk.used, 5)} ${padStart(disk.avail, 5)} ${padStart(disk.usePercent, 4)} ${disk.mountedOn}`,
    );
  }
  lines.push(
    "",
    "(simulated disk capacity — separate from RAM shown by free/top)",
  );
  return lines;
}

function formatSsS(state: SimulatedPerformanceState): string[] {
  const net = state.network;
  return [
    "Total:   210",
    `TCP:     ${net.established + net.listen + net.timeWait} (estab ${net.established}, closed 0, orphaned 0, timewait ${net.timeWait})`,
    "",
    "Transport Total     IP        IPv6",
    `RAW       1         0         1`,
    `UDP       12        8         4`,
    `TCP       ${padStart(net.established + net.listen + net.timeWait, 3)}       ${padStart(Math.max(1, net.established - 10), 3)}       ${padStart(10 + net.listen, 3)}`,
    `INET      220       170       50`,
    `FRAG      0         0         0`,
    "",
    `Simulated path latency: ${net.latencyMs} ms · packet loss: ${net.packetLossPercent}%`,
    `RX/TX throughput (simulated): ${net.rxMbps} / ${net.txMbps} Mbps`,
    "",
    "(simulated ss -s — not live socket tables from your host)",
  ];
}

function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function simulatePerformanceFundamentalsCommand(
  raw: string,
  state: SimulatedPerformanceState,
): SimulatePerformanceResult {
  const nextState = cloneState(state);
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
      result: { kind: "output", lines: [String(nextState.cpuCount)] },
      state: nextState,
    };
  }

  if (command === "uptime") {
    return {
      result: { kind: "output", lines: formatUptime(nextState) },
      state: nextState,
    };
  }

  if (command === "free") {
    return {
      result: { kind: "output", lines: formatFree(nextState, false) },
      state: nextState,
    };
  }

  if (command === "free -h") {
    return {
      result: { kind: "output", lines: formatFree(nextState, true) },
      state: nextState,
    };
  }

  if (command === "top") {
    return {
      result: { kind: "output", lines: formatTop(nextState) },
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

  if (command === "iostat") {
    return {
      result: { kind: "output", lines: formatIostat(nextState) },
      state: nextState,
    };
  }

  if (command === "iostat -x 1 3" || command === "iostat -x") {
    return {
      result: { kind: "output", lines: formatIostatExtended(nextState) },
      state: nextState,
    };
  }

  if (command === "df -h" || command === "df") {
    return {
      result: { kind: "output", lines: formatDfH(nextState) },
      state: nextState,
    };
  }

  if (command === "ss -s") {
    return {
      result: { kind: "output", lines: formatSsS(nextState) },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state: nextState,
  };
}
