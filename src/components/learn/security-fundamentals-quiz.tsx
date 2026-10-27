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
    prompt: "What does the CIA triad stand for in security?",
    options: [
      {
        key: "A",
        label: "Confidentiality, Integrity, and Availability",
      },
      {
        key: "B",
        label: "Commands, Interfaces, and Applications",
      },
      {
        key: "C",
        label: "Certificates, Identities, and Accounts",
      },
      {
        key: "D",
        label: "CPU, I/O, and Allocation",
      },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "What does least privilege mean?",
    options: [
      {
        key: "A",
        label:
          "Grant only the access required for a role — no extra sudo, ports, or file rights",
      },
      {
        key: "B",
        label: "Give every user full root access so work never blocks",
      },
      {
        key: "C",
        label: "Disable all logging to reduce noise",
      },
      {
        key: "D",
        label: "Open every firewall port for monitoring tools",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "Defense in depth means:",
    options: [
      {
        key: "A",
        label:
          "Stack independent controls (identity, permissions, network, updates, monitoring, backups) so one failure is not total failure",
      },
      {
        key: "B",
        label: "Rely on a single strong password forever",
      },
      {
        key: "C",
        label: "Only use a firewall and ignore user privileges",
      },
      {
        key: "D",
        label: "Turn off services after a breach and nothing else",
      },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt: "Which change most clearly reduces attack surface?",
    options: [
      {
        key: "A",
        label: "Disable an unused network service and close its firewall allow",
      },
      {
        key: "B",
        label: "Add more listening daemons for convenience",
      },
      {
        key: "C",
        label: "Make secret files world-readable",
      },
      {
        key: "D",
        label: "Skip security updates to avoid downtime forever",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt:
      "A secrets file is world-readable, while journald shows a few failed SSH passwords. How should you prioritize?",
    options: [
      {
        key: "A",
        label:
          "Treat the exposed secrets as higher urgency; failed attempts are a warning to review, not automatic proof of compromise",
      },
      {
        key: "B",
        label:
          "Ignore the file mode because failed logins always mean the host is owned",
      },
      {
        key: "C",
        label: "Only delete logs so the warning disappears",
      },
      {
        key: "D",
        label: "Both findings equally prove a successful breach",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Authentication vs authorization — which pairing is correct?",
    options: [
      {
        key: "A",
        label:
          "SSH key/password proves identity (authentication); sudo membership grants power (authorization)",
      },
      {
        key: "B",
        label:
          "Firewall rules are authentication; package updates are identity",
      },
      {
        key: "C",
        label: "Authorization only happens before login",
      },
      {
        key: "D",
        label: "They are interchangeable terms for the same control",
      },
    ],
    correct: "A",
  },
] as const;

const SECURITY_REVIEW_CHECKLIST = [
  "Review users and privileges",
  "Inspect sensitive file permissions",
  "Identify unnecessary services and exposed ports",
  "Review SSH and firewall configurations",
  "Check security update status",
  "Inspect relevant logs",
  "Confirm backup verification and recovery readiness",
  "Prioritize remediation based on impact and likelihood",
  "Recheck the system after changes",
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

export function SecurityFundamentalsQuiz() {
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
            Retry quiz
          </Button>
        )}
      </div>

      {submitted ? (
        <Callout
          title={
            score === QUESTIONS.length
              ? "Excellent"
              : score >= 4
                ? "Solid progress"
                : "Keep reviewing"
          }
        >
          <p>
            You scored {score} of {QUESTIONS.length}. Revisit the CIA triad,
            least privilege, defense in depth, attack surface, and careful risk
            prioritization if any answers were off.
          </p>
        </Callout>
      ) : null}

      <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
        <div className="space-y-2">
          <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
            Security Review Checklist
          </h3>
          <p className="text-muted-foreground text-sm">
            Use this reusable checklist on authorized systems only. Prefer
            careful verification and the smallest necessary changes. Checkboxes
            stay in this browser session — nothing is stored.
          </p>
        </div>
        <ul className="space-y-2">
          {SECURITY_REVIEW_CHECKLIST.map((item, index) => {
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
        <p className="text-muted-foreground text-sm">
          Emphasize authorized administration, careful verification, and minimal
          necessary changes after each remediation.
        </p>
      </div>
    </div>
  );
}
