/**
 * Frontend-only memory and swap simulation for Stage 05 Lesson 3.
 * Never reads host memory, swap, /proc, or any OS-level information.
 * Never allocates large real memory, never executes real shell commands.
 * All values are bounded fictional in-memory state.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_MEMORY_USER = "bunsal";
export const SIMULATED_MEMORY_HOST = "memory-lab";

export type MemoryConditionId =
  | "healthy"
  | "cache-heavy"
  | "high-consumption"
  | "memory-pressure"
  | "active-swap"
  | "exhaustion"
  | "memory-leak";

export type MetricStatus = "normal" | "warning" | "critical";

export type SimulatedMemoryProcess = {
  pid: number;
  user: string;
  cpu: number;
  memPercent: number;
  rssMiB: number;
  vszMiB: number;
  state: string;
  command: string;
};

export type MemoryBreakdown = {
  appMiB: number;
  kernelMiB: number;
  buffersMiB: number;
  pageCacheMiB: number;
  freeMiB: number;
};

export type SimulatedMemoryState = {
  conditionId: MemoryConditionId;
  hostname: string;
  uptimeHuman: string;
  clockTime: string;
  totalMiB: number;
  usedMiB: number;
  freeMiB: number;
  sharedMiB: number;
  buffersMiB: number;
  cachedMiB: number;
  buffCacheMiB: number;
  availableMiB: number;
  swapTotalMiB: number;
  swapUsedMiB: number;
  swapFreeMiB: number;
  swapSi: number;
  swapSo: number;
  majorFaults: number;
  minorFaults: number;
  pressureLevel: "low" | "moderate" | "high" | "critical";
  swappiness: number;
  reclaimActivity: "idle" | "light" | "elevated" | "aggressive";
  breakdown: MemoryBreakdown;
  availableHistory: readonly number[];
  swapActivityHistory: readonly { si: number; so: number }[];
  processes: SimulatedMemoryProcess[];
  appResponseMs: number;
  oomEvents: readonly string[];
  leakTrendMiB: readonly number[];
  interpretation: string;
  allocationApps: readonly {
    id: string;
    name: string;
    allocatedMiB: number;
    maxMiB: number;
  }[];
};

export type MemoryConditionMeta = {
  id: MemoryConditionId;
  label: string;
  symptom: string;
  rootCause: string;
  dashboard: boolean;
};

export type SimulateMemoryResult = {
  result: SimulateResult;
  state: SimulatedMemoryState;
};

// ---------------------------------------------------------------------------
// Condition metadata
// ---------------------------------------------------------------------------

export const MEMORY_CONDITIONS: readonly MemoryConditionMeta[] = [
  {
    id: "healthy",
    label: "Healthy Memory Usage",
    symptom: "Plenty of available memory, low swap, no pressure.",
    rootCause: "Normal workload with moderate application and cache usage.",
    dashboard: true,
  },
  {
    id: "cache-heavy",
    label: "Cache-Heavy Workload",
    symptom: "Free looks low but available is high — reclaimable page cache.",
    rootCause:
      "Linux has filled spare RAM with page cache, which is normal and healthy.",
    dashboard: true,
  },
  {
    id: "high-consumption",
    label: "High Memory Consumption",
    symptom: "Applications consuming most RAM; available still has headroom.",
    rootCause:
      "Multiple services have grown their RSS; cache has been displaced.",
    dashboard: true,
  },
  {
    id: "memory-pressure",
    label: "Memory Pressure",
    symptom:
      "Low available memory, elevated reclaim activity, rising page faults, slower responses.",
    rootCause:
      "Application demand exceeds available pages; kernel reclaims actively.",
    dashboard: true,
  },
  {
    id: "active-swap",
    label: "Active Swap Usage",
    symptom: "Swap in use with elevated si/so rates; latency rising.",
    rootCause:
      "Kernel moves infrequently-used pages to swap to satisfy RAM demand.",
    dashboard: true,
  },
  {
    id: "exhaustion",
    label: "Memory Exhaustion",
    symptom:
      "Near-zero available, aggressive reclaim, OOM killer has triggered.",
    rootCause:
      "Total demand exceeds physical + swap; kernel kills a process to recover.",
    dashboard: true,
  },
  {
    id: "memory-leak",
    label: "Memory Leak Simulation",
    symptom:
      "`leaky-app` RSS grows continuously; available declines over time.",
    rootCause:
      "Fictional process allocates but never frees memory — classic leak pattern.",
    dashboard: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Default allocation apps (used by allocation lab)
// ---------------------------------------------------------------------------

const DEFAULT_ALLOCATION_APPS = [
  { id: "web-api", name: "web-api", allocatedMiB: 0, maxMiB: 2048 },
  { id: "cache-service", name: "cache-service", allocatedMiB: 0, maxMiB: 3072 },
  { id: "batch-job", name: "batch-job", allocatedMiB: 0, maxMiB: 1536 },
  { id: "analytics", name: "analytics", allocatedMiB: 0, maxMiB: 2048 },
] as const;

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function clampMiB(value: number, min = 0, max = 8192): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function baseProcesses(): SimulatedMemoryProcess[] {
  return [
    {
      pid: 1,
      user: "root",
      cpu: 0.0,
      memPercent: 0.1,
      rssMiB: 8,
      vszMiB: 32,
      state: "S",
      command: "systemd",
    },
    {
      pid: 420,
      user: "root",
      cpu: 0.1,
      memPercent: 0.2,
      rssMiB: 16,
      vszMiB: 72,
      state: "S",
      command: "sshd",
    },
    {
      pid: 1104,
      user: "www-data",
      cpu: 1.2,
      memPercent: 1.8,
      rssMiB: 148,
      vszMiB: 420,
      state: "S",
      command: "nginx",
    },
    {
      pid: 1840,
      user: "postgres",
      cpu: 2.4,
      memPercent: 8.5,
      rssMiB: 697,
      vszMiB: 1240,
      state: "S",
      command: "postgres",
    },
    {
      pid: 2210,
      user: "app",
      cpu: 3.1,
      memPercent: 6.2,
      rssMiB: 509,
      vszMiB: 1860,
      state: "S",
      command: "node",
    },
    {
      pid: 2388,
      user: "app",
      cpu: 2.0,
      memPercent: 12.4,
      rssMiB: 1017,
      vszMiB: 3200,
      state: "S",
      command: "java",
    },
    {
      pid: 2501,
      user: "redis",
      cpu: 0.8,
      memPercent: 2.1,
      rssMiB: 172,
      vszMiB: 310,
      state: "S",
      command: "redis",
    },
    {
      pid: 3100,
      user: "worker",
      cpu: 0.2,
      memPercent: 1.0,
      rssMiB: 82,
      vszMiB: 256,
      state: "S",
      command: "batch-worker",
    },
  ];
}

function cloneState(state: SimulatedMemoryState): SimulatedMemoryState {
  return {
    ...state,
    availableHistory: [...state.availableHistory],
    swapActivityHistory: state.swapActivityHistory.map((s) => ({ ...s })),
    processes: state.processes.map((p) => ({ ...p })),
    oomEvents: [...state.oomEvents],
    leakTrendMiB: [...state.leakTrendMiB],
    breakdown: { ...state.breakdown },
    allocationApps: state.allocationApps.map((a) => ({ ...a })),
  };
}

function pad(value: string | number, width: number): string {
  const text = String(value);
  if (text.length >= width) return text;
  return text + " ".repeat(width - text.length);
}

function padStart(value: string | number, width: number): string {
  const text = String(value);
  if (text.length >= width) return text;
  return " ".repeat(width - text.length) + text;
}

function mibToKiB(mib: number): number {
  return Math.round(mib * 1024);
}

function formatMiB(mib: number): string {
  if (mib >= 1024) {
    return `${(mib / 1024).toFixed(1)}G`;
  }
  return `${mib}M`;
}

// ---------------------------------------------------------------------------
// State builders per condition
// ---------------------------------------------------------------------------

function buildState(
  conditionId: MemoryConditionId,
  overrides: Partial<SimulatedMemoryState> & {
    interpretation: string;
  },
): SimulatedMemoryState {
  const totalMiB = overrides.totalMiB ?? 8192;
  const buffersMiB = overrides.buffersMiB ?? 128;
  const cachedMiB = overrides.cachedMiB ?? 1024;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = overrides.freeMiB ?? 2048;
  const sharedMiB = overrides.sharedMiB ?? 64;
  const usedMiB = overrides.usedMiB ?? totalMiB - freeMiB - buffCacheMiB;
  const availableMiB =
    overrides.availableMiB ?? clampMiB(freeMiB + cachedMiB * 0.8);
  const swapTotalMiB = overrides.swapTotalMiB ?? 2048;
  const swapUsedMiB = overrides.swapUsedMiB ?? 0;
  const swapFreeMiB = swapTotalMiB - swapUsedMiB;

  const appMiB = overrides.breakdown?.appMiB ?? usedMiB;
  const kernelMiB = overrides.breakdown?.kernelMiB ?? 128;
  const breakdownFreeMiB =
    overrides.breakdown?.freeMiB ??
    Math.max(0, totalMiB - appMiB - kernelMiB - buffersMiB - cachedMiB);

  return {
    conditionId,
    hostname: SIMULATED_MEMORY_HOST,
    uptimeHuman: "4 days, 11:22",
    clockTime: "14:05:38",
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB,
    swapUsedMiB,
    swapFreeMiB,
    swapSi: overrides.swapSi ?? 0,
    swapSo: overrides.swapSo ?? 0,
    majorFaults: overrides.majorFaults ?? 0,
    minorFaults: overrides.minorFaults ?? 420,
    pressureLevel: overrides.pressureLevel ?? "low",
    swappiness: overrides.swappiness ?? 60,
    reclaimActivity: overrides.reclaimActivity ?? "idle",
    breakdown: {
      appMiB,
      kernelMiB,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB: breakdownFreeMiB,
    },
    availableHistory:
      overrides.availableHistory ??
      [
        5500, 5400, 5300, 5200, 5100, 5000, 4900, 4800, 4850, 4900, 4950, 5000,
      ].map(() => availableMiB),
    swapActivityHistory:
      overrides.swapActivityHistory ??
      Array.from({ length: 12 }, () => ({ si: 0, so: 0 })),
    processes: overrides.processes ?? baseProcesses(),
    appResponseMs: overrides.appResponseMs ?? 90,
    oomEvents: overrides.oomEvents ?? [],
    leakTrendMiB: overrides.leakTrendMiB ?? [],
    interpretation: overrides.interpretation,
    allocationApps: overrides.allocationApps ?? [],
  };
}

function healthyState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 160;
  const cachedMiB = 1800;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 2800;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~3432
  const availableMiB = 4200;
  const processes = baseProcesses();

  return buildState("healthy", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 64,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 0,
    swapFreeMiB: 2048,
    swapSi: 0,
    swapSo: 0,
    majorFaults: 2,
    minorFaults: 380,
    pressureLevel: "low",
    reclaimActivity: "idle",
    breakdown: {
      appMiB: 3200,
      kernelMiB: 232,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      4300, 4250, 4280, 4200, 4210, 4190, 4220, 4200, 4180, 4200, 4210, 4200,
    ],
    swapActivityHistory: Array.from({ length: 12 }, () => ({ si: 0, so: 0 })),
    processes,
    appResponseMs: 85,
    oomEvents: [],
    leakTrendMiB: [],
    interpretation:
      "Healthy baseline: available memory is 4.2 GiB — plenty of headroom. Page cache (1.8 GiB) is reclaimable. No swap activity and low pressure.",
  });
}

function cacheHeavyState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 220;
  const cachedMiB = 4800;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 180;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~2992
  const availableMiB = 4600; // free + reclaimable cache

  return buildState("cache-heavy", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 128,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 0,
    swapFreeMiB: 2048,
    swapSi: 0,
    swapSo: 0,
    majorFaults: 1,
    minorFaults: 290,
    pressureLevel: "low",
    reclaimActivity: "light",
    breakdown: {
      appMiB: 2860,
      kernelMiB: 132,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      4700, 4680, 4650, 4620, 4610, 4600, 4590, 4595, 4600, 4610, 4605, 4600,
    ],
    swapActivityHistory: Array.from({ length: 12 }, () => ({ si: 0, so: 0 })),
    processes: baseProcesses(),
    appResponseMs: 88,
    oomEvents: [],
    leakTrendMiB: [],
    interpretation:
      "Cache-heavy but HEALTHY: free=180 MiB looks low, but available=4.6 GiB — the kernel can reclaim 4.8 GiB of page cache on demand. This is normal Linux behavior. No pressure, no swap.",
  });
}

function highConsumptionState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 96;
  const cachedMiB = 920;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 310;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~6866
  const availableMiB = 1100;

  const processes = baseProcesses().map((p) => {
    if (p.command === "java")
      return { ...p, rssMiB: 2400, memPercent: 29.3, vszMiB: 5800 };
    if (p.command === "postgres")
      return { ...p, rssMiB: 1800, memPercent: 22.0, vszMiB: 3100 };
    if (p.command === "node")
      return { ...p, rssMiB: 1200, memPercent: 14.6, vszMiB: 3400 };
    if (p.command === "redis")
      return { ...p, rssMiB: 420, memPercent: 5.1, vszMiB: 650 };
    return p;
  });

  return buildState("high-consumption", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 128,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 0,
    swapFreeMiB: 2048,
    swapSi: 0,
    swapSo: 0,
    majorFaults: 18,
    minorFaults: 2100,
    pressureLevel: "moderate",
    reclaimActivity: "light",
    breakdown: {
      appMiB: 6600,
      kernelMiB: 266,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      3200, 2800, 2400, 1900, 1600, 1400, 1250, 1200, 1150, 1100, 1090, 1100,
    ],
    swapActivityHistory: Array.from({ length: 12 }, () => ({ si: 0, so: 0 })),
    processes,
    appResponseMs: 240,
    oomEvents: [],
    leakTrendMiB: [],
    interpretation:
      "High consumption: applications have grown their RSS and displaced most page cache. Available=1.1 GiB remains — still some headroom, but declining trend. Monitor for pressure.",
  });
}

function memoryPressureState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 48;
  const cachedMiB = 310;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 92;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~7742
  const availableMiB = 380;

  const processes = baseProcesses().map((p) => {
    if (p.command === "java")
      return { ...p, rssMiB: 2900, memPercent: 35.4, vszMiB: 6200, state: "R" };
    if (p.command === "postgres")
      return { ...p, rssMiB: 2200, memPercent: 26.9, vszMiB: 3800, state: "S" };
    if (p.command === "node")
      return { ...p, rssMiB: 1600, memPercent: 19.5, vszMiB: 4000, state: "S" };
    if (p.command === "redis")
      return { ...p, rssMiB: 540, memPercent: 6.6, vszMiB: 820 };
    return p;
  });

  return buildState("memory-pressure", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 148,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 128,
    swapFreeMiB: 1920,
    swapSi: 4,
    swapSo: 12,
    majorFaults: 180,
    minorFaults: 8900,
    pressureLevel: "high",
    reclaimActivity: "elevated",
    breakdown: {
      appMiB: 7500,
      kernelMiB: 242,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      1200, 950, 780, 620, 500, 440, 410, 400, 395, 390, 382, 380,
    ],
    swapActivityHistory: [
      { si: 0, so: 0 },
      { si: 1, so: 2 },
      { si: 2, so: 4 },
      { si: 2, so: 6 },
      { si: 3, so: 8 },
      { si: 3, so: 9 },
      { si: 4, so: 10 },
      { si: 4, so: 11 },
      { si: 4, so: 12 },
      { si: 4, so: 12 },
      { si: 4, so: 12 },
      { si: 4, so: 12 },
    ],
    processes,
    appResponseMs: 820,
    oomEvents: [],
    leakTrendMiB: [],
    interpretation:
      "Memory pressure: available=380 MiB and declining. Kernel reclaims actively. Major faults elevated (180/s) — anonymous pages must be fetched from swap. App response is 820 ms, up from baseline.",
  });
}

function activeSwapState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 36;
  const cachedMiB = 180;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 72;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~7904
  const availableMiB = 240;

  const processes = baseProcesses().map((p) => {
    if (p.command === "java")
      return { ...p, rssMiB: 3100, memPercent: 37.8, vszMiB: 6500, state: "S" };
    if (p.command === "postgres")
      return { ...p, rssMiB: 2400, memPercent: 29.3, vszMiB: 4200, state: "S" };
    if (p.command === "node")
      return { ...p, rssMiB: 1800, memPercent: 22.0, vszMiB: 4400, state: "S" };
    if (p.command === "redis")
      return { ...p, rssMiB: 350, memPercent: 4.3, vszMiB: 580 };
    return p;
  });

  return buildState("active-swap", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 196,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 1024,
    swapFreeMiB: 1024,
    swapSi: 42,
    swapSo: 68,
    majorFaults: 390,
    minorFaults: 14200,
    pressureLevel: "high",
    reclaimActivity: "elevated",
    breakdown: {
      appMiB: 7700,
      kernelMiB: 204,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      800, 650, 500, 400, 320, 280, 260, 250, 245, 242, 240, 240,
    ],
    swapActivityHistory: [
      { si: 8, so: 15 },
      { si: 12, so: 20 },
      { si: 18, so: 28 },
      { si: 24, so: 35 },
      { si: 30, so: 45 },
      { si: 36, so: 55 },
      { si: 40, so: 60 },
      { si: 42, so: 65 },
      { si: 42, so: 68 },
      { si: 42, so: 68 },
      { si: 42, so: 68 },
      { si: 42, so: 68 },
    ],
    processes,
    appResponseMs: 1850,
    oomEvents: [],
    leakTrendMiB: [],
    interpretation:
      "Active swapping: si=42 pages/s and so=68 pages/s indicate the kernel is constantly moving pages between RAM and disk. Available=240 MiB. App response is 1850 ms — disk latency dominates.",
  });
}

function exhaustionState(): SimulatedMemoryState {
  const totalMiB = 8192;
  const buffersMiB = 18;
  const cachedMiB = 44;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const freeMiB = 22;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~8108
  const availableMiB = 58;

  const processes = baseProcesses()
    .filter((p) => p.command !== "batch-worker") // killed by OOM
    .map((p) => {
      if (p.command === "java")
        return {
          ...p,
          rssMiB: 3800,
          memPercent: 46.4,
          vszMiB: 7200,
          state: "R",
        };
      if (p.command === "postgres")
        return {
          ...p,
          rssMiB: 2600,
          memPercent: 31.7,
          vszMiB: 4600,
          state: "D",
        };
      if (p.command === "node")
        return {
          ...p,
          rssMiB: 1900,
          memPercent: 23.2,
          vszMiB: 4800,
          state: "S",
        };
      return p;
    });

  return buildState("exhaustion", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 220,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 2008,
    swapFreeMiB: 40,
    swapSi: 95,
    swapSo: 110,
    majorFaults: 1200,
    minorFaults: 42000,
    pressureLevel: "critical",
    reclaimActivity: "aggressive",
    breakdown: {
      appMiB: 8040,
      kernelMiB: 68,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [480, 380, 280, 200, 140, 100, 80, 70, 65, 60, 58, 58],
    swapActivityHistory: [
      { si: 20, so: 30 },
      { si: 35, so: 50 },
      { si: 50, so: 70 },
      { si: 65, so: 85 },
      { si: 78, so: 95 },
      { si: 88, so: 105 },
      { si: 92, so: 108 },
      { si: 94, so: 110 },
      { si: 95, so: 110 },
      { si: 95, so: 110 },
      { si: 95, so: 110 },
      { si: 95, so: 110 },
    ],
    processes,
    appResponseMs: 4200,
    oomEvents: [
      "Nov 19 14:03:12 memory-lab kernel: [oom_reaper] reaped process 3100 (batch-worker)",
      "Nov 19 14:03:12 memory-lab kernel: Out of memory: Killed process 3100 (batch-worker) total-vm:262144kB, anon-rss:83968kB",
      "Nov 19 14:03:12 memory-lab kernel: oom_score_adj: -17 → process 3100 score 982",
      "Nov 19 14:03:13 memory-lab kernel: [oom_reaper] done: batch-worker (3100)",
    ],
    leakTrendMiB: [],
    interpretation:
      "Memory exhaustion: near-zero available, swap almost full, si/so rates very high. OOM killer already fired — batch-worker was terminated. System is critically impaired.",
  });
}

function memoryLeakState(): SimulatedMemoryState {
  const leakTrendMiB = [
    120, 220, 380, 560, 780, 1040, 1340, 1680, 2060, 2480, 2940, 3450,
  ];

  const totalMiB = 8192;
  const buffersMiB = 60;
  const cachedMiB = 420;
  const buffCacheMiB = buffersMiB + cachedMiB;
  const leakyRss = leakTrendMiB[leakTrendMiB.length - 1] ?? 3450;
  const freeMiB = 180;
  const usedMiB = totalMiB - freeMiB - buffCacheMiB; // ~7532
  const availableMiB = 580;

  const processes = [
    ...baseProcesses().filter((p) => p.command !== "batch-worker"),
    {
      pid: 4820,
      user: "app",
      cpu: 1.4,
      memPercent: (leakyRss / totalMiB) * 100,
      rssMiB: leakyRss,
      vszMiB: leakyRss * 1.4,
      state: "R",
      command: "leaky-app",
    },
  ];

  return buildState("memory-leak", {
    totalMiB,
    usedMiB,
    freeMiB,
    sharedMiB: 112,
    buffersMiB,
    cachedMiB,
    buffCacheMiB,
    availableMiB,
    swapTotalMiB: 2048,
    swapUsedMiB: 384,
    swapFreeMiB: 1664,
    swapSi: 8,
    swapSo: 22,
    majorFaults: 240,
    minorFaults: 11200,
    pressureLevel: "high",
    reclaimActivity: "elevated",
    breakdown: {
      appMiB: 7250,
      kernelMiB: 282,
      buffersMiB,
      pageCacheMiB: cachedMiB,
      freeMiB,
    },
    availableHistory: [
      4800, 4200, 3600, 3000, 2400, 1900, 1480, 1120, 880, 720, 620, 580,
    ],
    swapActivityHistory: [
      { si: 0, so: 0 },
      { si: 0, so: 1 },
      { si: 1, so: 2 },
      { si: 2, so: 4 },
      { si: 3, so: 7 },
      { si: 5, so: 11 },
      { si: 6, so: 14 },
      { si: 7, so: 18 },
      { si: 8, so: 20 },
      { si: 8, so: 21 },
      { si: 8, so: 22 },
      { si: 8, so: 22 },
    ],
    processes,
    appResponseMs: 1120,
    oomEvents: [],
    leakTrendMiB,
    interpretation:
      "Memory leak: `leaky-app` (pid 4820) RSS has grown from ~120 MiB to 3.4 GiB over the observation period. Available memory trends downward correspondingly. Swap activity rising.",
  });
}

// ---------------------------------------------------------------------------
// Public API — condition helpers
// ---------------------------------------------------------------------------

export function isMemoryConditionId(value: string): value is MemoryConditionId {
  return MEMORY_CONDITIONS.some((c) => c.id === value);
}

export function getMemoryCondition(id: MemoryConditionId): MemoryConditionMeta {
  return MEMORY_CONDITIONS.find((c) => c.id === id) ?? MEMORY_CONDITIONS[0]!;
}

export function getDashboardMemoryConditions(): readonly MemoryConditionMeta[] {
  return MEMORY_CONDITIONS.filter((c) => c.dashboard);
}

export function createInitialMemoryState(
  conditionId: MemoryConditionId = "healthy",
): SimulatedMemoryState {
  switch (conditionId) {
    case "cache-heavy":
      return cacheHeavyState();
    case "high-consumption":
      return highConsumptionState();
    case "memory-pressure":
      return memoryPressureState();
    case "active-swap":
      return activeSwapState();
    case "exhaustion":
      return exhaustionState();
    case "memory-leak":
      return memoryLeakState();
    case "healthy":
    default:
      return healthyState();
  }
}

// ---------------------------------------------------------------------------
// Metric status
// ---------------------------------------------------------------------------

export function memoryMetricStatus(
  kind:
    | "available"
    | "free"
    | "swap-used"
    | "swap-activity"
    | "pressure"
    | "faults"
    | "app-response",
  state: SimulatedMemoryState,
): MetricStatus {
  switch (kind) {
    case "available": {
      const pct = (state.availableMiB / state.totalMiB) * 100;
      if (pct < 5) return "critical";
      if (pct < 15) return "warning";
      return "normal";
    }
    case "free": {
      const pct = (state.freeMiB / state.totalMiB) * 100;
      if (pct < 2) return "critical";
      if (pct < 10) return "warning";
      return "normal";
    }
    case "swap-used": {
      const pct =
        state.swapTotalMiB > 0
          ? (state.swapUsedMiB / state.swapTotalMiB) * 100
          : 0;
      if (pct > 80) return "critical";
      if (pct > 40) return "warning";
      return "normal";
    }
    case "swap-activity":
      if (state.swapSi + state.swapSo > 100) return "critical";
      if (state.swapSi + state.swapSo > 20) return "warning";
      return "normal";
    case "pressure":
      if (state.pressureLevel === "critical") return "critical";
      if (state.pressureLevel === "high") return "warning";
      return "normal";
    case "faults":
      if (state.majorFaults > 500) return "critical";
      if (state.majorFaults > 50) return "warning";
      return "normal";
    case "app-response":
      if (state.appResponseMs >= 2000) return "critical";
      if (state.appResponseMs >= 500) return "warning";
      return "normal";
    default:
      return "normal";
  }
}

// ---------------------------------------------------------------------------
// Prompt and suggestions
// ---------------------------------------------------------------------------

export function formatMemoryAndSwapPrompt(): string {
  return `${SIMULATED_MEMORY_USER}@${SIMULATED_MEMORY_HOST}:~$`;
}

export const DEFAULT_MEMORY_AND_SWAP_SUGGESTIONS = [
  "free -h",
  "vmstat",
  "vmstat 1 5",
  "cat /proc/meminfo",
  "top",
  "ps aux --sort=-%mem",
  "swapon --show",
  "help",
] as const;

// ---------------------------------------------------------------------------
// Allocation lab helpers
// NOTE: This is NOT a reproduction of kernel memory management.
// It is a simplified educational model for demonstrating
// how allocation pressure triggers cache reclaim and swap.
// ---------------------------------------------------------------------------

export function createAllocationExerciseState(): SimulatedMemoryState {
  const base = healthyState();
  return {
    ...base,
    allocationApps: DEFAULT_ALLOCATION_APPS.map((a) => ({ ...a })),
  };
}

export function allocateMemory(
  state: SimulatedMemoryState,
  appId: string,
  amountMiB: number,
): SimulatedMemoryState {
  const next = cloneState(state);
  const appIndex = next.allocationApps.findIndex((a) => a.id === appId);
  if (appIndex < 0) return next;

  const app = next.allocationApps[appIndex]!;
  const actual = Math.min(
    amountMiB,
    app.maxMiB - app.allocatedMiB,
    Math.max(0, next.availableMiB - 50), // keep at least 50 MiB headroom
  );
  if (actual <= 0) return next;

  const updatedApps = next.allocationApps.map((a) =>
    a.id === appId ? { ...a, allocatedMiB: a.allocatedMiB + actual } : a,
  );

  // Reclaim from cache first
  let remaining = actual;
  let newCached = next.cachedMiB;
  if (remaining > 0 && newCached > 128) {
    const reclaimable = Math.min(remaining, newCached - 128);
    newCached -= reclaimable;
    remaining -= reclaimable;
  }

  // Then take from swap if still not enough
  let newSwapUsed = next.swapUsedMiB;
  let newSwapSo = next.swapSo;
  if (remaining > 0 && next.swapTotalMiB > 0) {
    const swapNeeded = Math.min(remaining, next.swapFreeMiB, actual * 0.3);
    newSwapUsed = Math.min(next.swapTotalMiB, next.swapUsedMiB + swapNeeded);
    if (swapNeeded > 0)
      newSwapSo = Math.min(200, next.swapSo + Math.round(swapNeeded / 10));
  }

  const totalAllocated = updatedApps.reduce(
    (sum, a) => sum + a.allocatedMiB,
    0,
  );
  const usedMiB = clampMiB(totalAllocated + 400); // 400 MiB base kernel/system
  const buffCacheMiB = next.buffersMiB + newCached;
  const freeMiB = clampMiB(next.totalMiB - usedMiB - buffCacheMiB);
  const availableMiB = clampMiB(freeMiB + newCached * 0.9);

  // Determine pressure
  const availablePct = (availableMiB / next.totalMiB) * 100;
  const pressureLevel: SimulatedMemoryState["pressureLevel"] =
    availablePct < 3
      ? "critical"
      : availablePct < 8
        ? "high"
        : availablePct < 15
          ? "moderate"
          : "low";

  const reclaimActivity: SimulatedMemoryState["reclaimActivity"] =
    pressureLevel === "critical"
      ? "aggressive"
      : pressureLevel === "high"
        ? "elevated"
        : pressureLevel === "moderate"
          ? "light"
          : "idle";

  return {
    ...next,
    usedMiB,
    freeMiB,
    cachedMiB: newCached,
    buffCacheMiB,
    availableMiB,
    swapUsedMiB: newSwapUsed,
    swapFreeMiB: next.swapTotalMiB - newSwapUsed,
    swapSo: newSwapSo,
    pressureLevel,
    reclaimActivity,
    allocationApps: updatedApps,
    breakdown: {
      ...next.breakdown,
      appMiB: usedMiB,
      pageCacheMiB: newCached,
      freeMiB: freeMiB,
    },
  };
}

export function releaseMemory(
  state: SimulatedMemoryState,
  appId: string,
  amountMiB: number,
): SimulatedMemoryState {
  const next = cloneState(state);
  const appIndex = next.allocationApps.findIndex((a) => a.id === appId);
  if (appIndex < 0) return next;

  const app = next.allocationApps[appIndex]!;
  const actual = Math.min(amountMiB, app.allocatedMiB);
  if (actual <= 0) return next;

  const updatedApps = next.allocationApps.map((a) =>
    a.id === appId
      ? { ...a, allocatedMiB: Math.max(0, a.allocatedMiB - actual) }
      : a,
  );

  const totalAllocated = updatedApps.reduce(
    (sum, a) => sum + a.allocatedMiB,
    0,
  );
  const usedMiB = clampMiB(totalAllocated + 400);
  const newCached = Math.min(2048, next.cachedMiB + actual * 0.4); // some returns to cache
  const buffCacheMiB = next.buffersMiB + newCached;
  const freeMiB = clampMiB(next.totalMiB - usedMiB - buffCacheMiB);
  const availableMiB = clampMiB(freeMiB + newCached * 0.9);

  // Drain swap
  const newSwapUsed = Math.max(0, next.swapUsedMiB - actual * 0.2);
  const newSwapSo = Math.max(0, next.swapSo - 5);

  const availablePct = (availableMiB / next.totalMiB) * 100;
  const pressureLevel: SimulatedMemoryState["pressureLevel"] =
    availablePct < 3
      ? "critical"
      : availablePct < 8
        ? "high"
        : availablePct < 15
          ? "moderate"
          : "low";

  const reclaimActivity: SimulatedMemoryState["reclaimActivity"] =
    pressureLevel === "critical"
      ? "aggressive"
      : pressureLevel === "high"
        ? "elevated"
        : pressureLevel === "moderate"
          ? "light"
          : "idle";

  return {
    ...next,
    usedMiB,
    freeMiB,
    cachedMiB: newCached,
    buffCacheMiB,
    availableMiB,
    swapUsedMiB: newSwapUsed,
    swapFreeMiB: next.swapTotalMiB - newSwapUsed,
    swapSo: newSwapSo,
    pressureLevel,
    reclaimActivity,
    allocationApps: updatedApps,
    breakdown: {
      ...next.breakdown,
      appMiB: usedMiB,
      pageCacheMiB: newCached,
      freeMiB,
    },
  };
}

export function resetAllocationExercise(): SimulatedMemoryState {
  return createAllocationExerciseState();
}

// ---------------------------------------------------------------------------
// Terminal command formatters
// ---------------------------------------------------------------------------

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  hostname                          Show the simulated hostname",
  "  clear                             Clear the terminal screen",
  "  free                              Show memory/swap usage",
  "  free -h                           Show memory/swap usage (human-readable)",
  "  vmstat                            Show memory/swap/io activity snapshot",
  "  vmstat 1 5                        Show five predefined vmstat samples",
  "  top                               Show Mem/Swap lines + process snapshot",
  "  ps aux                            List processes with RSS/%MEM",
  "  ps aux --sort=-%mem               Sort by memory usage (descending)",
  "  cat /proc/meminfo                 Show detailed /proc/meminfo fields",
  "  swapon --show                     Show active swap devices",
  "  swapon -s                         Alias for swapon --show",
  "  sar -r                            Show memory utilization report",
  "",
  "Examples:",
  "  free -h",
  "  cat /proc/meminfo",
  "  ps aux --sort=-%mem",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

function formatFree(state: SimulatedMemoryState, human: boolean): string[] {
  function fmt(mib: number): string {
    if (!human) return padStart(mibToKiB(mib), 10);
    return padStart(formatMiB(mib), 8);
  }

  const unit = human ? "" : " (kB)";
  const header = `${pad("", 15)}${pad("total", 10)}${pad("used", 10)}${pad("free", 10)}${pad("shared", 10)}${pad("buff/cache", 12)}available`;
  const memLine = `Mem:${pad("", 11)}${fmt(state.totalMiB)}${fmt(state.usedMiB)}${fmt(state.freeMiB)}${fmt(state.sharedMiB)}${padStart(human ? formatMiB(state.buffCacheMiB) : mibToKiB(state.buffCacheMiB), 12)}${padStart(human ? formatMiB(state.availableMiB) : mibToKiB(state.availableMiB), 10)}`;
  const swapLine = `Swap:${pad("", 10)}${fmt(state.swapTotalMiB)}${fmt(state.swapUsedMiB)}${fmt(state.swapFreeMiB)}`;

  return [
    unit ? `${header}${unit}` : header,
    memLine,
    swapLine,
    "",
    "(simulated free — fictional values, not your host memory)",
  ];
}

function formatVmstat(state: SimulatedMemoryState, samples: number): string[] {
  const header =
    "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----";
  const columns =
    " r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st";

  const lines = [header, columns];
  for (let i = 0; i < samples; i += 1) {
    const jitter = i % 2 === 0 ? 0 : 1;
    const swpd = mibToKiB(state.swapUsedMiB);
    const free = mibToKiB(state.freeMiB) - i * 120;
    const buff = mibToKiB(state.buffersMiB);
    const cache = mibToKiB(state.cachedMiB);
    const si = state.swapSi + jitter;
    const so = state.swapSo + jitter;
    const bi = state.conditionId === "active-swap" ? 420 + i * 8 : 12 + i;
    const bo = state.conditionId === "active-swap" ? 580 + i * 10 : 8 + i;

    lines.push(
      [
        padStart(1 + (i % 2), 2),
        padStart(0, 2),
        padStart(swpd, 7),
        padStart(Math.max(0, free), 7),
        padStart(buff, 6),
        padStart(cache, 6),
        padStart(si, 5),
        padStart(so, 5),
        padStart(bi, 5),
        padStart(bo, 5),
        padStart(220 + jitter, 5),
        padStart(480 + jitter, 5),
        padStart(12, 3),
        padStart(4, 3),
        padStart(84, 3),
        padStart(0, 3),
        padStart(0, 3),
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

function formatTop(state: SimulatedMemoryState): string[] {
  const byCpu = [...state.processes].sort(
    (a, b) => b.memPercent - a.memPercent,
  );
  const lines = [
    `top - ${state.clockTime} up ${state.uptimeHuman},  2 users,  load average: 0.84, 0.72, 0.65`,
    `Tasks: ${state.processes.length} total,   1 running,   ${state.processes.length - 1} sleeping`,
    `%Cpu(s):  8.4 us,  2.1 sy,  0.0 ni, 88.9 id,  0.4 wa,  0.2 hi,  0.0 si`,
    `MiB Mem :  ${state.totalMiB.toFixed(1)} total,  ${state.freeMiB.toFixed(1)} free,  ${state.usedMiB.toFixed(1)} used,  ${state.buffCacheMiB.toFixed(1)} buff/cache`,
    `MiB Swap:  ${state.swapTotalMiB.toFixed(1)} total,  ${state.swapFreeMiB.toFixed(1)} free,  ${state.swapUsedMiB.toFixed(1)} used.  ${state.availableMiB.toFixed(1)} avail Mem`,
    "",
    `${pad("PID", 7)} ${pad("USER", 8)} ${pad("RES", 8)} ${pad("VIRT", 10)} ${pad("%MEM", 6)} ${pad("S", 2)} COMMAND`,
  ];

  for (const p of byCpu) {
    lines.push(
      `${pad(p.pid, 7)} ${pad(p.user, 8)} ${padStart(`${p.rssMiB}m`, 8)} ${padStart(`${p.vszMiB}m`, 10)} ${padStart(p.memPercent.toFixed(1), 6)} ${pad(p.state, 2)} ${p.command}`,
    );
  }

  lines.push(
    "",
    "(simulated top Mem/Swap lines — fictional process table)",
    "Note: Available memory ≈ free + reclaimable cache (not an independent allocation).",
  );
  return lines;
}

function formatPsAux(
  state: SimulatedMemoryState,
  sortByMem: boolean,
): string[] {
  const processes = sortByMem
    ? [...state.processes].sort((a, b) => b.memPercent - a.memPercent)
    : [...state.processes];

  const lines = [
    `${pad("USER", 8)} ${pad("PID", 6)} ${pad("%CPU", 5)} ${pad("%MEM", 6)} ${pad("RSS", 7)} ${pad("VSZ", 8)} ${pad("STAT", 5)} COMMAND`,
  ];

  for (const p of processes) {
    lines.push(
      `${pad(p.user, 8)} ${pad(p.pid, 6)} ${pad(p.cpu.toFixed(1), 5)} ${pad(p.memPercent.toFixed(1), 6)} ${pad(`${p.rssMiB}MiB`, 7)} ${pad(`${p.vszMiB}MiB`, 8)} ${pad(p.state, 5)} ${p.command}`,
    );
  }

  lines.push(
    "",
    "(simulated ps — fictional process table; RSS=resident, VSZ=virtual)",
    "Tip: RSS shows physical memory used. VSZ (virtual) includes mapped but not loaded pages.",
  );
  return lines;
}

function formatProcMeminfo(state: SimulatedMemoryState): string[] {
  return [
    `MemTotal:       ${padStart(mibToKiB(state.totalMiB), 10)} kB`,
    `MemFree:        ${padStart(mibToKiB(state.freeMiB), 10)} kB`,
    `MemAvailable:   ${padStart(mibToKiB(state.availableMiB), 10)} kB`,
    `Buffers:        ${padStart(mibToKiB(state.buffersMiB), 10)} kB`,
    `Cached:         ${padStart(mibToKiB(state.cachedMiB), 10)} kB`,
    `SwapCached:     ${padStart(mibToKiB(state.swapUsedMiB > 0 ? Math.round(state.swapUsedMiB * 0.05) : 0), 10)} kB`,
    `Active:         ${padStart(mibToKiB(Math.round(state.usedMiB * 0.75)), 10)} kB`,
    `Inactive:       ${padStart(mibToKiB(Math.round(state.usedMiB * 0.25)), 10)} kB`,
    `Active(anon):   ${padStart(mibToKiB(Math.round(state.usedMiB * 0.55)), 10)} kB`,
    `Inactive(anon): ${padStart(mibToKiB(Math.round(state.usedMiB * 0.1)), 10)} kB`,
    `Active(file):   ${padStart(mibToKiB(Math.round(state.cachedMiB * 0.6)), 10)} kB`,
    `Inactive(file): ${padStart(mibToKiB(Math.round(state.cachedMiB * 0.4)), 10)} kB`,
    `Unevictable:    ${padStart(mibToKiB(32), 10)} kB`,
    `Mlocked:        ${padStart(0, 10)} kB`,
    `SwapTotal:      ${padStart(mibToKiB(state.swapTotalMiB), 10)} kB`,
    `SwapFree:       ${padStart(mibToKiB(state.swapFreeMiB), 10)} kB`,
    `Dirty:          ${padStart(mibToKiB(state.conditionId === "active-swap" ? 180 : 24), 10)} kB`,
    `Writeback:      ${padStart(0, 10)} kB`,
    `AnonPages:      ${padStart(mibToKiB(Math.round(state.usedMiB * 0.65)), 10)} kB`,
    `Mapped:         ${padStart(mibToKiB(Math.round(state.usedMiB * 0.18)), 10)} kB`,
    `Shmem:          ${padStart(mibToKiB(state.sharedMiB), 10)} kB`,
    `KReclaimable:   ${padStart(mibToKiB(Math.round(state.cachedMiB * 0.3)), 10)} kB`,
    `Slab:           ${padStart(mibToKiB(220), 10)} kB`,
    `SReclaimable:   ${padStart(mibToKiB(160), 10)} kB`,
    `SUnreclaim:     ${padStart(mibToKiB(60), 10)} kB`,
    `PageTables:     ${padStart(mibToKiB(32), 10)} kB`,
    `VmallocTotal:   ${padStart(34359738367, 10)} kB`,
    `VmallocUsed:    ${padStart(mibToKiB(128), 10)} kB`,
    `HugePages_Total:${padStart(0, 10)}`,
    `HugePages_Free: ${padStart(0, 10)}`,
    "",
    "(simulated /proc/meminfo — educational values, not from your host)",
    "Key fields: MemAvailable ≈ free + reclaimable cache (not a separate allocation).",
  ];
}

function formatSwaponShow(state: SimulatedMemoryState): string[] {
  if (state.swapTotalMiB === 0) {
    return [
      "No swap configured on this simulated host.",
      "(simulated swapon output)",
    ];
  }
  const usedPct = ((state.swapUsedMiB / state.swapTotalMiB) * 100).toFixed(0);
  return [
    `${pad("NAME", 20)} ${pad("TYPE", 10)} ${pad("SIZE", 10)} ${pad("USED", 10)} PRIO`,
    `${pad("/dev/sda2", 20)} ${pad("partition", 10)} ${pad(formatMiB(state.swapTotalMiB), 10)} ${pad(formatMiB(state.swapUsedMiB), 10)} -2`,
    "",
    `Swap utilization: ${usedPct}%  si: ${state.swapSi} pages/s  so: ${state.swapSo} pages/s`,
    "",
    state.swapSi + state.swapSo > 20
      ? `Warning (simulated): active swap I/O detected (si=${state.swapSi} so=${state.swapSo}). Consider investigating available memory.`
      : state.swapUsedMiB > 0
        ? `Note: swap has pages allocated but si/so rates are low — existing allocation, not active thrashing.`
        : `Note: swap is configured and empty — normal healthy reserve.`,
    "",
    "(simulated swapon --show — not reading host swap devices)",
  ];
}

function formatSarR(state: SimulatedMemoryState): string[] {
  return [
    `Linux 6.8.0-rean (memory-lab) \t${state.clockTime}`,
    "",
    `${pad("Time", 10)} ${padStart("kbmemfree", 12)} ${padStart("kbavail", 12)} ${padStart("kbmemused", 12)} ${padStart("%memused", 10)} ${padStart("kbbuffers", 12)} ${padStart("kbcached", 12)} ${padStart("kbswpused", 12)} ${padStart("%swpused", 10)}`,
    `${pad("14:00:00", 10)} ${padStart(mibToKiB(state.freeMiB + 200), 12)} ${padStart(mibToKiB(state.availableMiB + 180), 12)} ${padStart(mibToKiB(state.usedMiB - 80), 12)} ${padStart(((state.usedMiB / state.totalMiB) * 100 - 2).toFixed(2), 10)} ${padStart(mibToKiB(state.buffersMiB), 12)} ${padStart(mibToKiB(state.cachedMiB + 80), 12)} ${padStart(mibToKiB(state.swapUsedMiB), 12)} ${padStart(state.swapTotalMiB > 0 ? ((state.swapUsedMiB / state.swapTotalMiB) * 100).toFixed(2) : "0.00", 10)}`,
    `${pad("14:05:38", 10)} ${padStart(mibToKiB(state.freeMiB), 12)} ${padStart(mibToKiB(state.availableMiB), 12)} ${padStart(mibToKiB(state.usedMiB), 12)} ${padStart(((state.usedMiB / state.totalMiB) * 100).toFixed(2), 10)} ${padStart(mibToKiB(state.buffersMiB), 12)} ${padStart(mibToKiB(state.cachedMiB), 12)} ${padStart(mibToKiB(state.swapUsedMiB), 12)} ${padStart(state.swapTotalMiB > 0 ? ((state.swapUsedMiB / state.swapTotalMiB) * 100).toFixed(2) : "0.00", 10)}`,
    "",
    "(simulated sar -r — fictional memory report)",
  ];
}

// ---------------------------------------------------------------------------
// Command dispatcher
// ---------------------------------------------------------------------------

function normalizeCommand(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function simulateMemoryAndSwapCommand(
  raw: string,
  state: SimulatedMemoryState,
): SimulateMemoryResult {
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

  if (command === "free") {
    return {
      result: { kind: "output", lines: formatFree(nextState, false) },
      state: nextState,
    };
  }

  if (
    command === "free -h" ||
    command === "free --human" ||
    command === "free -m"
  ) {
    return {
      result: { kind: "output", lines: formatFree(nextState, true) },
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

  if (command === "top") {
    return {
      result: { kind: "output", lines: formatTop(nextState) },
      state: nextState,
    };
  }

  if (command === "ps aux") {
    return {
      result: { kind: "output", lines: formatPsAux(nextState, false) },
      state: nextState,
    };
  }

  if (
    command === "ps aux --sort=-%mem" ||
    command === "ps aux --sort=-%rss" ||
    command === "ps aux --sort=-rss"
  ) {
    return {
      result: { kind: "output", lines: formatPsAux(nextState, true) },
      state: nextState,
    };
  }

  if (command === "cat /proc/meminfo") {
    return {
      result: { kind: "output", lines: formatProcMeminfo(nextState) },
      state: nextState,
    };
  }

  if (command === "swapon --show" || command === "swapon -s") {
    return {
      result: { kind: "output", lines: formatSwaponShow(nextState) },
      state: nextState,
    };
  }

  if (command === "sar -r") {
    return {
      result: { kind: "output", lines: formatSarR(nextState) },
      state: nextState,
    };
  }

  return {
    result: { kind: "output", lines: [...UNSUPPORTED_MESSAGE] },
    state: nextState,
  };
}
