"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  cpuMetricStatus,
  createInitialCpuState,
  getCpuCondition,
  getDashboardCpuConditions,
  LOAD_AVERAGE_EXAMPLES,
  type CpuConditionId,
  type MetricStatus,
  type SimulatedCpuState,
} from "@/lib/simulate-cpu-monitoring";
import { cn } from "@/lib/utils";

const DASHBOARD_SUGGESTIONS = [
  { command: "lscpu", label: "lscpu" },
  { command: "uptime", label: "uptime" },
  { command: "top", label: "top" },
  { command: "htop", label: "htop" },
  { command: "mpstat -P ALL", label: "mpstat -P ALL" },
  { command: "ps aux --sort=-%cpu", label: "ps aux" },
  { command: "vmstat 1 5", label: "vmstat" },
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

function HistoryChart({ history }: { history: readonly number[] }) {
  const max = Math.max(100, ...history);
  return (
    <div className="border-border bg-background space-y-2 rounded-lg border p-3">
      <p className="text-foreground text-sm font-medium">
        Historical CPU utilization
      </p>
      <p className="text-muted-foreground text-xs">
        Simulated samples over a short fictional window (not live host data).
      </p>
      <div
        className="flex h-28 items-end gap-1"
        role="img"
        aria-label="Historical CPU utilization bar chart"
      >
        {history.map((value, index) => (
          <div
            key={`${index}-${value}`}
            className="bg-primary/80 w-full rounded-t-sm transition-[height] duration-300"
            style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
            title={`${value}%`}
          />
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between font-mono text-[0.65rem]">
        <span>older</span>
        <span>newer · last {history[history.length - 1] ?? 0}%</span>
      </div>
    </div>
  );
}

function ProcessTable({ state }: { state: SimulatedCpuState }) {
  const processes = [...state.processes].sort((a, b) => b.cpu - a.cpu);
  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="text-muted-foreground sr-only">
          Top simulated CPU-consuming processes
        </caption>
        <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
          <tr>
            <th className="px-3 py-2 font-medium">PID</th>
            <th className="px-3 py-2 font-medium">User</th>
            <th className="px-3 py-2 font-medium">Command</th>
            <th className="px-3 py-2 font-medium">%CPU</th>
            <th className="px-3 py-2 font-medium">State</th>
            <th className="px-3 py-2 font-medium">Nice</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.pid} className="border-border border-t">
              <td className="px-3 py-2 font-mono text-xs">{process.pid}</td>
              <td className="px-3 py-2 font-mono text-xs">{process.user}</td>
              <td className="px-3 py-2 font-mono text-xs">{process.command}</td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {process.cpu.toFixed(1)}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{process.state}</td>
              <td className="px-3 py-2 font-mono text-xs">{process.nice}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CpuMonitoringDashboard() {
  const [conditionId, setConditionId] = useState<CpuConditionId>("normal");
  const [terminalKey, setTerminalKey] = useState(0);
  const [state, setState] = useState<SimulatedCpuState>(() =>
    createInitialCpuState("normal"),
  );

  const condition = getCpuCondition(conditionId);
  const dashboardConditions = getDashboardCpuConditions();

  function selectCondition(id: CpuConditionId) {
    setConditionId(id);
    setState(createInitialCpuState(id));
    setTerminalKey((value) => value + 1);
  }

  function resetCondition() {
    setState(createInitialCpuState(conditionId));
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          CPU monitoring dashboard
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
          Host <span className="font-mono">{state.hostname}</span> ·{" "}
          {state.physicalCores} physical cores · {state.logicalCpus} logical
          CPUs · up {state.uptimeHuman} ·{" "}
          <span className="font-medium">Simulated metrics</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Overall CPU utilization"
          value={`${state.cpuUtilizationPercent}%`}
          detail={`${state.logicalCpus} logical · ${state.physicalCores} physical cores`}
          status={cpuMetricStatus("cpu", state)}
          percent={state.cpuUtilizationPercent}
        />
        <MetricCard
          title="User / system time"
          value={`${state.cpuUserPercent}% / ${state.cpuSystemPercent}%`}
          detail={`nice ${state.cpuNicePercent}% · irq ${state.cpuIrqPercent}% · softirq ${state.cpuSoftirqPercent}%`}
          status={cpuMetricStatus("cpu", state)}
          percent={state.cpuUserPercent + state.cpuSystemPercent}
        />
        <MetricCard
          title="Idle time"
          value={`${state.cpuIdlePercent}%`}
          detail="Spare CPU capacity — not a guarantee the app is fast"
          status={cpuMetricStatus("idle", state)}
          percent={100 - state.cpuIdlePercent}
        />
        <MetricCard
          title="I/O wait"
          value={`${state.cpuIowaitPercent}%`}
          detail={`Blocked tasks: ${state.blockedTasks}`}
          status={cpuMetricStatus("iowait", state)}
          percent={Math.min(100, state.cpuIowaitPercent * 2)}
        />
        <MetricCard
          title="Steal time"
          value={`${state.cpuStealPercent}%`}
          detail="Hypervisor contention on virtual CPUs"
          status={cpuMetricStatus("steal", state)}
          percent={Math.min(100, state.cpuStealPercent * 3)}
        />
        <MetricCard
          title="Load average (1m)"
          value={state.loadAvg[0].toFixed(2)}
          detail={`5m ${state.loadAvg[1].toFixed(2)} · 15m ${state.loadAvg[2].toFixed(2)} vs ${state.logicalCpus} logical CPUs`}
          status={cpuMetricStatus("load", state)}
          percent={Math.min(100, (state.loadAvg[0] / state.logicalCpus) * 100)}
        />
        <MetricCard
          title="Context switches"
          value={`${state.contextSwitchesPerSec}/s`}
          detail={`Interrupts ${state.interruptsPerSec}/s · runnable ${state.runnableTasks}`}
          status={cpuMetricStatus("context-switches", state)}
          percent={Math.min(100, state.contextSwitchesPerSec / 60)}
        />
        <MetricCard
          title="App response time"
          value={`${state.appResponseMs} ms`}
          detail="Simulated end-user latency for the app tier"
          status={cpuMetricStatus("app-response", state)}
          percent={Math.min(100, state.appResponseMs / 15)}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <HistoryChart history={state.history} />
        <div className="border-border bg-background space-y-2 rounded-lg border p-3">
          <p className="text-foreground text-sm font-medium">
            Per-logical-CPU utilization
          </p>
          <ul className="space-y-2">
            {state.perCpu.map((cpu) => (
              <li key={cpu.index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono">CPU{cpu.index}</span>
                  <span className="font-mono tabular-nums">
                    {cpu.utilization.toFixed(1)}% · id {cpu.idle.toFixed(1)}% ·
                    wa {cpu.iowait.toFixed(1)}% · st {cpu.steal.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${cpu.utilization}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-foreground text-sm font-medium">
          Top simulated CPU-consuming processes
        </p>
        <ProcessTable state={state} />
      </div>

      <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">
          Load average vs logical CPUs (examples)
        </p>
        <ul className="text-muted-foreground space-y-1 text-sm">
          {LOAD_AVERAGE_EXAMPLES.map((example) => (
            <li key={`${example.logicalCpus}-${example.load1}`}>
              <span className="text-foreground font-mono text-xs">
                {example.logicalCpus} CPUs · load {example.load1.toFixed(2)}
              </span>
              {" — "}
              {example.meaning}
            </li>
          ))}
        </ul>
      </div>

      <Callout title="Not live host metrics">
        <p>
          Every gauge, chart bar, and terminal line is generated from the
          in-memory condition snapshot. The app never inspects your real CPU,
          processes, or priorities.
        </p>
      </Callout>

      <TerminalSimulator
        key={`${conditionId}-${terminalKey}`}
        cpuMonitoring={conditionId}
        suggestions={DASHBOARD_SUGGESTIONS}
        suggestionsLabel="CPU commands"
        onCpuMonitoringChange={setState}
      />
    </div>
  );
}
