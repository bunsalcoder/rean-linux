"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import {
  createFilesystemLessonFs,
  SIMULATED_HOME,
  type SimulatedFsState,
} from "@/lib/simulated-filesystem";
import { cn } from "@/lib/utils";

type StepCheck = (state: SimulatedFsState, command?: string) => boolean;

const GUIDED_STEPS: readonly {
  id: string;
  title: string;
  instruction: string;
  expectedCwd: string;
  commandHint: string;
  check: StepCheck;
}[] = [
  {
    id: "root",
    title: "Step 1 — Go to /",
    instruction: "Move to the filesystem root.",
    expectedCwd: "/",
    commandHint: "cd /",
    check: (state) => state.cwd === "/",
  },
  {
    id: "pwd-root",
    title: "Step 2 — Check where you are",
    instruction: "Confirm your location with pwd.",
    expectedCwd: "/",
    commandHint: "pwd",
    check: (_state, command) => command?.trim().toLowerCase() === "pwd",
  },
  {
    id: "var",
    title: "Step 3 — Go to /var",
    instruction: "From /, enter var using a relative path.",
    expectedCwd: "/var",
    commandHint: "cd var",
    check: (state) => state.cwd === "/var",
  },
  {
    id: "log",
    title: "Step 4 — Enter log",
    instruction: "Use a relative path to enter the log directory.",
    expectedCwd: "/var/log",
    commandHint: "cd log",
    check: (state) => state.cwd === "/var/log",
  },
  {
    id: "up",
    title: "Step 5 — Go back to /var",
    instruction: "Move up one level with ..",
    expectedCwd: "/var",
    commandHint: "cd ..",
    check: (state) => state.cwd === "/var",
  },
  {
    id: "home",
    title: "Step 6 — Return home",
    instruction: "Jump back to your home directory.",
    expectedCwd: SIMULATED_HOME,
    commandHint: "cd ~",
    check: (state) => state.cwd === SIMULATED_HOME,
  },
];

const CHALLENGE_TASKS: readonly {
  id: string;
  title: string;
  hint: string;
  check: StepCheck;
}[] = [
  {
    id: "to-log",
    title: "Go to /var/log",
    hint: "You can use an absolute path with cd.",
    check: (state) => state.cwd === "/var/log",
  },
  {
    id: "back-home",
    title: "Return to /home/learner",
    hint: "Try cd /home/learner or cd ~.",
    check: (state) => state.cwd === SIMULATED_HOME,
  },
  {
    id: "documents",
    title: "Go to /home/learner/Documents",
    hint: "From home, cd Documents also works.",
    check: (state) => state.cwd === `${SIMULATED_HOME}/Documents`,
  },
  {
    id: "tilde-home",
    title: "Return home using ~",
    hint: "Use cd ~ to jump straight home.",
    check: (state, command) =>
      state.cwd === SIMULATED_HOME &&
      Boolean(command?.trim().toLowerCase().startsWith("cd ~")),
  },
];

const PRACTICE_SUGGESTIONS = [
  { command: "pwd", label: "Run pwd" },
  { command: "ls", label: "Run ls" },
  { command: "cd /", label: "Run cd /" },
  { command: "cd ..", label: "Run cd .." },
  { command: "cd ~", label: "Run cd ~" },
  "help",
] as const;

const CHALLENGE_SUGGESTIONS = [
  { command: "pwd", label: "Run pwd" },
  { command: "ls", label: "Run ls" },
  { command: "cd ~", label: "Run cd ~" },
  "help",
] as const;

export function FilesystemPractice() {
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [guidedComplete, setGuidedComplete] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  function advanceGuided(state: SimulatedFsState, command?: string) {
    if (guidedComplete) {
      return;
    }

    const step = GUIDED_STEPS[guidedIndex];
    if (!step?.check(state, command)) {
      return;
    }

    if (guidedIndex >= GUIDED_STEPS.length - 1) {
      setGuidedComplete(true);
      return;
    }

    setGuidedIndex((index) => index + 1);
  }

  function advanceChallenge(state: SimulatedFsState, command?: string) {
    if (challengeComplete) {
      return;
    }

    const task = CHALLENGE_TASKS[challengeIndex];
    if (!task?.check(state, command)) {
      return;
    }

    if (challengeIndex >= CHALLENGE_TASKS.length - 1) {
      setChallengeComplete(true);
      return;
    }

    setChallengeIndex((index) => index + 1);
    setHintOpen(false);
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Guided practice
        </h3>
        <p>
          Start at{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home/learner
          </code>
          . Complete each step in order.
        </p>

        <ol className="space-y-3">
          {GUIDED_STEPS.map((step, index) => {
            const done = guidedComplete || index < guidedIndex;
            const active = !guidedComplete && index === guidedIndex;

            return (
              <li
                key={step.id}
                className={cn(
                  "border-border rounded-lg border px-4 py-3",
                  active && "border-primary/40 bg-primary/5",
                  done && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-foreground font-medium">{step.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {step.instruction}
                    </p>
                  </div>
                  <span className="font-mono text-xs tracking-wide uppercase">
                    {done ? "Done" : active ? "Current" : "Next"}
                  </span>
                </div>
                {active ? (
                  <div className="mt-3">
                    <CodeBlock
                      code={step.commandHint}
                      language="bash"
                      title="bash"
                    />
                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                      Expected location: {step.expectedCwd}
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={PRACTICE_SUGGESTIONS}
          suggestionsLabel="Quick actions"
          onCommand={(command, state) => advanceGuided(state, command)}
        />

        {guidedComplete ? (
          <Callout title="Guided practice complete">
            <p>
              You moved from home to root, into{" "}
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                /var/log
              </code>
              , and back home with{" "}
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                ~
              </code>
              .
            </p>
          </Callout>
        ) : null}
      </div>

      <div className="space-y-4">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Final practice challenge
        </h3>
        <p>
          Starting from{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home/learner
          </code>
          , complete these tasks without looking up the exact commands first.
        </p>

        <ol className="space-y-3">
          {CHALLENGE_TASKS.map((task, index) => {
            const done = challengeComplete || index < challengeIndex;
            const active = !challengeComplete && index === challengeIndex;

            return (
              <li
                key={task.id}
                className={cn(
                  "border-border rounded-lg border px-4 py-3",
                  active && "border-primary/40 bg-primary/5",
                  done && "opacity-70",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-foreground font-medium">
                    {index + 1}. {task.title}
                  </p>
                  <span className="font-mono text-xs tracking-wide uppercase">
                    {done ? "Done" : active ? "Current" : "Next"}
                  </span>
                </div>
                {active ? (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHintOpen((open) => !open)}
                      aria-expanded={hintOpen}
                    >
                      {hintOpen ? "Hide hint" : "Show hint"}
                    </Button>
                    {hintOpen ? (
                      <p className="text-muted-foreground mt-2 text-sm">
                        Hint: {task.hint}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={CHALLENGE_SUGGESTIONS}
          suggestionsLabel="Quick actions"
          onCommand={(command, state) => advanceChallenge(state, command)}
        />

        {challengeComplete ? (
          <Callout title="Nice work">
            <p>Nice work — you can now navigate the Linux filesystem.</p>
          </Callout>
        ) : null}
      </div>
    </div>
  );
}
