/**
 * Frontend-only bash-scripting simulation for Stage 02 Lesson 11.
 * Supports a teaching subset: files, shebang, variables, read, if/else, for/while.
 * Never executes a real shell, uses eval/Function, or touches the host filesystem.
 */

import type { SimulateResult } from "@/lib/simulate-terminal-command";

export const SIMULATED_SCRIPT_USER = "bunsal";
export const SIMULATED_SCRIPT_HOME = `/home/${SIMULATED_SCRIPT_USER}`;

/** Predefined teaching input for simulated `read` — never prompts the real OS. */
export const SIMULATED_READ_INPUT = "Alice";

/** Hard stop so a buggy while loop cannot spin forever in the browser. */
export const MAX_SCRIPT_ITERATIONS = 50;

const VAR_NAME = "[A-Za-z_][A-Za-z0-9_]*";

export type SimulatedScriptFileNode =
  | { type: "directory" }
  | { type: "file"; content: string; executable: boolean };

export type SimulatedBashScriptState = {
  cwd: string;
  nodes: Record<string, SimulatedScriptFileNode>;
  /** Interactive shell variables (outside a running script). */
  values: Record<string, string>;
  /** Simulated nano editing session — lines collected until :wq / save. */
  editing: { path: string; buffer: string[] } | null;
  lastExitStatus: number;
};

export type SimulateBashScriptResult = {
  result: SimulateResult;
  state: SimulatedBashScriptState;
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
  "  cd [path]            Change directory",
  "  cat FILE             Show a simulated file",
  "  nano FILE            Open the simulated script editor",
  "  :wq / save           Save and exit nano (while editing)",
  "  chmod +x FILE       Add simulated execute permission",
  "  bash FILE            Run a simulated script",
  "  ./FILE               Run if the file is marked executable",
  "  echo TEXT            Print text (supports $VAR)",
  '  NAME="value"         Set a shell variable',
  "  read NAME            Read simulated input into a variable",
  "  clear                Clear the terminal screen",
  "",
  "Script features in this lesson:",
  "  #!/bin/bash          Shebang (teaching marker)",
  "  variables / $NAME    Assignment and expansion",
  "  read                 Uses predefined input (Alice)",
  "  if / else / fi       Simple string tests",
  "  for / while          Simple loops (iteration limit applies)",
  "",
  "Create a file with nano, or with a heredoc:",
  "  cat > hello.sh <<'EOF'",
  "  #!/bin/bash",
  '  echo "Hello, Linux!"',
  "  EOF",
  "",
  "Examples:",
  "  nano hello.sh",
  "  chmod +x hello.sh",
  "  bash hello.sh",
  '  NAME="Bunsal"',
  '  echo "Hello, $NAME!"',
] as const;

const UNSUPPORTED_MESSAGE = [
  "Command not available in this learning terminal.",
  'Try "help" to see available commands.',
] as const;

export function createInitialBashScriptState(): SimulatedBashScriptState {
  return {
    cwd: SIMULATED_SCRIPT_HOME,
    nodes: {
      "/": { type: "directory" },
      "/home": { type: "directory" },
      [SIMULATED_SCRIPT_HOME]: { type: "directory" },
      [`${SIMULATED_SCRIPT_HOME}/Desktop`]: { type: "directory" },
      [`${SIMULATED_SCRIPT_HOME}/Documents`]: { type: "directory" },
      [`${SIMULATED_SCRIPT_HOME}/Downloads`]: { type: "directory" },
      [`${SIMULATED_SCRIPT_HOME}/notes.txt`]: {
        type: "file",
        content: "Welcome to Bash Scripting on Rean Linux.",
        executable: false,
      },
    },
    values: {
      HOME: SIMULATED_SCRIPT_HOME,
      USER: SIMULATED_SCRIPT_USER,
      PWD: SIMULATED_SCRIPT_HOME,
    },
    editing: null,
    lastExitStatus: 0,
  };
}

export function cloneBashScriptState(
  state: SimulatedBashScriptState,
): SimulatedBashScriptState {
  const nodes: Record<string, SimulatedScriptFileNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    if (node.type === "directory") {
      nodes[path] = { type: "directory" };
    } else {
      nodes[path] = {
        type: "file",
        content: node.content,
        executable: node.executable,
      };
    }
  }

  return {
    cwd: state.cwd,
    nodes,
    values: { ...state.values },
    editing: state.editing
      ? { path: state.editing.path, buffer: [...state.editing.buffer] }
      : null,
    lastExitStatus: state.lastExitStatus,
  };
}

export function formatBashScriptingPrompt(
  state?: Pick<SimulatedBashScriptState, "cwd" | "editing"> | null,
): string {
  if (state?.editing) {
    return `nano:${baseName(state.editing.path)}>`;
  }

  const path = state?.cwd ?? SIMULATED_SCRIPT_HOME;
  if (path === SIMULATED_SCRIPT_HOME) {
    return `${SIMULATED_SCRIPT_USER}@rean-linux:~$`;
  }
  if (path.startsWith(`${SIMULATED_SCRIPT_HOME}/`)) {
    return `${SIMULATED_SCRIPT_USER}@rean-linux:~${path.slice(SIMULATED_SCRIPT_HOME.length)}$`;
  }
  return `${SIMULATED_SCRIPT_USER}@rean-linux:${path}$`;
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
  state: SimulatedBashScriptState,
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

  return [...names]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name }));
}

function syncPwd(state: SimulatedBashScriptState): void {
  state.values.PWD = state.cwd;
}

function lookupVariable(
  values: Record<string, string>,
  name: string,
  lastExitStatus: number,
): string {
  if (name === "?") {
    return String(lastExitStatus);
  }
  return values[name] ?? "";
}

/**
 * Expand $VAR / ${VAR} in a teaching-safe way (no eval).
 */
function expandVariables(
  text: string,
  values: Record<string, string>,
  lastExitStatus: number,
): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    const ch = text[i] ?? "";

    if (ch !== "$") {
      result += ch;
      i += 1;
      continue;
    }

    const after = text.slice(i + 1);
    if (after.startsWith("{")) {
      const end = after.indexOf("}");
      if (end > 1) {
        const name = after.slice(1, end);
        if (new RegExp(`^${VAR_NAME}$`).test(name) || name === "?") {
          result += lookupVariable(values, name, lastExitStatus);
          i += 2 + end;
          continue;
        }
      }
      result += "$";
      i += 1;
      continue;
    }

    if (after.startsWith("?")) {
      result += lookupVariable(values, "?", lastExitStatus);
      i += 2;
      continue;
    }

    const match = after.match(new RegExp(`^(${VAR_NAME})`));
    if (match) {
      result += lookupVariable(values, match[1] ?? "", lastExitStatus);
      i += 1 + (match[1]?.length ?? 0);
      continue;
    }

    result += "$";
    i += 1;
  }

  return result;
}

function stripQuotes(raw: string): string {
  if (raw.length >= 2) {
    const first = raw[0];
    const last = raw[raw.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return raw.slice(1, -1);
    }
  }
  return raw;
}

function parseAssignment(
  input: string,
): { name: string; value: string } | null {
  const match = input.match(new RegExp(`^(${VAR_NAME})=(.*)$`));
  if (!match) {
    return null;
  }
  return {
    name: match[1] ?? "",
    value: stripQuotes(match[2] ?? ""),
  };
}

function parseArithmeticIncrement(
  input: string,
): { name: string; amount: number } | null {
  const match = input.match(
    new RegExp(`^(${VAR_NAME})=\\$\\(\\((\\1)\\s*\\+\\s*(\\d+)\\)\\)$`),
  );
  if (!match) {
    return null;
  }
  return {
    name: match[1] ?? "",
    amount: Number(match[3] ?? "1"),
  };
}

function tokenizeArgs(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i] ?? "")) {
      i += 1;
    }
    if (i >= input.length) {
      break;
    }

    const ch = input[i] ?? "";
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i += 1;
      let value = "";
      while (i < input.length && input[i] !== quote) {
        value += input[i];
        i += 1;
      }
      if (i < input.length) {
        i += 1;
      }
      tokens.push(value);
      continue;
    }

    let value = "";
    while (i < input.length && !/\s/.test(input[i] ?? "")) {
      value += input[i];
      i += 1;
    }
    tokens.push(value);
  }

  return tokens;
}

function writeFile(
  state: SimulatedBashScriptState,
  path: string,
  content: string,
  executable = false,
): CommandStreams {
  const parent = parentPath(path);
  if (!state.nodes[parent] || state.nodes[parent]?.type !== "directory") {
    return {
      stdout: [],
      stderr: [`bash: cannot create '${path}': No such file or directory`],
      status: 1,
    };
  }

  const existing = state.nodes[path];
  if (existing?.type === "directory") {
    return {
      stdout: [],
      stderr: [`bash: cannot overwrite directory '${path}'`],
      status: 1,
    };
  }

  state.nodes[path] = {
    type: "file",
    content,
    executable: existing?.type === "file" ? existing.executable : executable,
  };
  return { stdout: [], stderr: [], status: 0 };
}

function parseHeredocWrite(
  input: string,
): { path: string; content: string } | null {
  const match = input.match(
    /^cat\s+>\s*(\S+)\s+<<\s*'?EOF'?\r?\n([\s\S]*?)\r?\nEOF\s*$/,
  );
  if (!match) {
    return null;
  }
  return {
    path: match[1] ?? "",
    content: (match[2] ?? "").replace(/\r\n/g, "\n"),
  };
}

function runEcho(
  argv: string[],
  values: Record<string, string>,
  lastExitStatus: number,
): CommandStreams {
  const joined = argv.slice(1).join(" ");
  const text = expandVariables(joined, values, lastExitStatus);
  return { stdout: [text], stderr: [], status: 0 };
}

function runPwd(state: SimulatedBashScriptState): CommandStreams {
  return { stdout: [state.cwd], stderr: [], status: 0 };
}

function runLs(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  const pathArg = argv.slice(1).find((arg) => !arg.startsWith("-"));
  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = pathArg ? resolvePath(state.cwd, pathArg, home) : state.cwd;
  const node = state.nodes[target];

  if (!node) {
    return {
      stdout: [],
      stderr: [
        `ls: cannot access '${pathArg ?? target}': No such file or directory`,
      ],
      status: 2,
    };
  }

  if (node.type === "file") {
    return { stdout: [baseName(target)], stderr: [], status: 0 };
  }

  return {
    stdout: listChildren(state, target).map(({ name }) => name),
    stderr: [],
    status: 0,
  };
}

function runCd(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
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

function runCat(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  const pathArg = argv[1];
  if (!pathArg) {
    return { stdout: [], stderr: ["cat: missing file operand"], status: 1 };
  }

  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = resolvePath(state.cwd, pathArg, home);
  const node = state.nodes[target];

  if (!node || node.type !== "file") {
    return {
      stdout: [],
      stderr: [`cat: ${pathArg}: No such file or directory`],
      status: 1,
    };
  }

  const lines = node.content === "" ? [] : node.content.split("\n");
  return { stdout: lines, stderr: [], status: 0 };
}

function runNano(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  const pathArg = argv[1];
  if (!pathArg) {
    return {
      stdout: [],
      stderr: ["nano: missing file operand"],
      status: 1,
    };
  }

  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = resolvePath(state.cwd, pathArg, home);
  const parent = parentPath(target);

  if (!state.nodes[parent] || state.nodes[parent]?.type !== "directory") {
    return {
      stdout: [],
      stderr: [`nano: cannot open '${pathArg}': No such file or directory`],
      status: 1,
    };
  }

  const existing = state.nodes[target];
  if (existing?.type === "directory") {
    return {
      stdout: [],
      stderr: [`nano: ${pathArg}: Is a directory`],
      status: 1,
    };
  }

  const buffer =
    existing?.type === "file" && existing.content
      ? existing.content.split("\n")
      : [];

  state.editing = { path: target, buffer };
  return {
    stdout: [
      `Simulated nano: editing ${baseName(target)}.`,
      "Type each script line, then type :wq or save to finish.",
      "This is not a real editor — content stays in memory only.",
    ],
    stderr: [],
    status: 0,
  };
}

function runChmod(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  if (argv.length < 3) {
    return {
      stdout: [],
      stderr: ["Usage: chmod +x FILE"],
      status: 1,
    };
  }

  const mode = argv[1] ?? "";
  const pathArg = argv[2] ?? "";
  if (mode !== "+x" && mode !== "a+x" && mode !== "u+x") {
    return {
      stdout: [],
      stderr: [
        `chmod: mode '${mode}' is not supported in this lesson (use +x)`,
      ],
      status: 1,
    };
  }

  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = resolvePath(state.cwd, pathArg, home);
  const node = state.nodes[target];

  if (!node || node.type !== "file") {
    return {
      stdout: [],
      stderr: [`chmod: cannot access '${pathArg}': No such file or directory`],
      status: 1,
    };
  }

  node.executable = true;
  return { stdout: [], stderr: [], status: 0 };
}

type TestResult = { ok: boolean } | { error: string };

function evaluateTest(
  expression: string,
  values: Record<string, string>,
  lastExitStatus: number,
): TestResult {
  const trimmed = expression.trim();
  const inner = trimmed
    .replace(/^\[\s*/, "")
    .replace(/\s*\]$/, "")
    .trim();

  const eqMatch = inner.match(
    new RegExp(`^"\\$(${VAR_NAME})"\\s*=\\s*"([^"]*)"$`),
  );
  if (eqMatch) {
    const left = lookupVariable(values, eqMatch[1] ?? "", lastExitStatus);
    const right = eqMatch[2] ?? "";
    return { ok: left === right };
  }

  const leMatch = inner.match(
    new RegExp(`^"\\$(${VAR_NAME})"\\s+-le\\s+(\\d+)$`),
  );
  if (leMatch) {
    const leftRaw = lookupVariable(values, leMatch[1] ?? "", lastExitStatus);
    const left = Number(leftRaw);
    const right = Number(leMatch[2] ?? "0");
    if (!Number.isFinite(left)) {
      return { error: `integer expression expected: ${leftRaw}` };
    }
    return { ok: left <= right };
  }

  return {
    error: `unsupported test expression: ${inner}`,
  };
}

type ScriptLineKind =
  | { kind: "blank" }
  | { kind: "comment" }
  | { kind: "shebang" }
  | { kind: "assignment"; name: string; value: string }
  | { kind: "arith"; name: string; amount: number }
  | { kind: "echo"; argv: string[] }
  | { kind: "pwd" }
  | { kind: "read"; name: string }
  | { kind: "if"; expression: string }
  | { kind: "else" }
  | { kind: "fi" }
  | { kind: "for"; name: string; items: string[] }
  | { kind: "while"; expression: string }
  | { kind: "do" }
  | { kind: "done" }
  | { kind: "unsupported"; text: string };

function classifyScriptLine(rawLine: string): ScriptLineKind {
  const line = rawLine.trim();
  if (!line) {
    return { kind: "blank" };
  }
  if (line.startsWith("#!")) {
    return { kind: "shebang" };
  }
  if (line.startsWith("#")) {
    return { kind: "comment" };
  }
  if (line === "else") {
    return { kind: "else" };
  }
  if (line === "fi") {
    return { kind: "fi" };
  }
  if (line === "do") {
    return { kind: "do" };
  }
  if (line === "done") {
    return { kind: "done" };
  }
  if (line === "pwd") {
    return { kind: "pwd" };
  }

  const arith = parseArithmeticIncrement(line);
  if (arith) {
    return { kind: "arith", name: arith.name, amount: arith.amount };
  }

  const assignment = parseAssignment(line);
  if (assignment) {
    return {
      kind: "assignment",
      name: assignment.name,
      value: assignment.value,
    };
  }

  const ifMatch = line.match(/^if\s+(\[.+\])\s*;\s*then$/);
  if (ifMatch) {
    return { kind: "if", expression: ifMatch[1] ?? "" };
  }

  const whileMatch = line.match(/^while\s+(\[.+\])$/);
  if (whileMatch) {
    return { kind: "while", expression: whileMatch[1] ?? "" };
  }

  const forMatch = line.match(
    new RegExp(`^for\\s+(${VAR_NAME})\\s+in\\s+(.+)$`),
  );
  if (forMatch) {
    const items = (forMatch[2] ?? "").trim().split(/\s+/).filter(Boolean);
    return { kind: "for", name: forMatch[1] ?? "", items };
  }

  const readMatch = line.match(new RegExp(`^read\\s+(${VAR_NAME})$`));
  if (readMatch) {
    return { kind: "read", name: readMatch[1] ?? "" };
  }

  if (
    line === "echo" ||
    line.startsWith("echo ") ||
    line.startsWith("echo\t")
  ) {
    return { kind: "echo", argv: tokenizeArgs(line) };
  }

  return { kind: "unsupported", text: line };
}

type BlockBody =
  | { type: "if"; expression: string; thenBody: string[]; elseBody: string[] }
  | { type: "for"; name: string; items: string[]; body: string[] }
  | { type: "while"; expression: string; body: string[] };

function extractIfBlock(
  lines: string[],
  startIndex: number,
):
  | { block: Extract<BlockBody, { type: "if" }>; nextIndex: number }
  | { error: string } {
  const classified = classifyScriptLine(lines[startIndex] ?? "");
  if (classified.kind !== "if") {
    return { error: "internal error: expected if" };
  }

  const thenBody: string[] = [];
  const elseBody: string[] = [];
  let inElse = false;
  let i = startIndex + 1;
  let depth = 1;

  while (i < lines.length) {
    const kind = classifyScriptLine(lines[i] ?? "");
    if (kind.kind === "if") {
      depth += 1;
    }
    if (kind.kind === "fi") {
      depth -= 1;
      if (depth === 0) {
        return {
          block: {
            type: "if",
            expression: classified.expression,
            thenBody,
            elseBody,
          },
          nextIndex: i + 1,
        };
      }
    }
    if (kind.kind === "else" && depth === 1) {
      inElse = true;
      i += 1;
      continue;
    }
    (inElse ? elseBody : thenBody).push(lines[i] ?? "");
    i += 1;
  }

  return { error: "syntax error: missing fi" };
}

function extractLoopBlock(
  lines: string[],
  startIndex: number,
  open: "for" | "while",
):
  | {
      block: Extract<BlockBody, { type: "for" | "while" }>;
      nextIndex: number;
    }
  | { error: string } {
  const header = classifyScriptLine(lines[startIndex] ?? "");
  if (header.kind !== open) {
    return { error: `internal error: expected ${open}` };
  }

  let i = startIndex + 1;
  if (classifyScriptLine(lines[i] ?? "").kind !== "do") {
    return { error: `syntax error: expected do after ${open}` };
  }
  i += 1;

  const body: string[] = [];
  let depth = 1;

  while (i < lines.length) {
    const kind = classifyScriptLine(lines[i] ?? "");
    if (kind.kind === "for" || kind.kind === "while") {
      depth += 1;
    }
    if (kind.kind === "done") {
      depth -= 1;
      if (depth === 0) {
        if (header.kind === "for") {
          return {
            block: {
              type: "for",
              name: header.name,
              items: header.items,
              body,
            },
            nextIndex: i + 1,
          };
        }
        if (header.kind === "while") {
          return {
            block: {
              type: "while",
              expression: header.expression,
              body,
            },
            nextIndex: i + 1,
          };
        }
      }
    }
    body.push(lines[i] ?? "");
    i += 1;
  }

  return { error: "syntax error: missing done" };
}

function runScriptLines(
  lines: string[],
  values: Record<string, string>,
  cwd: string,
  readQueue: string[],
  counters: { iterations: number },
): CommandStreams {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let status = 0;
  let index = 0;

  while (index < lines.length) {
    if (counters.iterations >= MAX_SCRIPT_ITERATIONS) {
      return {
        stdout,
        stderr: [
          ...stderr,
          `bash: stopped after ${MAX_SCRIPT_ITERATIONS} loop iterations (safety limit)`,
        ],
        status: 1,
      };
    }

    const raw = lines[index] ?? "";
    const kind = classifyScriptLine(raw);

    if (
      kind.kind === "blank" ||
      kind.kind === "comment" ||
      kind.kind === "shebang"
    ) {
      index += 1;
      continue;
    }

    if (kind.kind === "unsupported") {
      return {
        stdout,
        stderr: [
          ...stderr,
          `bash: unsupported syntax in this lesson: ${kind.text}`,
        ],
        status: 2,
      };
    }

    if (
      kind.kind === "else" ||
      kind.kind === "fi" ||
      kind.kind === "do" ||
      kind.kind === "done"
    ) {
      return {
        stdout,
        stderr: [
          ...stderr,
          `bash: syntax error near unexpected token \`${kind.kind}\``,
        ],
        status: 2,
      };
    }

    if (kind.kind === "if") {
      const extracted = extractIfBlock(lines, index);
      if ("error" in extracted) {
        return {
          stdout,
          stderr: [...stderr, `bash: ${extracted.error}`],
          status: 2,
        };
      }
      const test = evaluateTest(extracted.block.expression, values, status);
      if ("error" in test) {
        return {
          stdout,
          stderr: [...stderr, `bash: ${test.error}`],
          status: 2,
        };
      }
      const branch = test.ok
        ? extracted.block.thenBody
        : extracted.block.elseBody;
      const nested = runScriptLines(branch, values, cwd, readQueue, counters);
      stdout.push(...nested.stdout);
      stderr.push(...nested.stderr);
      status = nested.status;
      if (nested.status !== 0 && nested.stderr.length > 0) {
        return { stdout, stderr, status };
      }
      index = extracted.nextIndex;
      continue;
    }

    if (kind.kind === "for") {
      const extracted = extractLoopBlock(lines, index, "for");
      if ("error" in extracted) {
        return {
          stdout,
          stderr: [...stderr, `bash: ${extracted.error}`],
          status: 2,
        };
      }
      if (extracted.block.type !== "for") {
        return {
          stdout,
          stderr: [...stderr, "bash: internal error: expected for block"],
          status: 2,
        };
      }
      for (const item of extracted.block.items) {
        counters.iterations += 1;
        if (counters.iterations >= MAX_SCRIPT_ITERATIONS) {
          return {
            stdout,
            stderr: [
              ...stderr,
              `bash: stopped after ${MAX_SCRIPT_ITERATIONS} loop iterations (safety limit)`,
            ],
            status: 1,
          };
        }
        values[extracted.block.name] = item;
        const nested = runScriptLines(
          extracted.block.body,
          values,
          cwd,
          readQueue,
          counters,
        );
        stdout.push(...nested.stdout);
        stderr.push(...nested.stderr);
        status = nested.status;
        if (nested.status !== 0 && nested.stderr.length > 0) {
          return { stdout, stderr, status };
        }
      }
      index = extracted.nextIndex;
      continue;
    }

    if (kind.kind === "while") {
      const extracted = extractLoopBlock(lines, index, "while");
      if ("error" in extracted) {
        return {
          stdout,
          stderr: [...stderr, `bash: ${extracted.error}`],
          status: 2,
        };
      }
      if (extracted.block.type !== "while") {
        return {
          stdout,
          stderr: [...stderr, "bash: internal error: expected while block"],
          status: 2,
        };
      }

      while (true) {
        counters.iterations += 1;
        if (counters.iterations >= MAX_SCRIPT_ITERATIONS) {
          return {
            stdout,
            stderr: [
              ...stderr,
              `bash: stopped after ${MAX_SCRIPT_ITERATIONS} loop iterations (safety limit)`,
            ],
            status: 1,
          };
        }

        const test = evaluateTest(extracted.block.expression, values, status);
        if ("error" in test) {
          return {
            stdout,
            stderr: [...stderr, `bash: ${test.error}`],
            status: 2,
          };
        }
        if (!test.ok) {
          break;
        }

        const nested = runScriptLines(
          extracted.block.body,
          values,
          cwd,
          readQueue,
          counters,
        );
        stdout.push(...nested.stdout);
        stderr.push(...nested.stderr);
        status = nested.status;
        if (nested.status !== 0 && nested.stderr.length > 0) {
          return { stdout, stderr, status };
        }
      }

      index = extracted.nextIndex;
      continue;
    }

    if (kind.kind === "assignment") {
      values[kind.name] = expandVariables(kind.value, values, status);
      status = 0;
      index += 1;
      continue;
    }

    if (kind.kind === "arith") {
      const current = Number(values[kind.name] ?? "0");
      if (!Number.isFinite(current)) {
        return {
          stdout,
          stderr: [
            ...stderr,
            `bash: ${kind.name}: integer expression expected`,
          ],
          status: 1,
        };
      }
      values[kind.name] = String(current + kind.amount);
      status = 0;
      index += 1;
      continue;
    }

    if (kind.kind === "echo") {
      const expandedArgv = kind.argv.map((arg, argIndex) =>
        argIndex === 0 ? arg : expandVariables(arg, values, status),
      );
      const result = runEcho(expandedArgv, values, status);
      stdout.push(...result.stdout);
      status = 0;
      index += 1;
      continue;
    }

    if (kind.kind === "pwd") {
      stdout.push(cwd);
      status = 0;
      index += 1;
      continue;
    }

    if (kind.kind === "read") {
      const value = readQueue.shift() ?? SIMULATED_READ_INPUT;
      values[kind.name] = value;
      status = 0;
      index += 1;
      continue;
    }

    index += 1;
  }

  return { stdout, stderr, status };
}

/**
 * Interpret a simulated script body with an isolated variable scope.
 */
export function runSimulatedScript(
  content: string,
  cwd: string,
  readInputs: string[] = [SIMULATED_READ_INPUT],
): CommandStreams {
  const values: Record<string, string> = {};
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  return runScriptLines(lines, values, cwd, [...readInputs], { iterations: 0 });
}

function runBashFile(
  argv: string[],
  state: SimulatedBashScriptState,
): CommandStreams {
  const pathArg = argv[1];
  if (!pathArg) {
    return {
      stdout: [],
      stderr: ["bash: missing script file"],
      status: 1,
    };
  }

  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = resolvePath(state.cwd, pathArg, home);
  const node = state.nodes[target];

  if (!node || node.type !== "file") {
    return {
      stdout: [],
      stderr: [`bash: ${pathArg}: No such file or directory`],
      status: 127,
    };
  }

  return runSimulatedScript(node.content, state.cwd);
}

function runExecutableScript(
  pathArg: string,
  state: SimulatedBashScriptState,
): CommandStreams {
  const home = state.values.HOME ?? SIMULATED_SCRIPT_HOME;
  const target = resolvePath(state.cwd, pathArg, home);
  const node = state.nodes[target];

  if (!node || node.type !== "file") {
    return {
      stdout: [],
      stderr: [`bash: ${pathArg}: No such file or directory`],
      status: 127,
    };
  }

  if (!node.executable) {
    return {
      stdout: [],
      stderr: [
        `bash: ${pathArg}: Permission denied`,
        "Hint: run chmod +x on the script first, or use bash FILE.",
      ],
      status: 126,
    };
  }

  return runSimulatedScript(node.content, state.cwd);
}

function handleEditingInput(
  rawInput: string,
  state: SimulatedBashScriptState,
): SimulateBashScriptResult {
  const next = cloneBashScriptState(state);
  const editing = next.editing;
  if (!editing) {
    return {
      result: { kind: "output", lines: ["bash: not currently editing a file"] },
      state: next,
    };
  }

  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();

  if (lower === ":wq" || lower === "save" || lower === "wq") {
    const content = editing.buffer.join("\n");
    const written = writeFile(next, editing.path, content);
    next.editing = null;
    next.lastExitStatus = written.status;
    if (written.status !== 0) {
      return {
        result: { kind: "output", lines: written.stderr },
        state: next,
      };
    }
    return {
      result: {
        kind: "output",
        lines: [`Saved ${baseName(editing.path)} (simulated).`],
      },
      state: next,
    };
  }

  if (lower === ":q!" || lower === "abort" || lower === "cancel") {
    next.editing = null;
    next.lastExitStatus = 0;
    return {
      result: {
        kind: "output",
        lines: ["Discarded simulated nano session (file unchanged)."],
      },
      state: next,
    };
  }

  editing.buffer.push(rawInput);
  next.lastExitStatus = 0;
  return {
    result: { kind: "output", lines: [] },
    state: next,
  };
}

function executeSimpleCommand(
  text: string,
  state: SimulatedBashScriptState,
): CommandStreams {
  const assignment = parseAssignment(text);
  if (assignment) {
    state.values[assignment.name] = expandVariables(
      assignment.value,
      state.values,
      state.lastExitStatus,
    );
    return { stdout: [], stderr: [], status: 0 };
  }

  const arith = parseArithmeticIncrement(text);
  if (arith) {
    const current = Number(state.values[arith.name] ?? "0");
    if (!Number.isFinite(current)) {
      return {
        stdout: [],
        stderr: [`bash: ${arith.name}: integer expression expected`],
        status: 1,
      };
    }
    state.values[arith.name] = String(current + arith.amount);
    return { stdout: [], stderr: [], status: 0 };
  }

  if (text.startsWith("./")) {
    return runExecutableScript(text, state);
  }

  const argv = tokenizeArgs(text);
  if (argv.length === 0) {
    return { stdout: [], stderr: [], status: 0 };
  }

  const command = (argv[0] ?? "").toLowerCase();

  switch (command) {
    case "echo":
      return runEcho(argv, state.values, state.lastExitStatus);
    case "pwd":
      return runPwd(state);
    case "ls":
      return runLs(argv, state);
    case "cd":
      return runCd(argv, state);
    case "cat":
      return runCat(argv, state);
    case "nano":
      return runNano(argv, state);
    case "chmod":
      return runChmod(argv, state);
    case "bash":
      return runBashFile(argv, state);
    case "read": {
      const name = argv[1];
      if (!name || !new RegExp(`^${VAR_NAME}$`).test(name)) {
        return {
          stdout: [],
          stderr: ["read: usage: read NAME"],
          status: 1,
        };
      }
      state.values[name] = SIMULATED_READ_INPUT;
      return {
        stdout: [`(simulated input: ${SIMULATED_READ_INPUT})`],
        stderr: [],
        status: 0,
      };
    }
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

/**
 * Resolve a typed command against simulated bash-scripting state.
 * Never executes a real shell — responses and mutations stay in memory.
 */
export function simulateBashScriptingCommand(
  rawInput: string,
  state: SimulatedBashScriptState,
): SimulateBashScriptResult {
  if (state.editing) {
    return handleEditingInput(rawInput, state);
  }

  const input = rawInput.replace(/\r\n/g, "\n").trimEnd();
  const trimmed = input.trim();

  if (!trimmed) {
    return { result: { kind: "empty" }, state };
  }

  const lower = trimmed.toLowerCase();

  if (lower === "clear") {
    return { result: { kind: "clear" }, state };
  }

  if (lower === "help" || lower === "--help" || lower === "-h") {
    return {
      result: { kind: "output", lines: HELP_OUTPUT },
      state: { ...state, lastExitStatus: 0 },
    };
  }

  const next = cloneBashScriptState(state);

  const heredoc = parseHeredocWrite(trimmed);
  if (heredoc) {
    const home = next.values.HOME ?? SIMULATED_SCRIPT_HOME;
    const target = resolvePath(next.cwd, heredoc.path, home);
    const written = writeFile(next, target, heredoc.content);
    next.lastExitStatus = written.status;
    return {
      result: {
        kind: "output",
        lines:
          written.status === 0
            ? [`Wrote ${baseName(target)} (simulated).`]
            : written.stderr,
      },
      state: next,
    };
  }

  // Allow a few sequential shell commands with `;` for practice demos.
  const segments = trimmed.split(/\s*;\s*/).filter(Boolean);
  const displayLines: string[] = [];
  let status = next.lastExitStatus;

  for (const segment of segments) {
    const streams = executeSimpleCommand(segment, next);
    displayLines.push(...streams.stdout, ...streams.stderr);
    status = streams.status;
    next.lastExitStatus = status;
    if (status !== 0 && streams.stderr.length > 0) {
      break;
    }
  }

  return {
    result: { kind: "output", lines: displayLines },
    state: next,
  };
}
