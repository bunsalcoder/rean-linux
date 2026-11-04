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
      "What is the difference between a listening service and an externally reachable service?",
    options: [
      {
        key: "A",
        label:
          "Listening means a socket is bound on the host; externally reachable means remote traffic can complete a connection after routing and firewall policy",
      },
      {
        key: "B",
        label: "They are identical — every listener is always public",
      },
      {
        key: "C",
        label: "Reachable services never listen on any port",
      },
      {
        key: "D",
        label: "Only UDP services can listen; only TCP can be reachable",
      },
    ],
    correct: "A",
    explanation:
      "Assessment separates socket state from path/policy. Localhost and filtered listeners may not be publicly reachable.",
  },
  {
    id: "m2",
    prompt:
      "Why prefer a default-deny inbound policy on an internet-facing host?",
    options: [
      {
        key: "A",
        label:
          "Unmatched inbound traffic is blocked, so only explicitly allowed services remain reachable — shrinking attack surface",
      },
      {
        key: "B",
        label: "It automatically patches all application vulnerabilities",
      },
      {
        key: "C",
        label: "It disables SSH permanently by design",
      },
      {
        key: "D",
        label: "Default-deny inbound encrypts every packet on the LAN",
      },
    ],
    correct: "A",
    explanation:
      "Default-deny inbound is least privilege for unmatched traffic. You still add explicit allows for required services such as SSH and HTTPS.",
  },
  {
    id: "m3",
    prompt:
      "A firewall allows TCP port 5353, but the service listens on UDP 5353. What happens under default-deny inbound?",
    options: [
      {
        key: "A",
        label:
          "UDP traffic is not covered by the TCP rule and is denied unless a UDP allow (or other matching path) exists",
      },
      {
        key: "B",
        label: "TCP allows automatically cover UDP on the same number",
      },
      {
        key: "C",
        label: "The service stops listening until TCP is removed",
      },
      {
        key: "D",
        label: "Default-deny only applies to outbound packets",
      },
    ],
    correct: "A",
    explanation:
      "Protocols are separate. Matching the wrong protocol is a common hardening mistake.",
  },
] as const;

const FINAL_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which statement best describes network exposure for a hardened host?",
    options: [
      {
        key: "A",
        label:
          "Only necessary services should be reachable from each trust boundary; unnecessary listeners and public allows increase attack surface",
      },
      {
        key: "B",
        label:
          "Every open port should be reachable from Anywhere for convenience",
      },
      {
        key: "C",
        label: "Firewalls make service authentication unnecessary",
      },
      {
        key: "D",
        label: "Localhost listeners are always internet-facing",
      },
    ],
    correct: "A",
    explanation:
      "Least privilege means matching reachability to need — public web fronts differ from internal databases.",
  },
  {
    id: "q2",
    prompt:
      "Before enabling a restrictive inbound firewall on a remote server, what should you ensure?",
    options: [
      {
        key: "A",
        label:
          "Required administrative access (typically SSH on 22/tcp) is explicitly allowed and a recovery path exists",
      },
      {
        key: "B",
        label: "All database ports are allowed from Anywhere",
      },
      {
        key: "C",
        label: "The firewall is disabled forever after the first rule",
      },
      {
        key: "D",
        label: "Only UDP rules are present",
      },
    ],
    correct: "A",
    explanation:
      "Locking out SSH while applying default-deny is a classic operational failure. Preserve admin access first.",
  },
  {
    id: "q3",
    prompt:
      "Why restrict a database port such as 5432/tcp to an internal CIDR instead of Anywhere?",
    options: [
      {
        key: "A",
        label:
          "Public database exposure is rarely required and greatly expands who can attempt attacks against a sensitive service",
      },
      {
        key: "B",
        label: "Internal CIDRs disable encryption automatically",
      },
      {
        key: "C",
        label: "Anywhere allows are ignored by UFW",
      },
      {
        key: "D",
        label: "Databases cannot listen unless they are public",
      },
    ],
    correct: "A",
    explanation:
      "Source restrictions express least privilege. Pair them with strong authentication and updates.",
  },
  {
    id: "q4",
    prompt: "What does a default-allow outbound policy typically mean?",
    options: [
      {
        key: "A",
        label:
          "Unmatched outbound connections are permitted — convenient for updates and client apps, but egress can be tightened later if needed",
      },
      {
        key: "B",
        label: "All inbound traffic is permitted",
      },
      {
        key: "C",
        label: "No packets can leave the host",
      },
      {
        key: "D",
        label: "SSH must use UDP only",
      },
    ],
    correct: "A",
    explanation:
      "Many hosts keep allow outgoing while denying unmatched inbound. Stricter egress needs planned allows for DNS, updates, and APIs.",
  },
  {
    id: "q5",
    prompt:
      "A service listens on TCP 8080 and the firewall is disabled. What is the simulated reachability outcome for a remote client?",
    options: [
      {
        key: "A",
        label:
          "Filtering rules are not enforced while disabled, so a listening service can be reachable until policy is enabled again",
      },
      {
        key: "B",
        label: "Disabled firewalls still apply every deny rule",
      },
      {
        key: "C",
        label: "Listening sockets disappear when UFW is inactive",
      },
      {
        key: "D",
        label: "Only localhost can ever connect when UFW is off",
      },
    ],
    correct: "A",
    explanation:
      "Disabled firewalls do not filter. Listeners and policy are independent layers — turning filtering off increases exposure.",
  },
  {
    id: "q6",
    prompt:
      "Which choice best reflects least-privilege network access for an internal-only application on 8080/tcp?",
    options: [
      {
        key: "A",
        label:
          "Allow 8080/tcp only from the internal network that needs it; keep unrelated public ports limited to intentional services",
      },
      {
        key: "B",
        label: "Allow 8080/tcp from Anywhere and disable authentication",
      },
      {
        key: "C",
        label: "Replace service hardening with firewall rules alone",
      },
      {
        key: "D",
        label: "Open every high port so applications never fail",
      },
    ],
    correct: "A",
    explanation:
      "Least privilege pairs narrow firewall rules with proper service security — neither replaces the other.",
  },
] as const;

const FIREWALL_HARDENING_CHECKLIST = [
  "Inventory listening services and intended audiences (public, internal, localhost)",
  "Prefer default-deny inbound on internet-facing hosts",
  "Allow required SSH access before enabling restrictive filtering",
  "Keep a recovery console or out-of-band session when changing remote firewalls",
  "Allow only necessary public services (often 80/tcp and 443/tcp for web)",
  "Restrict databases and internal apps to trusted source networks",
  "Match TCP and UDP rules to the protocol each service actually uses",
  "Review outbound needs before applying default-deny egress",
  "Verify reachability separately from listening state after changes",
  "Remember firewalls are one layer — continue hardening services and patching",
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
            You scored {score} of {questions.length}. Revisit network exposure,
            default policies, inbound/outbound rules, TCP/UDP matching, and
            least privilege if any answers were off.
          </p>
        </Callout>
      ) : null}

      {includeChecklist ? (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-4 sm:p-5">
          <div className="space-y-2">
            <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
              Firewall Hardening Checklist
            </h3>
            <p className="text-muted-foreground text-sm">
              Use this on systems you are authorized to administer. Prefer
              allowing SSH before enabling restrictive inbound policy.
              Checkboxes stay in this browser session only.
            </p>
          </div>
          <ul className="space-y-2">
            {FIREWALL_HARDENING_CHECKLIST.map((item, index) => {
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

export function SecurityFirewallHardeningKnowledgeCheck() {
  return (
    <QuizBlock
      title="Quick Knowledge Check"
      description="Three short questions on exposure, default-deny inbound, and TCP/UDP separation. Selections stay on this page only."
      questions={MID_LESSON_QUESTIONS}
    />
  );
}

export function SecurityFirewallHardeningQuiz() {
  return (
    <QuizBlock
      title="Final Knowledge Check"
      description="Choose the best answer for each question covering network exposure, default policies, inbound/outbound rules, TCP/UDP, and least privilege. Nothing is saved."
      questions={FINAL_QUESTIONS}
      includeChecklist
    />
  );
}
