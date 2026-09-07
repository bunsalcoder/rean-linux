"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import {
  createLearnerHomeFs,
  hasExerciseProjectFile,
} from "@/lib/simulated-filesystem";

const PRACTICE_SUGGESTIONS = [
  { command: "pwd", label: "Run pwd" },
  { command: "ls", label: "Run ls" },
  { command: "mkdir projects", label: "Run mkdir projects" },
  { command: "cd projects", label: "Run cd projects" },
  { command: "touch hello.txt", label: "Run touch hello.txt" },
  { command: "cat hello.txt", label: "Run cat hello.txt" },
  "help",
] as const;

export function FirstCommandsPractice() {
  const [complete, setComplete] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Try it yourself
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Create a directory
          called{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            projects
          </code>
          , create a file called{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            hello.txt
          </code>{" "}
          inside it, and then read the file.
        </p>
        <p>Hints:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Create the directory.</li>
          <li>Enter the directory.</li>
          <li>Create the file.</li>
          <li>List the files.</li>
          <li>Read the file.</li>
        </ol>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated. Nothing on your computer is created or
          deleted.
        </p>
      </div>

      <TerminalSimulator
        filesystem={createLearnerHomeFs()}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Quick actions"
        onFsChange={(state) => {
          if (hasExerciseProjectFile(state)) {
            setComplete(true);
          }
        }}
      />

      {complete ? (
        <Callout title="Nice work!">
          <p>
            You just created your first directory, created a file, and navigated
            the Linux filesystem from the command line.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
