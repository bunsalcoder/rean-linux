export const COMMAND_DIFFICULTIES = ["Beginner", "Intermediate"] as const;

export type CommandDifficulty = (typeof COMMAND_DIFFICULTIES)[number];

export type CommandOption = {
  flag: string;
  description: string;
};

export type CommandExample = {
  command: string;
  output?: string;
  description: string;
};

export type SpotlightCommand = {
  command: string;
  title: string;
  description: string;
  category: string;
  difficulty: CommandDifficulty;
  syntax: string;
  options: readonly CommandOption[];
  examples: readonly CommandExample[];
};

export const spotlightCommand: SpotlightCommand = {
  command: "ls",
  title: "List directory contents",
  description: "List files and directories in the current location.",
  category: "Filesystem",
  difficulty: "Beginner",
  syntax: "ls [options] [directory]",
  options: [
    { flag: "-l", description: "detailed listing" },
    { flag: "-a", description: "show hidden files" },
    { flag: "-h", description: "human-readable sizes" },
  ],
  examples: [
    {
      command: "ls",
      output: "Documents  Downloads  Music  Pictures  Projects",
      description: "List files and directories in the current location.",
    },
    {
      command: "ls -la",
      output: [
        "total 32",
        "drwxr-xr-x  .",
        "drwxr-xr-x  ..",
        "-rw-r--r--  .bashrc",
        "drwxr-xr-x  Documents",
        "drwxr-xr-x  Downloads",
        "drwxr-xr-x  Music",
        "drwxr-xr-x  Pictures",
        "drwxr-xr-x  Projects",
      ].join("\n"),
      description: "Show detailed information, including hidden files.",
    },
  ],
};
