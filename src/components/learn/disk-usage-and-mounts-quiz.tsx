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
    prompt: "Which command shows filesystem capacity and free space?",
    options: [
      { key: "A", label: "`du`" },
      { key: "B", label: "`df -h`" },
      { key: "C", label: "`ps`" },
      { key: "D", label: "`lsblk -p`" },
    ],
    correct: "B",
  },
  {
    id: "q2",
    prompt: "Which command helps determine how much space a directory uses?",
    options: [
      { key: "A", label: "`du`" },
      { key: "B", label: "`systemctl`" },
      { key: "C", label: "`journalctl`" },
      { key: "D", label: "`ip`" },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "What does mounting do?",
    options: [
      { key: "A", label: "Deletes a filesystem" },
      {
        key: "B",
        label: "Makes a filesystem accessible through a directory",
      },
      { key: "C", label: "Formats a disk" },
      { key: "D", label: "Creates a partition" },
    ],
    correct: "B",
  },
  {
    id: "q4",
    prompt: "What does this command conceptually do? `sudo umount /data`",
    options: [
      { key: "A", label: "Deletes `/data`" },
      { key: "B", label: "Deletes the filesystem" },
      { key: "C", label: "Unmounts the filesystem from `/data`" },
      { key: "D", label: "Formats `/data`" },
    ],
    correct: "C",
  },
  {
    id: "q5",
    prompt: "What is the main difference between `df` and `du`?",
    options: [
      {
        key: "A",
        label:
          "`df` shows filesystem-level usage, while `du` examines file/directory usage",
      },
      { key: "B", label: "They are identical" },
      { key: "C", label: "`du` manages disks" },
      { key: "D", label: "`df` creates partitions" },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt:
      "Which command is useful for viewing mounted filesystems in a structured way?",
    options: [
      { key: "A", label: "`findmnt`" },
      { key: "B", label: "`passwd`" },
      { key: "C", label: "`chmod`" },
      { key: "D", label: "`kill`" },
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

export function DiskUsageAndMountsQuiz() {
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
              ? "You know the difference between df and du, what mounting does, and how findmnt helps inspect mounts."
              : "Review the Two Different Storage Questions, Mounting, and Unmounting sections, then try again."}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
