/**
 * Frontend-only system-monitoring simulation for Stage 03 Lesson 10.
 * Never reads host CPU, memory, process tables, or disk statistics.
 * Never executes real shell commands or waits on real timers.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_MONITOR_USER = "bunsal";
export const SIMULATED_MONITOR_HOST = "rean-linux";

export type SystemMonitoringScenarioId =
  | "healthy"
  | "high-cpu"
  | "memory-pressure"
  | "high-load"
  | "disk-space-warning";

export type SimulatedMonitorProcess = {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  command: string;
  tty: string;
  time: string;
};

export type SimulatedMemorySnapshot = {
  /** Total RAM in MiB. */
  totalMiB: number;
  usedMiB: number;
  freeMiB: number;
  sharedMiB: number;
  buffCacheMiB: number;
  /** Prefer this over treating all "used" memory as unavailable. */
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

export type SimulatedSystemMonitoringState = {
  scenarioId: SystemMonitoringScenarioId;
  hostname: string;
  /** Human-readable uptime fragment, e.g. "3 days, 4:12". */
  uptimeHuman: string;
  /** Clock time shown in uptime/top headers. */
  clockTime: string;
  usersLoggedIn: number;
  cpuCount: number;
  /** Overall CPU utilization percent (0–100). */
  cpuUtilizationPercent: number;
  loadAvg: readonly [number, number, number];
  memory: SimulatedMemorySnapshot;
  processes: SimulatedMonitorProcess[];
  disks: SimulatedDiskMount[];
  vmstatSamples: readonly VmstatSample[];
};

export type SystemMonitoringScenarioMeta = {
  id: SystemMonitoringScenarioId;
  label: string;
  symptom: string;
  rootCause: string;
};

export type SimulateSystemMonitoringResult = {
  result: SimulateResult;
  state: SimulatedSystemMonitoringState;
};

export const SYSTEM_MONITORING_SCENARIOS: readonly SystemMonitoringScenarioMeta[] =
  [
    {
      id: "healthy",
      label: "Healthy system",
      symptom: "CPU, memory, load, and disk look normal for a quiet host.",
      rootCause: "Baseline educational snapshot with spare capacity.",
    },
    {
      id: "high-cpu",
      label: "High CPU usage",
      symptom: "One process consumes a large share of CPU time.",
      rootCause:
        "`batch-worker` is pegging a core; memory and disk remain fine.",
    },
    {
      id: "memory-pressure",
      label: "Memory pressure",
      symptom: "Available memory is low and swap usage is elevated.",
      rootCause:
        "`data-cache` holds a large working set; the kernel is swapping.",
    },
    {
      id: "high-load",
      label: "High system load",
      symptom: "Load averages are elevated relative to the CPU count.",
      rootCause:
        "Runnable work exceeds the four simulated CPUs; investigate backlog.",
    },
    {
      id: "disk-space-warning",
      label: "Disk space warning",
      symptom: "Root filesystem usage is critically high.",
      rootCause:
        "Storage capacity on `/` is nearly full — separate from RAM pressure.",
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
  "  ps                                Show a basic process list",
  "  ps aux                            Show a broader process list",
  "  ps -eo pid,comm,%cpu,%mem         Custom process columns",
  "  vmstat                             Show a virtual-memory summary",
  "  vmstat 1 5                        Show five predefined samples",
  "  df                                Show filesystem disk space",
  "  df -h                             Human-readable disk space",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  nproc",
  "  free -h",
  "  top",
  "  ps aux",
  "  vmstat 1 5",
  "  df -h",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const HEALTHY_DISKS: readonly SimulatedDiskMount[] = [
  {
    filesystem: "/dev/sda1",
    size: "20G",
    used: "8.0G",
    avail: "12G",
    usePercent: "40%",
    mountedOn: "/",
  },
  {
    filesystem: "/dev/sda2",
    size: "70G",
    used: "22G",
    avail: "48G",
    usePercent: "32%",
    mountedOn: "/home",
  },
];

const FULL_DISKS: readonly SimulatedDiskMount[] = [
  {
    filesystem: "/dev/sda1",
    size: "20G",
    used: "19G",
    avail: "512M",
    usePercent: "95%",
    mountedOn: "/",
  },
  {
    filesystem: "/dev/sda2",
    size: "70G",
    used: "22G",
    avail: "48G",
    usePercent: "32%",
    mountedOn: "/home",
  },
];

function baseProcesses(): SimulatedMonitorProcess[] {
  return [
    {
      pid: 1,
      user: "root",
      cpu: 0.0,
      mem: 0.1,
      command: "systemd",
      tty: "?",
      time: "00:02:11",
    },
    {
      pid: 420,
      user: "root",
      cpu: 0.1,
      mem: 0.3,
      command: "sshd",
      tty: "?",
      time: "00:00:18",
    },
    {
      pid: 1200,
      user: "bunsal",
      cpu: 0.2,
      mem: 0.5,
      command: "bash",
      tty: "pts/0",
      time: "00:00:01",
    },
    {
      pid: 2345,
      user: "bunsal",
      cpu: 2.1,
      mem: 1.8,
      command: "node server.js",
      tty: "pts/0",
      time: "00:04:22",
    },
    {
      pid: 2410,
      user: "bunsal",
      cpu: 1.4,
      mem: 3.2,
      command: "code",
      tty: "?",
      time: "00:12:05",
    },
    {
      pid: 3100,
      user: "root",
      cpu: 0.0,
      mem: 0.2,
      command: "cron",
      tty: "?",
      time: "00:00:03",
    },
  ];
}

function healthyMemory(): SimulatedMemorySnapshot {
  return {
    totalMiB: 8192,
    usedMiB: 2100,
    freeMiB: 2800,
    sharedMiB: 120,
    buffCacheMiB: 3292,
    availableMiB: 5200,
    swapTotalMiB: 2048,
    swapUsedMiB: 0,
    swapFreeMiB: 2048,
  };
}

function healthyVmstat(): VmstatSample[] {
  return [
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_867_200,
      memBuff: 184_320,
      memCache: 3_186_688,
      swapSi: 0,
      swapSo: 0,
      ioBi: 12,
      ioBo: 8,
      systemIn: 210,
      systemCs: 380,
      cpuUs: 4,
      cpuSy: 2,
      cpuId: 93,
      cpuWa: 1,
    },
    {
      procsR: 0,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_860_000,
      memBuff: 184_400,
      memCache: 3_190_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 4,
      ioBo: 2,
      systemIn: 180,
      systemCs: 320,
      cpuUs: 3,
      cpuSy: 1,
      cpuId: 95,
      cpuWa: 1,
    },
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_855_000,
      memBuff: 184_500,
      memCache: 3_192_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 6,
      ioBo: 4,
      systemIn: 200,
      systemCs: 350,
      cpuUs: 5,
      cpuSy: 2,
      cpuId: 92,
      cpuWa: 1,
    },
    {
      procsR: 0,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_850_000,
      memBuff: 184_600,
      memCache: 3_195_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 2,
      ioBo: 1,
      systemIn: 170,
      systemCs: 300,
      cpuUs: 2,
      cpuSy: 1,
      cpuId: 96,
      cpuWa: 1,
    },
    {
      procsR: 1,
      procsB: 0,
      memSwpd: 0,
      memFree: 2_848_000,
      memBuff: 184_700,
      memCache: 3_196_000,
      swapSi: 0,
      swapSo: 0,
      ioBi: 8,
      ioBo: 3,
      systemIn: 190,
      systemCs: 340,
      cpuUs: 4,
      cpuSy: 2,
      cpuId: 93,
      cpuWa: 1,
    },
  ];
}

function scenarioState(
  scenarioId: SystemMonitoringScenarioId,
): SimulatedSystemMonitoringState {
  const processes = baseProcesses();

  switch (scenarioId) {
    case "healthy":
      return {
        scenarioId,
        hostname: SIMULATED_MONITOR_HOST,
        uptimeHuman: "3 days, 4:12",
        clockTime: "10:15:02",
        usersLoggedIn: 1,
        cpuCount: 4,
        cpuUtilizationPercent: 12,
        loadAvg: [0.45, 0.38, 0.3],
        memory: healthyMemory(),
        processes,
        disks: HEALTHY_DISKS.map((disk) => ({ ...disk })),
        vmstatSamples: healthyVmstat(),
      };

    case "high-cpu": {
      const next = processes.map((process) => ({ ...process }));
      next.push({
        pid: 4521,
        user: "bunsal",
        cpu: 92.4,
        mem: 2.1,
        command: "batch-worker",
        tty: "?",
        time: "01:18:44",
      });
      return {
        scenarioId,
        hostname: SIMULATED_MONITOR_HOST,
        uptimeHuman: "3 days, 4:18",
        clockTime: "10:21:40",
        usersLoggedIn: 1,
        cpuCount: 4,
        cpuUtilizationPercent: 94,
        loadAvg: [1.85, 1.22, 0.91],
        memory: {
          ...healthyMemory(),
          usedMiB: 2400,
          freeMiB: 2500,
          availableMiB: 4800,
          buffCacheMiB: 3292,
        },
        processes: next,
        disks: HEALTHY_DISKS.map((disk) => ({ ...disk })),
        vmstatSamples: [
          {
            procsR: 2,
            procsB: 0,
            memSwpd: 0,
            memFree: 2_560_000,
            memBuff: 184_000,
            memCache: 3_180_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 20,
            ioBo: 10,
            systemIn: 900,
            systemCs: 1400,
            cpuUs: 88,
            cpuSy: 6,
            cpuId: 5,
            cpuWa: 1,
          },
          {
            procsR: 1,
            procsB: 0,
            memSwpd: 0,
            memFree: 2_550_000,
            memBuff: 184_100,
            memCache: 3_181_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 8,
            ioBo: 4,
            systemIn: 880,
            systemCs: 1350,
            cpuUs: 90,
            cpuSy: 5,
            cpuId: 4,
            cpuWa: 1,
          },
          {
            procsR: 2,
            procsB: 0,
            memSwpd: 0,
            memFree: 2_540_000,
            memBuff: 184_200,
            memCache: 3_182_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 12,
            ioBo: 6,
            systemIn: 920,
            systemCs: 1420,
            cpuUs: 91,
            cpuSy: 5,
            cpuId: 3,
            cpuWa: 1,
          },
          {
            procsR: 1,
            procsB: 0,
            memSwpd: 0,
            memFree: 2_535_000,
            memBuff: 184_300,
            memCache: 3_183_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 6,
            ioBo: 3,
            systemIn: 860,
            systemCs: 1300,
            cpuUs: 89,
            cpuSy: 6,
            cpuId: 4,
            cpuWa: 1,
          },
          {
            procsR: 2,
            procsB: 0,
            memSwpd: 0,
            memFree: 2_530_000,
            memBuff: 184_400,
            memCache: 3_184_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 10,
            ioBo: 5,
            systemIn: 910,
            systemCs: 1380,
            cpuUs: 92,
            cpuSy: 4,
            cpuId: 3,
            cpuWa: 1,
          },
        ],
      };
    }

    case "memory-pressure": {
      const next = processes.map((process) => ({ ...process }));
      next.push({
        pid: 5802,
        user: "bunsal",
        cpu: 8.5,
        mem: 48.2,
        command: "data-cache",
        tty: "?",
        time: "02:05:11",
      });
      next.push({
        pid: 5810,
        user: "bunsal",
        cpu: 3.2,
        mem: 22.4,
        command: "report-builder",
        tty: "?",
        time: "00:44:03",
      });
      return {
        scenarioId,
        hostname: SIMULATED_MONITOR_HOST,
        uptimeHuman: "3 days, 5:02",
        clockTime: "11:05:18",
        usersLoggedIn: 1,
        cpuCount: 4,
        cpuUtilizationPercent: 28,
        loadAvg: [1.1, 0.95, 0.7],
        memory: {
          totalMiB: 8192,
          usedMiB: 7200,
          freeMiB: 96,
          sharedMiB: 210,
          buffCacheMiB: 896,
          availableMiB: 180,
          swapTotalMiB: 2048,
          swapUsedMiB: 1536,
          swapFreeMiB: 512,
        },
        processes: next,
        disks: HEALTHY_DISKS.map((disk) => ({ ...disk })),
        vmstatSamples: [
          {
            procsR: 1,
            procsB: 1,
            memSwpd: 1_572_864,
            memFree: 98_304,
            memBuff: 40_960,
            memCache: 876_544,
            swapSi: 120,
            swapSo: 80,
            ioBi: 40,
            ioBo: 90,
            systemIn: 400,
            systemCs: 700,
            cpuUs: 18,
            cpuSy: 8,
            cpuId: 62,
            cpuWa: 12,
          },
          {
            procsR: 2,
            procsB: 1,
            memSwpd: 1_580_000,
            memFree: 90_000,
            memBuff: 41_000,
            memCache: 870_000,
            swapSi: 140,
            swapSo: 95,
            ioBi: 50,
            ioBo: 110,
            systemIn: 420,
            systemCs: 740,
            cpuUs: 20,
            cpuSy: 9,
            cpuId: 58,
            cpuWa: 13,
          },
          {
            procsR: 1,
            procsB: 1,
            memSwpd: 1_590_000,
            memFree: 85_000,
            memBuff: 41_200,
            memCache: 860_000,
            swapSi: 160,
            swapSo: 100,
            ioBi: 55,
            ioBo: 120,
            systemIn: 430,
            systemCs: 760,
            cpuUs: 22,
            cpuSy: 8,
            cpuId: 55,
            cpuWa: 15,
          },
          {
            procsR: 2,
            procsB: 0,
            memSwpd: 1_595_000,
            memFree: 88_000,
            memBuff: 41_400,
            memCache: 855_000,
            swapSi: 100,
            swapSo: 70,
            ioBi: 30,
            ioBo: 80,
            systemIn: 390,
            systemCs: 690,
            cpuUs: 16,
            cpuSy: 7,
            cpuId: 65,
            cpuWa: 12,
          },
          {
            procsR: 1,
            procsB: 1,
            memSwpd: 1_600_000,
            memFree: 82_000,
            memBuff: 41_500,
            memCache: 850_000,
            swapSi: 150,
            swapSo: 90,
            ioBi: 45,
            ioBo: 100,
            systemIn: 410,
            systemCs: 720,
            cpuUs: 19,
            cpuSy: 8,
            cpuId: 60,
            cpuWa: 13,
          },
        ],
      };
    }

    case "high-load": {
      const next = processes.map((process) => {
        if (process.command === "node server.js") {
          return { ...process, cpu: 45.2, mem: 4.1 };
        }
        if (process.command === "code") {
          return { ...process, cpu: 22.0, mem: 5.5 };
        }
        return { ...process };
      });
      next.push({
        pid: 6101,
        user: "bunsal",
        cpu: 38.5,
        mem: 3.8,
        command: "compile-job",
        tty: "?",
        time: "00:22:10",
      });
      next.push({
        pid: 6102,
        user: "bunsal",
        cpu: 35.1,
        mem: 2.9,
        command: "test-runner",
        tty: "?",
        time: "00:18:44",
      });
      next.push({
        pid: 6103,
        user: "root",
        cpu: 18.0,
        mem: 1.2,
        command: "backup-sync",
        tty: "?",
        time: "00:09:02",
      });
      return {
        scenarioId,
        hostname: SIMULATED_MONITOR_HOST,
        uptimeHuman: "3 days, 6:40",
        clockTime: "12:43:55",
        usersLoggedIn: 2,
        cpuCount: 4,
        cpuUtilizationPercent: 88,
        loadAvg: [8.52, 7.21, 6.05],
        memory: {
          ...healthyMemory(),
          usedMiB: 3800,
          freeMiB: 1400,
          availableMiB: 3100,
          buffCacheMiB: 2992,
        },
        processes: next,
        disks: HEALTHY_DISKS.map((disk) => ({ ...disk })),
        vmstatSamples: [
          {
            procsR: 9,
            procsB: 0,
            memSwpd: 0,
            memFree: 1_433_600,
            memBuff: 160_000,
            memCache: 2_900_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 30,
            ioBo: 20,
            systemIn: 1200,
            systemCs: 2100,
            cpuUs: 72,
            cpuSy: 14,
            cpuId: 10,
            cpuWa: 4,
          },
          {
            procsR: 8,
            procsB: 1,
            memSwpd: 0,
            memFree: 1_420_000,
            memBuff: 160_200,
            memCache: 2_905_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 40,
            ioBo: 25,
            systemIn: 1250,
            systemCs: 2200,
            cpuUs: 74,
            cpuSy: 13,
            cpuId: 8,
            cpuWa: 5,
          },
          {
            procsR: 10,
            procsB: 0,
            memSwpd: 0,
            memFree: 1_410_000,
            memBuff: 160_400,
            memCache: 2_910_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 35,
            ioBo: 22,
            systemIn: 1300,
            systemCs: 2300,
            cpuUs: 76,
            cpuSy: 12,
            cpuId: 7,
            cpuWa: 5,
          },
          {
            procsR: 7,
            procsB: 0,
            memSwpd: 0,
            memFree: 1_405_000,
            memBuff: 160_500,
            memCache: 2_912_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 28,
            ioBo: 18,
            systemIn: 1180,
            systemCs: 2050,
            cpuUs: 70,
            cpuSy: 15,
            cpuId: 11,
            cpuWa: 4,
          },
          {
            procsR: 9,
            procsB: 1,
            memSwpd: 0,
            memFree: 1_400_000,
            memBuff: 160_600,
            memCache: 2_915_000,
            swapSi: 0,
            swapSo: 0,
            ioBi: 42,
            ioBo: 26,
            systemIn: 1280,
            systemCs: 2250,
            cpuUs: 75,
            cpuSy: 13,
            cpuId: 7,
            cpuWa: 5,
          },
        ],
      };
    }

    case "disk-space-warning":
      return {
        scenarioId,
        hostname: SIMULATED_MONITOR_HOST,
        uptimeHuman: "3 days, 7:05",
        clockTime: "13:08:11",
        usersLoggedIn: 1,
        cpuCount: 4,
        cpuUtilizationPercent: 14,
        loadAvg: [0.52, 0.41, 0.35],
        memory: healthyMemory(),
        processes,
        disks: FULL_DISKS.map((disk) => ({ ...disk })),
        vmstatSamples: healthyVmstat(),
      };
  }
}

function cloneState(
  state: SimulatedSystemMonitoringState,
): SimulatedSystemMonitoringState {
  return {
    ...state,
    loadAvg: [...state.loadAvg] as [number, number, number],
    memory: { ...state.memory },
    processes: state.processes.map((process) => ({ ...process })),
    disks: state.disks.map((disk) => ({ ...disk })),
    vmstatSamples: state.vmstatSamples.map((sample) => ({ ...sample })),
  };
}

export function createInitialSystemMonitoringState(
  scenarioId: SystemMonitoringScenarioId = "healthy",
): SimulatedSystemMonitoringState {
  return cloneState(scenarioState(scenarioId));
}

export function resetSystemMonitoringState(
  state: SimulatedSystemMonitoringState,
): SimulatedSystemMonitoringState {
  return createInitialSystemMonitoringState(state.scenarioId);
}

export function getSystemMonitoringScenario(
  id: SystemMonitoringScenarioId,
): SystemMonitoringScenarioMeta {
  const scenario = SYSTEM_MONITORING_SCENARIOS.find((item) => item.id === id);
  if (!scenario) {
    throw new Error(`Unknown system-monitoring scenario: ${id}`);
  }
  return scenario;
}

export function isSystemMonitoringScenarioId(
  value: string,
): value is SystemMonitoringScenarioId {
  return SYSTEM_MONITORING_SCENARIOS.some((scenario) => scenario.id === value);
}

export function formatSystemMonitoringPrompt(): string {
  return `${SIMULATED_MONITOR_USER}@${SIMULATED_MONITOR_HOST}:~$`;
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width, " ");
}

function padStart(value: string | number, width: number): string {
  return String(value).padStart(width, " ");
}

function formatLoad(load: number): string {
  return load.toFixed(2);
}

function formatPercent(value: number, width = 5): string {
  return padStart(value.toFixed(1), width);
}

function formatMib(value: number): string {
  return String(Math.round(value));
}

function formatHumanMiB(mib: number): string {
  if (mib >= 1024) {
    const gib = mib / 1024;
    const rounded = Math.round(gib * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}Gi` : `${rounded}Gi`;
  }
  return `${Math.round(mib)}Mi`;
}

function sortedByPid(
  processes: readonly SimulatedMonitorProcess[],
): SimulatedMonitorProcess[] {
  return [...processes].sort((a, b) => a.pid - b.pid);
}

function sortedByCpu(
  processes: readonly SimulatedMonitorProcess[],
): SimulatedMonitorProcess[] {
  return [...processes].sort((a, b) => b.cpu - a.cpu);
}

export function getTopCpuProcess(
  state: SimulatedSystemMonitoringState,
): SimulatedMonitorProcess | undefined {
  return sortedByCpu(state.processes)[0];
}

export function getTopMemProcess(
  state: SimulatedSystemMonitoringState,
): SimulatedMonitorProcess | undefined {
  return [...state.processes].sort((a, b) => b.mem - a.mem)[0];
}

export function getRootDiskUsePercent(
  state: SimulatedSystemMonitoringState,
): number {
  const root = state.disks.find((disk) => disk.mountedOn === "/");
  if (!root) {
    return 0;
  }
  return Number.parseInt(root.usePercent.replace("%", ""), 10) || 0;
}

function formatUptime(state: SimulatedSystemMonitoringState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  return [
    ` ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
  ];
}

function formatFree(
  state: SimulatedSystemMonitoringState,
  human: boolean,
): string[] {
  const mem = state.memory;
  const fmt = human ? formatHumanMiB : formatMib;
  const unitLabel = human ? "" : "";

  const header = human
    ? `${pad("", 8)} ${padStart("total", 7)} ${padStart("used", 7)} ${padStart("free", 7)} ${padStart("shared", 7)} ${padStart("buff/cache", 10)} ${padStart("available", 9)}`
    : `${pad("", 8)} ${padStart("total", 7)} ${padStart("used", 7)} ${padStart("free", 7)} ${padStart("shared", 7)} ${padStart("buff/cache", 10)} ${padStart("available", 9)}`;

  const memLine = `Mem:${unitLabel.padStart(4, " ")} ${padStart(fmt(mem.totalMiB), 7)} ${padStart(fmt(mem.usedMiB), 7)} ${padStart(fmt(mem.freeMiB), 7)} ${padStart(fmt(mem.sharedMiB), 7)} ${padStart(fmt(mem.buffCacheMiB), 10)} ${padStart(fmt(mem.availableMiB), 9)}`;
  const swapLine = `Swap:    ${padStart(fmt(mem.swapTotalMiB), 7)} ${padStart(fmt(mem.swapUsedMiB), 7)} ${padStart(fmt(mem.swapFreeMiB), 7)}`;

  return [
    header,
    memLine,
    swapLine,
    "",
    "(simulated — prefer available over treating all used memory as unavailable)",
  ];
}

function formatTop(state: SimulatedSystemMonitoringState): string[] {
  const loads = state.loadAvg.map(formatLoad).join(", ");
  const idle = Math.max(0, 100 - state.cpuUtilizationPercent);
  const us = Math.round(state.cpuUtilizationPercent * 0.75);
  const sy = Math.max(0, state.cpuUtilizationPercent - us);
  const mem = state.memory;
  const byCpu = sortedByCpu(state.processes);

  const lines = [
    `top - ${state.clockTime} up ${state.uptimeHuman},  ${state.usersLoggedIn} user${state.usersLoggedIn === 1 ? "" : "s"},  load average: ${loads}`,
    `Tasks: ${state.processes.length} total`,
    `%Cpu(s): ${padStart(us.toFixed(1), 5)} us, ${padStart(sy.toFixed(1), 5)} sy,  0.0 ni, ${padStart(idle.toFixed(1), 5)} id`,
    `MiB Mem : ${padStart(mem.totalMiB.toFixed(1), 8)} total, ${padStart(mem.freeMiB.toFixed(1), 8)} free, ${padStart(mem.usedMiB.toFixed(1), 8)} used, ${padStart(mem.buffCacheMiB.toFixed(1), 8)} buff/cache`,
    `MiB Swap: ${padStart(mem.swapTotalMiB.toFixed(1), 8)} total, ${padStart(mem.swapFreeMiB.toFixed(1), 8)} free, ${padStart(mem.swapUsedMiB.toFixed(1), 8)} used. ${padStart(mem.availableMiB.toFixed(1), 8)} avail Mem`,
    "",
    `${pad("PID", 6)} ${pad("USER", 8)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} COMMAND`,
  ];

  for (const process of byCpu) {
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.user, 8)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)} ${process.command}`,
    );
  }

  lines.push("", "(simulated snapshot — not live metrics from your computer)");
  return lines;
}

function formatPs(state: SimulatedSystemMonitoringState): string[] {
  const lines = [`${pad("PID", 6)} ${pad("TTY", 8)} ${pad("TIME", 8)} CMD`];
  for (const process of sortedByPid(state.processes)) {
    if (process.tty === "?") {
      continue;
    }
    lines.push(
      `${pad(process.pid, 6)} ${pad(process.tty, 8)} ${pad(process.time.slice(-8), 8)} ${process.command}`,
    );
  }
  return lines;
}

function formatPsAux(state: SimulatedSystemMonitoringState): string[] {
  const lines = [
    `${pad("USER", 8)} ${pad("PID", 5)} ${pad("%CPU", 6)} ${pad("%MEM", 6)} COMMAND`,
  ];
  for (const process of sortedByPid(state.processes)) {
    lines.push(
      `${pad(process.user, 8)} ${pad(process.pid, 5)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)} ${process.command}`,
    );
  }
  return lines;
}

function formatPsEo(state: SimulatedSystemMonitoringState): string[] {
  const lines = [
    `${pad("PID", 6)} ${pad("COMMAND", 16)} ${pad("%CPU", 6)} ${pad("%MEM", 6)}`,
  ];
  for (const process of sortedByPid(state.processes)) {
    const comm =
      process.command.length > 16
        ? process.command.slice(0, 16)
        : process.command;
    lines.push(
      `${pad(process.pid, 6)} ${pad(comm, 16)} ${pad(formatPercent(process.cpu), 6)} ${pad(formatPercent(process.mem), 6)}`,
    );
  }
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
  state: SimulatedSystemMonitoringState,
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

function formatDf(
  state: SimulatedSystemMonitoringState,
  human: boolean,
): string[] {
  const lines = [
    human
      ? "Filesystem      Size  Used Avail Use% Mounted on"
      : "Filesystem     1K-blocks    Used Available Use% Mounted on",
  ];

  for (const disk of state.disks) {
    if (human) {
      lines.push(
        `${pad(disk.filesystem, 14)} ${padStart(disk.size, 5)} ${padStart(disk.used, 5)} ${padStart(disk.avail, 5)} ${padStart(disk.usePercent, 4)} ${disk.mountedOn}`,
      );
    } else {
      // Deterministic block counts aligned with the disk-usage lesson scale.
      const sizeBlocks =
        disk.mountedOn === "/"
          ? disk.usePercent.startsWith("95")
            ? "20971520"
            : "20971520"
          : "73400320";
      const usedBlocks =
        disk.mountedOn === "/"
          ? disk.usePercent.startsWith("95")
            ? "19922944"
            : "8388608"
          : "23068672";
      const availBlocks =
        disk.mountedOn === "/"
          ? disk.usePercent.startsWith("95")
            ? "524288"
            : "12582912"
          : "50331648";
      lines.push(
        `${pad(disk.filesystem, 14)} ${padStart(sizeBlocks, 10)} ${padStart(usedBlocks, 8)} ${padStart(availBlocks, 9)} ${padStart(disk.usePercent, 4)} ${disk.mountedOn}`,
      );
    }
  }

  lines.push(
    "",
    "(simulated disk capacity — separate from RAM shown by free/top)",
  );
  return lines;
}

function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function simulateSystemMonitoringCommand(
  raw: string,
  state: SimulatedSystemMonitoringState,
): SimulateSystemMonitoringResult {
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

  if (command === "ps") {
    return {
      result: { kind: "output", lines: formatPs(nextState) },
      state: nextState,
    };
  }

  if (command === "ps aux") {
    return {
      result: { kind: "output", lines: formatPsAux(nextState) },
      state: nextState,
    };
  }

  if (
    command === "ps -eo pid,comm,%cpu,%mem" ||
    command === "ps -eo pid,comm,%cpu,%mem --sort=-%cpu"
  ) {
    return {
      result: { kind: "output", lines: formatPsEo(nextState) },
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

  if (command === "df") {
    return {
      result: { kind: "output", lines: formatDf(nextState, false) },
      state: nextState,
    };
  }

  if (command === "df -h") {
    return {
      result: { kind: "output", lines: formatDf(nextState, true) },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state: nextState,
  };
}
