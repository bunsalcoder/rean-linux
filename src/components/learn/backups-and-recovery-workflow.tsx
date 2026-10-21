"use client";

import { useState } from "react";

import { Callout } from "@/components/learn/callout";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { Button } from "@/components/ui/button";
import {
  REPORT_CONTENT,
  createInitialBackupState,
  getFileContent,
  listArchives,
  pathExists,
  workflowCreateArchive,
  workflowDeleteFile,
  workflowRestoreArchive,
  workflowVerifyArchive,
  type SimulatedBackupState,
} from "@/lib/simulate-backups-and-recovery";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  {
    id: "documents",
    label: "documents/",
    path: "documents/",
  },
  {
    id: "projects",
    label: "projects/",
    path: "projects/",
  },
] as const;

const DEST_OPTIONS = [
  {
    id: "docs-tar",
    label: "/backups/docs-backup.tar",
    path: "/backups/docs-backup.tar",
    compressed: false,
  },
  {
    id: "docs-tgz",
    label: "/backups/docs-backup.tar.gz",
    path: "/backups/docs-backup.tar.gz",
    compressed: true,
  },
  {
    id: "projects-tgz",
    label: "/backups/projects-backup.tar.gz",
    path: "/backups/projects-backup.tar.gz",
    compressed: true,
  },
] as const;

const WORKFLOW_SUGGESTIONS = [
  { command: "ls -lh documents", label: "ls -lh documents" },
  {
    command: "tar -cvf /backups/docs-backup.tar documents/",
    label: "tar create",
  },
  {
    command: "tar -tvf /backups/docs-backup.tar",
    label: "tar list",
  },
  {
    command: "tar -xvf /backups/docs-backup.tar -C /tmp/restore-test",
    label: "safe restore",
  },
  { command: "ls -lh /backups", label: "ls /backups" },
  { command: "df -h", label: "df -h" },
  { command: "help", label: "help" },
] as const;

const STEPS = [
  "Choose source and destination",
  "Create archive",
  "Inspect contents",
  "Verify backup",
  "Simulate file loss",
  "Restore safely",
  "Confirm restored content",
] as const;

export function BackupsAndRecoveryWorkflow() {
  const [terminalKey, setTerminalKey] = useState(0);
  const [state, setState] = useState<SimulatedBackupState>(() =>
    createInitialBackupState("healthy"),
  );
  const [sourceId, setSourceId] =
    useState<(typeof SOURCE_OPTIONS)[number]["id"]>("documents");
  const [destId, setDestId] =
    useState<(typeof DEST_OPTIONS)[number]["id"]>("docs-tar");
  const [log, setLog] = useState<string[]>([]);
  const [completed, setCompleted] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const source = SOURCE_OPTIONS.find((item) => item.id === sourceId)!;
  const dest = DEST_OPTIONS.find((item) => item.id === destId)!;
  const archives = listArchives(state);
  const reportPath = `${state.cwd}/documents/report.txt`;
  const reportPresent = pathExists(state, "documents/report.txt");
  const reportContent = getFileContent(state, "documents/report.txt");
  const reportMatches =
    reportContent !== null && reportContent === REPORT_CONTENT;

  function appendLog(lines: readonly string[]) {
    setLog((prev) => [...prev, ...lines, ""]);
  }

  function markStep(step: number) {
    setCompleted((prev) => new Set(prev).add(step));
  }

  function resetLab() {
    setState(createInitialBackupState("healthy"));
    setLog([]);
    setCompleted(new Set());
    setConfirmDelete(false);
    setTerminalKey((value) => value + 1);
  }

  function handleCreate() {
    const result = workflowCreateArchive(
      state,
      source.path,
      dest.path,
      dest.compressed,
    );
    setState(result.state);
    appendLog(result.lines);
    if (result.ok) {
      markStep(0);
      markStep(1);
    }
    setTerminalKey((value) => value + 1);
  }

  function handleInspect() {
    const result = workflowVerifyArchive(state, dest.path);
    setState(result.state);
    appendLog(result.lines);
    if (result.ok) {
      markStep(2);
      markStep(3);
    }
  }

  function handleSimulateLoss() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const result = workflowDeleteFile(state, "documents/report.txt");
    setState(result.state);
    appendLog(result.lines);
    if (result.ok) {
      markStep(4);
    }
    setConfirmDelete(false);
    setTerminalKey((value) => value + 1);
  }

  function handleSafeRestore() {
    const result = workflowRestoreArchive(
      state,
      dest.path,
      "/tmp/restore-test",
    );
    setState(result.state);
    appendLog(result.lines);
    if (result.ok) {
      markStep(5);
    }
    setTerminalKey((value) => value + 1);
  }

  function handleInplaceRestore() {
    const result = workflowRestoreArchive(state, dest.path, null);
    setState(result.state);
    appendLog(result.lines);
    if (result.ok) {
      markStep(5);
      if (
        getFileContent(result.state, "documents/report.txt") === REPORT_CONTENT
      ) {
        markStep(6);
      }
    }
    setTerminalKey((value) => value + 1);
  }

  function handleVerifyRestore() {
    const content = getFileContent(state, "documents/report.txt");
    if (content === null) {
      appendLog([
        "documents/report.txt is still missing — restore from a verified archive first.",
      ]);
      return;
    }
    if (content === REPORT_CONTENT) {
      appendLog([
        "Verification OK: restored report.txt matches the original simulated content.",
      ]);
      markStep(6);
    } else {
      appendLog([
        "Verification failed: restored content does not match the original sample.",
        `Found: ${content.slice(0, 80)}`,
      ]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Interactive backup workflow
        </h3>
        <p className="text-muted-foreground text-sm">
          Walk through a full create → verify → lose → restore loop. Every
          action updates in-memory lab state only — your computer&apos;s files
          are never touched.
        </p>
      </div>

      <ol className="space-y-1.5">
        {STEPS.map((label, index) => {
          const done = completed.has(index);
          return (
            <li
              key={label}
              className={cn(
                "text-sm",
                done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="font-mono text-xs">{done ? "[x]" : "[ ]"}</span>{" "}
              {index + 1}. {label}
            </li>
          );
        })}
      </ol>

      <div className="border-border grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            1. Directory to back up
          </p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={sourceId === item.id ? "default" : "outline"}
                onClick={() => setSourceId(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-foreground text-sm font-medium">
            2. Backup filename / destination
          </p>
          <div className="flex flex-wrap gap-2">
            {DEST_OPTIONS.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                variant={destId === item.id ? "default" : "outline"}
                onClick={() => setDestId(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleCreate}>
          3. Create archive
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleInspect}
        >
          4–5. Inspect &amp; verify
        </Button>
        <Button
          type="button"
          size="sm"
          variant={confirmDelete ? "destructive" : "outline"}
          onClick={handleSimulateLoss}
        >
          {confirmDelete
            ? "Confirm simulated deletion"
            : "6. Simulate loss of report.txt"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleSafeRestore}
        >
          7a. Restore to /tmp/restore-test
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleInplaceRestore}
        >
          7b. Restore in place
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleVerifyRestore}
        >
          8. Verify restored content
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={resetLab}>
          Reset lab
        </Button>
      </div>

      {confirmDelete ? (
        <Callout title="Simulated deletion only">
          <p>
            Confirming removes{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              documents/report.txt
            </code>{" "}
            from the in-memory lab — not from your computer. Click the button
            again to proceed, or reset the lab to cancel.
          </p>
        </Callout>
      ) : null}

      <div className="border-border bg-muted/30 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-sm font-medium">Lab status</p>
        <p className="text-sm">
          <strong className="text-foreground">report.txt:</strong>{" "}
          {reportPresent
            ? reportMatches
              ? "present (matches original)"
              : "present (content differs)"
            : "missing"}
        </p>
        <p className="text-sm">
          <strong className="text-foreground">Path:</strong>{" "}
          <span className="font-mono text-xs">{reportPath}</span>
        </p>
        <p className="text-sm">
          <strong className="text-foreground">Archives:</strong>{" "}
          {archives.length === 0
            ? "none yet"
            : archives
                .map(
                  (item) =>
                    `${item.path}${item.intact ? "" : " (damaged)"}${item.compressed ? " [gz]" : ""}`,
                )
                .join(", ")}
        </p>
        <p className="text-muted-foreground text-xs">
          Restore history entries this session: {state.restoreHistory.length}
        </p>
      </div>

      {log.length > 0 ? (
        <pre className="bg-muted max-h-48 overflow-auto rounded-lg p-3 font-mono text-xs leading-relaxed sm:text-sm">
          {log.join("\n")}
        </pre>
      ) : null}

      <Callout title="Simulation safety">
        <p>
          Archives, deletions, and restores stay in browser memory. Prefer a
          safe restore into{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /tmp/restore-test
          </code>{" "}
          before replacing an existing file.
        </p>
      </Callout>

      <TerminalSimulator
        key={terminalKey}
        backupsAndRecovery={state}
        suggestions={WORKFLOW_SUGGESTIONS}
        suggestionsLabel="Backup commands"
        onBackupsAndRecoveryChange={setState}
      />
    </div>
  );
}
