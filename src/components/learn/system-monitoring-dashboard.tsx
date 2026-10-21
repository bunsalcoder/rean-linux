"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  SYSTEM_MONITORING_SCENARIOS,
  createInitialSystemMonitoringState,
  getRootDiskUsePercent,
  getSystemMonitoringScenario,
  getTopCpuProcess,
  getTopMemProcess,
  type SimulatedSystemMonitoringState,
  type SystemMonitoringScenarioId,
} from "@/lib/simulate-system-monitoring";
import { cn } from "@/lib/utils";

const DASHBOARD_SUGGESTIONS = [
  { command: "nproc", label: "nproc" },
  { command: "uptime", label: "uptime" },
  { command: "free -h", label: "free -h" },
  { command: "top", label: "top" },
  { command: "ps aux", label: "ps aux" },
  { command: "vmstat 1 5", label: "vmstat 1 5" },
  { command: "df -h", label: "df -h" },
  { command: "help", label: "help" },
] as const;

function MetricBar({
  label,
  valueLabel,
  percent,
  tone = "default",
}: {
  label: string;
  valueLabel: string;
  percent: number;
  tone?: "default" | "warn" | "danger";
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {valueLabel}
        </p>
      </div>
      <div
        className="bg-muted h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            tone === "danger" && "bg-destructive",
            tone === "warn" && "bg-amber-500",
            tone === "default" && "bg-primary",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function memoryUsedPercent(state: SimulatedSystemMonitoringState): number {
  const { totalMiB, availableMiB } = state.memory;
  if (totalMiB <= 0) {
    return 0;
  }
  return ((totalMiB - availableMiB) / totalMiB) * 100;
}

function swapUsedPercent(state: SimulatedSystemMonitoringState): number {
  const { swapTotalMiB, swapUsedMiB } = state.memory;
  if (swapTotalMiB <= 0) {
    return 0;
  }
  return (swapUsedMiB / swapTotalMiB) * 100;
}

function loadRelativePercent(state: SimulatedSystemMonitoringState): number {
  if (state.cpuCount <= 0) {
    return 0;
  }
  return (state.loadAvg[0] / state.cpuCount) * 100;
}

function formatMiB(value: number): string {
  if (value >= 1024) {
    const gib = value / 1024;
    const rounded = Math.round(gib * 10) / 10;
    return `${rounded} GiB`;
  }
  return `${Math.round(value)} MiB`;
}

export function SystemMonitoringDashboard() {
  const [scenarioId, setScenarioId] =
    useState<SystemMonitoringScenarioId>("healthy");
  const [terminalKey, setTerminalKey] = useState(0);
  const [state, setState] = useState<SimulatedSystemMonitoringState>(() =>
    createInitialSystemMonitoringState("healthy"),
  );

  const scenario = getSystemMonitoringScenario(scenarioId);
  const topCpu = getTopCpuProcess(state);
  const topMem = getTopMemProcess(state);
  const diskPercent = getRootDiskUsePercent(state);
  const memPressure = memoryUsedPercent(state);
  const swapPressure = swapUsedPercent(state);
  const loadPressure = loadRelativePercent(state);

  function selectScenario(id: SystemMonitoringScenarioId) {
    setScenarioId(id);
    setState(createInitialSystemMonitoringState(id));
    setTerminalKey((value) => value + 1);
  }

  function resetScenario() {
    setState(createInitialSystemMonitoringState(scenarioId));
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Interactive resource dashboard
        </h3>
        <p className="text-muted-foreground text-sm">
          Simulated metrics only — these values come from the selected lab
          scenario, not from your computer. Switch scenarios, inspect the
          gauges, then confirm with terminal commands.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SYSTEM_MONITORING_SCENARIOS.map((item) => {
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
          Reset scenario
        </Button>
      </div>

      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">{scenario.label}</p>
        <p className="text-sm">
          <strong className="text-foreground">Symptom:</strong>{" "}
          {scenario.symptom}
        </p>
        <p className="text-muted-foreground text-sm">
          Host <span className="font-mono">{state.hostname}</span> ·{" "}
          {state.cpuCount} CPUs · up {state.uptimeHuman}
        </p>
      </div>

      <div className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <MetricBar
          label="CPU utilization"
          valueLabel={`${state.cpuUtilizationPercent}%`}
          percent={state.cpuUtilizationPercent}
          tone={
            state.cpuUtilizationPercent >= 85
              ? "danger"
              : state.cpuUtilizationPercent >= 60
                ? "warn"
                : "default"
          }
        />
        <MetricBar
          label="Memory in use (vs available)"
          valueLabel={`${formatMiB(state.memory.availableMiB)} available`}
          percent={memPressure}
          tone={
            state.memory.availableMiB < 512
              ? "danger"
              : state.memory.availableMiB < 1536
                ? "warn"
                : "default"
          }
        />
        <MetricBar
          label="Swap usage"
          valueLabel={`${formatMiB(state.memory.swapUsedMiB)} / ${formatMiB(state.memory.swapTotalMiB)}`}
          percent={swapPressure}
          tone={
            swapPressure >= 50
              ? "danger"
              : swapPressure >= 15
                ? "warn"
                : "default"
          }
        />
        <MetricBar
          label={`Load average (1m) vs ${state.cpuCount} CPUs`}
          valueLabel={`${state.loadAvg[0].toFixed(2)} / ${state.cpuCount}`}
          percent={Math.min(loadPressure, 100)}
          tone={
            state.loadAvg[0] > state.cpuCount * 1.5
              ? "danger"
              : state.loadAvg[0] > state.cpuCount
                ? "warn"
                : "default"
          }
        />
        <MetricBar
          label="Root disk use (`/`)"
          valueLabel={`${diskPercent}%`}
          percent={diskPercent}
          tone={
            diskPercent >= 90
              ? "danger"
              : diskPercent >= 75
                ? "warn"
                : "default"
          }
        />
        <div className="space-y-2 text-sm">
          <p className="text-foreground font-medium">Load averages</p>
          <p className="text-muted-foreground font-mono text-xs tabular-nums">
            1m {state.loadAvg[0].toFixed(2)} · 5m {state.loadAvg[1].toFixed(2)}{" "}
            · 15m {state.loadAvg[2].toFixed(2)}
          </p>
          <p className="text-foreground pt-2 font-medium">Top consumers</p>
          <p className="text-muted-foreground text-xs">
            CPU:{" "}
            <span className="font-mono">
              {topCpu ? `${topCpu.command} (${topCpu.cpu.toFixed(1)}%)` : "—"}
            </span>
          </p>
          <p className="text-muted-foreground text-xs">
            Memory:{" "}
            <span className="font-mono">
              {topMem ? `${topMem.command} (${topMem.mem.toFixed(1)}%)` : "—"}
            </span>
          </p>
        </div>
      </div>

      <Callout title="Not live host metrics">
        <p>
          Every gauge and terminal line is generated from the in-memory scenario
          snapshot. The app never inspects your real CPU, RAM, processes, or
          disks.
        </p>
      </Callout>

      <TerminalSimulator
        key={`${scenarioId}-${terminalKey}`}
        systemMonitoring={scenarioId}
        suggestions={DASHBOARD_SUGGESTIONS}
        suggestionsLabel="Monitoring commands"
        onSystemMonitoringChange={setState}
      />
    </div>
  );
}
