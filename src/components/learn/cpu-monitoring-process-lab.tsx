"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  createInitialCpuState,
  type SimulatedCpuProcess,
  type SimulatedCpuState,
} from "@/lib/simulate-cpu-monitoring";
import { cn } from "@/lib/utils";

const PROCESS_SUGGESTIONS = [
  { command: "ps aux --sort=-%cpu", label: "ps aux --sort=-%cpu" },
  { command: "top", label: "top" },
  { command: "renice 10 -p 2388", label: "renice java" },
  { command: "renice 5 -p 3100", label: "renice backup" },
  { command: "help", label: "help" },
] as const;

type CompareQuestion = {
  id: string;
  prompt: string;
  options: readonly { key: string; label: string }[];
  correct: string;
  explanation: string;
};

const QUESTIONS: readonly CompareQuestion[] = [
  {
    id: "hottest",
    prompt:
      "Under the High CPU Usage condition, which process is most CPU-intensive?",
    options: [
      { key: "A", label: "nginx" },
      { key: "B", label: "node" },
      { key: "C", label: "redis" },
      { key: "D", label: "sshd" },
    ],
    correct: "B",
    explanation:
      "`node` leads %CPU in the high-CPU snapshot. Compare sorted process lists before changing priorities.",
  },
  {
    id: "state-d",
    prompt:
      "In the High I/O Wait condition, what does process state D usually indicate?",
    options: [
      {
        key: "A",
        label: "Uninterruptible sleep — often waiting on disk I/O",
      },
      { key: "B", label: "The process is guaranteed finished forever" },
      { key: "C", label: "The process has 0% CPU by definition" },
      { key: "D", label: "The process is only a kernel thread name" },
    ],
    correct: "A",
    explanation:
      "State D commonly appears for tasks blocked in uninterruptible I/O waits — pair it with %wa and storage metrics.",
  },
  {
    id: "nice",
    prompt: "You renice `backup-worker` to a higher nice value. What is true?",
    options: [
      {
        key: "A",
        label:
          "Priority preference changes, but that alone may not fix the underlying performance problem",
      },
      {
        key: "B",
        label: "Renice always eliminates I/O wait immediately",
      },
      {
        key: "C",
        label: "Nice values replace the need to inspect %us/%wa/%st",
      },
      {
        key: "D",
        label: "Renice deletes the process automatically",
      },
    ],
    correct: "A",
    explanation:
      "nice/renice adjust scheduling preference. They do not automatically remove bottlenecks, fix storage saturation, or replace diagnosis.",
  },
];

function ProcessRows({
  processes,
}: {
  processes: readonly SimulatedCpuProcess[];
}) {
  const sorted = [...processes].sort((a, b) => b.cpu - a.cpu);
  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
          <tr>
            <th className="px-3 py-2 font-medium">PID</th>
            <th className="px-3 py-2 font-medium">Command</th>
            <th className="px-3 py-2 font-medium">%CPU</th>
            <th className="px-3 py-2 font-medium">%MEM</th>
            <th className="px-3 py-2 font-medium">State</th>
            <th className="px-3 py-2 font-medium">Nice</th>
            <th className="px-3 py-2 font-medium">Priority</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((process) => (
            <tr key={process.pid} className="border-border border-t">
              <td className="px-3 py-2 font-mono text-xs">{process.pid}</td>
              <td className="px-3 py-2 font-mono text-xs">{process.command}</td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {process.cpu.toFixed(1)}
              </td>
              <td className="px-3 py-2 font-mono text-xs tabular-nums">
                {process.mem.toFixed(1)}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{process.state}</td>
              <td className="px-3 py-2 font-mono text-xs">{process.nice}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {process.priority}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CpuMonitoringProcessLab() {
  const [view, setView] = useState<"high-cpu" | "io-wait">("high-cpu");
  const [state, setState] = useState<SimulatedCpuState>(() =>
    createInitialCpuState("high-cpu"),
  );
  const [terminalKey, setTerminalKey] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((question) => answers[question.id]);
  const score = QUESTIONS.filter(
    (question) => answers[question.id] === question.correct,
  ).length;

  function switchView(next: "high-cpu" | "io-wait") {
    setView(next);
    setState(createInitialCpuState(next));
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          CPU process analysis
        </h3>
        <p className="text-muted-foreground text-sm">
          Inspect fictional processes (`nginx`, `postgres`, `node`, `java`,
          `redis`, `backup-worker`), compare CPU use and states, and try
          simulated `renice`. Priority changes stay in memory only.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={view === "high-cpu" ? "default" : "outline"}
          onClick={() => switchView("high-cpu")}
        >
          High CPU snapshot
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "io-wait" ? "default" : "outline"}
          onClick={() => switchView("io-wait")}
        >
          High I/O wait snapshot
        </Button>
      </div>

      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4 text-sm">
        <p className="text-foreground font-medium">
          {view === "high-cpu"
            ? "High CPU Usage — compute-heavy processes"
            : "High I/O Wait — blocked backup/database work"}
        </p>
        <p className="text-muted-foreground">{state.interpretation}</p>
        <p className="text-muted-foreground text-xs">
          Conceptual note: <span className="font-mono">nice</span> /
          <span className="font-mono"> renice</span> adjust scheduling
          preference. Lower nice = higher priority. Changing priority does not
          automatically solve the underlying performance problem.
        </p>
      </div>

      <ProcessRows processes={state.processes} />

      <TerminalSimulator
        key={`${view}-${terminalKey}`}
        cpuMonitoring={view}
        suggestions={PROCESS_SUGGESTIONS}
        suggestionsLabel="Process commands"
        onCpuMonitoringChange={setState}
      />

      <div className="space-y-4">
        <p className="text-foreground font-medium">Quick process checks</p>
        <ol className="space-y-4">
          {QUESTIONS.map((question, index) => {
            const selected = answers[question.id];
            const isCorrect = selected === question.correct;
            return (
              <li key={question.id} className="space-y-2">
                <p className="text-sm">
                  {index + 1}. {question.prompt}
                </p>
                <ul className="space-y-2">
                  {question.options.map((option) => {
                    const isSelected = selected === option.key;
                    const showResult = submitted && isSelected;
                    return (
                      <li key={option.key}>
                        <button
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: option.key,
                            }))
                          }
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
                          <span className="text-muted-foreground font-mono text-xs">
                            {option.key}.
                          </span>
                          <span>{option.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {submitted ? (
                  <p className="text-muted-foreground text-sm">
                    {question.explanation}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-2">
          {!submitted ? (
            <Button
              type="button"
              disabled={!allAnswered}
              onClick={() => setSubmitted(true)}
            >
              Check answers
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Try again
            </Button>
          )}
        </div>

        {submitted ? (
          <Callout
            title={
              score === QUESTIONS.length
                ? "Process analysis complete"
                : `Score: ${score} / ${QUESTIONS.length}`
            }
          >
            <p>
              Use sorted process lists, states (R/S/D), and nice values as
              evidence — then diagnose before relying on priority tweaks.
            </p>
          </Callout>
        ) : null}
      </div>
    </div>
  );
}
