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
    prompt: "What is SSH primarily used for on Linux systems?",
    options: [
      {
        key: "A",
        label:
          "Encrypted remote login and command execution for administration",
      },
      {
        key: "B",
        label: "Compiling kernels on the local desktop only",
      },
      {
        key: "C",
        label: "Replacing file permissions with network shares",
      },
      {
        key: "D",
        label: "Disabling all authentication permanently",
      },
    ],
    correct: "A",
    explanation:
      "SSH (Secure Shell) encrypts remote sessions so administrators can manage systems over a network without sending clear-text credentials or commands.",
  },
  {
    id: "m2",
    prompt:
      "Changing only the SSH listening port provides which kind of protection?",
    options: [
      {
        key: "A",
        label:
          "Little meaningful protection by itself — scanners and attackers still find services; authentication and access policy matter more",
      },
      {
        key: "B",
        label: "Complete immunity from unauthorized access",
      },
      {
        key: "C",
        label: "Automatic encryption of the entire internet",
      },
      {
        key: "D",
        label: "A replacement for public-key authentication",
      },
    ],
    correct: "A",
    explanation:
      "A non-default port may reduce casual noise, but it is not a substitute for strong authentication, least privilege, and monitoring.",
  },
  {
    id: "m3",
    prompt: "Why must private SSH keys remain secret?",
    options: [
      {
        key: "A",
        label:
          "Anyone who obtains the private key can authenticate as that identity wherever the matching public key is authorized",
      },
      {
        key: "B",
        label: "Private keys are only used to decorate terminal prompts",
      },
      {
        key: "C",
        label: "Public keys stop working if private keys stay private",
      },
      {
        key: "D",
        label: "sshd deletes accounts when private keys are protected",
      },
    ],
    correct: "A",
    explanation:
      "The private key is the credential. Protect it with filesystem permissions, a passphrase, and careful distribution — never publish it.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which `PermitRootLogin` posture is generally preferred for remote administration when individual admin accounts exist?",
    options: [
      {
        key: "A",
        label:
          "Disable direct root login (`no` or prohibit-password) and use individual accounts with controlled elevation",
      },
      {
        key: "B",
        label: "Always set PermitRootLogin yes for convenience",
      },
      {
        key: "C",
        label: "Remove sshd entirely so nobody can administer the host",
      },
      {
        key: "D",
        label: "Share one root password across every operator",
      },
    ],
    correct: "A",
    explanation:
      "Individual accounts improve accountability. Elevate with sudo when needed instead of logging in directly as root over SSH.",
  },
  {
    id: "q2",
    prompt:
      "Before disabling `PasswordAuthentication` on a real server, what should administrators verify?",
    options: [
      {
        key: "A",
        label:
          "That public-key authentication is configured and a working recovery session exists",
      },
      {
        key: "B",
        label: "That PermitEmptyPasswords is set to yes",
      },
      {
        key: "C",
        label: "That MaxAuthTries is at least 50",
      },
      {
        key: "D",
        label: "That root login is forced to password-only",
      },
    ],
    correct: "A",
    explanation:
      "Disabling passwords without verified key access (and a recovery path) can lock operators out of remote administration.",
  },
  {
    id: "q3",
    prompt: "What does a lower `MaxAuthTries` value help with?",
    options: [
      {
        key: "A",
        label:
          "Limiting how many authentication attempts a single connection may try before disconnecting",
      },
      {
        key: "B",
        label: "Encrypting private keys automatically",
      },
      {
        key: "C",
        label: "Opening additional listening ports",
      },
      {
        key: "D",
        label: "Granting root shells without authentication",
      },
    ],
    correct: "A",
    explanation:
      "MaxAuthTries bounds guesses per connection. It complements (not replaces) firewall rate limits, fail2ban-style controls, and strong credentials.",
  },
  {
    id: "q4",
    prompt: "What is the purpose of `AllowUsers` or `AllowGroups`?",
    options: [
      {
        key: "A",
        label:
          "Restrict which accounts or groups may authenticate via SSH even if they exist locally",
      },
      {
        key: "B",
        label: "Delete all users not listed in the file",
      },
      {
        key: "C",
        label: "Disable encryption for listed users",
      },
      {
        key: "D",
        label: "Force X11 forwarding for every session",
      },
    ],
    correct: "A",
    explanation:
      "Allowlists shrink the remote-access surface to the identities that actually need SSH.",
  },
  {
    id: "q5",
    prompt:
      "You run `sshd -t` and it reports a configuration error. What should you do before restarting SSH on a production host?",
    options: [
      {
        key: "A",
        label:
          "Fix the invalid setting, re-validate, and keep a working recovery session before applying the change",
      },
      {
        key: "B",
        label: "Restart immediately so the error clears itself",
      },
      {
        key: "C",
        label: "Disable journaling so errors are hidden",
      },
      {
        key: "D",
        label: "Set PermitEmptyPasswords yes as a workaround",
      },
    ],
    correct: "A",
    explanation:
      "An invalid sshd_config can prevent the service from starting. Validate first and preserve recovery access.",
  },
  {
    id: "q6",
    prompt:
      "Fictional logs show repeated failed root passwords from one IP, a successful key login for bunsal from the LAN, and analyst rejected by AllowUsers. What is the best interpretation?",
    options: [
      {
        key: "A",
        label:
          "Investigate the repeated internet failures as suspicious; treat the LAN success and AllowUsers rejection as expected policy behavior unless other evidence conflicts",
      },
      {
        key: "B",
        label: "Every failed login proves a successful breach",
      },
      {
        key: "C",
        label: "AllowUsers rejections always mean malware",
      },
      {
        key: "D",
        label: "Successful key logins from known admins are never legitimate",
      },
    ],
    correct: "A",
    explanation:
      "Context matters: noise and policy denials differ from credential stuffing. Correlate source, account, method, and timing before escalating.",
  },
] as const;

const SSH_HARDENING_CHECKLIST = [
  "Inventory who needs remote SSH access and why",
  "Prefer individual admin accounts over shared root SSH logins",
  "Verify public-key authentication works before disabling passwords",
  "Keep a recovery console or out-of-band session before applying sshd changes",
  "Validate configuration with sshd -t before restarting the service",
  "Restrict AllowUsers or AllowGroups to required identities",
  "Disable PermitEmptyPasswords and avoid unnecessary X11 forwarding",
  "Set a reasonable MaxAuthTries and review authentication failure logs",
  "Confirm listening ports and firewall exposure match the intended policy",
  "Document changes and re-check with sshd -T and a test login",
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
            You scored {score} of {questions.length}. Revisit sshd_config
            settings, authentication methods, access restrictions, validation,
            and log interpretation if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              SSH Hardening Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer
              verified key access and a recovery path before tightening remote
              policy. Checkboxes stay in this browser session only.
            </p>
          </div>
          <ul className="space-y-2">
            {SSH_HARDENING_CHECKLIST.map((item, index) => {
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

export function SecuritySshHardeningKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on SSH purpose, port myths, and private-key secrecy. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecuritySshHardeningQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question covering sshd_config, authentication, root login, access restrictions, validation, and log analysis. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
