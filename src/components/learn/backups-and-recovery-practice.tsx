"use client";

import { useRef, useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  REPORT_CONTENT,
  createInitialBackupState,
  getFileContent,
  listArchives,
  simulateBackupsAndRecoveryCommand,
  type SimulatedBackupState,
} from "@/lib/simulate-backups-and-recovery";
import { cn } from "@/lib/utils";

type PracticeExercise = {
  id: string;
  title: string;
  task: string;
  hint: string;
  relevantCommands: readonly string[];
  options: readonly { key: string; label: string }[];
  correct: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  initialState: () => SimulatedBackupState;
  requireState?: (state: SimulatedBackupState) => boolean;
  stateHint?: string;
};

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function commandMatchesHint(command: string, candidates: readonly string[]) {
  const normalized = normalizeCommand(command);
  return candidates.some((candidate) => {
    const target = normalizeCommand(candidate);
    if (target.startsWith("tar ")) {
      return normalized.startsWith("tar ");
    }
    if (target.startsWith("ls")) {
      return normalized.startsWith("ls");
    }
    if (target.startsWith("df")) {
      return normalized === "df" || normalized === "df -h";
    }
    if (target.startsWith("gzip")) {
      return normalized.startsWith("gzip");
    }
    if (target.startsWith("cat")) {
      return normalized.startsWith("cat");
    }
    if (target.startsWith("rm")) {
      return normalized.startsWith("rm");
    }
    return normalized === target;
  });
}

function withDocsArchive(state: SimulatedBackupState): SimulatedBackupState {
  return simulateBackupsAndRecoveryCommand(
    "tar -cvf /backups/docs-backup.tar documents/",
    state,
  ).state;
}

function withMissingReport(): SimulatedBackupState {
  const archived = withDocsArchive(createInitialBackupState("healthy"));
  return simulateBackupsAndRecoveryCommand("rm documents/report.txt", archived)
    .state;
}

const EXERCISES: readonly PracticeExercise[] = [
  {
    id: "create-tar",
    title: "Exercise 1 — Archive a directory",
    initialState: () => createInitialBackupState("healthy"),
    task: "Create a tar archive of documents/ at /backups/docs-backup.tar, then choose what you accomplished.",
    hint: "From ~ run `tar -cvf /backups/docs-backup.tar documents/`. Confirm with `ls -lh /backups`.",
    relevantCommands: [
      "tar -cvf /backups/docs-backup.tar documents/",
      "ls -lh /backups",
    ],
    options: [
      {
        key: "A",
        label:
          "A readable archive named /backups/docs-backup.tar now holds the documents tree",
      },
      {
        key: "B",
        label: "The documents directory was permanently deleted from the host",
      },
      {
        key: "C",
        label: "A real tape drive on your computer was written",
      },
      {
        key: "D",
        label: "df -h alone created the archive",
      },
    ],
    correct: "A",
    requireState: (state) =>
      listArchives(state).some(
        (item) => item.path === "/backups/docs-backup.tar" && item.intact,
      ),
    stateHint:
      "Create the archive with tar -cvf before answering — the lab must show /backups/docs-backup.tar.",
    feedbackCorrect:
      "Correct. Creating the archive records included files in simulated metadata — still verify before trusting it for recovery.",
    feedbackIncorrect:
      "Run the create command and list /backups so you can see the new archive in the simulation.",
  },
  {
    id: "compressed-backup",
    title: "Exercise 2 — Create a compressed backup",
    initialState: () => createInitialBackupState("healthy"),
    task: "Create a gzip-compressed archive of documents/ at /backups/docs-backup.tar.gz.",
    hint: "Use `tar -czvf /backups/docs-backup.tar.gz documents/`. The -z flag enables simulated gzip compression.",
    relevantCommands: [
      "tar -czvf /backups/docs-backup.tar.gz documents/",
      "ls -lh /backups",
    ],
    options: [
      {
        key: "A",
        label:
          "A compressed archive exists at /backups/docs-backup.tar.gz with simulated gzip status",
      },
      {
        key: "B",
        label: "Compression always deletes the source documents automatically",
      },
      {
        key: "C",
        label: "Only gunzip can create tar.gz backups",
      },
      {
        key: "D",
        label: "Compressed archives cannot be listed with tar",
      },
    ],
    correct: "A",
    requireState: (state) =>
      listArchives(state).some(
        (item) =>
          item.path === "/backups/docs-backup.tar.gz" &&
          item.compressed &&
          item.intact,
      ),
    stateHint: "Create the .tar.gz with tar -czvf before selecting an answer.",
    feedbackCorrect:
      "Correct. Compression reduces simulated size, but recoverability still depends on verification and a good destination.",
    feedbackIncorrect:
      "Create /backups/docs-backup.tar.gz with tar -czvf and confirm it with ls -lh /backups.",
  },
  {
    id: "inspect-before-restore",
    title: "Exercise 3 — Inspect before restoring",
    initialState: () => withDocsArchive(createInitialBackupState("healthy")),
    task: "List the contents of /backups/docs-backup.tar before any restore. Why inspect first?",
    hint: "Run `tar -tvf /backups/docs-backup.tar`. Look for Verification: OK and the listed paths.",
    relevantCommands: ["tar -tvf /backups/docs-backup.tar"],
    options: [
      {
        key: "A",
        label:
          "To confirm the archive is readable and contains the expected files before changing anything",
      },
      {
        key: "B",
        label: "Listing an archive restores all files automatically",
      },
      {
        key: "C",
        label: "Inspection is unnecessary if the filename looks correct",
      },
      {
        key: "D",
        label: "tar -tvf formats disks",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Always inspect and verify before restore — a filename is not proof the archive is intact.",
    feedbackIncorrect:
      "List the archive with tar -tvf and think about what you learn before extracting.",
  },
  {
    id: "identify-invalid",
    title: "Exercise 4 — Identify a missing or invalid backup",
    initialState: () => createInitialBackupState("damaged-archive"),
    task: "Inspect /backups/broken-docs.tar. What should you conclude?",
    hint: "Run `tar -tvf /backups/broken-docs.tar`. Damaged archives fail verification in this lab.",
    relevantCommands: ["tar -tvf /backups/broken-docs.tar", "ls -lh /backups"],
    options: [
      {
        key: "A",
        label:
          "Verification fails — treat it as unusable and do not restore from it",
      },
      {
        key: "B",
        label: "Any file under /backups is automatically a good backup",
      },
      {
        key: "C",
        label: "Damaged archives still restore silently without warnings",
      },
      {
        key: "D",
        label: "You should ignore verification and extract anyway",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. A damaged or incomplete archive must fail verification and must not be treated as a valid backup.",
    feedbackIncorrect:
      "List the broken archive and read the verification failure message carefully.",
  },
  {
    id: "restore-deleted",
    title: "Exercise 5 — Restore a deleted simulated file",
    initialState: withMissingReport,
    task: "documents/report.txt is missing. Restore it from /backups/docs-backup.tar and confirm the content.",
    hint: "Use `tar -xvf /backups/docs-backup.tar` (or -C /tmp/restore-test first), then `cat documents/report.txt`.",
    relevantCommands: [
      "tar -xvf /backups/docs-backup.tar",
      "tar -xvf /backups/docs-backup.tar -C /tmp/restore-test",
      "cat documents/report.txt",
    ],
    options: [
      {
        key: "A",
        label:
          "After a successful restore, report.txt is back and matches the original simulated text",
      },
      {
        key: "B",
        label: "rm permanently prevents any restore forever",
      },
      {
        key: "C",
        label: "Only df -h can bring files back",
      },
      {
        key: "D",
        label: "Restores always write to your real home directory",
      },
    ],
    correct: "A",
    requireState: (state) =>
      getFileContent(state, "documents/report.txt") === REPORT_CONTENT,
    stateHint:
      "Extract from /backups/docs-backup.tar and confirm cat documents/report.txt shows the original sample text.",
    feedbackCorrect:
      "Correct. Restoration updated only the simulated filesystem — always verify content after restore.",
    feedbackIncorrect:
      "Restore from the verified archive, then cat the file to confirm the original content returned.",
  },
  {
    id: "diagnose-failure",
    title: "Exercise 6 — Diagnose a backup failure",
    initialState: () => createInitialBackupState("low-space"),
    task: "Try creating /backups/docs-backup.tar from documents/. Why does it fail, and what else can go wrong?",
    hint: "Run the tar create command, then `df -h`. Wrong source paths also produce clear errors.",
    relevantCommands: [
      "tar -cvf /backups/docs-backup.tar documents/",
      "df -h",
      "tar -cvf /backups/x.tar missing-dir/",
    ],
    options: [
      {
        key: "A",
        label:
          "Insufficient simulated space on /backups (and wrong paths also fail with clear errors)",
      },
      {
        key: "B",
        label: "tar always succeeds even with zero free space",
      },
      {
        key: "C",
        label: "df -h creates free space automatically",
      },
      {
        key: "D",
        label: "Failures only happen on real hosts, never in labs",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Common failures include missing sources, incorrect paths, insufficient space, and incomplete archives — read the simulated errors.",
    feedbackIncorrect:
      "Attempt the create under the low-space scenario and read df -h plus the tar error text.",
  },
  {
    id: "why-verify",
    title: "Exercise 7 — Why restore verification matters",
    initialState: () => createInitialBackupState("healthy"),
    task: "Why must you verify restored files instead of assuming a backup worked?",
    hint: "Think about damaged archives, wrong sources, and silent assumptions. Listing and comparing content reduces risk.",
    relevantCommands: ["help", "ls -lh /backups"],
    options: [
      {
        key: "A",
        label:
          "Because a backup only counts if you can recover the right data — verify archives and restored content",
      },
      {
        key: "B",
        label:
          "Verification is optional if the archive filename includes “backup”",
      },
      {
        key: "C",
        label: "Linux never produces incomplete archives",
      },
      {
        key: "D",
        label: "cat alone creates backups",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. An archive is not automatically a reliable backup — quality depends on recoverability, verification, and storage.",
    feedbackIncorrect:
      "Focus on recoverability: you need evidence the archive is intact and restored files match what you need.",
  },
  {
    id: "choose-strategy",
    title: "Exercise 8 — Choose a backup strategy",
    initialState: () => createInitialBackupState("healthy"),
    task: "A small team needs nightly protection of /home documents with the ability to recover yesterday’s work after accidental deletion. Which approach fits best for this lab’s concepts?",
    hint: "Consider verified copies stored separately from the source, plus restore testing and RPO/RTO — not a single unchecked file on a full disk.",
    relevantCommands: ["help", "df -h", "ls -lh /backups"],
    options: [
      {
        key: "A",
        label:
          "Regular verified backups (for example nightly), stored separately from the source, with restore tests and awareness of RPO/RTO",
      },
      {
        key: "B",
        label:
          "One unverified archive on the same full disk, never tested, with no second copy",
      },
      {
        key: "C",
        label: "Skip backups and rely only on uptime monitoring",
      },
      {
        key: "D",
        label: "Keep only a damaged tar file and hope for the best",
      },
    ],
    correct: "A",
    feedbackCorrect:
      "Correct. Strategy includes what to protect, where to store it, verification, separate copies, and tested restores aligned with RPO/RTO.",
    feedbackIncorrect:
      "Prefer verified, separate, tested backups over a single unchecked copy on the same failing disk.",
  },
];

const PRACTICE_SUGGESTIONS = [
  {
    command: "tar -cvf /backups/docs-backup.tar documents/",
    label: "tar create",
  },
  {
    command: "tar -czvf /backups/docs-backup.tar.gz documents/",
    label: "tar create gz",
  },
  {
    command: "tar -tvf /backups/docs-backup.tar",
    label: "tar list",
  },
  {
    command: "tar -xvf /backups/docs-backup.tar",
    label: "tar extract",
  },
  { command: "ls -lh /backups", label: "ls /backups" },
  { command: "df -h", label: "df -h" },
  { command: "cat documents/report.txt", label: "cat report" },
  { command: "help", label: "help" },
] as const;

export function BackupsAndRecoveryPractice() {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [terminalKey, setTerminalKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ranRelevant, setRanRelevant] = useState(false);
  const [stateReady, setStateReady] = useState(
    () => !EXERCISES[0]?.requireState,
  );
  const [completed, setCompleted] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const backupRef = useRef<SimulatedBackupState | null>(null);

  const exercise = EXERCISES[exerciseIndex]!;
  const allDone = EXERCISES.every((item) => completed.has(item.id));
  const isCorrect = selected === exercise.correct;

  function syncStateReady(state: SimulatedBackupState) {
    backupRef.current = state;
    if (!exercise.requireState) {
      setStateReady(true);
      return;
    }
    setStateReady(exercise.requireState(state));
  }

  function goToExercise(index: number) {
    setExerciseIndex(index);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    setRanRelevant(false);
    setStateReady(!EXERCISES[index]?.requireState);
    setTerminalKey((value) => value + 1);
    backupRef.current = null;
  }

  function resetTerminal() {
    setTerminalKey((value) => value + 1);
    setRanRelevant(false);
    setStateReady(!exercise.requireState);
    backupRef.current = null;
  }

  function resetExerciseInteraction() {
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
    resetTerminal();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Practice Session
        </h3>
        <p className="text-muted-foreground text-sm">
          Work through eight exercises: create archives, compress, inspect, spot
          bad backups, restore, diagnose failures, and choose a strategy. Hints
          stay hidden until you ask.
        </p>
      </div>

      <div className="space-y-4">
        <ol className="flex flex-wrap gap-2">
          {EXERCISES.map((item, index) => {
            const done = completed.has(item.id);
            const active = index === exerciseIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToExercise(index)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    active && "border-primary bg-primary/10 text-foreground",
                    !active &&
                      done &&
                      "text-foreground border-green-600/40 bg-green-500/10",
                    !active &&
                      !done &&
                      "border-border text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  {index + 1}
                  {done ? " ✓" : ""}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            {exercise.title}
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

        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-foreground text-sm font-medium">
            Recovery checklist (preview)
          </p>
          <pre className="bg-muted overflow-x-auto rounded px-2 py-1.5 font-mono text-xs sm:text-sm">
            1. Identify the data that needs recovery{"\n"}
            2. Select a suitable verified backup{"\n"}
            3. Inspect the archive contents{"\n"}
            4. Choose a safe restore destination{"\n"}
            5. Restore the required data{"\n"}
            6. Verify restored files and content{"\n"}
            7. Document the result and review the backup process
          </pre>
        </div>

        <Callout title="Simulation safety">
          <p>
            This lab never runs real tar/gzip or writes backups to your disk.
            Deletions and restores affect in-memory state only.
          </p>
        </Callout>
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
        backupsAndRecovery={exercise.initialState()}
        suggestions={PRACTICE_SUGGESTIONS}
        suggestionsLabel="Backup commands"
        onBackupsAndRecoveryChange={syncStateReady}
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
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (!selected) {
              return;
            }
            setSubmitted(true);
            const stateOk =
              !exercise.requireState ||
              (backupRef.current
                ? exercise.requireState(backupRef.current)
                : false);
            setStateReady(stateOk);
            if (selected === exercise.correct && stateOk) {
              setCompleted((prev) => new Set(prev).add(exercise.id));
            }
          }}
        >
          Check answer
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetExerciseInteraction}
        >
          Retry exercise
        </Button>
        {exerciseIndex < EXERCISES.length - 1 ? (
          <Button
            type="button"
            variant="outline"
            disabled={!completed.has(exercise.id)}
            onClick={() => goToExercise(exerciseIndex + 1)}
          >
            Next exercise
          </Button>
        ) : null}
      </div>

      {submitted && selected ? (
        <Callout
          title={
            isCorrect && (!exercise.requireState || stateReady)
              ? "Correct"
              : "Not quite"
          }
        >
          <p>
            {isCorrect && (!exercise.requireState || stateReady)
              ? exercise.feedbackCorrect
              : isCorrect && exercise.requireState && !stateReady
                ? (exercise.stateHint ?? exercise.feedbackIncorrect)
                : exercise.feedbackIncorrect}
          </p>
          {!ranRelevant ? (
            <p className="mt-2">
              Tip: run at least one relevant backup command so your conclusion
              is based on simulated evidence.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {allDone ? (
        <Callout title="Nice work!">
          <p>
            You archived and compressed data, inspected before restore, rejected
            a damaged backup, restored a deleted file, diagnosed space/path
            failures, and chose a verification-aware strategy.
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
