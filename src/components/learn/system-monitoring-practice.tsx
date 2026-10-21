"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getRootDiskUsePercent,
  getSystemMonitoringScenario,
  getTopCpuProcess,
  getTopMemProcess,
  type SimulatedSystemMonitoringState,
  type SystemMonitoringScenarioId,
} from "@/lib/simulate-system-monitoring";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: SystemMonitoringScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedSystemMonitoringState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    if (target.startsWith("ps ")) {
      return normalized === target || normalized.startsWith("ps ");
    }
    if (target.startsWith("free")) {
      return normalized === "free" || normalized === "free -h";
    }
    if (target.startsWith("vmstat")) {
      return normalized === "vmstat" || normalized === "vmstat 1 5";
    }
    if (target.startsWith("df")) {
      return normalized === "df" || normalized === "df -h";
    }
    return normalized === target;
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "cpu-count",
    title: "Exercise 1 — Count available CPUs",
    scenarioId: "healthy",
    task: "Identify how many processing units the simulated host reports.",
    hint: "Run `nproc`. Load averages are easier to interpret once you know the CPU count.",
    relevantCommands: ["nproc"],
    options: [
      { key: "A", label: "4 CPUs" },
      { key: "B", label: "1 CPU" },
      { key: "C", label: "8 CPUs" },
      { key: "D", label: "16 CPUs" },
    ],
    correct: "A",
    requireState: (state) => state.cpuCount === 4,
    stateHint: "Run nproc and confirm the printed number before answering.",
    feedbackCorrect:
      "Correct. This lab host reports 4 CPUs — use that when judging whether load averages are high.",
    feedbackIncorrect:
      "Run `nproc` and read the single number it prints for this simulated host.",
  },
  {
    id: "memory-available",
    title: "Exercise 2 — Total and available memory",
    scenarioId: "healthy",
    task: "Find total RAM and available memory. Prefer available over treating all used memory as gone.",
    hint: "Run `free -h`. Look at the Mem row: total and available columns. Caches/buffers inflate “used” without meaning the system is out of memory.",
    relevantCommands: ["free -h", "free"],
    options: [
      {
        key: "A",
        label:
          "About 8 GiB total with several GiB still available (healthy spare capacity)",
      },
      {
        key: "B",
        label: "Total memory is under 1 GiB and available is zero",
      },
      {
        key: "C",
        label: "Swap is full and available memory is under 200 MiB",
      },
      {
        key: "D",
        label: "`free` only reports disk space, not RAM",
      },
    ],
    correct: "A",
    requireState: (state) =>
      state.memory.totalMiB === 8192 && state.memory.availableMiB >= 4000,
    stateHint: "Inspect free -h on the healthy scenario before answering.",
    feedbackCorrect:
      "Correct. Prefer the available column — Linux “used” memory often includes reclaimable cache.",
    feedbackIncorrect:
      "Run `free -h` and compare total vs available on the Mem line.",
  },
  {
    id: "top-cpu-process",
    title: "Exercise 3 — Highest CPU process",
    scenarioId: "high-cpu",
    task: "Identify which process is consuming the most CPU.",
    hint: "Use `top` or `ps aux` and sort visually by %CPU. Look for an unusually high single consumer.",
    relevantCommands: ["top", "ps aux", "ps -eo pid,comm,%cpu,%mem"],
    options: [
      { key: "A", label: "`batch-worker` is using roughly 90%+ CPU" },
      { key: "B", label: "`systemd` is using nearly all CPU" },
      { key: "C", label: "No process exceeds 5% CPU" },
      { key: "D", label: "`cron` is the top CPU consumer" },
    ],
    correct: "A",
    requireState: (state) =>
      getTopCpuProcess(state)?.command === "batch-worker",
    stateHint: "Inspect top or ps aux and confirm batch-worker leads %CPU.",
    feedbackCorrect:
      "Correct. High CPU utilization is a clue — next you would decide whether that work is expected.",
    feedbackIncorrect:
      "Compare %CPU columns in `top` or `ps aux` and find the largest value.",
  },
  {
    id: "top-mem-process",
    title: "Exercise 4 — Highest memory process",
    scenarioId: "memory-pressure",
    task: "Identify which process is using the most memory percentage.",
    hint: "Under memory pressure, look at %MEM in `ps aux` or `top`, not only CPU.",
    relevantCommands: ["ps aux", "top", "free -h"],
    options: [
      {
        key: "A",
        label: "`data-cache` holds the largest share of memory",
      },
      { key: "B", label: "`bash` is the largest memory consumer" },
      { key: "C", label: "`sshd` uses nearly half of RAM" },
      { key: "D", label: "All processes show under 1% memory" },
    ],
    correct: "A",
    requireState: (state) => getTopMemProcess(state)?.command === "data-cache",
    stateHint: "Confirm data-cache leads %MEM in ps/top before answering.",
    feedbackCorrect:
      "Correct. Pair process %MEM with `free -h` available and swap columns.",
    feedbackIncorrect:
      "Sort visually by %MEM and name the process with the largest percentage.",
  },
  {
    id: "load-vs-cpus",
    title: "Exercise 5 — Interpret load vs CPUs",
    scenarioId: "high-load",
    task: "Interpret the 1-minute load average relative to the CPU count.",
    hint: "Run `nproc` and `uptime`. Load near or above the CPU count for sustained periods suggests contention.",
    relevantCommands: ["nproc", "uptime", "top"],
    options: [
      {
        key: "A",
        label:
          "Load (~8.5) is well above 4 CPUs — the run queue is overloaded relative to capacity",
      },
      {
        key: "B",
        label: "Load of ~8.5 is always fine on a 4-CPU host",
      },
      {
        key: "C",
        label: "Load averages only measure free disk space",
      },
      {
        key: "D",
        label: "nproc reports 16 CPUs so load 8.5 is idle",
      },
    ],
    correct: "A",
    requireState: (state) =>
      state.cpuCount === 4 && state.loadAvg[0] > state.cpuCount,
    stateHint: "Compare uptime load averages with nproc before answering.",
    feedbackCorrect:
      "Correct. Load averages must be read relative to available CPU capacity — not as a universal “bad” number.",
    feedbackIncorrect:
      "Check `nproc` and the three load numbers from `uptime`, then compare.",
  },
  {
    id: "memory-pressure",
    title: "Exercise 6 — Recognize memory pressure",
    scenarioId: "memory-pressure",
    task: "Recognize low available memory and elevated swap usage.",
    hint: "Run `free -h`. Look for low available and non-zero / high swap used. `vmstat` can show swap in/out activity.",
    relevantCommands: ["free -h", "free", "vmstat", "vmstat 1 5"],
    options: [
      {
        key: "A",
        label:
          "Available memory is very low and swap usage is elevated — classic memory pressure",
      },
      {
        key: "B",
        label: "Plenty of available RAM and zero swap — no pressure",
      },
      {
        key: "C",
        label: "Only the root disk is full; RAM is irrelevant here",
      },
      {
        key: "D",
        label: "`free` shows disk usage, so swap cannot matter",
      },
    ],
    correct: "A",
    requireState: (state) =>
      state.memory.availableMiB < 512 && state.memory.swapUsedMiB > 1024,
    stateHint: "Confirm free -h shows low available and high swap used.",
    feedbackCorrect:
      "Correct. Low available memory plus elevated swap is a stronger signal than “used” alone.",
    feedbackIncorrect:
      "Read available and Swap used columns from `free -h` carefully.",
  },
  {
    id: "disk-vs-memory",
    title: "Exercise 7 — Disk space vs memory",
    scenarioId: "disk-space-warning",
    task: "Distinguish disk-space exhaustion from memory pressure.",
    hint: "Compare `df -h` with `free -h`. A full `/` filesystem is storage capacity — not the same as low available RAM.",
    relevantCommands: ["df -h", "df", "free -h", "uptime"],
    options: [
      {
        key: "A",
        label:
          "Root disk use is critically high while CPU/memory remain relatively healthy",
      },
      {
        key: "B",
        label:
          "Available RAM is near zero and swap is full — this is only memory pressure",
      },
      {
        key: "C",
        label: "Load averages above 8 prove the disks are full",
      },
      {
        key: "D",
        label: "`df` and `free` always report the same resource",
      },
    ],
    correct: "A",
    requireState: (state) =>
      getRootDiskUsePercent(state) >= 90 &&
      state.memory.availableMiB >= 4000 &&
      state.memory.swapUsedMiB === 0,
    stateHint:
      "Confirm df -h shows ~95% on / while free -h still looks healthy.",
    feedbackCorrect:
      "Correct. Disk capacity and RAM are different resources — diagnose with `df` vs `free`.",
    feedbackIncorrect:
      "Run both `df -h` and `free -h`, then compare disk Use% with available memory.",
  },
  {
    id: "next-command",
    title: "Exercise 8 — Choose the next diagnostic",
    scenarioId: "high-cpu",
    task: "Symptom: the host feels sluggish and you already saw elevated CPU. What is the most appropriate next diagnostic command?",
    hint: "After noticing CPU pressure, identify which process is responsible before changing configuration or killing anything.",
    relevantCommands: ["top", "ps aux", "uptime"],
    options: [
      {
        key: "A",
        label:
          "Inspect processes with `top` or `ps aux` to see who consumes CPU",
      },
      {
        key: "B",
        label: "Immediately kill PID 1 without gathering evidence",
      },
      {
        key: "C",
        label: "Only run `df -h` because sluggishness always means a full disk",
      },
      {
        key: "D",
        label: "Ignore metrics and reboot as the first step",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Diagnose first: identify the consumer, compare evidence, then act carefully.",
    feedbackIncorrect:
      "Prefer process inspection (`top` / `ps`) before disruptive actions.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "nproc", label: "nproc" },
  { command: "uptime", label: "uptime" },
  { command: "free -h", label: "free -h" },
  { command: "top", label: "top" },
  { command: "ps aux", label: "ps aux" },
  { command: "ps -eo pid,comm,%cpu,%mem", label: "ps -eo" },
  { command: "vmstat 1 5", label: "vmstat 1 5" },
  { command: "df -h", label: "df -h" },
  { command: "help", label: "help" },
] as const;

export function SystemMonitoringPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(true);
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const monitorRef = useRef<SimulatedSystemMonitoringState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getSystemMonitoringScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedSystemMonitoringState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    monitorRef.current = null;
    setStateReady(!exercise.requireState);
  }

  function resetExerciseInteraction() {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    resetTerminal();
  }

  function goToExercise(nextIndex: number) {
    const next = EXERCISES[nextIndex]!;
    setExerciseIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    setRanRelevant(false);
    monitorRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: System Monitoring
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Read CPU capacity,
          memory availability, load averages, process consumers, swap pressure,
          and disk space — then choose diagnostics before taking action.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {EXERCISES.map((item, index) => {
            const done = completed.has(item.id);
            const active = index === exerciseIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToExercise(index)}
                  className={cn(
                    "text-left transition-colors",
                    active && "text-foreground font-medium",
                    done && !active && "text-muted-foreground line-through",
                    !done &&
                      !active &&
                      "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                  {done ? " ✓" : null}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            {exercise.title}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Scenario:</strong>{" "}
            {scenario.label}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Symptom:</strong>{" "}
            {scenario.symptom}
          </p>
          <p className="text-sm">{exercise.task}</p>
          <p className="text-muted-foreground text-sm">
            Useful commands:{" "}
            {exercise.relevantCommands.map((command, index) => (
              <span key={command}>
                {index > 0 ? ", " : null}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {command}
                </code>
              </span>
            ))}
          </p>
        </div>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Monitoring troubleshooting checklist
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            1. Identify the symptom and its scope{"\n"}
            2. Check uptime and load averages{"\n"}
            3. Inspect CPU and process usage{"\n"}
            4. Inspect available memory and swap{"\n"}
            5. Check disk space when storage issues are suspected{"\n"}
            6. Compare the evidence before taking action{"\n"}
            7. Recheck metrics after a simulated corrective action
          </pre>
        </div>

        <Callout title="Simulation safety">
          <p>
            This lab never reads your real process table, CPU counters, memory
            statistics, or disks. All snapshots stay in memory for learning.
          </p>
        </Callout>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            top
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            free
          </code>
          , or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            vmstat
          </code>{" "}
          on your machine.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetTerminal}>
          Reset scenario
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowHint((value) => !value)}
        >
          {showHint ? "Hide hint" : "Show hint"}
        </Button>
      </div>

      {showHint ? (
        <Callout title="Hint">
          <p>{exercise.hint}</p>
        </Callout>
      ) : null}

      <TerminalSimulator
        key={`${exercise.id}-${terminalKey}`}
        systemMonitoring={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Monitoring commands"
        onSystemMonitoringChange={(state) => {
          monitorRef.current = state;
          syncStateReady(state);
        }}
        onCommandRun={(command) => {
          if (commandMatchesHint(command, exercise.relevantCommands)) {
            setRanRelevant(true);
          }
        }}
      />

      <div className="space-y-3">
        <p className="text-foreground font-medium">
          What is the best conclusion?
        </p>
        <ul className="space-y-2">
          {exercise.options.map((option) => {
            const isSelected = selected === option.key;
            const showResult = submitted && isSelected;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  disabled={submitted && completed.has(exercise.id)}
                  onClick={() => {
                    if (submitted && completed.has(exercise.id)) {
                      return;
                    }
                    setSelected(option.key);
                    setSubmitted(false);
                  }}
                  className={cn(
                    "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    isSelected &&
                      !submitted &&
                      "border-primary/50 bg-primary/5",
                    showResult &&
                      isCorrect &&
                      stateReady &&
                      "border-green-600/40 bg-green-500/10",
                    showResult &&
                      (!isCorrect || !stateReady) &&
                      "border-destructive/40 bg-destructive/10",
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
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) {
              return;
            }
            setSubmitted(true);
            const stateOk =
              !exercise.requireState ||
              (monitorRef.current
                ? exercise.requireState(monitorRef.current)
                : false);
            if (selected === exercise.correct && stateOk) {
              setCompleted((prev) => new Set(prev).add(exercise.id));
            }
          }}
        >
          Check answer
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetExerciseInteraction}
        >
          Retry exercise
        </Button>
        {exerciseIndex < EXERCISES.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            disabled={!completed.has(exercise.id)}
            onClick={() => goToExercise(exerciseIndex + 1)}
          >
            Next exercise
          </Button>
        ) : null}
      </div>

      {submitted && selected ? (
        <Callout
          title={
            isCorrect && (!exercise.requireState || stateReady)
              ? "Correct"
              : "Not quite"
          }
        >
          <p>
            {isCorrect && (!exercise.requireState || stateReady)
              ? exercise.feedbackCorrect
              : isCorrect && exercise.requireState && !stateReady
                ? (exercise.stateHint ?? exercise.feedbackIncorrect)
                : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="mt-2">
              Tip: run at least one relevant monitoring command so your
              conclusion is based on simulated evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You counted CPUs, read available memory, identified top CPU and
            memory consumers, interpreted load vs capacity, recognized swap
            pressure, separated disk exhaustion from RAM issues, and chose
            diagnosis before action.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
