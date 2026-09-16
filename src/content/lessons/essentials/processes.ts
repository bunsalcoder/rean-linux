import type { Lesson } from "@/types/lesson";

export const processesLesson = {
  slug: "processes",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Processes",
  description:
    "Understand what processes are, how Linux identifies them, how to inspect them, and how to stop them safely.",
  seoTitle: "Processes — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux processes, PIDs, ps, top, foreground and background jobs, kill, SIGTERM, and SIGKILL with a safe simulated terminal.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Processes" },
  ],
  navigation: {
    previous: {
      label: "Ownership and sudo",
      href: "/learn/essentials/ownership-and-sudo",
    },
    next: {
      label: "Package Management",
      href: "/learn/essentials/package-management",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Ownership and sudo](/learn/essentials/ownership-and-sudo) you learned who owns files and when elevated privileges matter. Processes also have owners — and Linux tracks each running program so you can inspect and stop it safely.",
    },
  ],
  sections: [
    {
      id: "what-is-a-process",
      title: "What Is a Process?",
      blocks: [
        {
          type: "paragraph",
          text: "A **process** is a running instance of a program.",
        },
        {
          type: "paragraph",
          text: "When you start an application, Linux creates a process for it. Multiple processes can run at the same time, and each one consumes resources such as CPU and memory.",
        },
        {
          type: "paragraph",
          text: "Simple example:",
        },
        {
          type: "code",
          code: "node server.js",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Running that command creates a process for the Node.js application. The program is the code on disk; the process is that program **while it is running**.",
        },
        {
          type: "callout",
          title: "Program vs process",
          text: "A program is the executable or script. A process is a living instance of that program with its own identity and resource usage.",
        },
      ],
    },
    {
      id: "process-ids-pids",
      title: "Process IDs (PIDs)",
      blocks: [
        {
          type: "paragraph",
          text: "Linux identifies each process with a **PID** — a Process ID.",
        },
        {
          type: "code",
          code: "PID = Process ID",
          language: "text",
          title: "definition",
        },
        {
          type: "list",
          items: [
            "Every process has a PID",
            "PIDs allow Linux to identify individual processes",
            "Commands such as `ps` and `top` show PIDs",
            "PIDs are commonly used with `kill`",
          ],
        },
        {
          type: "paragraph",
          text: "Example (simulated numbers in Rean Linux):",
        },
        {
          type: "code",
          code: "PID    COMMAND\n1200   bash\n2345   node server.js\n2410   code",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "These numbers are teaching examples — they are not taken from your real computer.",
        },
        {
          type: "note",
          text: "PID 1 is commonly used by the system’s initial userspace process on modern Linux systems. Different environments may use different implementations; do not assume every Linux setup looks identical.",
        },
      ],
    },
    {
      id: "parent-and-child-processes",
      title: "Parent and Child Processes",
      blocks: [
        {
          type: "paragraph",
          text: "Processes can create other processes.",
        },
        {
          type: "list",
          items: [
            "The creator is the **parent** process",
            "The newly created process is the **child** process",
            "Linux can represent these relationships using **parent process IDs (PPIDs)**",
          ],
        },
        {
          type: "paragraph",
          text: "Conceptual example:",
        },
        {
          type: "code",
          code: "bash\n└── node server.js",
          language: "text",
          title: "parent → child",
        },
        {
          type: "paragraph",
          text: "Here, `bash` is the parent and `node server.js` is a child. Keep this mental model — you do not need process trees, `fork()`, or kernel internals for everyday work yet.",
        },
        {
          type: "code",
          code: "PID   PPID   USER     COMMAND\n1     0      root     systemd\n1200  1      bunsal   bash\n2345  1200   bunsal   node server.js\n2410  1200   bunsal   code\n2500  1200   bunsal   hung-demo\n3100  1      root     system-process",
          language: "text",
          title: "simulated table",
        },
      ],
    },
    {
      id: "viewing-processes-with-ps",
      title: "Viewing Processes with `ps`",
      blocks: [
        {
          type: "paragraph",
          text: "Use:",
        },
        {
          type: "code",
          code: "ps",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`ps` displays a **snapshot** of selected running processes — a still picture, not a continuously updating view.",
        },
        {
          type: "code",
          code: "PID    TTY      TIME     CMD\n1200   pts/0    00:00    bash\n2345   pts/0    00:01    node server.js",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "A commonly used broader listing is:",
        },
        {
          type: "code",
          code: "ps aux",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Simplified columns:",
        },
        {
          type: "code",
          code: "USER    PID   %CPU   %MEM   COMMAND\nroot    1     0.0    0.1    systemd\nbunsal  1200  0.1    0.5    bash\nbunsal  2345  2.3    1.8    node server.js",
          language: "text",
          title: "ps aux",
        },
        {
          type: "note",
          text: "There are many `ps` options. This lesson focuses on the forms you will use most often as a beginner.",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [
            { command: "ps", label: "Run ps" },
            { command: "ps aux", label: "Run ps aux" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "monitoring-processes-with-top",
      title: "Monitoring Processes with `top`",
      blocks: [
        {
          type: "paragraph",
          text: "Use:",
        },
        {
          type: "code",
          code: "top",
          language: "bash",
          title: "command",
        },
        {
          type: "list",
          items: [
            "`top` provides a **dynamic** view of processes",
            "It can show CPU and memory usage",
            "Unlike `ps`, it continuously refreshes its displayed information on a real system",
          ],
        },
        {
          type: "paragraph",
          text: "Simplified simulated example:",
        },
        {
          type: "code",
          code: "PID    USER     %CPU   %MEM   COMMAND\n2345   bunsal   2.3    1.8    node server.js\n2410   bunsal   1.1    3.2    code\n1200   bunsal   0.1    0.5    bash",
          language: "text",
          title: "example",
        },
        {
          type: "callout",
          title: "Simulator note",
          text: "Rean Linux shows a **static simulated snapshot**. It does not run a real-time process monitor and never reads your host’s processes.",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [{ command: "top", label: "Run top" }],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "foreground-and-background-processes",
      title: "Foreground and Background Processes",
      blocks: [
        {
          type: "paragraph",
          text: "Compare:",
        },
        {
          type: "code",
          code: "sleep 30",
          language: "bash",
          title: "foreground",
        },
        {
          type: "paragraph",
          text: "versus:",
        },
        {
          type: "code",
          code: "sleep 30 &",
          language: "bash",
          title: "background",
        },
        {
          type: "list",
          items: [
            "**Foreground** processes occupy the current terminal session",
            "**Background** processes allow the shell to continue accepting commands",
            "`&` starts a command in the background",
          ],
        },
        {
          type: "paragraph",
          text: "Briefly introduce:",
        },
        {
          type: "code",
          code: "jobs",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`jobs` lists jobs controlled by the current shell. Full shell job control is covered later in **Shell Basics** — this lesson only needs the concept.",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [
            { command: "sleep 30 &", label: "sleep 30 &" },
            { command: "jobs", label: "Run jobs" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "stopping-processes-with-kill",
      title: "Stopping Processes with `kill`",
      blocks: [
        {
          type: "paragraph",
          text: "Use:",
        },
        {
          type: "code",
          code: "kill PID",
          language: "bash",
          title: "command",
        },
        {
          type: "callout",
          title: "Important",
          text: "`kill` does **not** simply “delete a process.” It **sends a signal** to a process identified by its PID.",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "kill 2345",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Normally this sends **SIGTERM** — a polite request for the process to exit.",
        },
        {
          type: "paragraph",
          text: "You can also be explicit:",
        },
        {
          type: "code",
          code: "kill -15 2345",
          language: "bash",
          title: "SIGTERM",
        },
        {
          type: "paragraph",
          text: "And for force termination:",
        },
        {
          type: "code",
          code: "kill -9 2345",
          language: "bash",
          title: "SIGKILL",
        },
        {
          type: "list",
          items: [
            "**SIGTERM** requests graceful termination",
            "It gives the process an opportunity to clean up",
            "**SIGKILL** (`-9`) forces termination",
            "`SIGKILL` cannot be caught or handled by the target process",
            "Prefer `SIGTERM` first",
            "Use `SIGKILL` only when necessary",
          ],
        },
        {
          type: "callout",
          title: "Prefer graceful stops",
          text: "Do not make `kill -9` your default. Try a normal `kill` (SIGTERM) first, and escalate only if the process will not exit.",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [
            { command: "ps", label: "Run ps" },
            { command: "kill 2345", label: "kill 2345" },
            { command: "ps", label: "Check again" },
          ],
          suggestionsLabel: "Try kill",
        },
      ],
    },
    {
      id: "process-ownership",
      title: "Process Ownership",
      blocks: [
        {
          type: "paragraph",
          text: "Processes also have owners — the same identity idea from [Ownership and sudo](/learn/essentials/ownership-and-sudo).",
        },
        {
          type: "code",
          code: "PID    USER\n1200   bunsal\n2345   bunsal\n3100   root",
          language: "text",
          title: "example",
        },
        {
          type: "list",
          items: [
            "A user can generally signal processes they have permission to signal",
            "Processes owned by another user — especially privileged processes — may require elevated privileges",
            "This connects directly to `sudo`",
          ],
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "kill 3100",
          language: "bash",
          title: "without sudo",
        },
        {
          type: "paragraph",
          text: "may fail because the process belongs to `root`. Then:",
        },
        {
          type: "code",
          code: "sudo kill 3100",
          language: "bash",
          title: "with sudo",
        },
        {
          type: "paragraph",
          text: "can be used when the user is authorized. In Rean Linux this is fully simulated — no real authentication and no real system processes.",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [
            { command: "kill 3100", label: "kill 3100" },
            { command: "sudo kill 3100", label: "sudo kill 3100" },
            { command: "ps aux", label: "Check with ps aux" },
          ],
          suggestionsLabel: "Compare without and with sudo",
        },
      ],
    },
    {
      id: "signals-sigterm-vs-sigkill",
      title: "Signals: SIGTERM vs SIGKILL",
      blocks: [
        {
          type: "paragraph",
          text: "`kill` is fundamentally about **sending signals**. Two signals matter most here:",
        },
        {
          type: "table",
          caption: "Common termination signals",
          headers: ["Signal", "Number", "Purpose"],
          rows: [
            ["`SIGTERM`", "15", "Request graceful termination"],
            ["`SIGKILL`", "9", "Force termination"],
          ],
        },
        {
          type: "code",
          code: 'SIGTERM\n    ↓\n"Please stop cleanly."\n\nSIGKILL\n    ↓\n"Stop immediately."',
          language: "text",
          title: "intent",
        },
        {
          type: "paragraph",
          text: "Try both forms in a fresh simulated terminal (each lesson terminal starts with the initial process list):",
        },
        {
          type: "terminal",
          preset: "processes",
          suggestions: [
            { command: "kill -15 2345", label: "kill -15 2345" },
            { command: "kill -9 2500", label: "kill -9 2500" },
            { command: "ps", label: "Verify with ps" },
          ],
          suggestionsLabel: "Compare signals",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "processes-practice",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "Common Mistakes",
      blocks: [
        {
          type: "panel",
          title: "Watch out for these",
          blocks: [
            {
              type: "list",
              items: [
                "Thinking `kill` deletes files or permanently removes a program from disk",
                "Always reaching for `kill -9` first",
                "Confusing a program on disk with a running process",
                "Ignoring process ownership when a `kill` fails",
                "Assuming `ps` and `top` show identical, live-updating views",
                "Copying process-killing commands from the internet without reading them",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain and practice basic process management:",
        },
        {
          type: "list",
          items: [
            "A process is a running instance of a program",
            "Every process has a PID",
            "Parent and child relationships are tracked with PPIDs",
            "`ps` shows a process snapshot",
            "`top` shows a dynamic (or simulated) monitoring view",
            "Foreground vs background affects whether the shell stays free",
            "`kill` sends signals — usually SIGTERM first",
            "SIGKILL forces termination and should be a last resort",
            "Process ownership connects to `sudo`",
          ],
        },
        {
          type: "table",
          caption: "Command reference for processes",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ps`", "Show a process snapshot"],
            ["`ps aux`", "Show a broader process list"],
            ["`top`", "Monitor processes (simulated snapshot here)"],
            ["`jobs`", "List shell jobs"],
            ["`sleep 30 &`", "Start a command in the background"],
            ["`kill PID`", "Send SIGTERM to a process"],
            ["`kill -15 PID`", "Send SIGTERM explicitly"],
            ["`kill -9 PID`", "Send SIGKILL (force)"],
            ["`sudo kill PID`", "Signal a process with elevated privileges"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
