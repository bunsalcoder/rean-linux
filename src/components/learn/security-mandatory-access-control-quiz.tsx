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
    prompt:
      "How does Mandatory Access Control (MAC) differ from Discretionary Access Control (DAC)?",
    options: [
      {
        key: "A",
        label:
          "DAC lets owners manage permissions; MAC enforces system policy that processes cannot override even if the owner allows access",
      },
      {
        key: "B",
        label: "MAC only applies to printers; DAC only applies to GPUs",
      },
      {
        key: "C",
        label: "They are identical names for chmod",
      },
      {
        key: "D",
        label: "DAC always blocks root; MAC never uses labels or profiles",
      },
    ],
    correct: "A",
    explanation:
      "DAC is owner-driven (modes, ACLs). MAC adds mandatory policy — AppArmor profiles or SELinux types — that can deny access even when DAC would allow it.",
  },
  {
    id: "m2",
    prompt: "What does AppArmor primarily attach security policy to?",
    options: [
      {
        key: "A",
        label: "Executable application paths via security profiles",
      },
      {
        key: "B",
        label: "Only the BIOS firmware vendor string",
      },
      {
        key: "C",
        label: "DNS zone transfers exclusively",
      },
      {
        key: "D",
        label: "Package manager mirrors only",
      },
    ],
    correct: "A",
    explanation:
      "AppArmor profiles are typically associated with program paths and constrain file, network, and capability use for that application.",
  },
  {
    id: "m3",
    prompt:
      "In an SELinux context like system_u:system_r:httpd_t:s0, which component is central to type enforcement?",
    options: [
      {
        key: "A",
        label:
          "The type (httpd_t) — allow rules decide which types may interact",
      },
      {
        key: "B",
        label: "Only the trailing s0 digit when chmod is 644",
      },
      {
        key: "C",
        label: "The colon characters themselves",
      },
      {
        key: "D",
        label: "The Linux login name always equals the SELinux user",
      },
    ],
    correct: "A",
    explanation:
      "Type enforcement matches process types to object types. user/role/level also matter, but type is the everyday troubleshooting focus.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "A process’s Linux user can read a file by DAC, but the operation still fails under AppArmor enforce mode. Best explanation?",
    options: [
      {
        key: "A",
        label:
          "MAC can deny access after DAC allows it when the profile lacks an allow for that path",
      },
      {
        key: "B",
        label: "DAC always overrides AppArmor in enforce mode",
      },
      {
        key: "C",
        label: "AppArmor only runs when SELinux is Disabled",
      },
      {
        key: "D",
        label: "File ownership is ignored on every Linux system",
      },
    ],
    correct: "A",
    explanation:
      "Defense in depth: DAC and MAC are separate checks. Enforce-mode AppArmor can block permitted DAC access.",
  },
  {
    id: "q2",
    prompt:
      "What is the difference between AppArmor complain mode and enforce mode?",
    options: [
      {
        key: "A",
        label:
          "Complain logs policy violations without blocking; enforce blocks violations (and typically logs them)",
      },
      {
        key: "B",
        label: "Complain deletes profiles; enforce installs SELinux",
      },
      {
        key: "C",
        label: "They differ only in terminal prompt color",
      },
      {
        key: "D",
        label: "Enforce mode ignores all network rules",
      },
    ],
    correct: "A",
    explanation:
      "Complain is for learning and tuning. Enforce provides containment. Leaving production services in complain weakens MAC.",
  },
  {
    id: "q3",
    prompt:
      "SELinux denies httpd_t reading a web file labeled default_t even though chmod is 644. Best next step?",
    options: [
      {
        key: "A",
        label:
          "Inspect contexts (ls -Z / ps -Z), confirm the mismatch, then restore the correct file context (e.g. restorecon) or adjust policy deliberately",
      },
      {
        key: "B",
        label: "Only run chmod 777 and reboot without checking labels",
      },
      {
        key: "C",
        label: "Disable MAC permanently on every host as standard practice",
      },
      {
        key: "D",
        label: "Delete /etc/passwd to clear the denial",
      },
    ],
    correct: "A",
    explanation:
      "Wrong types cause AVC denials independent of DAC modes. Investigate labels before weakening enforcement.",
  },
  {
    id: "q4",
    prompt: "How do AppArmor and SELinux policy models typically differ?",
    options: [
      {
        key: "A",
        label:
          "AppArmor uses path-based profiles for executables; SELinux uses label-based type enforcement on processes and objects",
      },
      {
        key: "B",
        label: "SELinux only works on Ubuntu; AppArmor only works on RHEL",
      },
      {
        key: "C",
        label: "Both systems are identical and always installed together",
      },
      {
        key: "D",
        label: "Neither system can restrict network access",
      },
    ],
    correct: "A",
    explanation:
      "Both provide MAC, with different models and common distribution associations (AppArmor/Ubuntu-family; SELinux/Fedora-RHEL-family). Neither is universally “better.”",
  },
  {
    id: "q5",
    prompt:
      "httpd_t can read httpd_sys_content_t but cannot write it, while ls -l shows the file as group-writable. What does this illustrate?",
    options: [
      {
        key: "A",
        label:
          "Type enforcement can deny writes that traditional permissions appear to allow",
      },
      {
        key: "B",
        label: "SELinux never denies writes when DAC allows them",
      },
      {
        key: "C",
        label: "ls -l prints SELinux types by default",
      },
      {
        key: "D",
        label: "Write denials always mean the disk is full",
      },
    ],
    correct: "A",
    explanation:
      "Content types are often read-only for the service domain. Fix labels or policy — not only chmod.",
  },
  {
    id: "q6",
    prompt:
      "When troubleshooting an access denial, what should you do before disabling MAC or opening policy widely?",
    options: [
      {
        key: "A",
        label:
          "Gather evidence: DAC modes, AppArmor profile/mode or SELinux contexts, and denial logs — then apply the minimal fix",
      },
      {
        key: "B",
        label: "Immediately setenforce 0 and aa-disable every profile",
      },
      {
        key: "C",
        label: "Ignore logs because denials are never useful",
      },
      {
        key: "D",
        label: "Grant sys_admin to all confined processes first",
      },
    ],
    correct: "A",
    explanation:
      "Evidence-first troubleshooting preserves least privilege and avoids turning off containment as a habit.",
  },
] as const;

const MAC_CHECKLIST = [
  "Confirm whether the host emphasizes AppArmor, SELinux, or another MAC framework",
  "Separate DAC failures (modes/ACLs/ownership) from MAC failures (profiles/contexts)",
  "Inspect AppArmor with aa-status and review enforce vs complain before changing profiles",
  "Inspect SELinux with getenforce/sestatus, ls -Z, and ps -Z before changing labels or mode",
  "Read denial evidence (journal/audit messages) before widening policy",
  "Prefer minimal allows or correct labels over disabling MAC",
  "Treat complain/permissive as temporary tuning aids, not permanent production posture",
  "Review profiles/policies for overly broad filesystem, network, and capability rights",
  "Document changes and re-test the application path after remediation",
  "Keep recovery access when adjusting confinement on real systems you administer",
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
            You scored {score} of {questions.length}. Revisit DAC vs MAC,
            AppArmor modes, SELinux contexts, and evidence-first troubleshooting
            if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              MAC Security Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer
              minimal policy fixes over disabling confinement. Checkboxes stay
              in this browser session only.
            </p>
          </div>
          <ul className="space-y-2">
            {MAC_CHECKLIST.map((item, index) => {
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

export function SecurityMandatoryAccessControlKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on DAC vs MAC, AppArmor profiles, and SELinux types. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityMandatoryAccessControlQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer covering DAC, MAC, AppArmor, SELinux, enforcement modes, contexts, and policy troubleshooting. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
