/**
 * Frontend-only searching/finding simulation for Stage 02 Lesson 08.
 * Never executes a real shell, touches the host filesystem, or calls backend APIs.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";
import { tokenizePipesInput } from "@/lib/simulate-pipes-and-redirection";

export const SIMULATED_SEARCH_USER = "bunsal";
export const SIMULATED_SEARCH_HOME = `/home/${SIMULATED_SEARCH_USER}`;

export type SimulatedSearchNode =
  { type: "file"; content: string } | { type: "directory" };

export type SimulatedSearchState = {
  nodes: Record<string, SimulatedSearchNode>;
  cwd: string;
};

export type SimulateSearchResult = {
  result: SimulateResult;
  state: SimulatedSearchState;
};

type CommandStreams = {
  stdout: string[];
  stderr: string[];
};

type PipelineStage = {
  argv: string[];
};

const PASSWD_CONTENT = [
  "root:x:0:0:root:/root:/bin/bash",
  "bunsal:x:1000:1000:Bunsal:/home/bunsal:/bin/bash",
  "alice:x:1002:1002:Alice:/home/alice:/bin/bash",
].join("\n");

const GROUP_CONTENT = [
  "root:x:0:",
  "bunsal:x:1000:",
  "alice:x:1002:",
  "developers:x:1001:bunsal,alice",
].join("\n");

const NOTES_CONTENT = [
  "hello from the notes file",
  "Linux is useful for searching files",
  "User: bunsal",
].join("\n");

const APP_LOG_CONTENT = [
  "info: application started",
  "error: connection failed",
  "debug: retrying request",
  "error: timeout waiting for response",
  "debug: closing connection",
].join("\n");

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                      Show this help message",
  "  pwd                       Print the current directory",
  "  ls [path]                 List files and directories",
  "  cat [file]                Display file contents",
  "  find PATH [options]       Search for files and directories",
  "  grep [options] PATTERN [file]",
  "                            Search text in files or stdin",
  "  clear                     Clear the terminal screen",
  "",
  "find options:",
  "  -name PATTERN             Match filename (supports *)",
  "  -iname PATTERN            Case-insensitive -name",
  "  -type f                   Regular files only",
  "  -type d                   Directories only",
  "",
  "grep options:",
  "  -i                        Case-insensitive search",
  "  -n                        Show line numbers",
  "  -v                        Invert match (exclude matching lines)",
  "  -r                        Recursive search under a directory",
  "",
  "Pipes:",
  "  command1 | command2       Send stdout to the next command",
  "",
  "Examples:",
  '  find . -name "*.txt"',
  "  find . -type d",
  '  grep "bunsal" /etc/passwd',
  '  grep -i "linux" notes.txt',
  '  grep -r "bunsal" .',
  '  find . -type f | grep ".txt"',
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

export function createInitialSearchState(): SimulatedSearchState {
  return {
    cwd: SIMULATED_SEARCH_HOME,
    nodes: {
      "/": { type: "directory" },
      "/home": { type: "directory" },
      [SIMULATED_SEARCH_HOME]: { type: "directory" },
      [`${SIMULATED_SEARCH_HOME}/notes.txt`]: {
        type: "file",
        content: NOTES_CONTENT,
      },
      [`${SIMULATED_SEARCH_HOME}/README.md`]: {
        type: "file",
        content: "# README\nWelcome, bunsal\n",
      },
      [`${SIMULATED_SEARCH_HOME}/app.log`]: {
        type: "file",
        content: APP_LOG_CONTENT,
      },
      [`${SIMULATED_SEARCH_HOME}/projects`]: { type: "directory" },
      [`${SIMULATED_SEARCH_HOME}/projects/app.txt`]: {
        type: "file",
        content: "application notes\n",
      },
      [`${SIMULATED_SEARCH_HOME}/projects/server.log`]: {
        type: "file",
        content: "server started\nbunsal deployed the service\n",
      },
      [`${SIMULATED_SEARCH_HOME}/logs`]: { type: "directory" },
      [`${SIMULATED_SEARCH_HOME}/logs/app.log`]: {
        type: "file",
        content: APP_LOG_CONTENT,
      },
      [`${SIMULATED_SEARCH_HOME}/logs/error.log`]: {
        type: "file",
        content: "error: disk nearly full\ndebug: cleanup skipped\n",
      },
      "/etc": { type: "directory" },
      "/etc/passwd": { type: "file", content: PASSWD_CONTENT },
      "/etc/group": { type: "file", content: GROUP_CONTENT },
      "/etc/nginx": { type: "directory" },
      "/etc/nginx/nginx.conf": {
        type: "file",
        content: "server {\n  listen 80;\n}\n",
      },
    },
  };
}

export function cloneSearchState(
  state: SimulatedSearchState,
): SimulatedSearchState {
  const nodes: Record<string, SimulatedSearchNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    nodes[path] =
      node.type === "file"
        ? { type: "file", content: node.content }
        : { type: "directory" };
  }
  return { nodes, cwd: state.cwd };
}

export function formatSearchingAndFindingPrompt(cwd?: string): string {
  const path = cwd ?? SIMULATED_SEARCH_HOME;
  if (path === SIMULATED_SEARCH_HOME) {
    return `${SIMULATED_SEARCH_USER}@rean-linux:~$`;
  }
  if (path.startsWith(`${SIMULATED_SEARCH_HOME}/`)) {
    return `${SIMULATED_SEARCH_USER}@rean-linux:~${path.slice(SIMULATED_SEARCH_HOME.length)}$`;
  }
  return `${SIMULATED_SEARCH_USER}@rean-linux:${path}$`;
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
    return SIMULATED_SEARCH_HOME;
  }
  if (path.startsWith("~/")) {
    return `${SIMULATED_SEARCH_HOME}${path.slice(1)}`;
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

function baseName(path: string): string {
  if (path === "/") {
    return "/";
  }
  return path.slice(path.lastIndexOf("/") + 1);
}

function listChildren(
  state: SimulatedSearchState,
  dirPath: string,
): { name: string; node: SimulatedSearchNode }[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const children: { name: string; node: SimulatedSearchNode }[] = [];

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

function matchGlob(
  name: string,
  pattern: string,
  ignoreCase: boolean,
): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  const flags = ignoreCase ? "i" : "";
  return new RegExp(`^${escaped}$`, flags).test(name);
}

function toFindDisplayPath(
  startArg: string,
  startAbsolute: string,
  path: string,
): string {
  if (startArg.startsWith("/") || startArg.startsWith("~")) {
    return path;
  }

  if (path === startAbsolute) {
    return startArg === "." ? "." : startArg;
  }

  if (startAbsolute === "/") {
    return `.${path}`;
  }

  const relative = path.slice(startAbsolute.length + 1);
  if (startArg === ".") {
    return `./${relative}`;
  }
  return `${startArg.replace(/\/$/, "")}/${relative}`;
}

function collectDescendants(
  state: SimulatedSearchState,
  startPath: string,
): string[] {
  const results: string[] = [];
  const prefix = startPath === "/" ? "/" : `${startPath}/`;

  for (const path of Object.keys(state.nodes)) {
    if (path === startPath || path.startsWith(prefix)) {
      results.push(path);
    }
  }

  results.sort((a, b) => a.localeCompare(b));
  return results;
}

type FindOptions = {
  name?: string;
  iname?: string;
  type?: "f" | "d";
};

function parseFindArgv(
  argv: string[],
): { start: string; options: FindOptions } | { error: string } {
  if (argv.length < 2) {
    return {
      error: "Usage: find PATH [-name PATTERN] [-iname PATTERN] [-type f|d]",
    };
  }

  const start = argv[1]!;
  const options: FindOptions = {};
  let i = 2;

  while (i < argv.length) {
    const flag = argv[i];
    if (flag === "-name" || flag === "-iname") {
      const pattern = argv[i + 1];
      if (!pattern) {
        return { error: `find: missing argument to \`${flag}\`` };
      }
      if (flag === "-name") {
        options.name = pattern;
      } else {
        options.iname = pattern;
      }
      i += 2;
      continue;
    }
    if (flag === "-type") {
      const value = argv[i + 1];
      if (value !== "f" && value !== "d") {
        return { error: "find: invalid argument to `-type` (use f or d)" };
      }
      options.type = value;
      i += 2;
      continue;
    }
    return { error: `find: unknown predicate \`${flag}\`` };
  }

  return { start, options };
}

function runFind(argv: string[], state: SimulatedSearchState): CommandStreams {
  const parsed = parseFindArgv(argv);
  if ("error" in parsed) {
    return { stdout: [], stderr: [parsed.error] };
  }

  const startAbsolute = resolvePath(state.cwd, parsed.start);
  const startNode = state.nodes[startAbsolute];
  if (!startNode) {
    return {
      stdout: [],
      stderr: [`find: ‘${parsed.start}’: No such file or directory`],
    };
  }

  const matches: string[] = [];
  for (const path of collectDescendants(state, startAbsolute)) {
    const node = state.nodes[path];
    if (!node) {
      continue;
    }

    if (parsed.options.type === "f" && node.type !== "file") {
      continue;
    }
    if (parsed.options.type === "d" && node.type !== "directory") {
      continue;
    }

    const name = baseName(path);
    if (parsed.options.name !== undefined) {
      if (!matchGlob(name, parsed.options.name, false)) {
        continue;
      }
    }
    if (parsed.options.iname !== undefined) {
      if (!matchGlob(name, parsed.options.iname, true)) {
        continue;
      }
    }

    matches.push(toFindDisplayPath(parsed.start, startAbsolute, path));
  }

  return { stdout: matches, stderr: [] };
}

type GrepOptions = {
  ignoreCase: boolean;
  lineNumbers: boolean;
  invert: boolean;
  recursive: boolean;
  pattern: string;
  targets: string[];
};

function parseGrepArgv(argv: string[]): GrepOptions | { error: string } {
  let ignoreCase = false;
  let lineNumbers = false;
  let invert = false;
  let recursive = false;
  const rest: string[] = [];

  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg.startsWith("-") && arg !== "-") {
      const flags = arg.slice(1);
      for (const flag of flags) {
        if (flag === "i") {
          ignoreCase = true;
        } else if (flag === "n") {
          lineNumbers = true;
        } else if (flag === "v") {
          invert = true;
        } else if (flag === "r") {
          recursive = true;
        } else {
          return { error: `grep: invalid option -- '${flag}'` };
        }
      }
      continue;
    }
    rest.push(arg);
  }

  const pattern = rest[0];
  if (!pattern) {
    return { error: "Usage: grep [options] PATTERN [file...]" };
  }

  return {
    ignoreCase,
    lineNumbers,
    invert,
    recursive,
    pattern,
    targets: rest.slice(1),
  };
}

function lineMatches(
  line: string,
  pattern: string,
  ignoreCase: boolean,
): boolean {
  if (ignoreCase) {
    return line.toLowerCase().includes(pattern.toLowerCase());
  }
  return line.includes(pattern);
}

function filterLines(
  lines: readonly string[],
  options: Pick<
    GrepOptions,
    "pattern" | "ignoreCase" | "invert" | "lineNumbers"
  >,
  pathLabel?: string,
): string[] {
  const out: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const matched = lineMatches(line, options.pattern, options.ignoreCase);
    if (options.invert ? matched : !matched) {
      continue;
    }

    let rendered = line;
    if (options.lineNumbers) {
      rendered = `${index + 1}:${line}`;
    }
    if (pathLabel) {
      rendered = `${pathLabel}:${rendered}`;
    }
    out.push(rendered);
  }
  return out;
}

function collectFilesUnder(
  state: SimulatedSearchState,
  startPath: string,
): string[] {
  const files: string[] = [];
  for (const path of collectDescendants(state, startPath)) {
    if (state.nodes[path]?.type === "file") {
      files.push(path);
    }
  }
  return files;
}

function runGrep(
  argv: string[],
  state: SimulatedSearchState,
  stdin: readonly string[],
): CommandStreams {
  const parsed = parseGrepArgv(argv);
  if ("error" in parsed) {
    return { stdout: [], stderr: [parsed.error] };
  }

  // Piped input with no file targets — filter stdin lines.
  if (parsed.targets.length === 0 && !parsed.recursive) {
    return {
      stdout: filterLines(stdin, parsed),
      stderr: [],
    };
  }

  const targets =
    parsed.targets.length > 0 ? parsed.targets : parsed.recursive ? ["."] : [];

  if (targets.length === 0) {
    return {
      stdout: filterLines(stdin, parsed),
      stderr: [],
    };
  }

  const stdout: string[] = [];
  const stderr: string[] = [];

  for (const targetArg of targets) {
    const absolute = resolvePath(state.cwd, targetArg);
    const node = state.nodes[absolute];

    if (!node) {
      stderr.push(`grep: ${targetArg}: No such file or directory`);
      continue;
    }

    if (node.type === "directory") {
      if (!parsed.recursive) {
        stderr.push(`grep: ${targetArg}: Is a directory`);
        continue;
      }

      const files = collectFilesUnder(state, absolute);
      for (const filePath of files) {
        const content = state.nodes[filePath];
        if (!content || content.type !== "file") {
          continue;
        }
        const lines = content.content === "" ? [] : content.content.split("\n");
        const label = toFindDisplayPath(targetArg, absolute, filePath);
        stdout.push(...filterLines(lines, parsed, label));
      }
      continue;
    }

    const lines = node.content === "" ? [] : node.content.split("\n");
    const showPath = targets.length > 1 || parsed.recursive;
    stdout.push(
      ...filterLines(lines, parsed, showPath ? targetArg : undefined),
    );
  }

  return { stdout, stderr };
}

function runPwd(state: SimulatedSearchState): CommandStreams {
  return { stdout: [state.cwd], stderr: [] };
}

function runLs(argv: string[], state: SimulatedSearchState): CommandStreams {
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
  state: SimulatedSearchState,
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

function runSimpleCommand(
  argv: string[],
  state: SimulatedSearchState,
  stdin: readonly string[],
): CommandStreams {
  const command = (argv[0] ?? "").toLowerCase();

  switch (command) {
    case "pwd":
      return runPwd(state);
    case "ls":
      return runLs(argv, state);
    case "cat":
      return runCat(argv, state, stdin);
    case "find":
      return runFind(argv, state);
    case "grep":
      return runGrep(argv, state, stdin);
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
      stages.push({ argv: current });
      current = [];
      continue;
    }

    if (
      token === ">" ||
      token === ">>" ||
      token === "<" ||
      token === "2>" ||
      token === "2>&1"
    ) {
      return {
        error: `redirection \`${token}\` is not needed in this lesson — use find, grep, and pipes`,
      };
    }

    current.push(token);
  }

  if (current.length === 0) {
    return { error: "syntax error near unexpected token `|`" };
  }

  stages.push({ argv: current });
  return stages;
}

/**
 * Resolve a typed command against the in-memory searching filesystem.
 * Never executes a real shell — responses stay in memory.
 */
export function simulateSearchingAndFindingCommand(
  rawInput: string,
  state: SimulatedSearchState,
): SimulateSearchResult {
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

  const next = cloneSearchState(state);
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

    const streams = runSimpleCommand(stage.argv, next, pipeStdin);

    if (isLast) {
      displayLines.push(...streams.stdout, ...streams.stderr);
    } else {
      displayLines.push(...streams.stderr);
      pipeStdin = streams.stdout;
    }
  }

  return {
    result: { kind: "output", lines: displayLines },
    state: next,
  };
}
