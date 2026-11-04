"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  hasAppliedSecurityUpgrades,
  hasRefreshedIndex,
  kernelUpdateInstalled,
  listOutdatedPackages,
  nginxRuntimeMatchesInstalled,
  opensshRemediated,
  patchRiskApproved,
  runningKernelIsUpdated,
  type SecurityUpdatesScenarioId,
  type SimulatedSecurityUpdatesState,
} from "@/lib/simulate-security-updates";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E" | "F";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: SecurityUpdatesScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedSecurityUpdatesState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Identify outdated packages",
    simulatorScenario: "identify-outdated",
    requirement:
      "Refresh package metadata and inspect which installed packages have available updates. Verification succeeds when the index is refreshed and outdated packages remain visible for review.",
    inspectHint:
      "Start with `sudo apt update`, then `apt list --upgradable` and `apt policy nginx`.",
    hint: "Run sudo apt update first — apt update does not upgrade packages. Then list upgradable packages.",
    successExplain:
      "You refreshed metadata and inventoried upgradable packages without applying upgrades yet. Inventory before patching is the right first step.",
    securityNote:
      "Knowing what is outdated — and whether updates are security-classified — drives prioritization.",
    relevantCommands: [
      "sudo apt update",
      "apt list --upgradable",
      "apt policy nginx",
      "apt show openssh-server",
    ],
    verify: (state) =>
      hasRefreshedIndex(state) && listOutdatedPackages(state).length >= 4,
    verifyHint:
      "Run sudo apt update and apt list --upgradable. Do not upgrade yet for this scenario.",
  },
  {
    id: "B",
    title: "Prioritize a critical vulnerability",
    simulatorScenario: "prioritize-critical",
    requirement:
      "Evaluate DEMO-2026-001 against openssh-server: confirm the package is installed, network-exposed, and a fixed version is available. Remediate by upgrading openssh-server and restarting ssh.",
    inspectHint:
      "Use `apt show openssh-server`, `apt changelog openssh-server`, and `systemctl status ssh`.",
    hint: "Upgrade with sudo apt install openssh-server (after apt update), then sudo systemctl restart ssh.",
    successExplain:
      "Critical, network-exposed, exploit-available findings with a fixed package justify immediate remediation — including the service restart so the new code is loaded.",
    securityNote:
      "Severity alone is not enough; exposure, exploitability, and fix availability change priority.",
    relevantCommands: [
      "sudo apt update",
      "apt show openssh-server",
      "apt changelog openssh-server",
      "sudo apt install openssh-server",
      "sudo systemctl restart ssh",
      "systemctl status ssh",
    ],
    verify: (state) => hasRefreshedIndex(state) && opensshRemediated(state),
    verifyHint:
      "Refresh the index, upgrade openssh-server to the fixed version, and restart ssh.",
  },
  {
    id: "C",
    title: "Security update workflow",
    simulatorScenario: "update-workflow",
    requirement:
      "Refresh metadata with apt update, inspect upgradable packages, then apply upgrades. Confirm you understand that apt update alone does not change installed versions.",
    inspectHint:
      "Compare installed versions with `apt policy` before and after `sudo apt upgrade`.",
    hint: "sudo apt update → apt list --upgradable → sudo apt upgrade (or full-upgrade).",
    successExplain:
      "Metadata refresh and package upgrades are separate steps. apt update never installs newer binaries by itself.",
    securityNote:
      "Skipping apt update can hide security candidates; skipping upgrade leaves known issues installed.",
    relevantCommands: [
      "sudo apt update",
      "apt list --upgradable",
      "sudo apt upgrade",
      "apt policy sudo",
    ],
    verify: (state) =>
      hasRefreshedIndex(state) && hasAppliedSecurityUpgrades(state),
    verifyHint:
      "Run sudo apt update, then sudo apt upgrade (or full-upgrade) so security packages have no remaining candidate.",
  },
  {
    id: "D",
    title: "Service restart required",
    simulatorScenario: "service-restart",
    requirement:
      "nginx is already upgraded on disk, but the running process still uses the previous version. Restart nginx and verify runtime matches the installed package.",
    inspectHint:
      "Compare `apt policy nginx` with `systemctl status nginx` and `journalctl -u nginx`.",
    hint: "Run sudo systemctl restart nginx, then systemctl status nginx.",
    successExplain:
      "Installing a package updates files on disk. Long-running services keep old code in memory until restarted (or gracefully reloaded where supported).",
    securityNote:
      "Pending restarts are a common gap between “patched” and “protected.”",
    relevantCommands: [
      "apt policy nginx",
      "systemctl status nginx",
      "journalctl -u nginx",
      "sudo systemctl restart nginx",
    ],
    verify: (state) => nginxRuntimeMatchesInstalled(state),
    verifyHint:
      "Restart nginx so runningVersion matches the installed package and pending restart clears.",
  },
  {
    id: "E",
    title: "Reboot required",
    simulatorScenario: "reboot-required",
    requirement:
      "A kernel security update is installed, but uname -r still shows the old running kernel. Perform a simulated reboot and verify the running kernel changed.",
    inspectHint: "Compare `apt policy linux-image-generic` with `uname -r`.",
    hint: "Run sudo reboot (simulated only), then uname -r again.",
    successExplain:
      "Kernel packages install new images; the running kernel changes only after reboot. This lab never reboots your real machine.",
    securityNote: "Track reboot debt separately from package install success.",
    relevantCommands: [
      "apt policy linux-image-generic",
      "uname -r",
      "sudo reboot",
      "uname -r",
    ],
    verify: (state) =>
      kernelUpdateInstalled(state) && runningKernelIsUpdated(state),
    verifyHint:
      "After confirming the kernel package is installed, run sudo reboot and check uname -r.",
  },
  {
    id: "F",
    title: "Patch risk assessment",
    simulatorScenario: "patch-risk",
    requirement:
      "Before upgrading docker.io (service restart impact), complete the risk checklist: testing, backup, maintenance window, and rollback. Approve the change, then apply the upgrade.",
    inspectHint:
      "Run assess-risk without arguments to see checklist state, then enable each flag.",
    hint: "assess-risk tested|backup|window|rollback on → approve-change → sudo apt install docker.io.",
    successExplain:
      "Disruptive updates need operational planning. Blind production upgrades can cause outages even when the security fix is correct.",
    securityNote:
      "When you cannot patch immediately, document temporary mitigations and a deadline to revisit.",
    relevantCommands: [
      "assess-risk",
      "assess-risk tested on",
      "assess-risk backup on",
      "assess-risk window on",
      "assess-risk rollback on",
      "approve-change",
      "sudo apt install docker.io",
    ],
    verify: (state) =>
      patchRiskApproved(state) &&
      state.packages["docker.io"]?.availableVersion === null,
    verifyHint:
      "Complete all assess-risk flags, approve-change, then upgrade docker.io.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "sudo apt update", label: "apt update" },
  { command: "apt list --upgradable", label: "list upgradable" },
  { command: "apt show nginx", label: "apt show" },
  { command: "systemctl status nginx", label: "systemctl status" },
  { command: "uname -r", label: "uname -r" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityUpdatesAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [updatesState, setUpdatesState] =
    useState<SimulatedSecurityUpdatesState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = updatesState ? scenario.verify(updatesState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setUpdatesState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setUpdatesState(null);
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
          Interactive Vulnerability Management Lab
        </h3>
        <p className="text-sm">
          Six guided scenarios on a fictional Ubuntu-style host. Inspect package
          and service state, apply simulated updates when required, and verify
          remediation outcomes — never real apt or reboots.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real package managers,
            never contacts repositories, never restarts real services, and never
            reboots your machine. Advisory IDs use DEMO-* labels only.
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
              disabled={!updatesState}
              onClick={() => {
                setVerifyAttempted(true);
                if (updatesState && scenario.verify(updatesState)) {
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
            securityUpdates={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityUpdatesChange={(state) => {
              setUpdatesState(state);
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
                normalized.startsWith("apt ") ||
                normalized.startsWith("sudo apt") ||
                normalized.startsWith("systemctl") ||
                normalized.startsWith("sudo systemctl") ||
                normalized.startsWith("journalctl") ||
                normalized.startsWith("uname") ||
                normalized.startsWith("assess-risk") ||
                normalized === "approve-change" ||
                normalized === "sudo reboot"
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
                    ? " Inspect the initial environment with apt, systemctl, or uname first."
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
        <Callout title="Vulnerability management laboratory complete">
          <p>
            You practiced inventory, prioritization, the apt update vs upgrade
            workflow, service restarts, kernel reboot debt, and operational risk
            assessment before disruptive patches.
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
