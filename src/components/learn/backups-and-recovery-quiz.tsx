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
    prompt:
      "Which statement best describes full, incremental, and differential backups?",
    options: [
      {
        key: "A",
        label:
          "Full copies everything selected; incremental captures changes since the last backup; differential captures changes since the last full backup",
      },
      {
        key: "B",
        label: "All three are identical and only rename the output file",
      },
      {
        key: "C",
        label: "Incremental backups always delete the previous full backup",
      },
      {
        key: "D",
        label: "Differential backups only protect the operating system kernel",
      },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "Why is an archive not automatically a reliable backup?",
    options: [
      {
        key: "A",
        label:
          "Backup quality depends on recoverability, verification, and appropriate storage — a tar file alone may be incomplete, untested, or on the same failing disk",
      },
      {
        key: "B",
        label: "Archives always include verified off-site copies by default",
      },
      {
        key: "C",
        label: "Any file ending in .tar is guaranteed restorable forever",
      },
      {
        key: "D",
        label: "gzip compression proves the backup was tested",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "What does `tar -tvf backup.tar` help you do?",
    options: [
      {
        key: "A",
        label:
          "Inspect archive contents and confirm the archive is readable before restoring",
      },
      {
        key: "B",
        label: "Format the /backups filesystem",
      },
      {
        key: "C",
        label: "Increase free disk space automatically",
      },
      {
        key: "D",
        label: "Disable access control on restored files",
      },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt: "What should you do if a simulated archive fails verification?",
    options: [
      {
        key: "A",
        label:
          "Treat it as invalid — do not silently restore from a damaged or incomplete archive",
      },
      {
        key: "B",
        label: "Extract it anyway and assume missing files are fine",
      },
      {
        key: "C",
        label: "Rename it to .tar.gz so it becomes valid",
      },
      {
        key: "D",
        label: "Ignore the error if the filename looks official",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt: "RTO and RPO measure which ideas?",
    options: [
      {
        key: "A",
        label:
          "RTO is how quickly you need to recover; RPO is how much data loss (in time) you can tolerate",
      },
      {
        key: "B",
        label: "RTO is disk size; RPO is CPU count",
      },
      {
        key: "C",
        label: "Both only describe firewall rule order",
      },
      {
        key: "D",
        label: "They replace the need for any backup testing",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Why test restores instead of assuming backups work?",
    options: [
      {
        key: "A",
        label:
          "Untested backups can fail when you need them — restore drills prove recoverability",
      },
      {
        key: "B",
        label: "Testing restores always deletes production data automatically",
      },
      {
        key: "C",
        label: "Verification is only needed for monitoring lessons",
      },
      {
        key: "D",
        label: "Archives never become damaged or incomplete",
      },
    ],
    correct: "A",
  },
  {
    id: "q7",
    prompt: "Which practice improves backup security?",
    options: [
      {
        key: "A",
        label:
          "Restrict access to backup files and keep a separate copy away from the primary system",
      },
      {
        key: "B",
        label: "World-writable backups on the same nearly-full disk only",
      },
      {
        key: "C",
        label:
          "Store the only copy next to the data it protects with open permissions",
      },
      {
        key: "D",
        label: "Disable verification so restores are faster",
      },
    ],
    correct: "A",
  },
  {
    id: "q8",
    prompt:
      "Before replacing an existing file from a backup, what is a safer first step?",
    options: [
      {
        key: "A",
        label:
          "Restore into a separate test directory, inspect contents, then restore in place if correct",
      },
      {
        key: "B",
        label: "Overwrite immediately without listing the archive",
      },
      {
        key: "C",
        label: "Delete all backups first to free space",
      },
      {
        key: "D",
        label: "Skip verification because the path looks right",
      },
    ],
    correct: "A",
  },
] as const;

const RECOVERY_CHECKLIST = [
  "Identify the data that needs recovery",
  "Select a suitable verified backup",
  "Inspect the archive contents",
  "Choose a safe restore destination",
  "Restore the required data",
  "Verify restored files and content",
  "Document the result and review the backup process",
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

export function BackupsAndRecoveryQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);
  const score = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;

  function toggleChecklist(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="space-y-8">
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
              ? "You understand backup types, archives vs backups, verification, restore safety, RTO/RPO, security, and recovery testing."
              : "Review backup types, why archives need verification, RTO/RPO, separate copies, and tested restores — then try again."}
          </p>
        </Callout>
      ) : null}

      <div className="border-border space-y-3 rounded-lg border p-4 sm:p-5">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Recovery checklist
        </h3>
        <p className="text-muted-foreground text-sm">
          Use this reusable checklist whenever you practice a restore. Mark
          items locally — important data should not rely on a single untested
          copy.
        </p>
        <ul className="space-y-2">
          {RECOVERY_CHECKLIST.map((item, index) => {
            const checked = checkedItems.has(index);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => toggleChecklist(index)}
                  className={cn(
                    "border-border hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    checked && "border-primary/40 bg-primary/5",
                  )}
                >
                  <span className="font-mono text-xs">
                    {checked ? "[x]" : "[ ]"}
                  </span>
                  <span>
                    {index + 1}. {item}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <Callout title="Remember">
          <p>
            Restoration should be tested. Keep access controls on backup files
            and maintain a separate copy so one failure does not erase your only
            recovery path.
          </p>
        </Callout>
      </div>
    </div>
  );
}
