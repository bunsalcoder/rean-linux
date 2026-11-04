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
    prompt: "What does `apt update` do?",
    options: [
      {
        key: "A",
        label:
          "Refreshes package metadata from repositories; it does not install newer versions of installed software by itself",
      },
      {
        key: "B",
        label: "Immediately upgrades every installed package",
      },
      {
        key: "C",
        label: "Reboots the system into a new kernel",
      },
      {
        key: "D",
        label: "Removes all packages marked security",
      },
    ],
    correct: "A",
    explanation:
      "apt update refreshes the local index. Upgrades require apt upgrade, apt full-upgrade, or apt install.",
  },
  {
    id: "m2",
    prompt:
      "Why is a high CVSS-style score alone insufficient to set remediation priority?",
    options: [
      {
        key: "A",
        label:
          "Exposure, whether the component is installed and running, exploitability, asset importance, mitigations, and fix availability also change risk",
      },
      {
        key: "B",
        label: "CVSS scores permanently disable package managers",
      },
      {
        key: "C",
        label: "Only low scores ever need patching",
      },
      {
        key: "D",
        label: "Severity labels replace operational judgment entirely",
      },
    ],
    correct: "A",
    explanation:
      "Severity is one input. A critical issue on unused software can wait behind a medium issue on an internet-facing service.",
  },
  {
    id: "m3",
    prompt:
      "After installing a security update for a long-running daemon, why might the host still be effectively unpatched?",
    options: [
      {
        key: "A",
        label:
          "The process may still be running the previous in-memory code until it is restarted (or the host is rebooted for kernel updates)",
      },
      {
        key: "B",
        label: "apt always rolls back security updates automatically",
      },
      {
        key: "C",
        label: "Package signatures prevent restarts forever",
      },
      {
        key: "D",
        label: "uname -r uninstalls upgraded packages",
      },
    ],
    correct: "A",
    explanation:
      "Disk state and runtime state can diverge. Verify service restarts and kernel boots after patching.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which statement best distinguishes a vulnerability from a bug?",
    options: [
      {
        key: "A",
        label:
          "A vulnerability is a weakness that can be abused to violate security properties; a bug is a defect that may or may not be security-relevant",
      },
      {
        key: "B",
        label: "Bugs and vulnerabilities are identical terms in operations",
      },
      {
        key: "C",
        label: "Only misconfigurations can be vulnerabilities",
      },
      {
        key: "D",
        label: "Vulnerabilities exist only in kernels, never in packages",
      },
    ],
    correct: "A",
    explanation:
      "Security updates target weaknesses attackers can abuse. Not every bug is a vulnerability; not every vulnerability is a simple crash bug.",
  },
  {
    id: "q2",
    prompt:
      "Why prefer packages from trusted, signed distribution repositories?",
    options: [
      {
        key: "A",
        label:
          "Signed metadata and trusted maintainers help verify authenticity and reduce supply-chain risk compared with arbitrary unsigned downloads",
      },
      {
        key: "B",
        label: "Signed packages never need security updates",
      },
      {
        key: "C",
        label: "Trusted repositories disable CVSS scoring",
      },
      {
        key: "D",
        label: "apt refuses to work unless packages are unsigned",
      },
    ],
    correct: "A",
    explanation:
      "Distribution security teams and signed indexes are foundational trust controls for patch management.",
  },
  {
    id: "q3",
    prompt:
      "A fictional advisory DEMO-2026-001 is critical, network-exposed, has a known exploit, and a fixed package is available. What priority fits best?",
    options: [
      {
        key: "A",
        label: "Immediate remediation during an emergency change window",
      },
      {
        key: "B",
        label: "Defer indefinitely because CVSS exists",
      },
      {
        key: "C",
        label: "Ignore it unless the package is removed first",
      },
      {
        key: "D",
        label: "Wait for a feature release before considering security",
      },
    ],
    correct: "A",
    explanation:
      "High severity plus exposure, exploitability, and an available fix usually means urgent or immediate action.",
  },
  {
    id: "q4",
    prompt:
      "You ran `apt upgrade` for nginx successfully, but `systemctl status nginx` still shows the old running version. What should you do?",
    options: [
      {
        key: "A",
        label:
          "Restart (or reload, when appropriate) the service and verify runtime matches the installed package",
      },
      {
        key: "B",
        label: "Run apt update again to finish the upgrade",
      },
      {
        key: "C",
        label: "Assume the old process is already patched in memory",
      },
      {
        key: "D",
        label: "Remove nginx to clear pending restarts",
      },
    ],
    correct: "A",
    explanation:
      "Pending service restarts are a common gap between installed and active remediation.",
  },
  {
    id: "q5",
    prompt:
      "A kernel security package is installed, but `uname -r` is unchanged. What does that mean?",
    options: [
      {
        key: "A",
        label:
          "The new kernel is installed on disk, but the running kernel changes only after reboot",
      },
      {
        key: "B",
        label: "Kernel packages never install until uname is run",
      },
      {
        key: "C",
        label: "apt upgrade rebooted already and failed silently",
      },
      {
        key: "D",
        label: "uname -r always shows the candidate version",
      },
    ],
    correct: "A",
    explanation:
      "Installing linux-image packages is not the same as booting them. Track reboot requirements explicitly.",
  },
  {
    id: "q6",
    prompt:
      "Before applying a disruptive security update to a production container runtime, which practice is most appropriate?",
    options: [
      {
        key: "A",
        label:
          "Test the update, confirm backups, schedule a maintenance window, and document a rollback plan",
      },
      {
        key: "B",
        label: "Upgrade immediately on every host with no communication",
      },
      {
        key: "C",
        label: "Disable monitoring so failures are quieter",
      },
      {
        key: "D",
        label: "Skip backups because security updates cannot regress",
      },
    ],
    correct: "A",
    explanation:
      "Blind production upgrades can cause outages. Pair urgency with operational controls — or apply temporary mitigations if you must delay.",
  },
] as const;

const PATCH_MANAGEMENT_CHECKLIST = [
  "Inventory installed packages and refresh metadata regularly (`apt update`)",
  "Review upgradable packages and distinguish security vs non-security updates",
  "Map fictional/real advisories to installed versions using affected/fixed rules",
  "Prioritize by severity, exposure, exploitability, asset importance, and fix availability",
  "Test updates in a non-production environment when operational impact is uncertain",
  "Schedule maintenance windows for disruptive service restarts and reboots",
  "Take backups / snapshots and document rollback steps before production changes",
  "Apply updates, then restart affected services and verify runtime versions",
  "Reboot for kernel updates and confirm `uname -r` matches the intended release",
  "Document what changed, what remains deferred, and any temporary mitigations",
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
            You scored {score} of {questions.length}. Revisit patch workflows,
            advisories, prioritization, service restarts, and reboot
            requirements if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Patch Management Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Checkboxes
              stay in this browser session only — nothing is persisted.
            </p>
          </div>
          <ul className="space-y-2">
            {PATCH_MANAGEMENT_CHECKLIST.map((item, index) => {
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

export function SecurityUpdatesKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on apt update, prioritization beyond CVSS, and pending runtime remediation. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityUpdatesQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question covering vulnerabilities, trusted repositories, advisory prioritization, service restarts, kernel reboots, and operational patch risk. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
