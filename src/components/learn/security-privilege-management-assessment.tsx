"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  hasCommandSpecificRule,
  hasNopasswdRule,
  hasUnrestrictedSudo,
  isUserInGroup,
  sudoersSyntaxValid,
  type PrivilegeScenarioId,
  type SimulatedPrivilegeState,
} from "@/lib/simulate-security-privilege-management";
import { cn } from "@/lib/utils";

type LabScenarioId = "A" | "B" | "C" | "D" | "E";

type LabScenario = {
  id: LabScenarioId;
  title: string;
  simulatorScenario: PrivilegeScenarioId;
  requirement: string;
  inspectHint: string;
  hint: string;
  successExplain: string;
  securityNote: string;
  relevantCommands: readonly string[];
  verify: (state: SimulatedPrivilegeState) => boolean;
  verifyHint: string;
};

const LAB_SCENARIOS: readonly LabScenario[] = [
  {
    id: "A",
    title: "Excessive administrative access",
    simulatorScenario: "excess-admin",
    requirement:
      "Reporting user `analyst` belongs to the `sudo` group without an operational need. Inspect membership and remove the unnecessary administrative group access.",
    inspectHint:
      "Start with `id analyst`, `groups analyst`, and `getent group sudo`. Confirm analyst is listed under sudo.",
    hint: "From the bunsal admin session run `sudo gpasswd -d analyst sudo`, then re-check `id analyst`.",
    successExplain:
      "Removing analyst from sudo restores least privilege for a reporting role that does not need administrative elevation.",
    securityNote:
      "Privileged group membership is authorization. Extra sudo members expand who can attempt elevated operations if their account is compromised.",
    relevantCommands: [
      "id analyst",
      "groups analyst",
      "getent group sudo",
      "sudo gpasswd -d analyst sudo",
    ],
    verify: (state) => !isUserInGroup(state, "analyst", "sudo"),
    verifyHint:
      "analyst must no longer be a member of the sudo group. Re-check with id analyst.",
  },
  {
    id: "B",
    title: "Unrestricted sudo rule",
    simulatorScenario: "unrestricted-sudo",
    requirement:
      "Deployment account `deploy` currently has unrestricted sudo (`ALL`) even though it only needs `/usr/local/bin/deploy-app`. Identify the excess and tighten the fictional policy.",
    inspectHint:
      "Use `switch-user deploy` then `sudo -l`, or `cat /etc/sudoers.d/10-deploy`.",
    hint: "Run `policy set-commands deploy /usr/local/bin/deploy-app`, then confirm with `switch-user deploy` and `sudo -l`.",
    successExplain:
      "A command-specific rule matches the real operational need. Unrestricted ALL is no longer required for routine deploys.",
    securityNote:
      "ALL grants every elevated command the policy engine allows. Prefer the smallest command list that keeps the pipeline working.",
    relevantCommands: [
      "switch-user deploy",
      "sudo -l",
      "cat /etc/sudoers.d/10-deploy",
      "policy set-commands deploy /usr/local/bin/deploy-app",
    ],
    verify: (state) =>
      !hasUnrestrictedSudo(state, "deploy") &&
      hasCommandSpecificRule(state, "deploy", "/usr/local/bin/deploy-app"),
    verifyHint:
      "deploy must lose ALL and keep only /usr/local/bin/deploy-app. Use policy set-commands.",
  },
  {
    id: "C",
    title: "NOPASSWD risk",
    simulatorScenario: "nopasswd-risk",
    requirement:
      "A fictional rule lets `backup` run administrative commands with NOPASSWD. Decide whether that is justified for this account and remediate the unjustified passwordless elevation.",
    inspectHint:
      "Inspect with `cat /etc/sudoers.d/40-backup`, `switch-user backup`, and `sudo -l`. Review `sudoers-log` for passwordless apt activity.",
    hint: "NOPASSWD on apt update and cat /etc/shadow is not justified for this teaching scenario. Run `policy remove-nopasswd backup`.",
    successExplain:
      "Removing NOPASSWD restores a password challenge for elevated commands. Automation that truly needs passwordless sudo should use a narrowly scoped command and strong host controls — not broad admin tools.",
    securityNote:
      "NOPASSWD removes an authentication friction barrier. Treat it as an exception with documented justification, not a default convenience flag.",
    relevantCommands: [
      "cat /etc/sudoers.d/40-backup",
      "switch-user backup",
      "sudo -l",
      "sudoers-log",
      "policy remove-nopasswd backup",
    ],
    verify: (state) => !hasNopasswdRule(state, "backup"),
    verifyHint:
      "backup must no longer have a NOPASSWD sudo rule. Use policy remove-nopasswd backup.",
  },
  {
    id: "D",
    title: "Invalid sudoers configuration",
    simulatorScenario: "invalid-sudoers",
    requirement:
      "A drop-in sudoers file has a syntax error. Validate the fictional configuration, identify the problem, and repair it with the lab helper.",
    inspectHint:
      "Run `visudo -c` and `cat /etc/sudoers.d/99-broken`. Note the invalid `deploy ALL= ALL` line.",
    hint: "After confirming the parse error, run `policy fix-syntax`, then `visudo -c` again.",
    successExplain:
      "Valid syntax is required before sudo can trust policy. The repair replaces the broken line with a valid command-specific deploy rule.",
    securityNote:
      "On real hosts, a bad sudoers edit can lock out administrative access. Always validate and keep a recovery plan.",
    relevantCommands: [
      "visudo -c",
      "cat /etc/sudoers.d/99-broken",
      "ls /etc/sudoers.d/",
      "policy fix-syntax",
    ],
    verify: (state) =>
      sudoersSyntaxValid(state) &&
      hasCommandSpecificRule(state, "deploy", "/usr/local/bin/deploy-app"),
    verifyHint:
      "visudo -c must succeed and deploy should have a valid command-specific rule after policy fix-syntax.",
  },
  {
    id: "E",
    title: "Administrative access audit",
    simulatorScenario: "audit-review",
    requirement:
      "Review users, groups, sudo rules, and simulated activity. Confirm you can identify three findings: analyst in sudo, deploy with ALL, and backup with NOPASSWD. No change is required for verification — inspection proves the audit.",
    inspectHint:
      "Use `getent group sudo`, `switch-user deploy` + `sudo -l`, `cat /etc/sudoers.d/40-backup`, and `sudoers-log`.",
    hint: "You are verifying understanding of the initial audit state. After inspecting, click Verify — success means the findings are still present as evidence you reviewed the risky baseline.",
    successExplain:
      "An access audit inventories privileged groups, broad sudo rules, NOPASSWD exceptions, and recent elevated activity before recommending changes.",
    securityNote:
      "Document findings with evidence (commands and outputs) before remediating, so reviewers can see why each change was needed.",
    relevantCommands: [
      "getent group sudo",
      "id analyst",
      "switch-user deploy",
      "sudo -l",
      "cat /etc/sudoers.d/40-backup",
      "sudoers-log",
    ],
    verify: (state) =>
      isUserInGroup(state, "analyst", "sudo") &&
      hasUnrestrictedSudo(state, "deploy") &&
      hasNopasswdRule(state, "backup"),
    verifyHint:
      "This scenario verifies the initial risky audit state. Inspect with the suggested commands, then verify — do not remediate yet.",
  },
] as const;

const LAB_SUGGESTIONS = [
  { command: "whoami", label: "whoami" },
  { command: "id", label: "id" },
  { command: "sudo -l", label: "sudo -l" },
  { command: "getent group sudo", label: "getent sudo" },
  { command: "visudo -c", label: "visudo -c" },
  { command: "sudoers-log", label: "sudoers-log" },
  { command: "help", label: "help" },
] as const;

type LabStep = "overview" | "work" | "complete";

export function SecurityPrivilegeManagementAssessment() {
  const [step, setStep] = useState<LabStep>("overview");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [inspected, setInspected] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [privilegeState, setPrivilegeState] =
    useState<SimulatedPrivilegeState | null>(null);
  const [completed, setCompleted] = useState<ReadonlySet<LabScenarioId>>(
    () => new Set(),
  );

  const scenario = LAB_SCENARIOS[scenarioIndex]!;
  const stateOk = privilegeState ? scenario.verify(privilegeState) : false;

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setPrivilegeState(null);
  }

  function startScenario(index: number) {
    setScenarioIndex(index);
    setShowHint(false);
    setInspected(false);
    setVerified(false);
    setVerifyAttempted(false);
    setPrivilegeState(null);
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
          Interactive Privilege Management Lab
        </h3>
        <p className="text-sm">
          Five guided scenarios on a fictional host. Inspect state, apply a
          deliberate policy change when required, and verify the resulting
          simulated privileges — not just the command string.
        </p>
        <Callout title="Learning safety">
          <p>
            Everything is simulated. The app never runs real sudo, never prompts
            for a real password, and never changes host users or sudoers files.
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
              disabled={!privilegeState}
              onClick={() => {
                setVerifyAttempted(true);
                if (privilegeState && scenario.verify(privilegeState)) {
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
            securityPrivilegeManagement={scenario.simulatorScenario}
            suggestions={[
              ...scenario.relevantCommands.map((command) => ({
                command,
                label: command.split(" ")[0] ?? command,
              })),
              ...LAB_SUGGESTIONS,
            ]}
            suggestionsLabel="Scenario commands"
            onSecurityPrivilegeManagementChange={(state) => {
              setPrivilegeState(state);
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
                normalized.startsWith("sudo") ||
                normalized.startsWith("id") ||
                normalized.startsWith("getent") ||
                normalized.startsWith("visudo") ||
                normalized.startsWith("cat /etc/sudoers")
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
                    ? " Inspect the initial state with id, sudo -l, or cat first."
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
        <Callout title="Privilege management laboratory complete">
          <p>
            You worked through excess group membership, unrestricted sudo,
            NOPASSWD risk, invalid sudoers syntax, and an administrative access
            audit. Continue to the practice session or final knowledge check
            when ready.
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
