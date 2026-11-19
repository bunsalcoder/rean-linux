"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  createInitialMemoryState,
  getDashboardMemoryConditions,
  getMemoryCondition,
  memoryMetricStatus,
  type MemoryConditionId,
  type MetricStatus,
  type SimulatedMemoryState,
} from "@/lib/simulate-memory-and-swap";
import { cn } from "@/lib/utils";

const DASHBOARD_SUGGESTIONS = [
  { command: "free -h", label: "free -h" },
  { command: "vmstat 1 5", label: "vmstat 1 5" },
  { command: "cat /proc/meminfo", label: "/proc/meminfo" },
  { command: "top", label: "top" },
  { command: "ps aux --sort=-%mem", label: "ps aux" },
  { command: "swapon --show", label: "swapon" },
  { command: "help", label: "help" },
] as const;

function statusLabel(status: MetricStatus): string {
  if (status === "critical") return "Critical";
  if (status === "warning") return "Warning";
  return "Normal";
}

function MetricCard({
  title,
  value,
  detail,
  status,
  percent,
}: {
  title: string;
  value: string;
  detail: string;
  status: MetricStatus;
  percent: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="border-border bg-background space-y-2 rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase",
            status === "critical" && "bg-destructive/15 text-destructive",
            status === "warning" &&
              "bg-amber-500/15 text-amber-700 dark:text-amber-400",
            status === "normal" && "bg-primary/10 text-primary",
          )}
        >
          {statusLabel(status)}
        </span>
      </div>
      <p className="text-foreground font-mono text-lg tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{detail}</p>
      <div
        className="bg-muted h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={title}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            status === "critical" && "bg-destructive",
            status === "warning" && "bg-amber-500",
            status === "normal" && "bg-primary",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function AvailableHistoryChart({
  history,
  totalMiB,
}: {
  history: readonly number[];
  totalMiB: number;
}) {
  const max = Math.max(totalMiB, ...history);
  return (
    <div className="border-border bg-background space-y-2 rounded-lg border p-3">
      <p className="text-foreground text-sm font-medium">
        Available memory history
      </p>
      <p className="text-muted-foreground text-xs">
        Simulated available MiB over a fictional observation window.
      </p>
      <div
        className="flex h-28 items-end gap-1"
        role="img"
        aria-label="Available memory history bar chart"
      >
        {history.map((value, index) => (
          <div
            key={`${index}-${value}`}
            className="bg-primary/80 w-full rounded-t-sm transition-[height] duration-300"
            style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
            title={`${value} MiB`}
          />
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between font-mono text-[0.65rem]">
        <span>older</span>
        <span>
          newer · last {history[history.length - 1] ?? 0} MiB available
        </span>
      </div>
    </div>
  );
}

function MemoryStackBar({ state }: { state: SimulatedMemoryState }) {
  const { totalMiB, breakdown } = state;
  const segments = [
    { label: "Apps", mib: breakdown.appMiB, color: "bg-destructive/70" },
    { label: "Kernel", mib: breakdown.kernelMiB, color: "bg-amber-500/70" },
    { label: "Buffers", mib: breakdown.buffersMiB, color: "bg-blue-400/70" },
    {
      label: "Page cache",
      mib: breakdown.pageCacheMiB,
      color: "bg-green-500/70",
    },
    { label: "Free", mib: breakdown.freeMiB, color: "bg-muted-foreground/20" },
  ];

  return (
    <div className="border-border bg-background space-y-3 rounded-lg border p-3">
      <p className="text-foreground text-sm font-medium">
        Memory allocation breakdown
      </p>
      <p className="text-muted-foreground text-xs">
        Stacked view of how {totalMiB} MiB RAM is used. Available (
        {state.availableMiB} MiB) is NOT a separate slice — it reflects free +
        reclaimable cache.
      </p>
      <div className="flex h-6 overflow-hidden rounded-sm">
        {segments.map(({ label, mib, color }) => {
          const pct = Math.max(0, (mib / totalMiB) * 100);
          return pct > 0.3 ? (
            <div
              key={label}
              className={cn("h-full", color)}
              style={{ width: `${pct}%` }}
              title={`${label}: ${mib} MiB (${pct.toFixed(0)}%)`}
            />
          ) : null;
        })}
      </div>
      <ul className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        {segments.map(({ label, mib, color }) => (
          <li key={label} className="flex items-center gap-1.5">
            <span
              className={cn("inline-block h-2.5 w-2.5 rounded-sm", color)}
            />
            {label}: {mib} MiB
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground text-[0.7rem]">
        Available ({state.availableMiB} MiB) ≈ free ({breakdown.freeMiB} MiB) +
        reclaimable cache (~
        {Math.round(breakdown.pageCacheMiB * 0.8)} MiB)
      </p>
    </div>
  );
}

function SwapBar({ state }: { state: SimulatedMemoryState }) {
  const pctUsed =
    state.swapTotalMiB > 0 ? (state.swapUsedMiB / state.swapTotalMiB) * 100 : 0;
  const status = memoryMetricStatus("swap-used", state);
  return (
    <div className="border-border bg-background space-y-2 rounded-lg border p-3">
      <p className="text-foreground text-sm font-medium">Swap usage</p>
      <p className="text-muted-foreground text-xs">
        {state.swapUsedMiB} MiB used / {state.swapTotalMiB} MiB total · si:{" "}
        {state.swapSi} pages/s · so: {state.swapSo} pages/s
      </p>
      <div
        className="bg-muted h-3 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pctUsed)}
        aria-label="Swap usage"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            status === "critical" && "bg-destructive",
            status === "warning" && "bg-amber-500",
            status === "normal" && "bg-primary",
          )}
          style={{ width: `${pctUsed}%` }}
        />
      </div>
      {state.swapSi + state.swapSo > 20 ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Active swap I/O detected: si={state.swapSi} + so={state.swapSo}{" "}
          pages/s
        </p>
      ) : state.swapUsedMiB > 0 ? (
        <p className="text-muted-foreground text-xs">
          Swap allocated but not actively thrashing (si+so low).
        </p>
      ) : (
        <p className="text-muted-foreground text-xs">
          Swap is empty — healthy reserve.
        </p>
      )}
    </div>
  );
}

function ProcessTable({ state }: { state: SimulatedMemoryState }) {
  const processes = [...state.processes].sort(
    (a, b) => b.memPercent - a.memPercent,
  );
  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="text-muted-foreground sr-only">
          Top simulated memory-consuming processes
        </caption>
        <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
          <tr>
            <th className="px-3 py-2 font-medium">PID</th>
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium">Command</th>
            <th className="px-3 py-2 font-medium">%MEM</th>
            <th className="px-3 py-2 font-medium">RSS (MiB)</th>
            <th className="px-3 py-2 font-medium">VSZ (MiB)</th>
            <th className="px-3 py-2 font-medium">State</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.pid} className="border-border border-t">
              <td className="px-3 py-2 font-mono text-xs">{p.pid}</td>
              <td className="px-3 py-2 font-mono text-xs">{p.user}</td>
              <td className="px-3 py-2 font-mono text-xs">{p.command}</td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {p.memPercent.toFixed(1)}
              </td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {p.rssMiB}
              </td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {p.vszMiB}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{p.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MemoryAndSwapDashboard() {
  const [conditionId, setConditionId] = useState<MemoryConditionId>("healthy");
  const [terminalKey, setTerminalKey] = useState(0);
  const [state, setState] = useState<SimulatedMemoryState>(() =>
    createInitialMemoryState("healthy"),
  );

  const condition = getMemoryCondition(conditionId);
  const dashboardConditions = getDashboardMemoryConditions();

  function selectCondition(id: MemoryConditionId) {
    setConditionId(id);
    setState(createInitialMemoryState(id));
    setTerminalKey((v) => v + 1);
  }

  function resetCondition() {
    setState(createInitialMemoryState(conditionId));
    setTerminalKey((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Memory and swap monitoring dashboard
        </h3>
        <p className="text-muted-foreground text-sm">
          Fictional Linux host metrics only — switch conditions and confirm
          readings in the terminal. Values never come from your computer.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {dashboardConditions.map((item) => {
          const active = item.id === conditionId;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => selectCondition(item.id)}
            >
              {item.label}
            </Button>
          );
        })}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={resetCondition}
        >
          Reset condition
        </Button>
      </div>

      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">{condition.label}</p>
        <p className="text-sm">
          <strong className="text-foreground">Symptom:</strong>{" "}
          {condition.symptom}
        </p>
        <p className="text-muted-foreground text-sm">{state.interpretation}</p>
        <p className="text-muted-foreground text-sm">
          Host <span className="font-mono">{state.hostname}</span> · total{" "}
          {state.totalMiB} MiB RAM · swap {state.swapTotalMiB} MiB · up{" "}
          {state.uptimeHuman} ·{" "}
          <span className="font-medium">Simulated metrics</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total RAM"
          value={`${state.totalMiB} MiB`}
          detail="Physical memory installed"
          status="normal"
          percent={100}
        />
        <MetricCard
          title="Used (app + kernel)"
          value={`${state.usedMiB} MiB`}
          detail={`${((state.usedMiB / state.totalMiB) * 100).toFixed(0)}% of total RAM`}
          status={state.usedMiB / state.totalMiB > 0.9 ? "critical" : "normal"}
          percent={(state.usedMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="Free (unallocated)"
          value={`${state.freeMiB} MiB`}
          detail="Unallocated pages — often low on healthy Linux"
          status={memoryMetricStatus("free", state)}
          percent={100 - (state.freeMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="Available"
          value={`${state.availableMiB} MiB`}
          detail="Best indicator of real headroom (free + reclaimable cache)"
          status={memoryMetricStatus("available", state)}
          percent={100 - (state.availableMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="Buffers"
          value={`${state.buffersMiB} MiB`}
          detail="Kernel buffer cache (block I/O metadata)"
          status="normal"
          percent={(state.buffersMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="Page cache"
          value={`${state.cachedMiB} MiB`}
          detail="File data cache — reclaimable on demand"
          status="normal"
          percent={(state.cachedMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="Shared memory"
          value={`${state.sharedMiB} MiB`}
          detail="Shared between processes (tmpfs, IPC)"
          status="normal"
          percent={(state.sharedMiB / state.totalMiB) * 100}
        />
        <MetricCard
          title="App response time"
          value={`${state.appResponseMs} ms`}
          detail="Simulated end-user latency for the app tier"
          status={memoryMetricStatus("app-response", state)}
          percent={Math.min(100, state.appResponseMs / 50)}
        />
        <MetricCard
          title="Swap used"
          value={`${state.swapUsedMiB} MiB`}
          detail={`${state.swapTotalMiB} MiB total · ${state.swapFreeMiB} MiB free`}
          status={memoryMetricStatus("swap-used", state)}
          percent={
            state.swapTotalMiB > 0
              ? (state.swapUsedMiB / state.swapTotalMiB) * 100
              : 0
          }
        />
        <MetricCard
          title="Swap in / out"
          value={`${state.swapSi} / ${state.swapSo} pg/s`}
          detail="si=pages in from disk, so=pages out to disk"
          status={memoryMetricStatus("swap-activity", state)}
          percent={Math.min(100, (state.swapSi + state.swapSo) * 0.8)}
        />
        <MetricCard
          title="Memory pressure"
          value={
            state.pressureLevel.charAt(0).toUpperCase() +
            state.pressureLevel.slice(1)
          }
          detail={`Reclaim activity: ${state.reclaimActivity}`}
          status={memoryMetricStatus("pressure", state)}
          percent={
            state.pressureLevel === "critical"
              ? 95
              : state.pressureLevel === "high"
                ? 72
                : state.pressureLevel === "moderate"
                  ? 40
                  : 10
          }
        />
        <MetricCard
          title="Major page faults"
          value={`${state.majorFaults}/s`}
          detail={`Minor faults: ${state.minorFaults}/s (expected noise)`}
          status={memoryMetricStatus("faults", state)}
          percent={Math.min(100, state.majorFaults / 15)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AvailableHistoryChart
          history={state.availableHistory}
          totalMiB={state.totalMiB}
        />
        <MemoryStackBar state={state} />
      </div>

      <SwapBar state={state} />

      {state.conditionId === "memory-leak" && state.leakTrendMiB.length > 0 ? (
        <div className="border-border bg-background space-y-2 rounded-lg border p-3">
          <p className="text-foreground text-sm font-medium">
            Memory leak trend — leaky-app RSS
          </p>
          <p className="text-muted-foreground text-xs">
            Simulated RSS growth of the leaky-app process over the observation
            window.
          </p>
          <div
            className="flex h-24 items-end gap-1"
            role="img"
            aria-label="Memory leak trend chart"
          >
            {state.leakTrendMiB.map((mib, index) => {
              const max = Math.max(...state.leakTrendMiB) + 100;
              return (
                <div
                  key={`${index}-${mib}`}
                  className="bg-destructive/70 w-full rounded-t-sm"
                  style={{ height: `${(mib / max) * 100}%` }}
                  title={`${mib} MiB`}
                />
              );
            })}
          </div>
          <div className="text-muted-foreground flex justify-between font-mono text-[0.65rem]">
            <span>start: {state.leakTrendMiB[0]} MiB</span>
            <span>
              latest: {state.leakTrendMiB[state.leakTrendMiB.length - 1]} MiB
              RSS
            </span>
          </div>
        </div>
      ) : null}

      {state.oomEvents.length > 0 ? (
        <div className="border-border bg-background space-y-2 rounded-lg border p-3">
          <p className="text-foreground text-sm font-medium">
            Simulated kernel OOM events
          </p>
          <ul className="space-y-1">
            {state.oomEvents.map((line) => (
              <li key={line} className="text-destructive font-mono text-xs">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-foreground text-sm font-medium">
          Top simulated memory-consuming processes
        </p>
        <ProcessTable state={state} />
      </div>

      <Callout title="Not live host metrics">
        <p>
          Every gauge, bar, and terminal line is generated from the in-memory
          condition snapshot. The app never inspects your real RAM, swap, or
          /proc.
        </p>
      </Callout>

      <TerminalSimulator
        key={`${conditionId}-${terminalKey}`}
        memoryAndSwap={conditionId}
        suggestions={DASHBOARD_SUGGESTIONS}
        suggestionsLabel="Memory commands"
        onMemoryAndSwapChange={setState}
      />
    </div>
  );
}
