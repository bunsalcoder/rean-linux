/**
 * Frontend-only text-processing simulation for Stage 02 Lesson 09.
 * Never executes a real shell, touches the host filesystem, or calls backend APIs.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";
import { tokenizePipesInput } from "@/lib/simulate-pipes-and-redirection";

export const SIMULATED_TEXT_USER = "bunsal";
export const SIMULATED_TEXT_HOME = `/home/${SIMULATED_TEXT_USER}`;

export type SimulatedTextNode =
  { type: "file"; content: string } | { type: "directory" };

export type SimulatedTextState = {
  nodes: Record<string, SimulatedTextNode>;
  cwd: string;
};

export type SimulateTextResult = {
  result: SimulateResult;
  state: SimulatedTextState;
};

type CommandStreams = {
  stdout: string[];
  stderr: string[];
};

type StageRedirection = {
  stdoutFile?: { path: string; append: boolean };
  stderrFile?: { path: string; append: boolean };
  stderrToStdout: boolean;
  stdinFile?: string;
};

type PipelineStage = {
  argv: string[];
  redirs: StageRedirection;
};

const NAMES_CONTENT = [
  "banana",
  "apple",
  "orange",
  "apple",
  "banana",
  "grape",
  "orange",
  "banana",
].join("\n");

const USERS_CONTENT = [
  "bunsal:1000:developers",
  "alice:1001:developers",
  "bob:1002:engineering",
  "root:0:root",
  "charlie:1003:developers",
].join("\n");

const NOTES_CONTENT = [
  "Welcome to text processing",
  "Linux commands often produce text",
  "Pipes connect one command to another",
  "grep filters matching lines",
  "wc counts lines words and bytes",
  "sort orders lines alphabetically",
  "uniq removes adjacent duplicates",
  "cut extracts fields from structured text",
  "head shows the beginning of a file",
  "tail shows the end of a file",
  "Practice combining small tools",
  "Build useful results one step at a time",
].join("\n");

const APP_LOG_CONTENT = [
  "info: application started",
  "debug: loading configuration",
  "info: listening on port 8080",
  "error: connection failed",
  "warn: retrying request",
  "error: timeout waiting for response",
  "debug: closing connection",
  "info: request completed",
  "error: connection failed",
  "info: application stopped",
].join("\n");

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                      Show this help message",
  "  pwd                       Print the current directory",
  "  ls [path]                 List files and directories",
  "  cat [file]                Display file contents or stdin",
  "  echo [text]               Print text",
  "  grep PATTERN [file]       Filter lines containing PATTERN",
  "  wc [options] [file]       Count lines, words, and bytes",
  "  sort [options] [file]     Sort lines",
  "  uniq [options] [file]     Remove/count adjacent duplicates",
  "  cut [options] [file]      Extract fields",
  "  head [options] [file]     Show the beginning of input",
  "  tail [options] [file]     Show the end of input",
  "  clear                     Clear the terminal screen",
  "",
  "Common options:",
  "  wc -l / -w / -c           Lines / words / bytes",
  "  sort -r                   Reverse sort",
  "  uniq -c                   Count adjacent duplicates",
  "  cut -d DELIM -f LIST      Delimiter and field list",
  "  head -n N / tail -n N     First / last N lines",
  "",
  "Redirection and pipes:",
  "  > file                    Overwrite file with stdout",
  "  >> file                   Append stdout to file",
  "  < file                    Use file as stdin",
  "  command1 | command2       Pipe stdout to the next command",
  "  2> file                   Redirect stderr to file",
  "  2>&1                      Send stderr to the same place as stdout",
  "",
  "Examples:",
  "  wc -l notes.txt",
  "  sort names.txt",
  "  sort names.txt | uniq",
  "  cut -d: -f1 users.txt",
  "  cat users.txt | cut -d: -f3 | sort | uniq",
  "  head -n 5 notes.txt",
  "  sort names.txt > sorted.txt",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

const DEFAULT_HEAD_TAIL_LINES = 10;

export function createInitialTextProcessingState(): SimulatedTextState {
  return {
    cwd: SIMULATED_TEXT_HOME,
    nodes: {
      "/": { type: "directory" },
      "/home": { type: "directory" },
      [SIMULATED_TEXT_HOME]: { type: "directory" },
      [`${SIMULATED_TEXT_HOME}/notes.txt`]: {
        type: "file",
        content: NOTES_CONTENT,
      },
      [`${SIMULATED_TEXT_HOME}/names.txt`]: {
        type: "file",
        content: NAMES_CONTENT,
      },
      [`${SIMULATED_TEXT_HOME}/users.txt`]: {
        type: "file",
        content: USERS_CONTENT,
      },
      [`${SIMULATED_TEXT_HOME}/app.log`]: {
        type: "file",
        content: APP_LOG_CONTENT,
      },
      "/var": { type: "directory" },
      "/var/log": { type: "directory" },
      "/var/log/app.log": {
        type: "file",
        content: APP_LOG_CONTENT,
      },
    },
  };
}

export function cloneTextProcessingState(
  state: SimulatedTextState,
): SimulatedTextState {
  const nodes: Record<string, SimulatedTextNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    nodes[path] =
      node.type === "file"
        ? { type: "file", content: node.content }
        : { type: "directory" };
  }
  return { nodes, cwd: state.cwd };
}

export function formatTextProcessingPrompt(cwd?: string): string {
  const path = cwd ?? SIMULATED_TEXT_HOME;
  if (path === SIMULATED_TEXT_HOME) {
    return `${SIMULATED_TEXT_USER}@rean-linux:~$`;
  }
  if (path.startsWith(`${SIMULATED_TEXT_HOME}/`)) {
    return `${SIMULATED_TEXT_USER}@rean-linux:~${path.slice(SIMULATED_TEXT_HOME.length)}$`;
  }
  return `${SIMULATED_TEXT_USER}@rean-linux:${path}$`;
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

function expandHome(path: string): string {
  if (path === "~") {
    return SIMULATED_TEXT_HOME;
  }
  if (path.startsWith("~/")) {
    return `${SIMULATED_TEXT_HOME}${path.slice(1)}`;
  }
  return path;
}

function resolvePath(cwd: string, input: string): string {
  const expanded = expandHome(input);
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
  return path.slice(path.lastIndexOf("/") + 1);
}

function listChildren(
  state: SimulatedTextState,
  dirPath: string,
): { name: string; node: SimulatedTextNode }[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const children: { name: string; node: SimulatedTextNode }[] = [];

  for (const [path, node] of Object.entries(state.nodes)) {
    if (path === dirPath) {
      continue;
    }
    if (!path.startsWith(prefix)) {
      continue;
    }
    const rest = path.slice(prefix.length);
    if (!rest || rest.includes("/")) {
      continue;
    }
    children.push({ name: rest, node });
  }

  children.sort((a, b) => a.name.localeCompare(b.name));
  return children;
}

function readFileLines(
  state: SimulatedTextState,
  path: string,
): { ok: true; lines: string[] } | { ok: false; error: string } {
  const node = state.nodes[path];
  if (!node) {
    return { ok: false, error: `${path}: No such file or directory` };
  }
  if (node.type !== "file") {
    return { ok: false, error: `${path}: Is a directory` };
  }
  if (node.content === "") {
    return { ok: true, lines: [] };
  }
  return { ok: true, lines: node.content.split("\n") };
}

function writeFile(
  state: SimulatedTextState,
  path: string,
  content: string,
  append: boolean,
): { ok: true } | { ok: false; error: string } {
  const parent = parentPath(path);
  if (!state.nodes[parent] || state.nodes[parent]?.type !== "directory") {
    return {
      ok: false,
      error: `${path}: No such file or directory`,
    };
  }

  const existing = state.nodes[path];
  if (existing?.type === "directory") {
    return { ok: false, error: `${path}: Is a directory` };
  }

  if (append && existing?.type === "file") {
    const previous = existing.content;
    const joined =
      previous === ""
        ? content
        : content === ""
          ? previous
          : `${previous}\n${content}`;
    state.nodes[path] = { type: "file", content: joined };
  } else {
    state.nodes[path] = { type: "file", content };
  }

  return { ok: true };
}

function emptyRedirs(): StageRedirection {
  return { stderrToStdout: false };
}

function isOperatorToken(token: string): boolean {
  return (
    token === "|" ||
    token === ">" ||
    token === ">>" ||
    token === "<" ||
    token === "2>" ||
    token === "2>&1"
  );
}

function parseStageTokens(tokens: string[]): PipelineStage | { error: string } {
  const argv: string[] = [];
  const redirs = emptyRedirs();
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i] ?? "";

    if (token === "2>&1") {
      redirs.stderrToStdout = true;
      i += 1;
      continue;
    }

    if (token === "2>" || token === ">>" || token === ">" || token === "<") {
      const target = tokens[i + 1];
      if (!target || isOperatorToken(target)) {
        return { error: `syntax error near unexpected token \`${token}\`` };
      }

      if (token === "2>") {
        redirs.stderrFile = { path: target, append: false };
      } else if (token === ">>") {
        redirs.stdoutFile = { path: target, append: true };
      } else if (token === ">") {
        redirs.stdoutFile = { path: target, append: false };
      } else {
        redirs.stdinFile = target;
      }

      i += 2;
      continue;
    }

    if (token === "|") {
      return { error: "syntax error near unexpected token `|`" };
    }

    argv.push(token);
    i += 1;
  }

  return { argv, redirs };
}

function parsePipeline(tokens: string[]): PipelineStage[] | { error: string } {
  if (tokens.length === 0) {
    return { error: "empty command" };
  }

  const stages: PipelineStage[] = [];
  let current: string[] = [];

  for (const token of tokens) {
    if (token === "|") {
      if (current.length === 0) {
        return { error: "syntax error near unexpected token `|`" };
      }
      const stage = parseStageTokens(current);
      if ("error" in stage) {
        return stage;
      }
      stages.push(stage);
      current = [];
      continue;
    }
    current.push(token);
  }

  if (current.length === 0) {
    return { error: "syntax error near unexpected token `|`" };
  }

  const last = parseStageTokens(current);
  if ("error" in last) {
    return last;
  }
  stages.push(last);

  return stages;
}

function resolveInputLines(
  pathArg: string | undefined,
  state: SimulatedTextState,
  stdin: readonly string[],
  commandName: string,
):
  { ok: true; lines: string[]; label?: string } | { ok: false; error: string } {
  if (!pathArg) {
    return { ok: true, lines: [...stdin] };
  }

  const target = resolvePath(state.cwd, pathArg);
  const read = readFileLines(state, target);
  if (!read.ok) {
    return {
      ok: false,
      error: `${commandName}: ${pathArg}: No such file or directory`,
    };
  }
  return { ok: true, lines: read.lines, label: pathArg };
}

/** First non-option operand after known value-taking flags. */
function takeFileOperand(
  argv: string[],
  valueFlags: ReadonlySet<string>,
): string | undefined {
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i]!;

    if (arg.startsWith("-") && arg !== "-") {
      const flag = arg.length === 2 ? arg : arg.slice(0, 2);
      if (valueFlags.has(flag) && arg.length === 2) {
        i += 1;
      }
      continue;
    }

    return arg;
  }
  return undefined;
}

function countWords(lines: readonly string[]): number {
  let count = 0;
  for (const line of lines) {
    const parts = line.trim().split(/\s+/).filter(Boolean);
    count += parts.length;
  }
  return count;
}

function countBytes(lines: readonly string[]): number {
  if (lines.length === 0) {
    return 0;
  }
  // Approximate GNU wc -c: join with newlines (file content length).
  return lines.join("\n").length;
}

function formatWcCount(value: number): string {
  return String(value).padStart(7, " ");
}

function runWc(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  let showLines = false;
  let showWords = false;
  let showBytes = false;
  const flags = argv.slice(1).filter((arg) => arg.startsWith("-"));

  for (const flag of flags) {
    const chars = flag.slice(1);
    for (const ch of chars) {
      if (ch === "l") {
        showLines = true;
      } else if (ch === "w") {
        showWords = true;
      } else if (ch === "c") {
        showBytes = true;
      } else {
        return {
          stdout: [],
          stderr: [`wc: invalid option -- '${ch}'`],
        };
      }
    }
  }

  if (!showLines && !showWords && !showBytes) {
    showLines = true;
    showWords = true;
    showBytes = true;
  }

  const input = resolveInputLines(
    takeFileOperand(argv, new Set()),
    state,
    stdin,
    "wc",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  const parts: string[] = [];
  if (showLines) {
    parts.push(formatWcCount(input.lines.length));
  }
  if (showWords) {
    parts.push(formatWcCount(countWords(input.lines)));
  }
  if (showBytes) {
    parts.push(formatWcCount(countBytes(input.lines)));
  }

  const body = parts.join(" ").trimStart();
  const line = input.label ? `${body} ${input.label}` : body;
  return { stdout: [line], stderr: [] };
}

function runSort(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  let reverse = false;
  for (const arg of argv.slice(1)) {
    if (!arg.startsWith("-")) {
      continue;
    }
    for (const ch of arg.slice(1)) {
      if (ch === "r") {
        reverse = true;
      } else {
        return {
          stdout: [],
          stderr: [`sort: invalid option -- '${ch}'`],
        };
      }
    }
  }

  const input = resolveInputLines(
    takeFileOperand(argv, new Set()),
    state,
    stdin,
    "sort",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  const sorted = [...input.lines].sort((a, b) => a.localeCompare(b));
  if (reverse) {
    sorted.reverse();
  }
  return { stdout: sorted, stderr: [] };
}

function runUniq(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  let count = false;
  for (const arg of argv.slice(1)) {
    if (!arg.startsWith("-")) {
      continue;
    }
    for (const ch of arg.slice(1)) {
      if (ch === "c") {
        count = true;
      } else {
        return {
          stdout: [],
          stderr: [`uniq: invalid option -- '${ch}'`],
        };
      }
    }
  }

  const input = resolveInputLines(
    takeFileOperand(argv, new Set()),
    state,
    stdin,
    "uniq",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  if (input.lines.length === 0) {
    return { stdout: [], stderr: [] };
  }

  const out: string[] = [];
  let current = input.lines[0]!;
  let occurrences = 1;

  for (let i = 1; i < input.lines.length; i += 1) {
    const line = input.lines[i]!;
    if (line === current) {
      occurrences += 1;
      continue;
    }
    out.push(
      count ? `${String(occurrences).padStart(7, " ")} ${current}` : current,
    );
    current = line;
    occurrences = 1;
  }
  out.push(
    count ? `${String(occurrences).padStart(7, " ")} ${current}` : current,
  );

  return { stdout: out, stderr: [] };
}

function parseFieldList(value: string): number[] | { error: string } {
  const fields: number[] = [];
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (!/^\d+$/.test(trimmed)) {
      return { error: `cut: invalid field value '${part}'` };
    }
    const num = Number(trimmed);
    if (num < 1) {
      return { error: `cut: fields are numbered from 1` };
    }
    fields.push(num);
  }
  if (fields.length === 0) {
    return { error: "cut: option requires an argument -- 'f'" };
  }
  return fields;
}

function runCut(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  let delimiter: string | undefined;
  let fields: number[] | undefined;

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i]!;

    if (arg.startsWith("-d") && arg.length > 2) {
      delimiter = arg.slice(2);
      continue;
    }
    if (arg === "-d") {
      const value = argv[i + 1];
      if (value === undefined) {
        return {
          stdout: [],
          stderr: ["cut: option requires an argument -- 'd'"],
        };
      }
      delimiter = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("-f") && arg.length > 2) {
      const parsed = parseFieldList(arg.slice(2));
      if ("error" in parsed) {
        return { stdout: [], stderr: [parsed.error] };
      }
      fields = parsed;
      continue;
    }
    if (arg === "-f") {
      const value = argv[i + 1];
      if (value === undefined) {
        return {
          stdout: [],
          stderr: ["cut: option requires an argument -- 'f'"],
        };
      }
      const parsed = parseFieldList(value);
      if ("error" in parsed) {
        return { stdout: [], stderr: [parsed.error] };
      }
      fields = parsed;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      return {
        stdout: [],
        stderr: [`cut: invalid option -- '${arg.slice(1)}'`],
      };
    }
  }

  if (!fields) {
    return {
      stdout: [],
      stderr: ["cut: you must specify a list of fields with -f"],
    };
  }

  const delim = delimiter ?? "\t";
  const input = resolveInputLines(
    takeFileOperand(argv, new Set(["-d", "-f"])),
    state,
    stdin,
    "cut",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  const stdout = input.lines.map((line) => {
    const parts = line.split(delim);
    return fields!.map((field) => parts[field - 1] ?? "").join(delim);
  });

  return { stdout, stderr: [] };
}

function parseLineCount(
  argv: string[],
  commandName: "head" | "tail",
): { count: number } | { error: string } {
  let count = DEFAULT_HEAD_TAIL_LINES;

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === "-n") {
      const value = argv[i + 1];
      if (value === undefined || !/^\d+$/.test(value)) {
        return {
          error: `${commandName}: invalid number of lines`,
        };
      }
      count = Number(value);
      i += 1;
      continue;
    }
    if (arg.startsWith("-n") && arg.length > 2) {
      const value = arg.slice(2);
      if (!/^\d+$/.test(value)) {
        return {
          error: `${commandName}: invalid number of lines`,
        };
      }
      count = Number(value);
      continue;
    }
    if (arg.startsWith("-") && arg !== "-") {
      return {
        error: `${commandName}: invalid option -- '${arg.slice(1)}'`,
      };
    }
  }

  return { count };
}

function runHead(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  const parsed = parseLineCount(argv, "head");
  if ("error" in parsed) {
    return { stdout: [], stderr: [parsed.error] };
  }

  const input = resolveInputLines(
    takeFileOperand(argv, new Set(["-n"])),
    state,
    stdin,
    "head",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  return { stdout: input.lines.slice(0, parsed.count), stderr: [] };
}

function runTail(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  if (argv.includes("-f")) {
    return {
      stdout: [],
      stderr: [
        "tail: -f is not available in this learning terminal",
        "Follow mode belongs to a later topic.",
      ],
    };
  }

  const parsed = parseLineCount(argv, "tail");
  if ("error" in parsed) {
    return { stdout: [], stderr: [parsed.error] };
  }

  const input = resolveInputLines(
    takeFileOperand(argv, new Set(["-n"])),
    state,
    stdin,
    "tail",
  );
  if (!input.ok) {
    return { stdout: [], stderr: [input.error] };
  }

  if (parsed.count <= 0) {
    return { stdout: [], stderr: [] };
  }

  return {
    stdout: input.lines.slice(Math.max(0, input.lines.length - parsed.count)),
    stderr: [],
  };
}

function runEcho(argv: string[]): CommandStreams {
  const text = argv.slice(1).join(" ");
  return { stdout: text === "" ? [""] : [text], stderr: [] };
}

function runPwd(state: SimulatedTextState): CommandStreams {
  return { stdout: [state.cwd], stderr: [] };
}

function runLs(argv: string[], state: SimulatedTextState): CommandStreams {
  const pathArg = argv.slice(1).find((arg) => !arg.startsWith("-"));
  const target = pathArg ? resolvePath(state.cwd, pathArg) : state.cwd;
  const node = state.nodes[target];

  if (!node) {
    const shown = pathArg ?? target;
    return {
      stdout: [],
      stderr: [`ls: cannot access '${shown}': No such file or directory`],
    };
  }

  if (node.type === "file") {
    return { stdout: [baseName(target)], stderr: [] };
  }

  const children = listChildren(state, target);
  return {
    stdout: children.map(({ name }) => name),
    stderr: [],
  };
}

function runCat(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  const pathArg = argv[1];

  if (!pathArg) {
    return { stdout: [...stdin], stderr: [] };
  }

  const target = resolvePath(state.cwd, pathArg);
  const node = state.nodes[target];
  if (!node) {
    return {
      stdout: [],
      stderr: [`cat: ${pathArg}: No such file or directory`],
    };
  }
  if (node.type !== "file") {
    return {
      stdout: [],
      stderr: [`cat: ${pathArg}: Is a directory`],
    };
  }

  return {
    stdout: node.content === "" ? [] : node.content.split("\n"),
    stderr: [],
  };
}

function runGrep(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  let ignoreCase = false;
  const rest: string[] = [];

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg.startsWith("-") && arg !== "-") {
      for (const flag of arg.slice(1)) {
        if (flag === "i") {
          ignoreCase = true;
        } else {
          return {
            stdout: [],
            stderr: [`grep: invalid option -- '${flag}'`],
          };
        }
      }
      continue;
    }
    rest.push(arg);
  }

  const pattern = rest[0];
  if (!pattern) {
    return {
      stdout: [],
      stderr: ["Usage: grep PATTERN [file]"],
    };
  }

  const pathArg = rest[1];
  let lines: string[];

  if (pathArg) {
    const target = resolvePath(state.cwd, pathArg);
    const read = readFileLines(state, target);
    if (!read.ok) {
      return {
        stdout: [],
        stderr: [`grep: ${pathArg}: No such file or directory`],
      };
    }
    lines = read.lines;
  } else {
    lines = [...stdin];
  }

  return {
    stdout: lines.filter((line) =>
      ignoreCase
        ? line.toLowerCase().includes(pattern.toLowerCase())
        : line.includes(pattern),
    ),
    stderr: [],
  };
}

function runSimpleCommand(
  argv: string[],
  state: SimulatedTextState,
  stdin: readonly string[],
): CommandStreams {
  const command = (argv[0] ?? "").toLowerCase();

  switch (command) {
    case "echo":
      return runEcho(argv);
    case "pwd":
      return runPwd(state);
    case "ls":
      return runLs(argv, state);
    case "cat":
      return runCat(argv, state, stdin);
    case "grep":
      return runGrep(argv, state, stdin);
    case "wc":
      return runWc(argv, state, stdin);
    case "sort":
      return runSort(argv, state, stdin);
    case "uniq":
      return runUniq(argv, state, stdin);
    case "cut":
      return runCut(argv, state, stdin);
    case "head":
      return runHead(argv, state, stdin);
    case "tail":
      return runTail(argv, state, stdin);
    default:
      return {
        stdout: [],
        stderr: [
          `${argv[0] ?? "command"}: command not found`,
          ...UNSUPPORTED_MESSAGE,
        ],
      };
  }
}

function applyRedirections(
  streams: CommandStreams,
  redirs: StageRedirection,
  state: SimulatedTextState,
): { remainingStdout: string[]; remainingStderr: string[] } {
  let stdout = [...streams.stdout];
  let stderr = [...streams.stderr];

  if (redirs.stderrToStdout && redirs.stdoutFile) {
    const path = resolvePath(state.cwd, redirs.stdoutFile.path);
    const combined = [...stdout, ...stderr].join("\n");
    const written = writeFile(state, path, combined, redirs.stdoutFile.append);
    if (!written.ok) {
      return {
        remainingStdout: [],
        remainingStderr: [`bash: ${written.error}`],
      };
    }
    return { remainingStdout: [], remainingStderr: [] };
  }

  if (redirs.stderrToStdout) {
    stdout = [...stdout, ...stderr];
    stderr = [];
  }

  if (redirs.stdoutFile) {
    const path = resolvePath(state.cwd, redirs.stdoutFile.path);
    const written = writeFile(
      state,
      path,
      stdout.join("\n"),
      redirs.stdoutFile.append,
    );
    if (!written.ok) {
      return {
        remainingStdout: [],
        remainingStderr: [`bash: ${written.error}`],
      };
    }
    stdout = [];
  }

  if (redirs.stderrFile) {
    const path = resolvePath(state.cwd, redirs.stderrFile.path);
    const written = writeFile(
      state,
      path,
      stderr.join("\n"),
      redirs.stderrFile.append,
    );
    if (!written.ok) {
      return {
        remainingStdout: stdout,
        remainingStderr: [`bash: ${written.error}`],
      };
    }
    stderr = [];
  }

  return { remainingStdout: stdout, remainingStderr: stderr };
}

/**
 * Resolve a typed command against the in-memory text-processing filesystem.
 * Never executes a real shell — responses and mutations stay in memory.
 */
export function simulateTextProcessingCommand(
  rawInput: string,
  state: SimulatedTextState,
): SimulateTextResult {
  const input = rawInput.trim();

  if (!input) {
    return { result: { kind: "empty" }, state };
  }

  const lower = input.toLowerCase();
  if (lower === "help") {
    return {
      result: { kind: "output", lines: HELP_OUTPUT },
      state,
    };
  }

  if (lower === "clear") {
    return { result: { kind: "clear" }, state };
  }

  const tokens = tokenizePipesInput(input);
  const parsed = parsePipeline(tokens);

  if ("error" in parsed) {
    return {
      result: { kind: "output", lines: [`bash: ${parsed.error}`] },
      state,
    };
  }

  const next = cloneTextProcessingState(state);
  let pipeStdin: string[] = [];
  const displayLines: string[] = [];

  for (let index = 0; index < parsed.length; index += 1) {
    const stage = parsed[index]!;
    const isLast = index === parsed.length - 1;

    if (stage.argv.length === 0) {
      return {
        result: {
          kind: "output",
          lines: ["bash: syntax error: empty command"],
        },
        state,
      };
    }

    let stdin = pipeStdin;
    if (stage.redirs.stdinFile) {
      const path = resolvePath(next.cwd, stage.redirs.stdinFile);
      const read = readFileLines(next, path);
      if (!read.ok) {
        return {
          result: {
            kind: "output",
            lines: [
              `bash: ${stage.redirs.stdinFile}: No such file or directory`,
            ],
          },
          state: next,
        };
      }
      stdin = read.lines;
    }

    const streams = runSimpleCommand(stage.argv, next, stdin);
    const applied = applyRedirections(streams, stage.redirs, next);

    if (isLast) {
      displayLines.push(...applied.remainingStdout, ...applied.remainingStderr);
    } else {
      displayLines.push(...applied.remainingStderr);
      pipeStdin = applied.remainingStdout;
    }
  }

  return {
    result: { kind: "output", lines: displayLines },
    state: next,
  };
}
