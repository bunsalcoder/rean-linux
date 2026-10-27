"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  ACCESS_FINDINGS,
  getAccessFinding,
  isAccessFindingRemediated,
  listOpenAccessFindings,
  type AccessFindingId,
  type AccessRiskLevel,
  type SimulatedAccessControlState,
} from "@/lib/simulate-security-access-control";
import { cn } from "@/lib/utils";

type AssessmentStep =
  "overview" | "inspect" | "classify" | "remediate" | "recheck" | "complete";

type ClassificationAnswers = {
  risk: AccessRiskLevel | null;
  why: string | null;
  action: string | null;
};

const FINDING_ORDER: readonly AccessFindingId[] = [
  "config-world-readable",
  "deploy-script-writable",
  "deploy-in-sudo",
  "backup-interactive-shell",
  "shared-world-writable",
];

const WHY_OPTIONS: readonly {
  key: string;
  label: string;
  matches: readonly AccessFindingId[];
}[] = [
  {
    key: "confidentiality",
    label: "Sensitive data is readable by identities that do not need it",
    matches: ["config-world-readable"],
  },
  {
    key: "integrity-script",
    label: "An unintended group can modify a privileged operational script",
    matches: ["deploy-script-writable"],
  },
  {
    key: "excess-admin",
    label: "Administrative group membership exceeds the account’s role",
    matches: ["deploy-in-sudo"],
  },
  {
    key: "service-interactive",
    label:
      "A service identity is usable for routine interactive administration",
    matches: ["backup-interactive-shell"],
  },
  {
    key: "shared-integrity",
    label: "Shared content can be overwritten by any local user",
    matches: ["shared-world-writable"],
  },
];

const ACTION_BY_FINDING: Record<
  AccessFindingId,
  readonly { key: string; label: string; correct: boolean }[]
> = {
  "config-world-readable": [
    {
      key: "A",
      label: "chmod 640 /srv/app/config.yml (keep owner/group read)",
      correct: true,
    },
    {
      key: "B",
      label: "chmod 777 /srv/app/config.yml so apps never fail",
      correct: false,
    },
    {
      key: "C",
      label: "Delete the config without checking who needs it",
      correct: false,
    },
  ],
  "deploy-script-writable": [
    {
      key: "A",
      label: "chgrp deployers and chmod 750 on deploy.sh",
      correct: true,
    },
    {
      key: "B",
      label: "Add analysts to sudo so they can deploy anything",
      correct: false,
    },
    {
      key: "C",
      label: "chmod 000 and hope deployments still work",
      correct: false,
    },
  ],
  "deploy-in-sudo": [
    {
      key: "A",
      label:
        "Remove deploy from sudo after confirming deployers covers the role",
      correct: true,
    },
    {
      key: "B",
      label: "Add every service account to sudo for convenience",
      correct: false,
    },
    {
      key: "C",
      label: "Delete deploy without reviewing deployment jobs",
      correct: false,
    },
  ],
  "backup-interactive-shell": [
    {
      key: "A",
      label: "Set a non-interactive shell for backup (nologin)",
      correct: true,
    },
    {
      key: "B",
      label: "Put backup in sudo so restores are faster",
      correct: false,
    },
    {
      key: "C",
      label: "Share the backup password with the whole team",
      correct: false,
    },
  ],
  "shared-world-writable": [
    {
      key: "A",
      label: "chmod 640 /tmp/shared-report.txt",
      correct: true,
    },
    {
      key: "B",
      label: "Leave 0666 because /tmp is always world-writable for files",
      correct: false,
    },
    {
      key: "C",
      label: "Remove owner read so nobody can open the report",
      correct: false,
    },
  ],
};

const REMEDIATION_COMMAND: Record<AccessFindingId, string> = {
  "config-world-readable": "chmod 640 /srv/app/config.yml",
  "deploy-script-writable": "sudo chgrp deployers /srv/app/deploy.sh",
  "deploy-in-sudo": "sudo gpasswd -d deploy sudo",
  "backup-interactive-shell": "set-shell backup /usr/sbin/nologin",
  "shared-world-writable": "chmod 640 /tmp/shared-report.txt",
};

const ASSESSMENT_SUGGESTIONS = [
  { command: "access-review", label: "access-review" },
  { command: "id deploy", label: "id deploy" },
  { command: "getent passwd backup", label: "passwd backup" },
  { command: "getent group sudo", label: "group sudo" },
  { command: "ls -l /srv/app/config.yml", label: "ls config" },
  { command: "ls -l /srv/app/deploy.sh", label: "ls deploy.sh" },
  { command: "ls -l /tmp/shared-report.txt", label: "ls shared" },
  { command: "namei -l /srv/app/deploy.sh", label: "namei" },
  { command: "help", label: "help" },
] as const;

function riskRank(risk: AccessRiskLevel): number {
  switch (risk) {
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
  return { risk: null, why: null, action: null };
}

export function SecurityAccessControlAssessment() {
  const [step, setStep] = useState<AssessmentStep>("overview");
  const [findingIndex, setFindingIndex] = useState(0);
  const [answers, setAnswers] = useState<ClassificationAnswers>(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [completedFindings, setCompletedFindings] = useState<
    ReadonlySet<AccessFindingId>
  >(() => new Set());
  const [remediatedReady, setRemediatedReady] = useState(false);
  const [accessState, setAccessState] =
    useState<SimulatedAccessControlState | null>(null);

  const findingId = FINDING_ORDER[findingIndex]!;
  const finding = getAccessFinding(findingId);
  const riskCorrect = answers.risk === finding.risk;
  const whyCorrect =
    WHY_OPTIONS.find((option) => option.key === answers.why)?.matches.includes(
      findingId,
    ) ?? false;
  const actionCorrect =
    ACTION_BY_FINDING[findingId].find((option) => option.key === answers.action)
      ?.correct ?? false;
  const classificationOk = riskCorrect && whyCorrect && actionCorrect;
  const openCount = accessState
    ? listOpenAccessFindings(accessState).length
    : ACCESS_FINDINGS.length;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setRemediatedReady(false);
    setAccessState(null);
  }

  function startFinding(index: number) {
    setFindingIndex(index);
    setAnswers(initialAnswers());
    setSubmitted(false);
    setInspected(false);
    setRemediatedReady(false);
    setTerminalKey((value) => value + 1);
    setAccessState(null);
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
          Interactive Access-Control Lab
        </h3>
        <p className="text-sm">
          Review a fictional Linux server. For each finding: inspect evidence,
          choose risk and a least-privilege recommendation, apply a simulated
          change where supported, then verify. Do not remove access that
          legitimate roles still need.
        </p>
        <Callout title="Learning safety">
          <p>
            This lab is entirely simulated. It never inspects host users,
            groups, or files, and never runs a real shell.
          </p>
        </Callout>
      </div>

      {step === "overview" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Initial access-review snapshot
            </p>
            <p className="text-muted-foreground text-sm">
              Five findings were flagged on a fictional host. Titles are
              intentionally high-level — inspect evidence before assuming root
              cause or applying a broad permission wipe.
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {FINDING_ORDER.map((id) => {
                const item = getAccessFinding(id);
                return (
                  <li key={id}>
                    <span className="text-foreground font-medium">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · suggested triage risk: {item.risk}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="text-muted-foreground text-sm">
              Suggested order: confidentiality of secrets first, then write
              access on operational scripts, then excess admin membership, then
              service-shell and shared-file hygiene.
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
              Evidence to inspect:{" "}
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                {finding.evidenceHint}
              </code>
            </p>
            <p className="text-sm">
              Progress: {completedFindings.size} reviewed
              {accessState ? ` · ${openCount} findings still open` : ""}.
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
              disabled={!remediatedReady}
              onClick={() => setStep("recheck")}
            >
              4. Verify
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
              securityAccessControl="full-review"
              suggestions={
                step === "remediate"
                  ? [
                      {
                        command: REMEDIATION_COMMAND[findingId],
                        label: "remediate",
                      },
                      ...(findingId === "deploy-script-writable"
                        ? [
                            {
                              command: "chmod 750 /srv/app/deploy.sh",
                              label: "chmod 750",
                            },
                          ]
                        : []),
                      ...ASSESSMENT_SUGGESTIONS,
                    ]
                  : ASSESSMENT_SUGGESTIONS
              }
              suggestionsLabel="Review commands"
              onSecurityAccessControlChange={(state) => {
                setAccessState(state);
                setRemediatedReady(isAccessFindingRemediated(state, findingId));
              }}
              onCommandRun={() => setInspected(true)}
            />
          )}

          {step === "inspect" ? (
            <div className="space-y-3">
              <p className="text-sm">
                Run at least one diagnostic command, then continue. Do not
                assume the title alone proves severity or the safest fix.
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
                  What risk level fits best?
                </p>
                <ul className="space-y-2">
                  {(
                    [
                      "critical",
                      "high",
                      "medium",
                      "low",
                    ] as const satisfies readonly AccessRiskLevel[]
                  ).map((risk) => (
                    <li key={risk}>
                      <button
                        type="button"
                        disabled={submitted && classificationOk}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, risk }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          answers.risk === risk &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          submitted &&
                            answers.risk === risk &&
                            riskCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.risk === risk &&
                            !riskCorrect &&
                            "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        <span className="capitalize">{risk}</span>
                        {submitted && riskCorrect && answers.risk === risk ? (
                          <span className="text-muted-foreground">
                            (priority rank {riskRank(risk) + 1} of 4)
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-foreground font-medium">
                  Why is this an access-control problem?
                </p>
                <ul className="space-y-2">
                  {WHY_OPTIONS.map((option) => (
                    <li key={option.key}>
                      <button
                        type="button"
                        disabled={submitted && classificationOk}
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            why: option.key,
                          }))
                        }
                        className={cn(
                          "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          answers.why === option.key &&
                            !submitted &&
                            "border-primary/50 bg-primary/5",
                          submitted &&
                            answers.why === option.key &&
                            whyCorrect &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.why === option.key &&
                            !whyCorrect &&
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
                  Which least-privilege recommendation is best?
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
                            option.correct &&
                            "border-green-600/40 bg-green-500/10",
                          submitted &&
                            answers.action === option.key &&
                            !option.correct &&
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
                    disabled={!answers.risk || !answers.why || !answers.action}
                    onClick={() => setSubmitted(true)}
                  >
                    Check classification
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setStep("remediate")}>
                    Continue to remediation
                  </Button>
                )}
              </div>

              {submitted ? (
                <Callout
                  title={
                    classificationOk ? "Classification looks good" : "Not quite"
                  }
                >
                  <p>
                    {classificationOk
                      ? `${finding.principle} Prefer the smallest change that removes excess access without breaking legitimate use.`
                      : "Re-check risk, the reason the access is wrong, and a recommendation that preserves needed owner/group access."}
                  </p>
                </Callout>
              ) : null}
            </div>
          ) : null}

          {step === "remediate" ? (
            <div className="space-y-3">
              <p className="text-sm">
                Apply the simulated remediation
                {findingId === "deploy-script-writable"
                  ? " (chgrp and chmod 750)"
                  : ""}
                , then continue when the finding clears. Avoid indiscriminate
                permission wipes.
              </p>
              <p className="text-muted-foreground text-sm">
                Suggested command:{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {REMEDIATION_COMMAND[findingId]}
                </code>
                {findingId === "deploy-script-writable" ? (
                  <>
                    {" "}
                    then{" "}
                    <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                      chmod 750 /srv/app/deploy.sh
                    </code>
                  </>
                ) : null}
              </p>
              <Button
                type="button"
                disabled={!remediatedReady}
                onClick={() => setStep("recheck")}
              >
                Continue to verification
              </Button>
            </div>
          ) : null}

          {step === "recheck" ? (
            <div className="space-y-3">
              <p className="text-sm">
                Re-inspect the account or path and confirm the excess access is
                gone. Optional: run{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  access-review
                </code>{" "}
                to see remaining open findings.
              </p>
              <Callout title="Finding remediated">
                <p>
                  {finding.remediation} Principle: {finding.principle}
                </p>
              </Callout>
              <Button type="button" onClick={goNextFinding}>
                {findingIndex >= FINDING_ORDER.length - 1
                  ? "Finish lab"
                  : "Next finding"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <div className="space-y-4">
          <Callout title="Lab complete">
            <p>
              You reviewed all five fictional findings: overly readable config,
              unintended deploy-script write access, excess sudo membership, an
              interactive service shell, and a world-writable shared file.
            </p>
          </Callout>
          <p className="text-sm">
            Remember: authentication proves identity; authorization limits what
            that identity may do. Prefer least privilege and verify after every
            change.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCompletedFindings(new Set());
              setStep("overview");
            }}
          >
            Restart lab
          </Button>
        </div>
      ) : null}
    </div>
  );
}
