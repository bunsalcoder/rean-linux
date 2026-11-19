"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  PERFORMANCE_SCENARIOS,
  createInitialPerformanceState,
  getPerformanceScenario,
  metricStatus,
  type MetricStatus,
  type PerformanceScenarioId,
  type SimulatedPerformanceState,
} from "@/lib/simulate-performance-fundamentals";
import { cn } from "@/lib/utils";

const DASHBOARD_SUGGESTIONS = [
  { command: "uptime", label: "uptime" },
  { command: "free -h", label: "free -h" },
  { command: "top", label: "top" },
  { command: "vmstat 1 5", label: "vmstat 1 5" },
  { command: "iostat -x 1 3", label: "iostat -x" },
  { command: "df -h", label: "df -h" },
  { command: "ss -s", label: "ss -s" },
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

function formatMiB(value: number): string {
  if (value >= 1024) {
    const gib = value / 1024;
    return `${Math.round(gib * 10) / 10} GiB`;
  }
  return `${Math.round(value)} MiB`;
}

function swapPercent(state: SimulatedPerformanceState): number {
  if (state.memory.swapTotalMiB <= 0) return 0;
  return (state.memory.swapUsedMiB / state.memory.swapTotalMiB) * 100;
}

function memoryUsedPercent(state: SimulatedPerformanceState): number {
  if (state.memory.totalMiB <= 0) return 0;
  return (
    ((state.memory.totalMiB - state.memory.availableMiB) /
      state.memory.totalMiB) *
    100
  );
}

export function PerformanceFundamentalsDashboard() {
  const [scenarioId, setScenarioId] =
    useState<PerformanceScenarioId>("healthy");
  const [terminalKey, setTerminalKey] = useState(0);
  const [state, setState] = useState<SimulatedPerformanceState>(() =>
    createInitialPerformanceState("healthy"),
  );

  const scenario = getPerformanceScenario(scenarioId);

  function selectScenario(id: PerformanceScenarioId) {
    setScenarioId(id);
    setState(createInitialPerformanceState(id));
    setTerminalKey((value) => value + 1);
  }

  function resetScenario() {
    setState(createInitialPerformanceState(scenarioId));
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Performance metrics dashboard
        </h3>
        <p className="text-muted-foreground text-sm">
          Simulated Linux application server metrics only — values come from the
          selected condition, not from your computer. Switch conditions and
          confirm readings in the terminal.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERFORMANCE_SCENARIOS.map((item) => {
          const active = item.id === scenarioId;
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => selectScenario(item.id)}
            >
              {item.label}
            </Button>
          );
        })}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={resetScenario}
        >
          Reset condition
        </Button>
      </div>

      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">{scenario.label}</p>
        <p className="text-sm">
          <strong className="text-foreground">Symptom:</strong>{" "}
          {scenario.symptom}
        </p>
        <p className="text-muted-foreground text-sm">{state.interpretation}</p>
        <p className="text-muted-foreground text-sm">
          Host <span className="font-mono">{state.hostname}</span> ·{" "}
          {state.cpuCount} vCPUs · up {state.uptimeHuman} ·{" "}
          <span className="font-medium">Simulated metrics</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="CPU utilization"
          value={`${state.cpuUtilizationPercent}%`}
          detail={`user ${state.cpuUserPercent}% · system ${state.cpuSystemPercent}% · idle ${state.cpuIdlePercent}%`}
          status={metricStatus("cpu", state)}
          percent={state.cpuUtilizationPercent}
        />
        <MetricCard
          title="Load average (1m)"
          value={state.loadAvg[0].toFixed(2)}
          detail={`5m ${state.loadAvg[1].toFixed(2)} · 15m ${state.loadAvg[2].toFixed(2)} vs ${state.cpuCount} CPUs`}
          status={metricStatus("load", state)}
          percent={Math.min(100, (state.loadAvg[0] / state.cpuCount) * 100)}
        />
        <MetricCard
          title="Memory available"
          value={formatMiB(state.memory.availableMiB)}
          detail={`${formatMiB(state.memory.usedMiB)} used of ${formatMiB(state.memory.totalMiB)} · prefer available`}
          status={metricStatus("memory", state)}
          percent={memoryUsedPercent(state)}
        />
        <MetricCard
          title="Swap usage"
          value={`${formatMiB(state.memory.swapUsedMiB)} / ${formatMiB(state.memory.swapTotalMiB)}`}
          detail="Elevated swap with low available memory often signals pressure"
          status={metricStatus("swap", state)}
          percent={swapPercent(state)}
        />
        <MetricCard
          title="Disk throughput"
          value={`${Math.round(state.diskIo.readKiBs)} / ${Math.round(state.diskIo.writeKiBs)} KiB/s`}
          detail={`~${state.diskIo.iops} IOPS · await ${state.diskIo.awaitMs} ms · util ${state.diskIo.utilPercent}%`}
          status={metricStatus("disk-util", state)}
          percent={state.diskIo.utilPercent}
        />
        <MetricCard
          title="Disk I/O wait"
          value={`${state.diskIo.ioWaitPercent}%`}
          detail="CPU time spent waiting on storage — high with busy disks"
          status={metricStatus("io-wait", state)}
          percent={Math.min(100, state.diskIo.ioWaitPercent * 3)}
        />
        <MetricCard
          title="Network RX / TX"
          value={`${state.network.rxMbps} / ${state.network.txMbps} Mbps`}
          detail={`latency ${state.network.latencyMs} ms · loss ${state.network.packetLossPercent}%`}
          status={
            metricStatus("network-latency", state) === "critical" ||
            metricStatus("packet-loss", state) === "critical"
              ? "critical"
              : metricStatus("network-latency", state) === "warning" ||
                  metricStatus("packet-loss", state) === "warning"
                ? "warning"
                : "normal"
          }
          percent={Math.min(
            100,
            Math.max(
              state.network.latencyMs / 2,
              state.network.packetLossPercent * 20,
            ),
          )}
        />
        <MetricCard
          title="App response time"
          value={`${state.appResponseMs} ms`}
          detail="Simulated end-user request latency for the app server"
          status={metricStatus("app-response", state)}
          percent={Math.min(100, state.appResponseMs / 15)}
        />
      </div>

      <Callout title="Not live host metrics">
        <p>
          Every gauge and terminal line is generated from the in-memory
          condition snapshot. The app never inspects your real CPU, RAM, disks,
          network, or processes.
        </p>
      </Callout>

      <TerminalSimulator
        key={`${scenarioId}-${terminalKey}`}
        performanceFundamentals={scenarioId}
        suggestions={DASHBOARD_SUGGESTIONS}
        suggestionsLabel="Performance commands"
        onPerformanceFundamentalsChange={setState}
      />
    </div>
  );
}
