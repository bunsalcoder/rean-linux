"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  allocateMemory,
  createAllocationExerciseState,
  releaseMemory,
  resetAllocationExercise,
  type SimulatedMemoryState,
} from "@/lib/simulate-memory-and-swap";
import { cn } from "@/lib/utils";

type QuizAnswer = Record<string, string>;

const LAB_QUIZ = [
  {
    id: "q1",
    prompt:
      "When you allocate 2 GiB to web-api and free memory falls, what happens to page cache first?",
    options: [
      {
        key: "A",
        label:
          "The kernel reclaims page cache to satisfy the demand before swapping.",
      },
      {
        key: "B",
        label: "The kernel immediately kills the process asking for memory.",
      },
      { key: "C", label: "Nothing — page cache can never be reclaimed." },
      { key: "D", label: "The process crashes with an OOM error." },
    ],
    correct: "A",
    explanation:
      "Linux reclaims reclaimable page cache (clean file data) before moving to swap, because cache data can be re-read from disk cheaply compared to swap.",
  },
  {
    id: "q2",
    prompt:
      "What metric best tells you whether the system truly has memory pressure?",
    options: [
      {
        key: "A",
        label:
          "Available memory — it reflects free + reclaimable cache, not just free.",
      },
      {
        key: "B",
        label: "Free memory alone — it is the only accurate measure.",
      },
      { key: "C", label: "Virtual memory (VSZ) of the largest process." },
      { key: "D", label: "Swap total minus swap used." },
    ],
    correct: "A",
    explanation:
      "Available memory (MemAvailable in /proc/meminfo) is the best indicator because it includes free plus reclaimable cache. Free alone can look low even on a healthy, cache-heavy system.",
  },
  {
    id: "q3",
    prompt:
      "When does the kernel begin writing pages to swap in this simplified model?",
    options: [
      {
        key: "A",
        label:
          "When available memory is very low and there is not enough reclaimable cache to satisfy demand.",
      },
      { key: "B", label: "Immediately when any application starts." },
      { key: "C", label: "Only when free=0 and all processes are killed." },
      { key: "D", label: "When load average exceeds the number of CPUs." },
    ],
    correct: "A",
    explanation:
      "The kernel prefers to reclaim page cache first. Swap activity starts when reclaimable cache is depleted and available memory is critically low, forcing anonymous pages onto the swap device.",
  },
] as const;

function PressureIndicator({
  level,
}: {
  level: SimulatedMemoryState["pressureLevel"];
}) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 text-xs font-medium tracking-wide",
        level === "critical" && "bg-destructive/15 text-destructive",
        level === "high" &&
          "bg-amber-500/15 text-amber-700 dark:text-amber-400",
        level === "moderate" &&
          "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
        level === "low" && "bg-primary/10 text-primary",
      )}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export function MemoryAndSwapAllocationLab() {
  const [state, setState] = useState<SimulatedMemoryState>(
    createAllocationExerciseState,
  );
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  function handleAllocate(appId: string, amountMiB: number) {
    setState((prev) => allocateMemory(prev, appId, amountMiB));
  }

  function handleRelease(appId: string, amountMiB: number) {
    setState((prev) => releaseMemory(prev, appId, amountMiB));
  }

  function handleReleaseAll(appId: string) {
    setState((prev) => {
      const app = prev.allocationApps.find((a) => a.id === appId);
      if (!app) return prev;
      return releaseMemory(prev, appId, app.allocatedMiB);
    });
  }

  function handleReset() {
    setState(resetAllocationExercise());
  }

  const availablePct = (state.availableMiB / state.totalMiB) * 100;
  const swapPct =
    state.swapTotalMiB > 0 ? (state.swapUsedMiB / state.swapTotalMiB) * 100 : 0;
  const quizScore = LAB_QUIZ.filter(
    (q) => quizAnswers[q.id] === q.correct,
  ).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Memory allocation exercise
        </h3>
        <p className="text-muted-foreground text-sm">
          Allocate and release memory for fictional applications. Observe how
          the kernel reclaims cache, raises pressure, and starts swap activity
          when demand exceeds available pages.
        </p>
      </div>

      <Callout title="Simplified educational model — not kernel memory management">
        <p>
          This exercise uses a greatly simplified allocation model to illustrate
          concepts. It does not reproduce Linux kernel memory management, buddy
          allocators, or actual virtual memory accounting. The goal is to build
          intuition about cache reclaim and swap thresholds.
        </p>
      </Callout>

      {/* System summary */}
      <div className="border-border bg-muted/30 grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Available
          </p>
          <p className="text-foreground font-mono text-lg tabular-nums">
            {state.availableMiB} MiB
          </p>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                availablePct < 5 && "bg-destructive",
                availablePct >= 5 && availablePct < 15 && "bg-amber-500",
                availablePct >= 15 && "bg-primary",
              )}
              style={{ width: `${100 - availablePct}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {availablePct.toFixed(0)}% free headroom
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Memory pressure
          </p>
          <PressureIndicator level={state.pressureLevel} />
          <p className="text-muted-foreground text-xs">
            Reclaim: {state.reclaimActivity}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Swap used
          </p>
          <p className="text-foreground font-mono text-lg tabular-nums">
            {state.swapUsedMiB} MiB
          </p>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                swapPct > 80 && "bg-destructive",
                swapPct > 40 && swapPct <= 80 && "bg-amber-500",
                swapPct <= 40 && "bg-primary",
              )}
              style={{ width: `${swapPct}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            si: {state.swapSi}/s · so: {state.swapSo}/s
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Page cache
          </p>
          <p className="text-foreground font-mono text-lg tabular-nums">
            {state.cachedMiB} MiB
          </p>
          <p className="text-muted-foreground text-xs">Reclaimable on demand</p>
        </div>
      </div>

      {/* App allocation table */}
      <div className="space-y-3">
        <p className="text-foreground text-sm font-medium">
          Fictional application allocations
        </p>
        <div className="space-y-3">
          {state.allocationApps.map((app) => {
            const pct = (app.allocatedMiB / app.maxMiB) * 100;
            return (
              <div
                key={app.id}
                className="border-border space-y-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-foreground font-mono text-sm font-medium">
                    {app.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {app.allocatedMiB} / {app.maxMiB} MiB
                  </p>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAllocate(app.id, 256)}
                  >
                    +256 MiB
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleAllocate(app.id, 512)}
                  >
                    +512 MiB
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRelease(app.id, 256)}
                    disabled={app.allocatedMiB < 256}
                  >
                    −256 MiB
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleReleaseAll(app.id)}
                    disabled={app.allocatedMiB === 0}
                  >
                    Release all
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset all allocations
        </Button>
      </div>

      {/* Observation callouts */}
      {state.pressureLevel === "critical" || state.pressureLevel === "high" ? (
        <Callout title="Memory pressure observed">
          <p>
            Available memory is critically low. In a real system this would
            cause elevated page faults, slower I/O, and potential OOM events.
            Try releasing memory from one or more apps to observe pressure
            decreasing.
          </p>
        </Callout>
      ) : null}

      {state.swapSo > 0 ? (
        <Callout title="Swap activity triggered">
          <p>
            Allocating beyond reclaimable cache has started swap activity (so=
            {state.swapSo} pages/s). In a real system this introduces disk
            latency for every page that must be moved to or from swap.
          </p>
        </Callout>
      ) : null}

      {/* Quiz */}
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-foreground font-medium">Reflection questions</p>
          <p className="text-muted-foreground text-sm">
            Answer based on what you observed and the concepts you learned.
          </p>
        </div>
        <ol className="space-y-6">
          {LAB_QUIZ.map((q, qi) => {
            const sel = quizAnswers[q.id];
            const isCorrect = sel === q.correct;
            return (
              <li key={q.id} className="space-y-3">
                <p className="text-foreground font-medium">
                  {qi + 1}. {q.prompt}
                </p>
                <ul className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = sel === opt.key;
                    const showResult = quizSubmitted && isSelected;
                    return (
                      <li key={opt.key}>
                        <button
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [q.id]: opt.key,
                            }))
                          }
                          className={cn(
                            "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                            isSelected &&
                              !quizSubmitted &&
                              "border-primary/50 bg-primary/5",
                            showResult &&
                              isCorrect &&
                              "border-green-600/40 bg-green-500/10",
                            showResult &&
                              !isCorrect &&
                              "border-destructive/40 bg-destructive/10",
                            quizSubmitted && "cursor-default",
                          )}
                        >
                          <span className="text-muted-foreground font-mono text-xs font-medium">
                            {opt.key}.
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {quizSubmitted ? (
                  <p className="text-muted-foreground text-sm">
                    {q.explanation}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap gap-2">
          {!quizSubmitted ? (
            <Button
              type="button"
              disabled={LAB_QUIZ.some((q) => !quizAnswers[q.id])}
              onClick={() => setQuizSubmitted(true)}
            >
              Check answers
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
            >
              Try again
            </Button>
          )}
        </div>
        {quizSubmitted ? (
          <Callout
            title={
              quizScore === LAB_QUIZ.length
                ? "Perfect score"
                : `Score: ${quizScore} / ${LAB_QUIZ.length}`
            }
          >
            <p>
              {quizScore === LAB_QUIZ.length
                ? "You understand cache reclaim, available vs. free, and when swap begins."
                : "Review cache reclaim order, the MemAvailable metric, and the conditions for swap activity."}
            </p>
          </Callout>
        ) : null}
      </div>
    </div>
  );
}
