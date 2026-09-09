import type { Lesson } from "@/types/lesson";

export const terminalLesson = {
  slug: "terminal",
  level: "beginner",
  levelNumber: "04",
  difficulty: "Beginner",
  readingTime: "10 min read",
  title: "The Linux Terminal",
  description:
    "Learn what the terminal is, why Linux users rely on it, and how to start thinking in commands.",
  seoTitle: "The Linux Terminal | Rean Linux",
  seoDescription:
    "Learn what the Linux terminal is, how it differs from the shell, why command lines matter, and how beginners can start using basic commands safely.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "The Linux Terminal" },
  ],
  navigation: {
    previous: {
      label: "Installing Linux",
      href: "/learn/beginner/installing-linux",
    },
    next: {
      label: "Your First Linux Commands",
      href: "/learn/beginner/first-commands",
    },
  },
  sections: [
    {
      id: "what-is-a-terminal",
      title: "What Is a Terminal?",
      blocks: [
        {
          type: "paragraph",
          text: "A **terminal** is a text-based interface that lets you interact with a computer by typing commands. Instead of clicking buttons and menus, you tell the system what to do with short lines of text.",
        },
        {
          type: "paragraph",
          text: "When you open a terminal window, you are looking at a place where you can type instructions. Those instructions are passed to a program that understands them, and that program asks the operating system to carry out the work.",
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Conceptual flow from you through the terminal, shell, Linux kernel, and hardware",
          layers: ["You", "Terminal", "Shell", "Linux Kernel", "Hardware"],
        },
        {
          type: "paragraph",
          text: "The terminal itself is not the shell. It is the window or application where you type. The shell is the program that interprets what you type. Keeping those two ideas separate will make later lessons easier.",
        },
      ],
    },
    {
      id: "terminal-vs-shell",
      title: "Terminal vs Shell",
      blocks: [
        {
          type: "paragraph",
          text: "Beginners often use “terminal” and “shell” interchangeably. They work closely together, but they are not the same thing.",
        },
        {
          type: "heading",
          level: 3,
          text: "Terminal",
        },
        {
          type: "paragraph",
          text: "The terminal is the application or interface where you interact with a command-line environment. Common examples include:",
        },
        {
          type: "list",
          items: [
            "GNOME Terminal",
            "Konsole",
            "Windows Terminal",
            "Built-in terminal apps inside desktop environments and code editors",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Shell",
        },
        {
          type: "paragraph",
          text: "The shell is the program that interprets your commands. Popular shells include:",
        },
        {
          type: "list",
          items: ["Bash", "Zsh", "Fish"],
        },
        {
          type: "stack-diagram",
          ariaLabel:
            "Conceptual flow from terminal through shell and commands to the operating system",
          layers: ["Terminal", "Shell", "Commands", "Operating System"],
        },
        {
          type: "paragraph",
          text: "In practice, you open a terminal, the shell presents a prompt, and you type commands. You do not need deep shell internals yet — just remember that the terminal is the interface and the shell is the interpreter.",
        },
      ],
    },
    {
      id: "why-use-the-terminal",
      title: "Why Use the Terminal?",
      blocks: [
        {
          type: "paragraph",
          text: "Linux users rely on the terminal because it is often faster and more precise than clicking through menus. It also unlocks tools that are difficult or impossible to use through a graphical interface alone.",
        },
        {
          type: "paragraph",
          text: "Practical advantages include:",
        },
        {
          type: "list",
          items: [
            "**Fast interaction** — short commands can replace many clicks",
            "**Automation** — you can repeat and combine commands as scripts",
            "**Remote server administration** — many servers are managed over SSH with no desktop at all",
            "**Powerful system tools** — package managers, logs, services, and diagnostics live in the CLI",
            "**Reproducible commands** — the same line can be shared, documented, and run again later",
            "**Working without a graphical interface** — useful on servers, containers, and minimal installs",
          ],
        },
        {
          type: "paragraph",
          text: "You do not need to memorize everything. Start with a few commands, understand the pattern, and build confidence through practice.",
        },
      ],
    },
    {
      id: "your-first-commands",
      title: "Your First Commands",
      blocks: [
        {
          type: "paragraph",
          text: "These commands are safe, common starting points. Each one does one clear job.",
        },
        {
          type: "heading",
          level: 3,
          text: "`pwd`",
        },
        {
          type: "paragraph",
          text: "Print the current directory — where you are in the filesystem.",
        },
        {
          type: "code",
          code: "pwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "heading",
          level: 3,
          text: "`ls`",
        },
        {
          type: "paragraph",
          text: "List files and directories in the current location.",
        },
        {
          type: "code",
          code: "ls",
          language: "bash",
          title: "bash",
        },
        {
          type: "heading",
          level: 3,
          text: "`whoami`",
        },
        {
          type: "paragraph",
          text: "Show the current user account name.",
        },
        {
          type: "code",
          code: "whoami",
          language: "bash",
          title: "bash",
        },
        {
          type: "heading",
          level: 3,
          text: "`date`",
        },
        {
          type: "paragraph",
          text: "Display the current date and time.",
        },
        {
          type: "code",
          code: "date",
          language: "bash",
          title: "bash",
        },
        {
          type: "heading",
          level: 3,
          text: "`echo`",
        },
        {
          type: "paragraph",
          text: "Print text to the terminal. Useful for messages and simple checks.",
        },
        {
          type: "code",
          code: 'echo "Hello Linux"',
          language: "bash",
          title: "bash",
        },
      ],
    },
    {
      id: "understanding-command-structure",
      title: "Understanding Command Structure",
      blocks: [
        {
          type: "paragraph",
          text: "Most commands follow a simple pattern. Once you see the structure, new commands become easier to read.",
        },
        {
          type: "code",
          code: "command [options] [arguments]",
          language: "text",
          title: "structure",
        },
        {
          type: "paragraph",
          text: "Here is a concrete example:",
        },
        {
          type: "code",
          code: "ls -la /home",
          language: "bash",
          title: "bash",
        },
        {
          type: "list",
          items: [
            "`ls` → the command",
            "`-la` → options that change how the command behaves",
            "`/home` → an argument (in this case, a path)",
          ],
        },
        {
          type: "paragraph",
          text: "Not every command needs options or arguments. Commands like `pwd` and `whoami` often work on their own.",
        },
      ],
    },
    {
      id: "try-it-yourself",
      title: "Try It Yourself",
      blocks: [
        {
          type: "paragraph",
          text: "Experiment with the commands you've just learned. This terminal is simulated, so you can safely explore.",
        },
        {
          type: "terminal",
          preset: "simple",
        },
      ],
    },
    {
      id: "terminal-tips",
      title: "Terminal Tips",
      blocks: [
        {
          type: "callout",
          title: "Tip",
          text: "Don't worry if commands feel unfamiliar. Linux becomes easier as you use the terminal regularly.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "In this lesson, you learned that:",
        },
        {
          type: "list",
          items: [
            "A terminal is a text-based interface for entering commands",
            "A shell is the program that interprets those commands",
            "The terminal and the shell work together, but they are different pieces",
            "Linux users rely on the command line for speed, automation, remote work, and systems without a desktop",
            "Commands usually follow the pattern `command [options] [arguments]`",
            "A few basics — `pwd`, `ls`, `whoami`, `date`, and `echo` — are enough to start exploring",
            "The Rean Linux terminal on this page is a safe frontend simulation, not a real shell on your machine",
          ],
        },
        {
          type: "paragraph",
          text: "Next, you will practice essential commands in more depth and start navigating a Linux system with confidence.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
