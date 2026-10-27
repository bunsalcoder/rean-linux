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

const MID_LESSON_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "m1",
    prompt: "Authentication vs authorization — which pairing is correct?",
    options: [
      {
        key: "A",
        label:
          "Authentication proves identity; authorization decides what that identity may do",
      },
      {
        key: "B",
        label:
          "Authorization proves identity; authentication grants file modes",
      },
      {
        key: "C",
        label: "They are interchangeable terms for the same control",
      },
      {
        key: "D",
        label:
          "Only root needs authentication; everyone else needs authorization",
      },
    ],
    correct: "A",
  },
  {
    id: "m2",
    prompt:
      "Why should a low UID system account not be treated as automatically suspicious?",
    options: [
      {
        key: "A",
        label:
          "Many system accounts exist for services and daemons; review purpose and shell/groups before assuming compromise",
      },
      {
        key: "B",
        label: "Any UID below 1000 always means the host is compromised",
      },
      {
        key: "C",
        label: "System accounts never appear in getent passwd on healthy hosts",
      },
      {
        key: "D",
        label:
          "System accounts should all be deleted during every access review",
      },
    ],
    correct: "A",
  },
  {
    id: "m3",
    prompt: "What does least privilege mean for users and groups?",
    options: [
      {
        key: "A",
        label:
          "Grant only the memberships and permissions required for a role — no extra sudo or world-writable files",
      },
      {
        key: "B",
        label: "Put every account in sudo so work never blocks",
      },
      {
        key: "C",
        label: "Make all shared files mode 666 for convenience",
      },
      {
        key: "D",
        label: "Disable groups entirely and use only root",
      },
    ],
    correct: "A",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Primary vs supplementary groups — which statement is accurate?",
    options: [
      {
        key: "A",
        label:
          "A user has one primary group (from passwd) and may have additional supplementary groups that also grant access",
      },
      {
        key: "B",
        label: "Users can only belong to one group total",
      },
      {
        key: "C",
        label: "Supplementary groups replace UIDs",
      },
      {
        key: "D",
        label: "Primary groups only matter for root",
      },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt:
      "A file shows `-rw-r--r--` (0644) and holds application secrets. What is the main concern?",
    options: [
      {
        key: "A",
        label:
          "Others can read it — broader access than needed for confidential data",
      },
      {
        key: "B",
        label: "Execute is missing, so confidentiality is automatically safe",
      },
      {
        key: "C",
        label: "Owner read means the file cannot leak",
      },
      {
        key: "D",
        label: "0644 always means the file is encrypted",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "Why do SUID, SGID, and the sticky bit deserve careful review?",
    options: [
      {
        key: "A",
        label:
          "They change how privilege or deletion works beyond normal owner/group/other bits and can expand risk if misapplied",
      },
      {
        key: "B",
        label: "They only affect desktop wallpaper settings",
      },
      {
        key: "C",
        label: "They permanently disable authentication",
      },
      {
        key: "D",
        label: "They are required on every file for least privilege",
      },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt:
      "The deploy account is in the sudo group, but deployments only need deployers access. Best action?",
    options: [
      {
        key: "A",
        label:
          "Remove unnecessary sudo membership after confirming deployers still covers the role",
      },
      {
        key: "B",
        label: "Add every service account to sudo for faster incidents",
      },
      {
        key: "C",
        label: "Delete the deploy account without checking dependencies",
      },
      {
        key: "D",
        label:
          "Ignore group membership because authentication already succeeded",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt: "Which is a common access-control mistake?",
    options: [
      {
        key: "A",
        label:
          "Sharing one interactive account, granting unnecessary admin rights, or leaving files world-writable",
      },
      {
        key: "B",
        label: "Reviewing group membership before changing modes",
      },
      {
        key: "C",
        label: "Verifying intended use before removing access",
      },
      {
        key: "D",
        label: "Separating authentication from authorization",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "During an access review, what is a sound workflow order?",
    options: [
      {
        key: "A",
        label:
          "Identify the account, inspect groups, review relevant permissions, assess risk, recommend a change, then verify",
      },
      {
        key: "B",
        label: "chmod 777 everything first, then ask questions later",
      },
      {
        key: "C",
        label: "Delete all system accounts, then reboot",
      },
      {
        key: "D",
        label: "Skip inspection and apply the same fix to every host",
      },
    ],
    correct: "A",
  },
] as const;

const ACCESS_REVIEW_CHECKLIST = [
  "List human, service, and system accounts and note unexpected interactive shells",
  "Review primary and supplementary group membership for excess privilege",
  "Inspect ownership and modes on sensitive files and shared directories",
  "Flag special bits (SUID/SGID/sticky) that need justification",
  "Separate authentication issues from authorization issues",
  "Recommend the smallest least-privilege change that preserves legitimate access",
  "Verify the result after the simulated change",
  "Document remaining risk and operational dependencies",
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

function QuizBlock({
  title,
  description,
  questions,
  includeChecklist = false,
}: {
  title: string;
  description: string;
  questions: readonly QuizQuestion[];
  includeChecklist?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const allAnswered = questions.every((q) => answers[q.id]);
  const score = questions.filter((q) => answers[q.id] === q.correct).length;

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
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <ol className="space-y-6">
        {questions.map((question, index) => {
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
            Retry quiz
          </Button>
        )}
      </div>

      {submitted ? (
        <Callout
          title={
            score === questions.length
              ? "Excellent"
              : score >= Math.ceil(questions.length * 0.66)
                ? "Solid progress"
                : "Keep reviewing"
          }
        >
          <p>
            You scored {score} of {questions.length}. Revisit users, groups,
            permissions, least privilege, and the access-review workflow if any
            answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Access Review Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this checklist on systems you are authorized to administer.
              Prefer careful verification and the smallest necessary changes.
              Checkboxes stay in this browser session — nothing is stored.
            </p>
          </div>
          <ul className="space-y-2">
            {ACCESS_REVIEW_CHECKLIST.map((item, index) => {
              const checked = checkedItems.has(index);
              return (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecklist(index)}
                      className="border-border text-primary mt-0.5 size-4 rounded"
                    />
                    <span
                      className={cn(
                        checked && "text-muted-foreground line-through",
                      )}
                    >
                      {index + 1}. {item}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SecurityAccessControlKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on identity, authentication vs authorization, and least privilege. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityAccessControlQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question. Your selections stay on this page only — nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
