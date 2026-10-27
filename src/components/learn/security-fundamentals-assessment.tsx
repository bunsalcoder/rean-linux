"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getSecurityFinding,
  isFindingRemediated,
  listOpenFindings,
  SECURITY_FINDINGS,
  type SecurityCategory,
  type SecurityFindingId,
  type SecuritySeverity,
  type SimulatedSecurityState,
} from "@/lib/simulate-security-fundamentals";
import { cn } from "@/lib/utils";

type AssessmentStep =
  "overview" | "inspect" | "classify" | "remediate" | "recheck" | "complete";

type ClassificationAnswers = {
  principle: string | null;
  severity: SecuritySeverity | null;
  action: string | null;
};

const FINDING_ORDER: readonly SecurityFindingId[] = [
  "permissive-file",
  "unnecessary-service",
  "excessive-privileges",
  "open-firewall-port",
  "pending-updates",
  "ssh-password-auth",
  "unverified-backup",
  "log-warning",
];

const PRINCIPLE_OPTIONS: readonly {
  key: string;
  label: string;
  matches: readonly SecurityFindingId[];
}[] = [
  {
    key: "attack-surface",
    label: "Attack surface — unnecessary services expand risk",
    matches: ["unnecessary-service"],
  },
  {
    key: "least-privilege",
    label: "Least privilege — access should match job need",
    matches: ["excessive-privileges", "permissive-file"],
  },
  {
    key: "authentication",
    label: "Authentication strength — how identity is proven",
    matches: ["ssh-password-auth"],
  },
  {
    key: "network",
    label: "Network exposure — limit reachable ports",
    matches: ["open-firewall-port"],
  },
  {
    key: "vulnerability",
    label: "Vulnerability management — patch known weaknesses",
    matches: ["pending-updates"],
  },
  {
    key: "availability",
    label: "Availability — verified backups support recovery",
    matches: ["unverified-backup"],
  },
  {
    key: "monitoring",
    label: "Monitoring — logs are clues, not automatic proof of breach",
    matches: ["log-warning"],
  },
];

const ACTION_BY_FINDING: Record<
  SecurityFindingId,
  readonly { key: string; label: string; correct: boolean }[]
> = {
  "unnecessary-service": [
    {
      key: "A",
      label: "Stop and disable the unused telnet service",
      correct: true,
    },
    {
      key: "B",
      label: "Expose telnet on more interfaces for convenience",
      correct: false,
    },
    {
      key: "C",
      label: "Ignore it because SSH is also running",
      correct: false,
    },
  ],
  "excessive-privileges": [
    {
      key: "A",
      label: "Remove contractor from the sudo group",
      correct: true,
    },
    {
      key: "B",
      label: "Add every user to sudo for faster support",
      correct: false,
    },
    {
      key: "C",
      label: "Delete the contractor account without review",
      correct: false,
    },
  ],
  "permissive-file": [
    {
      key: "A",
      label: "chmod 600 /opt/app/secrets.env",
      correct: true,
    },
    {
      key: "B",
      label: "chmod 777 /opt/app/secrets.env so apps never fail",
      correct: false,
    },
    {
      key: "C",
      label: "Publish the file contents to the team chat",
      correct: false,
    },
  ],
  "ssh-password-auth": [
    {
      key: "A",
      label: "Disable PasswordAuthentication after confirming key access",
      correct: true,
    },
    {
      key: "B",
      label: "Enable root password login for emergencies",
      correct: false,
    },
    {
      key: "C",
      label: "Turn off SSH entirely on a remote-only host",
      correct: false,
    },
  ],
  "open-firewall-port": [
    {
      key: "A",
      label: "Remove the unnecessary allow rule for 8080/tcp",
      correct: true,
    },
    {
      key: "B",
      label: "Allow all ports so monitoring never fails",
      correct: false,
    },
    {
      key: "C",
      label: "Disable the firewall completely",
      correct: false,
    },
  ],
  "pending-updates": [
    {
      key: "A",
      label: "Apply the pending security updates after a brief review",
      correct: true,
    },
    {
      key: "B",
      label: "Postpone all security updates indefinitely",
      correct: false,
    },
    {
      key: "C",
      label: "Disable the package manager",
      correct: false,
    },
  ],
  "unverified-backup": [
    {
      key: "A",
      label: "Verify the backup archive can be restored",
      correct: true,
    },
    {
      key: "B",
      label: "Assume the file size alone proves restore works",
      correct: false,
    },
    {
      key: "C",
      label: "Delete the only backup to free disk space",
      correct: false,
    },
  ],
  "log-warning": [
    {
      key: "A",
      label:
        "Review the failed attempts, keep monitoring, and avoid declaring a compromise from this alone",
      correct: true,
    },
    {
      key: "B",
      label: "Treat three failed attempts as confirmed host takeover",
      correct: false,
    },
    {
      key: "C",
      label: "Delete the logs immediately so the warning disappears",
      correct: false,
    },
  ],
};

const REMEDIATION_COMMAND: Partial<Record<SecurityFindingId, string>> = {
  "unnecessary-service": "sudo systemctl stop telnet",
  "excessive-privileges": "sudo gpasswd -d contractor sudo",
  "permissive-file": "chmod 600 /opt/app/secrets.env",
  "ssh-password-auth": "set-ssh PasswordAuthentication no",
  "open-firewall-port": "sudo ufw delete allow 8080/tcp",
  "pending-updates": "sudo apt upgrade",
  "unverified-backup": "verify-backup /var/backups/app-daily.tar.gz",
};

const ASSESSMENT_SUGGESTIONS = [
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "systemctl status telnet", label: "status telnet" },
  { command: "id contractor", label: "id contractor" },
  { command: "ls -l /opt/app/secrets.env", label: "ls secrets" },
  { command: "cat /etc/ssh/sshd_config", label: "sshd_config" },
  { command: "sudo ufw status", label: "ufw status" },
  { command: "apt list --upgradable", label: "upgradable" },
  { command: "journalctl -u ssh", label: "journal ssh" },
  { command: "ls -l /var/backups/app-daily.tar.gz", label: "ls backup" },
  { command: "help", label: "help" },
] as const;

function categoryLabel(category: SecurityCategory): string {
  switch (category) {
    case "attack-surface":
      return "Attack surface";
    case "privilege":
      return "Privilege";
    case "permissions":
      return "Permissions";
    case "authentication":
      return "Authentication";
    case "network":
      return "Network";
    case "vulnerability":
      return "Vulnerability";
    case "availability":
      return "Availability";
    case "monitoring":
      return "Monitoring";
  }
}

function severityRank(severity: SecuritySeverity): number {
  switch (severity) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
  }
}

function initialAnswers(): ClassificationAnswers {
  return { principle: null, severity: null, action: null };
}

export function SecurityFundamentalsAssessment() {
  const [step, setStep] = useState<AssessmentStep>("overview");
  const [findingIndex, setFindingIndex] = useState(0);
  const [answers, setAnswers] = useState<ClassificationAnswers>(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [completedFindings, setCompletedFindings] = useState<
    ReadonlySet<SecurityFindingId>
  >(() => new Set());
  const [remediatedReady, setRemediatedReady] = useState(false);
  const [securityState, setSecurityState] =
    useState<SimulatedSecurityState | null>(null);

  const findingId = FINDING_ORDER[findingIndex]!;
  const finding = getSecurityFinding(findingId);
  const principleCorrect =
    PRINCIPLE_OPTIONS.find(
      (option) => option.key === answers.principle,
    )?.matches.includes(findingId) ?? false;
  const severityCorrect = answers.severity === finding.severity;
  const actionCorrect =
    ACTION_BY_FINDING[findingId].find((option) => option.key === answers.action)
      ?.correct ?? false;
  const classificationOk = principleCorrect && severityCorrect && actionCorrect;
  const openCount = securityState
    ? listOpenFindings(securityState).filter(
        (item) => item.id !== "log-warning",
      ).length
    : SECURITY_FINDINGS.filter((item) => item.id !== "log-warning").length;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setRemediatedReady(findingId === "log-warning");
    setSecurityState(null);
  }

  function startFinding(index: number) {
    setFindingIndex(index);
    setAnswers(initialAnswers());
    setSubmitted(false);
    setInspected(false);
    setRemediatedReady(FINDING_ORDER[index] === "log-warning");
    setTerminalKey((value) => value + 1);
    setSecurityState(null);
    setStep("inspect");
  }

  function goNextFinding() {
    setCompletedFindings((prev) => {
      const next = new Set(prev);
      next.add(findingId);
      return next;
    });
    const nextIndex = findingIndex + 1;
    if (nextIndex >= FINDING_ORDER.length) {
      setStep("complete");
      return;
    }
    startFinding(nextIndex);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Interactive Security Assessment
        </h3>
        <p className="text-sm">
          Review a fictional Linux server. Inspect evidence before you decide
          severity or remediation. An isolated finding is rarely proof of
          compromise — prioritize by impact and likelihood, then recheck.
        </p>
        <Callout title="Learning safety">
          <p>
            This assessment is entirely simulated. It never scans real hosts,
            never runs real security tools, and never changes your machine.
          </p>
        </Callout>
      </div>

      {step === "overview" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Initial assessment snapshot
            </p>
            <p className="text-muted-foreground text-sm">
              Eight findings were flagged. Titles are intentionally high-level —
              inspect evidence before assuming root cause or priority.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {FINDING_ORDER.map((id) => {
                const item = getSecurityFinding(id);
                return (
                  <li key={id}>
                    <span className="text-foreground font-medium">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {categoryLabel(item.category)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="text-muted-foreground text-sm">
              Suggested priority order after a quick triage: critical and high
              confidentiality/exposure issues first, then authentication
              hardening, then availability and monitoring follow-ups.
            </p>
          </div>
          <Button type="button" onClick={() => startFinding(0)}>
            Begin first finding
          </Button>
        </div>
      ) : null}

      {step !== "overview" && step !== "complete" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Finding {findingIndex + 1} of {FINDING_ORDER.length}:{" "}
              {finding.title}
            </p>
            <p className="text-muted-foreground text-sm">
              Category hint: {categoryLabel(finding.category)}. Evidence to
              inspect:{" "}
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {finding.evidenceHint}
              </code>
            </p>
            <p className="text-sm">
              Progress: {completedFindings.size} reviewed · open remediation
              items after changes depend on your terminal state
              {securityState ? ` (${openCount} still open)` : ""}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={step === "inspect" ? "default" : "outline"}
              onClick={() => setStep("inspect")}
            >
              1. Inspect
            </Button>
            <Button
              type="button"
              variant={step === "classify" ? "default" : "outline"}
              disabled={!inspected}
              onClick={() => setStep("classify")}
            >
              2. Classify
            </Button>
            <Button
              type="button"
              variant={step === "remediate" ? "default" : "outline"}
              disabled={!submitted || !classificationOk}
              onClick={() => setStep("remediate")}
            >
              3. Remediate
            </Button>
            <Button
              type="button"
              variant={step === "recheck" ? "default" : "outline"}
              disabled={
                findingId === "log-warning"
                  ? !(submitted && classificationOk)
                  : !remediatedReady
              }
              onClick={() => setStep("recheck")}
            >
              4. Recheck
            </Button>
            <Button type="button" variant="outline" onClick={resetTerminal}>
              Reset terminal
            </Button>
          </div>

          {(step === "inspect" ||
            step === "remediate" ||
            step === "recheck") && (
            <TerminalSimulator
              key={`${findingId}-${terminalKey}`}
              securityFundamentals="full-assessment"
              suggestions={
                step === "remediate" && REMEDIATION_COMMAND[findingId]
                  ? [
                      {
                        command: REMEDIATION_COMMAND[findingId]!,
                        label: "remediate",
                      },
                      ...ASSESSMENT_SUGGESTIONS,
                    ]
                  : ASSESSMENT_SUGGESTIONS
              }
              suggestionsLabel="Diagnostic commands"
              onSecurityFundamentalsChange={(state) => {
                setSecurityState(state);
                if (findingId === "log-warning") {
                  setRemediatedReady(true);
                  return;
                }
                setRemediatedReady(isFindingRemediated(state, findingId));
              }}
              onCommandRun={() => setInspected(true)}
            />
          )}

          {step === "inspect" ? (
            <div className="space-y-3">
              <p className="text-sm">
                Run at least one diagnostic command, then continue to
                classification. Do not assume root cause from the title alone.
              </p>
              <Button
                type="button"
                disabled={!inspected}
                onClick={() => setStep("classify")}
              >
                Continue to classification
              </Button>
            </div>
          ) : null}

          {step === "classify" ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-foreground font-medium">
                  Which security principle fits best?
                </p>
                <ul className="space-y-2">
                  {PRINCIPLE_OPTIONS.map((option) => (
                    <li key={option.key}>
                      <button
                        type="button"
                        disabled={submitted && classificationOk}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            principle: option.key,
                          }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          answers.principle === option.key &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          submitted &&
                            answers.principle === option.key &&
                            principleCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.principle === option.key &&
                            !principleCorrect &&
                            "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-foreground font-medium">
                  Choose severity / priority
                </p>
                <p className="text-muted-foreground text-sm">
                  Critical and high issues usually outrank low-priority
                  improvements. A log warning is not the same as a confirmed
                  incident.
                </p>
                <ul className="space-y-2">
                  {(
                    [
                      "critical",
                      "high",
                      "medium",
                      "low",
                    ] as const satisfies readonly SecuritySeverity[]
                  ).map((severity) => (
                    <li key={severity}>
                      <button
                        type="button"
                        disabled={submitted && classificationOk}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, severity }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm capitalize transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          answers.severity === severity &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          submitted &&
                            answers.severity === severity &&
                            severityCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.severity === severity &&
                            !severityCorrect &&
                            "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        {severity}
                        {severity === finding.severity
                          ? ""
                          : severityRank(severity) <
                              severityRank(finding.severity)
                            ? " (likely too urgent for this finding)"
                            : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-foreground font-medium">
                  Choose the best corrective action
                </p>
                <ul className="space-y-2">
                  {ACTION_BY_FINDING[findingId].map((option) => (
                    <li key={option.key}>
                      <button
                        type="button"
                        disabled={submitted && classificationOk}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            action: option.key,
                          }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          answers.action === option.key &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          submitted &&
                            answers.action === option.key &&
                            actionCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.action === option.key &&
                            !actionCorrect &&
                            "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        <span className="text-muted-foreground font-mono text-xs font-medium">
                          {option.key}.
                        </span>
                        <span>{option.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {!submitted || !classificationOk ? (
                  <Button
                    type="button"
                    disabled={
                      !answers.principle || !answers.severity || !answers.action
                    }
                    onClick={() => setSubmitted(true)}
                  >
                    Check classification
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setStep("remediate")}>
                    Continue to remediation
                  </Button>
                )}
                {submitted && !classificationOk ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setAnswers(initialAnswers());
                    }}
                  >
                    Retry
                  </Button>
                ) : null}
              </div>

              {submitted ? (
                <Callout
                  title={
                    classificationOk
                      ? "Classification looks solid"
                      : "Not quite"
                  }
                >
                  <p>
                    {classificationOk
                      ? `${finding.principle} Suggested lab severity: ${finding.severity}.`
                      : "Re-check the evidence and compare impact (data exposure, remote reachability) with likelihood before prioritizing."}
                  </p>
                </Callout>
              ) : null}
            </div>
          ) : null}

          {step === "remediate" ? (
            <div className="space-y-3">
              {findingId === "log-warning" ? (
                <>
                  <p className="text-sm">
                    No destructive change is required. Failed login attempts are
                    evidence to monitor — not automatic proof that the host was
                    compromised.
                  </p>
                  <Button type="button" onClick={() => setStep("recheck")}>
                    Continue to recheck notes
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Apply the simulated remediation, then confirm the evidence
                    changed. Recommended command:{" "}
                    <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                      {REMEDIATION_COMMAND[findingId]}
                    </code>
                  </p>
                  {findingId === "unnecessary-service" ? (
                    <p className="text-muted-foreground text-sm">
                      After stopping telnet, also run{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                        sudo systemctl disable telnet
                      </code>{" "}
                      so it stays off after reboot.
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    disabled={!remediatedReady}
                    onClick={() => setStep("recheck")}
                  >
                    Continue to recheck
                  </Button>
                </>
              )}
            </div>
          ) : null}

          {step === "recheck" ? (
            <div className="space-y-3">
              <Callout title="Recheck">
                <p>
                  {findingId === "log-warning"
                    ? "Keep the journal entry as historical context. Pair monitoring with stronger authentication and network controls — layered defense."
                    : remediatedReady
                      ? `Evidence should now reflect the fix. Reminder: ${finding.remediation}`
                      : "Re-run the diagnostic commands until the finding is cleared in this simulation."}
                </p>
              </Callout>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={findingId !== "log-warning" && !remediatedReady}
                  onClick={goNextFinding}
                >
                  {findingIndex + 1 >= FINDING_ORDER.length
                    ? "Finish assessment"
                    : "Next finding"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <div className="space-y-4">
          <Callout title="Assessment complete">
            <p>
              You practiced inspecting evidence, separating critical issues from
              low-priority improvements, distinguishing authentication from
              authorization concerns, and remembering that logs and backups
              support detection and recovery — they do not replace prevention.
            </p>
          </Callout>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCompletedFindings(new Set());
              setFindingIndex(0);
              setAnswers(initialAnswers());
              setSubmitted(false);
              setInspected(false);
              setRemediatedReady(false);
              setTerminalKey((value) => value + 1);
              setSecurityState(null);
              setStep("overview");
            }}
          >
            Restart assessment
          </Button>
        </div>
      ) : null}
    </div>
  );
}
