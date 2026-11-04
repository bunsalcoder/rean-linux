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
      "How does a security audit differ from a vulnerability scan and a penetration test?",
    options: [
      {
        key: "A",
        label:
          "An audit is a systematic review of policies, configurations, and evidence; a vulnerability scan is automated tool-driven detection; a penetration test actively attempts exploitation",
      },
      {
        key: "B",
        label:
          "All three terms describe the same activity performed by different teams",
      },
      {
        key: "C",
        label: "A penetration test only reviews firewall logs",
      },
      {
        key: "D",
        label: "Vulnerability scans replace the need for audits entirely",
      },
    ],
    correct: "A",
    explanation:
      "Audits review posture and compliance holistically. Scans detect known weaknesses automatically. Pentests actively exploit to prove impact. They complement each other.",
  },
  {
    id: "m2",
    prompt:
      "What is the relationship between a finding, a risk, a recommendation, and a remediation?",
    options: [
      {
        key: "A",
        label:
          "A finding documents an observed weakness; risk is the potential impact and likelihood; a recommendation proposes a fix; remediation is the applied corrective action",
      },
      {
        key: "B",
        label: "A finding automatically fixes itself when documented",
      },
      {
        key: "C",
        label: "Risk and severity are always identical numbers",
      },
      {
        key: "D",
        label: "Recommendations and remediations are the same step",
      },
    ],
    correct: "A",
    explanation:
      "Findings capture evidence. Risk contextualizes impact. Recommendations guide action. Remediation is the verified fix.",
  },
  {
    id: "m3",
    prompt:
      "Why might severity and operational priority differ for the same finding?",
    options: [
      {
        key: "A",
        label:
          "Priority depends on exposure, exploitability, business context, and compensating controls — not just the severity label alone",
      },
      {
        key: "B",
        label: "Severity and priority are always the same value",
      },
      {
        key: "C",
        label: "Priority is assigned randomly by the scanning tool",
      },
      {
        key: "D",
        label: "Only low-severity findings can have high priority",
      },
    ],
    correct: "A",
    explanation:
      "A critical finding behind strong compensating controls may be lower priority than a medium finding directly internet-exposed with no mitigations.",
  },
  {
    id: "m4",
    prompt:
      "When reviewing auth logs, you see repeated failed SSH passwords for 'contractor' from 203.0.113.50 followed by a successful login. What does this prove?",
    options: [
      {
        key: "A",
        label:
          "It warrants investigation — the pattern is suspicious but does not automatically prove compromise without further evidence",
      },
      {
        key: "B",
        label:
          "The account is definitely compromised and should be deleted immediately",
      },
      {
        key: "C",
        label: "Failed passwords always indicate a locked account",
      },
      {
        key: "D",
        label: "Auth logs are unreliable and should be ignored",
      },
    ],
    correct: "A",
    explanation:
      "Log patterns provide indicators for investigation, not automatic proof. The contractor may have fat-fingered their password — or an attacker may have succeeded. Investigation and documentation are the correct next steps.",
  },
  {
    id: "m5",
    prompt: "Why is backup recoverability relevant to a security audit?",
    options: [
      {
        key: "A",
        label:
          "If a security incident requires system restoration, untested backups may fail — auditors verify recovery capability as part of operational resilience",
      },
      {
        key: "B",
        label:
          "Backup verification is only for disaster recovery teams, never security",
      },
      {
        key: "C",
        label: "Security audits only review network configurations",
      },
      {
        key: "D",
        label: "Backups automatically restore themselves during incidents",
      },
    ],
    correct: "A",
    explanation:
      "Operational resilience — including tested recovery capability — is a security concern. An auditor who skips backup verification leaves a gap.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which audit finding would typically receive the highest remediation priority?",
    options: [
      {
        key: "A",
        label:
          "A critical, network-exposed service with a known exploit and available patch (e.g., outdated SSH daemon)",
      },
      {
        key: "B",
        label: "An informational note about unused cron jobs",
      },
      {
        key: "C",
        label:
          "A medium-severity finding on an internal-only tool with strong access controls",
      },
      {
        key: "D",
        label: "A low-severity cosmetic issue in log formatting",
      },
    ],
    correct: "A",
    explanation:
      "Severity, network exposure, exploit availability, and fix availability combine to make this the highest priority. Context matters more than severity labels alone.",
  },
  {
    id: "q2",
    prompt:
      "During an audit, you find a service account has `ALL=(ALL) NOPASSWD: ALL` in sudoers. Why is this a significant finding?",
    options: [
      {
        key: "A",
        label:
          "It grants unrestricted, passwordless root access — a compromised service account becomes full root silently",
      },
      {
        key: "B",
        label: "NOPASSWD entries are the default and expected configuration",
      },
      {
        key: "C",
        label:
          "Service accounts should always have unrestricted sudo for automation",
      },
      {
        key: "D",
        label: "sudoers rules have no effect on security posture",
      },
    ],
    correct: "A",
    explanation:
      "Least privilege means service accounts should only sudo specific commands they need. Unrestricted NOPASSWD ALL is excessive and dangerous.",
  },
  {
    id: "q3",
    prompt:
      "What is the security risk of a database listening on 0.0.0.0 with the firewall allowing inbound connections?",
    options: [
      {
        key: "A",
        label:
          "External attackers can reach the database to attempt brute-force, exploit vulnerabilities, or exfiltrate data",
      },
      {
        key: "B",
        label: "Databases on 0.0.0.0 are automatically encrypted",
      },
      {
        key: "C",
        label: "Firewalls have no effect on database security",
      },
      {
        key: "D",
        label: "Binding to all interfaces prevents localhost connections",
      },
    ],
    correct: "A",
    explanation:
      "Defense in depth requires both bind-address restriction (localhost when possible) and firewall rules to deny unnecessary inbound access.",
  },
  {
    id: "q4",
    prompt:
      "You find a file `/srv/app/secrets.env` with mode 0644. What is the finding?",
    options: [
      {
        key: "A",
        label:
          "The file is world-readable — any local user can read application secrets such as database credentials and API keys",
      },
      {
        key: "B",
        label: "0644 means no one can read the file",
      },
      {
        key: "C",
        label: "Permission modes do not apply to files in /srv",
      },
      {
        key: "D",
        label: "Secrets files should always be world-readable for debugging",
      },
    ],
    correct: "A",
    explanation:
      "Mode 0644 gives owner read-write and everyone else read. Secrets should use 0600 (owner-only read-write) at minimum.",
  },
  {
    id: "q5",
    prompt:
      "An audit report includes both severity and priority for each finding. When might these differ?",
    options: [
      {
        key: "A",
        label:
          "A critical finding behind strong compensating controls may have lower operational priority; a medium finding on an exposed, exploitable service may warrant immediate action",
      },
      {
        key: "B",
        label: "Severity and priority are always identical values",
      },
      {
        key: "C",
        label: "Priority is always lower than severity",
      },
      {
        key: "D",
        label: "Only informational findings can have high priority",
      },
    ],
    correct: "A",
    explanation:
      "Operational context — exposure, compensating controls, business impact, and exploit availability — determines priority independently of the severity classification.",
  },
  {
    id: "q6",
    prompt:
      "Why should auditors verify that backups can be successfully restored?",
    options: [
      {
        key: "A",
        label:
          "Untested backups may be corrupt, incomplete, or incompatible — verification ensures recovery capability before an incident demands it",
      },
      {
        key: "B",
        label: "Backup existence alone guarantees recoverability",
      },
      {
        key: "C",
        label: "Only developers need to test restores",
      },
      {
        key: "D",
        label: "Backup verification is outside the scope of security auditing",
      },
    ],
    correct: "A",
    explanation:
      "A backup that cannot be restored is not a backup — it is a false sense of security. Audit verification includes recovery testing.",
  },
] as const;

/** Finding-classification exercises — severity, priority, and category judgment. */
const CLASSIFICATION_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "c1",
    prompt:
      "Classify this finding: contractor is in the sudo group without a documented operational need.",
    options: [
      {
        key: "A",
        label:
          "Account-security finding — typically high severity with immediate or high priority until membership is justified or removed",
      },
      {
        key: "B",
        label: "Informational package finding with no privilege impact",
      },
      {
        key: "C",
        label: "Backup readiness finding only",
      },
      {
        key: "D",
        label: "Not a finding because sudo membership is always required",
      },
    ],
    correct: "A",
    explanation:
      "Unnecessary administrative group membership is an account/privilege finding. Severity is usually high because compromise yields broad access.",
  },
  {
    id: "c2",
    prompt:
      "Classify this finding: /srv/app/secrets.env is mode 0644 with an other:r ACL.",
    options: [
      {
        key: "A",
        label:
          "Permissions finding — critical severity when secrets are exposed to every local user",
      },
      {
        key: "B",
        label: "SSH configuration finding",
      },
      {
        key: "C",
        label: "Informational note with no confidentiality impact",
      },
      {
        key: "D",
        label: "Package advisory finding",
      },
    ],
    correct: "A",
    explanation:
      "World-readable secrets are a permissions/ownership finding. Confidentiality exposure of credentials is typically critical.",
  },
  {
    id: "c3",
    prompt: "Classify this finding: deploy has sudo ALL=(ALL) NOPASSWD: ALL.",
    options: [
      {
        key: "A",
        label:
          "Privilege-management finding — high severity because a compromised service identity becomes silent root",
      },
      {
        key: "B",
        label: "Storage finding about disk usage",
      },
      {
        key: "C",
        label: "Low-severity cosmetic sudoers formatting issue",
      },
      {
        key: "D",
        label: "Not a finding because NOPASSWD is required for all services",
      },
    ],
    correct: "A",
    explanation:
      "Unrestricted passwordless sudo violates least privilege and belongs under privilege management with high severity.",
  },
  {
    id: "c4",
    prompt:
      "Classify this finding: PostgreSQL listens on 0.0.0.0:5432 and UFW allows 5432/tcp.",
    options: [
      {
        key: "A",
        label:
          "Firewall/network exposure finding — critical when a database is unnecessarily reachable",
      },
      {
        key: "B",
        label: "Log retention finding only",
      },
      {
        key: "C",
        label: "Informational SSH key finding",
      },
      {
        key: "D",
        label: "Account aging policy finding",
      },
    ],
    correct: "A",
    explanation:
      "Listening sockets plus firewall allow rules describe network exposure. A public database listener is typically critical.",
  },
  {
    id: "c5",
    prompt:
      "Classify this finding: auth logs show repeated failed passwords then a successful contractor login from the same IP.",
    options: [
      {
        key: "A",
        label:
          "Logs/authentication finding — high severity investigation item; evidence warrants review but does not by itself prove compromise",
      },
      {
        key: "B",
        label:
          "Proven malware infection that requires immediate disk wipe only",
      },
      {
        key: "C",
        label: "Package repository trust finding",
      },
      {
        key: "D",
        label: "Not worth documenting because logs are never useful",
      },
    ],
    correct: "A",
    explanation:
      "Suspicious authentication patterns are log findings. Classify and investigate — do not treat a single log sequence as automatic proof of compromise.",
  },
] as const;

const AUDIT_CHECKLIST = [
  "Review user accounts and group memberships for unauthorized privileges",
  "Check sensitive file permissions and ACLs for excessive access",
  "Audit sudo policies for least privilege compliance",
  "Verify SSH configuration (password auth, root login, key requirements)",
  "Inspect listening services and firewall rules for unnecessary exposure",
  "Check for outdated packages with known security advisories",
  "Review authentication logs for suspicious activity patterns",
  "Verify backup existence, recency, and restore capability",
  "Document findings with severity, priority, evidence, and recommendations",
  "Track remediation status and verify corrective actions",
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
            You scored {score} of {questions.length}. Revisit audit methodology,
            finding classification, severity vs priority, log interpretation,
            and backup verification if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Security Audit Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to audit. Checkboxes stay
              in this browser session only — nothing is persisted.
            </p>
          </div>
          <ul className="space-y-2">
            {AUDIT_CHECKLIST.map((item, index) => {
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

export function SecurityAuditingKnowledgeCheck() {
  return (
    <div className="space-y-8">
      <QuizBlock
        title="Quick Knowledge Check"
        description="Five questions on audit methodology, finding vs risk vs recommendation, severity vs priority, log interpretation, and backup verification. Selections stay on this page only."
        questions={MID_LESSON_QUESTIONS}
      />
      <QuizBlock
        title="Finding Classification Practice"
        description="Classify five realistic audit observations by category and severity. Prefer evidence-based judgment over jumping to remediation."
        questions={CLASSIFICATION_QUESTIONS}
      />
    </div>
  );
}

export function SecurityAuditingQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question covering finding prioritization, sudo policies, network exposure, file permissions, severity vs priority, and backup verification. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
