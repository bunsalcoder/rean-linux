import type { Lesson } from "@/types/lesson";

export const searchingAndFindingFilesLesson = {
  slug: "searching-and-finding-files",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Searching and Finding Files",
  description:
    "Learn how to locate files, search their contents, and combine search commands effectively.",
  seoTitle: "Searching and Finding Files — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux find and grep: locate files by name and type, search file contents, use beginner-friendly options, and combine searches with pipes.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Searching and Finding Files" },
  ],
  navigation: {
    previous: {
      label: "Pipes and Redirection",
      href: "/learn/essentials/pipes-and-redirection",
    },
    next: {
      label: "Text Processing",
      href: "/learn/essentials/text-processing",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Pipes and Redirection](/learn/essentials/pipes-and-redirection) you learned how to connect commands. Now you will learn how to **locate files** and **search text** — two everyday Linux skills that make large filesystems manageable.",
    },
  ],
  sections: [
    {
      id: "why-searching-matters",
      title: "Why Searching Matters",
      blocks: [
        {
          type: "paragraph",
          text: "A Linux system can contain thousands of files. Remembering every path is unrealistic. Instead, you learn tools that answer two different questions:",
        },
        {
          type: "code",
          code: "Where is the file?\nWhat does the file contain?",
          language: "text",
          title: "two search questions",
        },
        {
          type: "paragraph",
          text: "Linux provides different tools for these jobs. This lesson focuses on `find` for locating paths and `grep` for searching text.",
        },
        {
          type: "callout",
          title: "Keep the questions separate",
          text: "When you are stuck, ask which question you are answering. That choice usually tells you whether to start with `find` or `grep`.",
        },
      ],
    },
    {
      id: "find-vs-grep",
      title: "`find` vs `grep`",
      blocks: [
        {
          type: "paragraph",
          text: "These commands sound similar, but they solve different problems:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "find",
              description:
                "Searches for **files and directories** by path, name, or type.",
            },
            {
              term: "grep",
              description:
                "Searches for **text** inside input or files and prints matching lines.",
            },
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Locate a filename pattern",
              blocks: [
                {
                  type: "code",
                  code: 'find . -name "*.txt"',
                  language: "bash",
                  title: "find files",
                },
              ],
            },
            {
              title: "Search text inside a file",
              blocks: [
                {
                  type: "code",
                  code: 'grep "bunsal" /etc/passwd',
                  language: "bash",
                  title: "grep contents",
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Main learning objective",
          text: "Use `find` when you need a path. Use `grep` when you need matching text. Confusing the two is one of the most common beginner mistakes.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            { command: 'find . -name "*.txt"', label: 'find . -name "*.txt"' },
            {
              command: 'grep "bunsal" /etc/passwd',
              label: 'grep "bunsal" /etc/passwd',
            },
          ],
          suggestionsLabel: "Compare find and grep",
        },
      ],
    },
    {
      id: "finding-files-with-find",
      title: "Finding Files with `find`",
      blocks: [
        {
          type: "paragraph",
          text: "Start by searching from the current directory:",
        },
        {
          type: "code",
          code: "find .",
          language: "bash",
          title: "list everything under .",
        },
        {
          type: "list",
          items: [
            "`.` means the **current directory**",
            "`find` searches **recursively** from that starting location",
          ],
        },
        {
          type: "paragraph",
          text: "To match a specific filename, add `-name`:",
        },
        {
          type: "code",
          code: 'find . -name "notes.txt"',
          language: "bash",
          title: "exact name",
        },
        {
          type: "paragraph",
          text: "`-name` compares the **filename** (not the full path) against a pattern.",
        },
        {
          type: "paragraph",
          text: "Wildcards let you match groups of names:",
        },
        {
          type: "code",
          code: 'find . -name "*.txt"',
          language: "bash",
          title: "wildcard pattern",
        },
        {
          type: "paragraph",
          text: "The `*` character matches any sequence of characters in the filename. Quotes keep the shell from expanding the pattern before `find` sees it.",
        },
        {
          type: "code",
          code: "*",
          language: "text",
          title: "wildcard meaning",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            { command: "find .", label: "find ." },
            {
              command: 'find . -name "notes.txt"',
              label: 'find . -name "notes.txt"',
            },
            { command: 'find . -name "*.txt"', label: 'find . -name "*.txt"' },
          ],
          suggestionsLabel: "Try find",
        },
      ],
    },
    {
      id: "finding-directories",
      title: "Finding Directories",
      blocks: [
        {
          type: "paragraph",
          text: "`find` can filter by node type:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "-type f",
              description: "Match **regular files** only.",
            },
            {
              term: "-type d",
              description: "Match **directories** only.",
            },
          ],
        },
        {
          type: "code",
          code: "find . -type d",
          language: "bash",
          title: "directories only",
        },
        {
          type: "paragraph",
          text: "Combine type and name when you want a directory with a specific name:",
        },
        {
          type: "code",
          code: 'find . -type d -name "projects"',
          language: "bash",
          title: "named directory",
        },
        {
          type: "paragraph",
          text: "Compare files and directories side by side:",
        },
        {
          type: "code",
          code: "find . -type f",
          language: "bash",
          title: "regular files",
        },
        {
          type: "code",
          code: "find . -type d",
          language: "bash",
          title: "directories",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            { command: "find . -type f", label: "find . -type f" },
            { command: "find . -type d", label: "find . -type d" },
            {
              command: 'find . -type d -name "projects"',
              label: 'find . -type d -name "projects"',
            },
          ],
          suggestionsLabel: "Filter by type",
        },
      ],
    },
    {
      id: "searching-by-file-name",
      title: "Searching by File Name",
      blocks: [
        {
          type: "paragraph",
          text: "The starting path controls where the search begins:",
        },
        {
          type: "code",
          code: 'find /home/bunsal -name "notes.txt"\nfind /home/bunsal -name "*.log"\nfind /etc -name "*.conf"',
          language: "bash",
          title: "start path examples",
        },
        {
          type: "paragraph",
          text: "A smaller starting directory usually produces clearer, more relevant results.",
        },
        {
          type: "paragraph",
          text: "For case-insensitive filename matching, use `-iname`:",
        },
        {
          type: "code",
          code: 'find . -iname "README.md"',
          language: "bash",
          title: "case-insensitive name",
        },
        {
          type: "note",
          text: "`-iname` ignores filename case, so `README.md`, `readme.md`, and `ReadMe.md` can all match.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            {
              command: 'find /home/bunsal -name "*.log"',
              label: 'find /home/bunsal -name "*.log"',
            },
            {
              command: 'find /etc -name "*.conf"',
              label: 'find /etc -name "*.conf"',
            },
            {
              command: 'find . -iname "README.md"',
              label: 'find . -iname "README.md"',
            },
          ],
          suggestionsLabel: "Try name searches",
        },
      ],
    },
    {
      id: "searching-file-contents-with-grep",
      title: "Searching File Contents with `grep`",
      blocks: [
        {
          type: "paragraph",
          text: "`grep` searches **text**, not filenames:",
        },
        {
          type: "code",
          code: 'grep "bunsal" /etc/passwd',
          language: "bash",
          title: "search a file",
        },
        {
          type: "paragraph",
          text: "Matching lines are printed to the terminal:",
        },
        {
          type: "code",
          code: 'grep "error" app.log\ngrep "hello" notes.txt',
          language: "bash",
          title: "more text searches",
        },
        {
          type: "callout",
          title: "Remember",
          text: "`grep` looks inside file contents (or stdin). If you need the path to a file named `notes.txt`, use `find` instead.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            {
              command: 'grep "bunsal" /etc/passwd',
              label: 'grep "bunsal" /etc/passwd',
            },
            { command: 'grep "error" app.log', label: 'grep "error" app.log' },
            {
              command: 'grep "hello" notes.txt',
              label: 'grep "hello" notes.txt',
            },
          ],
          suggestionsLabel: "Try grep",
        },
      ],
    },
    {
      id: "useful-grep-options",
      title: "Useful `grep` Options",
      blocks: [
        {
          type: "paragraph",
          text: "These beginner-friendly options cover most early needs:",
        },
        {
          type: "code",
          code: 'grep -i "error" app.log',
          language: "bash",
          title: "case-insensitive",
        },
        {
          type: "paragraph",
          text: "`-i` ignores letter case when matching.",
        },
        {
          type: "code",
          code: 'grep -n "error" app.log',
          language: "bash",
          title: "show line numbers",
        },
        {
          type: "paragraph",
          text: "`-n` prints the line number before each match.",
        },
        {
          type: "code",
          code: 'grep -v "debug" app.log',
          language: "bash",
          title: "invert match",
        },
        {
          type: "paragraph",
          text: "`-v` shows lines that **do not** match the pattern.",
        },
        {
          type: "paragraph",
          text: "To search many files under a directory, use recursive mode:",
        },
        {
          type: "code",
          code: 'grep -r "bunsal" .',
          language: "bash",
          title: "recursive search",
        },
        {
          type: "paragraph",
          text: "`-r` searches files recursively under the specified directory.",
        },
        {
          type: "note",
          text: "This lesson uses simple text matching. Deep regular expressions come later — stick with plain patterns for now.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            {
              command: 'grep -i "error" app.log',
              label: 'grep -i "error" app.log',
            },
            {
              command: 'grep -n "error" app.log',
              label: 'grep -n "error" app.log',
            },
            {
              command: 'grep -v "debug" app.log',
              label: 'grep -v "debug" app.log',
            },
            { command: 'grep -r "bunsal" .', label: 'grep -r "bunsal" .' },
          ],
          suggestionsLabel: "Try grep options",
        },
      ],
    },
    {
      id: "combining-find-grep-and-pipes",
      title: "Combining `find`, `grep`, and Pipes",
      blocks: [
        {
          type: "paragraph",
          text: "Pipes let these tools work together. One useful pattern filters the **paths** produced by `find`:",
        },
        {
          type: "code",
          code: 'find . -name "*.log" | grep "server"',
          language: "bash",
          title: "filter find results",
        },
        {
          type: "code",
          code: "find\n ↓\nlist matching files\n ↓\npipe\n ↓\ngrep\n ↓\nfilter matching lines",
          language: "text",
          title: "pipeline flow",
        },
        {
          type: "paragraph",
          text: "Another simple pipeline keeps only paths that contain `.txt`:",
        },
        {
          type: "code",
          code: 'find . -type f | grep ".txt"',
          language: "bash",
          title: "find then filter",
        },
        {
          type: "callout",
          title: "Pipes become useful here",
          text: "This is where the previous [Pipes and Redirection](/learn/essentials/pipes-and-redirection) lesson pays off: `find` writes paths to stdout, and `grep` reads those paths as stdin.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            {
              command: 'find . -name "*.log" | grep "server"',
              label: 'find … | grep "server"',
            },
            {
              command: 'find . -type f | grep ".txt"',
              label: 'find . -type f | grep ".txt"',
            },
          ],
          suggestionsLabel: "Combine with pipes",
        },
      ],
    },
    {
      id: "searching-specific-directories",
      title: "Searching Specific Directories",
      blocks: [
        {
          type: "paragraph",
          text: "Search scope matters. Compare these starting points:",
        },
        {
          type: "code",
          code: "find .\nfind /home/bunsal\nfind /etc",
          language: "bash",
          title: "different scopes",
        },
        {
          type: "list",
          items: [
            "`find .` searches from your **current directory**",
            "`find /home/bunsal` searches a **home directory tree**",
            "`find /etc` searches **system configuration** paths in this simulator",
          ],
        },
        {
          type: "paragraph",
          text: "Starting from a smaller directory makes results easier to understand and avoids unrelated matches. You do not need to optimize system-wide search performance yet — choose a sensible scope first.",
        },
        {
          type: "terminal",
          preset: "searching-and-finding-files",
          suggestions: [
            { command: "find .", label: "find ." },
            { command: "find /home/bunsal", label: "find /home/bunsal" },
            { command: "find /etc", label: "find /etc" },
          ],
          suggestionsLabel: "Compare scopes",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "searching-and-finding-files-practice",
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
          text: "Mistake 1 — Confusing `find` with `grep`",
        },
        {
          type: "paragraph",
          text: "`find` locates paths. `grep` searches text. Use the tool that matches the question you are asking.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Forgetting the starting path for `find`",
        },
        {
          type: "paragraph",
          text: "`find` needs a place to begin, such as `.` or `/home/bunsal`. Without a starting path, the command is incomplete in this lesson.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Forgetting quotes around wildcard patterns",
        },
        {
          type: "paragraph",
          text: 'Write `find . -name "*.txt"` with quotes so the pattern reaches `find` instead of being expanded early.',
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Using `-type f` when looking for directories",
        },
        {
          type: "paragraph",
          text: "`-type f` matches regular files. Use `-type d` when you want directories.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Expecting `grep` to search filenames",
        },
        {
          type: "paragraph",
          text: "`grep` looks at text lines. To search by filename, use `find -name` (or pipe `find` output into `grep`).",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 6 — Forgetting that `grep` searches text",
        },
        {
          type: "paragraph",
          text: "If a command returns no matches, check whether the pattern appears inside the file contents — not only in the filename.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 7 — Using `grep -r` on an unnecessarily large directory",
        },
        {
          type: "paragraph",
          text: "Recursive search is powerful. Prefer a focused starting directory so results stay readable.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 8 — Assuming the simulator searches the real computer",
        },
        {
          type: "paragraph",
          text: "This learning terminal only searches its in-memory filesystem. It never reads your real disk.",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now remember this toolbox:",
        },
        {
          type: "code",
          code: "find → locate files/directories\ngrep → search text\n-name → filename pattern\n-iname → case-insensitive filename pattern\n-type f → regular files\n-type d → directories\ngrep -i → case-insensitive text search\ngrep -n → show line numbers\ngrep -v → exclude matching lines\ngrep -r → recursive text search\n| → connect command output to another command",
          language: "text",
          title: "quick reference",
        },
        {
          type: "paragraph",
          text: "Mental model:",
        },
        {
          type: "code",
          code: "Need to find a file?\n        ↓\n      find\n\nNeed to find text?\n        ↓\n      grep\n\nNeed to combine searches?\n        ↓\n   find | grep",
          language: "text",
          title: "remember",
        },
        {
          type: "table",
          caption: "find and grep quick reference",
          headers: ["Tool / option", "Purpose"],
          rows: [
            ["`find`", "Locate files and directories"],
            ["`grep`", "Search text in files or stdin"],
            ["`-name`", "Match a filename pattern"],
            ["`-iname`", "Case-insensitive filename match"],
            ["`-type f`", "Regular files only"],
            ["`-type d`", "Directories only"],
            ["`grep -i`", "Case-insensitive text search"],
            ["`grep -n`", "Show matching line numbers"],
            ["`grep -v`", "Exclude matching lines"],
            ["`grep -r`", "Recursive text search"],
            ["`|`", "Pipe one command’s output into another"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
