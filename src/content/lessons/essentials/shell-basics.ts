import type { Lesson } from "@/types/lesson";

export const shellBasicsLesson = {
  slug: "shell-basics",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "25–30 min read",
  title: "Shell Basics",
  description:
    "Understand how a shell interprets commands, handles quotes and variables, and combines commands into useful workflows.",
  seoTitle: "Shell Basics — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn shell basics: how Bash interprets commands, quoting, variables, command substitution, exit status, and combining commands with ;, &&, and ||.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Shell Basics" },
  ],
  navigation: {
    previous: {
      label: "Text Processing",
      href: "/learn/essentials/text-processing",
    },
    next: {
      label: "Introduction to Bash Scripting",
      href: "/learn/essentials/introduction-to-bash-scripting",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Text Processing](/learn/essentials/text-processing) you learned tools that transform text. Now you will learn how the **shell** itself reads what you type — quotes, variables, exit status, and how commands are combined.",
    },
  ],
  sections: [
    {
      id: "what-is-a-shell",
      title: "What Is a Shell?",
      blocks: [
        {
          type: "paragraph",
          text: "A **shell** is a program that interprets commands. When you type a line and press Enter, the shell reads it, decides what it means, and runs programs or built-in commands.",
        },
        {
          type: "paragraph",
          text: "**Bash** is one popular shell on Linux. Other shells exist, but the ideas in this lesson apply widely.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Terminal emulator",
              description:
                "The window or app where you type — for example GNOME Terminal, Konsole, or this learning terminal UI.",
            },
            {
              term: "Shell",
              description:
                "The program that **interprets** what you type (such as Bash) and starts the commands you ask for.",
            },
          ],
        },
        {
          type: "callout",
          title: "Terminal vs shell",
          text: "The terminal is the interface. The shell is the interpreter. You interact with a shell *through* a terminal.",
        },
        {
          type: "code",
          code: "You type a command\n        ↓\nTerminal shows your input\n        ↓\nShell interprets the line\n        ↓\nProgram or built-in runs",
          language: "text",
          title: "terminal and shell",
        },
      ],
    },
    {
      id: "how-a-command-is-structured",
      title: "How a Command Is Structured",
      blocks: [
        {
          type: "paragraph",
          text: "Most command lines follow a simple pattern:",
        },
        {
          type: "code",
          code: "command [options] [arguments]",
          language: "bash",
          title: "command structure",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Command",
              description: "What to run — for example `ls`, `cat`, or `grep`.",
            },
            {
              term: "Options",
              description:
                "How the command should behave — often short flags like `-l` or long forms like `--help`.",
            },
            {
              term: "Arguments",
              description:
                "What the command should operate on — file names, patterns, or other values.",
            },
          ],
        },
        {
          type: "code",
          code: "ls -l\ncat notes.txt\ngrep \"Linux\" notes.txt",
          language: "bash",
          title: "examples",
        },
        {
          type: "list",
          items: [
            "`ls -l` — command `ls` with option `-l`.",
            "`cat notes.txt` — command `cat` with argument `notes.txt`.",
            '`grep "Linux" notes.txt` — command `grep` with a pattern and a file.',
          ],
        },
        {
          type: "note",
          text: "Not every command uses options or arguments. `pwd` is a complete command by itself.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            { command: "pwd", label: "pwd" },
            { command: "ls", label: "ls" },
            { command: "ls -l", label: "ls -l" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try command structure",
        },
      ],
    },
    {
      id: "quoting-single-quotes-and-double-quotes",
      title: "Quoting: Single Quotes and Double Quotes",
      blocks: [
        {
          type: "paragraph",
          text: "Quoting matters when a value contains spaces or characters the shell treats specially (such as `$`).",
        },
        {
          type: "heading",
          level: 3,
          text: "Single quotes",
        },
        {
          type: "paragraph",
          text: "In Bash, **single quotes** preserve the literal characters inside them:",
        },
        {
          type: "code",
          code: "echo 'Hello Linux'\necho '$HOME'",
          language: "bash",
          title: "single quotes",
        },
        {
          type: "paragraph",
          text: "`echo '$HOME'` prints the characters `$HOME` — the variable is **not** expanded.",
        },
        {
          type: "heading",
          level: 3,
          text: "Double quotes",
        },
        {
          type: "paragraph",
          text: "**Double quotes** preserve most characters but **allow variable expansion**:",
        },
        {
          type: "code",
          code: 'echo "Hello Linux"\necho "$HOME"',
          language: "bash",
          title: "double quotes",
        },
        {
          type: "paragraph",
          text: '`echo "$HOME"` prints the value of `HOME` (in this simulator, a teaching path like `/home/bunsal`).',
        },
        {
          type: "callout",
          title: "Basic quoting rule",
          text: "Use single quotes when you want the text exactly as written. Use double quotes when you want spaces protected but still need `$NAME` to expand.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            { command: "echo 'Hello Linux'", label: "echo 'Hello Linux'" },
            { command: "echo '$HOME'", label: "echo '$HOME'" },
            { command: 'echo "Hello Linux"', label: 'echo "Hello Linux"' },
            { command: 'echo "$HOME"', label: 'echo "$HOME"' },
          ],
          suggestionsLabel: "Compare quotes",
        },
      ],
    },
    {
      id: "escaping-special-characters",
      title: "Escaping Special Characters",
      blocks: [
        {
          type: "paragraph",
          text: "A **backslash** (`\\`) can prevent the next character from being interpreted specially.",
        },
        {
          type: "code",
          code: "echo \\$HOME",
          language: "bash",
          title: "escape the dollar sign",
        },
        {
          type: "paragraph",
          text: "Here `\\$` means “treat `$` as a normal character,” so the shell prints `$HOME` instead of expanding the variable.",
        },
        {
          type: "note",
          text: "You may also see examples like `echo \"Hello\\ World\"`. This lesson focuses on escaping `$` — enough for everyday quoting mistakes without advanced escape rules.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            { command: "echo \\$HOME", label: "echo \\$HOME" },
            { command: 'echo "$HOME"', label: 'echo "$HOME"' },
          ],
          suggestionsLabel: "Try escaping",
        },
      ],
    },
    {
      id: "variables-in-the-shell",
      title: "Variables in the Shell",
      blocks: [
        {
          type: "paragraph",
          text: "You met variables in [Environment Variables](/learn/essentials/environment-variables). Here is the shell side again:",
        },
        {
          type: "code",
          code: 'NAME="Bunsal"\necho "$NAME"',
          language: "bash",
          title: "set and print a variable",
        },
        {
          type: "list",
          items: [
            "Variable names are **case-sensitive** (`NAME` and `name` are different).",
            "Assignments do **not** use spaces around `=` — write `NAME=\"Bunsal\"`, not `NAME = \"Bunsal\"`.",
            "`$NAME` (or `\"$NAME\"`) expands the variable’s value.",
            "**Shell variables** live in the current shell; **exported environment variables** can be inherited by child processes — related, but not identical.",
          ],
        },
        {
          type: "callout",
          title: "Connect the lessons",
          text: "`export` turns a shell variable into part of the environment. This lesson focuses on assignment, expansion, and quoting; the Environment Variables lesson covers `env`, `printenv`, and `export` in more depth.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            { command: 'NAME="Bunsal"', label: 'NAME="Bunsal"' },
            { command: 'echo "$NAME"', label: 'echo "$NAME"' },
            { command: "echo '$NAME'", label: "echo '$NAME'" },
          ],
          suggestionsLabel: "Try variables",
        },
      ],
    },
    {
      id: "command-expansion",
      title: "Command Expansion",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Command substitution",
        },
        {
          type: "paragraph",
          text: "`$(...)` runs a command and substitutes its output into the surrounding command:",
        },
        {
          type: "code",
          code: 'echo "Today is $(date)"',
          language: "bash",
          title: "command substitution",
        },
        {
          type: "paragraph",
          text: "In this learning terminal, `date` returns a **fixed teaching value**. It does not read your computer’s real clock.",
        },
        {
          type: "heading",
          level: 3,
          text: "Tilde expansion",
        },
        {
          type: "paragraph",
          text: "In Bash, `~` commonly represents the current user’s home directory:",
        },
        {
          type: "code",
          code: "cd ~",
          language: "bash",
          title: "tilde expansion",
        },
        {
          type: "note",
          text: "This lesson does not cover advanced parameter expansion or arithmetic expansion — only command substitution and `~` as used above.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            {
              command: 'echo "Today is $(date)"',
              label: 'echo "Today is $(date)"',
            },
            { command: "date", label: "date" },
            { command: "cd ~", label: "cd ~" },
            { command: "pwd", label: "pwd" },
          ],
          suggestionsLabel: "Try expansion",
        },
      ],
    },
    {
      id: "exit-status",
      title: "Exit Status",
      blocks: [
        {
          type: "paragraph",
          text: "Every command returns an **exit status** (also called an exit code):",
        },
        {
          type: "list",
          items: [
            "`0` usually means **success**.",
            "A **nonzero** status usually indicates **failure**.",
          ],
        },
        {
          type: "paragraph",
          text: "`$?` holds the exit status of the most recently executed command:",
        },
        {
          type: "code",
          code: "pwd\necho $?",
          language: "bash",
          title: "check a successful command",
        },
        {
          type: "paragraph",
          text: "A failing command leaves a nonzero status:",
        },
        {
          type: "code",
          code: "ls nonexistent\necho $?",
          language: "bash",
          title: "check a failing command",
        },
        {
          type: "callout",
          title: "Statuses are not identical",
          text: "Different nonzero values can mean different kinds of failure. Do not assume every nonzero status has the same meaning — only that something did not succeed.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            { command: "pwd", label: "pwd" },
            { command: "echo $?", label: "echo $?" },
            { command: "ls nonexistent", label: "ls nonexistent" },
          ],
          suggestionsLabel: "Inspect exit status",
        },
      ],
    },
    {
      id: "combining-commands-with-semicolon",
      title: "Combining Commands with `;`",
      blocks: [
        {
          type: "paragraph",
          text: "You can run commands one after another on separate lines:",
        },
        {
          type: "code",
          code: 'echo "First"\necho "Second"',
          language: "bash",
          title: "two lines",
        },
        {
          type: "paragraph",
          text: "Or on one line with `;`:",
        },
        {
          type: "code",
          code: 'echo "First"; echo "Second"',
          language: "bash",
          title: "semicolon separator",
        },
        {
          type: "paragraph",
          text: "`;` separates commands and runs the next command **regardless** of whether the previous one succeeded.",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            {
              command: 'echo "First"; echo "Second"',
              label: 'echo "First"; echo "Second"',
            },
          ],
          suggestionsLabel: "Try semicolon",
        },
      ],
    },
    {
      id: "conditional-execution-with-and",
      title: "Conditional Execution with `&&`",
      blocks: [
        {
          type: "paragraph",
          text: "The command after `&&` runs **only if** the preceding command succeeds (exit status `0`):",
        },
        {
          type: "code",
          code: "mkdir projects && cd projects",
          language: "bash",
          title: "success then continue",
        },
        {
          type: "paragraph",
          text: "If `mkdir` fails, `cd` is skipped. If `mkdir` succeeds, `cd` runs.",
        },
        {
          type: "code",
          code: 'ls nonexistent && echo "This will not print"',
          language: "bash",
          title: "failure stops the chain",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            {
              command: "mkdir projects && cd projects",
              label: "mkdir projects && cd projects",
            },
            {
              command: 'ls nonexistent && echo "This will not print"',
              label: 'ls nonexistent && echo "..."',
            },
          ],
          suggestionsLabel: "Try &&",
        },
      ],
    },
    {
      id: "conditional-execution-with-or",
      title: "Conditional Execution with `||`",
      blocks: [
        {
          type: "paragraph",
          text: "The command after `||` runs **only if** the preceding command fails (nonzero exit status):",
        },
        {
          type: "code",
          code: 'mkdir projects || echo "Could not create directory"',
          language: "bash",
          title: "failure then fallback",
        },
        {
          type: "paragraph",
          text: "A common teaching pattern with a simulated failure:",
        },
        {
          type: "code",
          code: 'ls nonexistent || echo "Command failed"',
          language: "bash",
          title: "or on failure",
        },
        {
          type: "paragraph",
          text: "Compare the three operators:",
        },
        {
          type: "code",
          code: "&& → run the next command if the previous command succeeds\n|| → run the next command if the previous command fails\n;  → run the next command regardless of the previous status",
          language: "text",
          title: "operator comparison",
        },
        {
          type: "terminal",
          preset: "shell-basics",
          suggestions: [
            {
              command: 'ls nonexistent || echo "Command failed"',
              label: 'ls nonexistent || echo "Command failed"',
            },
            {
              command: 'pwd || echo "Command failed"',
              label: 'pwd || echo "Command failed"',
            },
          ],
          suggestionsLabel: "Try ||",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "shell-basics-practice",
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
          text: "Mistake 1 — Confusing the terminal with the shell",
        },
        {
          type: "paragraph",
          text: "The terminal is the interface. The shell is the interpreter. Mixing them up makes later topics harder to follow.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Adding spaces around `=` in assignments",
        },
        {
          type: "paragraph",
          text: '`NAME = "Bunsal"` is not a valid assignment in Bash. Use `NAME="Bunsal"`.',
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Confusing single quotes with double quotes",
        },
        {
          type: "paragraph",
          text: "`'$HOME'` stays literal. `\"$HOME\"` expands. Pick the quote style that matches your intent.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Forgetting `$` when expanding a variable",
        },
        {
          type: "paragraph",
          text: "`echo NAME` prints the word `NAME`. `echo \"$NAME\"` prints the variable’s value.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Assuming command substitution uses a real computer clock here",
        },
        {
          type: "paragraph",
          text: "In this simulator, `$(date)` uses a fixed teaching value. It does not access your system clock.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 6 — Assuming every nonzero exit status means the same thing",
        },
        {
          type: "paragraph",
          text: "Nonzero usually means failure, but different codes can signal different problems. Treat `$?` as a success/failure signal first.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 7 — Confusing `&&`, `||`, and `;`",
        },
        {
          type: "paragraph",
          text: "`&&` continues on success, `||` on failure, and `;` always. Memorize that trio.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 8 — Assuming the simulator is a real Bash shell",
        },
        {
          type: "paragraph",
          text: "This learning terminal only supports the shell features taught in the curriculum. It never runs a real shell or touches your host filesystem.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should remember this toolbox:",
        },
        {
          type: "code",
          code: "Shell       → interprets commands\n'...'       → literal text in Bash\n\"...\"       → allows variable expansion\n\\           → escapes special characters\n$NAME       → expands a variable\n$(command)  → command substitution\n$?          → previous command's exit status\n;           → run commands sequentially\n&&          → run next command on success\n||          → run next command on failure",
          language: "text",
          title: "quick reference",
        },
        {
          type: "paragraph",
          text: "Mental model:",
        },
        {
          type: "code",
          code: "Read command\n     ↓\nInterpret syntax\n     ↓\nExpand variables and substitutions\n     ↓\nExecute simulated command\n     ↓\nSet exit status\n     ↓\nContinue according to ;, &&, or ||",
          language: "text",
          title: "remember",
        },
        {
          type: "table",
          caption: "Shell basics quick reference",
          headers: ["Feature", "Purpose"],
          rows: [
            ["Shell", "Interprets commands typed in a terminal"],
            ["`'...'`", "Literal text — no variable expansion"],
            ['`"..."`', "Quoted text that still expands variables"],
            ["`\\`", "Escape the next special character"],
            ["`$NAME`", "Expand a shell variable"],
            ["`$(command)`", "Substitute a command’s output"],
            ["`$?`", "Previous command’s exit status"],
            ["`;`", "Run the next command always"],
            ["`&&`", "Run the next command on success"],
            ["`||`", "Run the next command on failure"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
