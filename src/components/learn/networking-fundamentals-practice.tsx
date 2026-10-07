"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

type PracticeStep = {
  id: string;
  title: string;
  command: string;
  lookFor: string;
  validate: (command: string) => boolean;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ");
}

const PRACTICE_STEPS: readonly PracticeStep[] = [
  {
    id: "find-interface",
    title: "Exercise 1 — Find the Network Interface",
    command: "ip link",
    lookFor: "Which interface is the main simulated network interface? → eth0",
    validate: (command) => normalizeCommand(command) === "ip link",
  },
  {
    id: "find-ip",
    title: "Exercise 2 — Find the IP Address",
    command: "ip addr",
    lookFor: "What IPv4 address is assigned to eth0? → 192.168.1.20",
    validate: (command) => {
      const normalized = normalizeCommand(command);
      return normalized === "ip addr" || normalized === "ip address";
    },
  },
  {
    id: "find-gateway",
    title: "Exercise 3 — Find the Gateway",
    command: "ip route",
    lookFor: "What is the default gateway? → 192.168.1.1",
    validate: (command) => normalizeCommand(command) === "ip route",
  },
  {
    id: "identify-listening",
    title: "Exercise 4 — Identify a Listening Service",
    command: "ss -tuln",
    lookFor: "Which port is commonly associated with SSH? → 22",
    validate: (command) => {
      const normalized = normalizeCommand(command);
      if (normalized === "ss -tuln") {
        return true;
      }
      // Accept equivalent short-flag orderings
      if (!normalized.startsWith("ss -")) {
        return false;
      }
      const flags = normalized.slice(4);
      if (flags.startsWith("-")) {
        return false;
      }
      const set = new Set(flags.split(""));
      return (
        set.size === 4 &&
        set.has("t") &&
        set.has("u") &&
        set.has("l") &&
        set.has("n")
      );
    },
  },
  {
    id: "resolve-hostname",
    title: "Exercise 5 — Resolve a Hostname",
    command: "getent hosts example.com",
    lookFor:
      "What IP address does the simulated DNS response provide? → 93.184.216.34",
    validate: (command) =>
      normalizeCommand(command).toLowerCase() === "getent hosts example.com",
  },
  {
    id: "test-loopback",
    title: "Exercise 6 — Test Loopback",
    command: "ping 127.0.0.1",
    lookFor: "Did the simulated host receive replies? → Yes",
    validate: (command) => normalizeCommand(command) === "ping 127.0.0.1",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ip link", label: "ip link" },
  { command: "ip addr", label: "ip addr" },
  { command: "ip route", label: "ip route" },
  { command: "ss -tuln", label: "ss -tuln" },
  { command: "getent hosts example.com", label: "getent hosts" },
  { command: "ping 127.0.0.1", label: "ping loopback" },
  { command: "help", label: "help" },
] as const;

export function NetworkingFundamentalsPractice() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const allDone = PRACTICE_STEPS.every((step) => completed.has(step.id));

  function considerStep(command: string) {
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
        if (step.validate(normalized)) {
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
          Practice: Networking Fundamentals
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Inspect the
          simulated interface, address, gateway, listening services, DNS
          response, and loopback — all in the safe simulator.
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
          <p className="text-foreground text-sm font-medium">Networking tip</p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            ip link → interfaces{"\n"}
            ip addr → addresses{"\n"}
            ip route → gateway / routes{"\n"}
            ss -tuln → listening ports{"\n"}
            getent hosts → name resolution
          </pre>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs real{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ip
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ss
          </code>
          , or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ping
          </code>
          , and never performs DNS lookups or inspects host interfaces.
        </p>
      </div>

      <TerminalSimulator
        networking
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onCommandRun={(command) => {
          considerStep(command);
        }}
      />

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You inspected the simulated interface{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              eth0
            </code>
            , found{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              192.168.1.20
            </code>
            , identified gateway{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              192.168.1.1
            </code>
            , confirmed SSH on port{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              22
            </code>
            , resolved{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              example.com
            </code>
            , and verified loopback replies.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
