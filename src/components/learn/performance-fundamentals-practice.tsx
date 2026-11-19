"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  createInitialPerformanceState,
  type PerformanceScenarioId,
  type SimulatedPerformanceState,
} from "@/lib/simulate-performance-fundamentals";
import { cn } from "@/lib/utils";

type BottleneckOption = {
  key: string;
  label: string;
};

type LabScenario = {
  id: string;
  title: string;
  scenarioId: PerformanceScenarioId;
  symptoms: string;
  observations: readonly string[];
  question: string;
  hint: string;
  options: readonly BottleneckOption[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  uncertaintyNote: string;
};

function formatMiB(value: number): string {
  if (value >= 1024) {
    return `${Math.round((value / 1024) * 10) / 10} GiB`;
  }
  return `${Math.round(value)} MiB`;
}

function metricLines(state: SimulatedPerformanceState): readonly string[] {
  return [
    `CPU utilization: ${state.cpuUtilizationPercent}% (user ${state.cpuUserPercent}% / system ${state.cpuSystemPercent}% / idle ${state.cpuIdlePercent}% / iowait ${state.diskIo.ioWaitPercent}%)`,
    `Load average: ${state.loadAvg[0].toFixed(2)}, ${state.loadAvg[1].toFixed(2)}, ${state.loadAvg[2].toFixed(2)} on ${state.cpuCount} vCPUs`,
    `Memory: available ${formatMiB(state.memory.availableMiB)} · used ${formatMiB(state.memory.usedMiB)} · total ${formatMiB(state.memory.totalMiB)}`,
    `Swap: ${formatMiB(state.memory.swapUsedMiB)} used of ${formatMiB(state.memory.swapTotalMiB)}`,
    `Disk I/O: read ${Math.round(state.diskIo.readKiBs)} KiB/s · write ${Math.round(state.diskIo.writeKiBs)} KiB/s · await ${state.diskIo.awaitMs} ms · util ${state.diskIo.utilPercent}%`,
    `Network: RX/TX ${state.network.rxMbps}/${state.network.txMbps} Mbps · latency ${state.network.latencyMs} ms · loss ${state.network.packetLossPercent}%`,
    `Application response time: ${state.appResponseMs} ms`,
  ];
}

const SCENARIOS: readonly LabScenario[] = [
  {
    id: "cpu-saturation",
    title: "Scenario 1 — CPU Saturation",
    scenarioId: "high-cpu",
    symptoms:
      "Users report the batch API is timing out during the nightly export window.",
    observations: [
      "One process (`batch-worker`) dominates CPU in the process list.",
      "Available memory remains several GiB.",
      "Disk I/O wait stays low.",
    ],
    question: "Which resource is most likely responsible for the slowdown?",
    hint: "Compare utilization and load to CPU count. Healthy memory and low iowait push suspicion toward CPU.",
    options: [
      { key: "A", label: "CPU saturation" },
      { key: "B", label: "Memory pressure" },
      { key: "C", label: "Disk I/O bottleneck" },
      { key: "D", label: "Network congestion" },
      {
        key: "E",
        label: "Application-level issue only (host resources healthy)",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. ~96% CPU with load ~8.5 on 4 vCPUs, healthy available memory, and low I/O wait point to CPU saturation as the primary host bottleneck.",
    feedbackIncorrect:
      "Re-check CPU percentage and load versus 4 vCPUs. Memory available and I/O wait look healthy here.",
    uncertaintyNote:
      "CPU saturation explains host pressure; you would still confirm which process is expected before killing work.",
  },
  {
    id: "memory-pressure",
    title: "Scenario 2 — Memory Pressure",
    scenarioId: "memory-pressure",
    symptoms:
      "The app becomes sluggish after a cache warm-up; pages take much longer to load.",
    observations: [
      "Available memory drops under a few hundred MiB.",
      "Swap used climbs while response time rises.",
      "CPU utilization is only moderate.",
    ],
    question: "Which resource is most likely contributing to the slowdown?",
    hint: "Prefer available memory over “used.” Rising swap with low available is a classic pressure signal.",
    options: [
      { key: "A", label: "CPU saturation" },
      { key: "B", label: "Memory pressure" },
      { key: "C", label: "Disk I/O as the only cause (RAM is fine)" },
      { key: "D", label: "Network congestion" },
      {
        key: "E",
        label: "Application-level issue only (host resources healthy)",
      },
    ],
    correct: "B",
    feedbackCorrect:
      "Correct. Very low available memory with increasing swap — while CPU is only moderate — makes memory pressure the leading contributor.",
    feedbackIncorrect:
      "Look at available memory and swap used. Moderate CPU alone does not explain this pattern.",
    uncertaintyNote:
      "Some extra disk activity can appear while the kernel pages to swap. That secondary I/O does not replace the memory-pressure diagnosis.",
  },
  {
    id: "disk-io",
    title: "Scenario 3 — Disk I/O Bottleneck",
    scenarioId: "disk-io",
    symptoms:
      "Report generation stalls; users wait on downloads that used to finish quickly.",
    observations: [
      "CPU utilization is moderate, not pegged.",
      "I/O wait and disk latency (await) are elevated.",
      "Application response time climbs with disk util near saturation.",
    ],
    question: "Which resource is most likely the bottleneck?",
    hint: "High iowait and await with only moderate CPU often means the CPUs are waiting on storage.",
    options: [
      { key: "A", label: "CPU saturation" },
      { key: "B", label: "Memory pressure" },
      { key: "C", label: "Disk I/O bottleneck" },
      { key: "D", label: "Network congestion" },
      {
        key: "E",
        label: "Application-level issue only (host resources healthy)",
      },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. Elevated I/O wait, high disk latency/utilization, and rising response time with moderate CPU point to a disk I/O bottleneck.",
    feedbackIncorrect:
      "Focus on iowait, await, and disk %util. CPU is busy waiting, not fully computing.",
    uncertaintyNote:
      "Confirm which process is issuing I/O before changing storage settings. Capacity (df) can still look fine while disks are latency-bound.",
  },
  {
    id: "network",
    title: "Scenario 4 — Network Congestion",
    scenarioId: "network-congestion",
    symptoms:
      "API calls that depend on an upstream service intermittently time out.",
    observations: [
      "CPU and memory look healthy.",
      "Network latency is high and packet loss is elevated.",
      "Local disk I/O wait remains low.",
    ],
    question: "Where should investigation focus first?",
    hint: "When host resources look fine but path latency/loss rise, the network path or remote dependency deserves attention.",
    options: [
      { key: "A", label: "CPU saturation on this host" },
      { key: "B", label: "Memory pressure on this host" },
      { key: "C", label: "Local disk I/O bottleneck" },
      { key: "D", label: "Network performance (latency / loss)" },
      { key: "E", label: "Ignore metrics and reboot immediately" },
    ],
    correct: "D",
    feedbackCorrect:
      "Correct. Healthy CPU/memory with high latency and packet loss means network performance needs investigation — not a local CPU or RAM resize.",
    feedbackIncorrect:
      "Host CPU and memory look fine. Latency and packet loss are the abnormal signals.",
    uncertaintyNote:
      "Network symptoms can also come from a slow remote service. Treat “network” as the investigation area, not a final root-cause claim.",
  },
  {
    id: "application",
    title: "Scenario 5 — Application-Level Slowdown",
    scenarioId: "application-slowdown",
    symptoms:
      "Checkout requests take over a second, but operators see quiet host charts.",
    observations: [
      "CPU, memory, disk, and network metrics appear normal.",
      "Application response time is still high.",
      "No single host resource is saturated.",
    ],
    question: "What is the best next conclusion from this evidence?",
    hint: "If host resources look healthy while the app is slow, look inside the application and its dependencies.",
    options: [
      {
        key: "A",
        label: "Add more CPUs immediately — charts must be wrong",
      },
      {
        key: "B",
        label: "Buy more RAM without inspecting the app",
      },
      {
        key: "C",
        label:
          "Investigate application behavior and dependencies (not assume a hardware bottleneck)",
      },
      {
        key: "D",
        label: "The disk is full because response time is high",
      },
      {
        key: "E",
        label: "Packet loss is proven even though loss is 0%",
      },
    ],
    correct: "C",
    feedbackCorrect:
      "Correct. Normal host metrics with high app latency mean you should investigate application behavior, locks, queries, and dependencies — not assume CPU/RAM/disk saturation.",
    feedbackIncorrect:
      "Do not force a hardware bottleneck when CPU, memory, disk, and network look healthy. Move to application-level evidence.",
    uncertaintyNote:
      "Absence of host saturation does not prove the app is “broken” forever — it means the next evidence should come from application traces, DB stats, or dependency health.",
  },
] as const;

export function PerformanceFundamentalsPractice() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const scenario = SCENARIOS[index] ?? SCENARIOS[0]!;
  const state = createInitialPerformanceState(scenario.scenarioId);
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
          Bottleneck identification lab
        </h3>
        <p className="text-muted-foreground text-sm">
          Review each fictional server situation. Choose the most likely
          bottleneck supported by the evidence — do not conclude more than the
          metrics justify.
        </p>
        <p className="text-muted-foreground text-sm">
          Progress: {solvedCount} / {SCENARIOS.length} scenarios solved
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

      <div className="border-border space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <h4 className="text-foreground font-medium">{scenario.title}</h4>
          <p className="text-sm">
            <strong className="text-foreground">User-reported symptoms:</strong>{" "}
            {scenario.symptoms}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            Simulated system metrics
          </p>
          <ul className="text-muted-foreground space-y-1 font-mono text-xs">
            {metricLines(state).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">
            All values simulated
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">Observations</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {scenario.observations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
        </div>

        <div className="flex flex-wrap gap-2">
          {!submitted ? (
            <>
              <Button type="button" disabled={!selected} onClick={submitAnswer}>
                Check answer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHint((value) => !value)}
              >
                {showHint ? "Hide hint" : "Show hint"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelected(null);
                  setSubmitted(false);
                }}
              >
                Try again
              </Button>
              {index < SCENARIOS.length - 1 ? (
                <Button type="button" onClick={() => goTo(index + 1)}>
                  Next scenario
                </Button>
              ) : null}
            </>
          )}
        </div>

        {showHint && !submitted ? (
          <Callout title="Hint">
            <p>{scenario.hint}</p>
          </Callout>
        ) : null}

        {submitted ? (
          <Callout title={isCorrect ? "Good reasoning" : "Not quite"}>
            <p>
              {isCorrect
                ? scenario.feedbackCorrect
                : scenario.feedbackIncorrect}
            </p>
            <p className="mt-2">{scenario.uncertaintyNote}</p>
          </Callout>
        ) : null}
      </div>
    </div>
  );
}
