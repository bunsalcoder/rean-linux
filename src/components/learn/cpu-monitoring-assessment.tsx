"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  createInitialCpuState,
  type SimulatedCpuState,
} from "@/lib/simulate-cpu-monitoring";
import { cn } from "@/lib/utils";

type StepId =
  | "inspect"
  | "utilization"
  | "load"
  | "behavior"
  | "processes"
  | "diagnosis"
  | "next"
  | "verify"
  | "complete";

const FINAL_CONDITION = "io-wait" as const;

const UTILIZATION_OPTIONS = [
  {
    key: "A",
    label:
      "CPUs are fully saturated at ~100% user time with almost no idle or wait",
    correct: false,
  },
  {
    key: "B",
    label:
      "Overall busy time is moderate, but %wa is unusually high while some idle remains",
    correct: true,
  },
  {
    key: "C",
    label: "Steal time dominates every logical CPU above 40%",
    correct: false,
  },
  {
    key: "D",
    label: "All logical CPUs are completely idle at 0% utilization",
    correct: false,
  },
] as const;

const LOAD_OPTIONS = [
  {
    key: "A",
    label:
      "Load is well above logical CPU count, consistent with many blocked (I/O-waiting) tasks — not proof of pure CPU compute saturation alone",
    correct: true,
  },
  {
    key: "B",
    label: "Load equals CPU utilization percent exactly on every host",
    correct: false,
  },
  {
    key: "C",
    label: "Load below 0.01 means the disk must be saturated",
    correct: false,
  },
  {
    key: "D",
    label: "Load average cannot rise when %wa is high",
    correct: false,
  },
] as const;

const BEHAVIOR_OPTIONS = [
  {
    key: "A",
    label: "Dominant behavior: I/O-bound wait (high %wa / blocked tasks)",
    correct: true,
  },
  {
    key: "B",
    label: "Dominant behavior: pure CPU compute saturation across all cores",
    correct: false,
  },
  {
    key: "C",
    label: "Dominant behavior: hypervisor steal time only",
    correct: false,
  },
  {
    key: "D",
    label: "Dominant behavior: completely idle healthy baseline",
    correct: false,
  },
] as const;

const PROCESS_OPTIONS = [
  {
    key: "A",
    label:
      "`backup-worker` (and related DB work) appear blocked in state D while CPU % is not the whole story",
    correct: true,
  },
  {
    key: "B",
    label: "Only `sshd` is runnable at 99% CPU",
    correct: false,
  },
  {
    key: "C",
    label: "No processes exist in the simulated table",
    correct: false,
  },
  {
    key: "D",
    label: "Every process shows state R at 100% CPU",
    correct: false,
  },
] as const;

const DIAGNOSIS_OPTIONS = [
  {
    key: "A",
    label:
      "High load is driven largely by I/O wait / blocked tasks — investigate storage and the backup workload before assuming classic CPU saturation",
    correct: true,
  },
  {
    key: "B",
    label: "All evidence points only to needing more vCPUs immediately",
    correct: false,
  },
  {
    key: "C",
    label: "Steal time is proven as the sole root cause",
    correct: false,
  },
  {
    key: "D",
    label: "The host is idle; ignore response time",
    correct: false,
  },
] as const;

const NEXT_OPTIONS = [
  {
    key: "A",
    label:
      "Inspect disk I/O (latency/util/throughput) for the backup path and identify heavy writers/readers, then remeasure",
    correct: true,
  },
  {
    key: "B",
    label: "Only renice random processes without checking storage",
    correct: false,
  },
  {
    key: "C",
    label: "Disable all logging forever as the first step",
    correct: false,
  },
  {
    key: "D",
    label: "Ignore %wa because some idle time remains",
    correct: false,
  },
] as const;

const VERIFY_COMMANDS = [
  "top",
  "mpstat -P ALL",
  "mpstat -P all",
  "vmstat 1 5",
  "vmstat",
  "ps aux --sort=-%cpu",
] as const;

function MetricBrief({ state }: { state: SimulatedCpuState }) {
  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-sm">
      <p className="text-foreground font-medium">
        Simulated investigation brief — cpu-lab
      </p>
      <p>
        <strong className="text-foreground">User-reported symptoms:</strong>{" "}
        Application response times climbed during the nightly backup window.
        Support reports multi-second waits even though “CPU does not look 100%
        busy” on the overview chart.
      </p>
      <ul className="text-muted-foreground space-y-1 font-mono text-xs">
        <li>
          Topology: {state.physicalCores} physical cores · {state.logicalCpus}{" "}
          logical CPUs
        </li>
        <li>
          Overall util {state.cpuUtilizationPercent}% · us{" "}
          {state.cpuUserPercent}% · sy {state.cpuSystemPercent}% · id{" "}
          {state.cpuIdlePercent}% · wa {state.cpuIowaitPercent}% · st{" "}
          {state.cpuStealPercent}%
        </li>
        <li>
          Load: {state.loadAvg[0].toFixed(2)}, {state.loadAvg[1].toFixed(2)},{" "}
          {state.loadAvg[2].toFixed(2)} · runnable {state.runnableTasks} ·
          blocked {state.blockedTasks}
        </li>
        <li>
          Context switches {state.contextSwitchesPerSec}/s · interrupts{" "}
          {state.interruptsPerSec}/s
        </li>
        <li>
          Per-CPU:{" "}
          {state.perCpu
            .map(
              (cpu) =>
                `CPU${cpu.index} util=${cpu.utilization.toFixed(0)}% wa=${cpu.iowait.toFixed(0)}%`,
            )
            .join(" · ")}
        </li>
        <li>
          Top processes:{" "}
          {[...state.processes]
            .sort((a, b) => b.cpu - a.cpu)
            .slice(0, 4)
            .map(
              (process) =>
                `${process.command} ${process.cpu.toFixed(1)}% [${process.state}] nice=${process.nice}`,
            )
            .join(" · ")}
        </li>
        <li>Application response time: {state.appResponseMs} ms</li>
      </ul>
      <p className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">
        All metrics simulated — not from your host
      </p>
    </div>
  );
}

function OptionList({
  options,
  selected,
  submitted,
  onToggle,
}: {
  options: readonly {
    key: string;
    label: string;
    correct: boolean;
  }[];
  selected: string | null;
  submitted: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((option) => {
        const isSelected = selected === option.key;
        const showResult = submitted && isSelected;
        return (
          <li key={option.key}>
            <button
              type="button"
              disabled={submitted}
              onClick={() => onToggle(option.key)}
              className={cn(
                "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                isSelected && !submitted && "border-primary/50 bg-primary/5",
                showResult &&
                  option.correct &&
                  "border-green-600/40 bg-green-500/10",
                showResult &&
                  !option.correct &&
                  "border-destructive/40 bg-destructive/10",
                submitted && "cursor-default",
              )}
            >
              <span className="text-muted-foreground font-mono text-xs font-medium">
                {option.key}.
              </span>
              <span>{option.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

export function CpuMonitoringAssessment() {
  const [step, setStep] = useState<StepId>("inspect");
  const [utilization, setUtilization] = useState<string | null>(null);
  const [load, setLoad] = useState<string | null>(null);
  const [behavior, setBehavior] = useState<string | null>(null);
  const [processes, setProcesses] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [nextStep, setNextStep] = useState<string | null>(null);
  const [checkedCommands, setCheckedCommands] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [state] = useState<SimulatedCpuState>(() =>
    createInitialCpuState(FINAL_CONDITION),
  );

  const verified = checkedCommands.some((command) =>
    VERIFY_COMMANDS.some(
      (candidate) => normalizeCommand(candidate) === command,
    ),
  );

  function advanceSingle(
    selected: string | null,
    options: readonly { key: string; correct: boolean }[],
    next: StepId,
    missMessage: string,
  ) {
    const correct = options.find((option) => option.correct)?.key;
    if (selected === correct) {
      setFeedback(null);
      setStep(next);
      return;
    }
    setFeedback(missMessage);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practical final exercise
        </h3>
        <p className="text-muted-foreground text-sm">
          Investigate a slower fictional application server. Do not assume high
          load always means CPU saturation — let the evidence decide.
        </p>
      </div>

      <MetricBrief state={state} />

      {step === "inspect" ? (
        <div className="space-y-3">
          <p className="text-sm">
            Step 1 — Inspect CPU information (topology, utilization breakdown,
            load, processes). Continue when ready.
          </p>
          <Button type="button" onClick={() => setStep("utilization")}>
            Continue to interpret utilization
          </Button>
        </div>
      ) : null}

      {step === "utilization" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 2 — Interpret CPU utilization
          </p>
          <OptionList
            options={UTILIZATION_OPTIONS}
            selected={utilization}
            submitted={false}
            onToggle={setUtilization}
          />
          <Button
            type="button"
            disabled={!utilization}
            onClick={() =>
              advanceSingle(
                utilization,
                UTILIZATION_OPTIONS,
                "load",
                "Look again at %wa versus overall busy time. This snapshot is not pegged at 100% user time.",
              )
            }
          >
            Confirm utilization reading
          </Button>
        </div>
      ) : null}

      {step === "load" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 3 — Compare load average with logical CPU count
          </p>
          <OptionList
            options={LOAD_OPTIONS}
            selected={load}
            submitted={false}
            onToggle={setLoad}
          />
          <Button
            type="button"
            disabled={!load}
            onClick={() =>
              advanceSingle(
                load,
                LOAD_OPTIONS,
                "behavior",
                "Load is high relative to 4 logical CPUs — but pair that with blocked tasks and %wa, not with an automatic compute-saturation claim.",
              )
            }
          >
            Confirm load reading
          </Button>
        </div>
      ) : null}

      {step === "behavior" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 4 — Identify the dominant resource behavior
          </p>
          <OptionList
            options={BEHAVIOR_OPTIONS}
            selected={behavior}
            submitted={false}
            onToggle={setBehavior}
          />
          <Button
            type="button"
            disabled={!behavior}
            onClick={() =>
              advanceSingle(
                behavior,
                BEHAVIOR_OPTIONS,
                "processes",
                "High %wa and blocked tasks dominate here — not all-core compute saturation or steal.",
              )
            }
          >
            Confirm dominant behavior
          </Button>
        </div>
      ) : null}

      {step === "processes" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 5 — Inspect the top processes
          </p>
          <OptionList
            options={PROCESS_OPTIONS}
            selected={processes}
            submitted={false}
            onToggle={setProcesses}
          />
          <Button
            type="button"
            disabled={!processes}
            onClick={() =>
              advanceSingle(
                processes,
                PROCESS_OPTIONS,
                "diagnosis",
                "Find the D-state backup/database work tied to I/O wait — not a story about sshd alone.",
              )
            }
          >
            Confirm process reading
          </Button>
        </div>
      ) : null}

      {step === "diagnosis" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 6 — Form a diagnosis
          </p>
          <OptionList
            options={DIAGNOSIS_OPTIONS}
            selected={diagnosis}
            submitted={false}
            onToggle={setDiagnosis}
          />
          <Button
            type="button"
            disabled={!diagnosis}
            onClick={() =>
              advanceSingle(
                diagnosis,
                DIAGNOSIS_OPTIONS,
                "next",
                "High load here aligns with I/O wait and blocked tasks. Do not leap to “only add vCPUs.”",
              )
            }
          >
            Confirm diagnosis
          </Button>
        </div>
      ) : null}

      {step === "next" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 7 — Recommend the next investigation
          </p>
          <OptionList
            options={NEXT_OPTIONS}
            selected={nextStep}
            submitted={false}
            onToggle={setNextStep}
          />
          <Button
            type="button"
            disabled={!nextStep}
            onClick={() =>
              advanceSingle(
                nextStep,
                NEXT_OPTIONS,
                "verify",
                "Choose a storage-focused next step that matches the %wa evidence.",
              )
            }
          >
            Confirm next investigation
          </Button>
        </div>
      ) : null}

      {step === "verify" || step === "complete" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 8 — Verify the simulated conclusion
          </p>
          <p className="text-muted-foreground text-sm">
            Run <code className="font-mono text-xs">top</code>,{" "}
            <code className="font-mono text-xs">mpstat -P ALL</code>, or{" "}
            <code className="font-mono text-xs">vmstat 1 5</code> and confirm
            elevated %wa / blocked tasks for this snapshot.
          </p>
          <TerminalSimulator
            cpuMonitoring={FINAL_CONDITION}
            suggestions={[
              { command: "top", label: "top" },
              { command: "mpstat -P ALL", label: "mpstat -P ALL" },
              { command: "vmstat 1 5", label: "vmstat 1 5" },
              { command: "ps aux --sort=-%cpu", label: "ps aux" },
              { command: "help", label: "help" },
            ]}
            suggestionsLabel="Verify with commands"
            onCommandRun={(command) => {
              const normalized = normalizeCommand(command);
              if (
                VERIFY_COMMANDS.some(
                  (candidate) => normalizeCommand(candidate) === normalized,
                )
              ) {
                setCheckedCommands((prev) =>
                  prev.includes(normalized) ? prev : [...prev, normalized],
                );
              }
            }}
          />
          {step === "verify" ? (
            <Button
              type="button"
              disabled={!verified}
              onClick={() => setStep("complete")}
            >
              Mark conclusion verified
            </Button>
          ) : null}
          {!verified ? (
            <p className="text-muted-foreground text-sm">
              Run a verification command above to unlock completion.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <Callout title="Investigation complete">
          <p>
            The simulated evidence supports an{" "}
            <strong>I/O-wait / storage-related</strong> diagnosis: load is high
            relative to logical CPU count, but CPUs are not fully busy computing
            — %wa and blocked (D) tasks dominate, with `backup-worker`
            implicated. High load was <em>not</em> automatic proof of classic
            CPU saturation.
          </p>
          <p className="mt-2">
            A sound next move is to inspect disk latency and the backup
            workload, apply one controlled change, and remeasure response time —
            not to renice blindly or add vCPUs without evidence.
          </p>
        </Callout>
      ) : null}

      {feedback ? (
        <Callout title="Check the evidence">
          <p>{feedback}</p>
        </Callout>
      ) : null}
    </div>
  );
}
