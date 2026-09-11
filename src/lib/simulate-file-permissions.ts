/**
 * Frontend-only file-permission simulation for Stage 02 Lesson 02.
 * Does not execute shell commands or touch the host filesystem.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PERMISSIONS_USER = "bunsal";
export const SIMULATED_PERMISSIONS_HOME = `/home/${SIMULATED_PERMISSIONS_USER}`;

export type SimulatedPermissionEntry = {
  name: string;
  kind: "file" | "directory";
  /** Nine-character rwx string without the leading type bit. */
  mode: string;
  owner: string;
  group: string;
  size: number;
};

export type SimulatedPermissionsState = {
  entries: Record<string, SimulatedPermissionEntry>;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help              Show this help message",
  "  ls -l             List files with permissions",
  "  chmod MODE FILE   Change permissions (symbolic or numeric)",
  "  clear             Clear the terminal screen",
  "",
  "Examples:",
  "  chmod 755 script.sh",
  "  chmod 644 notes.txt",
  "  chmod u+x script.sh",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const ENTRY_ORDER = [
  "notes.txt",
  "script.sh",
  "private.txt",
  "projects",
] as const;

export function createInitialPermissionsState(): SimulatedPermissionsState {
  return {
    entries: {
      "notes.txt": {
        name: "notes.txt",
        kind: "file",
        mode: "rw-r--r--",
        owner: "bunsal",
        group: "developers",
        size: 120,
      },
      "script.sh": {
        name: "script.sh",
        kind: "file",
        mode: "rw-r--r--",
        owner: "bunsal",
        group: "developers",
        size: 850,
      },
      "private.txt": {
        name: "private.txt",
        kind: "file",
        mode: "rw-------",
        owner: "bunsal",
        group: "bunsal",
        size: 64,
      },
      projects: {
        name: "projects",
        kind: "directory",
        mode: "rwxr-x---",
        owner: "bunsal",
        group: "developers",
        size: 4096,
      },
    },
  };
}

export function clonePermissionsState(
  state: SimulatedPermissionsState,
): SimulatedPermissionsState {
  const entries: Record<string, SimulatedPermissionEntry> = {};
  for (const [key, entry] of Object.entries(state.entries)) {
    entries[key] = { ...entry };
  }
  return { entries };
}

function digitToTriplet(digit: number): string {
  return `${digit & 4 ? "r" : "-"}${digit & 2 ? "w" : "-"}${digit & 1 ? "x" : "-"}`;
}

export function octalToMode(octal: string): string | null {
  if (!/^[0-7]{3}$/.test(octal)) {
    return null;
  }
  const owner = Number(octal[0]);
  const group = Number(octal[1]);
  const other = Number(octal[2]);
  return `${digitToTriplet(owner)}${digitToTriplet(group)}${digitToTriplet(other)}`;
}

function tripletToBits(triplet: string): {
  r: boolean;
  w: boolean;
  x: boolean;
} {
  return {
    r: triplet[0] === "r",
    w: triplet[1] === "w",
    x: triplet[2] === "x",
  };
}

function bitsToTriplet(bits: { r: boolean; w: boolean; x: boolean }): string {
  return `${bits.r ? "r" : "-"}${bits.w ? "w" : "-"}${bits.x ? "x" : "-"}`;
}

type WhoKey = "owner" | "group" | "other";

function parseSymbolicMode(
  currentMode: string,
  symbolic: string,
): string | null {
  const match = /^([ugoa]+)([+\-=])([rwx]+)$/.exec(symbolic);
  if (!match) {
    return null;
  }

  const who = match[1] ?? "";
  const op = match[2] ?? "";
  const perms = match[3] ?? "";

  const targets = new Set<WhoKey>();
  for (const ch of who) {
    if (ch === "u") {
      targets.add("owner");
    } else if (ch === "g") {
      targets.add("group");
    } else if (ch === "o") {
      targets.add("other");
    } else if (ch === "a") {
      targets.add("owner");
      targets.add("group");
      targets.add("other");
    }
  }

  if (targets.size === 0) {
    return null;
  }

  const sections: Record<WhoKey, { r: boolean; w: boolean; x: boolean }> = {
    owner: tripletToBits(currentMode.slice(0, 3)),
    group: tripletToBits(currentMode.slice(3, 6)),
    other: tripletToBits(currentMode.slice(6, 9)),
  };

  const wanted = {
    r: perms.includes("r"),
    w: perms.includes("w"),
    x: perms.includes("x"),
  };

  for (const target of targets) {
    const bits = sections[target];
    if (op === "+") {
      if (wanted.r) bits.r = true;
      if (wanted.w) bits.w = true;
      if (wanted.x) bits.x = true;
    } else if (op === "-") {
      if (wanted.r) bits.r = false;
      if (wanted.w) bits.w = false;
      if (wanted.x) bits.x = false;
    } else if (op === "=") {
      bits.r = wanted.r;
      bits.w = wanted.w;
      bits.x = wanted.x;
    }
  }

  return `${bitsToTriplet(sections.owner)}${bitsToTriplet(sections.group)}${bitsToTriplet(sections.other)}`;
}

function formatLsLine(entry: SimulatedPermissionEntry): string {
  const typeBit = entry.kind === "directory" ? "d" : "-";
  const size = String(entry.size).padStart(4, " ");
  return `${typeBit}${entry.mode}  ${entry.owner} ${entry.group} ${size}  ${entry.name}`;
}

function formatLsListing(state: SimulatedPermissionsState): string[] {
  return ENTRY_ORDER.filter((name) => state.entries[name]).map((name) =>
    formatLsLine(state.entries[name]!),
  );
}

function resolveEntryName(
  state: SimulatedPermissionsState,
  rawName: string,
): string | null {
  const cleaned = rawName.replace(/\/+$/, "");
  if (state.entries[cleaned]) {
    return cleaned;
  }
  return null;
}

export type SimulatePermissionsResult = {
  result: SimulateResult;
  state: SimulatedPermissionsState;
};

/**
 * Resolve permission-related learning commands against simulated file metadata.
 * Never executes a real shell or touches the host filesystem.
 */
export function simulateFilePermissionsCommand(
  rawInput: string,
  state: SimulatedPermissionsState,
): SimulatePermissionsResult {
  const input = rawInput.trim();
  const nextState = clonePermissionsState(state);

  if (!input) {
    return { result: { kind: "empty" }, state: nextState };
  }

  const tokens = input.split(/\s+/);
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return {
        result: { kind: "output", lines: HELP_OUTPUT },
        state: nextState,
      };

    case "clear":
      return { result: { kind: "clear" }, state: nextState };

    case "ls": {
      if (tokens.length === 1) {
        return {
          result: {
            kind: "output",
            lines: ENTRY_ORDER.filter((name) => nextState.entries[name]).map(
              (name) => {
                const entry = nextState.entries[name]!;
                return entry.kind === "directory"
                  ? `${entry.name}/`
                  : entry.name;
              },
            ),
          },
          state: nextState,
        };
      }

      if (
        tokens.length === 2 &&
        (tokens[1] === "-l" || tokens[1] === "-la" || tokens[1] === "-al")
      ) {
        return {
          result: { kind: "output", lines: formatLsListing(nextState) },
          state: nextState,
        };
      }

      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
    }

    case "chmod": {
      if (tokens.length !== 3) {
        return {
          result: {
            kind: "output",
            lines: [
              "Usage: chmod MODE FILE",
              "Examples: chmod 755 script.sh   chmod u+x script.sh",
            ],
          },
          state: nextState,
        };
      }

      const modeArg = tokens[1] ?? "";
      const fileArg = tokens[2] ?? "";
      const entryName = resolveEntryName(nextState, fileArg);

      if (!entryName) {
        return {
          result: {
            kind: "output",
            lines: [
              `chmod: cannot access '${fileArg}': No such file or directory`,
            ],
          },
          state: nextState,
        };
      }

      const entry = nextState.entries[entryName]!;
      let newMode: string | null = null;

      if (/^[0-7]{3}$/.test(modeArg)) {
        newMode = octalToMode(modeArg);
      } else {
        newMode = parseSymbolicMode(entry.mode, modeArg);
      }

      if (!newMode) {
        return {
          result: {
            kind: "output",
            lines: [
              `chmod: invalid mode: ‘${modeArg}’`,
              "Try a numeric mode like 755 or a symbolic mode like u+x.",
            ],
          },
          state: nextState,
        };
      }

      nextState.entries[entryName] = { ...entry, mode: newMode };
      return { result: { kind: "output", lines: [] }, state: nextState };
    }

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
  }
}

export function formatFilePermissionsPrompt(): string {
  return `${SIMULATED_PERMISSIONS_USER}@rean-linux:~$`;
}

export function formatPermissionString(
  entry: SimulatedPermissionEntry,
): string {
  const typeBit = entry.kind === "directory" ? "d" : "-";
  return `${typeBit}${entry.mode}`;
}
