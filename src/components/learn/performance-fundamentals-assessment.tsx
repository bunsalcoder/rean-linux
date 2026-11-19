"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  createInitialPerformanceState,
  type SimulatedPerformanceState,
} from "@/lib/simulate-performance-fundamentals";
import { cn } from "@/lib/utils";

type StepId =
  | "review"
  | "abnormal"
  | "bottleneck"
  | "reasoning"
  | "next-area"
  | "recommendation"
  | "verify"
  | "complete";

const FINAL_SCENARIO_ID = "disk-io" as const;

const ABNORMAL_OPTIONS = [
  {
    key: "cpu-pegged",
    label: "CPU utilization is near 100% and is the clearest anomaly",
    correct: false,
  },
  {
    key: "iowait-high",
    label: "I/O wait and disk latency/utilization are elevated",
    correct: true,
  },
  {
    key: "mem-critical",
    label: "Available memory is under 256 MiB with heavy swap",
    correct: false,
  },
  {
    key: "net-loss",
    label: "Packet loss is above 4% with 180 ms latency",
    correct: false,
  },
  {
    key: "app-slow",
    label: "Application response time is much higher than a healthy baseline",
    correct: true,
  },
] as const;

const BOTTLENECK_OPTIONS = [
  { key: "A", label: "CPU saturation", correct: false },
  { key: "B", label: "Memory pressure", correct: false },
  { key: "C", label: "Disk I/O bottleneck", correct: true },
  { key: "D", label: "Network congestion", correct: false },
  {
    key: "E",
    label: "Application-only issue (all host resources healthy)",
    correct: false,
  },
] as const;

const REASONING_OPTIONS = [
  {
    key: "A",
    label:
      "Moderate CPU with high iowait/await/%util and rising response time implies storage is limiting progress",
    correct: true,
  },
  {
    key: "B",
    label: "Any non-zero disk read proves the CPU is the bottleneck",
    correct: false,
  },
  {
    key: "C",
    label: "Healthy available memory automatically means disks cannot be slow",
    correct: false,
  },
  {
    key: "D",
    label: "High response time always means packet loss",
    correct: false,
  },
] as const;

const NEXT_AREA_OPTIONS = [
  {
    key: "A",
    label: "Inspect disk I/O with iostat and identify heavy writers/readers",
    correct: true,
  },
  {
    key: "B",
    label: "Only add vCPUs without checking storage metrics",
    correct: false,
  },
  {
    key: "C",
    label: "Disable the network interface first",
    correct: false,
  },
  {
    key: "D",
    label: "Ignore iowait because CPU idle looks non-zero",
    correct: false,
  },
] as const;

const RECOMMENDATION_OPTIONS = [
  {
    key: "A",
    label:
      "Confirm which process issues heavy I/O, check disk latency/util, then apply one controlled storage/workload change and remeasure",
    correct: true,
  },
  {
    key: "B",
    label: "Change CPU, RAM, disk, network, and app config all at once",
    correct: false,
  },
  {
    key: "C",
    label: "Reboot repeatedly until latency improves by chance",
    correct: false,
  },
  {
    key: "D",
    label: "Assume the charts are wrong and stop collecting evidence",
    correct: false,
  },
] as const;

const VERIFY_COMMANDS = [
  "iostat -x 1 3",
  "iostat",
  "vmstat 1 5",
  "top",
] as const;

function formatMiB(value: number): string {
  if (value >= 1024) {
    return `${Math.round((value / 1024) * 10) / 10} GiB`;
  }
  return `${Math.round(value)} MiB`;
}

function MetricSummary({ state }: { state: SimulatedPerformanceState }) {
  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-sm">
      <p className="text-foreground font-medium">
        Simulated investigation brief — app-lab
      </p>
      <p>
        <strong className="text-foreground">User-reported symptoms:</strong>{" "}
        Report downloads and dashboard refresh have become noticeably slower
        over the last hour. Support tickets mention multi-second waits.
      </p>
      <ul className="text-muted-foreground space-y-1 font-mono text-xs">
        <li>CPU utilization: {state.cpuUtilizationPercent}%</li>
        <li>
          Load average: {state.loadAvg[0].toFixed(2)},{" "}
          {state.loadAvg[1].toFixed(2)}, {state.loadAvg[2].toFixed(2)} on{" "}
          {state.cpuCount} vCPUs
        </li>
        <li>
          Memory available: {formatMiB(state.memory.availableMiB)} · swap used:{" "}
          {formatMiB(state.memory.swapUsedMiB)}
        </li>
        <li>
          Disk: read {Math.round(state.diskIo.readKiBs)} KiB/s · write{" "}
          {Math.round(state.diskIo.writeKiBs)} KiB/s · await{" "}
          {state.diskIo.awaitMs} ms · util {state.diskIo.utilPercent}% · iowait{" "}
          {state.diskIo.ioWaitPercent}%
        </li>
        <li>
          Network: {state.network.rxMbps}/{state.network.txMbps} Mbps · latency{" "}
          {state.network.latencyMs} ms · loss {state.network.packetLossPercent}%
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
  multi,
  onToggle,
}: {
  options: readonly {
    key: string;
    label: string;
    correct: boolean;
  }[];
  selected: readonly string[];
  submitted: boolean;
  multi?: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.key);
        const showResult = submitted && isSelected;
        const showMissed = submitted && option.correct && !isSelected;
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
                showMissed && "border-amber-500/40 bg-amber-500/10",
                submitted && "cursor-default",
              )}
            >
              <span className="text-muted-foreground font-mono text-xs font-medium">
                {multi ? (isSelected ? "☑" : "☐") : `${option.key}.`}
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

export function PerformanceFundamentalsAssessment() {
  const [step, setStep] = useState<StepId>("review");
  const [abnormal, setAbnormal] = useState<string[]>([]);
  const [bottleneck, setBottleneck] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [nextArea, setNextArea] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [checkedCommands, setCheckedCommands] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [state] = useState<SimulatedPerformanceState>(() =>
    createInitialPerformanceState(FINAL_SCENARIO_ID),
  );

  const verified =
    checkedCommands.includes("iostat -x 1 3") ||
    checkedCommands.includes("iostat");

  function toggleAbnormal(key: string) {
    setAbnormal((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }

  function checkAbnormal() {
    const correctKeys = ABNORMAL_OPTIONS.filter((o) => o.correct).map(
      (o) => o.key,
    );
    const extras = abnormal.filter(
      (key) => !(correctKeys as readonly string[]).includes(key),
    );
    const missing = correctKeys.filter((key) => !abnormal.includes(key));
    if (extras.length === 0 && missing.length === 0) {
      setFeedback(null);
      setStep("bottleneck");
      return;
    }
    setFeedback(
      "Select the abnormal signals that the metrics actually support — elevated disk I/O wait/latency and high application response time. CPU is moderate; memory and network look comparatively healthy.",
    );
  }

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
          Final investigation exercise
        </h3>
        <p className="text-muted-foreground text-sm">
          A fictional Linux application server has become noticeably slower.
          Work the investigation steps in order using only the simulated
          evidence.
        </p>
      </div>

      <MetricSummary state={state} />

      {step === "review" ? (
        <div className="space-y-3">
          <p className="text-sm">
            Step 1 — Review the metrics above. When you are ready, continue to
            mark which values look abnormal.
          </p>
          <Button type="button" onClick={() => setStep("abnormal")}>
            Continue to abnormal values
          </Button>
        </div>
      ) : null}

      {step === "abnormal" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 2 — Which values are abnormal? (select all that apply)
          </p>
          <OptionList
            multi
            options={ABNORMAL_OPTIONS}
            selected={abnormal}
            submitted={false}
            onToggle={toggleAbnormal}
          />
          <Button
            type="button"
            disabled={abnormal.length === 0}
            onClick={checkAbnormal}
          >
            Confirm abnormal values
          </Button>
        </div>
      ) : null}

      {step === "bottleneck" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 3 — What is the most likely bottleneck?
          </p>
          <OptionList
            options={BOTTLENECK_OPTIONS}
            selected={bottleneck ? [bottleneck] : []}
            submitted={false}
            onToggle={(key) => setBottleneck(key)}
          />
          <Button
            type="button"
            disabled={!bottleneck}
            onClick={() =>
              advanceSingle(
                bottleneck,
                BOTTLENECK_OPTIONS,
                "reasoning",
                "Re-check iowait, await, and disk util versus the moderate CPU and healthy memory/network figures.",
              )
            }
          >
            Confirm bottleneck
          </Button>
        </div>
      ) : null}

      {step === "reasoning" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 4 — Which reasoning best matches the evidence?
          </p>
          <OptionList
            options={REASONING_OPTIONS}
            selected={reasoning ? [reasoning] : []}
            submitted={false}
            onToggle={(key) => setReasoning(key)}
          />
          <Button
            type="button"
            disabled={!reasoning}
            onClick={() =>
              advanceSingle(
                reasoning,
                REASONING_OPTIONS,
                "next-area",
                "Tie the diagnosis to moderate CPU plus elevated storage wait/latency — not to unrelated network or memory claims.",
              )
            }
          >
            Confirm reasoning
          </Button>
        </div>
      ) : null}

      {step === "next-area" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 5 — Select the next diagnostic area
          </p>
          <OptionList
            options={NEXT_AREA_OPTIONS}
            selected={nextArea ? [nextArea] : []}
            submitted={false}
            onToggle={(key) => setNextArea(key)}
          />
          <Button
            type="button"
            disabled={!nextArea}
            onClick={() =>
              advanceSingle(
                nextArea,
                NEXT_AREA_OPTIONS,
                "recommendation",
                "The evidence points at storage. Choose a disk-focused next step.",
              )
            }
          >
            Confirm next area
          </Button>
        </div>
      ) : null}

      {step === "recommendation" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 6 — Recommend an appropriate investigation approach
          </p>
          <OptionList
            options={RECOMMENDATION_OPTIONS}
            selected={recommendation ? [recommendation] : []}
            submitted={false}
            onToggle={(key) => setRecommendation(key)}
          />
          <Button
            type="button"
            disabled={!recommendation}
            onClick={() =>
              advanceSingle(
                recommendation,
                RECOMMENDATION_OPTIONS,
                "verify",
                "Prefer one controlled investigation path with before/after measurement — not shotgun changes.",
              )
            }
          >
            Confirm recommendation
          </Button>
        </div>
      ) : null}

      {step === "verify" || step === "complete" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 7 — Verify the simulated conclusion
          </p>
          <p className="text-muted-foreground text-sm">
            Run <code className="font-mono text-xs">iostat</code> or{" "}
            <code className="font-mono text-xs">iostat -x 1 3</code> in the
            simulator and confirm elevated await/%util/iowait for this
            disk-bound snapshot.
          </p>
          <TerminalSimulator
            performanceFundamentals={FINAL_SCENARIO_ID}
            suggestions={[
              { command: "iostat -x 1 3", label: "iostat -x" },
              { command: "vmstat 1 5", label: "vmstat" },
              { command: "top", label: "top" },
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
              Run an iostat command above to unlock verification.
            </p>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <Callout title="Investigation complete">
          <p>
            The simulated evidence supports a{" "}
            <strong>disk I/O bottleneck</strong>: moderate CPU, healthy
            available memory and network, elevated iowait / await / disk util,
            and high application response time. A sound next move is to identify
            the heavy I/O workload, apply one controlled improvement, and
            compare before-and-after measurements — without changing unrelated
            settings at the same time.
          </p>
          <p className="mt-2">
            Uncertainty remains until you confirm the offending process and
            whether the storage tier or the workload pattern is the better fix.
            Host charts guided you to the right area; they did not finish the
            entire root-cause story alone.
          </p>
        </Callout>
      ) : null}

      {feedback ? (
        <Callout title="Check the evidence">
          <p>{feedback}</p>
        </Callout>
      ) : null}

      {step !== "review" && step !== "complete" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setStep("review");
            setAbnormal([]);
            setBottleneck(null);
            setReasoning(null);
            setNextArea(null);
            setRecommendation(null);
            setCheckedCommands([]);
            setFeedback(null);
          }}
        >
          Restart investigation
        </Button>
      ) : null}
    </div>
  );
}
