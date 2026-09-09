import type { Lesson } from "@/types/lesson";

export const firstCommandsLesson = {
  slug: "first-commands",
  level: "beginner",
  levelNumber: "05",
  difficulty: "Beginner",
  readingTime: "15 min read",
  title: "Your First Linux Commands",
  description:
    "Start working with files and directories using the commands you'll use every day.",
  seoTitle: "Your First Linux Commands | Rean Linux",
  seoDescription:
    "Learn essential beginner Linux commands: pwd, ls, cd, mkdir, touch, cat, cp, mv, and rm — with a safe simulated terminal for hands-on practice.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Your First Linux Commands" },
  ],
  navigation: {
    previous: {
      label: "The Linux Terminal",
      href: "/learn/beginner/terminal",
    },
    next: {
      label: "Understanding the Linux Filesystem",
      href: "/learn/beginner/filesystem",
    },
  },
  sections: [
    {
      id: "meet-the-command-line",
      title: "Meet the Command Line",
      blocks: [
        {
          type: "paragraph",
          text: "Most Linux commands follow a simple pattern. You already saw this in the terminal lesson — here is a quick refresher before you start typing real file commands.",
        },
        {
          type: "code",
          code: "command [options] [arguments]",
          language: "text",
          title: "structure",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "ls -la",
          language: "bash",
          title: "bash",
        },
        {
          type: "list",
          items: [
            "`ls` → the command",
            "`-la` → options that change how the command behaves",
            "No argument in this example — it lists the current directory",
          ],
        },
        {
          type: "callout",
          title: "Tip",
          text: "Linux becomes much easier when you practice commands instead of only reading about them.",
        },
      ],
    },
    {
      id: "where-am-i",
      title: "Where Am I?",
      blocks: [
        {
          type: "paragraph",
          text: "Before you change anything, find out where you are. The `pwd` command prints the current working directory.",
        },
        {
          type: "code",
          code: "pwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "A typical home directory looks like this:",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "Think of it as asking the shell: “Where am I right now?”",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [{ command: "pwd", label: "Run pwd" }],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "list-files",
      title: "List Files",
      blocks: [
        {
          type: "paragraph",
          text: "Once you know where you are, list what is nearby with `ls`.",
        },
        {
          type: "code",
          code: "ls",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "By itself, `ls` shows the names of files and directories in the current location.",
        },
        {
          type: "paragraph",
          text: "Options can change the output. A common beginner variant is:",
        },
        {
          type: "code",
          code: "ls -la",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "The `-la` options ask for a longer listing that includes hidden entries and extra details. You do not need every `ls` option yet — just remember that options modify command behavior.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            { command: "ls", label: "Run ls" },
            { command: "ls -la", label: "Run ls -la" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "move-around",
      title: "Move Around",
      blocks: [
        {
          type: "paragraph",
          text: "Use `cd` to change directories.",
        },
        {
          type: "code",
          code: "cd Documents",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "cd ..",
          language: "bash",
          title: "bash",
        },
        {
          type: "list",
          items: [
            "`cd Documents` → enter a directory",
            "`cd ..` → move to the parent directory",
            "`cd ~` → move to the user's home directory",
          ],
        },
        {
          type: "paragraph",
          text: "After each `cd`, run `pwd` or `ls` to confirm where you landed.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            { command: "cd Documents", label: "Run cd Documents" },
            { command: "pwd", label: "Run pwd" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd ~", label: "Run cd ~" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "create-a-directory",
      title: "Create a Directory",
      blocks: [
        {
          type: "paragraph",
          text: "Create a new directory with `mkdir`.",
        },
        {
          type: "code",
          code: "mkdir projects",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "After you create it, `ls` should show the new folder alongside the others.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            { command: "mkdir projects", label: "Run mkdir projects" },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "create-a-file",
      title: "Create a File",
      blocks: [
        {
          type: "paragraph",
          text: "Create an empty file with `touch`.",
        },
        {
          type: "code",
          code: "touch notes.txt",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Then list the directory again. You should see `notes.txt` in the output.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          includeNotes: false,
          suggestions: [
            { command: "touch notes.txt", label: "Run touch notes.txt" },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "read-a-file",
      title: "Read a File",
      blocks: [
        {
          type: "paragraph",
          text: "Display a file's contents with `cat`.",
        },
        {
          type: "code",
          code: "cat notes.txt",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "This simulator already includes a small `notes.txt` file with content so you can practice reading it:",
        },
        {
          type: "code",
          code: "notes.txt\n\nHello from Rean Linux.",
          language: "text",
          title: "file",
        },
        {
          type: "paragraph",
          text: "Running `cat notes.txt` should print:",
        },
        {
          type: "code",
          code: "Hello from Rean Linux.",
          language: "text",
          title: "output",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            { command: "cat notes.txt", label: "Run cat notes.txt" },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "copy-and-move-files",
      title: "Copy and Move Files",
      blocks: [
        {
          type: "paragraph",
          text: "Copy a file with `cp`:",
        },
        {
          type: "code",
          code: "cp notes.txt backup.txt",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "That leaves the original in place and creates a second file named `backup.txt`.",
        },
        {
          type: "paragraph",
          text: "Rename or move a file with `mv`:",
        },
        {
          type: "code",
          code: "mv backup.txt backup-notes.txt",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "After that command, `backup.txt` is gone and `backup-notes.txt` appears instead. Same file contents — new name.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            {
              command: "cp notes.txt backup.txt",
              label: "Run cp notes.txt backup.txt",
            },
            {
              command: "mv backup.txt backup-notes.txt",
              label: "Run mv backup.txt backup-notes.txt",
            },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "remove-files",
      title: "Remove Files",
      blocks: [
        {
          type: "paragraph",
          text: "Remove a file with `rm`:",
        },
        {
          type: "code",
          code: "rm backup-notes.txt",
          language: "bash",
          title: "bash",
        },
        {
          type: "callout",
          title: "Be careful with rm",
          text: "Unlike moving a file to a graphical trash folder, `rm` normally removes the file directly. Always make sure you are removing the correct file.",
        },
        {
          type: "callout",
          title: "Warning",
          text: "Be careful with commands that modify or remove files. Double-check the path before running them.",
        },
        {
          type: "terminal",
          preset: "learner-home",
          suggestions: [
            {
              command: "cp notes.txt backup-notes.txt",
              label: "Run cp notes.txt backup-notes.txt",
            },
            {
              command: "rm backup-notes.txt",
              label: "Run rm backup-notes.txt",
            },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "first-commands-practice",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "In this lesson, you practiced the everyday file commands:",
        },
        {
          type: "table",
          caption: "Command reference for first Linux commands",
          headers: ["Command", "What it does"],
          rows: [
            ["`pwd`", "Show current directory"],
            ["`ls`", "List files and directories"],
            ["`cd`", "Change directory"],
            ["`mkdir`", "Create directory"],
            ["`touch`", "Create an empty file"],
            ["`cat`", "Display file contents"],
            ["`cp`", "Copy files"],
            ["`mv`", "Move or rename files"],
            ["`rm`", "Remove files"],
          ],
        },
        {
          type: "paragraph",
          text: "Next, you will learn how Linux organizes the filesystem — why paths like `/home` and `/etc` matter.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
