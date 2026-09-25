import type { Lesson } from "@/types/lesson";

export const pipesAndRedirectionLesson = {
  slug: "pipes-and-redirection",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Pipes and Redirection",
  description:
    "Learn how to connect commands with pipes and control where command input and output go.",
  seoTitle: "Pipes and Redirection — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux pipes and redirection: stdin, stdout, stderr, >, >>, <, |, 2>, and 2>&1 with a safe in-browser terminal simulator.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Pipes and Redirection" },
  ],
  navigation: {
    previous: {
      label: "Environment Variables",
      href: "/learn/essentials/environment-variables",
    },
    next: {
      label: "Searching and Finding Files",
      href: "/learn/essentials/searching-and-finding-files",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Environment Variables](/learn/essentials/environment-variables) you learned how processes receive configuration. Now you will learn how commands **share data** — sending output into files, reading input from files, and connecting commands with pipes.",
    },
  ],
  sections: [
    {
      id: "command-input-and-output",
      title: "Command Input and Output",
      blocks: [
        {
          type: "paragraph",
          text: "Most Linux commands work with three simple ideas:",
        },
        {
          type: "list",
          items: [
            "They can **receive input**",
            "They can produce **normal output**",
            "They may produce **error output**",
          ],
        },
        {
          type: "paragraph",
          text: "By default, input often comes from the keyboard (or from another command), and output appears in the terminal. Linux also provides **standard streams** so you can redirect where that input and output go.",
        },
        {
          type: "callout",
          title: "Beginner mental model",
          text: "Think of a command as a small machine: data can go **in**, useful results come **out**, and problems are reported on a separate error channel.",
        },
      ],
    },
    {
      id: "standard-input-output-and-error",
      title: "Standard Input, Output, and Error",
      blocks: [
        {
          type: "paragraph",
          text: "Linux names three standard streams and gives each a file descriptor number:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "stdin (0)",
              description:
                "Standard input — where a command normally receives input.",
            },
            {
              term: "stdout (1)",
              description:
                "Standard output — normal command output you usually see in the terminal.",
            },
            {
              term: "stderr (2)",
              description:
                "Standard error — error messages and diagnostics, kept separate from normal output.",
            },
          ],
        },
        {
          type: "code",
          code: "stdin  → file descriptor 0\nstdout → file descriptor 1\nstderr → file descriptor 2",
          language: "text",
          title: "standard streams",
        },
        {
          type: "note",
          text: "You do not need advanced file-descriptor management for this lesson. Remember the three streams and their numbers — especially `2` for errors.",
        },
      ],
    },
    {
      id: "output-redirection",
      title: "Output Redirection `>`",
      blocks: [
        {
          type: "paragraph",
          text: "The `>` operator sends **stdout** into a file:",
        },
        {
          type: "code",
          code: 'echo "hello" > notes.txt',
          language: "bash",
          title: "overwrite stdout",
        },
        {
          type: "paragraph",
          text: "Important: `>` **overwrites** the existing file contents. If the file already had text, that text is replaced.",
        },
        {
          type: "code",
          code: 'echo "hello" > notes.txt\ncat notes.txt\n\necho "new content" > notes.txt\ncat notes.txt',
          language: "bash",
          title: "overwrite demonstration",
        },
        {
          type: "paragraph",
          text: "After the second `echo ... > notes.txt`, `cat` shows only `new content` — the earlier `hello` is gone.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: 'echo "hello" > notes.txt',
              label: 'echo "hello" > notes.txt',
            },
            { command: "cat notes.txt", label: "cat notes.txt" },
            {
              command: 'echo "new content" > notes.txt',
              label: 'echo "new content" > notes.txt',
            },
            { command: "cat notes.txt", label: "cat again" },
          ],
          suggestionsLabel: "Try overwrite with >",
        },
      ],
    },
    {
      id: "append-output",
      title: "Append Output `>>`",
      blocks: [
        {
          type: "paragraph",
          text: "Use `>>` when you want to **add** to a file instead of replacing it:",
        },
        {
          type: "code",
          code: 'echo "hello" > notes.txt\necho "another line" >> notes.txt\ncat notes.txt',
          language: "bash",
          title: "append demonstration",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "`>` replaces",
              blocks: [
                {
                  type: "paragraph",
                  text: "Sends stdout to a file and **overwrites** whatever was there.",
                },
              ],
            },
            {
              title: "`>>` appends",
              blocks: [
                {
                  type: "paragraph",
                  text: "Sends stdout to a file and **adds** to the end of existing content.",
                },
              ],
            },
          ],
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: 'echo "hello" > notes.txt',
              label: 'echo "hello" > notes.txt',
            },
            {
              command: 'echo "another line" >> notes.txt',
              label: 'echo "another line" >> notes.txt',
            },
            { command: "cat notes.txt", label: "cat notes.txt" },
          ],
          suggestionsLabel: "Try append with >>",
        },
      ],
    },
    {
      id: "input-redirection",
      title: "Input Redirection `<`",
      blocks: [
        {
          type: "paragraph",
          text: "The `<` operator connects a file to **stdin**:",
        },
        {
          type: "code",
          code: "cat < notes.txt",
          language: "bash",
          title: "stdin from file",
        },
        {
          type: "paragraph",
          text: "Compare these two forms:",
        },
        {
          type: "code",
          code: "cat notes.txt\ncat < notes.txt",
          language: "bash",
          title: "filename vs stdin",
        },
        {
          type: "list",
          items: [
            "`cat notes.txt` — the shell passes `notes.txt` as a **filename argument**; `cat` opens that file itself",
            "`cat < notes.txt` — the shell opens the file and feeds it to `cat` as **stdin**",
          ],
        },
        {
          type: "note",
          text: "For `cat`, the visible result is often the same. They are not universally identical for every command — some programs treat filename arguments and stdin differently. Focus on what the shell is doing with stdin.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: 'echo "hello from stdin" > notes.txt',
              label: "create notes.txt",
            },
            { command: "cat notes.txt", label: "cat notes.txt" },
            { command: "cat < notes.txt", label: "cat < notes.txt" },
          ],
          suggestionsLabel: "Compare cat forms",
        },
      ],
    },
    {
      id: "pipes",
      title: "Pipes `|`",
      blocks: [
        {
          type: "paragraph",
          text: "A **pipe** connects commands so the stdout of one becomes the stdin of the next:",
        },
        {
          type: "code",
          code: "command1 | command2",
          language: "bash",
          title: "pipe pattern",
        },
        {
          type: "callout",
          title: "Key idea",
          text: "The stdout of the first command becomes the stdin of the second command.",
        },
        {
          type: "paragraph",
          text: "Example — list files and keep only names containing `txt`:",
        },
        {
          type: "code",
          code: "ls | grep txt",
          language: "bash",
          title: "pipe example",
        },
        {
          type: "paragraph",
          text: "Another example — search simulated account data:",
        },
        {
          type: "code",
          code: "cat /etc/passwd | grep bunsal",
          language: "bash",
          title: "pipe through grep",
        },
        {
          type: "paragraph",
          text: "Visual flow:",
        },
        {
          type: "code",
          code: "ls\n ↓ stdout\npipe\n ↓ stdin\ngrep txt\n ↓\nmatching output",
          language: "text",
          title: "pipeline flow",
        },
        {
          type: "paragraph",
          text: "Pipelines let you combine small commands into useful workflows without writing temporary files for every step.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            { command: "ls", label: "ls" },
            { command: "ls | grep txt", label: "ls | grep txt" },
            {
              command: "cat /etc/passwd | grep bunsal",
              label: "cat /etc/passwd | grep bunsal",
            },
          ],
          suggestionsLabel: "Try pipes",
        },
      ],
    },
    {
      id: "combining-pipes-and-redirection",
      title: "Combining Pipes and Redirection",
      blocks: [
        {
          type: "paragraph",
          text: "You can pipe commands and then save the final stdout to a file:",
        },
        {
          type: "code",
          code: "ls | grep txt > files.txt",
          language: "bash",
          title: "pipe then redirect",
        },
        {
          type: "paragraph",
          text: "Flow:",
        },
        {
          type: "code",
          code: "ls\n ↓\ngrep txt\n ↓\nfiles.txt",
          language: "text",
          title: "combined flow",
        },
        {
          type: "paragraph",
          text: "Another example:",
        },
        {
          type: "code",
          code: "cat /etc/passwd | grep bunsal > user.txt",
          language: "bash",
          title: "search then save",
        },
        {
          type: "paragraph",
          text: "Pipes move data between commands; redirection decides where the final result lands. Keep the pieces simple while you learn.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: "ls | grep txt > files.txt",
              label: "ls | grep txt > files.txt",
            },
            { command: "cat files.txt", label: "cat files.txt" },
            {
              command: "cat /etc/passwd | grep bunsal > user.txt",
              label: "… | grep bunsal > user.txt",
            },
            { command: "cat user.txt", label: "cat user.txt" },
          ],
          suggestionsLabel: "Combine pipe and >",
        },
      ],
    },
    {
      id: "redirecting-errors",
      title: "Redirecting Errors `2>`",
      blocks: [
        {
          type: "paragraph",
          text: "Normal output and error output are separate streams. To redirect **stderr**, use `2>`:",
        },
        {
          type: "code",
          code: "ls nonexistent 2> errors.txt",
          language: "bash",
          title: "stderr redirect",
        },
        {
          type: "list",
          items: [
            "`2` refers to stderr (file descriptor 2)",
            "`>` redirects output",
            "therefore `2>` redirects stderr",
          ],
        },
        {
          type: "paragraph",
          text: "Then inspect the file:",
        },
        {
          type: "code",
          code: "cat errors.txt",
          language: "bash",
          title: "read captured error",
        },
        {
          type: "paragraph",
          text: "Without `2>`, the error would appear in the terminal. With `2>`, it is stored in `errors.txt` instead.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: "ls nonexistent 2> errors.txt",
              label: "ls nonexistent 2> errors.txt",
            },
            { command: "cat errors.txt", label: "cat errors.txt" },
            {
              command: "ls nonexistent",
              label: "ls nonexistent (no redirect)",
            },
          ],
          suggestionsLabel: "Capture stderr",
        },
      ],
    },
    {
      id: "redirecting-stdout-and-stderr",
      title: "Redirecting stdout and stderr `2>&1`",
      blocks: [
        {
          type: "paragraph",
          text: "Sometimes you want **both** normal output and errors in the same place:",
        },
        {
          type: "code",
          code: "command > output.txt 2>&1",
          language: "bash",
          title: "merge stderr into stdout destination",
        },
        {
          type: "list",
          items: [
            "`>` sends stdout to `output.txt`",
            "`2>&1` sends stderr to the **same destination** as stdout",
          ],
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "ls > output.txt 2>&1",
          language: "bash",
          title: "both streams to one file",
        },
        {
          type: "paragraph",
          text: "Redirection **order matters**. Write the stdout redirect first, then `2>&1`, so stderr follows stdout to the file. Unusual edge cases exist in full shells — for this lesson, remember that pattern.",
        },
        {
          type: "note",
          text: "This lesson does not cover advanced syntax such as `|&`. Stick with `> file 2>&1` for now.",
        },
        {
          type: "terminal",
          preset: "pipes-and-redirection",
          suggestions: [
            {
              command: "ls nonexistent > output.txt 2>&1",
              label: "ls nonexistent > output.txt 2>&1",
            },
            { command: "cat output.txt", label: "cat output.txt" },
            {
              command: "ls nonexistent > output.txt 2> errors.txt",
              label: "split stdout / stderr",
            },
          ],
          suggestionsLabel: "Try 2>&1",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "pipes-and-redirection-practice",
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
          text: "Mistake 1 — Confusing `>` with `>>`",
        },
        {
          type: "paragraph",
          text: "`>` replaces the file. `>>` appends. Using the wrong one can wipe content you meant to keep.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Forgetting that `>` overwrites",
        },
        {
          type: "paragraph",
          text: "Running `echo \"new\" > notes.txt` a second time does not add a line — it starts the file over.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Thinking `|` writes to a file",
        },
        {
          type: "paragraph",
          text: "A pipe connects commands. To save output, combine a pipe with redirection, such as `ls | grep txt > files.txt`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Confusing stdout with stderr",
        },
        {
          type: "paragraph",
          text: "Normal results use stdout (`1`). Errors use stderr (`2`). Redirecting only `>` does not capture stderr.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Forgetting the `2` in `2>`",
        },
        {
          type: "paragraph",
          text: "`> errors.txt` redirects stdout. `2> errors.txt` redirects stderr.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 6 — Misunderstanding `2>&1`",
        },
        {
          type: "paragraph",
          text: "`2>&1` means “send stderr where stdout is currently going,” not “create a second numbered file.”",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 7 — Assuming the simulator is a real Linux shell",
        },
        {
          type: "paragraph",
          text: "This learning terminal only implements the commands and syntax needed for the lesson. It is not a full Bash environment.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 8 — Expecting redirection to affect the real computer",
        },
        {
          type: "paragraph",
          text: "Files created here exist only in the in-memory simulator. Nothing is written to your real disk.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now know the core streams and operators:",
        },
        {
          type: "list",
          items: [
            "stdin = input",
            "stdout = normal output",
            "stderr = error output",
            "`>` = overwrite output file",
            "`>>` = append output",
            "`<` = use file as stdin",
            "`|` = connect stdout to another command’s stdin",
            "`2>` = redirect stderr",
            "`2>&1` = send stderr to the same destination as stdout",
          ],
        },
        {
          type: "paragraph",
          text: "Key mental model:",
        },
        {
          type: "code",
          code: "command → stdout → file\ncommand → stdout → pipe → command\ncommand → stderr → error file\nfile → stdin → command",
          language: "text",
          title: "remember",
        },
        {
          type: "table",
          caption: "Operator reference for pipes and redirection",
          headers: ["Operator", "Purpose"],
          rows: [
            ["`>`", "Overwrite a file with stdout"],
            ["`>>`", "Append stdout to a file"],
            ["`<`", "Feed a file into stdin"],
            ["`|`", "Pipe stdout into the next command"],
            ["`2>`", "Redirect stderr to a file"],
            ["`2>&1`", "Send stderr to stdout’s destination"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
