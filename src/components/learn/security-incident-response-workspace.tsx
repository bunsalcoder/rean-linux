"use client";

import { useMemo, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { Button } from "@/components/ui/button";
import {
  IR_EVIDENCE_CATALOG,
  IR_FINDINGS,
  buildIncidentReport,
  createInitialSecurityIncidentResponseState,
  type EvidenceRelevance,
  type IrWorkflowStep,
  type SimulatedEvidenceItem,
  type SimulatedSecurityIncidentResponseState,
} from "@/lib/simulate-security-incident-response";
import { cn } from "@/lib/utils";

type WorkspaceTab = "workflow" | "evidence" | "timeline" | "report";

type TimelineEntry = {
  id: string;
  time: string;
  event: string;
  source: string;
};

type EvidenceSession = {
  relevance: EvidenceRelevance;
  note: string;
};

const WORKFLOW_STEPS: readonly {
  id: IrWorkflowStep;
  title: string;
  guidance: string;
}[] = [
  {
    id: "identify",
    title: "1. Identify the incident",
    guidance:
      "Separate events and alerts from confirmed incidents. Review AUTH-1 and related findings on rean-ir.",
  },
  {
    id: "assess-severity",
    title: "2. Assess severity",
    guidance:
      "Rate impact and urgency. Unusual process + sudo elevation often warrants high/critical priority.",
  },
  {
    id: "determine-scope",
    title: "3. Determine scope",
    guidance:
      "List affected users (contractor), services (sshd, nginx), and systems (rean-ir).",
  },
  {
    id: "collect-evidence",
    title: "4. Collect and preserve evidence",
    guidance:
      "Inspect catalog items, mark relevance, add notes, and conceptually preserve before changing state.",
  },
  {
    id: "contain",
    title: "5. Select containment",
    guidance:
      "Disable account, block source, stop process, close port, or isolate service — weigh availability trade-offs.",
  },
  {
    id: "eradicate",
    title: "6. Select eradication",
    guidance:
      "Remove unauthorized config, unexpected privileges, and suspicious indicators after evidence is safe.",
  },
  {
    id: "recover",
    title: "7. Perform recovery",
    guidance:
      "Verify backup integrity, restore known-good state, and rotate affected credentials conceptually.",
  },
  {
    id: "verify",
    title: "8. Verify recovered environment",
    guidance:
      "Confirm listeners, config, process list, and account controls before declaring recovery complete.",
  },
  {
    id: "report",
    title: "9. Generate incident report",
    guidance:
      "Assemble timeline, evidence, actions, verification, and lessons learned from this session.",
  },
];

const CONTAINMENT_OPTIONS = [
  {
    id: "disable-account",
    label: "Disable compromised account (contractor)",
    feedback:
      "Appropriate when interactive access may still be abused. Document business impact on the contractor role.",
  },
  {
    id: "block-source",
    label: "Block suspicious source 203.0.113.88",
    feedback:
      "Reduces remote access from the alerted IP. Watch for attacker IP changes and false positives.",
  },
  {
    id: "stop-process",
    label: "Stop unusual process (sim-crypto-miner)",
    feedback:
      "Stops ongoing activity but may destroy volatile process evidence if you skip preservation.",
  },
  {
    id: "close-port",
    label: "Close unexpected port 31337",
    feedback:
      "Removes unauthorized exposure. Confirm what owned the listener first when possible.",
  },
  {
    id: "isolate-service",
    label: "Isolate nginx service",
    feedback:
      "Strong containment for tampered reverse proxy — but causes availability impact. Prefer scoped fixes when safe.",
  },
] as const;

const ERADICATION_OPTIONS = [
  {
    id: "restore-config",
    label: "Restore known-good nginx configuration",
    feedback:
      "Removes unauthorized upstream. Prefer preserving the tampered file in evidence first.",
  },
  {
    id: "remove-sudo",
    label: "Remove unexpected sudo membership",
    feedback:
      "Restores least privilege for contractor after documenting the elevation evidence.",
  },
  {
    id: "update-package",
    label: "Update fictional outdated openssl",
    feedback:
      "Addresses DEMO-IR-2026-014 teaching advisory. Patching supports prevention after containment.",
  },
] as const;

const RECOVERY_OPTIONS = [
  {
    id: "verify-backup",
    label: "Verify backup integrity (SIM-HASH)",
    feedback:
      "Good practice before restore. Labels are educational simulation identifiers, not real crypto proofs.",
  },
  {
    id: "restore-backup",
    label: "Restore from simulated clean backup",
    feedback:
      "Useful when config/state is broadly untrusted. Incomplete without integrity check and service validation.",
  },
  {
    id: "rotate-credentials",
    label: "Conceptually rotate contractor credentials",
    feedback:
      "Assumed compromise of credentials — rotation reduces reuse risk. No real secrets are changed.",
  },
  {
    id: "verify-services",
    label: "Verify services and access controls",
    feedback:
      "Required before closing. Closing without validation should not count as complete.",
  },
] as const;

function severityTone(severity: string): string {
  switch (severity) {
    case "critical":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "high":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "medium":
      return "border-border bg-muted text-foreground";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

function emptyEvidenceSession(): Record<string, EvidenceSession> {
  const map: Record<string, EvidenceSession> = {};
  for (const item of IR_EVIDENCE_CATALOG) {
    map[item.id] = { relevance: "unreviewed", note: "" };
  }
  return map;
}

function applyWorkspaceAction(
  state: SimulatedSecurityIncidentResponseState,
  actionId: string,
): {
  state: SimulatedSecurityIncidentResponseState;
  message: string;
} {
  const next = { ...state, decisionNotes: [...state.decisionNotes] };

  const note = (text: string) => {
    if (!next.decisionNotes.includes(text)) {
      next.decisionNotes = [...next.decisionNotes, text];
    }
  };

  const markContainment = () => {
    if (!next.evidencePreserved) {
      next.containmentStartedBeforeEvidence = true;
      note(
        "Containment began before evidence preservation — investigation quality may be reduced.",
      );
    } else {
      next.evidencePreservedBeforeContainment = true;
    }
  };

  switch (actionId) {
    case "preserve-evidence":
      next.evidencePreserved = true;
      if (!next.containmentStartedBeforeEvidence) {
        next.evidencePreservedBeforeContainment = true;
      }
      note("Evidence preserved in workspace before remediation.");
      return {
        state: next,
        message:
          "Evidence package marked preserved for this session (SIM-HASH educational labels).",
      };
    case "disable-account":
      markContainment();
      next.accountDisabled = true;
      next.accountInspected = true;
      note("Containment: disabled contractor account.");
      return {
        state: next,
        message: CONTAINMENT_OPTIONS[0]!.feedback,
      };
    case "block-source":
      markContainment();
      next.sourceBlocked = true;
      next.suspiciousConnPresent = false;
      next.networkInspected = true;
      note("Containment: blocked 203.0.113.88.");
      return { state: next, message: CONTAINMENT_OPTIONS[1]!.feedback };
    case "stop-process":
      markContainment();
      next.processStopped = true;
      next.unusualProcessRunning = false;
      next.suspiciousConnPresent = false;
      next.processInspected = true;
      note("Containment: stopped sim-crypto-miner.");
      return { state: next, message: CONTAINMENT_OPTIONS[2]!.feedback };
    case "close-port":
      markContainment();
      next.portClosed = true;
      next.unexpectedPortOpen = false;
      next.networkInspected = true;
      note("Containment: closed port 31337.");
      return { state: next, message: CONTAINMENT_OPTIONS[3]!.feedback };
    case "isolate-service":
      markContainment();
      next.serviceIsolated = true;
      next.configInspected = true;
      note("Containment: isolated nginx.");
      return { state: next, message: CONTAINMENT_OPTIONS[4]!.feedback };
    case "restore-config":
      if (!next.evidencePreserved) {
        note(
          "Config restored without prior evidence preservation — weaker investigation record.",
        );
      }
      next.configRestored = true;
      next.nginxConfigTampered = false;
      next.configInspected = true;
      note("Eradication: restored nginx known-good config.");
      return { state: next, message: ERADICATION_OPTIONS[0]!.feedback };
    case "remove-sudo":
      markContainment();
      next.contractorElevated = false;
      next.accountInspected = true;
      note("Eradication: removed contractor sudo membership.");
      return { state: next, message: ERADICATION_OPTIONS[1]!.feedback };
    case "update-package":
      next.packageUpdated = true;
      next.packageOutdated = false;
      next.packageInspected = true;
      note("Recovery/prevention: updated fictional openssl package.");
      return { state: next, message: ERADICATION_OPTIONS[2]!.feedback };
    case "verify-backup":
      next.backupInspected = true;
      next.backupIntegrityChecked = true;
      note("Checked simulated backup integrity.");
      return { state: next, message: RECOVERY_OPTIONS[0]!.feedback };
    case "restore-backup":
      if (!next.backupIntegrityChecked) {
        note(
          "Restored backup without verifying integrity — incomplete recovery decision.",
        );
      }
      next.backupRestored = true;
      next.backupInspected = true;
      next.nginxConfigTampered = false;
      next.configRestored = true;
      next.unusualProcessRunning = false;
      next.processStopped = true;
      next.unexpectedPortOpen = false;
      next.portClosed = true;
      next.suspiciousConnPresent = false;
      note("Recovery: restored from simulated clean backup.");
      return { state: next, message: RECOVERY_OPTIONS[1]!.feedback };
    case "rotate-credentials":
      next.credentialsRotated = true;
      note("Recovery: conceptually rotated contractor credentials.");
      return { state: next, message: RECOVERY_OPTIONS[2]!.feedback };
    case "verify-services": {
      const ok =
        !next.nginxConfigTampered &&
        !next.unusualProcessRunning &&
        !next.unexpectedPortOpen &&
        (!next.contractorElevated || next.accountDisabled);
      next.servicesVerified = ok;
      note(
        ok
          ? "Verification passed in workspace."
          : "Verification failed — do not close yet.",
      );
      return {
        state: next,
        message: ok
          ? RECOVERY_OPTIONS[3]!.feedback
          : "Verification incomplete — finish containment/eradication first.",
      };
    }
    default:
      return { state: next, message: "Unknown action." };
  }
}

export function SecurityIncidentResponseWorkspace() {
  const [tab, setTab] = useState<WorkspaceTab>("workflow");
  const [completedSteps, setCompletedSteps] = useState<
    ReadonlySet<IrWorkflowStep>
  >(() => new Set());
  const [activeStep, setActiveStep] = useState<IrWorkflowStep>("identify");
  const [evidenceSession, setEvidenceSession] = useState(emptyEvidenceSession);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(
    IR_EVIDENCE_CATALOG[0]!.id,
  );
  const [timeline, setTimeline] = useState<TimelineEntry[]>(() => [
    {
      id: "t0",
      time: "2026-11-13T02:13:11Z",
      event: "Alert: repeated SSH failures for contractor",
      source: "SIEM / sshd (simulated)",
    },
    {
      id: "t1",
      time: "2026-11-13T02:14:08Z",
      event: "Accepted password for contractor from 203.0.113.88",
      source: "auth log (simulated)",
    },
  ]);
  const [customEvent, setCustomEvent] = useState("");
  const [customTime, setCustomTime] = useState("2026-11-13T02:30:00Z");
  const [irState, setIrState] = useState(() =>
    createInitialSecurityIncidentResponseState("explore"),
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [severityChoice, setSeverityChoice] = useState<string>("high");
  const [scopeNotes, setScopeNotes] = useState(
    "Users: contractor · Services: sshd, nginx · Host: rean-ir",
  );

  const selectedEvidence = IR_EVIDENCE_CATALOG.find(
    (e) => e.id === selectedEvidenceId,
  )!;
  const report = useMemo(() => buildIncidentReport(irState), [irState]);

  function markStepComplete(step: IrWorkflowStep) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }

  function runAction(actionId: string) {
    const { state, message } = applyWorkspaceAction(irState, actionId);
    setIrState(state);
    setActionFeedback(message);
    setTimeline((prev) => [
      ...prev,
      {
        id: `act-${actionId}-${prev.length}`,
        time: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
        event: `Action: ${actionId}`,
        source: "analyst workspace (session)",
      },
    ]);
  }

  function addEvidenceToTimeline(item: SimulatedEvidenceItem) {
    setTimeline((prev) => [
      ...prev,
      {
        id: `ev-${item.id}-${prev.length}`,
        time: item.timestamp,
        event: `${item.title} — ${item.summary}`,
        source: item.source,
      },
    ]);
    setEvidenceSession((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id]!,
        relevance:
          prev[item.id]!.relevance === "unreviewed"
            ? "relevant"
            : prev[item.id]!.relevance,
      },
    }));
    setIrState((prev) => {
      const next = { ...prev };
      switch (item.category) {
        case "authentication":
          next.authInspected = true;
          break;
        case "system":
          if (item.id === "E2") next.accountInspected = true;
          if (item.id === "E3") next.processInspected = true;
          break;
        case "configuration":
          next.configInspected = true;
          break;
        case "network":
          next.networkInspected = true;
          break;
        case "file":
          next.fileInspected = true;
          break;
        case "package":
          next.packageInspected = true;
          break;
        case "backup":
          next.backupInspected = true;
          break;
        case "service":
          next.configInspected = true;
          break;
      }
      return next;
    });
  }

  function resetAll() {
    setTab("workflow");
    setCompletedSteps(new Set());
    setActiveStep("identify");
    setEvidenceSession(emptyEvidenceSession());
    setSelectedEvidenceId(IR_EVIDENCE_CATALOG[0]!.id);
    setTimeline([
      {
        id: "t0",
        time: "2026-11-13T02:13:11Z",
        event: "Alert: repeated SSH failures for contractor",
        source: "SIEM / sshd (simulated)",
      },
      {
        id: "t1",
        time: "2026-11-13T02:14:08Z",
        event: "Accepted password for contractor from 203.0.113.88",
        source: "auth log (simulated)",
      },
    ]);
    setCustomEvent("");
    setIrState(createInitialSecurityIncidentResponseState("explore"));
    setActionFeedback(null);
    setSeverityChoice("high");
    setScopeNotes("Users: contractor · Services: sshd, nginx · Host: rean-ir");
  }

  const sortedTimeline = useMemo(
    () =>
      [...timeline].sort((a, b) =>
        a.time < b.time ? -1 : a.time > b.time ? 1 : 0,
      ),
    [timeline],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Incident Response Workspace
        </h3>
        <p className="text-muted-foreground text-sm">
          Session-only lab on fictional host{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rean-ir
          </code>
          . Preserve evidence, decide containment, recover, and draft a report —
          nothing touches your real system.
        </p>
      </div>

      <Callout title="Learning safety">
        <p>
          All indicators, IPs (RFC 5737), process names, and{" "}
          <strong className="text-foreground">SIM-HASH-*</strong> integrity
          labels are educational simulation data — not real malware, not
          cryptographic verification, and not host changes.
        </p>
      </Callout>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["workflow", "Workflow"],
            ["evidence", "Evidence"],
            ["timeline", "Timeline"],
            ["report", "Report"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={tab === id ? "default" : "outline"}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={resetAll}>
          Reset simulation
        </Button>
      </div>

      {tab === "workflow" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "rounded border px-2 py-1 text-xs transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  activeStep === step.id
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : completedSteps.has(step.id)
                      ? "border-border text-muted-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {step.title.split(". ")[0]}
                {completedSteps.has(step.id) ? " ✓" : ""}
              </button>
            ))}
          </div>

          {WORKFLOW_STEPS.filter((s) => s.id === activeStep).map((step) => (
            <div
              key={step.id}
              className="border-border bg-muted/30 space-y-3 rounded-lg border p-4"
            >
              <p className="text-foreground font-medium">{step.title}</p>
              <p className="text-sm">{step.guidance}</p>

              {step.id === "identify" ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {IR_FINDINGS.map((f) => (
                    <li key={f.id}>
                      <span className="text-foreground font-medium">
                        [{f.id}]
                      </span>{" "}
                      {f.title} — {f.severity}/{f.priority}
                    </li>
                  ))}
                </ul>
              ) : null}

              {step.id === "assess-severity" ? (
                <div className="flex flex-wrap gap-2">
                  {(["critical", "high", "medium", "low"] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant={severityChoice === s ? "default" : "outline"}
                      onClick={() => setSeverityChoice(s)}
                    >
                      {s}
                    </Button>
                  ))}
                  <p className="text-muted-foreground w-full text-xs">
                    Teaching suggestion: unusual process + privilege elevation
                    often supports <strong>high</strong> or{" "}
                    <strong>critical</strong>. You selected: {severityChoice}.
                  </p>
                </div>
              ) : null}

              {step.id === "determine-scope" ? (
                <textarea
                  value={scopeNotes}
                  onChange={(e) => setScopeNotes(e.target.value)}
                  rows={3}
                  className="border-border bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm"
                  aria-label="Scope notes"
                />
              ) : null}

              {step.id === "collect-evidence" ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    Open the Evidence tab to inspect items, mark relevance, and
                    add notes. Then preserve before containment.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      runAction("preserve-evidence");
                      setTab("evidence");
                    }}
                  >
                    Preserve evidence
                  </Button>
                  {irState.evidencePreserved ? (
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      Evidence marked preserved for this session.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step.id === "contain" ? (
                <div className="flex flex-wrap gap-2">
                  {CONTAINMENT_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(opt.id)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              {step.id === "eradicate" ? (
                <div className="flex flex-wrap gap-2">
                  {ERADICATION_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(opt.id)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              {step.id === "recover" || step.id === "verify" ? (
                <div className="flex flex-wrap gap-2">
                  {RECOVERY_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(opt.id)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              {step.id === "report" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setTab("report")}
                >
                  Open incident report
                </Button>
              ) : null}

              {actionFeedback &&
              (step.id === "contain" ||
                step.id === "eradicate" ||
                step.id === "recover" ||
                step.id === "verify" ||
                step.id === "collect-evidence") ? (
                <Callout title="Decision feedback">
                  <p>{actionFeedback}</p>
                  {irState.containmentStartedBeforeEvidence ? (
                    <p className="mt-2 text-sm">
                      You started containment before preserving evidence —
                      sometimes required for safety, but it can reduce
                      investigation quality. Prefer evidence-first when safe.
                    </p>
                  ) : null}
                </Callout>
              ) : null}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => markStepComplete(step.id)}
              >
                Mark step complete
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "evidence" ? (
        <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
          <ul className="space-y-1">
            {IR_EVIDENCE_CATALOG.map((item) => {
              const session = evidenceSession[item.id]!;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEvidenceId(item.id)}
                    className={cn(
                      "w-full rounded border px-2 py-1.5 text-left text-xs transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                      selectedEvidenceId === item.id
                        ? "border-primary/50 bg-primary/10"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span className="text-foreground font-medium">
                      {item.id}
                    </span>{" "}
                    {item.title}
                    <span className="text-muted-foreground mt-0.5 block">
                      {session.relevance}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-foreground font-medium">
                [{selectedEvidence.id}] {selectedEvidence.title}
              </p>
              <p className="text-muted-foreground text-xs">
                Source: {selectedEvidence.source} · Timestamp:{" "}
                {selectedEvidence.timestamp}
              </p>
              <p className="text-xs">
                Integrity ID:{" "}
                <code className="bg-muted rounded px-1 font-mono">
                  {selectedEvidence.integrityId}
                </code>{" "}
                (educational simulation label)
              </p>
            </div>
            <p className="text-sm">{selectedEvidence.summary}</p>
            <pre className="bg-background overflow-x-auto rounded border p-3 font-mono text-xs whitespace-pre-wrap">
              {selectedEvidence.detail}
            </pre>

            <div className="flex flex-wrap gap-2">
              {(["unreviewed", "relevant", "inconclusive"] as const).map(
                (rel) => (
                  <Button
                    key={rel}
                    type="button"
                    size="sm"
                    variant={
                      evidenceSession[selectedEvidence.id]!.relevance === rel
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setEvidenceSession((prev) => ({
                        ...prev,
                        [selectedEvidence.id]: {
                          ...prev[selectedEvidence.id]!,
                          relevance: rel,
                        },
                      }))
                    }
                  >
                    {rel}
                  </Button>
                ),
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addEvidenceToTimeline(selectedEvidence)}
              >
                Add to timeline
              </Button>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                Investigation notes
              </span>
              <textarea
                value={evidenceSession[selectedEvidence.id]!.note}
                onChange={(e) =>
                  setEvidenceSession((prev) => ({
                    ...prev,
                    [selectedEvidence.id]: {
                      ...prev[selectedEvidence.id]!,
                      note: e.target.value,
                    },
                  }))
                }
                rows={3}
                className="border-border bg-background text-foreground w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>

            <Callout title="Preserve before remediate">
              <p>
                Changing accounts, killing processes, or restoring configs can
                destroy volatile clues. Record sources and timestamps first when
                operationally safe — then contain.
              </p>
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => runAction("preserve-evidence")}
                >
                  Mark evidence preserved
                </Button>
              </div>
            </Callout>
          </div>
        </div>
      ) : null}

      {tab === "timeline" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground font-medium">
              Chronological incident timeline
            </p>
            <ol className="space-y-3">
              {sortedTimeline.map((entry) => (
                <li
                  key={entry.id}
                  className="border-border relative border-l-2 pl-4"
                >
                  <p className="font-mono text-xs">{entry.time}</p>
                  <p className="text-sm">{entry.event}</p>
                  <p className="text-muted-foreground text-xs">
                    {entry.source}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="border-border bg-background rounded-md border px-3 py-2 font-mono text-sm"
              aria-label="Timeline timestamp"
              placeholder="ISO timestamp"
            />
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              className="border-border bg-background flex-1 rounded-md border px-3 py-2 text-sm"
              aria-label="Timeline event"
              placeholder="Add investigation note or action"
            />
            <Button
              type="button"
              onClick={() => {
                if (!customEvent.trim()) return;
                setTimeline((prev) => [
                  ...prev,
                  {
                    id: `custom-${prev.length}`,
                    time: customTime || new Date().toISOString(),
                    event: customEvent.trim(),
                    source: "analyst note",
                  },
                ]);
                setCustomEvent("");
              }}
            >
              Add entry
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "report" ? (
        <div className="space-y-4" id="incident-report">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <h4 className="text-foreground font-heading text-base font-semibold">
              Final Incident Report
            </h4>
            <p className="text-sm">
              <strong className="text-foreground">Title:</strong> {report.title}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Classification:</strong>{" "}
              {report.classification}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Severity:</strong>{" "}
              <span
                className={cn(
                  "rounded px-1.5 py-0.5",
                  severityTone(report.severity),
                )}
              >
                {report.severity}
              </span>{" "}
              (workspace assessment: {severityChoice})
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Scope notes:</strong>{" "}
              {scopeNotes}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Affected assets:</strong>{" "}
              {report.affectedAssets.join(", ")}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Final status:</strong>{" "}
              {report.finalStatus}
            </p>
          </div>

          <div className="border-border space-y-2 rounded-lg border p-4">
            <h4 className="text-foreground font-medium">Timeline</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {sortedTimeline.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-xs">{e.time}</span> —{" "}
                  {e.event}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border space-y-2 rounded-lg border p-4">
            <h4 className="text-foreground font-medium">Evidence collected</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {IR_EVIDENCE_CATALOG.filter(
                (e) => evidenceSession[e.id]!.relevance !== "unreviewed",
              ).map((e) => (
                <li key={e.id}>
                  [{e.id}] {e.title} — {evidenceSession[e.id]!.relevance}
                  {evidenceSession[e.id]!.note
                    ? ` · note: ${evidenceSession[e.id]!.note}`
                    : ""}
                </li>
              ))}
              {report.evidenceCollected.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border space-y-2 rounded-lg border p-4">
              <h4 className="text-foreground font-medium">Containment</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {report.containmentActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="border-border space-y-2 rounded-lg border p-4">
              <h4 className="text-foreground font-medium">
                Eradication & recovery
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {report.eradicationRecovery.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-border space-y-2 rounded-lg border p-4">
            <h4 className="text-foreground font-medium">Verification</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {report.verificationResults.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>

          <div className="border-border space-y-2 rounded-lg border p-4">
            <h4 className="text-foreground font-medium">
              Lessons learned & recommendations
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {report.lessonsLearned.map((l) => (
                <li key={l}>{l}</li>
              ))}
              <li>
                Enforce MFA / key-based SSH and alert on repeated auth failures
              </li>
              <li>
                Monitor unexpected listeners and unauthorized config drift
              </li>
              <li>Test backup restores regularly before you need them</li>
            </ul>
          </div>

          {report.qualityNotes.length > 0 ? (
            <Callout title="Session quality notes">
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {report.qualityNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Callout>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
            >
              Print report
            </Button>
            <Button type="button" variant="outline" onClick={resetAll}>
              Reset simulation
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
