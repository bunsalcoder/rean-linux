"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  createInitialCpuState,
  type CpuConditionId,
  type SimulatedCpuState,
} from "@/lib/simulate-cpu-monitoring";
import { cn } from "@/lib/utils";

type Option = {
  key: string;
  label: string;
};

type LabScenario = {
  id: string;
  title: string;
  conditionId: CpuConditionId;
  symptoms: string;
  evidence: readonly string[];
  question: string;
  hint: string;
  options: readonly Option[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

function metricLines(state: SimulatedCpuState): readonly string[] {
  return [
    `Logical CPUs: ${state.logicalCpus} · physical cores: ${state.physicalCores}`,
    `CPU utilization: ${state.cpuUtilizationPercent}% (us ${state.cpuUserPercent}% / sy ${state.cpuSystemPercent}% / ni ${state.cpuNicePercent}% / id ${state.cpuIdlePercent}% / wa ${state.cpuIowaitPercent}% / hi ${state.cpuIrqPercent}% / si ${state.cpuSoftirqPercent}% / st ${state.cpuStealPercent}%)`,
    `Load average: ${state.loadAvg[0].toFixed(2)}, ${state.loadAvg[1].toFixed(2)}, ${state.loadAvg[2].toFixed(2)}`,
    `Runnable: ${state.runnableTasks} · blocked: ${state.blockedTasks} · context switches: ${state.contextSwitchesPerSec}/s`,
    `Per-CPU util: ${state.perCpu.map((cpu) => `CPU${cpu.index}=${cpu.utilization.toFixed(0)}%`).join(", ")}`,
    `Top processes: ${[...state.processes]
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 3)
      .map(
        (process) =>
          `${process.command} ${process.cpu.toFixed(1)}% [${process.state}]`,
      )
      .join(" · ")}`,
    `App response time: ${state.appResponseMs} ms`,
  ];
}

const SCENARIOS: readonly LabScenario[] = [
  {
    id: "saturation",
    title: "Scenario 1 — CPU Saturation",
    conditionId: "saturation",
    symptoms:
      "A four-logical-CPU application server shows persistently high CPU utilization and growing request latency during peak compute jobs.",
    evidence: [
      "Idle time is nearly zero across logical CPUs.",
      "1-minute load is far above 4.",
      "Several processes remain in state R (runnable).",
    ],
    question: "What is the most accurate diagnosis of the host CPU situation?",
    hint: "Compare load and utilization to logical CPU count. Near-zero idle with load ≫ CPUs is classic saturation.",
    options: [
      { key: "A", label: "CPU saturation — demand exceeds CPU capacity" },
      { key: "B", label: "High I/O wait is the primary signal" },
      { key: "C", label: "Steal time from the hypervisor is dominant" },
      {
        key: "D",
        label: "The host is idle and latency must be a false alarm",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. ~97% utilization, load ~8.7 on 4 logical CPUs, and many runnable tasks mean CPU capacity is saturated — queues grow and latency rises.",
    feedbackIncorrect:
      "Re-check idle time, load versus 4 CPUs, and runnable counts. I/O wait and steal are low here.",
  },
  {
    id: "high-load",
    title: "Scenario 2 — High Load Average",
    conditionId: "io-wait",
    symptoms:
      "Operators notice a load average much higher than the logical CPU count, and users report slow reports.",
    evidence: [
      "Load is elevated relative to 4 logical CPUs.",
      "Blocked task count is elevated; several processes show state D.",
      "Overall CPU busy time is only moderate — %wa is high.",
    ],
    question:
      "What does this high load most likely represent in this snapshot?",
    hint: "Load includes runnable and uninterruptible (often I/O-waiting) tasks. Pair load with %wa and process states.",
    options: [
      {
        key: "A",
        label:
          "Mostly tasks waiting on I/O (blocked) rather than pure CPU compute saturation",
      },
      {
        key: "B",
        label: "Proof that every logical CPU is fully busy computing user code",
      },
      {
        key: "C",
        label: "Proof that steal time is the only possible cause",
      },
      {
        key: "D",
        label: "Evidence that load average equals CPU utilization percent",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. High load with elevated %wa and D-state processes points to I/O contention inflating load — not the same as CPUs being fully busy computing.",
    feedbackIncorrect:
      "Look at blocked tasks, %wa, and process states. High load is not identical to high %us.",
  },
  {
    id: "io-wait",
    title: "Scenario 3 — High I/O Wait",
    conditionId: "io-wait",
    symptoms:
      "CPU utilization looks moderate at first glance, but the system feels stuck during backup windows.",
    evidence: [
      "%wa is unusually high.",
      "`backup-worker` appears in uninterruptible sleep (D).",
      "Application response time is elevated despite spare idle CPU.",
    ],
    question: "What should investigation focus on next?",
    hint: "CPUs waiting on storage show up as %wa. Disk performance is the next evidence area.",
    options: [
      {
        key: "A",
        label: "Disk / storage performance behind the I/O wait",
      },
      {
        key: "B",
        label: "Add more vCPUs only, without checking storage metrics",
      },
      {
        key: "C",
        label: "Ignore %wa because some idle time remains",
      },
      {
        key: "D",
        label: "Assume steal time even though %st is near zero",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Moderate busy time with high %wa means processors are waiting on I/O — investigate disk latency, throughput, and the backup workload.",
    feedbackIncorrect:
      "Focus on %wa and D-state processes. Remaining idle time does not cancel an I/O bottleneck.",
  },
  {
    id: "single-core",
    title: "Scenario 4 — Single-Core Bottleneck",
    conditionId: "single-core",
    symptoms:
      "Overall CPU utilization looks only moderate, yet a critical batch job is slow.",
    evidence: [
      "mpstat shows one logical CPU near 100% while others are mostly idle.",
      "`java` dominates CPU and is single-threaded for this job.",
      "Overall load is not dramatically above CPU count.",
    ],
    question: "Why can this still be a CPU bottleneck?",
    hint: "Average utilization can hide imbalance. Single-threaded work cannot use idle cores.",
    options: [
      {
        key: "A",
        label:
          "A single-threaded workload saturates one logical CPU while others stay idle",
      },
      {
        key: "B",
        label: "Overall idle time proves no CPU limit can exist",
      },
      {
        key: "C",
        label: "Only load average can detect single-core issues",
      },
      {
        key: "D",
        label: "I/O wait must be the cause whenever one core is busy",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Single-threaded bottlenecks peg one CPU. Aggregate utilization and load can look “okay” while that critical path is saturated.",
    feedbackIncorrect:
      "Inspect per-CPU lines (mpstat -P ALL). Aggregate averages can hide a hot single core.",
  },
  {
    id: "steal",
    title: "Scenario 5 — CPU Steal Time",
    conditionId: "steal",
    symptoms:
      "A fictional virtual machine reports elevated steal time and slower application responses during noisy-neighbor periods.",
    evidence: [
      "%st is elevated across logical CPUs.",
      "Guest processes are not all pegged at 100% user time.",
      "Response time rises while the hypervisor withholds CPU.",
    ],
    question: "What does elevated steal time indicate?",
    hint: "Steal is time the virtual CPU wanted to run but the hypervisor scheduled elsewhere.",
    options: [
      {
        key: "A",
        label:
          "The hypervisor may not be providing the CPU time the VM requested",
      },
      {
        key: "B",
        label: "Steal time always means the guest disk is full",
      },
      {
        key: "C",
        label: "Steal time is identical to idle time",
      },
      {
        key: "D",
        label: "Steal time proves the guest has no runnable processes",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. %st means the hypervisor stole cycles from this guest — often host oversubscription or noisy neighbors — not a local disk-full signal.",
    feedbackIncorrect:
      "Steal is hypervisor scheduling delay for the guest vCPU, separate from idle and I/O wait.",
  },
] as const;

export function CpuMonitoringPractice() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const scenario = SCENARIOS[index] ?? SCENARIOS[0]!;
  const state = createInitialCpuState(scenario.conditionId);
  const isCorrect = selected === scenario.correct;
  const solvedCount = Object.values(solved).filter(Boolean).length;

  function submitAnswer() {
    if (!selected) return;
    setSubmitted(true);
    if (selected === scenario.correct) {
      setSolved((prev) => ({ ...prev, [scenario.id]: true }));
    }
  }

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          CPU bottleneck investigation lab
        </h3>
        <p className="text-muted-foreground text-sm">
          Work five fictional incidents. Match symptoms and simulated metrics to
          the best diagnostic reasoning. Progress stays on this page only.
        </p>
        <p className="text-muted-foreground text-xs">
          Solved {solvedCount} / {SCENARIOS.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((item, itemIndex) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={itemIndex === index ? "default" : "outline"}
            onClick={() => goTo(itemIndex)}
          >
            {itemIndex + 1}
            {solved[item.id] ? " ✓" : ""}
          </Button>
        ))}
      </div>

      <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
        <p className="text-foreground font-medium">{scenario.title}</p>
        <p className="text-sm">
          <strong className="text-foreground">Symptoms:</strong>{" "}
          {scenario.symptoms}
        </p>
        <div>
          <p className="text-foreground text-sm font-medium">Evidence</p>
          <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-5 text-sm">
            {scenario.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <ul className="text-muted-foreground space-y-1 font-mono text-xs">
          {metricLines(state).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">
          Simulated metrics — not from your host
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-foreground font-medium">{scenario.question}</p>
        <ul className="space-y-2">
          {scenario.options.map((option) => {
            const isSelected = selected === option.key;
            const showResult = submitted && isSelected;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelected(option.key)}
                  className={cn(
                    "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    isSelected &&
                      !submitted &&
                      "border-primary/50 bg-primary/5",
                    showResult &&
                      isCorrect &&
                      "border-green-600/40 bg-green-500/10",
                    showResult &&
                      !isCorrect &&
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

        <div className="flex flex-wrap gap-2">
          {!submitted ? (
            <>
              <Button type="button" disabled={!selected} onClick={submitAnswer}>
                Check answer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHint(true)}
              >
                Show hint
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelected(null);
                setSubmitted(false);
                setShowHint(false);
              }}
            >
              Try again
            </Button>
          )}
          {index < SCENARIOS.length - 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => goTo(index + 1)}
            >
              Next scenario
            </Button>
          ) : null}
        </div>

        {showHint && !submitted ? (
          <p className="text-muted-foreground text-sm">Hint: {scenario.hint}</p>
        ) : null}

        {submitted ? (
          <Callout title={isCorrect ? "Correct" : "Not quite"}>
            <p>
              {isCorrect
                ? scenario.feedbackCorrect
                : scenario.feedbackIncorrect}
            </p>
          </Callout>
        ) : null}
      </div>
    </div>
  );
}
