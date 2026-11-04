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
  explanation: string;
};

const MID_LESSON_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "m1",
    prompt: "What does UID 0 represent on a traditional Linux system?",
    options: [
      {
        key: "A",
        label:
          "The root superuser identity with unrestricted administrative authority",
      },
      {
        key: "B",
        label: "A regular desktop user with no administrative rights",
      },
      {
        key: "C",
        label: "A service account that can never use sudo",
      },
      {
        key: "D",
        label: "A network port reserved for SSH",
      },
    ],
    correct: "A",
    explanation:
      "UID 0 is root. Ordinary discretionary permission checks do not constrain root the way they constrain regular users.",
  },
  {
    id: "m2",
    prompt: "What is the difference between authentication and authorization?",
    options: [
      {
        key: "A",
        label:
          "Authentication proves identity; authorization decides what that identity may do",
      },
      {
        key: "B",
        label: "They are identical terms for logging in",
      },
      {
        key: "C",
        label: "Authorization proves identity; authentication lists sudo rules",
      },
      {
        key: "D",
        label: "Authentication only applies to root shells",
      },
    ],
    correct: "A",
    explanation:
      "You authenticate to prove who you are; authorization (groups, sudoers, file modes) decides permitted actions.",
  },
  {
    id: "m3",
    prompt: "Why does sudo exist?",
    options: [
      {
        key: "A",
        label:
          "To let authorized users run specific elevated commands without sharing a root login for every task",
      },
      {
        key: "B",
        label: "To permanently disable all administrative access",
      },
      {
        key: "C",
        label: "To replace file permissions entirely",
      },
      {
        key: "D",
        label: "To force every process to run as UID 0",
      },
    ],
    correct: "A",
    explanation:
      "sudo provides controlled, auditable elevation for authorized identities — preferably for the smallest command set needed.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Why should daily work use a regular account instead of remaining as root?",
    options: [
      {
        key: "A",
        label:
          "Mistakes and malware have a smaller blast radius when the session is unprivileged",
      },
      {
        key: "B",
        label: "Regular accounts cannot open a terminal",
      },
      {
        key: "C",
        label: "Root cannot install packages on Linux",
      },
      {
        key: "D",
        label: "sudo never works for regular users",
      },
    ],
    correct: "A",
    explanation:
      "Unprivileged day-to-day sessions limit damage from typos, malicious scripts, and compromised apps.",
  },
  {
    id: "q2",
    prompt: "How does `sudo command` differ from switching to a root shell?",
    options: [
      {
        key: "A",
        label:
          "`sudo command` elevates one operation; a root shell elevates an entire session",
      },
      {
        key: "B",
        label: "They are identical in every security property",
      },
      {
        key: "C",
        label: "A root shell never elevates privileges",
      },
      {
        key: "D",
        label: "`sudo command` always disables logging",
      },
    ],
    correct: "A",
    explanation:
      "Prefer single elevated commands when practical; root shells widen the window for mistakes.",
  },
  {
    id: "q3",
    prompt: "Why is `visudo` preferred when editing sudoers?",
    options: [
      {
        key: "A",
        label:
          "It validates sudoers syntax and helps prevent a broken policy from locking out administration",
      },
      {
        key: "B",
        label: "It permanently grants NOPASSWD to every user",
      },
      {
        key: "C",
        label: "It deletes /etc/sudoers.d automatically",
      },
      {
        key: "D",
        label: "It disables the sudo group",
      },
    ],
    correct: "A",
    explanation:
      "Syntax errors can make sudo refuse to load policy. visudo (and visudo -c) reduce that risk.",
  },
  {
    id: "q4",
    prompt:
      "What is the main risk of NOPASSWD on broad administrative commands?",
    options: [
      {
        key: "A",
        label:
          "A compromised account can run those elevated commands without a password challenge",
      },
      {
        key: "B",
        label: "NOPASSWD always encrypts the root password",
      },
      {
        key: "C",
        label: "NOPASSWD removes the user from all groups",
      },
      {
        key: "D",
        label: "NOPASSWD only affects desktop wallpaper settings",
      },
    ],
    correct: "A",
    explanation:
      "Skipping the password prompt is sometimes justified for automation, but it removes a friction barrier against misuse.",
  },
  {
    id: "q5",
    prompt:
      "A deploy account only needs `/usr/local/bin/deploy-app`, but its rule is `ALL`. What is the least-privilege fix?",
    options: [
      {
        key: "A",
        label:
          "Replace the unrestricted rule with a command-specific sudoers entry for the deploy script",
      },
      {
        key: "B",
        label: "Add the account to every privileged group",
      },
      {
        key: "C",
        label: "Grant NOPASSWD ALL for convenience",
      },
      {
        key: "D",
        label: "Delete the deploy script so sudo is unused",
      },
    ],
    correct: "A",
    explanation:
      "Least privilege means matching the elevated grant to the actual operational need.",
  },
  {
    id: "q6",
    prompt:
      "A reporting user is in the `sudo` group but only needs read access to reports. What should you recommend?",
    options: [
      {
        key: "A",
        label:
          "Remove unnecessary sudo group membership and keep access aligned to the reporting role",
      },
      {
        key: "B",
        label: "Give the reporting user NOPASSWD ALL",
      },
      {
        key: "C",
        label: "Force the reporting user to log in as root daily",
      },
      {
        key: "D",
        label: "Ignore group membership because sudo never checks groups",
      },
    ],
    correct: "A",
    explanation:
      "Privileged group membership is an authorization decision — remove it when the role does not need administration.",
  },
] as const;

const PRIVILEGE_CHECKLIST = [
  "Confirm whether the task needs elevation at all before granting sudo",
  "Prefer regular accounts for daily work; elevate only for specific tasks",
  "Inspect sudo rights with sudo -l and review /etc/sudoers.d drop-ins",
  "Validate policy with visudo (or visudo -c) before relying on changes",
  "Prefer command-specific rules over unrestricted ALL when possible",
  "Treat NOPASSWD as an exception that needs written justification",
  "Review privileged group membership (sudo/wheel) for unnecessary accounts",
  "Document privilege changes and re-verify with id, getent, and sudo -l",
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
                  . {question.explanation}
                </p>
              ) : null}
              {submitted && isCorrect ? (
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
            You scored {score} of {questions.length}. Revisit root privileges,
            sudo vs root shells, sudoers/visudo, NOPASSWD, and least privilege
            if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Privilege Review Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer the
              smallest deliberate elevation. Checkboxes stay in this browser
              session only.
            </p>
          </div>
          <ul className="space-y-2">
            {PRIVILEGE_CHECKLIST.map((item, index) => {
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

export function SecurityPrivilegeManagementKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on UID 0, authentication vs authorization, and why sudo exists. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityPrivilegeManagementQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question covering root privileges, sudo, sudoers, NOPASSWD, and least privilege. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
