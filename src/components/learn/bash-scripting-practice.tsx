"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";

const HELLO_SCRIPT = `cat > hello.sh <<'EOF'
#!/bin/bash
echo "Hello, Linux!"
EOF`;

const VAR_SCRIPT = `cat > greeting.sh <<'EOF'
#!/bin/bash
NAME="Bunsal"
echo "Hello, $NAME!"
EOF`;

const READ_SCRIPT = `cat > read-name.sh <<'EOF'
#!/bin/bash
echo "What is your name?"
read NAME
echo "Hello, $NAME!"
EOF`;

const IF_SCRIPT = `cat > status.sh <<'EOF'
#!/bin/bash
STATUS="success"
if [ "$STATUS" = "success" ]; then
  echo "Task completed."
fi
EOF`;

const ELSE_SCRIPT = `cat > status.sh <<'EOF'
#!/bin/bash
STATUS="failed"
if [ "$STATUS" = "success" ]; then
  echo "Task completed."
else
  echo "Task failed."
fi
EOF`;

const FOR_SCRIPT = `cat > greet-all.sh <<'EOF'
#!/bin/bash
for NAME in Alice Bob Charlie
do
  echo "Hello, $NAME"
done
EOF`;

const WHILE_SCRIPT = `cat > count.sh <<'EOF'
#!/bin/bash
COUNT=1
while [ "$COUNT" -le 3 ]
do
  echo "Count: $COUNT"
  COUNT=$((COUNT + 1))
done
EOF`;

const COMBINED_SCRIPT = `cat > check.sh <<'EOF'
#!/bin/bash
STATUS="success"
if [ "$STATUS" = "success" ]; then
  echo "Ready"
else
  echo "Not ready"
fi
EOF`;

const REVIEW_SCRIPT = `cat > review.sh <<'EOF'
#!/bin/bash
# shebang above identifies the interpreter
NAME="Learner"
STATUS="success"
if [ "$STATUS" = "success" ]; then
  for ITEM in one two
  do
    echo "$NAME: $ITEM"
  done
fi
EOF`;

const PRACTICE_STEPS = [
  {
    command: HELLO_SCRIPT,
    display: "cat > hello.sh <<'EOF' …",
    lookFor: "A confirmation that `hello.sh` was written in the simulator.",
  },
  {
    command: "bash hello.sh",
    display: "bash hello.sh",
    lookFor: "`Hello, Linux!`",
  },
  {
    command: VAR_SCRIPT,
    display: "cat > greeting.sh <<'EOF' …",
    lookFor: "Confirmation that `greeting.sh` was written.",
  },
  {
    command: "bash greeting.sh",
    display: "bash greeting.sh",
    lookFor: "`Hello, Bunsal!`",
  },
  {
    command: READ_SCRIPT,
    display: "cat > read-name.sh <<'EOF' …",
    lookFor: "Confirmation that `read-name.sh` was written.",
  },
  {
    command: "bash read-name.sh",
    display: "bash read-name.sh",
    lookFor: "`What is your name?` then `Hello, Alice!` (simulated input).",
  },
  {
    command: IF_SCRIPT,
    display: "cat > status.sh <<'EOF' … (if)",
    lookFor: "Confirmation that `status.sh` was written with an `if` branch.",
  },
  {
    command: "bash status.sh",
    display: "bash status.sh",
    lookFor: "`Task completed.`",
  },
  {
    command: ELSE_SCRIPT,
    display: "cat > status.sh <<'EOF' … (else)",
    lookFor: "Confirmation that `status.sh` now includes an `else` branch.",
  },
  {
    command: "bash status.sh",
    display: "bash status.sh",
    lookFor: "`Task failed.`",
  },
  {
    command: FOR_SCRIPT,
    display: "cat > greet-all.sh <<'EOF' …",
    lookFor: "Confirmation that `greet-all.sh` was written.",
  },
  {
    command: "bash greet-all.sh",
    display: "bash greet-all.sh",
    lookFor: "Hello lines for Alice, Bob, and Charlie.",
  },
  {
    command: WHILE_SCRIPT,
    display: "cat > count.sh <<'EOF' …",
    lookFor: "Confirmation that `count.sh` was written.",
  },
  {
    command: "bash count.sh",
    display: "bash count.sh",
    lookFor: "`Count: 1`, `Count: 2`, and `Count: 3`.",
  },
  {
    command: COMBINED_SCRIPT,
    display: "cat > check.sh <<'EOF' …",
    lookFor: "Confirmation that `check.sh` was written.",
  },
  {
    command: "bash check.sh",
    display: "bash check.sh",
    lookFor: "`Ready`",
  },
  {
    command: REVIEW_SCRIPT,
    display: "cat > review.sh <<'EOF' …",
    lookFor: "Confirmation that `review.sh` was written.",
  },
  {
    command: "cat review.sh",
    display: "cat review.sh",
    lookFor:
      "The shebang, `NAME`, the `if` condition, and the `for` loop in one script.",
  },
] as const;

const PRACTICE_SUGGESTIONS = PRACTICE_STEPS.map((step) => ({
  command: step.command,
  label: step.display,
}));

/** Track ordered practice steps that reuse the same command string. */
function matchNextStep(ran: readonly string[], command: string): string | null {
  const nextIndex = ran.length;
  const nextStep = PRACTICE_STEPS[nextIndex];
  if (!nextStep || nextStep.command !== command) {
    return null;
  }
  return command;
}

export function BashScriptingPractice() {
  const [ran, setRan] = useState<readonly string[]>([]);

  const complete = ran.length >= PRACTICE_STEPS.length;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Build Small Bash Scripts
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Create simulated
          scripts, expand variables, use simulated{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            read
          </code>
          , and practice{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            if
          </code>
          /{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            else
          </code>
          ,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            for
          </code>
          , and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            while
          </code>
          .
        </p>
        <ol className="list-decimal space-y-3 pl-5">
          {PRACTICE_STEPS.map((step, index) => (
            <li key={`${step.display}-${index}`}>
              <p>
                Run{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {step.display}
                </code>
                .
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Look for: {step.lookFor}
              </p>
            </li>
          ))}
        </ol>
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Bash Scripting Challenge
          </p>
          <p className="text-muted-foreground text-sm">Think about:</p>
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            <li>
              <p>
                Why does{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  NAME=&quot;Bunsal&quot;
                </code>{" "}
                fail if you add spaces around{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  =
                </code>
                ?
              </p>
            </li>
            <li>
              <p>
                What closes an{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  if
                </code>{" "}
                block, and what closes a{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  for
                </code>{" "}
                or{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  while
                </code>{" "}
                loop?
              </p>
            </li>
            <li>
              <p>
                Why must a{" "}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  while
                </code>{" "}
                loop change its condition eventually?
              </p>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never runs a real shell, never
          collects real keyboard secrets beyond the teaching demo, and never
          touches the host filesystem.
        </p>
      </div>

      <TerminalSimulator
        bashScripting
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Practice commands"
        onCommandRun={(command) => {
          const normalized = command.trimEnd();
          setRan((prev) => {
            if (prev.length >= PRACTICE_STEPS.length) {
              return prev;
            }
            const matched = matchNextStep(prev, normalized);
            if (!matched) {
              return prev;
            }
            return [...prev, matched];
          });
        }}
      />

      {complete ? (
        <Callout title="Nice work!">
          <p>
            You created simulated scripts, expanded variables, used simulated{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              read
            </code>
            , practiced{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              if
            </code>
            /
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              else
            </code>
            , and ran{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              for
            </code>{" "}
            and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              while
            </code>{" "}
            loops. Challenge answers: spaces around{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              =
            </code>{" "}
            break assignment;{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              fi
            </code>{" "}
            closes{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              if
            </code>
            , and{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              done
            </code>{" "}
            closes loops; a{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              while
            </code>{" "}
            loop that never becomes false would run forever.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
