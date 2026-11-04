"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  appPortRestrictedToInternal,
  databaseRestrictedToInternal,
  hasExposureFindings,
  hasRestrictiveInboundDefault,
  isSshReachable,
  requiredWebServicesReachable,
  udpDiscoveryAllowed,
  type FirewallHardeningScenarioId,
  type SimulatedFirewallHardeningState,
} from "@/lib/simulate-security-firewall-hardening";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: FirewallHardeningScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedFirewallHardeningState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Restrictive default policy",
    simulatorScenario: "restrictive-default",
    requirement:
      "Inbound traffic is allowed by default. Establish default deny incoming, keep allow outgoing, and preserve SSH, HTTP, and HTTPS reachability.",
    inspectHint:
      "Start with `sudo ufw status verbose` and `check-connect 22/tcp`.",
    hint: "Run `sudo ufw default deny incoming` and `sudo ufw default allow outgoing`, then re-check status and reachability.",
    successExplain:
      "Unmatched inbound traffic is now denied. Explicit allows for 22/80/443 keep required services reachable.",
    securityNote:
      "Default-deny inbound is a baseline hardening posture — still preserve operational access deliberately.",
    relevantCommands: [
      "sudo ufw status verbose",
      "sudo ufw default deny incoming",
      "sudo ufw default allow outgoing",
      "check-connect 22/tcp",
      "check-connect 80/tcp",
    ],
    verify: (state) =>
      hasRestrictiveInboundDefault(state) &&
      state.defaultOutgoing === "allow" &&
      requiredWebServicesReachable(state),
    verifyHint:
      "Default incoming must be deny, outgoing allow, and 22/80/443 must remain reachable.",
  },
  {
    id: "B",
    title: "Protect administrative access",
    simulatorScenario: "protect-ssh",
    requirement:
      "The firewall is inactive and SSH is not explicitly allowed. Create the SSH allow rule, enable the firewall, and verify management access remains available.",
    inspectHint:
      "Inspect with `sudo ufw status verbose`. Note the missing 22/tcp allow while defaults deny inbound.",
    hint: "Run `sudo ufw allow 22/tcp`, then `sudo ufw enable`, then `check-connect 22/tcp`.",
    successExplain:
      "SSH is explicitly allowed before filtering is active. Remote administration remains available under default-deny inbound.",
    securityNote:
      "Enabling a restrictive firewall before allowing SSH is a common lockout risk on real remote servers.",
    relevantCommands: [
      "sudo ufw status verbose",
      "sudo ufw allow 22/tcp",
      "sudo ufw enable",
      "check-connect 22/tcp",
    ],
    verify: (state) =>
      state.enabled &&
      hasRestrictiveInboundDefault(state) &&
      isSshReachable(state),
    verifyHint:
      "Allow 22/tcp, enable the firewall, and confirm SSH remains reachable.",
  },
  {
    id: "C",
    title: "Database exposure",
    simulatorScenario: "database-exposure",
    requirement:
      "PostgreSQL listens on TCP 5432 and is allowed from Anywhere. Restrict access to 192.168.1.0/24 (or remove public exposure equivalently) and verify public sources are blocked.",
    inspectHint:
      "Compare `ss -tuln` with `sudo ufw status`, then try `check-connect 5432/tcp from 203.0.113.10`.",
    hint: "Delete `allow 5432/tcp`, then allow from 192.168.1.0/24 to any port 5432 proto tcp. Retest public vs LAN sources.",
    successExplain:
      "The database still listens, but public sources are denied while the fictional internal host can connect.",
    securityNote:
      "A listening database is not automatically internet-reachable — policy decides. Prefer private networks and strong auth too.",
    relevantCommands: [
      "ss -tuln",
      "sudo ufw status",
      "sudo ufw delete allow 5432/tcp",
      "sudo ufw allow from 192.168.1.0/24 to any port 5432 proto tcp",
      "check-connect 5432/tcp from 203.0.113.10",
      "check-connect 5432/tcp from 192.168.1.50",
    ],
    verify: (state) => databaseRestrictedToInternal(state),
    verifyHint:
      "Remove Anywhere 5432/tcp and allow only from 192.168.1.0/24. Public must be blocked; LAN must succeed.",
  },
  {
    id: "D",
    title: "Unnecessary application port",
    simulatorScenario: "app-port",
    requirement:
      "Application TCP 8080 is accessible from any source. Restrict it to the internal network while keeping public web services available.",
    inspectHint:
      "Review `sudo ufw status` and `check-connect 8080/tcp from 203.0.113.10`.",
    hint: "Delete the Anywhere 8080 allow, then allow from 192.168.1.0/24 to any port 8080 proto tcp.",
    successExplain:
      "8080 is limited to the internal CIDR. HTTP/HTTPS/SSH remain publicly reachable for intended clients.",
    securityNote:
      "Match each service to its audience. Public front ends and internal app ports often need different rules.",
    relevantCommands: [
      "sudo ufw status",
      "sudo ufw delete allow 8080/tcp",
      "sudo ufw allow from 192.168.1.0/24 to any port 8080 proto tcp",
      "check-connect 8080/tcp from 203.0.113.10",
      "check-connect 80/tcp",
    ],
    verify: (state) =>
      appPortRestrictedToInternal(state) && requiredWebServicesReachable(state),
    verifyHint:
      "Restrict 8080 to 192.168.1.0/24 and keep 22/80/443 publicly reachable.",
  },
  {
    id: "E",
    title: "TCP and UDP rules",
    simulatorScenario: "tcp-udp",
    requirement:
      "UDP 5353 is listening, but the firewall allows TCP 5353. Identify the protocol mismatch and configure the correct UDP policy.",
    inspectHint:
      "Run `ss -tuln` and `sudo ufw status`. Note 5353/udp listening versus 5353/tcp allowed.",
    hint: "Delete allow 5353/tcp, add allow 5353/udp, then `check-connect 5353/udp`.",
    successExplain:
      "UDP traffic matches a UDP allow. The incorrect TCP rule no longer implies coverage for UDP.",
    securityNote:
      "Protocol mismatches silently fail under default-deny — always verify with the real transport.",
    relevantCommands: [
      "ss -tuln",
      "sudo ufw status",
      "sudo ufw delete allow 5353/tcp",
      "sudo ufw allow 5353/udp",
      "check-connect 5353/udp",
    ],
    verify: (state) => udpDiscoveryAllowed(state),
    verifyHint:
      "Replace the TCP 5353 allow with an explicit 5353/udp allow and confirm UDP reachability.",
  },
  {
    id: "F",
    title: "Exposure audit",
    simulatorScenario: "exposure-audit",
    requirement:
      "Inspect listening services and firewall rules. Identify unnecessary public exposure (database, application port, incorrect TCP discovery rule). Verification succeeds when the audit evidence remains present — document findings before remediating elsewhere.",
    inspectHint:
      "Use `ss -tuln`, `sudo ufw status verbose`, and selective `check-connect` probes from 203.0.113.10.",
    hint: "You are verifying understanding of the initial exposure. After reviewing listeners and Anywhere allows, click Verify — do not remediate yet.",
    successExplain:
      "Audit findings: TCP 5432 and 8080 are allowed from Anywhere while listening; 5353/udp listens but the policy lists 5353/tcp. SSH/HTTP/HTTPS may be intentional — databases and internal apps usually are not public.",
    securityNote:
      "An assessment separates required public services from accidental exposure. Remediate after you understand intended access patterns.",
    relevantCommands: [
      "ss -tuln",
      "sudo ufw status verbose",
      "ip addr",
      "check-connect 5432/tcp from 203.0.113.10",
      "check-connect 8080/tcp from 203.0.113.10",
      "systemctl status postgresql",
    ],
    verify: (state) => hasExposureFindings(state),
    verifyHint:
      "Inspect ss and ufw status. Verification checks that the excessive Anywhere exposure evidence is still present.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "sudo ufw status verbose", label: "ufw status" },
  { command: "ip addr", label: "ip addr" },
  { command: "check-connect 22/tcp", label: "check SSH" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityFirewallHardeningAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [fwState, setFwState] =
    useState<SimulatedFirewallHardeningState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = fwState ? scenario.verify(fwState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setFwState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setFwState(null);
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
          Interactive Firewall Hardening Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on a fictional host (`eth0` / `192.168.1.20`).
          Inspect state, apply deliberate UFW changes when required, and verify
          simulated policy and reachability — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real firewall commands,
            never modifies host networking, never scans real networks, and never
            opens real sockets. `check-connect` is a lesson-specific helper.
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
              disabled={!fwState}
              onClick={() => {
                setVerifyAttempted(true);
                if (fwState && scenario.verify(fwState)) {
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
            securityFirewallHardening={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityFirewallHardeningChange={(state) => {
              setFwState(state);
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
                normalized.startsWith("ss ") ||
                normalized.startsWith("sudo ufw") ||
                normalized.startsWith("check-connect") ||
                normalized.startsWith("ip ") ||
                normalized.startsWith("systemctl")
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
                    <strong className="text-foreground">Security note:</strong>{" "}
                    {scenario.securityNote}
                  </p>
                </>
              ) : (
                <p>
                  {scenario.verifyHint}
                  {!inspected
                    ? " Inspect the initial state with ss, ufw status, or check-connect first."
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
        <Callout title="Firewall hardening laboratory complete">
          <p>
            You worked through restrictive defaults, SSH-before-enable, database
            and application exposure, TCP/UDP matching, and an exposure audit.
            Continue to the practice session or final knowledge check when
            ready.
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
