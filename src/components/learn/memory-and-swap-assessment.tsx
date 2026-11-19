"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  createInitialMemoryState,
  type SimulatedMemoryState,
} from "@/lib/simulate-memory-and-swap";
import { cn } from "@/lib/utils";

type StepId =
  | "inspect"
  | "available"
  | "cache"
  | "pressure"
  | "processes"
  | "leak"
  | "swap"
  | "recommend"
  | "verify"
  | "complete";

const FINAL_CONDITION = "memory-pressure" as const;

const AVAILABLE_OPTIONS = [
  {
    key: "A",
    label:
      "Available=380 MiB (4.6% of 8192 MiB) is critically low — not just 'free'",
    correct: true,
  },
  {
    key: "B",
    label: "Free=92 MiB tells the whole story — available can be ignored",
    correct: false,
  },
  {
    key: "C",
    label: "Available=380 MiB is fine because swap is not fully used",
    correct: false,
  },
  {
    key: "D",
    label: "Available memory always equals free memory on Linux",
    correct: false,
  },
] as const;

const CACHE_OPTIONS = [
  {
    key: "A",
    label:
      "Page cache=310 MiB is very low — most reclaimable cache has already been consumed by application demand",
    correct: true,
  },
  {
    key: "B",
    label:
      "Page cache=310 MiB is a warning sign because cache should always be at least 4 GiB",
    correct: false,
  },
  {
    key: "C",
    label: "Page cache is irrelevant to available memory",
    correct: false,
  },
  {
    key: "D",
    label:
      "High page cache always means memory is healthy regardless of available",
    correct: false,
  },
] as const;

const PRESSURE_OPTIONS = [
  {
    key: "A",
    label:
      "Major faults=180/s and reclaimActivity=elevated both point to the kernel actively reclaiming and apps suffering page misses",
    correct: true,
  },
  {
    key: "B",
    label: "Minor faults are the primary indicator of memory pressure",
    correct: false,
  },
  {
    key: "C",
    label: "Major faults of 180/s is normal and expected at all times",
    correct: false,
  },
  {
    key: "D",
    label: "Pressure can only be detected with sar, not free or /proc/meminfo",
    correct: false,
  },
] as const;

const PROCESS_OPTIONS = [
  {
    key: "A",
    label:
      "java (2900 MiB RSS), postgres (2200 MiB), and node (1600 MiB) are the dominant consumers accounting for most physical RAM",
    correct: true,
  },
  {
    key: "B",
    label: "Only the sshd process is using significant memory",
    correct: false,
  },
  {
    key: "C",
    label: "VSZ is the right metric for understanding physical memory usage",
    correct: false,
  },
  {
    key: "D",
    label: "No process uses more than 100 MiB in this scenario",
    correct: false,
  },
] as const;

const LEAK_OPTIONS = [
  {
    key: "A",
    label:
      "No process shows obvious leak in this snapshot — RSS values are high but stable. Trend data over time would be needed to confirm a leak.",
    correct: true,
  },
  {
    key: "B",
    label: "java's high RSS alone proves it has a memory leak right now.",
    correct: false,
  },
  {
    key: "C",
    label: "Any RSS above 1 GiB is by definition a memory leak.",
    correct: false,
  },
  {
    key: "D",
    label: "Memory leaks only affect swap, not physical RSS.",
    correct: false,
  },
] as const;

const SWAP_OPTIONS = [
  {
    key: "A",
    label:
      "si=4/s and so=12/s show early but active swapping — not emergency rates but a warning that pressure is forcing page eviction to disk",
    correct: true,
  },
  {
    key: "B",
    label: "si=4/s and so=12/s are zero — swap is not active",
    correct: false,
  },
  {
    key: "C",
    label:
      "Any swap usage at all means the system must be restarted immediately",
    correct: false,
  },
  {
    key: "D",
    label:
      "Swap-out (so) means pages are coming from disk, increasing response time",
    correct: false,
  },
] as const;

const RECOMMEND_OPTIONS = [
  {
    key: "A",
    label:
      "Identify which process can be tuned or scaled horizontally; consider adding RAM or reducing resident memory footprint; monitor available and si/so trend",
    correct: true,
  },
  {
    key: "B",
    label: "Disable swap completely as the first action",
    correct: false,
  },
  {
    key: "C",
    label: "Reboot immediately without investigation",
    correct: false,
  },
  {
    key: "D",
    label: "Add more logical CPUs to solve the memory issue",
    correct: false,
  },
] as const;

const VERIFY_COMMANDS = [
  "free -h",
  "free",
  "cat /proc/meminfo",
  "vmstat 1 5",
  "vmstat",
  "ps aux --sort=-%mem",
] as const;

function MetricBrief({ state }: { state: SimulatedMemoryState }) {
  return (
    <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-sm">
      <p className="text-foreground font-medium">
        Simulated investigation brief — memory-lab
      </p>
      <p>
        <strong className="text-foreground">User-reported symptoms:</strong>{" "}
        Application response time climbed from ~85 ms to 820 ms. No code changes
        deployed. Ops team asks for a memory investigation.
      </p>
      <ul className="text-muted-foreground space-y-1 font-mono text-xs">
        <li>
          Total: {state.totalMiB} MiB · Used: {state.usedMiB} MiB · Free:{" "}
          {state.freeMiB} MiB
        </li>
        <li>
          Buffers: {state.buffersMiB} MiB · Cached: {state.cachedMiB} MiB ·
          Available: {state.availableMiB} MiB
        </li>
        <li>
          Swap: {state.swapUsedMiB}/{state.swapTotalMiB} MiB · si:{" "}
          {state.swapSi}/s · so: {state.swapSo}/s
        </li>
        <li>
          Major faults: {state.majorFaults}/s · Pressure: {state.pressureLevel}{" "}
          · Reclaim: {state.reclaimActivity}
        </li>
        <li>
          Top processes:{" "}
          {[...state.processes]
            .sort((a, b) => b.rssMiB - a.rssMiB)
            .slice(0, 4)
            .map((p) => `${p.command} ${p.rssMiB} MiB`)
            .join(" · ")}
        </li>
        <li>App response time: {state.appResponseMs} ms</li>
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

export function MemoryAndSwapAssessment() {
  const [step, setStep] = useState<StepId>("inspect");
  const [availableAns, setAvailableAns] = useState<string | null>(null);
  const [cacheAns, setCacheAns] = useState<string | null>(null);
  const [pressureAns, setPressureAns] = useState<string | null>(null);
  const [processesAns, setProcessesAns] = useState<string | null>(null);
  const [leakAns, setLeakAns] = useState<string | null>(null);
  const [swapAns, setSwapAns] = useState<string | null>(null);
  const [recommendAns, setRecommendAns] = useState<string | null>(null);
  const [checkedCommands, setCheckedCommands] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [state] = useState<SimulatedMemoryState>(() =>
    createInitialMemoryState(FINAL_CONDITION),
  );

  const verified = checkedCommands.some((cmd) =>
    VERIFY_COMMANDS.some((c) => normalizeCommand(c) === cmd),
  );

  function advanceSingle(
    selected: string | null,
    options: readonly { key: string; correct: boolean }[],
    next: StepId,
    missMessage: string,
  ) {
    const correct = options.find((o) => o.correct)?.key;
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
          Practical final investigation
        </h3>
        <p className="text-muted-foreground text-sm">
          Investigate a fictional application server showing slow responses. Use
          the evidence systematically — do not jump to conclusions from a single
          metric.
        </p>
      </div>

      <MetricBrief state={state} />

      {step === "inspect" ? (
        <div className="space-y-3">
          <p className="text-sm">
            Step 1 — Review the memory brief. When ready, continue to interpret
            each signal.
          </p>
          <Button type="button" onClick={() => setStep("available")}>
            Continue to interpret available memory
          </Button>
        </div>
      ) : null}

      {step === "available" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 2 — Interpret available memory
          </p>
          <OptionList
            options={AVAILABLE_OPTIONS}
            selected={availableAns}
            submitted={false}
            onToggle={setAvailableAns}
          />
          <Button
            type="button"
            disabled={!availableAns}
            onClick={() =>
              advanceSingle(
                availableAns,
                AVAILABLE_OPTIONS,
                "cache",
                "Focus on the available metric (MemAvailable), not just free. Available ≈ free + reclaimable cache.",
              )
            }
          >
            Confirm reading
          </Button>
        </div>
      ) : null}

      {step === "cache" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 3 — Determine whether cache usage is normal
          </p>
          <OptionList
            options={CACHE_OPTIONS}
            selected={cacheAns}
            submitted={false}
            onToggle={setCacheAns}
          />
          <Button
            type="button"
            disabled={!cacheAns}
            onClick={() =>
              advanceSingle(
                cacheAns,
                CACHE_OPTIONS,
                "pressure",
                "In memory-pressure, page cache has been displaced by application demand — it is low, not normal. That is why available is also low.",
              )
            }
          >
            Confirm cache reading
          </Button>
        </div>
      ) : null}

      {step === "pressure" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 4 — Identify signs of memory pressure
          </p>
          <OptionList
            options={PRESSURE_OPTIONS}
            selected={pressureAns}
            submitted={false}
            onToggle={setPressureAns}
          />
          <Button
            type="button"
            disabled={!pressureAns}
            onClick={() =>
              advanceSingle(
                pressureAns,
                PRESSURE_OPTIONS,
                "processes",
                "Major faults (not minor) are the pressure signal — they require disk reads. Elevated reclaim activity confirms the kernel is working hard to free pages.",
              )
            }
          >
            Confirm pressure reading
          </Button>
        </div>
      ) : null}

      {step === "processes" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 5 — Identify the top memory consumers
          </p>
          <OptionList
            options={PROCESS_OPTIONS}
            selected={processesAns}
            submitted={false}
            onToggle={setProcessesAns}
          />
          <Button
            type="button"
            disabled={!processesAns}
            onClick={() =>
              advanceSingle(
                processesAns,
                PROCESS_OPTIONS,
                "leak",
                "Use RSS (resident set size) for physical memory. java, postgres, and node together hold most of the 8192 MiB.",
              )
            }
          >
            Confirm process reading
          </Button>
        </div>
      ) : null}

      {step === "leak" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 6 — Distinguish memory leaks from temporary usage
          </p>
          <OptionList
            options={LEAK_OPTIONS}
            selected={leakAns}
            submitted={false}
            onToggle={setLeakAns}
          />
          <Button
            type="button"
            disabled={!leakAns}
            onClick={() =>
              advanceSingle(
                leakAns,
                LEAK_OPTIONS,
                "swap",
                "High RSS alone does not prove a leak. A leak grows monotonically without recovery. You need trend data (RSS over hours) to distinguish leak from temporary high usage.",
              )
            }
          >
            Confirm leak reading
          </Button>
        </div>
      ) : null}

      {step === "swap" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 7 — Assess whether swap activity is problematic
          </p>
          <OptionList
            options={SWAP_OPTIONS}
            selected={swapAns}
            submitted={false}
            onToggle={setSwapAns}
          />
          <Button
            type="button"
            disabled={!swapAns}
            onClick={() =>
              advanceSingle(
                swapAns,
                SWAP_OPTIONS,
                "recommend",
                "si/so of 4/12 pages per second is an early warning. Swap-out (so) moves pages TO disk; swap-in (si) means pages are being fetched BACK — both add disk latency.",
              )
            }
          >
            Confirm swap reading
          </Button>
        </div>
      ) : null}

      {step === "recommend" ? (
        <div className="space-y-3">
          <p className="text-foreground font-medium">
            Step 8 — Recommend the next investigation
          </p>
          <OptionList
            options={RECOMMEND_OPTIONS}
            selected={recommendAns}
            submitted={false}
            onToggle={setRecommendAns}
          />
          <Button
            type="button"
            disabled={!recommendAns}
            onClick={() =>
              advanceSingle(
                recommendAns,
                RECOMMEND_OPTIONS,
                "verify",
                "The right path is to identify which process can be optimized, then consider adding RAM. Disabling swap without fixing demand could cause immediate OOM.",
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
            Step 9 — Verify the conclusion
          </p>
          <p className="text-muted-foreground text-sm">
            Run <code className="font-mono text-xs">free -h</code>,{" "}
            <code className="font-mono text-xs">cat /proc/meminfo</code>, or{" "}
            <code className="font-mono text-xs">ps aux --sort=-%mem</code> to
            confirm low available, elevated swap activity, and top consumers.
          </p>
          <TerminalSimulator
            memoryAndSwap={FINAL_CONDITION}
            suggestions={[
              { command: "free -h", label: "free -h" },
              { command: "cat /proc/meminfo", label: "/proc/meminfo" },
              { command: "vmstat 1 5", label: "vmstat 1 5" },
              { command: "ps aux --sort=-%mem", label: "ps aux" },
              { command: "swapon --show", label: "swapon" },
            ]}
            suggestionsLabel="Verify with commands"
            onCommandRun={(cmd) => {
              const normalized = normalizeCommand(cmd);
              if (
                VERIFY_COMMANDS.some((c) => normalizeCommand(c) === normalized)
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
            The simulated evidence supports a <strong>memory pressure</strong>{" "}
            diagnosis: available=380 MiB, page cache depleted, major faults
            elevated, and si/so rates rising. The root cause is application
            demand (java + postgres + node) collectively exhausting physical RAM
            and reclaimable cache.
          </p>
          <p className="mt-2">
            A sound next move is to profile the top RSS consumers, consider
            tuning heap limits (JVM -Xmx, etc.) or horizontal scaling, add
            physical RAM, and re-verify that available returns to a healthy
            level before closing the incident.
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
