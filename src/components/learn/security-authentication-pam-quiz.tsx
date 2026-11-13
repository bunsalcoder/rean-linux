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
    prompt: "What is the difference between authentication and authorization?",
    options: [
      {
        key: "A",
        label:
          "Authentication proves identity; authorization decides what that identity may do",
      },
      {
        key: "B",
        label: "Authentication grants sudo; authorization sets the hostname",
      },
      {
        key: "C",
        label: "They are identical terms for password checking",
      },
      {
        key: "D",
        label: "Authorization always happens before authentication",
      },
    ],
    correct: "A",
    explanation:
      "You first prove who you are (authentication), then policy decides which actions or resources are allowed (authorization).",
  },
  {
    id: "m2",
    prompt: "What is PAM’s primary role on Linux?",
    options: [
      {
        key: "A",
        label:
          "A pluggable framework that lets applications share configurable authentication, account, password, and session modules",
      },
      {
        key: "B",
        label: "A firewall that blocks all remote packets",
      },
      {
        key: "C",
        label: "A package manager for kernel modules only",
      },
      {
        key: "D",
        label: "A replacement for /etc/passwd that deletes UIDs",
      },
    ],
    correct: "A",
    explanation:
      "Pluggable Authentication Modules let login, SSH, sudo, and similar apps reuse a configurable module stack instead of embedding auth logic.",
  },
  {
    id: "m3",
    prompt: "How do PAM and NSS differ?",
    options: [
      {
        key: "A",
        label:
          "PAM handles authentication-related application requests; NSS resolves identity and related information sources such as passwd and group",
      },
      {
        key: "B",
        label: "NSS authenticates passwords; PAM only prints banners",
      },
      {
        key: "C",
        label: "They are the same daemon under two names",
      },
      {
        key: "D",
        label: "PAM replaces /etc/nsswitch.conf entirely",
      },
    ],
    correct: "A",
    explanation:
      "NSS answers “who is this name/UID?” from configured sources. PAM answers “may this application authenticate/open a session for them?” via module stacks.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which PAM module type is responsible for checking whether an account is expired or locked after credentials are accepted?",
    options: [
      {
        key: "A",
        label: "account",
      },
      {
        key: "B",
        label: "auth only — account stages never run",
      },
      {
        key: "C",
        label: "session before auth",
      },
      {
        key: "D",
        label: "password when reading journalctl",
      },
    ],
    correct: "A",
    explanation:
      "The account stage performs account-management checks (expiration, lockout, validity). Auth success alone does not grant access.",
  },
  {
    id: "q2",
    prompt:
      "A requisite module fails during authentication. What happens to the rest of that stage’s stack?",
    options: [
      {
        key: "A",
        label:
          "Processing stops immediately and the stage fails — later modules are skipped",
      },
      {
        key: "B",
        label: "All later modules still run and can override the failure",
      },
      {
        key: "C",
        label: "The failure is ignored like optional",
      },
      {
        key: "D",
        label: "PAM deletes the user account",
      },
    ],
    correct: "A",
    explanation:
      "requisite means failure is fatal and immediate. required also fails the stage but continues running remaining modules.",
  },
  {
    id: "q3",
    prompt:
      "A sufficient module succeeds and no prior required failure exists. What is the typical teaching-model result for that stage?",
    options: [
      {
        key: "A",
        label: "The stage can succeed early without running remaining modules",
      },
      {
        key: "B",
        label: "The stage always fails",
      },
      {
        key: "C",
        label: "Account expiration is cleared automatically",
      },
      {
        key: "D",
        label: "NSS is disabled until reboot",
      },
    ],
    correct: "A",
    explanation:
      "sufficient success short-circuits the stage when earlier required modules have not already failed.",
  },
  {
    id: "q4",
    prompt:
      "Why should administrators preserve a recovery path before changing authentication or PAM policy?",
    options: [
      {
        key: "A",
        label:
          "Invalid or overly strict policy can lock operators out of the system",
      },
      {
        key: "B",
        label: "Recovery paths disable encryption permanently",
      },
      {
        key: "C",
        label: "PAM cannot run unless recovery is disabled",
      },
      {
        key: "D",
        label: "journalctl refuses to start without recovery",
      },
    ],
    correct: "A",
    explanation:
      "Authentication misconfiguration is a classic lockout risk. Keep console, out-of-band, or a verified second session before applying changes.",
  },
  {
    id: "q5",
    prompt:
      "Which tools help inspect password aging and failed-login lockout state (conceptually)?",
    options: [
      {
        key: "A",
        label:
          "chage for aging/expiration and faillock for failure counters / lockout",
      },
      {
        key: "B",
        label: "iptables and ss only",
      },
      {
        key: "C",
        label: "apt upgrade and df -h",
      },
      {
        key: "D",
        label: "chmod and chown exclusively",
      },
    ],
    correct: "A",
    explanation:
      "chage reports aging and account expiration. faillock (with pam_faillock) reports consecutive failures and lockouts. Availability varies by distribution.",
  },
  {
    id: "q6",
    prompt:
      "Logs show repeated root password failures from the internet, a successful bunsal key login from the LAN, deploy locked by faillock, and analyst rejected for expiration. Best interpretation?",
    options: [
      {
        key: "A",
        label:
          "Investigate the internet root failures as suspicious; treat LAN admin success, lockout, and expiration as policy/account events unless other evidence conflicts",
      },
      {
        key: "B",
        label: "Every failed login proves a successful breach",
      },
      {
        key: "C",
        label: "Account expiration always means malware",
      },
      {
        key: "D",
        label:
          "Successful admin key logins from known hosts are never legitimate",
      },
    ],
    correct: "A",
    explanation:
      "Context separates credential stuffing noise from expected policy denials and legitimate admin sessions. Correlate source, account, method, and timing.",
  },
] as const;

const AUTH_PAM_CHECKLIST = [
  "Inventory who authenticates locally vs remotely and why",
  "Distinguish authentication (identity) from authorization (permission)",
  "Review /etc/pam.d service files and shared common-* includes carefully",
  "Validate PAM changes and keep a recovery console or out-of-band session",
  "Enable password quality controls appropriate to policy (e.g. pam_pwquality)",
  "Configure failed-login lockout thoughtfully (e.g. pam_faillock) without locking admins out of recovery",
  "Set password aging and account expiration with chage where required",
  "Monitor authentication logs without treating every failure as a breach",
  "Confirm module availability for your distribution before copying examples",
  "Document changes and re-test login paths after policy updates",
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
            You scored {score} of {questions.length}. Revisit PAM stages,
            control flags, account policy, and troubleshooting if any answers
            were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Authentication Security Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer a
              recovery path before tightening authentication policy. Checkboxes
              stay in this browser session only.
            </p>
          </div>
          <ul className="space-y-2">
            {AUTH_PAM_CHECKLIST.map((item, index) => {
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

export function SecurityAuthenticationPamKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on authentication vs authorization, PAM, and NSS. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityAuthenticationPamQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer covering PAM stages, control flags, account policy, recovery discipline, and log interpretation. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
