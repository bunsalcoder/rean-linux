"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  getAclScenario,
  hasDefaultAclEntry,
  hasNamedUserAcl,
  lacksNamedUserAcl,
  maskAllows,
  userCan,
  type AclScenarioId,
  type SimulatedAclState,
} from "@/lib/simulate-security-permissions-acls";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  scenarioId: AclScenarioId;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  requireState?: (state: SimulatedAclState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    return normalized === target || normalized.startsWith(`${target} `);
  });
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "inspect-modes",
    title: "Exercise 1 — Read Standard Modes and the ACL Marker",
    scenarioId: "explore",
    task: "List `/srv/projects/app.conf` and `/srv/projects/deploy.sh`. Note which listing ends with `+` (extended ACL) and what `640` vs `750` means for owner/group/other.",
    hint: "Run `ls -l /srv/projects/app.conf` and `ls -l /srv/projects/deploy.sh`. A trailing `+` means ACL entries exist beyond the three mode triplets.",
    relevantCommands: [
      "ls -l /srv/projects/app.conf",
      "ls -l /srv/projects/deploy.sh",
      "getfacl /srv/projects/app.conf",
      "stat /srv/projects/app.conf",
    ],
    options: [
      {
        key: "A",
        label:
          "`640` is rw-r-----; `750` is rwxr-x---; a trailing `+` means extended ACL entries are present",
      },
      {
        key: "B",
        label: "A trailing `+` always means the sticky bit is set",
      },
      {
        key: "C",
        label: "`640` grants world write; `750` removes owner execute",
      },
      {
        key: "D",
        label:
          "Standard modes and ACLs are identical and interchangeable labels",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Learn to read the three triplets first, then treat `+` as a signal to run getfacl.",
    feedbackIncorrect:
      "Compare the two listings, decode 640 vs 750, and check whether `+` appears before concluding.",
  },
  {
    id: "grant-analyst",
    title: "Exercise 2 — Grant Specific Named-User Read Access",
    scenarioId: "grant-access",
    task: "`/srv/projects/app.conf` is `640` for deploy/deployers. Give analyst read access without making the file world-readable.",
    hint: "Inspect with `getfacl`, then `setfacl -m u:analyst:r-- /srv/projects/app.conf`. Avoid `chmod o+r`.",
    relevantCommands: [
      "ls -l /srv/projects/app.conf",
      "getfacl /srv/projects/app.conf",
      "setfacl -m u:analyst:r-- /srv/projects/app.conf",
      "check-access analyst /srv/projects/app.conf",
    ],
    options: [
      {
        key: "A",
        label:
          "A named-user ACL entry grants analyst read without opening the file to every other user",
      },
      {
        key: "B",
        label: "chmod 777 is the least-privilege way to help one analyst",
      },
      {
        key: "C",
        label: "Only the owning group can ever receive additional access",
      },
      {
        key: "D",
        label: "World-readable mode is required whenever ACLs are used",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasNamedUserAcl(state, "/srv/projects/app.conf", "analyst", {
        r: true,
        w: false,
      }) && !userCan(state, "/srv/projects/app.conf", "contractor", "r"),
    stateHint:
      "Apply setfacl -m u:analyst:r-- on app.conf (and keep others without read) before answering.",
    feedbackCorrect:
      "Correct. ACLs exist for precise grants — broaden deliberately, never “just to make the error go away.”",
    feedbackIncorrect:
      "Use setfacl for analyst read, then verify with getfacl or check-access. Do not chmod o+r.",
  },
  {
    id: "mask-effective",
    title: "Exercise 3 — Diagnose Listed vs Effective Permissions",
    scenarioId: "mask-diagnosis",
    task: "Contractor’s ACL entry on `quarterly.csv` lists write, but effective write is denied. Identify why, then widen the mask so write becomes effective without deleting the entry.",
    hint: "Run `getfacl /srv/reports/quarterly.csv` and look for `#effective:`. Then `setfacl -m m::rw- /srv/reports/quarterly.csv`.",
    relevantCommands: [
      "getfacl /srv/reports/quarterly.csv",
      "check-access contractor /srv/reports/quarterly.csv",
      "setfacl -m m::rw- /srv/reports/quarterly.csv",
    ],
    options: [
      {
        key: "A",
        label:
          "The ACL mask intersects named-user rights; listed write can be ineffective until the mask allows write",
      },
      {
        key: "B",
        label: "Named-user ACL entries ignore the mask completely",
      },
      {
        key: "C",
        label: "Effective permissions always equal the other:: bits",
      },
      {
        key: "D",
        label:
          "getfacl never shows the difference between listed and effective rights",
      },
    ],
    correct: "A",
    requireState: (state) =>
      maskAllows(state, "/srv/reports/quarterly.csv", { r: true, w: true }) &&
      userCan(state, "/srv/reports/quarterly.csv", "contractor", "w"),
    stateHint:
      "Raise the ACL mask to include write (m::rw-) so contractor’s listed write becomes effective.",
    feedbackCorrect:
      "Correct. Always read both the entry and `#effective:` — the mask can silently reduce access.",
    feedbackIncorrect:
      "Inspect getfacl for #effective, update the mask with setfacl -m m::rw-, then re-check.",
  },
  {
    id: "remove-tempadmin",
    title: "Exercise 4 — Remove Excess Named-User Access",
    scenarioId: "remove-excess",
    task: "`app.conf` has an unnecessary `tempadmin` ACL entry. Remove only that excess access; keep analyst’s read entry.",
    hint: "Confirm with `getfacl`, then `setfacl -x u:tempadmin /srv/projects/app.conf`.",
    relevantCommands: [
      "getfacl /srv/projects/app.conf",
      "setfacl -x u:tempadmin /srv/projects/app.conf",
      "check-access tempadmin /srv/projects/app.conf",
    ],
    options: [
      {
        key: "A",
        label:
          "Remove the unnecessary named-user entry with setfacl -x without wiping unrelated ACL grants",
      },
      {
        key: "B",
        label: "chmod 000 and hope everyone still has what they need",
      },
      {
        key: "C",
        label: "Delete the file instead of trimming one ACL entry",
      },
      {
        key: "D",
        label: "Add world write so tempadmin is no longer special",
      },
    ],
    correct: "A",
    requireState: (state) =>
      lacksNamedUserAcl(state, "/srv/projects/app.conf", "tempadmin") &&
      hasNamedUserAcl(state, "/srv/projects/app.conf", "analyst", { r: true }),
    stateHint:
      "Remove only u:tempadmin while leaving analyst’s ACL entry in place.",
    feedbackCorrect:
      "Correct. Least privilege means the smallest change that removes excess access.",
    feedbackIncorrect:
      "Use setfacl -x u:tempadmin, then confirm analyst remains and tempadmin cannot read.",
  },
  {
    id: "default-acl",
    title: "Exercise 5 — Configure a Default ACL on a Directory",
    scenarioId: "default-acls",
    task: "`/srv/shared` needs a default ACL so new files grant the `reports` group read access. Set and inspect the default ACL.",
    hint: "Use `setfacl -d -m g:reports:r-- /srv/shared`, then `getfacl /srv/shared`. Optionally `touch /srv/shared/new-note.txt` and getfacl the child.",
    relevantCommands: [
      "getfacl /srv/shared",
      "setfacl -d -m g:reports:r-- /srv/shared",
      "touch /srv/shared/new-note.txt",
      "getfacl /srv/shared/new-note.txt",
    ],
    options: [
      {
        key: "A",
        label:
          "Default ACLs on a directory shape access ACL inheritance for newly created children — they do not replace the directory’s existing access ACL",
      },
      {
        key: "B",
        label:
          "Default ACLs rewrite every existing file under the directory immediately",
      },
      {
        key: "C",
        label: "Default ACLs only apply to the sticky bit on /tmp",
      },
      {
        key: "D",
        label: "setfacl -d deletes the directory’s access ACL",
      },
    ],
    correct: "A",
    requireState: (state) =>
      hasDefaultAclEntry(state, "/srv/shared", "group", "reports", {
        r: true,
      }),
    stateHint:
      "Apply a default group ACL for reports on /srv/shared before answering.",
    feedbackCorrect:
      "Correct. Access ACLs govern the object now; default ACLs influence what new children inherit.",
    feedbackIncorrect:
      "Set a default ACL with setfacl -d -m, then inspect getfacl for default: lines.",
  },
  {
    id: "verify-effective",
    title: "Exercise 6 — Decide Effective Access from Modes + ACL",
    scenarioId: "verify-effective",
    task: "Using `getfacl` / `check-access`, decide whether contractor can write `/srv/reports/quarterly.csv` in this scenario’s initial state.",
    hint: "Look at the named-user entry and the mask. Listed `rw-` with mask `r--` means effective write is false.",
    relevantCommands: [
      "getfacl /srv/reports/quarterly.csv",
      "ls -l /srv/reports/quarterly.csv",
      "check-access contractor /srv/reports/quarterly.csv",
    ],
    options: [
      {
        key: "A",
        label:
          "No — contractor’s listed write is limited by the ACL mask, so effective write is denied",
      },
      {
        key: "B",
        label:
          "Yes — any named-user rw- entry always grants write regardless of mask",
      },
      {
        key: "C",
        label: "Yes — contractor is the file owner",
      },
      {
        key: "D",
        label: "No — other:: always blocks named users first",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Owner, named-user (+ mask), group-class (+ mask), then other — evaluate in that order.",
    feedbackIncorrect:
      "Inspect getfacl for contractor’s entry and #effective, or use check-access.",
  },
] as const;

const PRACTICE_SUGGESTIONS = [
  { command: "ls -l /srv/projects", label: "ls projects" },
  { command: "getfacl /srv/projects/app.conf", label: "getfacl app.conf" },
  { command: "getfacl /srv/reports/quarterly.csv", label: "getfacl csv" },
  { command: "getfacl /srv/shared", label: "getfacl shared" },
  {
    command: "check-access analyst /srv/projects/app.conf",
    label: "check analyst",
  },
  { command: "help", label: "help" },
] as const;

export function SecurityPermissionsAclsPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [terminalKey, setTerminalKey] = useState(0);
  const [stateReady, setStateReady] = useState(
    () => !EXERCISES[0]?.requireState,
  );
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const aclRef = useRef<SimulatedAclState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const scenario = getAclScenario(exercise.scenarioId);
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedAclState) {
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    aclRef.current = null;
    setStateReady(!exercise.requireState);
  }

  function resetExerciseInteraction() {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    resetTerminal();
  }

  function goToExercise(nextIndex: number) {
    const next = EXERCISES[nextIndex]!;
    setExerciseIndex(nextIndex);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    setRanRelevant(false);
    aclRef.current = null;
    setStateReady(!next.requireState);
    setTerminalKey((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice: Permissions and ACLs
        </h3>
        <p>
          <strong className="text-foreground">Goal:</strong> Read modes and ACL
          output, grant or remove named access deliberately, understand masks
          and default ACLs, and verify effective rights in the simulator.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {EXERCISES.map((item, index) => {
            const done = completed.has(item.id);
            const active = index === exerciseIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToExercise(index)}
                  className={cn(
                    "text-left transition-colors",
                    active && "text-foreground font-medium",
                    done && !active && "text-muted-foreground line-through",
                    !done &&
                      !active &&
                      "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.title}
                  {done ? " ✓" : null}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            {exercise.title}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Scenario:</strong>{" "}
            {scenario.label}
          </p>
          <p className="text-sm">
            <strong className="text-foreground">Context:</strong>{" "}
            {scenario.summary}
          </p>
          <p className="text-sm">{exercise.task}</p>
          <p className="text-muted-foreground text-sm">
            Useful commands:{" "}
            {exercise.relevantCommands.map((command, index) => (
              <span key={command}>
                {index > 0 ? ", " : null}
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
                  {command}
                </code>
              </span>
            ))}
          </p>
        </div>

        <p className="text-muted-foreground text-sm">
          This terminal is simulated — it never touches host files, users, or
          real ACL tools.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={resetTerminal}>
          Reset scenario
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowHint((value) => !value)}
        >
          {showHint ? "Hide hint" : "Show hint"}
        </Button>
      </div>

      {showHint ? (
        <Callout title="Hint">
          <p>{exercise.hint}</p>
        </Callout>
      ) : null}

      <TerminalSimulator
        key={`${exercise.id}-${terminalKey}`}
        securityPermissionsAcls={exercise.scenarioId}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="ACL lab commands"
        onSecurityPermissionsAclsChange={(state) => {
          aclRef.current = state;
          syncStateReady(state);
        }}
        onCommandRun={(command) => {
          if (commandMatchesHint(command, exercise.relevantCommands)) {
            setRanRelevant(true);
          }
        }}
      />

      <div className="space-y-3">
        <p className="text-foreground font-medium">
          What is the best conclusion?
        </p>
        <ul className="space-y-2">
          {exercise.options.map((option) => {
            const isSelected = selected === option.key;
            const showResult = submitted && isSelected;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  disabled={submitted && completed.has(exercise.id)}
                  onClick={() => {
                    if (submitted && completed.has(exercise.id)) {
                      return;
                    }
                    setSelected(option.key);
                    setSubmitted(false);
                  }}
                  className={cn(
                    "border-border bg-background hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                    isSelected &&
                      !submitted &&
                      "border-primary/50 bg-primary/5",
                    showResult &&
                      isCorrect &&
                      stateReady &&
                      "border-green-600/40 bg-green-500/10",
                    showResult &&
                      (!isCorrect || !stateReady) &&
                      "border-destructive/40 bg-destructive/10",
                  )}
                >
                  <span className="text-muted-foreground font-mono text-xs font-medium">
                    {option.key}.
                  </span>
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {!submitted || !(isCorrect && stateReady) ? (
          <Button
            type="button"
            disabled={!selected || (submitted && isCorrect && stateReady)}
            onClick={() => {
              setSubmitted(true);
              if (selected === exercise.correct && stateReady) {
                setCompleted((prev) => {
                  const next = new Set(prev);
                  next.add(exercise.id);
                  return next;
                });
              }
            }}
          >
            Check answer
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={resetExerciseInteraction}
        >
          Retry
        </Button>
        {exerciseIndex < EXERCISES.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => goToExercise(exerciseIndex + 1)}
          >
            Next exercise
          </Button>
        ) : null}
      </div>

      {submitted ? (
        <Callout
          title={
            isCorrect && stateReady
              ? "Correct"
              : isCorrect && !stateReady
                ? "Almost — finish the ACL change"
                : "Not quite"
          }
        >
          <p>
            {isCorrect && stateReady
              ? exercise.feedbackCorrect
              : isCorrect && !stateReady
                ? (exercise.stateHint ??
                  "Complete the required simulated change, then check again.")
                : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Tip: run at least one suggested inspection command so your
              conclusion is based on evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Practice complete">
          <p>
            You finished all six exercises. Continue to the interactive ACL
            laboratory or the final knowledge check when ready.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
