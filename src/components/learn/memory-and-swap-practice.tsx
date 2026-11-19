"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  createInitialMemoryState,
  type MemoryConditionId,
  type SimulatedMemoryState,
} from "@/lib/simulate-memory-and-swap";
import { cn } from "@/lib/utils";

type Option = {
  key: string;
  label: string;
};

type LabScenario = {
  id: string;
  title: string;
  conditionId: MemoryConditionId;
  symptoms: string;
  evidence: readonly string[];
  question: string;
  hint: string;
  options: readonly Option[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
};

function metricLines(state: SimulatedMemoryState): readonly string[] {
  const swapPct =
    state.swapTotalMiB > 0
      ? ((state.swapUsedMiB / state.swapTotalMiB) * 100).toFixed(0)
      : "0";
  return [
    `Total: ${state.totalMiB} MiB · Used: ${state.usedMiB} MiB · Free: ${state.freeMiB} MiB`,
    `Buffers: ${state.buffersMiB} MiB · Cached: ${state.cachedMiB} MiB · Buff/cache: ${state.buffCacheMiB} MiB`,
    `Available: ${state.availableMiB} MiB (${((state.availableMiB / state.totalMiB) * 100).toFixed(0)}% of total)`,
    `Swap total: ${state.swapTotalMiB} MiB · Used: ${state.swapUsedMiB} MiB (${swapPct}%) · si: ${state.swapSi}/s · so: ${state.swapSo}/s`,
    `Major faults: ${state.majorFaults}/s · Pressure: ${state.pressureLevel} · Reclaim: ${state.reclaimActivity}`,
    `Top processes: ${[...state.processes]
      .sort((a, b) => b.memPercent - a.memPercent)
      .slice(0, 3)
      .map((p) => `${p.command} ${p.rssMiB} MiB [${p.memPercent.toFixed(0)}%]`)
      .join(" · ")}`,
    `App response: ${state.appResponseMs} ms`,
  ];
}

const SCENARIOS: readonly LabScenario[] = [
  {
    id: "cache-heavy",
    title: "Scenario 1 — Low Free, High Cache",
    conditionId: "cache-heavy",
    symptoms:
      "An operator sees `free` output showing only 180 MiB free and raises an alert. Application response is 88 ms.",
    evidence: [
      "free=180 MiB — looks very low.",
      "buff/cache=5020 MiB — most RAM occupied by page cache.",
      "available=4600 MiB — Linux can reclaim page cache on demand.",
    ],
    question: "Is this a memory problem that requires immediate action?",
    hint: "The key metric is 'available', not 'free'. Page cache is reclaimable on demand.",
    options: [
      {
        key: "A",
        label:
          "No — available memory is healthy (4.6 GiB). Page cache is reclaimable and normal Linux behavior.",
      },
      {
        key: "B",
        label:
          "Yes — free is below 1 GiB, so the system is immediately in danger.",
      },
      {
        key: "C",
        label: "Yes — high buff/cache always signals memory corruption.",
      },
      {
        key: "D",
        label:
          "No — because page cache can never be reclaimed on a production server.",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Free looks alarming but available=4.6 GiB tells the real story. Linux fills spare RAM with page cache (normal and healthy). The kernel reclaims it when applications need more.",
    feedbackIncorrect:
      "Look at 'available', not 'free'. Page cache (reclaimable) is counted in buff/cache. High buff/cache with high available = healthy, not broken.",
  },
  {
    id: "memory-pressure",
    title: "Scenario 2 — Memory Pressure",
    conditionId: "memory-pressure",
    symptoms:
      "Application response time has climbed to 820 ms (baseline 85 ms). No other obvious change.",
    evidence: [
      "available=380 MiB and declining.",
      "Major page faults elevated at 180/s.",
      "Swap usage 128 MiB, si=4/s, so=12/s.",
      "Reclaim activity: elevated.",
    ],
    question:
      "What is the most likely explanation for the elevated application response time?",
    hint: "Major page faults require reading data from disk. Memory pressure causes the kernel to reclaim pages that apps later need.",
    options: [
      {
        key: "A",
        label:
          "Memory pressure — available is low, kernel reclaims pages apps need, causing major faults and disk reads.",
      },
      {
        key: "B",
        label:
          "CPU saturation — the high page-fault count means all CPUs are at 100%.",
      },
      {
        key: "C",
        label:
          "Disk hardware failure — major faults only happen when storage is broken.",
      },
      {
        key: "D",
        label:
          "Normal behavior — 820 ms response with high faults is never related to memory.",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Low available memory triggers active reclaim. When reclaimed pages are needed again, they cause major page faults requiring disk reads — that is the latency source.",
    feedbackIncorrect:
      "Major faults + low available + elevated reclaim = memory pressure path. CPU saturation would need top/mpstat evidence, not memory metrics.",
  },
  {
    id: "active-swap",
    title: "Scenario 3 — Active Swapping",
    conditionId: "active-swap",
    symptoms:
      "Response time has climbed to 1850 ms. Ops notices the server 'feels' slow for all users.",
    evidence: [
      "available=240 MiB.",
      "si=42 pages/s, so=68 pages/s.",
      "Swap used=1024 MiB of 2048 MiB.",
      "Major faults=390/s.",
    ],
    question:
      "What distinguishes active thrashing from just having swap allocated?",
    hint: "Look at si/so rates. High si+so means constant I/O between RAM and swap disk. Having swap in use at zero si/so is a different situation.",
    options: [
      {
        key: "A",
        label:
          "Active si/so rates (42+68=110 pages/s) show constant swap I/O, causing disk latency for every page fault. Swap allocated at zero si/so would be a different scenario.",
      },
      {
        key: "B",
        label:
          "Swap in use always means active thrashing — zero si/so is impossible if swap is used.",
      },
      {
        key: "C",
        label: "si/so rates are always identical to free memory in MiB.",
      },
      {
        key: "D",
        label:
          "The only way to detect active swapping is by looking at free, not si/so.",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Having swap pages allocated (si+so≈0) is different from active thrashing (high si+so). High si/so with elevated faults = pages being continuously moved between disk and RAM.",
    feedbackIncorrect:
      "The key distinction is si/so rates. Swap can be allocated (pages moved out earlier) while currently si=0/so=0 — that is not thrashing. Thrashing means persistent high si+so.",
  },
  {
    id: "memory-leak",
    title: "Scenario 4 — Memory Leak",
    conditionId: "memory-leak",
    symptoms:
      "Available memory declines steadily over hours, without any change in workload. A single process seems involved.",
    evidence: [
      "leaky-app RSS grew from ~120 MiB to 3450 MiB over the observation window.",
      "Available trends from 4.8 GiB down to 580 MiB.",
      "si/so and swap activity rising proportionally.",
      "Other process RSS values are stable.",
    ],
    question:
      "What diagnostic pattern best identifies a memory leak vs. temporary high usage?",
    hint: "Memory leaks grow monotonically and do not release after request completion. Temporary usage peaks then returns to baseline.",
    options: [
      {
        key: "A",
        label:
          "Monotonically growing RSS of a single process, with no release between workload bursts — unlike temporary spikes that return to baseline.",
      },
      {
        key: "B",
        label:
          "Any increase in process RSS above 1 GiB is by definition a memory leak.",
      },
      {
        key: "C",
        label: "Memory leaks always cause immediate OOM events within seconds.",
      },
      {
        key: "D",
        label: "Looking at cached memory is the only way to detect a leak.",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Monotonically growing RSS that never shrinks after request completion is the leak pattern. Compare baseline RSS on restart to current — a persistent delta confirms the leak.",
    feedbackIncorrect:
      "Size alone does not define a leak. The pattern is continuous growth without recovery. Temporary high RSS that falls after a job completes is not a leak.",
  },
  {
    id: "exhaustion",
    title: "Scenario 5 — OOM Situation",
    conditionId: "exhaustion",
    symptoms:
      "A production process has been killed. Logs show OOM killer activity. Response time is 4200 ms.",
    evidence: [
      "available=58 MiB, swap almost full (2008/2048 MiB used).",
      "si=95/s, so=110/s.",
      "OOM killer logged: 'Killed process 3100 (batch-worker)'.",
      "Major faults=1200/s.",
    ],
    question: "What conditions trigger the Linux OOM killer?",
    hint: "The OOM killer is a last resort. It fires when the kernel cannot satisfy a memory allocation after trying reclaim and swap.",
    options: [
      {
        key: "A",
        label:
          "Physical RAM and swap are both exhausted and the kernel cannot free enough pages to satisfy a pending allocation.",
      },
      {
        key: "B",
        label:
          "The OOM killer fires whenever available memory falls below 50%.",
      },
      {
        key: "C",
        label: "The OOM killer fires only when swap is completely disabled.",
      },
      {
        key: "D",
        label: "The OOM killer fires when CPU utilization exceeds 90%.",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. The OOM killer is a last resort: it fires when reclaim and swap are both exhausted and an allocation cannot be satisfied. It selects a process to terminate based on oom_score.",
    feedbackIncorrect:
      "The OOM killer is not percentage-based. It fires only when both RAM and swap are exhausted and cannot be reclaimed. A system can run with available=5% indefinitely if demand does not grow.",
  },
] as const;

export function MemoryAndSwapPractice() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  const scenario = SCENARIOS[index] ?? SCENARIOS[0]!;
  const state = createInitialMemoryState(scenario.conditionId);
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
          Memory troubleshooting lab
        </h3>
        <p className="text-muted-foreground text-sm">
          Work five fictional memory incidents. Match symptoms and simulated
          metrics to the best diagnostic reasoning. Progress stays on this page
          only.
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
