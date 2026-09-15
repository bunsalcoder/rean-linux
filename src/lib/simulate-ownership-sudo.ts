/**
 * Frontend-only ownership and sudo simulation for Stage 02 Lesson 03.
 * Does not execute shell commands, touch the host filesystem, or authenticate.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_OWNERSHIP_USER = "bunsal";
export const SIMULATED_OWNERSHIP_HOME = `/home/${SIMULATED_OWNERSHIP_USER}`;

const SIMULATED_USERS = new Set(["root", "bunsal", "alice"]);
const SIMULATED_GROUPS = new Set(["bunsal", "developers", "engineering"]);

export type SimulatedOwnershipEntry = {
  name: string;
  kind: "file" | "directory";
  /** Nine-character rwx string without the leading type bit. */
  mode: string;
  owner: string;
  group: string;
  size: number;
};

export type SimulatedOwnershipState = {
  entries: Record<string, SimulatedOwnershipEntry>;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                    Show this help message",
  "  ls -l                   List files with ownership",
  "  chown OWNER FILE        Change owner (needs sudo)",
  "  chown OWNER:GROUP FILE  Change owner and group (needs sudo)",
  "  chgrp GROUP FILE        Change group (needs sudo)",
  "  sudo COMMAND            Run a command with elevated privileges",
  "  clear                   Clear the terminal screen",
  "",
  "Examples:",
  "  ls -l",
  "  sudo chown alice report.txt",
  "  sudo chown alice:developers report.txt",
  "  sudo chgrp engineering report.txt",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const ENTRY_ORDER = ["report.txt", "project"] as const;

export function createInitialOwnershipState(): SimulatedOwnershipState {
  return {
    entries: {
      "report.txt": {
        name: "report.txt",
        kind: "file",
        mode: "rw-r-----",
        owner: "bunsal",
        group: "developers",
        size: 1200,
      },
      project: {
        name: "project",
        kind: "directory",
        mode: "rwxr-x---",
        owner: "alice",
        group: "developers",
        size: 4096,
      },
    },
  };
}

export function cloneOwnershipState(
  state: SimulatedOwnershipState,
): SimulatedOwnershipState {
  const entries: Record<string, SimulatedOwnershipEntry> = {};
  for (const [key, entry] of Object.entries(state.entries)) {
    entries[key] = { ...entry };
  }
  return { entries };
}

function formatLsLine(entry: SimulatedOwnershipEntry): string {
  const typeBit = entry.kind === "directory" ? "d" : "-";
  const size = String(entry.size).padStart(4, " ");
  return `${typeBit}${entry.mode}  ${entry.owner} ${entry.group} ${size}  ${entry.name}`;
}

function formatLsListing(state: SimulatedOwnershipState): string[] {
  return ENTRY_ORDER.filter((name) => state.entries[name]).map((name) =>
    formatLsLine(state.entries[name]!),
  );
}

function resolveEntryName(
  state: SimulatedOwnershipState,
  rawName: string,
): string | null {
  const cleaned = rawName.replace(/\/+$/, "");
  if (state.entries[cleaned]) {
    return cleaned;
  }
  return null;
}

function operationNotPermitted(fileName: string): string[] {
  return [
    `chown: changing ownership of '${fileName}':`,
    "Operation not permitted",
  ];
}

function chgrpNotPermitted(fileName: string): string[] {
  return [`chgrp: changing group of '${fileName}':`, "Operation not permitted"];
}

function parseOwnerGroup(spec: string): {
  owner: string | null;
  group: string | null;
} | null {
  if (spec.includes(":")) {
    const [ownerPart = "", groupPart = ""] = spec.split(":");
    if (!ownerPart && !groupPart) {
      return null;
    }
    return {
      owner: ownerPart || null,
      group: groupPart || null,
    };
  }
  return { owner: spec, group: null };
}

export type SimulateOwnershipResult = {
  result: SimulateResult;
  state: SimulatedOwnershipState;
};

function applyChown(
  state: SimulatedOwnershipState,
  ownerSpec: string,
  fileArg: string,
  elevated: boolean,
): SimulateOwnershipResult {
  const nextState = cloneOwnershipState(state);
  const parsed = parseOwnerGroup(ownerSpec);

  if (!parsed || (!parsed.owner && !parsed.group)) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: chown OWNER FILE",
          "       chown OWNER:GROUP FILE",
          "Example: sudo chown alice report.txt",
        ],
      },
      state: nextState,
    };
  }

  const entryName = resolveEntryName(nextState, fileArg);
  if (!entryName) {
    return {
      result: {
        kind: "output",
        lines: [`chown: cannot access '${fileArg}': No such file or directory`],
      },
      state: nextState,
    };
  }

  if (!elevated) {
    return {
      result: { kind: "output", lines: operationNotPermitted(entryName) },
      state: nextState,
    };
  }

  if (parsed.owner && !SIMULATED_USERS.has(parsed.owner)) {
    return {
      result: {
        kind: "output",
        lines: [`chown: invalid user: ‘${parsed.owner}’`],
      },
      state: nextState,
    };
  }

  if (parsed.group && !SIMULATED_GROUPS.has(parsed.group)) {
    return {
      result: {
        kind: "output",
        lines: [`chown: invalid group: ‘${parsed.group}’`],
      },
      state: nextState,
    };
  }

  const entry = nextState.entries[entryName]!;
  nextState.entries[entryName] = {
    ...entry,
    owner: parsed.owner ?? entry.owner,
    group: parsed.group ?? entry.group,
  };

  return { result: { kind: "output", lines: [] }, state: nextState };
}

function applyChgrp(
  state: SimulatedOwnershipState,
  groupArg: string,
  fileArg: string,
  elevated: boolean,
): SimulateOwnershipResult {
  const nextState = cloneOwnershipState(state);
  const entryName = resolveEntryName(nextState, fileArg);

  if (!entryName) {
    return {
      result: {
        kind: "output",
        lines: [`chgrp: cannot access '${fileArg}': No such file or directory`],
      },
      state: nextState,
    };
  }

  if (!elevated) {
    return {
      result: { kind: "output", lines: chgrpNotPermitted(entryName) },
      state: nextState,
    };
  }

  if (!SIMULATED_GROUPS.has(groupArg)) {
    return {
      result: {
        kind: "output",
        lines: [`chgrp: invalid group: ‘${groupArg}’`],
      },
      state: nextState,
    };
  }

  const entry = nextState.entries[entryName]!;
  nextState.entries[entryName] = { ...entry, group: groupArg };
  return { result: { kind: "output", lines: [] }, state: nextState };
}

function handleSudo(
  tokens: string[],
  state: SimulatedOwnershipState,
): SimulateOwnershipResult {
  const nextState = cloneOwnershipState(state);
  const rest = tokens.slice(1);

  if (rest.length === 0) {
    return {
      result: {
        kind: "output",
        lines: [
          "Usage: sudo COMMAND",
          "Examples: sudo chown alice report.txt",
          "          sudo chgrp developers report.txt",
        ],
      },
      state: nextState,
    };
  }

  const command = (rest[0] ?? "").toLowerCase();

  if (command === "chown") {
    if (rest.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: [
            "Usage: sudo chown OWNER FILE",
            "       sudo chown OWNER:GROUP FILE",
          ],
        },
        state: nextState,
      };
    }
    return applyChown(state, rest[1] ?? "", rest[2] ?? "", true);
  }

  if (command === "chgrp") {
    if (rest.length !== 3) {
      return {
        result: {
          kind: "output",
          lines: ["Usage: sudo chgrp GROUP FILE"],
        },
        state: nextState,
      };
    }
    return applyChgrp(state, rest[1] ?? "", rest[2] ?? "", true);
  }

  if (command === "ls" && rest.length === 2 && rest[1] === "/root") {
    return {
      result: {
        kind: "output",
        lines: [
          "(simulated) Listing /root with elevated privileges.",
          "This demo does not access your real system.",
        ],
      },
      state: nextState,
    };
  }

  return {
    result: {
      kind: "output",
      lines: [
        "That sudo command is not available in this learning terminal.",
        'Try "help" to see available commands.',
      ],
    },
    state: nextState,
  };
}

/**
 * Resolve ownership/sudo learning commands against simulated file metadata.
 * Never executes a real shell, never authenticates, never touches the host.
 */
export function simulateOwnershipSudoCommand(
  rawInput: string,
  state: SimulatedOwnershipState,
): SimulateOwnershipResult {
  const input = rawInput.trim();
  const nextState = cloneOwnershipState(state);

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

    case "chown": {
      if (tokens.length !== 3) {
        return {
          result: {
            kind: "output",
            lines: [
              "Usage: chown OWNER FILE",
              "       chown OWNER:GROUP FILE",
              "Tip: changing ownership usually requires sudo.",
            ],
          },
          state: nextState,
        };
      }
      return applyChown(state, tokens[1] ?? "", tokens[2] ?? "", false);
    }

    case "chgrp": {
      if (tokens.length !== 3) {
        return {
          result: {
            kind: "output",
            lines: [
              "Usage: chgrp GROUP FILE",
              "Tip: changing group ownership usually requires sudo.",
            ],
          },
          state: nextState,
        };
      }
      return applyChgrp(state, tokens[1] ?? "", tokens[2] ?? "", false);
    }

    case "sudo":
      return handleSudo(tokens, state);

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: nextState,
      };
  }
}

export function formatOwnershipSudoPrompt(): string {
  return `${SIMULATED_OWNERSHIP_USER}@rean-linux:~$`;
}
