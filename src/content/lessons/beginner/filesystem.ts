import type { Lesson } from "@/types/lesson";

export const filesystemLesson = {
  slug: "filesystem",
  level: "beginner",
  levelNumber: "06",
  difficulty: "Beginner",
  readingTime: "15 min read",
  title: "Understanding the Linux Filesystem",
  description:
    "Learn how Linux organizes files, directories, and paths — and how to navigate them with confidence.",
  seoTitle: "Understanding the Linux Filesystem | Rean Linux",
  seoDescription:
    "Learn the Linux filesystem hierarchy, absolute and relative paths, home directories, and how to navigate with pwd, ls, and cd.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Beginner", href: "/learn/beginner" },
    { label: "Understanding the Linux Filesystem" },
  ],
  navigation: {
    previous: {
      label: "Your First Linux Commands",
      href: "/learn/beginner/first-commands",
    },
    next: {
      label: "Finish Beginner Foundations",
      href: "/learn/beginner",
      emphasis: "finish",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Linux organizes everything into a single filesystem tree. Unlike Windows, where learners often think in terms of drives such as `C:\\` and `D:\\`, Linux starts from one root directory:",
    },
    {
      type: "code",
      code: "/",
      language: "text",
      title: "root",
    },
    {
      type: "paragraph",
      text: "Every file and directory exists somewhere underneath `/`.",
    },
    {
      type: "tree-diagram",
      ariaLabel: "Example Linux filesystem tree starting at root",
      root: {
        label: "/",
        children: [
          {
            label: "home/",
            children: [
              {
                label: "learner/",
                children: [
                  { label: "Desktop/" },
                  { label: "Documents/" },
                  { label: "Downloads/" },
                  { label: "notes.txt" },
                ],
              },
            ],
          },
          { label: "etc/" },
          { label: "var/" },
          { label: "tmp/" },
          { label: "usr/" },
          { label: "bin/" },
        ],
      },
    },
  ],
  sections: [
    {
      id: "everything-starts-at-root",
      title: "Everything Starts at /",
      blocks: [
        {
          type: "paragraph",
          text: "`/` is called the **root directory**. Keep these related ideas separate:",
        },
        {
          type: "list",
          items: [
            "`/` → filesystem root",
            "`/home/learner` → learner's home directory",
            "`~` → shortcut for the current user's home directory",
          ],
        },
        {
          type: "paragraph",
          text: "Check your current location with `pwd`:",
        },
        {
          type: "code",
          code: "pwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "Then move to the root and confirm again:",
        },
        {
          type: "code",
          code: "cd /\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/",
          language: "text",
          title: "output",
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          suggestions: [
            { command: "pwd", label: "Run pwd" },
            { command: "cd /", label: "Run cd /" },
            { command: "pwd", label: "Check again" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "the-linux-filesystem-hierarchy",
      title: "The Linux Filesystem Hierarchy",
      blocks: [
        {
          type: "paragraph",
          text: "Common top-level directories each have a purpose. You do not need to memorize every detail yet — learn the map first.",
        },
        {
          type: "table",
          caption: "Common Linux filesystem directories",
          headers: ["Directory", "Purpose"],
          rows: [
            ["`/`", "Root of the entire filesystem"],
            ["`/home`", "Personal directories for users"],
            ["`/etc`", "System and application configuration"],
            ["`/var`", "Frequently changing data such as logs"],
            ["`/tmp`", "Temporary files"],
            ["`/usr`", "User-space programs, libraries, and shared resources"],
            ["`/bin`", "Essential command-line programs"],
            ["`/sbin`", "Essential system administration programs"],
          ],
        },
        {
          type: "paragraph",
          text: "Modern distributions may merge directories such as `/bin` and `/sbin` into `/usr/bin` and `/usr/sbin`. The important idea for now is that Linux still starts from one root tree.",
        },
        {
          type: "callout",
          title: "Remember",
          text: "Think of `/` as the top-level folder containing the entire Linux filesystem.",
        },
      ],
    },
    {
      id: "your-home-directory",
      title: "Your Home Directory",
      blocks: [
        {
          type: "paragraph",
          text: "`/home` contains user home directories. In this simulator, your home directory is:",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "path",
        },
        {
          type: "code",
          code: "cd /home/learner\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "Personal files normally live here — documents, downloads, project folders, and notes.",
        },
        {
          type: "tree-diagram",
          ariaLabel: "Example contents of the learner home directory",
          root: {
            label: "/home/learner",
            children: [
              { label: "Desktop/" },
              { label: "Documents/" },
              { label: "Downloads/" },
              { label: "notes.txt" },
            ],
          },
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          suggestions: [
            { command: "cd /home/learner", label: "Run cd /home/learner" },
            { command: "pwd", label: "Run pwd" },
            { command: "ls", label: "Run ls" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "absolute-and-relative-paths",
      title: "Absolute and Relative Paths",
      blocks: [
        {
          type: "paragraph",
          text: "An **absolute path** starts from `/`:",
        },
        {
          type: "code",
          code: "/home/learner\n/home/learner/Documents\n/etc\n/var",
          language: "text",
          title: "absolute paths",
        },
        {
          type: "paragraph",
          text: "A **relative path** starts from the current directory. If you are inside `/home/learner`, then `Documents` refers to `/home/learner/Documents`.",
        },
        {
          type: "code",
          code: "cd /home/learner\ncd Documents\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner/Documents",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "The same place with an absolute path:",
        },
        {
          type: "code",
          code: "cd /home/learner/Documents\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Absolute",
              blocks: [
                {
                  type: "tree-diagram",
                  ariaLabel: "Absolute path from root to Documents",
                  root: {
                    label: "/",
                    children: [
                      {
                        label: "home",
                        children: [
                          {
                            label: "learner",
                            children: [{ label: "Documents" }],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            {
              title: "Relative from /home/learner",
              blocks: [
                {
                  type: "code",
                  code: "Documents",
                  language: "text",
                  title: "relative",
                },
              ],
            },
          ],
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          suggestions: [
            { command: "cd /home/learner", label: "Go home" },
            { command: "cd Documents", label: "Relative cd" },
            { command: "pwd", label: "Run pwd" },
            {
              command: "cd /home/learner/Documents",
              label: "Absolute cd",
            },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "dot-and-dot-dot",
      title: ". and ..",
      blocks: [
        {
          type: "list",
          items: [
            "`.` means the current directory",
            "`..` means the parent directory",
          ],
        },
        {
          type: "paragraph",
          text: "If you are here:",
        },
        {
          type: "code",
          code: "pwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner/Documents",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "Then `cd ..` moves one level up:",
        },
        {
          type: "code",
          code: "cd ..\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "Another step up:",
        },
        {
          type: "code",
          code: "cd ..\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "And `cd .` keeps you in the same directory:",
        },
        {
          type: "code",
          code: "cd .\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          cwd: "/home/learner/Documents",
          suggestions: [
            { command: "pwd", label: "Run pwd" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd .", label: "Run cd ." },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "the-tilde-shortcut",
      title: "The ~ Shortcut",
      blocks: [
        {
          type: "paragraph",
          text: "`~` represents the current user's home directory. In this simulator, `~` means `/home/learner`.",
        },
        {
          type: "code",
          code: "cd ~\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner",
          language: "text",
          title: "output",
        },
        {
          type: "code",
          code: "cd ~/Documents\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "/home/learner/Documents",
          language: "text",
          title: "output",
        },
        {
          type: "callout",
          title: "Tip",
          text: "`~` is one of the most useful shortcuts you'll use in the terminal.",
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          cwd: "/var",
          suggestions: [
            { command: "cd ~", label: "Run cd ~" },
            { command: "pwd", label: "Run pwd" },
            { command: "cd ~/Documents", label: "Run cd ~/Documents" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "navigating-the-filesystem",
      title: "Navigating the Filesystem",
      blocks: [
        {
          type: "paragraph",
          text: "Review the navigation trio you already know:",
        },
        {
          type: "code",
          code: "pwd\nls\ncd",
          language: "bash",
          title: "bash",
        },
        {
          type: "code",
          code: "pwd\nls\ncd Documents\npwd\ncd ..\npwd\ncd ~\npwd",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Keep this mental model close:",
        },
        {
          type: "code",
          code: "pwd → Where am I?\n\nls → What's here?\n\ncd → Move somewhere else.",
          language: "text",
          title: "mental model",
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          suggestions: [
            { command: "pwd", label: "Run pwd" },
            { command: "ls", label: "Run ls" },
            { command: "cd Documents", label: "Run cd Documents" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd ~", label: "Run cd ~" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "explore-the-filesystem",
      title: "Explore the Filesystem",
      blocks: [
        {
          type: "paragraph",
          text: "Explore the same simulated filesystem the terminal uses. Click a directory to highlight it and inspect its path and children.",
        },
        {
          type: "filesystem-explorer",
        },
        {
          type: "note",
          text: "This explorer is educational only. It does not access files on your computer.",
        },
        {
          type: "terminal",
          preset: "filesystem-lesson",
          suggestions: [
            { command: "cd /", label: "Run cd /" },
            { command: "ls", label: "Run ls" },
            { command: "cd /var", label: "Run cd /var" },
            { command: "cd log", label: "Run cd log" },
            { command: "cd ~", label: "Run cd ~" },
            { command: "ls -la", label: "Run ls -la" },
            "help",
          ],
          suggestionsLabel: "Explore in the terminal",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "filesystem-practice",
        },
      ],
    },
    {
      id: "common-path-mistakes",
      title: "Common Path Mistakes",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Mistake 1 — Absolute vs relative",
        },
        {
          type: "code",
          code: "cd /home/learner/Documents",
          language: "bash",
          title: "absolute",
        },
        {
          type: "code",
          code: "cd home/learner/Documents",
          language: "bash",
          title: "relative",
        },
        {
          type: "paragraph",
          text: "The first path starts from `/`. The second starts from wherever you currently are.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Confusing / and ~",
        },
        {
          type: "code",
          code: "/\n~",
          language: "text",
          title: "paths",
        },
        {
          type: "list",
          items: ["`/` → filesystem root", "`~` → user's home directory"],
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Case sensitivity",
        },
        {
          type: "paragraph",
          text: "Linux paths are case-sensitive. `Documents` and `documents` may refer to different locations.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Too many or too few ..",
        },
        {
          type: "code",
          code: "cd ../../",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "That moves up two directory levels — one for each `..`.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "Remember these foundations:",
        },
        {
          type: "list",
          items: [
            "Linux starts from /",
            "/ is the root directory",
            "/home/learner is the user's home directory",
            "Absolute paths start from /",
            "Relative paths start from the current directory",
            ". means current directory",
            ".. means parent directory",
            "~ means the user's home directory",
            "pwd tells you where you are",
            "ls shows what's around you",
            "cd moves you around",
          ],
        },
        {
          type: "table",
          caption: "Command reference for filesystem navigation",
          headers: ["Command", "What it does"],
          rows: [
            ["`pwd`", "Shows the current directory"],
            ["`ls`", "Lists files and directories"],
            ["`cd <path>`", "Changes directory"],
            ["`cd ..`", "Moves to the parent directory"],
            ["`cd .`", "Stays in the current directory"],
            ["`cd ~`", "Goes to the home directory"],
            ["`ls -la`", "Lists detailed directory contents"],
          ],
        },
        {
          type: "paragraph",
          text: "**You now have the foundations needed to start working with Linux confidently from the terminal.**",
        },
      ],
    },
  ],
} as const satisfies Lesson;
