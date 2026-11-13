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
      "What is the difference between a security event, an alert, and an incident?",
    options: [
      {
        key: "A",
        label:
          "An event is an observed occurrence; an alert is a signal that something may need attention; an incident is a confirmed or strongly suspected security impact requiring response",
      },
      {
        key: "B",
        label: "All three words mean the same thing in every organization",
      },
      {
        key: "C",
        label: "An incident is only a firewall log line",
      },
      {
        key: "D",
        label: "Alerts are always false positives",
      },
    ],
    correct: "A",
    explanation:
      "Triaging alerts into true incidents uses context, corroboration, and confidence — not vocabulary alone.",
  },
  {
    id: "m2",
    prompt: "Which sequence best reflects incident response fundamentals?",
    options: [
      {
        key: "A",
        label:
          "Preparation → identification → triage → containment → evidence preservation → eradication → recovery → lessons learned",
      },
      {
        key: "B",
        label: "Delete logs → rebuild → ignore root cause",
      },
      {
        key: "C",
        label: "Recovery first → never collect evidence",
      },
      {
        key: "D",
        label: "Public disclosure before internal triage in every case",
      },
    ],
    correct: "A",
    explanation:
      "Phases can overlap under pressure, but preparation and evidence-aware response remain core.",
  },
  {
    id: "m3",
    prompt: "Why can severity and priority differ for the same incident?",
    options: [
      {
        key: "A",
        label:
          "Priority also considers exposure, business impact, exploitability, and compensating controls — not only technical severity",
      },
      {
        key: "B",
        label: "Priority is always identical to the CVSS-like severity label",
      },
      {
        key: "C",
        label: "Only low-severity issues can be high priority",
      },
      {
        key: "D",
        label: "Priority is assigned randomly by the SIEM",
      },
    ],
    correct: "A",
    explanation:
      "A medium technical finding on a revenue-critical host may outrank a higher-severity issue that is already contained.",
  },
  {
    id: "m4",
    prompt:
      "Why preserve evidence before changing system state when it is safe to do so?",
    options: [
      {
        key: "A",
        label:
          "Containment and recovery actions can destroy volatile clues (processes, connections, configs) needed for timeline and root-cause analysis",
      },
      {
        key: "B",
        label: "Evidence preservation is only for law enforcement dramas",
      },
      {
        key: "C",
        label: "Logs never change once written",
      },
      {
        key: "D",
        label: "You should never contain a compromised account",
      },
    ],
    correct: "A",
    explanation:
      "Safety first if harm is active — but record what you can. Educational SIM-HASH labels illustrate integrity tracking, not real crypto.",
  },
  {
    id: "m5",
    prompt:
      "Repeated SSH failures for a user followed by success from the same IP prove what?",
    options: [
      {
        key: "A",
        label:
          "They warrant investigation and raise suspicion — they do not automatically prove malicious compromise without further evidence",
      },
      {
        key: "B",
        label: "The account is proven owned by an attacker with 100% certainty",
      },
      {
        key: "C",
        label: "Nothing — auth logs are irrelevant",
      },
      {
        key: "D",
        label: "The firewall is misconfigured exclusively",
      },
    ],
    correct: "A",
    explanation:
      "Confidence levels matter. Corroborate with privilege changes, processes, network exposure, and file indicators.",
  },
];

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "f1",
    prompt:
      "You must contain a suspected compromised account. Which approach is most aligned with good IR practice in this lesson?",
    options: [
      {
        key: "A",
        label:
          "Preserve key evidence when safe, disable or lock the account, remove unexpected privileges, and document the decision trade-offs",
      },
      {
        key: "B",
        label: "Immediately delete the account and all logs without notes",
      },
      {
        key: "C",
        label: "Ignore the account until the next annual audit",
      },
      {
        key: "D",
        label: "Only reboot the hypervisor and hope for the best",
      },
    ],
    correct: "A",
    explanation:
      "Containment should reduce risk while preserving enough evidence and operational context to recover responsibly.",
  },
  {
    id: "f2",
    prompt:
      "Restoring from backup without checking integrity and closing without verifying services is:",
    options: [
      {
        key: "A",
        label:
          "An incomplete recovery decision — integrity checks and post-recovery validation should precede closure",
      },
      {
        key: "B",
        label: "The fastest path and always correct",
      },
      {
        key: "C",
        label: "Required by every compliance checklist as the only step",
      },
      {
        key: "D",
        label: "Better than preserving evidence in all cases",
      },
    ],
    correct: "A",
    explanation:
      "Untested restores and unverified services leave residual risk and weak incident closure quality.",
  },
  {
    id: "f3",
    prompt:
      "Isolating a tampered nginx service versus restoring a known-good config — what is true?",
    options: [
      {
        key: "A",
        label:
          "Both can be reasonable; isolation is stronger/faster containment with availability cost, while scoped restore may preserve service if evidence is already safe",
      },
      {
        key: "B",
        label: "Only isolation is ever acceptable",
      },
      {
        key: "C",
        label: "Only restore is ever acceptable",
      },
      {
        key: "D",
        label: "Neither action should be documented",
      },
    ],
    correct: "A",
    explanation:
      "IR decisions involve trade-offs. Explain why you chose containment strength vs availability.",
  },
  {
    id: "f4",
    prompt: "What belongs in a final incident report?",
    options: [
      {
        key: "A",
        label:
          "Title/classification, severity, affected assets, timeline, evidence, containment, eradication/recovery, verification, status, and lessons learned",
      },
      {
        key: "B",
        label: "Only a one-word status: fixed",
      },
      {
        key: "C",
        label: "Raw malware binaries attached for everyone",
      },
      {
        key: "D",
        label: "Personal passwords of all users in plain text",
      },
    ],
    correct: "A",
    explanation:
      "Reports enable accountability, learning, and future prevention — without spreading harm.",
  },
  {
    id: "f5",
    prompt:
      "Chain of custody / evidence integrity in this educational lab means:",
    options: [
      {
        key: "A",
        label:
          "Record sources, timestamps, and simulation integrity labels (SIM-HASH-*) so the investigation trail stays clear — labels are teaching aids, not real cryptographic proofs",
      },
      {
        key: "B",
        label: "You must publish private keys to prove honesty",
      },
      {
        key: "C",
        label: "Evidence should be edited freely without notes",
      },
      {
        key: "D",
        label: "Integrity tracking is irrelevant to incident response",
      },
    ],
    correct: "A",
    explanation:
      "Real programs use controlled handling and cryptographic verification. This course uses clearly labeled simulation identifiers.",
  },
  {
    id: "f6",
    prompt: "Which statement about false positives is most accurate?",
    options: [
      {
        key: "A",
        label:
          "Alerts can be noisy; analysts use confidence levels and corroborating evidence to avoid both missed incidents and unnecessary disruption",
      },
      {
        key: "B",
        label: "Every alert must trigger immediate full host rebuild",
      },
      {
        key: "C",
        label: "False positives never occur on Linux",
      },
      {
        key: "D",
        label: "Confidence levels are unused in professional IR",
      },
    ],
    correct: "A",
    explanation:
      "Good IR balances speed with accuracy — triage reduces wasted containment and missed true positives.",
  },
];

const IR_CHECKLIST = [
  "Confirm authorization and communications plan before responding on real systems",
  "Triage alerts: event vs incident, confidence, and false-positive risk",
  "Identify affected users, services, and systems (scope)",
  "Assess severity and operational priority / business impact",
  "Collect authentication, service, system, config, and network evidence with timestamps",
  "Preserve evidence before destructive changes when operationally safe",
  "Contain: account, service, network source, unexpected listeners — document trade-offs",
  "Eradicate unauthorized changes; restore known-good configuration",
  "Verify backup integrity before restore; rotate affected credentials",
  "Validate services and access controls before closing",
  "Build timeline, write the report, and capture lessons learned",
] as const;

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
  const [revealed, setRevealed] = useState(false);
  const [checkedItems, setCheckedItems] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const score = questions.reduce(
    (sum, q) => sum + (answers[q.id] === q.correct ? 1 : 0),
    0,
  );

  function toggleChecklist(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <ol className="space-y-6">
        {questions.map((q, index) => {
          const selected = answers[q.id];
          const show = revealed && selected;
          const correct = selected === q.correct;
          return (
            <li key={q.id} className="space-y-3">
              <p className="text-foreground text-sm font-medium">
                {index + 1}. {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.key}
                    className={cn(
                      "border-border flex cursor-pointer gap-3 rounded-lg border p-3 text-sm",
                      selected === opt.key && "border-primary/50 bg-primary/5",
                      show &&
                        opt.key === q.correct &&
                        "border-emerald-500/50 bg-emerald-500/5",
                      show &&
                        selected === opt.key &&
                        opt.key !== q.correct &&
                        "border-destructive/40 bg-destructive/5",
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.key}
                      checked={selected === opt.key}
                      disabled={revealed}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))
                      }
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{opt.key}.</span>{" "}
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {show ? (
                <Callout title={correct ? "Correct" : "Review"}>
                  <p>{q.explanation}</p>
                </Callout>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={
            revealed || questions.some((q) => answers[q.id] === undefined)
          }
        >
          Check answers
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAnswers({});
            setRevealed(false);
          }}
        >
          Reset
        </Button>
      </div>

      {revealed ? (
        <p className="text-sm">
          Score:{" "}
          <strong className="text-foreground">
            {score}/{questions.length}
          </strong>{" "}
          (session only — nothing is saved)
        </p>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-foreground font-medium">
              Incident response checklist
            </p>
            <p className="text-muted-foreground text-xs">
              Use on systems you are authorized to defend. Checkboxes stay in
              this browser session only.
            </p>
          </div>
          <ul className="space-y-2">
            {IR_CHECKLIST.map((item, index) => {
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

export function SecurityIncidentResponseKnowledgeCheck() {
  return (
    <div className="space-y-8">
      <QuizBlock
        title="Quick Knowledge Check"
        description="Five questions on events vs incidents, IR phases, severity vs priority, evidence preservation, and auth-log confidence. Selections stay on this page only."
        questions={MID_LESSON_QUESTIONS}
      />
    </div>
  );
}

export function SecurityIncidentResponseQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer covering containment, recovery completeness, trade-offs, reporting, evidence integrity labels, and false positives. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
