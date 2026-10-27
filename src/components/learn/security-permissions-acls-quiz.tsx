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
    prompt: "What does mode `640` mean for a regular file?",
    options: [
      {
        key: "A",
        label: "Owner read/write; group read; others none (`rw-r-----`)",
      },
      {
        key: "B",
        label: "Owner execute only; group write; others read",
      },
      {
        key: "C",
        label: "Everyone has full read/write/execute",
      },
      {
        key: "D",
        label: "Only the sticky bit is set",
      },
    ],
    correct: "A",
  },
  {
    id: "m2",
    prompt: "When are POSIX ACLs especially useful?",
    options: [
      {
        key: "A",
        label:
          "When you need to grant or deny access to specific users or groups beyond a single owning group",
      },
      {
        key: "B",
        label: "Only when you want to disable authentication entirely",
      },
      {
        key: "C",
        label: "They replace the need for file ownership forever",
      },
      {
        key: "D",
        label: "They are required on every file for Linux to boot",
      },
    ],
    correct: "A",
  },
  {
    id: "m3",
    prompt:
      "A named-user ACL entry lists `rw-` but getfacl shows `#effective:r--`. What is the usual cause?",
    options: [
      {
        key: "A",
        label:
          "The ACL mask intersects the entry, so effective rights are only what both allow",
      },
      {
        key: "B",
        label:
          "The file owner always overrides named-user entries to read-only",
      },
      {
        key: "C",
        label: "other:: bits always replace named-user entries",
      },
      {
        key: "D",
        label: "getfacl invents effective lines randomly",
      },
    ],
    correct: "A",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which statement about SUID, SGID, and the sticky bit is accurate?",
    options: [
      {
        key: "A",
        label:
          "They change privilege or deletion behavior beyond ordinary owner/group/other bits and need careful security review",
      },
      {
        key: "B",
        label: "They only affect terminal colors",
      },
      {
        key: "C",
        label: "They permanently disable ACLs on the filesystem",
      },
      {
        key: "D",
        label: "They must be set on every configuration file",
      },
    ],
    correct: "A",
  },
  {
    id: "q2",
    prompt: "What is the practical difference between `getfacl` and `setfacl`?",
    options: [
      {
        key: "A",
        label:
          "`getfacl` inspects ACL entries; `setfacl` modifies them (add, remove, mask, defaults)",
      },
      {
        key: "B",
        label: "They are identical aliases for chmod",
      },
      {
        key: "C",
        label: "`getfacl` changes ownership; `setfacl` prints disk usage",
      },
      {
        key: "D",
        label: "`setfacl` only works on `/tmp`",
      },
    ],
    correct: "A",
  },
  {
    id: "q3",
    prompt: "How do default ACLs on a directory behave?",
    options: [
      {
        key: "A",
        label:
          "They influence the access ACL inherited by newly created children; they do not replace the directory’s own access ACL",
      },
      {
        key: "B",
        label: "They immediately rewrite every existing file under the tree",
      },
      {
        key: "C",
        label: "They only apply when the sticky bit is clear",
      },
      {
        key: "D",
        label: "They disable named-user entries on the directory forever",
      },
    ],
    correct: "A",
  },
  {
    id: "q4",
    prompt:
      "When evaluating whether user `analyst` can write a file that has ACLs, which order is correct?",
    options: [
      {
        key: "A",
        label:
          "Owner match → named-user (+ mask) → matching groups (+ mask) → other",
      },
      {
        key: "B",
        label: "other first, then owner, then ignore ACLs",
      },
      {
        key: "C",
        label: "Only the ACL mask matters; owner and other are ignored",
      },
      {
        key: "D",
        label: "Any group membership grants full rwx regardless of entries",
      },
    ],
    correct: "A",
  },
  {
    id: "q5",
    prompt:
      "Changing the ACL mask with `setfacl -m m::rw-` typically does what?",
    options: [
      {
        key: "A",
        label:
          "Updates effective permissions for named users/groups without silently deleting their underlying ACL entries",
      },
      {
        key: "B",
        label: "Deletes every named-user entry automatically",
      },
      {
        key: "C",
        label: "Converts the file into a directory",
      },
      {
        key: "D",
        label: "Removes the owner:: entry",
      },
    ],
    correct: "A",
  },
  {
    id: "q6",
    prompt: "Which is a common ACL security mistake?",
    options: [
      {
        key: "A",
        label:
          "Broadening other:: or raising masks just to clear an access error, without checking who else gains rights",
      },
      {
        key: "B",
        label: "Inspecting getfacl before and after a change",
      },
      {
        key: "C",
        label: "Removing only the unnecessary named-user entry",
      },
      {
        key: "D",
        label: "Distinguishing listed permissions from effective permissions",
      },
    ],
    correct: "A",
  },
] as const;

const ACL_CHECKLIST = [
  "Decode owner/group/other bits (and special bits) before touching ACLs",
  "Use getfacl to read named-user, named-group, mask, and default entries",
  "Treat `#effective:` as authoritative when it differs from the listed entry",
  "Prefer named ACL grants over world-readable/world-writable shortcuts",
  "Remove excess named entries with -x instead of wiping unrelated ACLs",
  "Remember default ACLs affect new children, not existing objects",
  "After changes, re-check effective access for intended and unintended identities",
  "Document why each ACL grant exists and who approved it",
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
            You scored {score} of {questions.length}. Revisit modes, ACL
            entries, masks, default ACLs, and effective-access order if any
            answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Permissions & ACL Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer the
              smallest deliberate change. Checkboxes stay in this browser
              session only.
            </p>
          </div>
          <ul className="space-y-2">
            {ACL_CHECKLIST.map((item, index) => {
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

export function SecurityPermissionsAclsKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on modes, when ACLs help, and listed vs effective permissions. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityPermissionsAclsQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question. Your selections stay on this page only — nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
