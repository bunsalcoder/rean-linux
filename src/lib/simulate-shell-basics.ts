/**
 * Frontend-only shell-basics simulation for Stage 02 Lesson 10.
 * Quoting, variables, command substitution, exit status, and ; / && / ||.
 * Never executes a real shell, reads host env, or touches the OS filesystem.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SHELL_USER = "bunsal";
export const SIMULATED_SHELL_HOME = `/home/${SIMULATED_SHELL_USER}`;

/** Fixed teaching value — never reads the real system clock. */
export const SIMULATED_DATE = "Wed Sep 30 12:00:00 UTC 2026";

const VAR_NAME = "[A-Za-z_][A-Za-z0-9_]*";

const INITIAL_EXPORTED: Record<string, string> = {
  HOME: SIMULATED_SHELL_HOME,
  USER: SIMULATED_SHELL_USER,
  SHELL: "/bin/bash",
  PATH: "/usr/local/bin:/usr/bin:/bin",
  PWD: SIMULATED_SHELL_HOME,
  LANG: "en_US.UTF-8",
  TERM: "xterm-256color",
};

export type SimulatedShellState = {
  cwd: string;
  nodes: Record<string, { type: "file"; content: string } | { type: "directory" }>;
  /** All shell variables (exported and non-exported). */
  values: Record<string, string>;
  /** Keys that are part of the exported environment. */
  exported: Record<string, true>;
  /** Exit status of the most recently executed simple command. */
  lastExitStatus: number;
};

export type SimulateShellResult = {
  result: SimulateResult;
  state: SimulatedShellState;
};

type ChainConnector = ";" | "&&" | "||";

type ChainSegment = {
  connector: ChainConnector | null;
  text: string;
};

type CommandStreams = {
  stdout: string[];
  stderr: string[];
  status: number;
};

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                 Show this help message",
  "  pwd                  Print the current directory",
  "  ls [path]            List files and directories",
  "  cd [path]            Change directory (~ expands to home)",
  "  mkdir NAME           Create a directory",
  "  echo TEXT            Print text (supports quotes and $VAR)",
  "  date                 Show a simulated date",
  '  NAME="value"         Set a shell variable',
  "  clear                Clear the terminal screen",
  "",
  "Shell features in this lesson:",
  "  '...'                Literal text",
  '  "..."                Allows variable expansion',
  "  \\$                  Escaped dollar sign",
  "  $(date)              Command substitution (date only)",
  "  $?                   Previous command exit status",
  "  ;                    Run next command always",
  "  &&                   Run next command on success",
  "  ||                   Run next command on failure",
  "",
  "Examples:",
  '  NAME="Bunsal"',
  '  echo "$NAME"',
  "  echo '$HOME'",
  '  echo "Today is $(date)"',
  "  pwd; echo $?",
  "  mkdir projects && cd projects",
  '  ls nonexistent || echo "Command failed"',
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

export function createInitialShellState(): SimulatedShellState {
  const values: Record<string, string> = { ...INITIAL_EXPORTED };
  const exported: Record<string, true> = {};
  for (const key of Object.keys(INITIAL_EXPORTED)) {
    exported[key] = true;
  }

  return {
    cwd: SIMULATED_SHELL_HOME,
    nodes: {
      "/": { type: "directory" },
      "/home": { type: "directory" },
      [SIMULATED_SHELL_HOME]: { type: "directory" },
      [`${SIMULATED_SHELL_HOME}/Desktop`]: { type: "directory" },
      [`${SIMULATED_SHELL_HOME}/Documents`]: { type: "directory" },
      [`${SIMULATED_SHELL_HOME}/Downloads`]: { type: "directory" },
      [`${SIMULATED_SHELL_HOME}/notes.txt`]: {
        type: "file",
        content: "Welcome to Shell Basics on Rean Linux.",
      },
    },
    values,
    exported,
    lastExitStatus: 0,
  };
}

export function cloneShellState(state: SimulatedShellState): SimulatedShellState {
  return {
    cwd: state.cwd,
    nodes: { ...state.nodes },
    values: { ...state.values },
    exported: { ...state.exported },
    lastExitStatus: state.lastExitStatus,
  };
}

export function formatShellBasicsPrompt(cwd?: string): string {
  const path = cwd ?? SIMULATED_SHELL_HOME;
  if (path === SIMULATED_SHELL_HOME) {
    return `${SIMULATED_SHELL_USER}@rean-linux:~$`;
  }
  if (path.startsWith(`${SIMULATED_SHELL_HOME}/`)) {
    return `${SIMULATED_SHELL_USER}@rean-linux:~${path.slice(SIMULATED_SHELL_HOME.length)}$`;
  }
  return `${SIMULATED_SHELL_USER}@rean-linux:${path}$`;
}

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  const parts = path.split("/");
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }

  return stack.length === 0 ? "/" : `/${stack.join("/")}`;
}

function expandTilde(path: string, home: string): string {
  if (path === "~") {
    return home;
  }
  if (path.startsWith("~/")) {
    return `${home}${path.slice(1)}`;
  }
  return path;
}

function resolvePath(cwd: string, input: string, home: string): string {
  const expanded = expandTilde(input, home);
  if (expanded.startsWith("/")) {
    return normalizePath(expanded);
  }
  const base = cwd === "/" ? "" : cwd;
  return normalizePath(`${base}/${expanded}`);
}

function parentPath(path: string): string {
  if (path === "/") {
    return "/";
  }
  const index = path.lastIndexOf("/");
  if (index <= 0) {
    return "/";
  }
  return path.slice(0, index);
}

function baseName(path: string): string {
  if (path === "/") {
    return "/";
  }
  const index = path.lastIndexOf("/");
  return index < 0 ? path : path.slice(index + 1);
}

function listChildren(
  state: SimulatedShellState,
  dirPath: string,
): { name: string }[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const names = new Set<string>();

  for (const path of Object.keys(state.nodes)) {
    if (!path.startsWith(prefix) || path === dirPath) {
      continue;
    }
    const rest = path.slice(prefix.length);
    const name = rest.split("/")[0];
    if (name) {
      names.add(name);
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ name }));
}

function syncPwd(state: SimulatedShellState): void {
  state.values.PWD = state.cwd;
}

/**
 * Split a line on top-level `;`, `&&`, and `||` (not inside quotes).
 */
export function splitCommandChain(input: string): ChainSegment[] | { error: string } {
  const segments: ChainSegment[] = [];
  let current = "";
  let connector: ChainConnector | null = null;
  let i = 0;
  let quote: "'" | '"' | null = null;

  while (i < input.length) {
    const ch = input[i] ?? "";

    if (quote) {
      current += ch;
      if (ch === "\\" && quote === '"' && i + 1 < input.length) {
        current += input[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      i += 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      current += ch;
      i += 1;
      continue;
    }

    if (ch === "\\") {
      current += ch;
      if (i + 1 < input.length) {
        current += input[i + 1] ?? "";
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (input.startsWith("&&", i)) {
      if (!current.trim()) {
        return { error: "syntax error near unexpected token `&&`" };
      }
      segments.push({ connector, text: current.trim() });
      connector = "&&";
      current = "";
      i += 2;
      continue;
    }

    if (input.startsWith("||", i)) {
      if (!current.trim()) {
        return { error: "syntax error near unexpected token `||`" };
      }
      segments.push({ connector, text: current.trim() });
      connector = "||";
      current = "";
      i += 2;
      continue;
    }

    if (ch === ";") {
      if (!current.trim()) {
        return { error: "syntax error near unexpected token `;`" };
      }
      segments.push({ connector, text: current.trim() });
      connector = ";";
      current = "";
      i += 1;
      continue;
    }

    current += ch;
    i += 1;
  }

  if (quote) {
    return { error: `unexpected EOF while looking for matching \`${quote}\`` };
  }

  if (!current.trim()) {
    if (connector) {
      return { error: `syntax error near unexpected token \`${connector}\`` };
    }
    return segments;
  }

  segments.push({ connector, text: current.trim() });
  return segments;
}

type QuoteKind = "none" | "single" | "double";

type RawToken = {
  raw: string;
  quote: QuoteKind;
};

/**
 * Tokenize a single command, preserving quote kind for expansion rules.
 */
export function tokenizeShellInput(input: string): RawToken[] | { error: string } {
  const tokens: RawToken[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i] ?? "")) {
      i += 1;
    }
    if (i >= input.length) {
      break;
    }

    const ch = input[i] ?? "";

    if (ch === "'") {
      i += 1;
      let value = "";
      while (i < input.length && input[i] !== "'") {
        value += input[i];
        i += 1;
      }
      if (i >= input.length || input[i] !== "'") {
        return { error: "unexpected EOF while looking for matching `'`" };
      }
      i += 1;
      tokens.push({ raw: value, quote: "single" });
      continue;
    }

    if (ch === '"') {
      i += 1;
      let value = "";
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          value += "\\";
          value += input[i + 1] ?? "";
          i += 2;
          continue;
        }
        value += input[i];
        i += 1;
      }
      if (i >= input.length || input[i] !== '"') {
        return { error: 'unexpected EOF while looking for matching `"`' };
      }
      i += 1;
      tokens.push({ raw: value, quote: "double" });
      continue;
    }

    let value = "";
    while (i < input.length) {
      const current = input[i] ?? "";
      if (/\s/.test(current)) {
        break;
      }
      if (current === "'" || current === '"') {
        break;
      }
      if (current === "\\" && i + 1 < input.length) {
        value += "\\";
        value += input[i + 1] ?? "";
        i += 2;
        continue;
      }
      value += current;
      i += 1;
    }
    if (value) {
      tokens.push({ raw: value, quote: "none" });
    }
  }

  return tokens;
}

function lookupVariable(state: SimulatedShellState, name: string): string {
  if (name === "?") {
    return String(state.lastExitStatus);
  }
  return state.values[name] ?? "";
}

function runSimulatedSubstitution(
  command: string,
  state: SimulatedShellState,
): { output: string; error?: string } {
  const trimmed = command.trim();
  if (!trimmed) {
    return { output: "" };
  }

  const lower = trimmed.toLowerCase();
  if (lower === "date") {
    return { output: SIMULATED_DATE };
  }

  if (lower === "pwd") {
    return { output: state.cwd };
  }

  if (lower === "echo" || lower.startsWith("echo ") || lower.startsWith("echo\t")) {
    const rest = trimmed.slice("echo".length).trimStart();
    const expanded = expandToken(rest, "double", state);
    if ("error" in expanded) {
      return { output: "", error: expanded.error };
    }
    return { output: expanded.value };
  }

  if (lower === "whoami") {
    return { output: SIMULATED_SHELL_USER };
  }

  return {
    output: "",
    error: `command substitution supports only date, pwd, echo, and whoami in this lesson (got: ${trimmed})`,
  };
}

/**
 * Expand a token according to quote rules.
 * Single quotes: literal. Double/unquoted: variables, $?, $(cmd). Unquoted also handles escapes.
 */
function expandToken(
  raw: string,
  quote: QuoteKind,
  state: SimulatedShellState,
): { value: string } | { error: string } {
  if (quote === "single") {
    return { value: raw };
  }

  let result = "";
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i] ?? "";

    if (ch === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1] ?? "";
      if (quote === "double") {
        if (next === "$" || next === "`" || next === '"' || next === "\\" || next === "\n") {
          result += next;
          i += 2;
          continue;
        }
        result += "\\";
        result += next;
        i += 2;
        continue;
      }

      // Unquoted: backslash escapes the next character.
      result += next;
      i += 2;
      continue;
    }

    if (ch === "$" && raw.startsWith("$(", i)) {
      const start = i + 2;
      let depth = 1;
      let j = start;
      while (j < raw.length && depth > 0) {
        if (raw[j] === "(") {
          depth += 1;
        } else if (raw[j] === ")") {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
        j += 1;
      }
      if (depth !== 0) {
        return { error: "syntax error: unexpected end of file in command substitution" };
      }
      const inner = raw.slice(start, j);
      if (inner.includes("$(")) {
        return { error: "nested command substitution is not supported in this lesson" };
      }
      const substituted = runSimulatedSubstitution(inner, state);
      if (substituted.error) {
        return { error: substituted.error };
      }
      result += substituted.output;
      i = j + 1;
      continue;
    }

    if (ch === "$") {
      const after = raw.slice(i + 1);
      if (after.startsWith("?")) {
        result += lookupVariable(state, "?");
        i += 2;
        continue;
      }
      const match = after.match(new RegExp(`^(${VAR_NAME})`));
      if (match) {
        result += lookupVariable(state, match[1] ?? "");
        i += 1 + (match[1]?.length ?? 0);
        continue;
      }
      result += "$";
      i += 1;
      continue;
    }

    result += ch;
    i += 1;
  }

  if (quote === "none" && (result === "~" || result.startsWith("~/"))) {
    result = expandTilde(result, state.values.HOME ?? SIMULATED_SHELL_HOME);
  }

  return { value: result };
}

function expandTokens(
  tokens: readonly RawToken[],
  state: SimulatedShellState,
): string[] | { error: string } {
  const argv: string[] = [];
  for (const token of tokens) {
    const expanded = expandToken(token.raw, token.quote, state);
    if ("error" in expanded) {
      return expanded;
    }
    argv.push(expanded.value);
  }
  return argv;
}

function parseAssignment(
  input: string,
): { name: string; valueRaw: string; valueQuote: QuoteKind } | null {
  const match = input.match(new RegExp(`^(${VAR_NAME})=(.*)$`));
  if (!match) {
    return null;
  }

  const name = match[1] ?? "";
  const rawValue = match[2] ?? "";

  if (rawValue.length >= 2) {
    const first = rawValue[0];
    const last = rawValue[rawValue.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return {
        name,
        valueRaw: rawValue.slice(1, -1),
        valueQuote: first === "'" ? "single" : "double",
      };
    }
  }

  return { name, valueRaw: rawValue, valueQuote: "none" };
}

function runEcho(argv: string[]): CommandStreams {
  const text = argv.slice(1).join(" ");
  return { stdout: [text], stderr: [], status: 0 };
}

function runPwd(state: SimulatedShellState): CommandStreams {
  return { stdout: [state.cwd], stderr: [], status: 0 };
}

function runDate(): CommandStreams {
  return { stdout: [SIMULATED_DATE], stderr: [], status: 0 };
}

function runLs(argv: string[], state: SimulatedShellState): CommandStreams {
  const pathArg = argv.slice(1).find((arg) => !arg.startsWith("-"));
  const home = state.values.HOME ?? SIMULATED_SHELL_HOME;
  const target = pathArg ? resolvePath(state.cwd, pathArg, home) : state.cwd;
  const node = state.nodes[target];

  if (!node) {
    const shown = pathArg ?? target;
    return {
      stdout: [],
      stderr: [`ls: cannot access '${shown}': No such file or directory`],
      status: 2,
    };
  }

  if (node.type === "file") {
    return { stdout: [baseName(target)], stderr: [], status: 0 };
  }

  const children = listChildren(state, target);
  return {
    stdout: children.map(({ name }) => name),
    stderr: [],
    status: 0,
  };
}

function runCd(argv: string[], state: SimulatedShellState): CommandStreams {
  const home = state.values.HOME ?? SIMULATED_SHELL_HOME;
  const pathArg = argv[1] ?? "~";
  const target = resolvePath(state.cwd, pathArg, home);
  const node = state.nodes[target];

  if (!node) {
    return {
      stdout: [],
      stderr: [`bash: cd: ${pathArg}: No such file or directory`],
      status: 1,
    };
  }

  if (node.type !== "directory") {
    return {
      stdout: [],
      stderr: [`bash: cd: ${pathArg}: Not a directory`],
      status: 1,
    };
  }

  state.cwd = target;
  syncPwd(state);
  return { stdout: [], stderr: [], status: 0 };
}

function runMkdir(argv: string[], state: SimulatedShellState): CommandStreams {
  const name = argv[1];
  if (!name) {
    return {
      stdout: [],
      stderr: ["mkdir: missing operand"],
      status: 1,
    };
  }

  const home = state.values.HOME ?? SIMULATED_SHELL_HOME;
  const target = resolvePath(state.cwd, name, home);
  const parent = parentPath(target);

  if (!state.nodes[parent] || state.nodes[parent]?.type !== "directory") {
    return {
      stdout: [],
      stderr: [`mkdir: cannot create directory '${name}': No such file or directory`],
      status: 1,
    };
  }

  if (state.nodes[target]) {
    return {
      stdout: [],
      stderr: [`mkdir: cannot create directory '${name}': File exists`],
      status: 1,
    };
  }

  state.nodes[target] = { type: "directory" };
  return { stdout: [], stderr: [], status: 0 };
}

function runAssignment(
  name: string,
  valueRaw: string,
  valueQuote: QuoteKind,
  state: SimulatedShellState,
): CommandStreams {
  const expanded = expandToken(valueRaw, valueQuote, state);
  if ("error" in expanded) {
    return { stdout: [], stderr: [`bash: ${expanded.error}`], status: 1 };
  }

  state.values[name] = expanded.value;
  return { stdout: [], stderr: [], status: 0 };
}

function runSimpleCommand(
  argv: string[],
  state: SimulatedShellState,
): CommandStreams {
  const command = (argv[0] ?? "").toLowerCase();

  switch (command) {
    case "echo":
      return runEcho(argv);
    case "pwd":
      return runPwd(state);
    case "date":
      return runDate();
    case "ls":
      return runLs(argv, state);
    case "cd":
      return runCd(argv, state);
    case "mkdir":
      return runMkdir(argv, state);
    case "whoami":
      return { stdout: [SIMULATED_SHELL_USER], stderr: [], status: 0 };
    default:
      return {
        stdout: [],
        stderr: [
          `${argv[0] ?? "command"}: command not found`,
          ...UNSUPPORTED_MESSAGE,
        ],
        status: 127,
      };
  }
}

function shouldRunSegment(
  connector: ChainConnector | null,
  previousStatus: number,
): boolean {
  if (connector === null || connector === ";") {
    return true;
  }
  if (connector === "&&") {
    return previousStatus === 0;
  }
  return previousStatus !== 0;
}

function executeSingleCommand(
  text: string,
  state: SimulatedShellState,
): CommandStreams {
  const assignment = parseAssignment(text);
  if (assignment) {
    return runAssignment(
      assignment.name,
      assignment.valueRaw,
      assignment.valueQuote,
      state,
    );
  }

  const tokens = tokenizeShellInput(text);
  if ("error" in tokens) {
    return { stdout: [], stderr: [`bash: ${tokens.error}`], status: 2 };
  }

  if (tokens.length === 0) {
    return { stdout: [], stderr: [], status: 0 };
  }

  const argv = expandTokens(tokens, state);
  if ("error" in argv) {
    return { stdout: [], stderr: [`bash: ${argv.error}`], status: 2 };
  }

  if (argv.length === 0 || argv[0] === "") {
    return { stdout: [], stderr: ["bash: syntax error: empty command"], status: 2 };
  }

  return runSimpleCommand(argv, state);
}

/**
 * Resolve a typed command against simulated shell-basics state.
 * Never executes a real shell — responses and mutations stay in memory.
 */
export function simulateShellBasicsCommand(
  rawInput: string,
  state: SimulatedShellState,
): SimulateShellResult {
  const input = rawInput.trim();

  if (!input) {
    return { result: { kind: "empty" }, state };
  }

  const lower = input.toLowerCase();

  if (lower === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (lower === "help" || lower === "--help" || lower === "-h") {
    return {
      result: { kind: "output", lines: HELP_OUTPUT },
      state: { ...state, lastExitStatus: 0 },
    };
  }

  const chain = splitCommandChain(input);
  if ("error" in chain) {
    return {
      result: { kind: "output", lines: [`bash: ${chain.error}`] },
      state: { ...state, lastExitStatus: 2 },
    };
  }

  if (chain.length === 0) {
    return { result: { kind: "empty" }, state };
  }

  const next = cloneShellState(state);
  const displayLines: string[] = [];
  let status = next.lastExitStatus;

  for (const segment of chain) {
    if (!shouldRunSegment(segment.connector, status)) {
      continue;
    }

    const streams = executeSingleCommand(segment.text, next);
    displayLines.push(...streams.stdout, ...streams.stderr);
    status = streams.status;
    next.lastExitStatus = status;
  }

  return {
    result: { kind: "output", lines: displayLines },
    state: next,
  };
}
