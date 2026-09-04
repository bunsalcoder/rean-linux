/**
 * Frontend-only command simulation for the learning terminal.
 * Does not execute shell commands, access the filesystem, or call any backend.
 */

export const SIMULATED_COMMANDS = [
  "help",
  "pwd",
  "ls",
  "whoami",
  "date",
  "echo",
  "clear",
] as const;

export type SimulatedCommand = (typeof SIMULATED_COMMANDS)[number];

export type SimulateResult =
  | { kind: "output"; lines: readonly string[] }
  | { kind: "clear" }
  | { kind: "empty" };

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help     Show this help message",
  "  pwd      Print the current directory",
  "  ls       List files and directories",
  "  whoami   Show the current user",
  "  date     Display the current date and time",
  "  echo     Print text to the terminal",
  "  clear    Clear the terminal screen",
] as const;

const LS_OUTPUT = ["Desktop", "Documents", "Downloads", "projects"] as const;

function formatSimulatedDate(now: Date): string {
  return now.toString();
}

function parseEchoArgument(input: string): string {
  const rest = input.slice("echo".length).trimStart();
  if (!rest) {
    return "";
  }

  const first = rest[0];
  if (
    (first === '"' || first === "'") &&
    rest.length >= 2 &&
    rest.endsWith(first)
  ) {
    return rest.slice(1, -1);
  }

  return rest;
}

/**
 * Resolve a typed command string to simulated output.
 * Never executes a real shell — responses are hardcoded or derived in JS only.
 */
export function simulateTerminalCommand(
  rawInput: string,
  now: Date = new Date(),
): SimulateResult {
  const input = rawInput.trim();

  if (!input) {
    return { kind: "empty" };
  }

  const [commandName = ""] = input.split(/\s+/);
  const command = commandName.toLowerCase();

  switch (command) {
    case "help":
      return { kind: "output", lines: HELP_OUTPUT };
    case "pwd":
      return { kind: "output", lines: ["/home/learner"] };
    case "ls":
      return { kind: "output", lines: LS_OUTPUT };
    case "whoami":
      return { kind: "output", lines: ["learner"] };
    case "date":
      return { kind: "output", lines: [formatSimulatedDate(now)] };
    case "echo":
      return { kind: "output", lines: [parseEchoArgument(input)] };
    case "clear":
      return { kind: "clear" };
    default:
      return { kind: "output", lines: UNSUPPORTED_MESSAGE };
  }
}
