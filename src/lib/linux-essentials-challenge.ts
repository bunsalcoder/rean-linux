/**
 * Frontend-only Linux Essentials Challenge task definitions and validators.
 * Uses simulated terminal state only — never touches the host system.
 */

import { SIMULATED_SCRIPT_HOME } from "@/lib/simulate-bash-scripting";
import type { SimulatedBashScriptState } from "@/lib/simulate-bash-scripting";
import type { SimulatedEnvState } from "@/lib/simulate-environment-variables";
import { SIMULATED_ENV_HOME } from "@/lib/simulate-environment-variables";
import type { SimulatedOwnershipState } from "@/lib/simulate-ownership-sudo";
import type { SimulatedPackageState } from "@/lib/simulate-package-management";
import type { SimulatedPermissionsState } from "@/lib/simulate-file-permissions";
import { octalToMode } from "@/lib/simulate-file-permissions";
import { SIMULATED_PIPES_HOME } from "@/lib/simulate-pipes-and-redirection";
import type { SimulatedPipesState } from "@/lib/simulate-pipes-and-redirection";
import type { SimulatedProcessState } from "@/lib/simulate-processes";
import { SIMULATED_SHELL_HOME } from "@/lib/simulate-shell-basics";
import type { SimulatedShellState } from "@/lib/simulate-shell-basics";

export type ChallengeCategoryId =
  | "users-and-groups"
  | "file-permissions"
  | "ownership-and-sudo"
  | "processes"
  | "package-management"
  | "environment-variables"
  | "pipes-and-redirection"
  | "searching-and-finding-files"
  | "text-processing"
  | "shell-basics"
  | "bash-scripting";

export type ChallengeTaskId =
  | "task-1"
  | "task-2"
  | "task-3"
  | "task-4"
  | "task-5"
  | "task-6"
  | "task-7"
  | "task-8"
  | "task-9"
  | "task-10"
  | "task-11"
  | "task-12"
  | "task-13"
  | "task-14"
  | "task-15"
  | "task-16"
  | "task-17"
  | "task-18"
  | "task-19"
  | "task-20"
  | "task-21"
  | "task-22"
  | "task-23"
  | "task-24"
  | "task-25"
  | "task-26"
  | "task-27"
  | "task-28"
  | "task-29"
  | "task-30"
  | "task-31"
  | "task-32"
  | "task-33";

export type ChallengeCategory = {
  id: ChallengeCategoryId;
  number: number;
  title: string;
  sectionId: string;
  description: string;
  terminalMode:
    | "identity"
    | "permissions"
    | "ownership"
    | "processes"
    | "packages"
    | "environment"
    | "pipes"
    | "searching"
    | "textProcessing"
    | "shellBasics"
    | "bashScripting";
  taskIds: readonly ChallengeTaskId[];
};

export type ChallengeValidationContext = {
  command: string;
  permissions?: SimulatedPermissionsState | null;
  ownership?: SimulatedOwnershipState | null;
  processes?: SimulatedProcessState | null;
  packages?: SimulatedPackageState | null;
  environment?: SimulatedEnvState | null;
  pipes?: SimulatedPipesState | null;
  shell?: SimulatedShellState | null;
  bashScript?: SimulatedBashScriptState | null;
};

export type ChallengeTask = {
  id: ChallengeTaskId;
  categoryId: ChallengeCategoryId;
  title: string;
  description: string;
  hint: string;
  successExplanation: string;
  /** Shown only inside hints — never in the task prompt by default. */
  expectedCommand: string;
  validate: (ctx: ChallengeValidationContext) => boolean;
};

export const CHALLENGE_CATEGORIES: readonly ChallengeCategory[] = [
  {
    id: "users-and-groups",
    number: 1,
    title: "Users and Groups",
    sectionId: "challenge-1-users-and-groups",
    description: "Identify the simulated user, groups, and identity details.",
    terminalMode: "identity",
    taskIds: ["task-1", "task-2", "task-3"],
  },
  {
    id: "file-permissions",
    number: 2,
    title: "File Permissions",
    sectionId: "challenge-2-file-permissions",
    description: "Inspect and change simulated file permission modes.",
    terminalMode: "permissions",
    taskIds: ["task-4", "task-5", "task-6"],
  },
  {
    id: "ownership-and-sudo",
    number: 3,
    title: "Ownership and sudo",
    sectionId: "challenge-3-ownership-and-sudo",
    description: "Inspect ownership and change it with simulated sudo.",
    terminalMode: "ownership",
    taskIds: ["task-7", "task-8", "task-9"],
  },
  {
    id: "processes",
    number: 4,
    title: "Processes",
    sectionId: "challenge-4-processes",
    description: "List simulated processes and stop one by PID.",
    terminalMode: "processes",
    taskIds: ["task-10", "task-11", "task-12"],
  },
  {
    id: "package-management",
    number: 5,
    title: "Package Management",
    sectionId: "challenge-5-package-management",
    description: "Search, install, and verify a simulated package.",
    terminalMode: "packages",
    taskIds: ["task-13", "task-14", "task-15"],
  },
  {
    id: "environment-variables",
    number: 6,
    title: "Environment Variables",
    sectionId: "challenge-6-environment-variables",
    description: "Inspect HOME and export a new environment variable.",
    terminalMode: "environment",
    taskIds: ["task-16", "task-17", "task-18"],
  },
  {
    id: "pipes-and-redirection",
    number: 7,
    title: "Pipes and Redirection",
    sectionId: "challenge-7-pipes-and-redirection",
    description: "Overwrite, append, and read a simulated file.",
    terminalMode: "pipes",
    taskIds: ["task-19", "task-20", "task-21"],
  },
  {
    id: "searching-and-finding-files",
    number: 8,
    title: "Searching and Finding Files",
    sectionId: "challenge-8-searching-and-finding-files",
    description: "Find files and search contents in the simulated tree.",
    terminalMode: "searching",
    taskIds: ["task-22", "task-23", "task-24"],
  },
  {
    id: "text-processing",
    number: 9,
    title: "Text Processing",
    sectionId: "challenge-9-text-processing",
    description: "Count, sort, and deduplicate simulated text.",
    terminalMode: "textProcessing",
    taskIds: ["task-25", "task-26", "task-27"],
  },
  {
    id: "shell-basics",
    number: 10,
    title: "Shell Basics",
    sectionId: "challenge-10-shell-basics",
    description: "Set a variable and chain commands with &&.",
    terminalMode: "shellBasics",
    taskIds: ["task-28", "task-29", "task-30"],
  },
  {
    id: "bash-scripting",
    number: 11,
    title: "Bash Scripting",
    sectionId: "challenge-11-bash-scripting",
    description: "Create and run safe simulated Bash scripts.",
    terminalMode: "bashScripting",
    taskIds: ["task-31", "task-32", "task-33"],
  },
] as const;

function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ");
}

function commandEquals(command: string, expected: string): boolean {
  return normalizeCommand(command) === normalizeCommand(expected);
}

function commandMatches(command: string, patterns: readonly string[]): boolean {
  const normalized = normalizeCommand(command);
  return patterns.some((pattern) => normalized === normalizeCommand(pattern));
}

function pipesFileContent(
  state: SimulatedPipesState | null | undefined,
  relativePath: string,
): string | null {
  if (!state) {
    return null;
  }
  const path = `${SIMULATED_PIPES_HOME}/${relativePath}`;
  const node = state.nodes[path];
  if (!node || node.type !== "file") {
    return null;
  }
  return node.content;
}

function scriptFileContent(
  state: SimulatedBashScriptState | null | undefined,
  relativePath: string,
): string | null {
  if (!state) {
    return null;
  }
  const path = `${SIMULATED_SCRIPT_HOME}/${relativePath}`;
  const node = state.nodes[path];
  if (!node || node.type !== "file") {
    return null;
  }
  return node.content;
}

function isGreetingScript(content: string): boolean {
  return /\becho\b/.test(content) && /hello/i.test(content);
}

function isConditionalOrLoopScript(content: string): boolean {
  return (
    /\bfor\b/.test(content) ||
    /\bwhile\b/.test(content) ||
    /\bif\b/.test(content)
  );
}

export const CHALLENGE_TASKS: Record<ChallengeTaskId, ChallengeTask> = {
  "task-1": {
    id: "task-1",
    categoryId: "users-and-groups",
    title: "Identify the current user",
    description: "Identify the current simulated user.",
    hint: "Use the command that prints only the username of the current user.",
    expectedCommand: "whoami",
    successExplanation:
      "`whoami` prints the simulated username for the current session.",
    validate: ({ command }) => commandEquals(command, "whoami"),
  },
  "task-2": {
    id: "task-2",
    categoryId: "users-and-groups",
    title: "Display group membership",
    description: "Display the current user's groups.",
    hint: "Use the command that lists the groups the current user belongs to.",
    expectedCommand: "groups",
    successExplanation:
      "`groups` shows primary and supplementary group membership for the simulated user.",
    validate: ({ command }) => commandEquals(command, "groups"),
  },
  "task-3": {
    id: "task-3",
    categoryId: "users-and-groups",
    title: "Display UID and groups",
    description: "Display the current user's UID and group information.",
    hint: "Use the identity command that prints uid, gid, and groups together.",
    expectedCommand: "id",
    successExplanation:
      "`id` reports the simulated UID, primary GID, and group list in one line.",
    validate: ({ command }) => commandEquals(command, "id"),
  },
  "task-4": {
    id: "task-4",
    categoryId: "file-permissions",
    title: "Inspect notes.txt permissions",
    description: "Display file permissions for `notes.txt`.",
    hint: "List long-format details for `notes.txt` with `ls`.",
    expectedCommand: "ls -l notes.txt",
    successExplanation:
      "`ls -l` shows the permission string, owner, and group for the simulated file.",
    validate: ({ command }) =>
      commandMatches(command, ["ls -l notes.txt", "ls -l", "ls -la notes.txt"]),
  },
  "task-5": {
    id: "task-5",
    categoryId: "file-permissions",
    title: "Set private.txt to 600",
    description: "Set `private.txt` to permission mode `600`.",
    hint: "Use numeric `chmod` with mode `600` on `private.txt`.",
    expectedCommand: "chmod 600 private.txt",
    successExplanation:
      "`600` means owner read+write only (`rw-------`). Group and others get no access.",
    validate: ({ command, permissions }) => {
      if (!commandEquals(command, "chmod 600 private.txt")) {
        return false;
      }
      const mode = permissions?.entries["private.txt"]?.mode;
      return mode === octalToMode("600");
    },
  },
  "task-6": {
    id: "task-6",
    categoryId: "file-permissions",
    title: "Set script.sh to 755",
    description: "Set `script.sh` to permission mode `755`.",
    hint: "Use numeric `chmod` with mode `755` on `script.sh`.",
    expectedCommand: "chmod 755 script.sh",
    successExplanation:
      "`755` means owner `rwx`, group `r-x`, and others `r-x` — a common executable script mode.",
    validate: ({ command, permissions }) => {
      if (!commandEquals(command, "chmod 755 script.sh")) {
        return false;
      }
      return permissions?.entries["script.sh"]?.mode === octalToMode("755");
    },
  },
  "task-7": {
    id: "task-7",
    categoryId: "ownership-and-sudo",
    title: "Inspect report.txt ownership",
    description: "Display the ownership of `report.txt`.",
    hint: "Use long listing to see the owner and group columns for `report.txt`.",
    expectedCommand: "ls -l report.txt",
    successExplanation:
      "Long listing shows owner and group before the filename — here for the simulated `report.txt`.",
    validate: ({ command }) =>
      commandMatches(command, [
        "ls -l report.txt",
        "ls -l",
        "ls -la report.txt",
      ]),
  },
  "task-8": {
    id: "task-8",
    categoryId: "ownership-and-sudo",
    title: "Change owner with sudo",
    description:
      "Change the owner of `report.txt` to `alice` using elevated privileges.",
    hint: "Ownership changes usually need `sudo` before `chown`.",
    expectedCommand: "sudo chown alice report.txt",
    successExplanation:
      "Simulated `sudo chown` updates the owner without asking for a real password.",
    validate: ({ command, ownership }) => {
      if (!commandEquals(command, "sudo chown alice report.txt")) {
        return false;
      }
      return ownership?.entries["report.txt"]?.owner === "alice";
    },
  },
  "task-9": {
    id: "task-9",
    categoryId: "ownership-and-sudo",
    title: "Change group with sudo",
    description: "Change the group of `report.txt` to `engineering`.",
    hint: "Use `sudo chgrp` with the group name and the file.",
    expectedCommand: "sudo chgrp engineering report.txt",
    successExplanation:
      "`chgrp` changes only the group. With simulated sudo, the group becomes `engineering`.",
    validate: ({ command, ownership }) => {
      if (!commandEquals(command, "sudo chgrp engineering report.txt")) {
        return false;
      }
      return ownership?.entries["report.txt"]?.group === "engineering";
    },
  },
  "task-10": {
    id: "task-10",
    categoryId: "processes",
    title: "List processes",
    description: "Display the simulated process list.",
    hint: "Use the broader process listing form of `ps`.",
    expectedCommand: "ps aux",
    successExplanation:
      "`ps aux` shows a wider simulated process table, including PIDs you can target.",
    validate: ({ command }) => commandEquals(command, "ps aux"),
  },
  "task-11": {
    id: "task-11",
    categoryId: "processes",
    title: "Stop PID 2345",
    description: "Stop the simulated process with PID `2345`.",
    hint: "Send a terminate request to PID `2345` with `kill`.",
    expectedCommand: "kill 2345",
    successExplanation:
      "Simulated `kill` removes PID `2345` from the teaching process table — never a real process.",
    validate: ({ command, processes }) => {
      if (!commandEquals(command, "kill 2345")) {
        return false;
      }
      return !processes?.processes.some((process) => process.pid === 2345);
    },
  },
  "task-12": {
    id: "task-12",
    categoryId: "processes",
    title: "Verify the process is gone",
    description: "Verify that the process is no longer running.",
    hint: "List processes again and confirm PID `2345` is missing.",
    expectedCommand: "ps",
    successExplanation:
      "After a successful simulated kill, `ps` no longer shows PID `2345`.",
    validate: ({ command, processes }) => {
      if (!commandMatches(command, ["ps", "ps aux"])) {
        return false;
      }
      return !processes?.processes.some((process) => process.pid === 2345);
    },
  },
  "task-13": {
    id: "task-13",
    categoryId: "package-management",
    title: "Search for curl",
    description: "Search for the `curl` package.",
    hint: "Use `apt search` with the package name.",
    expectedCommand: "apt search curl",
    successExplanation:
      "`apt search` looks through the simulated package index — no real network or apt is used.",
    validate: ({ command }) => commandEquals(command, "apt search curl"),
  },
  "task-14": {
    id: "task-14",
    categoryId: "package-management",
    title: "Install curl",
    description: "Install `curl` using elevated privileges.",
    hint: "Install with `sudo apt install` and the package name.",
    expectedCommand: "sudo apt install curl",
    successExplanation:
      "Simulated `sudo apt install` marks `curl` installed in memory only.",
    validate: ({ command, packages }) => {
      if (
        !commandMatches(command, [
          "sudo apt install curl",
          "sudo apt-get install curl",
        ])
      ) {
        return false;
      }
      return packages?.packages.curl?.installed === true;
    },
  },
  "task-15": {
    id: "task-15",
    categoryId: "package-management",
    title: "Verify curl is installed",
    description: "Verify that `curl` is installed.",
    hint: "Inspect package details with `apt show curl` and check the Status line.",
    expectedCommand: "apt show curl",
    successExplanation:
      "`apt show` reports simulated package status. After install it should read installed.",
    validate: ({ command, packages }) => {
      if (!commandEquals(command, "apt show curl")) {
        return false;
      }
      return packages?.packages.curl?.installed === true;
    },
  },
  "task-16": {
    id: "task-16",
    categoryId: "environment-variables",
    title: "Display HOME",
    description: "Display the home directory.",
    hint: "Print the `HOME` variable with `echo`.",
    expectedCommand: "echo $HOME",
    successExplanation: `\`echo $HOME\` expands the simulated home path (\`${SIMULATED_ENV_HOME}\`).`,
    validate: ({ command }) =>
      commandMatches(command, ["echo $HOME", 'echo "$HOME"', "printenv HOME"]),
  },
  "task-17": {
    id: "task-17",
    categoryId: "environment-variables",
    title: "Export APP_ENV",
    description: "Export a variable named `APP_ENV` with value `production`.",
    hint: "Use `export` to create an environment variable named `APP_ENV`.",
    expectedCommand: 'export APP_ENV="production"',
    successExplanation:
      "`export` places `APP_ENV` into the simulated environment so child commands can read it.",
    validate: ({ command, environment }) => {
      if (
        !commandMatches(command, [
          'export APP_ENV="production"',
          "export APP_ENV=production",
          "export APP_ENV='production'",
        ])
      ) {
        return false;
      }
      return (
        environment?.values.APP_ENV === "production" &&
        environment.exported.APP_ENV === true
      );
    },
  },
  "task-18": {
    id: "task-18",
    categoryId: "environment-variables",
    title: "Display APP_ENV",
    description: "Display the variable.",
    hint: "Print one exported variable with `printenv`.",
    expectedCommand: "printenv APP_ENV",
    successExplanation:
      "`printenv APP_ENV` prints the simulated exported value `production`.",
    validate: ({ command, environment }) => {
      if (
        !commandMatches(command, [
          "printenv APP_ENV",
          "echo $APP_ENV",
          'echo "$APP_ENV"',
        ])
      ) {
        return false;
      }
      return (
        environment?.values.APP_ENV === "production" &&
        environment.exported.APP_ENV === true
      );
    },
  },
  "task-19": {
    id: "task-19",
    categoryId: "pipes-and-redirection",
    title: "Write challenge.txt",
    description: "Write `Linux Essentials` into `challenge.txt`.",
    hint: "Use `echo` with `>` to create or overwrite the file.",
    expectedCommand: 'echo "Linux Essentials" > challenge.txt',
    successExplanation:
      "`>` overwrites the simulated file with the new contents.",
    validate: ({ command, pipes }) => {
      if (
        !commandMatches(command, [
          'echo "Linux Essentials" > challenge.txt',
          "echo 'Linux Essentials' > challenge.txt",
          "echo Linux Essentials > challenge.txt",
        ])
      ) {
        return false;
      }
      const content = pipesFileContent(pipes, "challenge.txt");
      return content === "Linux Essentials";
    },
  },
  "task-20": {
    id: "task-20",
    categoryId: "pipes-and-redirection",
    title: "Append to challenge.txt",
    description: "Append `Challenge completed` to the same file.",
    hint: "Use `>>` so the new line is added without erasing existing content.",
    expectedCommand: 'echo "Challenge completed" >> challenge.txt',
    successExplanation:
      "`>>` appends to the simulated file instead of replacing it.",
    validate: ({ command, pipes }) => {
      if (
        !commandMatches(command, [
          'echo "Challenge completed" >> challenge.txt',
          "echo 'Challenge completed' >> challenge.txt",
          "echo Challenge completed >> challenge.txt",
        ])
      ) {
        return false;
      }
      const content = pipesFileContent(pipes, "challenge.txt");
      return content?.includes("Challenge completed") === true;
    },
  },
  "task-21": {
    id: "task-21",
    categoryId: "pipes-and-redirection",
    title: "Display challenge.txt",
    description: "Display the file contents.",
    hint: "Print the file with `cat`.",
    expectedCommand: "cat challenge.txt",
    successExplanation:
      "`cat` shows the simulated file: an overwrite line plus the appended line.",
    validate: ({ command, pipes }) => {
      if (!commandEquals(command, "cat challenge.txt")) {
        return false;
      }
      const content = pipesFileContent(pipes, "challenge.txt");
      return (
        content?.includes("Linux Essentials") === true &&
        content.includes("Challenge completed")
      );
    },
  },
  "task-22": {
    id: "task-22",
    categoryId: "searching-and-finding-files",
    title: "Find .txt files",
    description: "Find all `.txt` files under the current directory.",
    hint: "Use `find` with `-name` and a `*.txt` pattern.",
    expectedCommand: 'find . -name "*.txt"',
    successExplanation:
      '`find . -name "*.txt"` walks the simulated tree for matching filenames.',
    validate: ({ command }) =>
      commandMatches(command, [
        'find . -name "*.txt"',
        "find . -name '*.txt'",
        "find . -name *.txt",
      ]),
  },
  "task-23": {
    id: "task-23",
    categoryId: "searching-and-finding-files",
    title: "Search /etc/passwd",
    description: "Search for the word `bunsal` in `/etc/passwd`.",
    hint: "Use `grep` with the search text and the simulated `/etc/passwd` path.",
    expectedCommand: 'grep "bunsal" /etc/passwd',
    successExplanation:
      "`grep` searches simulated file contents — never the host `/etc/passwd`.",
    validate: ({ command }) =>
      commandMatches(command, [
        'grep "bunsal" /etc/passwd',
        "grep 'bunsal' /etc/passwd",
        "grep bunsal /etc/passwd",
      ]),
  },
  "task-24": {
    id: "task-24",
    categoryId: "searching-and-finding-files",
    title: "Find directories",
    description: "Find all directories.",
    hint: "Use `find` with `-type d` starting at the current directory.",
    expectedCommand: "find . -type d",
    successExplanation:
      "`find . -type d` lists directories in the simulated filesystem tree.",
    validate: ({ command }) => commandEquals(command, "find . -type d"),
  },
  "task-25": {
    id: "task-25",
    categoryId: "text-processing",
    title: "Count lines in notes.txt",
    description: "Count the lines in `notes.txt`.",
    hint: "Use `wc` with the line-count option.",
    expectedCommand: "wc -l notes.txt",
    successExplanation:
      "`wc -l` counts newline-separated lines in the simulated file.",
    validate: ({ command }) => commandEquals(command, "wc -l notes.txt"),
  },
  "task-26": {
    id: "task-26",
    categoryId: "text-processing",
    title: "Sort names.txt",
    description: "Sort `names.txt`.",
    hint: "Pass the filename to `sort`.",
    expectedCommand: "sort names.txt",
    successExplanation:
      "`sort` prints the simulated file lines in sorted order without changing the file.",
    validate: ({ command }) => commandEquals(command, "sort names.txt"),
  },
  "task-27": {
    id: "task-27",
    categoryId: "text-processing",
    title: "Unique sorted names",
    description: "Display unique names in sorted order.",
    hint: "Pipe sorted output into `uniq`.",
    expectedCommand: "sort names.txt | uniq",
    successExplanation:
      "`uniq` removes adjacent duplicates, so sorting first produces a unique list.",
    validate: ({ command }) =>
      commandMatches(command, [
        "sort names.txt | uniq",
        "sort names.txt|uniq",
        "sort names.txt | uniq -",
      ]),
  },
  "task-28": {
    id: "task-28",
    categoryId: "shell-basics",
    title: "Create PROJECT variable",
    description:
      "Create a shell variable named `PROJECT` with value `rean-linux`.",
    hint: 'Assign with `NAME="value"` syntax — no spaces around `=`.',
    expectedCommand: 'PROJECT="rean-linux"',
    successExplanation:
      "Shell assignment stores `PROJECT` in the simulated shell variable space.",
    validate: ({ command, shell }) => {
      if (
        !commandMatches(command, [
          'PROJECT="rean-linux"',
          "PROJECT='rean-linux'",
          "PROJECT=rean-linux",
        ])
      ) {
        return false;
      }
      return shell?.values.PROJECT === "rean-linux";
    },
  },
  "task-29": {
    id: "task-29",
    categoryId: "shell-basics",
    title: "Print PROJECT",
    description: "Print the variable.",
    hint: "Expand the variable with `echo` and `$PROJECT`.",
    expectedCommand: 'echo "$PROJECT"',
    successExplanation:
      "Double quotes allow `$PROJECT` to expand to the simulated value `rean-linux`.",
    validate: ({ command, shell }) => {
      if (!commandMatches(command, ['echo "$PROJECT"', "echo $PROJECT"])) {
        return false;
      }
      return shell?.values.PROJECT === "rean-linux";
    },
  },
  "task-30": {
    id: "task-30",
    categoryId: "shell-basics",
    title: "Success-dependent sequence",
    description: "Run a success-dependent command sequence.",
    hint: "Create a directory and change into it only if creation succeeds (`&&`).",
    expectedCommand: "mkdir challenge-project && cd challenge-project",
    successExplanation:
      "`&&` runs `cd` only after `mkdir` succeeds, leaving you inside the new directory.",
    validate: ({ command, shell }) => {
      if (
        !commandEquals(
          command,
          "mkdir challenge-project && cd challenge-project",
        )
      ) {
        return false;
      }
      return shell?.cwd === `${SIMULATED_SHELL_HOME}/challenge-project`;
    },
  },
  "task-31": {
    id: "task-31",
    categoryId: "bash-scripting",
    title: "Create greeting.sh",
    description:
      "Create a simulated script named `greeting.sh` that prints a greeting.",
    hint: "Write `greeting.sh` with a shebang and an `echo` greeting using a heredoc or nano.",
    expectedCommand:
      'cat > greeting.sh <<\'EOF\'\n#!/bin/bash\nNAME="Linux Learner"\necho "Hello, $NAME!"\nEOF',
    successExplanation:
      "The simulated script file stores commands as text until you run it with `bash`.",
    validate: ({ command, bashScript }) => {
      const content = scriptFileContent(bashScript, "greeting.sh");
      if (!content || !isGreetingScript(content)) {
        return false;
      }
      const normalized = normalizeCommand(command);
      return (
        normalized.includes("greeting.sh") ||
        normalized === ":wq" ||
        normalized === "save"
      );
    },
  },
  "task-32": {
    id: "task-32",
    categoryId: "bash-scripting",
    title: "Run greeting.sh",
    description: "Run the simulated script.",
    hint: "Execute the script file with the `bash` interpreter.",
    expectedCommand: "bash greeting.sh",
    successExplanation:
      "`bash greeting.sh` interprets the teaching subset of the script — never a real Bash process.",
    validate: ({ command, bashScript }) => {
      if (!commandEquals(command, "bash greeting.sh")) {
        return false;
      }
      const content = scriptFileContent(bashScript, "greeting.sh");
      return content !== null && isGreetingScript(content);
    },
  },
  "task-33": {
    id: "task-33",
    categoryId: "bash-scripting",
    title: "Create a loop or conditional script",
    description:
      "Create a simple simulated script using a conditional or loop.",
    hint: "Write a script that uses `for`, `while`, or `if`, then save it in the simulator.",
    expectedCommand:
      "cat > greet-loop.sh <<'EOF'\n#!/bin/bash\n\nfor NAME in Alice Bob\ndo\n  echo \"Hello, $NAME\"\ndone\nEOF",
    successExplanation:
      "Loops and conditionals let a script repeat work or choose a branch in the teaching simulator.",
    validate: ({ command, bashScript }) => {
      if (!bashScript) {
        return false;
      }
      const normalized = normalizeCommand(command);
      const isWrite =
        normalized.includes(".sh") ||
        normalized === ":wq" ||
        normalized === "save";
      if (!isWrite || commandEquals(command, "bash greeting.sh")) {
        return false;
      }
      for (const [path, node] of Object.entries(bashScript.nodes)) {
        if (!path.endsWith(".sh") || node.type !== "file") {
          continue;
        }
        if (isConditionalOrLoopScript(node.content)) {
          return true;
        }
      }
      return false;
    },
  },
};

export const ALL_CHALLENGE_TASK_IDS = Object.keys(
  CHALLENGE_TASKS,
) as ChallengeTaskId[];

export const TOTAL_CHALLENGE_TASKS = ALL_CHALLENGE_TASK_IDS.length;

export function getTasksForCategory(
  categoryId: ChallengeCategoryId,
): ChallengeTask[] {
  const category = CHALLENGE_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    return [];
  }
  return category.taskIds.map((id) => CHALLENGE_TASKS[id]);
}
