/**
 * Frontend-only user/group identity simulation for Stage 02 Lesson 01.
 * Does not execute shell commands or read the host /etc/passwd or /etc/group.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_IDENTITY_USER = "bunsal";
export const SIMULATED_IDENTITY_HOME = `/home/${SIMULATED_IDENTITY_USER}`;
export const SIMULATED_IDENTITY_UID = 1000;
export const SIMULATED_IDENTITY_PRIMARY_GID = 1000;
export const SIMULATED_IDENTITY_PRIMARY_GROUP = "bunsal";

export const SIMULATED_IDENTITY_SUPPLEMENTARY_GROUPS = [
  { name: "developers", gid: 1001 },
  { name: "docker", gid: 998 },
] as const;

const PASSWD_LINES = [
  "root:x:0:0:root:/root:/bin/bash",
  "bunsal:x:1000:1000:Bunsal:/home/bunsal:/bin/bash",
  "alice:x:1002:1002:Alice:/home/alice:/bin/bash",
] as const;

const GROUP_LINES = [
  "root:x:0:",
  "bunsal:x:1000:",
  "alice:x:1002:",
  "developers:x:1001:bunsal,alice,bob",
  "docker:x:998:bunsal",
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help              Show this help message",
  "  whoami            Show the current username",
  "  id                Show user and group identity",
  "  id -u             Show UID",
  "  id -g             Show primary GID",
  "  id -G             Show group IDs",
  "  groups            Show group membership",
  "  cat /etc/passwd   Show simulated user accounts",
  "  cat /etc/group    Show simulated groups",
  "  clear             Clear the terminal screen",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

function formatIdLine(username: string): string | null {
  if (username === "bunsal") {
    return "uid=1000(bunsal) gid=1000(bunsal) groups=1000(bunsal),1001(developers),998(docker)";
  }
  if (username === "alice") {
    return "uid=1002(alice) gid=1002(alice) groups=1002(alice),1001(developers)";
  }
  if (username === "root") {
    return "uid=0(root) gid=0(root) groups=0(root)";
  }
  return null;
}

function formatGroupsLine(username: string): string | null {
  if (username === "bunsal") {
    return "bunsal developers docker";
  }
  if (username === "alice") {
    return "alice developers";
  }
  if (username === "root") {
    return "root";
  }
  return null;
}

/**
 * Resolve identity-related learning commands to simulated output.
 * Never executes a real shell or reads the host filesystem.
 */
export function simulateUsersIdentityCommand(rawInput: string): SimulateResult {
  const input = rawInput.trim();

  if (!input) {
    return { kind: "empty" };
  }

  const tokens = input.split(/\s+/);
  const command = (tokens[0] ?? "").toLowerCase();

  switch (command) {
    case "help":
      return { kind: "output", lines: HELP_OUTPUT };

    case "clear":
      return { kind: "clear" };

    case "whoami":
      if (tokens.length > 1) {
        return { kind: "output", lines: UNSUPPORTED_MESSAGE };
      }
      return { kind: "output", lines: [SIMULATED_IDENTITY_USER] };

    case "id": {
      if (tokens.length === 1) {
        return {
          kind: "output",
          lines: [formatIdLine(SIMULATED_IDENTITY_USER)!],
        };
      }

      if (tokens.length === 2) {
        const arg = tokens[1] ?? "";
        if (arg === "-u") {
          return {
            kind: "output",
            lines: [String(SIMULATED_IDENTITY_UID)],
          };
        }
        if (arg === "-g") {
          return {
            kind: "output",
            lines: [String(SIMULATED_IDENTITY_PRIMARY_GID)],
          };
        }
        if (arg === "-G") {
          return {
            kind: "output",
            lines: [
              `${SIMULATED_IDENTITY_PRIMARY_GID} ${SIMULATED_IDENTITY_SUPPLEMENTARY_GROUPS.map((group) => group.gid).join(" ")}`,
            ],
          };
        }

        const line = formatIdLine(arg);
        if (line) {
          return { kind: "output", lines: [line] };
        }
        return {
          kind: "output",
          lines: [`id: ‘${arg}’: no such user`],
        };
      }

      return { kind: "output", lines: UNSUPPORTED_MESSAGE };
    }

    case "groups": {
      if (tokens.length === 1) {
        return {
          kind: "output",
          lines: [formatGroupsLine(SIMULATED_IDENTITY_USER)!],
        };
      }

      if (tokens.length === 2) {
        const username = tokens[1] ?? "";
        const line = formatGroupsLine(username);
        if (line) {
          return { kind: "output", lines: [line] };
        }
        return {
          kind: "output",
          lines: [`groups: ‘${username}’: no such user`],
        };
      }

      return { kind: "output", lines: UNSUPPORTED_MESSAGE };
    }

    case "cat": {
      if (tokens.length === 2 && tokens[1] === "/etc/passwd") {
        return { kind: "output", lines: PASSWD_LINES };
      }
      if (tokens.length === 2 && tokens[1] === "/etc/group") {
        return { kind: "output", lines: GROUP_LINES };
      }
      return { kind: "output", lines: UNSUPPORTED_MESSAGE };
    }

    default:
      return { kind: "output", lines: UNSUPPORTED_MESSAGE };
  }
}

export function formatUsersIdentityPrompt(): string {
  return `${SIMULATED_IDENTITY_USER}@rean-linux:~$`;
}
