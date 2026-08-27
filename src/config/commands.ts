export type SpotlightCommand = {
  name: string;
  description: string;
  example: string;
  href: string;
};

export const spotlightCommands: readonly SpotlightCommand[] = [
  {
    name: "pwd",
    description: "Print the current working directory.",
    example: "pwd",
    href: "/commands/pwd",
  },
  {
    name: "ls",
    description: "List files and directories.",
    example: "ls -la",
    href: "/commands/ls",
  },
  {
    name: "cd",
    description: "Change the current working directory.",
    example: "cd /var/log",
    href: "/commands/cd",
  },
  {
    name: "mkdir",
    description: "Create a new directory.",
    example: "mkdir projects",
    href: "/commands/mkdir",
  },
  {
    name: "grep",
    description: "Search text using patterns.",
    example: 'grep "error" app.log',
    href: "/commands/grep",
  },
  {
    name: "chmod",
    description: "Change file or directory permissions.",
    example: "chmod 755 script.sh",
    href: "/commands/chmod",
  },
];
