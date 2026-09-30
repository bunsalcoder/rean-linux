import type { Lesson } from "@/types/lesson";

export const bashScriptingLesson = {
  slug: "bash-scripting",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "30–35 min read",
  title: "Introduction to Bash Scripting",
  description:
    "Learn how to automate repetitive tasks with Bash scripts using variables, command sequences, conditions, and loops.",
  seoTitle: "Introduction to Bash Scripting — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Bash scripting basics: shebang, variables, simulated read, if/else, for and while loops, and a safe in-browser script simulator.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Introduction to Bash Scripting" },
  ],
  navigation: {
    previous: {
      label: "Shell Basics",
      href: "/learn/essentials/shell-basics",
    },
    next: {
      label: "Linux Essentials Challenge",
      href: "/learn/essentials/linux-essentials-challenge",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Shell Basics](/learn/essentials/shell-basics) you learned how the shell interprets a single line. Now you will package commands into **scripts** — reusable text files the shell can run in order.",
    },
  ],
  sections: [
    {
      id: "what-is-a-bash-script",
      title: "What Is a Bash Script?",
      blocks: [
        {
          type: "paragraph",
          text: "A **Bash script** is a text file that contains shell commands. Instead of typing the same sequence again and again, you save it once and reuse it.",
        },
        {
          type: "list",
          items: [
            "Scripts organize multiple commands into a reusable workflow.",
            "Scripts can automate repetitive tasks.",
            "Bash is an interpreter that reads and executes supported shell instructions.",
          ],
        },
        {
          type: "code",
          code: '#!/bin/bash\n\necho "Hello, Linux!"\necho "Welcome to Bash scripting."',
          language: "bash",
          title: "hello example",
        },
        {
          type: "paragraph",
          text: "The first line, `#!/bin/bash`, is called a **shebang**. It identifies which interpreter should run the script when it is launched through a compatible mechanism.",
        },
        {
          type: "callout",
          title: "Teaching simulator only",
          text: "This lesson’s terminal only interprets a **small, safe teaching subset**. It never runs a real Bash process or touches your host filesystem.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > hello.sh <<\'EOF\'\n#!/bin/bash\necho "Hello, Linux!"\necho "Welcome to Bash scripting."\nEOF',
              label: "create hello.sh",
            },
            { command: "bash hello.sh", label: "bash hello.sh" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try a first script",
        },
      ],
    },
    {
      id: "creating-your-first-script",
      title: "Creating Your First Script",
      blocks: [
        {
          type: "paragraph",
          text: "Start with a script named `hello.sh`:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\necho "Hello, Linux!"',
          language: "bash",
          title: "hello.sh",
        },
        {
          type: "paragraph",
          text: "A script is a regular text file containing commands. On a real system the typical workflow looks like this:",
        },
        {
          type: "code",
          code: "nano hello.sh\nchmod +x hello.sh\n./hello.sh",
          language: "bash",
          title: "typical workflow",
        },
        {
          type: "definitions",
          items: [
            {
              term: "nano",
              description: "Opens a text editor so you can write the script.",
            },
            {
              term: "chmod +x",
              description: "Adds execute permission to the file.",
            },
            {
              term: "./hello.sh",
              description: "Runs the script from the current directory.",
            },
          ],
        },
        {
          type: "note",
          text: "In this simulator, `nano` is a simple line-by-line teaching editor, and `./hello.sh` only works after simulated `chmod +x`. Prefer `bash hello.sh` when you want to run a script without execute permission. The simulator never launches a real executable.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            { command: "nano hello.sh", label: "nano hello.sh" },
            {
              command: "#!/bin/bash",
              label: "type shebang (in nano)",
            },
            {
              command: 'echo "Hello, Linux!"',
              label: "type echo line (in nano)",
            },
            { command: ":wq", label: ":wq" },
            { command: "chmod +x hello.sh", label: "chmod +x hello.sh" },
            { command: "./hello.sh", label: "./hello.sh" },
          ],
          suggestionsLabel: "Try nano → chmod → ./hello.sh",
        },
      ],
    },
    {
      id: "understanding-the-shebang",
      title: "Understanding the Shebang",
      blocks: [
        {
          type: "code",
          code: "#!/bin/bash",
          language: "bash",
          title: "shebang",
        },
        {
          type: "definitions",
          items: [
            {
              term: "#!",
              description: "The shebang marker at the start of the line.",
            },
            {
              term: "/bin/bash",
              description: "The path that identifies the Bash interpreter.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Conventionally, the shebang is the **first line** of an executable script. Keep that habit — it makes scripts easier to share and run on real Linux systems later.",
        },
        {
          type: "callout",
          title: "Beginner tip",
          text: "Think of the shebang as a label that says: “when this file is run as a program, use Bash to read it.”",
        },
      ],
    },
    {
      id: "variables-in-scripts",
      title: "Variables in Scripts",
      blocks: [
        {
          type: "paragraph",
          text: "Variables store values you can reuse. This connects to [Environment Variables](/learn/essentials/environment-variables) and [Shell Basics](/learn/essentials/shell-basics).",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\nNAME="Bunsal"\necho "Hello, $NAME!"',
          language: "bash",
          title: "variable example",
        },
        {
          type: "list",
          items: [
            "Variables store values for later use.",
            "Variable names are **case-sensitive** (`NAME` and `name` are different).",
            "Do **not** put spaces around `=` in assignments.",
            "`$NAME` expands the variable to its value.",
          ],
        },
        {
          type: "code",
          code: 'CITY="Phnom Penh"\necho "Welcome to $CITY"',
          language: "bash",
          title: "another example",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > greeting.sh <<\'EOF\'\n#!/bin/bash\nNAME="Bunsal"\necho "Hello, $NAME!"\nEOF',
              label: "create greeting.sh",
            },
            { command: "bash greeting.sh", label: "bash greeting.sh" },
            { command: 'NAME="Bunsal"', label: 'NAME="Bunsal"' },
            {
              command: 'echo "Hello, $NAME!"',
              label: 'echo "Hello, $NAME!"',
            },
          ],
          suggestionsLabel: "Try variables",
        },
      ],
    },
    {
      id: "reading-user-input-with-read",
      title: "Reading User Input with `read`",
      blocks: [
        {
          type: "paragraph",
          text: "`read` obtains input and stores it in a variable:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\necho "What is your name?"\nread NAME\necho "Hello, $NAME!"',
          language: "bash",
          title: "read example",
        },
        {
          type: "paragraph",
          text: "In this simulator, `read` uses a **predefined teaching input** (`Alice`) instead of asking your real terminal or operating system for input.",
        },
        {
          type: "note",
          text: "Do not collect passwords or other sensitive information in learning scripts. This simulator never asks for real secrets.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > read-name.sh <<\'EOF\'\n#!/bin/bash\necho "What is your name?"\nread NAME\necho "Hello, $NAME!"\nEOF',
              label: "create read-name.sh",
            },
            { command: "bash read-name.sh", label: "bash read-name.sh" },
            { command: "read NAME", label: "read NAME" },
            {
              command: 'echo "Hello, $NAME!"',
              label: 'echo "Hello, $NAME!"',
            },
          ],
          suggestionsLabel: "Try simulated read",
        },
      ],
    },
    {
      id: "command-sequences",
      title: "Command Sequences",
      blocks: [
        {
          type: "paragraph",
          text: "Scripts normally execute commands **in order**, from top to bottom — the same idea as sequential commands in [Shell Basics](/learn/essentials/shell-basics).",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\necho "Starting task..."\npwd\necho "Task completed."',
          language: "bash",
          title: "sequence example",
        },
        {
          type: "paragraph",
          text: "Control-flow syntax (`if`, loops) can change that order. Until then, treat a script as a checklist that runs line by line.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > sequence.sh <<\'EOF\'\n#!/bin/bash\necho "Starting task..."\npwd\necho "Task completed."\nEOF',
              label: "create sequence.sh",
            },
            { command: "bash sequence.sh", label: "bash sequence.sh" },
          ],
          suggestionsLabel: "Try a sequence",
        },
      ],
    },
    {
      id: "conditional-statements-with-if",
      title: "Conditional Statements with `if`",
      blocks: [
        {
          type: "paragraph",
          text: "Use `if` to run commands only when a condition is true. Start with a simple string comparison:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\nSTATUS="success"\n\nif [ "$STATUS" = "success" ]; then\n  echo "Task completed."\nfi',
          language: "bash",
          title: "if example",
        },
        {
          type: "definitions",
          items: [
            {
              term: "if",
              description: "Begins a conditional.",
            },
            {
              term: "[ ... ]",
              description: "Performs a test in Bash.",
            },
            {
              term: "then",
              description: "Begins the commands for the true branch.",
            },
            {
              term: "fi",
              description: "Closes the conditional (`if` spelled backwards).",
            },
          ],
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > status.sh <<\'EOF\'\n#!/bin/bash\nSTATUS="success"\nif [ "$STATUS" = "success" ]; then\n  echo "Task completed."\nfi\nEOF',
              label: "create status.sh",
            },
            { command: "bash status.sh", label: "bash status.sh" },
          ],
          suggestionsLabel: "Try if",
        },
      ],
    },
    {
      id: "adding-an-else-branch",
      title: "Adding an `else` Branch",
      blocks: [
        {
          type: "paragraph",
          text: "`else` runs when the condition is **false**:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\nSTATUS="failed"\n\nif [ "$STATUS" = "success" ]; then\n  echo "Task completed."\nelse\n  echo "Task failed."\nfi',
          language: "bash",
          title: "if / else example",
        },
        {
          type: "paragraph",
          text: "Change `STATUS` between `success` and `failed` to see both branches.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > status.sh <<\'EOF\'\n#!/bin/bash\nSTATUS="failed"\nif [ "$STATUS" = "success" ]; then\n  echo "Task completed."\nelse\n  echo "Task failed."\nfi\nEOF',
              label: "create status.sh with else",
            },
            { command: "bash status.sh", label: "bash status.sh" },
          ],
          suggestionsLabel: "Try else",
        },
      ],
    },
    {
      id: "repeating-tasks-with-a-for-loop",
      title: "Repeating Tasks with a `for` Loop",
      blocks: [
        {
          type: "paragraph",
          text: "A `for` loop repeats a body once for each value in a list:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\nfor NAME in Alice Bob Charlie\ndo\n  echo "Hello, $NAME"\ndone',
          language: "bash",
          title: "for example",
        },
        {
          type: "definitions",
          items: [
            {
              term: "for",
              description: "Iterates over a list of values.",
            },
            {
              term: "Loop variable",
              description: "Receives each value in turn (here, `NAME`).",
            },
            {
              term: "do",
              description: "Begins the loop body.",
            },
            {
              term: "done",
              description: "Closes the loop.",
            },
          ],
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                "cat > greet-all.sh <<'EOF'\n#!/bin/bash\nfor NAME in Alice Bob Charlie\ndo\n  echo \"Hello, $NAME\"\ndone\nEOF",
              label: "create greet-all.sh",
            },
            { command: "bash greet-all.sh", label: "bash greet-all.sh" },
          ],
          suggestionsLabel: "Try for",
        },
      ],
    },
    {
      id: "repeating-tasks-with-a-while-loop",
      title: "Repeating Tasks with a `while` Loop",
      blocks: [
        {
          type: "paragraph",
          text: "A `while` loop repeats **while** a condition stays true:",
        },
        {
          type: "code",
          code: '#!/bin/bash\n\nCOUNT=1\n\nwhile [ "$COUNT" -le 3 ]\ndo\n  echo "Count: $COUNT"\n  COUNT=$((COUNT + 1))\ndone',
          language: "bash",
          title: "while example",
        },
        {
          type: "list",
          items: [
            "`while` repeats while the condition is true.",
            "The loop condition must eventually become false to avoid an infinite loop.",
            "`COUNT=$((COUNT + 1))` performs arithmetic expansion (simple increment only in this lesson).",
          ],
        },
        {
          type: "callout",
          title: "Safety limit",
          text: "This simulator stops scripts after a fixed iteration limit so a mistaken infinite loop cannot freeze the page.",
        },
        {
          type: "terminal",
          preset: "bash-scripting",
          suggestions: [
            {
              command:
                'cat > count.sh <<\'EOF\'\n#!/bin/bash\nCOUNT=1\nwhile [ "$COUNT" -le 3 ]\ndo\n  echo "Count: $COUNT"\n  COUNT=$((COUNT + 1))\ndone\nEOF',
              label: "create count.sh",
            },
            { command: "bash count.sh", label: "bash count.sh" },
          ],
          suggestionsLabel: "Try while",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "bash-scripting-practice",
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
          text: "Mistake 1 — Forgetting the shebang",
        },
        {
          type: "paragraph",
          text: "Scripts without `#!/bin/bash` are harder to run as programs later. Put the shebang on the first line.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Spaces around `=` in assignments",
        },
        {
          type: "paragraph",
          text: '`NAME = "Bunsal"` is invalid. Use `NAME="Bunsal"`.',
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Forgetting `$` when expanding variables",
        },
        {
          type: "paragraph",
          text: '`echo NAME` prints the word `NAME`. `echo "$NAME"` prints the value.',
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Forgetting `then` or `fi`",
        },
        {
          type: "paragraph",
          text: "Every `if` needs `then` and a closing `fi`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Forgetting `do` or `done`",
        },
        {
          type: "paragraph",
          text: "Every `for` or `while` needs `do` and a closing `done`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 6 — Writing a `while` loop that never terminates",
        },
        {
          type: "paragraph",
          text: "Always change something the condition depends on — for example, increment `COUNT`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 7 — Confusing a script file with a real executable",
        },
        {
          type: "paragraph",
          text: "A `.sh` file is text. Execute permission and an interpreter make it runnable — it is not a compiled binary.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 8 — Assuming the simulator executes actual Bash scripts",
        },
        {
          type: "paragraph",
          text: "This learning terminal only supports the teaching subset. It never runs real Bash or accesses your computer’s filesystem.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 9 — Storing sensitive information directly in scripts",
        },
        {
          type: "paragraph",
          text: "Do not put passwords, tokens, or private data into scripts — especially in examples you share or commit.",
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
          code: '#!/bin/bash  → identify the interpreter\nNAME="value" → assign a variable\n$NAME        → expand a variable\nread         → read simulated input\nif           → make a decision\nelse         → handle the alternative\nfor          → repeat over a list\nwhile        → repeat while a condition is true\ndo / done    → mark a loop body',
          language: "text",
          title: "quick reference",
        },
        {
          type: "paragraph",
          text: "Mental model:",
        },
        {
          type: "code",
          code: "Write script\n     ↓\nRead commands\n     ↓\nSet variables\n     ↓\nEvaluate conditions\n     ↓\nRepeat tasks when needed\n     ↓\nFinish the workflow",
          language: "text",
          title: "remember",
        },
        {
          type: "table",
          caption: "Bash scripting quick reference",
          headers: ["Feature", "Purpose"],
          rows: [
            ["`#!/bin/bash`", "Identify the Bash interpreter"],
            ['`NAME="value"`', "Assign a variable"],
            ["`$NAME`", "Expand a variable"],
            ["`read`", "Read simulated input into a variable"],
            ["`if` / `else` / `fi`", "Choose a branch"],
            ["`for` / `do` / `done`", "Repeat over a list"],
            ["`while` / `do` / `done`", "Repeat while a condition is true"],
            ["`bash file.sh`", "Run a simulated script file"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
