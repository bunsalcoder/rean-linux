/**
 * Frontend-only backups / recovery simulation for Stage 03 Lesson 11.
 * Never runs real tar, gzip, gunzip, or shell commands.
 * Never reads, writes, or deletes files on the host filesystem.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_BACKUP_USER = "bunsal";
export const SIMULATED_BACKUP_HOST = "rean-linux";
export const SIMULATED_BACKUP_HOME = `/home/${SIMULATED_BACKUP_USER}`;
export const SIMULATED_BACKUP_TIMESTAMP = "2024-10-14 02:00:00";

export type BackupScenarioId = "healthy" | "low-space" | "damaged-archive";

export type SimulatedArchiveEntry = {
  /** Path stored inside the archive (relative). */
  path: string;
  content: string;
  sizeBytes: number;
};

export type SimulatedFsNode =
  | { type: "directory" }
  | { type: "file"; content: string }
  | {
      type: "archive";
      compressed: boolean;
      /** Damaged archives fail verification and must not restore. */
      intact: boolean;
      createdAt: string;
      sourceLabel: string;
      entries: readonly SimulatedArchiveEntry[];
      sizeBytes: number;
    };

export type RestoreHistoryEntry = {
  at: string;
  archive: string;
  destination: string;
  files: readonly string[];
  overwritten: boolean;
  mode: "inplace" | "safe-dir";
};

export type SimulatedBackupState = {
  scenarioId: BackupScenarioId;
  cwd: string;
  nodes: Record<string, SimulatedFsNode>;
  /** Simulated free bytes available for new archives under /backups. */
  backupsAvailBytes: number;
  backupsTotalBytes: number;
  restoreHistory: RestoreHistoryEntry[];
};

export type BackupScenarioMeta = {
  id: BackupScenarioId;
  label: string;
  description: string;
};

export type SimulateBackupResult = {
  result: SimulateResult;
  state: SimulatedBackupState;
};

export const BACKUP_SCENARIOS: readonly BackupScenarioMeta[] = [
  {
    id: "healthy",
    label: "Healthy lab",
    description:
      "Sample documents, roomy /backups, and enough space for archives.",
  },
  {
    id: "low-space",
    label: "Insufficient space",
    description:
      "Simulated /backups is nearly full — large archives should fail.",
  },
  {
    id: "damaged-archive",
    label: "Damaged archive",
    description:
      "A broken archive already sits in /backups and must fail verification.",
  },
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                              Show this help message",
  "  pwd                               Print the current directory",
  "  ls [PATH]                         List files and directories",
  "  ls -lh [PATH]                     List with simulated sizes",
  "  cd [PATH]                         Change directory",
  "  cat FILE                          Show file contents",
  "  rm FILE                           Remove a simulated file",
  "  mkdir PATH                        Create a simulated directory",
  "  df                                Show filesystem disk space",
  "  df -h                             Human-readable disk space",
  "  tar -cvf ARCHIVE SOURCE           Create an archive",
  "  tar -czvf ARCHIVE SOURCE          Create a gzip-compressed archive",
  "  tar -tvf ARCHIVE                  List archive contents",
  "  tar -tzvf ARCHIVE                 List a compressed archive",
  "  tar -xvf ARCHIVE                  Extract an archive here",
  "  tar -xzvf ARCHIVE                 Extract a compressed archive",
  "  tar -xvf ARCHIVE -C DEST          Extract into DEST",
  "  gzip FILE                         Compress a simulated file",
  "  gunzip FILE.gz                    Decompress a .gz file",
  "  clear                             Clear the terminal screen",
  "",
  "Examples:",
  "  ls -lh documents",
  "  tar -cvf /backups/docs.tar documents/",
  "  tar -tvf /backups/docs.tar",
  "  tar -czvf /backups/docs.tar.gz documents/",
  "  gzip report.txt",
  "  df -h",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

export const REPORT_CONTENT =
  "Quarterly report — confidential sample data for the backup lab.";
const NOTES_CONTENT = "Meeting notes for the backups and recovery lesson.";
const ROADMAP_CONTENT =
  "Q4 roadmap draft — keep a verified copy off this host.";
const CONFIG_CONTENT = "app_env=lab\nbackup_policy=daily\n";
const README_CONTENT =
  "Welcome to the backups lab. Everything here is simulated.";

const HEALTHY_BACKUPS_TOTAL = 50 * 1024 * 1024;
const HEALTHY_BACKUPS_AVAIL = 40 * 1024 * 1024;
/** Too small for a documents/ archive — used by the low-space scenario. */
const LOW_SPACE_AVAIL = 64;

function byteLength(text: string): number {
  return text.length;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    const kib = bytes / 1024;
    const rounded = Math.round(kib * 10) / 10;
    return `${rounded}K`;
  }
  const mib = bytes / (1024 * 1024);
  const rounded = Math.round(mib * 10) / 10;
  return `${rounded}M`;
}

function normalizePath(path: string): string {
  if (!path || path === ".") {
    return ".";
  }
  const absolute = path.startsWith("/");
  const parts = path.split("/").filter((part) => part && part !== ".");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  if (absolute) {
    return `/${stack.join("/")}` || "/";
  }
  return stack.join("/") || ".";
}

function resolvePath(cwd: string, path: string): string {
  if (!path || path === ".") {
    return cwd;
  }
  if (path === "~" || path.startsWith("~/")) {
    const rest = path === "~" ? "" : path.slice(2);
    return resolvePath(SIMULATED_BACKUP_HOME, rest || ".");
  }
  if (path.startsWith("/")) {
    return normalizePath(path);
  }
  const joined = cwd === "/" ? `/${path}` : `${cwd}/${path}`;
  return normalizePath(joined);
}

function parentPath(path: string): string {
  if (path === "/") {
    return "/";
  }
  const idx = path.lastIndexOf("/");
  if (idx <= 0) {
    return "/";
  }
  return path.slice(0, idx);
}

function baseName(path: string): string {
  if (path === "/") {
    return "/";
  }
  const idx = path.lastIndexOf("/");
  return idx === -1 ? path : path.slice(idx + 1);
}

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

export function cloneBackupState(
  state: SimulatedBackupState,
): SimulatedBackupState {
  const nodes: Record<string, SimulatedFsNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    if (node.type === "directory") {
      nodes[path] = { type: "directory" };
    } else if (node.type === "file") {
      nodes[path] = { type: "file", content: node.content };
    } else {
      nodes[path] = {
        type: "archive",
        compressed: node.compressed,
        intact: node.intact,
        createdAt: node.createdAt,
        sourceLabel: node.sourceLabel,
        sizeBytes: node.sizeBytes,
        entries: node.entries.map((entry) => ({ ...entry })),
      };
    }
  }
  return {
    scenarioId: state.scenarioId,
    cwd: state.cwd,
    nodes,
    backupsAvailBytes: state.backupsAvailBytes,
    backupsTotalBytes: state.backupsTotalBytes,
    restoreHistory: state.restoreHistory.map((entry) => ({
      ...entry,
      files: [...entry.files],
    })),
  };
}

function buildBaseNodes(): Record<string, SimulatedFsNode> {
  return {
    "/": { type: "directory" },
    "/home": { type: "directory" },
    [SIMULATED_BACKUP_HOME]: { type: "directory" },
    [`${SIMULATED_BACKUP_HOME}/documents`]: { type: "directory" },
    [`${SIMULATED_BACKUP_HOME}/documents/report.txt`]: {
      type: "file",
      content: REPORT_CONTENT,
    },
    [`${SIMULATED_BACKUP_HOME}/documents/notes.txt`]: {
      type: "file",
      content: NOTES_CONTENT,
    },
    [`${SIMULATED_BACKUP_HOME}/documents/plans`]: { type: "directory" },
    [`${SIMULATED_BACKUP_HOME}/documents/plans/roadmap.txt`]: {
      type: "file",
      content: ROADMAP_CONTENT,
    },
    [`${SIMULATED_BACKUP_HOME}/projects`]: { type: "directory" },
    [`${SIMULATED_BACKUP_HOME}/projects/app`]: { type: "directory" },
    [`${SIMULATED_BACKUP_HOME}/projects/app/config.txt`]: {
      type: "file",
      content: CONFIG_CONTENT,
    },
    [`${SIMULATED_BACKUP_HOME}/readme.txt`]: {
      type: "file",
      content: README_CONTENT,
    },
    "/backups": { type: "directory" },
    "/tmp": { type: "directory" },
    "/tmp/restore-test": { type: "directory" },
  };
}

function damagedArchiveNode(): SimulatedFsNode {
  return {
    type: "archive",
    compressed: false,
    intact: false,
    createdAt: "2024-10-10 01:15:00",
    sourceLabel: "documents/",
    sizeBytes: 120,
    entries: [
      {
        path: "documents/report.txt",
        content: "truncated-incomplete",
        sizeBytes: 40,
      },
    ],
  };
}

export function createInitialBackupState(
  scenarioId: BackupScenarioId = "healthy",
): SimulatedBackupState {
  const nodes = buildBaseNodes();
  let backupsAvailBytes = HEALTHY_BACKUPS_AVAIL;
  const backupsTotalBytes = HEALTHY_BACKUPS_TOTAL;

  if (scenarioId === "low-space") {
    backupsAvailBytes = LOW_SPACE_AVAIL;
  }

  if (scenarioId === "damaged-archive") {
    nodes["/backups/broken-docs.tar"] = damagedArchiveNode();
    backupsAvailBytes = HEALTHY_BACKUPS_AVAIL - 120;
  }

  return {
    scenarioId,
    cwd: SIMULATED_BACKUP_HOME,
    nodes,
    backupsAvailBytes,
    backupsTotalBytes,
    restoreHistory: [],
  };
}

export function isBackupScenarioId(value: string): value is BackupScenarioId {
  return (
    value === "healthy" || value === "low-space" || value === "damaged-archive"
  );
}

export function getBackupScenario(id: BackupScenarioId): BackupScenarioMeta {
  const found = BACKUP_SCENARIOS.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown backup scenario: ${id}`);
  }
  return found;
}

export function formatBackupPrompt(cwd?: string): string {
  const path = cwd ?? SIMULATED_BACKUP_HOME;
  const short =
    path === SIMULATED_BACKUP_HOME
      ? "~"
      : path.startsWith(`${SIMULATED_BACKUP_HOME}/`)
        ? `~${path.slice(SIMULATED_BACKUP_HOME.length)}`
        : path;
  return `${SIMULATED_BACKUP_USER}@${SIMULATED_BACKUP_HOST}:${short}$`;
}

function listChildren(state: SimulatedBackupState, dirPath: string): string[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const names = new Set<string>();
  for (const path of Object.keys(state.nodes)) {
    if (path === dirPath) {
      continue;
    }
    if (!path.startsWith(prefix)) {
      continue;
    }
    const rest = path.slice(prefix.length);
    const name = rest.split("/")[0];
    if (name) {
      names.add(name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function collectFilesUnder(
  state: SimulatedBackupState,
  rootPath: string,
): SimulatedArchiveEntry[] {
  const root = stripTrailingSlash(rootPath);
  const node = state.nodes[root];
  if (!node) {
    return [];
  }
  if (node.type === "file") {
    const label = baseName(root);
    return [
      {
        path: label,
        content: node.content,
        sizeBytes: byteLength(node.content),
      },
    ];
  }
  if (node.type === "archive") {
    return [];
  }

  const prefix = `${root}/`;
  const rootName = baseName(root);
  const entries: SimulatedArchiveEntry[] = [];
  for (const [path, child] of Object.entries(state.nodes)) {
    if (child.type !== "file") {
      continue;
    }
    if (!path.startsWith(prefix) && path !== root) {
      continue;
    }
    const relative = path.slice(root.length + 1);
    entries.push({
      path: `${rootName}/${relative}`,
      content: child.content,
      sizeBytes: byteLength(child.content),
    });
  }
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

function estimateArchiveBytes(
  entries: readonly SimulatedArchiveEntry[],
  compressed: boolean,
): number {
  const raw = entries.reduce((sum, entry) => sum + entry.sizeBytes, 64);
  if (!compressed) {
    return raw;
  }
  return Math.max(32, Math.floor(raw * 0.55));
}

function ensureParentDirs(state: SimulatedBackupState, filePath: string): void {
  let current = parentPath(filePath);
  const missing: string[] = [];
  while (current && !state.nodes[current]) {
    missing.push(current);
    if (current === "/") {
      break;
    }
    current = parentPath(current);
  }
  for (const path of missing.reverse()) {
    state.nodes[path] = { type: "directory" };
  }
}

function tokenize(input: string): string[] | { error: string } {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }
    current += ch;
  }

  if (quote) {
    return { error: "Unclosed quote in command." };
  }
  if (current) {
    tokens.push(current);
  }
  return tokens;
}

function parseTarFlags(flagToken: string): {
  create: boolean;
  list: boolean;
  extract: boolean;
  verbose: boolean;
  gzip: boolean;
  file: boolean;
} | null {
  if (!flagToken.startsWith("-") || flagToken.startsWith("--")) {
    return null;
  }
  const chars = flagToken.slice(1);
  if (!chars || /[^ctxvfz]/.test(chars)) {
    return null;
  }
  return {
    create: chars.includes("c"),
    list: chars.includes("t"),
    extract: chars.includes("x"),
    verbose: chars.includes("v"),
    gzip: chars.includes("z"),
    file: chars.includes("f"),
  };
}

function outputLines(lines: readonly string[]): SimulateResult {
  return { kind: "output", lines };
}

function errorResult(message: string): SimulateResult {
  return { kind: "output", lines: [message] };
}

function humanDf(state: SimulatedBackupState): string[] {
  const used = state.backupsTotalBytes - state.backupsAvailBytes;
  const usePercent =
    state.backupsTotalBytes === 0
      ? 0
      : Math.round((used / state.backupsTotalBytes) * 100);
  return [
    "Filesystem      Size  Used Avail Use% Mounted on",
    "/dev/sda1        20G  8.0G   12G  40% /",
    "/dev/sda2        70G   22G   48G  32% /home",
    `/dev/sdb1        ${formatSize(state.backupsTotalBytes).padStart(4)}  ${formatSize(used).padStart(4)}  ${formatSize(state.backupsAvailBytes).padStart(4)}  ${String(usePercent).padStart(2)}% /backups`,
  ];
}

function plainDf(state: SimulatedBackupState): string[] {
  const used = state.backupsTotalBytes - state.backupsAvailBytes;
  const usePercent =
    state.backupsTotalBytes === 0
      ? 0
      : Math.round((used / state.backupsTotalBytes) * 100);
  return [
    "Filesystem     1K-blocks    Used Available Use% Mounted on",
    " /dev/sda1      20971520 8388608  12582912  40% /",
    " /dev/sda2      73400320 23068672 50331648  32% /home",
    ` /dev/sdb1      ${String(Math.floor(state.backupsTotalBytes / 1024)).padStart(8)} ${String(Math.floor(used / 1024)).padStart(8)} ${String(Math.floor(state.backupsAvailBytes / 1024)).padStart(9)}  ${String(usePercent).padStart(2)}% /backups`,
  ];
}

function formatLsLong(
  state: SimulatedBackupState,
  dirPath: string,
  name: string,
): string {
  const path = dirPath === "/" ? `/${name}` : `${dirPath}/${name}`;
  const node = state.nodes[path];
  if (!node) {
    return name;
  }
  if (node.type === "directory") {
    return `drwxr-xr-x 1 bunsal bunsal 4.0K ${SIMULATED_BACKUP_TIMESTAMP.slice(0, 16)} ${name}/`;
  }
  if (node.type === "file") {
    return `-rw-r--r-- 1 bunsal bunsal ${formatSize(byteLength(node.content)).padStart(4)} ${SIMULATED_BACKUP_TIMESTAMP.slice(0, 16)} ${name}`;
  }
  const suffix = node.compressed ? ".gz archive" : "archive";
  const intactMark = node.intact ? "" : " [DAMAGED]";
  return `-rw-r--r-- 1 bunsal bunsal ${formatSize(node.sizeBytes).padStart(4)} ${node.createdAt.slice(0, 16)} ${name}  (${suffix}${intactMark})`;
}

function createArchiveInState(
  state: SimulatedBackupState,
  archivePath: string,
  sourcePath: string,
  compressed: boolean,
  verbose: boolean,
): { lines: string[]; ok: boolean } {
  const source = stripTrailingSlash(sourcePath);
  const sourceNode = state.nodes[source];
  if (!sourceNode || sourceNode.type === "archive") {
    return {
      ok: false,
      lines: [`tar: ${sourcePath}: Cannot stat: No such file or directory`],
    };
  }

  const parent = parentPath(archivePath);
  if (!state.nodes[parent] || state.nodes[parent]?.type !== "directory") {
    return {
      ok: false,
      lines: [
        `tar: ${archivePath}: Cannot open: No such file or directory`,
        "Hint: create archives under an existing path such as /backups/.",
      ],
    };
  }

  const entries = collectFilesUnder(state, source);
  if (entries.length === 0) {
    return {
      ok: false,
      lines: [`tar: ${sourcePath}: No regular files found to archive`],
    };
  }

  const sizeBytes = estimateArchiveBytes(entries, compressed);
  const existing = state.nodes[archivePath];
  const reclaim = existing?.type === "archive" ? existing.sizeBytes : 0;
  const needed = sizeBytes - reclaim;
  if (archivePath.startsWith("/backups") && needed > state.backupsAvailBytes) {
    return {
      ok: false,
      lines: [
        `tar: ${archivePath}: Cannot write: No space left on device`,
        `Simulated /backups has ${formatSize(state.backupsAvailBytes)} free; this archive needs about ${formatSize(sizeBytes)}.`,
        "Free space, choose a smaller source, or switch to the healthy lab scenario.",
      ],
    };
  }

  if (existing?.type === "archive" && archivePath.startsWith("/backups")) {
    state.backupsAvailBytes += existing.sizeBytes;
  }

  state.nodes[archivePath] = {
    type: "archive",
    compressed,
    intact: true,
    createdAt: SIMULATED_BACKUP_TIMESTAMP,
    sourceLabel: sourcePath.endsWith("/") ? sourcePath : `${sourcePath}/`,
    entries,
    sizeBytes,
  };

  if (archivePath.startsWith("/backups")) {
    state.backupsAvailBytes = Math.max(0, state.backupsAvailBytes - sizeBytes);
  }

  const lines = verbose ? entries.map((entry) => entry.path) : [];
  lines.push(
    `Created simulated ${compressed ? "compressed " : ""}archive ${archivePath} (${formatSize(sizeBytes)}).`,
  );
  return { ok: true, lines };
}

function listArchiveInState(
  state: SimulatedBackupState,
  archivePath: string,
  expectGzip: boolean | null,
): { lines: string[]; ok: boolean } {
  const node = state.nodes[archivePath];
  if (!node) {
    return {
      ok: false,
      lines: [`tar: ${archivePath}: Cannot open: No such file or directory`],
    };
  }
  if (node.type !== "archive") {
    return {
      ok: false,
      lines: [`tar: ${archivePath}: This does not look like a tar archive`],
    };
  }
  if (expectGzip === true && !node.compressed) {
    return {
      ok: false,
      lines: [
        `tar: ${archivePath}: Archive is not gzip-compressed. Try tar -tvf without -z.`,
      ],
    };
  }
  if (expectGzip === false && node.compressed) {
    return {
      ok: false,
      lines: [
        `tar: ${archivePath}: Archive appears gzip-compressed. Try tar -tzvf.`,
      ],
    };
  }
  if (!node.intact) {
    return {
      ok: false,
      lines: [
        `tar: ${archivePath}: Unexpected EOF in archive`,
        "Verification failed: this simulated archive is damaged or incomplete.",
        "Do not treat it as a valid backup — create a fresh archive from known-good files.",
      ],
    };
  }

  const lines = [
    `Archive: ${archivePath}`,
    `Created: ${node.createdAt}`,
    `Compressed: ${node.compressed ? "yes" : "no"}`,
    `Size: ${formatSize(node.sizeBytes)}`,
    `Source: ${node.sourceLabel}`,
    "Contents:",
    ...node.entries.map(
      (entry) =>
        `-rw-r--r-- bunsal/bunsal ${String(entry.sizeBytes).padStart(6)} ${node.createdAt} ${entry.path}`,
    ),
    "Verification: OK (archive readable and intact)",
  ];
  return { ok: true, lines };
}

function restoreArchiveInState(
  state: SimulatedBackupState,
  archivePath: string,
  destDir: string | null,
  expectGzip: boolean | null,
  verbose: boolean,
): { lines: string[]; ok: boolean } {
  const listed = listArchiveInState(state, archivePath, expectGzip);
  if (!listed.ok) {
    // listArchive already explains damage / missing — trim the success-oriented lines
    return listed;
  }

  const node = state.nodes[archivePath];
  if (!node || node.type !== "archive" || !node.intact) {
    return listed;
  }

  const destinationRoot = destDir ? stripTrailingSlash(destDir) : state.cwd;

  if (destDir) {
    const destNode = state.nodes[destinationRoot];
    if (!destNode) {
      return {
        ok: false,
        lines: [
          `tar: ${destDir}: Cannot chdir: No such file or directory`,
          "Create the destination first (for example mkdir /tmp/restore-test).",
        ],
      };
    }
    if (destNode.type !== "directory") {
      return {
        ok: false,
        lines: [`tar: ${destDir}: Not a directory`],
      };
    }
  }

  const lines: string[] = [];
  let overwritten = false;
  const restoredFiles: string[] = [];

  for (const entry of node.entries) {
    const targetPath =
      destinationRoot === "/"
        ? `/${entry.path}`
        : `${destinationRoot}/${entry.path}`;
    const normalizedTarget = normalizePath(targetPath);
    ensureParentDirs(state, normalizedTarget);
    const existing = state.nodes[normalizedTarget];
    if (existing?.type === "file") {
      overwritten = true;
      lines.push(
        `${entry.path}: restoring over existing simulated file (overwrite)`,
      );
    } else if (verbose) {
      lines.push(entry.path);
    }
    state.nodes[normalizedTarget] = {
      type: "file",
      content: entry.content,
    };
    restoredFiles.push(normalizedTarget);
  }

  const mode = destDir ? "safe-dir" : "inplace";
  state.restoreHistory = [
    ...state.restoreHistory,
    {
      at: SIMULATED_BACKUP_TIMESTAMP,
      archive: archivePath,
      destination: destinationRoot,
      files: restoredFiles,
      overwritten,
      mode,
    },
  ];

  lines.push(
    `Restored ${restoredFiles.length} file(s) from ${archivePath} into ${destinationRoot}.`,
  );
  if (overwritten) {
    lines.push(
      "Note: one or more existing simulated files were overwritten. Prefer -C /tmp/restore-test to test first.",
    );
  }
  if (mode === "safe-dir") {
    lines.push(
      "Safe restore complete — inspect files under the destination before replacing originals.",
    );
  }
  return { ok: true, lines };
}

/** Programmatic helpers for the interactive workflow UI. */
export function workflowCreateArchive(
  state: SimulatedBackupState,
  sourceRel: string,
  archivePath: string,
  compressed: boolean,
): { state: SimulatedBackupState; lines: string[]; ok: boolean } {
  const next = cloneBackupState(state);
  const sourcePath = resolvePath(next.cwd, sourceRel);
  const result = createArchiveInState(
    next,
    resolvePath(next.cwd, archivePath),
    sourcePath,
    compressed,
    true,
  );
  return { state: next, lines: result.lines, ok: result.ok };
}

export function workflowVerifyArchive(
  state: SimulatedBackupState,
  archivePath: string,
): { state: SimulatedBackupState; lines: string[]; ok: boolean } {
  const next = cloneBackupState(state);
  const path = resolvePath(next.cwd, archivePath);
  const node = next.nodes[path];
  if (!node || node.type !== "archive") {
    return {
      state: next,
      ok: false,
      lines: [`No archive found at ${path}.`],
    };
  }
  const result = listArchiveInState(next, path, node.compressed ? true : false);
  return { state: next, lines: result.lines, ok: result.ok };
}

export function workflowDeleteFile(
  state: SimulatedBackupState,
  filePath: string,
): { state: SimulatedBackupState; lines: string[]; ok: boolean } {
  const next = cloneBackupState(state);
  const path = resolvePath(next.cwd, filePath);
  const node = next.nodes[path];
  if (!node) {
    return {
      state: next,
      ok: false,
      lines: [`rm: cannot remove '${filePath}': No such file or directory`],
    };
  }
  if (node.type === "directory") {
    return {
      state: next,
      ok: false,
      lines: [
        `rm: cannot remove '${filePath}': Is a directory (simulated rm is file-only)`,
      ],
    };
  }
  if (node.type === "archive") {
    if (path.startsWith("/backups")) {
      next.backupsAvailBytes += node.sizeBytes;
    }
  }
  delete next.nodes[path];
  return {
    state: next,
    ok: true,
    lines: [
      `Simulated deletion: removed ${path}`,
      "Nothing on your computer was deleted — only in-memory lab state changed.",
    ],
  };
}

export function workflowRestoreArchive(
  state: SimulatedBackupState,
  archivePath: string,
  destDir: string | null,
): { state: SimulatedBackupState; lines: string[]; ok: boolean } {
  const next = cloneBackupState(state);
  const path = resolvePath(next.cwd, archivePath);
  const node = next.nodes[path];
  const expectGzip = node?.type === "archive" ? node.compressed : null;
  const dest = destDir ? resolvePath(next.cwd, destDir) : null;
  const result = restoreArchiveInState(next, path, dest, expectGzip, true);
  return { state: next, lines: result.lines, ok: result.ok };
}

export function getFileContent(
  state: SimulatedBackupState,
  filePath: string,
): string | null {
  const path = resolvePath(state.cwd, filePath);
  const node = state.nodes[path];
  if (!node || node.type !== "file") {
    return null;
  }
  return node.content;
}

export function listArchives(state: SimulatedBackupState): readonly {
  path: string;
  intact: boolean;
  compressed: boolean;
  sizeBytes: number;
}[] {
  return Object.entries(state.nodes)
    .filter(
      (
        entry,
      ): entry is [string, Extract<SimulatedFsNode, { type: "archive" }>] =>
        entry[1].type === "archive",
    )
    .map(([path, node]) => ({
      path,
      intact: node.intact,
      compressed: node.compressed,
      sizeBytes: node.sizeBytes,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function pathExists(
  state: SimulatedBackupState,
  filePath: string,
): boolean {
  return Boolean(state.nodes[resolvePath(state.cwd, filePath)]);
}

function handleTar(
  tokens: string[],
  state: SimulatedBackupState,
): SimulateBackupResult {
  const next = cloneBackupState(state);
  if (tokens.length < 3) {
    return {
      state: next,
      result: errorResult(
        "Usage: tar -cvf ARCHIVE SOURCE | tar -tvf ARCHIVE | tar -xvf ARCHIVE [-C DEST]",
      ),
    };
  }

  const flags = parseTarFlags(tokens[1]!);
  if (!flags || !flags.file) {
    return {
      state: next,
      result: errorResult(
        "Unsupported tar flags. Use patterns like -cvf, -czvf, -tvf, -tzvf, -xvf, or -xzvf.",
      ),
    };
  }

  const modeCount =
    Number(flags.create) + Number(flags.list) + Number(flags.extract);
  if (modeCount !== 1) {
    return {
      state: next,
      result: errorResult(
        "Choose exactly one of create (-c), list (-t), or extract (-x).",
      ),
    };
  }

  const archiveArg = tokens[2];
  if (!archiveArg) {
    return {
      state: next,
      result: errorResult("tar: archive filename required after -f"),
    };
  }
  const archivePath = resolvePath(next.cwd, archiveArg);

  if (flags.create) {
    const sourceArg = tokens[3];
    if (!sourceArg) {
      return {
        state: next,
        result: errorResult("tar: missing source path for create"),
      };
    }
    const sourcePath = resolvePath(next.cwd, stripTrailingSlash(sourceArg));
    const created = createArchiveInState(
      next,
      archivePath,
      sourcePath,
      flags.gzip,
      flags.verbose,
    );
    return { state: next, result: outputLines(created.lines) };
  }

  if (flags.list) {
    const listed = listArchiveInState(
      next,
      archivePath,
      flags.gzip ? true : flags.gzip === false ? false : null,
    );
    // When -z omitted, auto-detect for friendlier lab UX if archive exists
    if (!listed.ok && !flags.gzip) {
      const node = next.nodes[archivePath];
      if (node?.type === "archive" && node.compressed) {
        const retry = listArchiveInState(next, archivePath, true);
        return { state: next, result: outputLines(retry.lines) };
      }
    }
    return { state: next, result: outputLines(listed.lines) };
  }

  // extract
  let destDir: string | null = null;
  const cIndex = tokens.indexOf("-C");
  if (cIndex !== -1) {
    const destArg = tokens[cIndex + 1];
    if (!destArg) {
      return {
        state: next,
        result: errorResult("tar: option requires an argument -- C"),
      };
    }
    destDir = resolvePath(next.cwd, destArg);
  }

  const expectGzip = flags.gzip ? true : null;
  const restored = restoreArchiveInState(
    next,
    archivePath,
    destDir,
    expectGzip,
    flags.verbose,
  );
  return { state: next, result: outputLines(restored.lines) };
}

/**
 * Resolve a typed command against the simulated backup lab.
 * Never executes a real shell or touches the host filesystem.
 */
export function simulateBackupsAndRecoveryCommand(
  rawInput: string,
  state: SimulatedBackupState,
): SimulateBackupResult {
  const input = rawInput.trim();
  if (!input) {
    return { state, result: { kind: "empty" } };
  }

  const tokenized = tokenize(input);
  if ("error" in tokenized) {
    return { state, result: errorResult(tokenized.error) };
  }
  const tokens = tokenized;
  const command = tokens[0]?.toLowerCase() ?? "";

  if (command === "clear") {
    return { state, result: { kind: "clear" } };
  }

  if (command === "help" || command === "--help") {
    return { state, result: outputLines(HELP_OUTPUT) };
  }

  if (command === "pwd") {
    return { state, result: outputLines([state.cwd]) };
  }

  if (command === "df") {
    const human = tokens.includes("-h");
    return {
      state,
      result: outputLines(human ? humanDf(state) : plainDf(state)),
    };
  }

  if (command === "cd") {
    const next = cloneBackupState(state);
    const targetArg = tokens[1] ?? SIMULATED_BACKUP_HOME;
    const target = resolvePath(next.cwd, targetArg);
    const node = next.nodes[target];
    if (!node) {
      return {
        state: next,
        result: errorResult(`cd: ${targetArg}: No such file or directory`),
      };
    }
    if (node.type !== "directory") {
      return {
        state: next,
        result: errorResult(`cd: ${targetArg}: Not a directory`),
      };
    }
    next.cwd = target;
    return { state: next, result: outputLines([]) };
  }

  if (command === "ls") {
    const human = tokens.includes("-lh") || tokens.includes("-l");
    const pathArg =
      tokens.find((token, index) => index > 0 && !token.startsWith("-")) ?? ".";
    const target = resolvePath(state.cwd, pathArg);
    const node = state.nodes[target];
    if (!node) {
      return {
        state,
        result: errorResult(
          `ls: cannot access '${pathArg}': No such file or directory`,
        ),
      };
    }
    if (node.type === "file" || node.type === "archive") {
      const name = baseName(target);
      return {
        state,
        result: outputLines(
          human ? [formatLsLong(state, parentPath(target), name)] : [name],
        ),
      };
    }
    const children = listChildren(state, target);
    if (!human) {
      return {
        state,
        result: outputLines(
          children.map((name) => {
            const childPath = target === "/" ? `/${name}` : `${target}/${name}`;
            const child = state.nodes[childPath];
            if (child?.type === "directory") {
              return `${name}/`;
            }
            return name;
          }),
        ),
      };
    }
    return {
      state,
      result: outputLines(
        children.map((name) => formatLsLong(state, target, name)),
      ),
    };
  }

  if (command === "cat") {
    const fileArg = tokens[1];
    if (!fileArg) {
      return { state, result: errorResult("cat: missing file operand") };
    }
    const path = resolvePath(state.cwd, fileArg);
    const node = state.nodes[path];
    if (!node) {
      return {
        state,
        result: errorResult(`cat: ${fileArg}: No such file or directory`),
      };
    }
    if (node.type === "directory") {
      return {
        state,
        result: errorResult(`cat: ${fileArg}: Is a directory`),
      };
    }
    if (node.type === "archive") {
      return {
        state,
        result: errorResult(
          `cat: ${fileArg}: Is a simulated archive — use tar -tvf to inspect it`,
        ),
      };
    }
    return { state, result: outputLines(node.content.split("\n")) };
  }

  if (command === "mkdir") {
    const dirArg = tokens[1];
    if (!dirArg) {
      return { state, result: errorResult("mkdir: missing operand") };
    }
    const next = cloneBackupState(state);
    const path = resolvePath(next.cwd, dirArg);
    if (next.nodes[path]) {
      return {
        state: next,
        result: errorResult(
          `mkdir: cannot create directory ‘${dirArg}’: File exists`,
        ),
      };
    }
    const parent = parentPath(path);
    if (!next.nodes[parent] || next.nodes[parent]?.type !== "directory") {
      return {
        state: next,
        result: errorResult(
          `mkdir: cannot create directory ‘${dirArg}’: No such file or directory`,
        ),
      };
    }
    next.nodes[path] = { type: "directory" };
    return { state: next, result: outputLines([]) };
  }

  if (command === "rm") {
    const fileArg = tokens[1];
    if (!fileArg) {
      return { state, result: errorResult("rm: missing operand") };
    }
    const deleted = workflowDeleteFile(state, fileArg);
    return {
      state: deleted.state,
      result: outputLines(deleted.lines),
    };
  }

  if (command === "gzip") {
    const fileArg = tokens[1];
    if (!fileArg) {
      return { state, result: errorResult("gzip: missing file operand") };
    }
    const next = cloneBackupState(state);
    const path = resolvePath(next.cwd, fileArg);
    const node = next.nodes[path];
    if (!node || node.type !== "file") {
      return {
        state: next,
        result: errorResult(`gzip: ${fileArg}: No such file or directory`),
      };
    }
    const gzPath = `${path}.gz`;
    if (next.nodes[gzPath]) {
      return {
        state: next,
        result: errorResult(`gzip: ${fileArg}.gz already exists`),
      };
    }
    const compressedSize = Math.max(
      16,
      Math.floor(byteLength(node.content) * 0.55),
    );
    next.nodes[gzPath] = {
      type: "archive",
      compressed: true,
      intact: true,
      createdAt: SIMULATED_BACKUP_TIMESTAMP,
      sourceLabel: baseName(path),
      sizeBytes: compressedSize,
      entries: [
        {
          path: baseName(path),
          content: node.content,
          sizeBytes: byteLength(node.content),
        },
      ],
    };
    delete next.nodes[path];
    return {
      state: next,
      result: outputLines([
        `Compressed simulated file ${path} → ${gzPath} (${formatSize(compressedSize)})`,
      ]),
    };
  }

  if (command === "gunzip") {
    const fileArg = tokens[1];
    if (!fileArg) {
      return { state, result: errorResult("gunzip: missing file operand") };
    }
    const next = cloneBackupState(state);
    const path = resolvePath(
      next.cwd,
      fileArg.endsWith(".gz") ? fileArg : `${fileArg}.gz`,
    );
    const node = next.nodes[path];
    if (!node || node.type !== "archive" || !node.compressed) {
      return {
        state: next,
        result: errorResult(`gunzip: ${fileArg}: No such file or directory`),
      };
    }
    if (!node.intact) {
      return {
        state: next,
        result: errorResult(
          `gunzip: ${fileArg}: unexpected end of file — archive damaged`,
        ),
      };
    }
    const entry = node.entries[0];
    if (!entry) {
      return {
        state: next,
        result: errorResult(`gunzip: ${fileArg}: empty archive`),
      };
    }
    const outPath = path.endsWith(".gz") ? path.slice(0, -3) : `${path}.out`;
    next.nodes[outPath] = { type: "file", content: entry.content };
    delete next.nodes[path];
    return {
      state: next,
      result: outputLines([`Decompressed ${path} → ${outPath}`]),
    };
  }

  if (command === "tar") {
    return handleTar(tokens, state);
  }

  return {
    state,
    result: outputLines(UNSUPPORTED_MESSAGE),
  };
}
