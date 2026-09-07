/**
 * In-memory educational filesystem for the learning terminal.
 * Never touches the real OS filesystem — all state lives in React/JS memory.
 */

export const SIMULATED_HOME = "/home/learner";

export type SimulatedNode =
  { type: "file"; content: string } | { type: "directory" };

export type SimulatedFsState = {
  nodes: Record<string, SimulatedNode>;
  cwd: string;
};

export type SimulateResult =
  | { kind: "output"; lines: readonly string[] }
  | { kind: "clear" }
  | { kind: "empty" };

export type FsCommandResult = {
  result: SimulateResult;
  state: SimulatedFsState;
};

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
  "  cd       Change directory",
  "  mkdir    Create a directory",
  "  touch    Create an empty file",
  "  cat      Display file contents",
  "  cp       Copy a file",
  "  mv       Move or rename a file",
  "  rm       Remove a file",
  "  clear    Clear the terminal screen",
] as const;

const DANGEROUS_RM_MESSAGE = [
  "That remove pattern is not available in this learning terminal.",
  "Use a simple file path, for example: rm notes.txt",
] as const;

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
    return SIMULATED_HOME;
  }
  if (path.startsWith("~/")) {
    return `${SIMULATED_HOME}${path.slice(1)}`;
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
  state: SimulatedFsState,
  dirPath: string,
): { name: string; node: SimulatedNode }[] {
  const prefix = dirPath === "/" ? "/" : `${dirPath}/`;
  const children: { name: string; node: SimulatedNode }[] = [];

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

function cloneState(state: SimulatedFsState): SimulatedFsState {
  const nodes: Record<string, SimulatedNode> = {};
  for (const [path, node] of Object.entries(state.nodes)) {
    nodes[path] =
      node.type === "file"
        ? { type: "file", content: node.content }
        : { type: "directory" };
  }
  return { nodes, cwd: state.cwd };
}

function parseTokens(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

function formatLsLong(name: string, node: SimulatedNode): string {
  if (node.type === "directory") {
    return `drwxr-xr-x 2 learner learner 4096 Jan 1 12:00 ${name}`;
  }
  const size = String(node.content.length).padStart(4, " ");
  return `-rw-r--r-- 1 learner learner ${size} Jan 1 12:00 ${name}`;
}

function isDangerousRm(tokens: string[]): boolean {
  const options = tokens.slice(1).filter((token) => token.startsWith("-"));
  const joined = options.join("");
  if (joined.includes("r") || joined.includes("R") || joined.includes("f")) {
    return true;
  }

  const targets = tokens.slice(1).filter((token) => !token.startsWith("-"));
  return targets.some(
    (target) =>
      target === "/" ||
      target === "*" ||
      target.includes("*") ||
      target === "-rf" ||
      target === "-fr",
  );
}

export function createLearnerHomeFs(options?: {
  includeNotes?: boolean;
  includeProjects?: boolean;
  includeSystemDirs?: boolean;
}): SimulatedFsState {
  const includeNotes = options?.includeNotes ?? true;
  const includeProjects = options?.includeProjects ?? false;
  const includeSystemDirs = options?.includeSystemDirs ?? true;
  const nodes: Record<string, SimulatedNode> = {
    "/": { type: "directory" },
    "/home": { type: "directory" },
    [SIMULATED_HOME]: { type: "directory" },
    [`${SIMULATED_HOME}/Desktop`]: { type: "directory" },
    [`${SIMULATED_HOME}/Documents`]: { type: "directory" },
    [`${SIMULATED_HOME}/Downloads`]: { type: "directory" },
  };

  if (includeSystemDirs) {
    nodes["/etc"] = { type: "directory" };
    nodes["/var"] = { type: "directory" };
    nodes["/var/log"] = { type: "directory" };
    nodes["/tmp"] = { type: "directory" };
    nodes["/usr"] = { type: "directory" };
    nodes["/bin"] = { type: "directory" };
    nodes["/sbin"] = { type: "directory" };
  }

  if (includeProjects) {
    nodes[`${SIMULATED_HOME}/Documents/projects`] = { type: "directory" };
  }

  if (includeNotes) {
    nodes[`${SIMULATED_HOME}/notes.txt`] = {
      type: "file",
      content: "Hello from Rean Linux.",
    };
  }

  return { nodes, cwd: SIMULATED_HOME };
}

/** Full beginner filesystem used by the filesystem lesson. */
export function createFilesystemLessonFs(): SimulatedFsState {
  return createLearnerHomeFs({
    includeNotes: true,
    includeProjects: true,
    includeSystemDirs: true,
  });
}

export function listDirectoryChildren(
  state: SimulatedFsState,
  dirPath: string,
): { name: string; path: string; node: SimulatedNode }[] {
  return listChildren(state, dirPath).map(({ name, node }) => ({
    name,
    path: dirPath === "/" ? `/${name}` : `${dirPath}/${name}`,
    node,
  }));
}

export function formatPromptPath(cwd: string): string {
  if (cwd === SIMULATED_HOME) {
    return "~";
  }
  if (cwd.startsWith(`${SIMULATED_HOME}/`)) {
    return `~${cwd.slice(SIMULATED_HOME.length)}`;
  }
  return cwd;
}

export function formatTerminalPrompt(cwd: string): string {
  return `learner@rean-linux:${formatPromptPath(cwd)}$`;
}

export function hasExerciseProjectFile(state: SimulatedFsState): boolean {
  const path = `${SIMULATED_HOME}/projects/hello.txt`;
  const node = state.nodes[path];
  return node?.type === "file";
}

/**
 * Resolve a typed command against the simulated filesystem.
 * Never executes a real shell — responses and mutations stay in memory.
 */
export function simulateFsCommand(
  rawInput: string,
  state: SimulatedFsState,
): FsCommandResult {
  const input = rawInput.trim();

  if (!input) {
    return { result: { kind: "empty" }, state };
  }

  const tokens = parseTokens(input);
  const command = (tokens[0] ?? "").toLowerCase();
  const next = cloneState(state);

  switch (command) {
    case "help":
      return { result: { kind: "output", lines: HELP_OUTPUT }, state: next };

    case "clear":
      return { result: { kind: "clear" }, state: next };

    case "pwd":
      return {
        result: { kind: "output", lines: [next.cwd] },
        state: next,
      };

    case "ls": {
      const args = tokens.slice(1);
      const long = args.some(
        (arg) =>
          arg.startsWith("-") && (arg.includes("l") || arg.includes("a")),
      );
      const pathArg = args.find((arg) => !arg.startsWith("-"));
      const target = pathArg ? resolvePath(next.cwd, pathArg) : next.cwd;
      const node = next.nodes[target];

      if (!node) {
        return {
          result: {
            kind: "output",
            lines: [
              `ls: cannot access '${pathArg}': No such file or directory`,
            ],
          },
          state: next,
        };
      }

      if (node.type === "file") {
        return {
          result: {
            kind: "output",
            lines: [
              long ? formatLsLong(baseName(target), node) : baseName(target),
            ],
          },
          state: next,
        };
      }

      const children = listChildren(next, target);
      if (children.length === 0) {
        return { result: { kind: "output", lines: [] }, state: next };
      }

      if (long) {
        return {
          result: {
            kind: "output",
            lines: children.map(({ name, node: child }) =>
              formatLsLong(name, child),
            ),
          },
          state: next,
        };
      }

      return {
        result: {
          kind: "output",
          lines: children.map(({ name }) => name),
        },
        state: next,
      };
    }

    case "cd": {
      const targetArg = tokens[1] ?? "~";
      const target = resolvePath(next.cwd, targetArg);
      const node = next.nodes[target];

      if (!node) {
        return {
          result: {
            kind: "output",
            lines: [`cd: ${targetArg}: No such file or directory`],
          },
          state: next,
        };
      }

      if (node.type !== "directory") {
        return {
          result: {
            kind: "output",
            lines: [`cd: ${targetArg}: Not a directory`],
          },
          state: next,
        };
      }

      next.cwd = target;
      return { result: { kind: "output", lines: [] }, state: next };
    }

    case "mkdir": {
      const name = tokens[1];
      if (!name) {
        return {
          result: {
            kind: "output",
            lines: ["mkdir: missing operand"],
          },
          state: next,
        };
      }

      const target = resolvePath(next.cwd, name);
      const parent = parentPath(target);

      if (!next.nodes[parent] || next.nodes[parent]?.type !== "directory") {
        return {
          result: {
            kind: "output",
            lines: [
              `mkdir: cannot create directory '${name}': No such file or directory`,
            ],
          },
          state: next,
        };
      }

      if (next.nodes[target]) {
        return {
          result: {
            kind: "output",
            lines: [`mkdir: cannot create directory '${name}': File exists`],
          },
          state: next,
        };
      }

      next.nodes[target] = { type: "directory" };
      return { result: { kind: "output", lines: [] }, state: next };
    }

    case "touch": {
      const name = tokens[1];
      if (!name) {
        return {
          result: {
            kind: "output",
            lines: ["touch: missing file operand"],
          },
          state: next,
        };
      }

      const target = resolvePath(next.cwd, name);
      const parent = parentPath(target);

      if (!next.nodes[parent] || next.nodes[parent]?.type !== "directory") {
        return {
          result: {
            kind: "output",
            lines: [`touch: cannot touch '${name}': No such file or directory`],
          },
          state: next,
        };
      }

      const existing = next.nodes[target];
      if (existing?.type === "directory") {
        return {
          result: {
            kind: "output",
            lines: [`touch: cannot touch '${name}': Is a directory`],
          },
          state: next,
        };
      }

      if (!existing) {
        next.nodes[target] = { type: "file", content: "" };
      }

      return { result: { kind: "output", lines: [] }, state: next };
    }

    case "cat": {
      const name = tokens[1];
      if (!name) {
        return {
          result: {
            kind: "output",
            lines: ["cat: missing file operand"],
          },
          state: next,
        };
      }

      const target = resolvePath(next.cwd, name);
      const node = next.nodes[target];

      if (!node) {
        return {
          result: {
            kind: "output",
            lines: [`cat: ${name}: No such file or directory`],
          },
          state: next,
        };
      }

      if (node.type !== "file") {
        return {
          result: {
            kind: "output",
            lines: [`cat: ${name}: Is a directory`],
          },
          state: next,
        };
      }

      return {
        result: {
          kind: "output",
          lines: node.content === "" ? [] : node.content.split("\n"),
        },
        state: next,
      };
    }

    case "cp": {
      const sourceArg = tokens[1];
      const destArg = tokens[2];

      if (!sourceArg || !destArg) {
        return {
          result: {
            kind: "output",
            lines: ["cp: missing file operand"],
          },
          state: next,
        };
      }

      const source = resolvePath(next.cwd, sourceArg);
      const dest = resolvePath(next.cwd, destArg);
      const sourceNode = next.nodes[source];

      if (!sourceNode) {
        return {
          result: {
            kind: "output",
            lines: [
              `cp: cannot stat '${sourceArg}': No such file or directory`,
            ],
          },
          state: next,
        };
      }

      if (sourceNode.type !== "file") {
        return {
          result: {
            kind: "output",
            lines: [
              "cp: omitting directory (not supported in this learning terminal)",
            ],
          },
          state: next,
        };
      }

      let destFile = dest;
      const destNode = next.nodes[dest];
      if (destNode?.type === "directory") {
        destFile = normalizePath(`${dest}/${baseName(source)}`);
      } else {
        const parent = parentPath(dest);
        if (!next.nodes[parent] || next.nodes[parent]?.type !== "directory") {
          return {
            result: {
              kind: "output",
              lines: [
                `cp: cannot create '${destArg}': No such file or directory`,
              ],
            },
            state: next,
          };
        }
      }

      next.nodes[destFile] = {
        type: "file",
        content: sourceNode.content,
      };
      return { result: { kind: "output", lines: [] }, state: next };
    }

    case "mv": {
      const sourceArg = tokens[1];
      const destArg = tokens[2];

      if (!sourceArg || !destArg) {
        return {
          result: {
            kind: "output",
            lines: ["mv: missing file operand"],
          },
          state: next,
        };
      }

      const source = resolvePath(next.cwd, sourceArg);
      const dest = resolvePath(next.cwd, destArg);
      const sourceNode = next.nodes[source];

      if (!sourceNode) {
        return {
          result: {
            kind: "output",
            lines: [
              `mv: cannot stat '${sourceArg}': No such file or directory`,
            ],
          },
          state: next,
        };
      }

      if (sourceNode.type !== "file") {
        return {
          result: {
            kind: "output",
            lines: [
              "mv: directory moves are not supported in this learning terminal",
            ],
          },
          state: next,
        };
      }

      let destFile = dest;
      const destNode = next.nodes[dest];
      if (destNode?.type === "directory") {
        destFile = normalizePath(`${dest}/${baseName(source)}`);
      } else {
        const parent = parentPath(dest);
        if (!next.nodes[parent] || next.nodes[parent]?.type !== "directory") {
          return {
            result: {
              kind: "output",
              lines: [
                `mv: cannot move to '${destArg}': No such file or directory`,
              ],
            },
            state: next,
          };
        }
      }

      next.nodes[destFile] = {
        type: "file",
        content: sourceNode.content,
      };
      delete next.nodes[source];
      return { result: { kind: "output", lines: [] }, state: next };
    }

    case "rm": {
      if (isDangerousRm(tokens)) {
        return {
          result: { kind: "output", lines: DANGEROUS_RM_MESSAGE },
          state: next,
        };
      }

      const name = tokens.slice(1).find((token) => !token.startsWith("-"));
      if (!name) {
        return {
          result: {
            kind: "output",
            lines: ["rm: missing operand"],
          },
          state: next,
        };
      }

      const target = resolvePath(next.cwd, name);
      const node = next.nodes[target];

      if (!node) {
        return {
          result: {
            kind: "output",
            lines: [`rm: cannot remove '${name}': No such file or directory`],
          },
          state: next,
        };
      }

      if (node.type !== "file") {
        return {
          result: {
            kind: "output",
            lines: [
              `rm: cannot remove '${name}': Is a directory`,
              "This learning terminal only removes files.",
            ],
          },
          state: next,
        };
      }

      delete next.nodes[target];
      return { result: { kind: "output", lines: [] }, state: next };
    }

    default:
      return {
        result: { kind: "output", lines: UNSUPPORTED_MESSAGE },
        state: next,
      };
  }
}
