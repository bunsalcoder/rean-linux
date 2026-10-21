"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizQuestion = {
  id: string;
  prompt: string;
  options: readonly { key: string; label: string }[];
  correct: string;
};

const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Is high CPU utilization automatically a problem?",
    options: [
      {
        key: "A",
        label:
          "No — busy CPUs can be expected; judge duration, impact, and which processes are responsible",
      },
      {
        key: "B",
        label: "Yes — any CPU above 10% requires an immediate reboot",
      },
      {
        key: "C",
        label: "Yes — high CPU always means the disk is full",
      },
      {
        key: "D",
        label: "CPU utilization cannot be measured on Linux",
      },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt:
      "When reading `free` output, which memory figure should you prefer for “how much RAM can still be used”?",
    options: [
      {
        key: "A",
        label: "available (accounts for reclaimable cache/buffers)",
      },
      {
        key: "B",
        label: "Treat every byte listed as used as permanently unavailable",
      },
      {
        key: "C",
        label: "Only look at swap free and ignore Mem",
      },
      {
        key: "D",
        label: "The hostname line from `uptime`",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "What do load averages primarily reflect?",
    options: [
      {
        key: "A",
        label:
          "Runnable (and uninterruptible) demand over 1/5/15 minutes — interpret relative to CPU count",
      },
      {
        key: "B",
        label: "Exact free disk space on `/`",
      },
      {
        key: "C",
        label: "The number of logged-in GUI users only",
      },
      {
        key: "D",
        label: "Whether SSH keys are installed",
      },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt:
      "Which pair of tools is most useful to find who uses CPU and memory?",
    options: [
      {
        key: "A",
        label: "`top` and `ps` (for example `ps aux`)",
      },
      {
        key: "B",
        label: "`chmod` and `chown` alone",
      },
      {
        key: "C",
        label: "`passwd` and `useradd`",
      },
      {
        key: "D",
        label: "`mkdir` and `touch`",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt:
      "Elevated swap usage with very low available memory usually suggests:",
    options: [
      {
        key: "A",
        label:
          "Memory pressure — the system is reclaiming and may be thrashing",
      },
      {
        key: "B",
        label: "That disks cannot store files anymore",
      },
      {
        key: "C",
        label: "That load averages are meaningless",
      },
      {
        key: "D",
        label: "That `nproc` returned zero",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "How do you distinguish a full disk from memory pressure?",
    options: [
      {
        key: "A",
        label:
          "Compare `df -h` (storage capacity) with `free -h` (RAM/swap) — they measure different resources",
      },
      {
        key: "B",
        label: "`free -h` alone always reports disk Use%",
      },
      {
        key: "C",
        label: "Disk and memory are the same pool on Linux",
      },
      {
        key: "D",
        label: "Only `hostname` can tell them apart",
      },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "What is a solid first response when a host feels slow?",
    options: [
      {
        key: "A",
        label:
          "Gather evidence (uptime/load, CPU/processes, memory/swap, disk if needed) before killing processes or changing config",
      },
      {
        key: "B",
        label: "Kill PID 1 immediately",
      },
      {
        key: "C",
        label: "Disable all networking without checking metrics",
      },
      {
        key: "D",
        label: "Assume the problem is DNS and stop investigating",
      },
    ],
    correct: "A",
  },
  {
    id: "q8",
    prompt: "What does `vmstat 1 5` represent in this learning lab?",
    options: [
      {
        key: "A",
        label:
          "A predefined simulated multi-sample summary returned immediately — not a real one-second timer on your host",
      },
      {
        key: "B",
        label: "A live five-second wait against your real kernel",
      },
      {
        key: "C",
        label: "A command that formats disks",
      },
      {
        key: "D",
        label: "A replacement for `useradd`",
      },
    ],
    correct: "A",
  },
] as const;

function renderOptionLabel(label: string) {
  const parts = label.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function SystemMonitoringQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);
  const score = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Knowledge Check
        </h3>
        <p className="text-muted-foreground text-sm">
          Choose the best answer for each question. Your selections stay on this
          page only — nothing is saved.
        </p>
      </div>

      <ol className="space-y-6">
        {QUESTIONS.map((question, index) => {
          const selected = answers[question.id];
          const isCorrect = selected === question.correct;

          return (
            <li key={question.id} className="space-y-3">
              <p className="text-foreground font-medium">
                Question {index + 1}. {renderOptionLabel(question.prompt)}
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
                        <span className="text-muted-foreground font-mono text-xs font-medium">
                          {option.key}.
                        </span>
                        <span>{renderOptionLabel(option.label)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {submitted && !isCorrect ? (
                <p className="text-muted-foreground text-sm">
                  Correct answer:{" "}
                  <span className="text-foreground font-medium">
                    {question.correct}
                  </span>
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
              ? "Perfect score"
              : `Score: ${score} / ${QUESTIONS.length}`
          }
        >
          <p>
            {score === QUESTIONS.length
              ? "You understand CPU context, available memory, load averages, process inspection, swap pressure, disk vs RAM, and diagnose-before-act workflows."
              : "Review CPU interpretation, available memory, load vs CPUs, top/ps, swap, df vs free, and careful troubleshooting — then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
