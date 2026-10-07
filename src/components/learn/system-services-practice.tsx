"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  getSimulatedService,
  type SimulatedServicesState,
} from "@/lib/simulate-system-services";

type PracticeFlags = {
  stoppedNginx: boolean;
  restartedNginx: boolean;
};

type PracticeStep = {
  id: string;
  title: string;
  command: string;
  lookFor: string;
  validate: (
    command: string,
    state: SimulatedServicesState,
    flags: PracticeFlags,
  ) => boolean;
};

const PRACTICE_STEPS: readonly PracticeStep[] = [
  {
    id: "check-ssh",
    title: "Exercise 1 — Check a Service",
    command: "systemctl status ssh",
    lookFor:
      "Confirm SSH is Active: active and note Main PID 812 in the simulated output.",
    validate: (command) =>
      command === "systemctl status ssh" ||
      command === "systemctl status ssh.service" ||
      command === "sudo systemctl status ssh",
  },
  {
    id: "start-nginx",
    title: "Exercise 2 — Start a Service",
    command: "sudo systemctl start nginx",
    lookFor: "Expect a started message. nginx becomes active in the simulator.",
    validate: (command, state) => {
      if (command !== "sudo systemctl start nginx") {
        return false;
      }
      const nginx = getSimulatedService(state, "nginx");
      return Boolean(nginx?.active);
    },
  },
  {
    id: "verify-nginx",
    title: "Exercise 3 — Verify the Service",
    command: "systemctl status nginx",
    lookFor: "Active should now read active (running).",
    validate: (command, state) => {
      const matched =
        command === "systemctl status nginx" ||
        command === "systemctl status nginx.service" ||
        command === "sudo systemctl status nginx";
      if (!matched) {
        return false;
      }
      const nginx = getSimulatedService(state, "nginx");
      return Boolean(nginx?.active);
    },
  },
  {
    id: "enable-nginx",
    title: "Exercise 4 — Enable a Service",
    command: "sudo systemctl enable nginx",
    lookFor:
      "nginx becomes enabled for boot. Active state does not change just because you enabled it.",
    validate: (command, state) => {
      if (command !== "sudo systemctl enable nginx") {
        return false;
      }
      const nginx = getSimulatedService(state, "nginx");
      return Boolean(nginx?.enabled);
    },
  },
  {
    id: "stop-nginx",
    title: "Exercise 5 — Stop the Service",
    command: "sudo systemctl stop nginx",
    lookFor:
      "After stopping, run systemctl status nginx. You should see enabled at boot but Active: inactive.",
    validate: (command, state, flags) => {
      if (command === "sudo systemctl stop nginx") {
        flags.stoppedNginx = true;
      }
      const statusMatched =
        command === "systemctl status nginx" ||
        command === "systemctl status nginx.service" ||
        command === "sudo systemctl status nginx" ||
        command === "systemctl is-active nginx";
      const nginx = getSimulatedService(state, "nginx");
      return Boolean(
        flags.stoppedNginx &&
        statusMatched &&
        nginx &&
        nginx.enabled &&
        !nginx.active,
      );
    },
  },
  {
    id: "restart-nginx",
    title: "Exercise 6 — Restart",
    command: "sudo systemctl restart nginx",
    lookFor:
      "Expect Stopping… Starting… restarted successfully. Then verify with systemctl status nginx.",
    validate: (command, state, flags) => {
      if (command === "sudo systemctl restart nginx") {
        flags.restartedNginx = true;
      }
      const statusMatched =
        command === "systemctl status nginx" ||
        command === "systemctl status nginx.service" ||
        command === "sudo systemctl status nginx" ||
        command === "systemctl is-active nginx";
      const nginx = getSimulatedService(state, "nginx");
      return Boolean(
        flags.restartedNginx && statusMatched && nginx?.active && nginx.enabled,
      );
    },
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "systemctl status ssh", label: "status ssh" },
  { command: "sudo systemctl start nginx", label: "start nginx" },
  { command: "systemctl status nginx", label: "status nginx" },
  { command: "sudo systemctl enable nginx", label: "enable nginx" },
  { command: "sudo systemctl stop nginx", label: "stop nginx" },
  { command: "sudo systemctl restart nginx", label: "restart nginx" },
  { command: "systemctl is-active nginx", label: "is-active nginx" },
  { command: "systemctl is-enabled nginx", label: "is-enabled nginx" },
  { command: "help", label: "help" },
] as const;

export function SystemServicesPractice() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const servicesRef = useRef<SimulatedServicesState | null>(null);
  const flagsRef = useRef<PracticeFlags>({
    stoppedNginx: false,
    restartedNginx: false,
  });

  const allDone = PRACTICE_STEPS.every((step) => completed.has(step.id));

  function considerStep(command: string, state: SimulatedServicesState) {
    const normalized = command.trim();
    setCompleted((prev) => {
      const next = new Set(prev);
      for (const step of PRACTICE_STEPS) {
        if (next.has(step.id)) {
          continue;
        }
        const stepIndex = PRACTICE_STEPS.findIndex((s) => s.id === step.id);
        const priorDone = PRACTICE_STEPS.slice(0, stepIndex).every((s) =>
          next.has(s.id),
        );
        if (!priorDone) {
          break;
        }
        if (step.validate(normalized, state, flagsRef.current)) {
          next.add(step.id);
        }
        break;
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Manage Simulated Services
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect SSH, start
          and verify nginx, enable it at boot, stop it while leaving it enabled,
          then restart it — all in the safe simulator.
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {PRACTICE_STEPS.map((step) => {
            const done = completed.has(step.id);
            return (
              <li key={step.id}>
                <p className={done ? "text-muted-foreground line-through" : ""}>
                  <span className="text-foreground font-medium">
                    {step.title}
                  </span>
                  {" — "}
                  Run{" "}
                  <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                    {step.command}
                  </code>
                  {done ? " ✓" : null}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Look for: {step.lookFor}
                </p>
              </li>
            );
          })}
        </ol>
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Remember the distinction
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            start / stop / restart → current state{"\n"}
            enable / disable → boot behavior{"\n"}
            enabled + inactive is a valid combination
          </pre>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            systemctl
          </code>
          , never starts host services, and never touches your operating system.
        </p>
      </div>

      <TerminalSimulator
        services
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onServicesChange={(state) => {
          servicesRef.current = state;
        }}
        onCommandRun={(command) => {
          const state = servicesRef.current;
          if (!state) {
            return;
          }
          considerStep(command, state);
        }}
      />

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You checked SSH, started and verified nginx, enabled it for boot,
            stopped it while it stayed enabled, then restarted it. That{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              enabled
            </code>{" "}
            but{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              inactive
            </code>{" "}
            state is exactly what administrators inspect every day.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
