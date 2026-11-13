"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  accountContained,
  authInvestigated,
  configEradicated,
  networkContained,
  recoveryComplete,
  suspiciousFileHandled,
  type SecurityIncidentResponseScenarioId,
  type SimulatedSecurityIncidentResponseState,
} from "@/lib/simulate-security-incident-response";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: SecurityIncidentResponseScenarioId;
  alert: string;
  description: string;
  affectedAssets: string;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  tradeoff: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedSecurityIncidentResponseState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Suspicious Authentication Activity",
    simulatorScenario: "suspicious-auth",
    alert:
      "SIEM: 6 failed SSH passwords then Accepted password for contractor from 203.0.113.88",
    description:
      "Investigate whether the pattern warrants treating this as a security incident versus a noisy alert.",
    affectedAssets: "contractor, sshd, rean-ir",
    requirement:
      "Inspect authentication evidence with journalctl -u ssh (mark logs reviewed).",
    inspectHint: "Start with journalctl -u ssh, then ir-status.",
    hint: "Run journalctl -u ssh to collect the fictional auth evidence.",
    successExplain:
      "Repeated failures followed by success warrant investigation. It does not automatically prove compromise — raise confidence with more evidence.",
    tradeoff:
      "Immediate account lockout may be justified for high risk, but can disrupt a legitimate user. Gather evidence first when safe.",
    relevantCommands: ["journalctl -u ssh", "ir-status", "help"],
    verify: (state) => authInvestigated(state),
    verifyHint: "Run journalctl -u ssh so authInspected becomes true.",
  },
  {
    id: "B",
    title: "Potentially Compromised User Account",
    simulatorScenario: "compromised-account",
    alert: "contractor has unexpected sudo membership after suspicious login",
    description:
      "Assess privilege change scope and contain the account without skipping evidence preservation.",
    affectedAssets: "contractor, sudo",
    requirement:
      "Preserve evidence, disable contractor, and remove unexpected sudo membership.",
    inspectHint: "Use id contractor and getent group sudo before containment.",
    hint: "preserve-evidence → disable-account contractor → remove-sudo contractor",
    successExplain:
      "Disabling the account and removing sudo reduces ongoing privilege abuse risk after documenting membership evidence.",
    tradeoff:
      "Containment may interrupt contractor work. Skipping preserve-evidence weakens the investigation record.",
    relevantCommands: [
      "id contractor",
      "getent group sudo",
      "preserve-evidence",
      "disable-account contractor",
      "remove-sudo contractor",
    ],
    verify: (state) => accountContained(state),
    verifyHint:
      "preserve-evidence, disable-account contractor, and remove-sudo contractor.",
  },
  {
    id: "C",
    title: "Unauthorized Service Configuration",
    simulatorScenario: "unauthorized-config",
    alert: "nginx proxy_pass points to unexpected upstream 198.51.100.77:8080",
    description:
      "Confirm configuration drift, preserve evidence, then restore known-good config.",
    affectedAssets: "nginx, /etc/nginx/sites-enabled/app",
    requirement:
      "Inspect nginx config, preserve evidence, and restore-config nginx.",
    inspectHint: "cat /etc/nginx/sites-enabled/app and systemctl status nginx.",
    hint: "preserve-evidence then restore-config nginx",
    successExplain:
      "Restoring known-good config removes the unauthorized upstream after the tampered state is recorded.",
    tradeoff:
      "isolate-service nginx contains faster but hurts availability. Scoped restore is often preferable once evidence is safe.",
    relevantCommands: [
      "cat /etc/nginx/sites-enabled/app",
      "systemctl status nginx",
      "preserve-evidence",
      "restore-config nginx",
    ],
    verify: (state) => configEradicated(state),
    verifyHint: "Inspect config, preserve-evidence, then restore-config nginx.",
  },
  {
    id: "D",
    title: "Unexpected Network Exposure",
    simulatorScenario: "network-exposure",
    alert: "Unexpected listener :31337 and ESTAB to 203.0.113.88:4444",
    description:
      "Identify exposure, preserve evidence, block the source, and close the unexpected port.",
    affectedAssets: "network, unknown-listener, sim-crypto-miner connection",
    requirement:
      "Inspect with ss, preserve evidence, block-source 203.0.113.88, close-port 31337.",
    inspectHint: "ss -tuln and ss -tpn show listeners and the demo connection.",
    hint: "preserve-evidence → block-source 203.0.113.88 → close-port 31337",
    successExplain:
      "Blocking the suspicious source and closing the unexpected port reduces ongoing exposure.",
    tradeoff:
      "Blocking an IP is reversible containment; ensure the IP is correct to avoid collateral denial.",
    relevantCommands: [
      "ss -tuln",
      "ss -tpn",
      "preserve-evidence",
      "block-source 203.0.113.88",
      "close-port 31337",
    ],
    verify: (state) => networkContained(state),
    verifyHint:
      "Inspect sockets, preserve-evidence, block-source, and close-port 31337.",
  },
  {
    id: "E",
    title: "Suspicious File Indicator",
    simulatorScenario: "suspicious-file",
    alert: "/tmp/.sim-dropper.sh present; sim-crypto-miner process running",
    description:
      "Inspect the fictional indicator and related process. Preserve evidence before stopping the process.",
    affectedAssets: "/tmp/.sim-dropper.sh, sim-crypto-miner, contractor",
    requirement:
      "Inspect file and process, preserve evidence, stop-process sim-crypto-miner.",
    inspectHint: "ls -l /tmp/.sim-dropper.sh and ps aux.",
    hint: "preserve-evidence then stop-process sim-crypto-miner",
    successExplain:
      "Stopping the unusual process contains activity after recording process/file indicators. No real malware is involved.",
    tradeoff:
      "Killing a process early can lose volatile forensic detail — preserve first when safe.",
    relevantCommands: [
      "ls -l /tmp/.sim-dropper.sh",
      "ps aux",
      "preserve-evidence",
      "stop-process sim-crypto-miner",
    ],
    verify: (state) => suspiciousFileHandled(state),
    verifyHint:
      "Inspect file/process, preserve-evidence, then stop-process sim-crypto-miner.",
  },
  {
    id: "F",
    title: "Service Disruption and Recovery",
    simulatorScenario: "service-recovery",
    alert: "Need clean recovery after containment of tampered services",
    description:
      "Containment is already applied in this drill. Verify backup integrity, restore, rotate credentials, and validate services before closing.",
    affectedAssets: "nginx, contractor credentials, backups",
    requirement:
      "verify-backup → restore-backup → rotate-credentials contractor → verify-services.",
    inspectHint: "ls -l /var/backups/ir-lab then follow the recovery sequence.",
    hint: "verify-backup, restore-backup, rotate-credentials contractor, verify-services",
    successExplain:
      "Integrity-checked restore plus credential rotation and service verification completes a responsible recovery path.",
    tradeoff:
      "Restoring without verify-backup, or closing without verify-services, is an incomplete recovery decision.",
    relevantCommands: [
      "ls -l /var/backups/ir-lab",
      "verify-backup",
      "restore-backup",
      "rotate-credentials contractor",
      "verify-services",
    ],
    verify: (state) => recoveryComplete(state),
    verifyHint:
      "verify-backup, restore-backup, rotate-credentials contractor, verify-services.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "help", label: "help" },
  { command: "ir-status", label: "ir-status" },
  { command: "preserve-evidence", label: "preserve-evidence" },
  { command: "journalctl -u ssh", label: "journalctl -u ssh" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityIncidentResponseAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [irState, setIrState] =
    useState<SimulatedSecurityIncidentResponseState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = irState ? scenario.verify(irState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setIrState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setIrState(null);
    setTerminalKey((value) => value + 1);
    setStep("work");
  }

  function goNext() {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(scenario.id);
      return next;
    });
    const nextIndex = scenarioIndex + 1;
    if (nextIndex >= LAB_SCENARIOS.length) {
      setStep("complete");
      return;
    }
    startScenario(nextIndex);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Interactive Incident Response Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on fictional host{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rean-ir
          </code>
          . Investigate alerts, preserve evidence, contain, recover, and verify
          — never real host actions.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. No real shell, firewall, account, backup,
            or malware operations occur. DEMO-IR-* and SIM-HASH-* labels are
            teaching identifiers only.
          </p>
        </Callout>
      </div>

      {step === "overview" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Laboratory scenarios
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {LAB_SCENARIOS.map((item) => (
                <li key={item.id}>
                  <span className="text-foreground font-medium">
                    Scenario {item.id} — {item.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <Button type="button" onClick={() => startScenario(0)}>
            Begin Scenario A
          </Button>
        </div>
      ) : null}

      {step === "work" ? (
        <div className="space-y-4">
          <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <p className="text-foreground text-sm font-medium">
              Scenario {scenario.id} of {LAB_SCENARIOS.length}: {scenario.title}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Initial alert:</strong>{" "}
              {scenario.alert}
            </p>
            <p className="text-sm">{scenario.description}</p>
            <p className="text-sm">
              <strong className="text-foreground">Affected assets:</strong>{" "}
              {scenario.affectedAssets}
            </p>
            <p className="text-sm">
              <strong className="text-foreground">Requirement:</strong>{" "}
              {scenario.requirement}
            </p>
            <p className="text-muted-foreground text-sm">
              {scenario.inspectHint}
            </p>
            <p className="text-sm">
              Progress: {completed.size} completed
              {inspected ? " · inspection started" : ""}
              {verified ? " · verified" : ""}.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {LAB_SCENARIOS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => startScenario(index)}
                  className={cn(
                    "rounded border px-2 py-1 font-mono text-xs transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    index === scenarioIndex
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : completed.has(item.id)
                        ? "border-border text-muted-foreground line-through"
                        : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.id}
                  {completed.has(item.id) ? " ✓" : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHint((value) => !value)}
            >
              {showHint ? "Hide hint" : "Show hint"}
            </Button>
            <Button type="button" variant="outline" onClick={resetTerminal}>
              Reset scenario
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!irState}
              onClick={() => {
                setVerifyAttempted(true);
                if (irState && scenario.verify(irState)) {
                  setVerified(true);
                } else {
                  setVerified(false);
                }
              }}
            >
              Verify simulated state
            </Button>
            <Button type="button" disabled={!verified} onClick={goNext}>
              {scenarioIndex < LAB_SCENARIOS.length - 1
                ? "Next scenario"
                : "Finish lab"}
            </Button>
          </div>

          {showHint ? (
            <Callout title="Hint">
              <p>{scenario.hint}</p>
            </Callout>
          ) : null}

          <TerminalSimulator
            key={`${scenario.id}-${terminalKey}`}
            securityIncidentResponse={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ").slice(0, 3).join(" "),
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityIncidentResponseChange={(state) => {
              setIrState(state);
              if (scenario.verify(state)) {
                if (verifyAttempted) {
                  setVerified(true);
                }
              } else if (verifyAttempted) {
                setVerified(false);
              }
            }}
            onCommandRun={(command) => {
              const normalized = command.trim().toLowerCase();
              if (
                scenario.relevantCommands.some((candidate) => {
                  const target = candidate.toLowerCase();
                  return (
                    normalized === target || normalized.startsWith(`${target} `)
                  );
                }) ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("id ") ||
                normalized.startsWith("getent ") ||
                normalized.startsWith("ps ") ||
                normalized.startsWith("ss ") ||
                normalized.startsWith("cat ") ||
                normalized.startsWith("ls ") ||
                normalized.startsWith("systemctl") ||
                normalized.startsWith("ir-status") ||
                normalized.startsWith("preserve-")
              ) {
                setInspected(true);
              }
            }}
          />

          {verifyAttempted ? (
            <Callout title={verified ? "State verified" : "Not verified yet"}>
              {verified ? (
                <>
                  <p>{scenario.successExplain}</p>
                  <p className="mt-2 text-sm">
                    <strong className="text-foreground">Trade-off:</strong>{" "}
                    {scenario.tradeoff}
                  </p>
                  {irState?.containmentStartedBeforeEvidence ? (
                    <p className="mt-2 text-sm">
                      Note: containment started before evidence preservation in
                      this run — sometimes necessary, but it can reduce
                      investigation quality.
                    </p>
                  ) : null}
                </>
              ) : (
                <p>
                  {scenario.verifyHint}
                  {!inspected
                    ? " Inspect the environment with IR commands first."
                    : stateOk
                      ? " State looks ready — click Verify again."
                      : ""}
                </p>
              )}
            </Callout>
          ) : null}
        </div>
      ) : null}

      {step === "complete" ? (
        <Callout title="Incident response laboratory complete">
          <p>
            You practiced authentication investigation, account containment,
            configuration eradication, network exposure response, suspicious
            file handling, and recovery with verification.
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => startScenario(0)}
            >
              Restart lab
            </Button>
          </div>
        </Callout>
      ) : null}
    </div>
  );
}
