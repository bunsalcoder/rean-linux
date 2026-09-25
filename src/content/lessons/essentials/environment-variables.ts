import type { Lesson } from "@/types/lesson";

export const environmentVariablesLesson = {
  slug: "environment-variables",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Environment Variables",
  description:
    "Understand how Linux stores environment settings, how to inspect and change them, and why variables like PATH and HOME matter.",
  seoTitle: "Environment Variables — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux environment variables: env, printenv, echo, PATH, HOME, export, unset, and how applications use environment settings.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Environment Variables" },
  ],
  navigation: {
    previous: {
      label: "Package Management",
      href: "/learn/essentials/package-management",
    },
    next: {
      label: "Pipes and Redirection",
      href: "/learn/essentials/pipes-and-redirection",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Package Management](/learn/essentials/package-management) you learned how software gets onto a Linux system. Now you will learn how processes receive configuration through **environment variables** — named values like `HOME`, `USER`, and `PATH`.",
    },
  ],
  sections: [
    {
      id: "what-is-an-environment-variable",
      title: "What Is an Environment Variable?",
      blocks: [
        {
          type: "paragraph",
          text: "An **environment variable** is a named value made available to processes running in an environment. Programs can read these values to learn about their runtime settings.",
        },
        {
          type: "paragraph",
          text: "Simple example:",
        },
        {
          type: "code",
          code: "USER=bunsal",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "The general form is:",
        },
        {
          type: "code",
          code: "NAME=value",
          language: "text",
          title: "pattern",
        },
        {
          type: "paragraph",
          text: "Common variables you may encounter:",
        },
        {
          type: "code",
          code: "HOME\nUSER\nPATH\nSHELL\nTERM\nLANG",
          language: "text",
          title: "common names",
        },
        {
          type: "paragraph",
          text: "Applications can read these values to determine things about their runtime environment — for example, where the user’s home directory is, which language settings to use, or where to search for commands.",
        },
      ],
    },
    {
      id: "environment-variables-vs-normal-variables",
      title: "Environment Variables vs Normal Variables",
      blocks: [
        {
          type: "paragraph",
          text: "In the shell, you can create a normal (shell) variable:",
        },
        {
          type: "code",
          code: 'name="bunsal"',
          language: "bash",
          title: "shell variable",
        },
        {
          type: "paragraph",
          text: "Then export it so it becomes part of the environment:",
        },
        {
          type: "code",
          code: "export name",
          language: "bash",
          title: "export",
        },
        {
          type: "list",
          items: [
            "A **shell variable** exists in the current shell",
            "An **exported variable** is placed in the environment inherited by commands started from that shell",
            "Child processes can receive exported environment variables",
          ],
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "Shell containing a shell variable and an exported variable that flows down to a child process",
          root: {
            label: "Shell",
            children: [
              { label: "shell variable" },
              {
                label: "exported variable",
                children: [{ label: "child process" }],
              },
            ],
          },
        },
        {
          type: "callout",
          title: "Keep it conceptual",
          text: "You do not need Bash internals yet. Remember the idea: export makes a variable available to programs you start from the shell.",
        },
      ],
    },
    {
      id: "viewing-environment-variables",
      title: "Viewing Environment Variables",
      blocks: [
        {
          type: "paragraph",
          text: "Use `env` or `printenv` to display environment variables:",
        },
        {
          type: "code",
          code: "env",
          language: "bash",
          title: "list environment",
        },
        {
          type: "code",
          code: "printenv",
          language: "bash",
          title: "list environment",
        },
        {
          type: "paragraph",
          text: "To retrieve one specific value:",
        },
        {
          type: "code",
          code: "printenv HOME",
          language: "bash",
          title: "one variable",
        },
        {
          type: "code",
          code: "printenv USER",
          language: "bash",
          title: "one variable",
        },
        {
          type: "paragraph",
          text: "`printenv VARIABLE` retrieves the value of that exported environment variable.",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            { command: "env", label: "env" },
            { command: "printenv", label: "printenv" },
            { command: "printenv HOME", label: "printenv HOME" },
            { command: "printenv USER", label: "printenv USER" },
          ],
          suggestionsLabel: "Try viewing variables",
        },
      ],
    },
    {
      id: "reading-variables-with-dollar",
      title: "Reading Variables with `$`",
      blocks: [
        {
          type: "paragraph",
          text: "In the shell, `$VARIABLE` means “expand the value of this variable.”",
        },
        {
          type: "code",
          code: "echo $HOME",
          language: "bash",
          title: "expand HOME",
        },
        {
          type: "code",
          code: "echo $USER",
          language: "bash",
          title: "expand USER",
        },
        {
          type: "code",
          code: "echo $SHELL",
          language: "bash",
          title: "expand SHELL",
        },
        {
          type: "paragraph",
          text: "You can mix text and expansions:",
        },
        {
          type: "code",
          code: 'echo "Home directory: $HOME"',
          language: "bash",
          title: "text + variable",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            { command: "echo $HOME", label: "echo $HOME" },
            { command: "echo $USER", label: "echo $USER" },
            { command: "echo $SHELL", label: "echo $SHELL" },
            {
              command: 'echo "Home directory: $HOME"',
              label: 'echo "Home directory: $HOME"',
            },
          ],
          suggestionsLabel: "Try expansion",
        },
      ],
    },
    {
      id: "important-linux-environment-variables",
      title: "Important Linux Environment Variables",
      blocks: [
        {
          type: "paragraph",
          text: "These variables appear on many Linux systems. Exact values vary by system and user — the Rean Linux terminal uses simulated values for learning.",
        },
        {
          type: "table",
          caption: "Common Linux environment variables",
          headers: ["Variable", "Purpose"],
          rows: [
            ["`HOME`", "User's home directory"],
            ["`USER`", "Current username"],
            ["`SHELL`", "User's default shell"],
            ["`PATH`", "Directories searched for commands"],
            ["`PWD`", "Current working directory"],
            ["`LANG`", "Locale/language settings"],
            ["`TERM`", "Terminal type"],
          ],
        },
        {
          type: "callout",
          title: "Simulated values",
          text: "In this lesson’s terminal, examples use values such as `HOME=/home/bunsal` and `USER=bunsal`. Your real machine may differ.",
        },
      ],
    },
    {
      id: "understanding-path",
      title: "Understanding `PATH`",
      blocks: [
        {
          type: "paragraph",
          text: "`PATH` is one of the most important environment variables. Inspect it with:",
        },
        {
          type: "code",
          code: "echo $PATH",
          language: "bash",
          title: "show PATH",
        },
        {
          type: "paragraph",
          text: "Example value:",
        },
        {
          type: "code",
          code: "/usr/local/bin:/usr/bin:/bin",
          language: "text",
          title: "example PATH",
        },
        {
          type: "list",
          items: [
            "`PATH` is a **list of directories**",
            "Directories are separated by `:`",
            "When you type a command such as `git`, the shell can search directories in `PATH` for an executable with that name",
          ],
        },
        {
          type: "code",
          code: "git\n ↓\n/usr/local/bin\n ↓\n/usr/bin\n ↓\n/bin",
          language: "text",
          title: "command lookup",
        },
        {
          type: "note",
          text: "Not every Linux system uses exactly these directories. Treat the list above as a clear teaching example.",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            { command: "echo $PATH", label: "echo $PATH" },
            { command: "printenv PATH", label: "printenv PATH" },
          ],
          suggestionsLabel: "Inspect PATH",
        },
      ],
    },
    {
      id: "setting-a-variable",
      title: "Setting a Variable",
      blocks: [
        {
          type: "paragraph",
          text: "Create or update a shell variable in the current shell:",
        },
        {
          type: "code",
          code: 'NAME="Bunsal"',
          language: "bash",
          title: "assign",
        },
        {
          type: "code",
          code: "echo $NAME",
          language: "bash",
          title: "read",
        },
        {
          type: "paragraph",
          text: "Update it again and the new value appears:",
        },
        {
          type: "code",
          code: 'NAME="Linux Learner"\necho $NAME',
          language: "bash",
          title: "update",
        },
        {
          type: "paragraph",
          text: "This lesson’s simulator keeps variable state for the session, so later commands see your changes.",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            { command: 'NAME="Bunsal"', label: 'NAME="Bunsal"' },
            { command: "echo $NAME", label: "echo $NAME" },
            {
              command: 'NAME="Linux Learner"',
              label: 'NAME="Linux Learner"',
            },
            { command: "echo $NAME", label: "echo $NAME again" },
          ],
          suggestionsLabel: "Set and read",
        },
      ],
    },
    {
      id: "exporting-a-variable",
      title: "Exporting a Variable",
      blocks: [
        {
          type: "paragraph",
          text: "Exporting makes a variable part of the environment inherited by child processes:",
        },
        {
          type: "code",
          code: 'export APP_ENV="development"',
          language: "bash",
          title: "export",
        },
        {
          type: "code",
          code: "echo $APP_ENV",
          language: "bash",
          title: "read",
        },
        {
          type: "paragraph",
          text: "You can also confirm with `printenv`:",
        },
        {
          type: "code",
          code: 'export API_URL="https://example.test"\nprintenv API_URL',
          language: "bash",
          title: "export + printenv",
        },
        {
          type: "note",
          text: "`https://example.test` is a fake example URL for learning. This terminal never connects to the network.",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            {
              command: 'export APP_ENV="development"',
              label: 'export APP_ENV="development"',
            },
            { command: "echo $APP_ENV", label: "echo $APP_ENV" },
            {
              command: 'export API_URL="https://example.test"',
              label: 'export API_URL="https://example.test"',
            },
            { command: "printenv API_URL", label: "printenv API_URL" },
          ],
          suggestionsLabel: "Practice export",
        },
      ],
    },
    {
      id: "unsetting-a-variable",
      title: "Unsetting a Variable",
      blocks: [
        {
          type: "paragraph",
          text: "Remove a variable from the current shell environment/variable set with `unset`:",
        },
        {
          type: "code",
          code: "unset APP_ENV",
          language: "bash",
          title: "unset",
        },
        {
          type: "code",
          code: "echo $APP_ENV",
          language: "bash",
          title: "after unset",
        },
        {
          type: "paragraph",
          text: "After `unset`, expanding `$APP_ENV` is empty, and `printenv APP_ENV` shows that it is unset.",
        },
        {
          type: "callout",
          title: "Session only",
          text: "`unset` affects the current shell session. It does not permanently remove a variable from every shell or from configuration files.",
        },
        {
          type: "terminal",
          preset: "environment-variables",
          suggestions: [
            {
              command: 'export APP_ENV="development"',
              label: 'export APP_ENV="development"',
            },
            { command: "printenv APP_ENV", label: "printenv APP_ENV" },
            { command: "unset APP_ENV", label: "unset APP_ENV" },
            { command: "printenv APP_ENV", label: "printenv again" },
          ],
          suggestionsLabel: "Practice unset",
        },
      ],
    },
    {
      id: "environment-variables-and-child-processes",
      title: "Environment Variables and Child Processes",
      blocks: [
        {
          type: "paragraph",
          text: "Exported variables are commonly used to configure applications. Conceptually:",
        },
        {
          type: "tree-diagram",
          ariaLabel:
            "Parent shell with exported APP_ENV flowing down to a child process that can read APP_ENV",
          root: {
            label: "Parent shell",
            children: [
              {
                label: "exported APP_ENV",
                children: [
                  {
                    label: "child process",
                    children: [{ label: "can read APP_ENV" }],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "paragraph",
          text: "Typical configuration-style variables:",
        },
        {
          type: "code",
          code: "APP_ENV=development\nPORT=3000\nDATABASE_URL=...\nAPI_URL=...",
          language: "text",
          title: "app config examples",
        },
        {
          type: "callout",
          title: "Handle secrets carefully",
          text: "Environment variables can contain sensitive values such as credentials or API keys. Do not commit secrets into Git. Development tools often use `.env` files as a convention — that is an application/tool pattern, not a special Linux environment-variable feature.",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "environment-variables-practice",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "Common Mistakes",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Mistake 1 — Forgetting `$`",
        },
        {
          type: "paragraph",
          text: "Incorrect:",
        },
        {
          type: "code",
          code: "echo PATH",
          language: "bash",
          title: "incorrect",
        },
        {
          type: "paragraph",
          text: "Correct:",
        },
        {
          type: "code",
          code: "echo $PATH",
          language: "bash",
          title: "correct",
        },
        {
          type: "paragraph",
          text: "`echo PATH` prints the literal word `PATH`. `echo $PATH` expands and prints the variable’s value.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Thinking `PATH` is one directory",
        },
        {
          type: "paragraph",
          text: "`PATH` is a **list** of directories separated by `:`, not a single folder.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Thinking `export` means permanent",
        },
        {
          type: "paragraph",
          text: "This affects the current shell and processes it starts:",
        },
        {
          type: "code",
          code: "export APP_ENV=development",
          language: "bash",
          title: "session export",
        },
        {
          type: "paragraph",
          text: "It does **not** automatically make the setting permanent across every future login or session.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Putting secrets in source code",
        },
        {
          type: "paragraph",
          text: "Do not commit values like these into Git repositories:",
        },
        {
          type: "code",
          code: "API_KEY=...\nDATABASE_PASSWORD=...",
          language: "text",
          title: "do not commit",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Accidentally overwriting `PATH`",
        },
        {
          type: "paragraph",
          text: "Replacing `PATH` carelessly can make commands difficult to find. Prefer inspecting `PATH` over rewriting it while you are learning.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now understand the fundamentals of environment variables:",
        },
        {
          type: "list",
          items: [
            "Environment variables are named values available to processes",
            "`env` and `printenv` can inspect them",
            "`$VARIABLE` expands a variable’s value",
            "`export` makes a variable available to child processes",
            "`unset` removes a variable from the current environment/variable set",
            "`PATH` contains directories used when locating commands",
            "`HOME`, `USER`, `SHELL`, and `PWD` are common environment variables",
            "Environment variables are widely used to configure applications",
            "Secrets should be handled carefully",
          ],
        },
        {
          type: "table",
          caption: "Command reference for environment variables",
          headers: ["Command", "Purpose"],
          rows: [
            ["`env`", "Show exported environment variables"],
            ["`printenv`", "Show exported environment variables"],
            ["`printenv NAME`", "Show one exported variable"],
            ["`echo $NAME`", "Expand and print a variable"],
            ['`NAME="value"`', "Set a shell variable"],
            ['`export NAME="value"`', "Export a variable"],
            ["`unset NAME`", "Remove a variable"],
          ],
        },
        {
          type: "code",
          code: "Environment variables connect the shell,\nthe operating system environment, and applications.",
          language: "text",
          title: "remember",
        },
      ],
    },
  ],
} as const satisfies Lesson;
