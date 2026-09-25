/**
 * Frontend-only pipes and redirection simulation for Stage 02 Lesson 07.
 * Never executes a real shell, touches the host filesystem, or calls backend APIs.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_PIPES_USER = "bunsal";
export const SIMULATED_PIPES_HOME = `/home/${SIMULATED_PIPES_USER}`;

export type SimulatedPipesNode =
  { type: "file"; content: string } | { type: "directory" };

export type SimulatedPipesState = {
  nodes: Record<string, SimulatedPipesNode>;
  cwd: string;
};

export type SimulatePipesResult = {
  result: SimulateResult;
  state: SimulatedPipesState;
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

const HELP_OUTPUT = [
  "Available commands:",
  "",
  "  help                 Show this help message",
  "  pwd                  Print the current directory",
  "  ls [path]            List files and directories",
  "  echo [text]          Print text",
  "  cat [file]           Display file contents or stdin",
  "  grep PATTERN         Filter lines containing PATTERN (from stdin)",
  "  clear                Clear the terminal screen",
  "",
  "Redirection and pipes:",
  "  > file               Overwrite file with stdout",
  "  >> file              Append stdout to file",
  "  < file               Use file as stdin",
  "  command1 | command2  Pipe stdout to the next command",
  "  2> file              Redirect stderr to file",
  "  2>&1                 Send stderr to the same place as stdout",
  "",
  "Examples:",
  '  echo "hello" > notes.txt',
  '  echo "more" >> notes.txt',
  "  cat notes.txt",
  "  ls | grep txt",
  "  cat /etc/passwd | grep bunsal",
  "  ls nonexistent 2> errors.txt",
  "  ls nonexistent > output.txt 2>&1",
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

export function createInitialPipesState(): SimulatedPipesState {
  return {
    cwd: SIMULATED_PIPES_HOME,
    nodes: {
      "/": { type: "directory" },
      "/home": { type: "directory" },
      [SIMULATED_PIPES_HOME]: { type: "directory" },
      [`${SIMULATED_PIPES_HOME}/Desktop`]: { type: "directory" },
      [`${SIMULATED_PIPES_HOME}/Documents`]: { type: "directory" },
      [`${SIMULATED_PIPES_HOME}/Downloads`]: { type: "directory" },
      [`${SIMULATED_PIPES_HOME}/readme.txt`]: {
        type: "file",
        content: "Welcome to the pipes and redirection lesson.",
      },
      "/etc": { type: "directory" },
      "/etc/passwd": { type: "file", content: PASSWD_CONTENT },
      "/etc/group": { type: "file", content: GROUP_CONTENT },
    },
  };
}

export function clonePipesState(
  state: SimulatedPipesState,
): SimulatedPipesState {
  const nodes: Record<string, SimulatedPipesNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    nodes[path] =
      node.type === "file"
        ? { type: "file", content: node.content }
        : { type: "directory" };
  }
  return { nodes, cwd: state.cwd };
}

export function formatPipesAndRedirectionPrompt(cwd?: string): string {
  const path = cwd ?? SIMULATED_PIPES_HOME;
  if (path === SIMULATED_PIPES_HOME) {
    return `${SIMULATED_PIPES_USER}@rean-linux:~$`;
  }
  if (path.startsWith(`${SIMULATED_PIPES_HOME}/`)) {
    return `${SIMULATED_PIPES_USER}@rean-linux:~${path.slice(SIMULATED_PIPES_HOME.length)}$`;
  }
  return `${SIMULATED_PIPES_USER}@rean-linux:${path}$`;
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
    return SIMULATED_PIPES_HOME;
  }
  if (path.startsWith("~/")) {
    return `${SIMULATED_PIPES_HOME}${path.slice(1)}`;
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
  state: SimulatedPipesState,
  dirPath: string,
): { name: string; node: SimulatedPipesNode }[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const children: { name: string; node: SimulatedPipesNode }[] = [];

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
  state: SimulatedPipesState,
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
  state: SimulatedPipesState,
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

/**
 * Tokenize a command line for this lesson's limited shell syntax.
 * Treats `2>&1`, `2>`, `>>`, `>`, `<`, and `|` as operators.
 */
export function tokenizePipesInput(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i] ?? "")) {
      i += 1;
    }
    if (i >= input.length) {
      break;
    }

    if (input.startsWith("2>&1", i)) {
      tokens.push("2>&1");
      i += 4;
      continue;
    }

    if (input.startsWith("2>", i)) {
      tokens.push("2>");
      i += 2;
      continue;
    }

    if (input.startsWith(">>", i)) {
      tokens.push(">>");
      i += 2;
      continue;
    }

    const ch = input[i];
    if (ch === ">" || ch === "<" || ch === "|") {
      tokens.push(ch);
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      let value = "";
      while (i < input.length && input[i] !== quote) {
        value += input[i];
        i += 1;
      }
      if (i < input.length && input[i] === quote) {
        i += 1;
      }
      tokens.push(value);
      continue;
    }

    let word = "";
    while (i < input.length) {
      const current = input[i] ?? "";
      if (/\s/.test(current)) {
        break;
      }
      if (
        current === "|" ||
        current === "<" ||
        current === ">" ||
        input.startsWith("2>", i) ||
        input.startsWith("2>&1", i)
      ) {
        break;
      }
      word += current;
      i += 1;
    }
    if (word) {
      tokens.push(word);
    }
  }

  return tokens;
}

function emptyRedirs(): StageRedirection {
  return { stderrToStdout: false };
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

function runEcho(argv: string[]): CommandStreams {
  const text = argv.slice(1).join(" ");
  return { stdout: text === "" ? [""] : [text], stderr: [] };
}

function runPwd(state: SimulatedPipesState): CommandStreams {
  return { stdout: [state.cwd], stderr: [] };
}

function runLs(argv: string[], state: SimulatedPipesState): CommandStreams {
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
  state: SimulatedPipesState,
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

function runGrep(argv: string[], stdin: readonly string[]): CommandStreams {
  const pattern = argv[1];
  if (!pattern) {
    return {
      stdout: [],
      stderr: ["Usage: grep PATTERN"],
    };
  }

  return {
    stdout: stdin.filter((line) => line.includes(pattern)),
    stderr: [],
  };
}

function runSimpleCommand(
  argv: string[],
  state: SimulatedPipesState,
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
      return runGrep(argv, stdin);
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
  state: SimulatedPipesState,
): { remainingStdout: string[]; remainingStderr: string[] } {
  let stdout = [...streams.stdout];
  let stderr = [...streams.stderr];

  // Lesson model: `> file 2>&1` sends both streams to the file.
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
 * Resolve a typed command against the in-memory pipes/redirection filesystem.
 * Never executes a real shell — responses and mutations stay in memory.
 */
export function simulatePipesAndRedirectionCommand(
  rawInput: string,
  state: SimulatedPipesState,
): SimulatePipesResult {
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

  const next = clonePipesState(state);
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
      // Intermediate stderr still surfaces; stdout feeds the next stage.
      displayLines.push(...applied.remainingStderr);
      pipeStdin = applied.remainingStdout;
    }
  }

  return {
    result: { kind: "output", lines: displayLines },
    state: next,
  };
}
