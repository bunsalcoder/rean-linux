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
    prompt: "In a standard five-field cron expression, what is the correct order?",
    options: [
      {
        key: "A",
        label: "minute, hour, day of month, month, day of week",
      },
      {
        key: "B",
        label: "hour, minute, day of week, month, day of month",
      },
      { key: "C", label: "second, minute, hour, day, year" },
      { key: "D", label: "day, month, year, hour, minute" },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "What does `0 0 * * *` mean?",
    options: [
      { key: "A", label: "Every day at midnight" },
      { key: "B", label: "Every minute" },
      { key: "C", label: "Every Monday at 00:00 only" },
      { key: "D", label: "Once, immediately" },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "What does `crontab -l` show?",
    options: [
      {
        key: "A",
        label: "The current user's scheduled crontab entries",
      },
      { key: "B", label: "All system services managed by systemd" },
      { key: "C", label: "The contents of /var/log/syslog only" },
      { key: "D", label: "One-time at jobs exclusively" },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt: "If the cron service is stopped, what happens to crontab entries?",
    options: [
      {
        key: "A",
        label:
          "Entries can still exist, but they will not execute until cron is running",
      },
      {
        key: "B",
        label: "All crontab entries are deleted automatically",
      },
      {
        key: "C",
        label: "Jobs keep running without the service",
      },
      {
        key: "D",
        label: "Only at jobs continue; cron jobs become at jobs",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt:
      "Why might a script that works in an interactive shell fail under cron?",
    options: [
      {
        key: "A",
        label:
          "Cron jobs often run with a minimal environment (PATH and variables differ)",
      },
      {
        key: "B",
        label: "Cron cannot run shell scripts at all",
      },
      {
        key: "C",
        label: "Cron ignores exit codes completely",
      },
      {
        key: "D",
        label: "Cron only runs as root and refuses user scripts",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Which tool helps inspect failed scheduled executions?",
    options: [
      {
        key: "A",
        label: "`journalctl -u cron` (or similar service logs) and exit status",
      },
      { key: "B", label: "`ls` alone is enough to diagnose cron failures" },
      { key: "C", label: "`chmod +x` always fixes every failed cron job" },
      { key: "D", label: "`atq` replaces cron logging" },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "What is `at` typically used for?",
    options: [
      {
        key: "A",
        label: "Scheduling a one-time job to run once at a future time",
      },
      {
        key: "B",
        label: "Replacing every recurring cron schedule permanently",
      },
      {
        key: "C",
        label: "Editing the five cron fields interactively",
      },
      {
        key: "D",
        label: "Starting the cron service",
      },
    ],
    correct: "A",
  },
  {
    id: "q8",
    prompt: "What does `*/15 * * * *` mean?",
    options: [
      { key: "A", label: "Every 15 minutes" },
      { key: "B", label: "At 15:00 every day" },
      { key: "C", label: "On the 15th of each month only" },
      { key: "D", label: "Every 15 hours" },
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

export function ScheduledTasksQuiz() {
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
              ? "You understand cron field order, common expressions, user crontabs, the cron service, job environments, logs, and one-time scheduling with at."
              : "Review cron field order, common schedules, crontab management, the cron service, environments, logs, and at — then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
