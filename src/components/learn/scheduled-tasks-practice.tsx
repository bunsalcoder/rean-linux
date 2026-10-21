"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  findFailingJobIds,
  getScheduledTasksScenario,
  hasCronSchedule,
  type ScheduledTasksScenarioId,
  type SimulatedScheduledTasksState,
} from "@/lib/simulate-scheduled-tasks";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: ScheduledTasksScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedScheduledTasksState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    if (target.startsWith("crontab-add")) {
      return normalized.startsWith("crontab-add");
    }
    if (target.startsWith("journalctl")) {
      return normalized.startsWith("journalctl");
    }
    if (target.startsWith("systemctl")) {
      return normalized.startsWith("systemctl");
    }
    if (target === "atq" || target === "at -l") {
      return normalized === "atq" || normalized === "at -l";
    }
    return normalized === target;
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "list-crontab",
    title: "Exercise 1 — List Scheduled Tasks",
    scenarioId: "list-crontab",
    task: "List the current user's crontab and identify what is already scheduled.",
    hint: "Run `crontab -l`. Look for the schedule fields and the commands they run.",
    relevantCommands: ["crontab -l"],
    options: [
      {
        key: "A",
        label:
          "A nightly backup at 02:00 and a Monday 09:00 report are already scheduled",
      },
      {
        key: "B",
        label: "The crontab is empty for this user",
      },
      {
        key: "C",
        label: "Only one-time at jobs exist — no cron entries",
      },
      {
        key: "D",
        label: "Cron schedules only system-wide root jobs here",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. `crontab -l` shows the current user's recurring jobs — here a 02:00 backup and a Monday morning report.",
    feedbackIncorrect:
      "Run `crontab -l` and read both the schedule fields and the command paths.",
  },
  {
    id: "read-expression",
    title: "Exercise 2 — When Does This Expression Run?",
    scenarioId: "healthy",
    task: "Interpret `0 9 * * 1`. When does that schedule fire?",
    hint: "Field order is minute, hour, day-of-month, month, day-of-week. Day-of-week 1 is Monday in this lab.",
    relevantCommands: ["crontab -l", "help"],
    options: [
      { key: "A", label: "Every Monday at 09:00" },
      { key: "B", label: "Every day at 09:01" },
      { key: "C", label: "Every 9 minutes on Mondays" },
      { key: "D", label: "Once on January 9" },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Minute 0, hour 9, any day/month, day-of-week 1 → every Monday at 09:00.",
    feedbackIncorrect:
      "Re-check the five fields: `0 9 * * 1` means minute 0, hour 9, Monday.",
  },
  {
    id: "build-daily",
    title: "Exercise 3 — Construct a Daily Task",
    scenarioId: "build-daily",
    task: "Add a job that runs every day at midnight. Use the simulated crontab helpers, then verify with `crontab -l`.",
    hint: 'Try `crontab-add "0 0 * * * /usr/local/bin/daily-task.sh"` then `crontab -l`.',
    relevantCommands: [
      'crontab-add "0 0 * * * /usr/local/bin/daily-task.sh"',
      "crontab -l",
      "crontab -e",
    ],
    options: [
      {
        key: "A",
        label: "`0 0 * * *` runs once per day at midnight",
      },
      {
        key: "B",
        label: "`* * * * *` is the only valid daily schedule",
      },
      {
        key: "C",
        label: "Daily jobs require `at` instead of cron",
      },
      {
        key: "D",
        label: "`0 9 * * 1` runs every day at midnight",
      },
    ],
    correct: "A",
    requireState: (state) => hasCronSchedule(state, "0 0 * * *"),
    stateHint:
      'Add a midnight schedule with crontab-add "0 0 * * * …" and confirm with crontab -l before answering.',
    feedbackCorrect:
      "Correct. `0 0 * * *` is the classic daily-at-midnight pattern.",
    feedbackIncorrect:
      "Add `0 0 * * *` to the crontab with crontab-add, then re-check.",
  },
  {
    id: "build-every-15",
    title: "Exercise 4 — Every 15 Minutes",
    scenarioId: "build-every-15",
    task: "Add a job that runs every 15 minutes, then confirm it appears in the crontab.",
    hint: 'Use a step value: `crontab-add "*/15 * * * * /usr/local/bin/health-check.sh"`.',
    relevantCommands: [
      'crontab-add "*/15 * * * * /usr/local/bin/health-check.sh"',
      "crontab -l",
    ],
    options: [
      {
        key: "A",
        label: "`*/15 * * * *` runs every 15 minutes",
      },
      {
        key: "B",
        label: "`15 * * * *` runs every 15 minutes",
      },
      {
        key: "C",
        label: "`* */15 * * *` runs every 15 minutes",
      },
      {
        key: "D",
        label: "Step values are not valid in cron",
      },
    ],
    correct: "A",
    requireState: (state) => hasCronSchedule(state, "*/15 * * * *"),
    stateHint:
      "Add `*/15 * * * *` with crontab-add and verify with crontab -l before answering.",
    feedbackCorrect:
      "Correct. `*/15` in the minute field means every 15 minutes.",
    feedbackIncorrect:
      "Add the `*/15 * * * *` schedule, then select the matching interpretation.",
  },
  {
    id: "cron-stopped",
    title: "Exercise 5 — Why Aren't Jobs Running?",
    scenarioId: "cron-stopped",
    task: "Jobs exist in the crontab, but nothing runs. Diagnose the service.",
    hint: "Compare `crontab -l` with `systemctl status cron`. Entries can exist while the service is inactive.",
    relevantCommands: [
      "crontab -l",
      "systemctl status cron",
      "journalctl -u cron -n 10",
    ],
    options: [
      {
        key: "A",
        label:
          "The cron service is stopped — entries remain but will not execute",
      },
      {
        key: "B",
        label: "The crontab is empty so nothing can run",
      },
      {
        key: "C",
        label: "All expressions are invalid",
      },
      {
        key: "D",
        label: "atq has replaced cron permanently",
      },
    ],
    correct: "A",
    requireState: (state) => !state.cronActive && state.crontab.length > 0,
    stateHint:
      "Confirm crontab entries exist and that systemctl status cron reports inactive.",
    feedbackCorrect:
      "Correct. A stopped cron/crond service leaves crontab entries in place but prevents execution.",
    feedbackIncorrect:
      "Check `systemctl status cron` and confirm the crontab still lists jobs.",
  },
  {
    id: "failing-job",
    title: "Exercise 6 — Identify a Repeated Failure",
    scenarioId: "failing-job",
    task: "Inspect execution history and identify which job keeps failing.",
    hint: "Use `journalctl -u cron -n 10` and look for non-zero exit codes repeating for the same command.",
    relevantCommands: [
      "journalctl -u cron -n 10",
      "journalctl -u cron",
      "crontab -l",
    ],
    options: [
      {
        key: "A",
        label:
          "`/usr/local/bin/cleanup.sh` repeatedly exits non-zero (permission denied)",
      },
      {
        key: "B",
        label: "The backup job is the only failure in history",
      },
      {
        key: "C",
        label: "No failures appear in the simulated logs",
      },
      {
        key: "D",
        label: "All jobs succeed with exit 0",
      },
    ],
    correct: "A",
    requireState: (state) => findFailingJobIds(state).includes("cleanup"),
    stateHint:
      "Inspect journalctl output — cleanup.sh should show repeated FAILED exit=1 lines.",
    feedbackCorrect:
      "Correct. The cleanup job fails repeatedly with exit 1 while backup still succeeds.",
    feedbackIncorrect:
      "Read the journal lines carefully for FAILED exit codes and the command path.",
  },
  {
    id: "env-trap",
    title: "Exercise 7 — Interactive Environment Trap",
    scenarioId: "env-trap",
    task: "A helper script works interactively but fails under cron. Why?",
    hint: "Check the crontab command and journal output. Cron often has a minimal PATH and does not load your interactive shell profile.",
    relevantCommands: [
      "crontab -l",
      "journalctl -u cron -n 10",
      "journalctl -u cron",
    ],
    options: [
      {
        key: "A",
        label:
          "The job assumes an interactive PATH / environment that cron does not provide",
      },
      {
        key: "B",
        label: "Cron cannot run shell scripts under any circumstances",
      },
      {
        key: "C",
        label: "The cron service must be stopped for scripts to work",
      },
      {
        key: "D",
        label: "Exit status 127 always means a permissions problem only",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Cron jobs typically get a minimal environment. Prefer absolute paths and explicit variables.",
    feedbackIncorrect:
      "Compare the crontab command with the journal failures (`not found` / exit 127).",
  },
  {
    id: "at-queue",
    title: "Exercise 8 — Inspect the One-Time Queue",
    scenarioId: "at-queue",
    task: "Inspect the simulated one-time job queue and identify what is waiting.",
    hint: "Run `atq` or `at -l`. These list pending one-time jobs, not recurring crontab entries.",
    relevantCommands: ["atq", "at -l"],
    options: [
      {
        key: "A",
        label:
          "Two one-time at jobs are queued (reboot notice and one-shot report)",
      },
      {
        key: "B",
        label: "The at queue is empty",
      },
      {
        key: "C",
        label: "atq shows the same output as crontab -l",
      },
      {
        key: "D",
        label: "Only root can have at jobs in this simulator",
      },
    ],
    correct: "A",
    requireState: (state) => state.atJobs.length === 2,
    stateHint: "Run atq and confirm two pending jobs are listed.",
    feedbackCorrect:
      "Correct. `atq` / `at -l` list one-time jobs waiting to run once — separate from recurring cron entries.",
    feedbackIncorrect:
      "Run `atq` (or `at -l`) and count the pending queue IDs.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "crontab -l", label: "crontab -l" },
  { command: "crontab -e", label: "crontab -e" },
  {
    command: 'crontab-add "0 0 * * * /usr/local/bin/daily-task.sh"',
    label: "add daily",
  },
  {
    command: 'crontab-add "*/15 * * * * /usr/local/bin/health-check.sh"',
    label: "add every 15m",
  },
  { command: "systemctl status cron", label: "status cron" },
  { command: "systemctl start cron", label: "start cron" },
  { command: "journalctl -u cron -n 10", label: "journalctl" },
  { command: "atq", label: "atq" },
  { command: "help", label: "help" },
] as const;

export function ScheduledTasksPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(
    () => !EXERCISES[0]?.requireState,
  );
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const scheduledRef = useRef<SimulatedScheduledTasksState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getScheduledTasksScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedScheduledTasksState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    scheduledRef.current = null;
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
    scheduledRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Scheduled Tasks
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> List crontabs, read
          and build expressions, diagnose a stopped cron service, spot failing
          jobs, understand environment traps, and inspect one-time{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            at
          </code>{" "}
          jobs — entirely in the simulator.
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
            Scheduled-task troubleshooting checklist
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            1. Confirm the scheduled entry exists (`crontab -l`){"\n"}
            2. Validate the cron expression{"\n"}
            3. Check whether the cron service is active{"\n"}
            4. Inspect execution logs and exit status{"\n"}
            5. Verify paths, permissions, and environment assumptions{"\n"}
            6. Check the system timezone and expected execution time{"\n"}
            7. Re-test using a safe simulated example
          </pre>
        </div>

        <Callout title="Simulation safety">
          <p>
            This lab never creates real cron jobs, never starts host timers, and
            never executes shell scripts on your machine. All state stays in
            memory.
          </p>
        </Callout>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            crontab
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cron
          </code>
          , or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            at
          </code>
          .
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
        scheduledTasks={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Scheduling commands"
        onScheduledTasksChange={(state) => {
          scheduledRef.current = state;
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
              (scheduledRef.current
                ? exercise.requireState(scheduledRef.current)
                : false);
            setStateReady(stateOk);
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
              Tip: run at least one relevant scheduling or diagnostic command so
              your conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You listed crontabs, interpreted schedules, built daily and
            every-15-minute jobs, diagnosed a stopped cron service, spotted
            repeated failures, reasoned about cron environments, and inspected
            one-time at jobs.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
