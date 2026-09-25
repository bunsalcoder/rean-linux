import type { Lesson } from "@/types/lesson";

export const textProcessingLesson = {
  slug: "text-processing",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "25–30 min read",
  title: "Text Processing",
  description:
    "Learn how to inspect, filter, count, sort, and transform text using common Linux command-line tools.",
  seoTitle: "Text Processing — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux text-processing tools: wc, sort, uniq, cut, head, and tail — plus how to combine them with pipes for useful command-line workflows.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Text Processing" },
  ],
  navigation: {
    previous: {
      label: "Searching and Finding Files",
      href: "/learn/essentials/searching-and-finding-files",
    },
    next: {
      label: "Shell Basics",
      href: "/learn/essentials/shell-basics",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Searching and Finding Files](/learn/essentials/searching-and-finding-files) you learned `find` and `grep`. Now you will learn tools that **count**, **sort**, **deduplicate**, **extract fields**, and **inspect** text — the everyday building blocks of useful Linux pipelines.",
    },
  ],
  sections: [
    {
      id: "why-text-processing-matters",
      title: "Why Text Processing Matters",
      blocks: [
        {
          type: "paragraph",
          text: "Linux commands often produce **text output**. Being able to process that output is one of the most useful command-line skills you can learn.",
        },
        {
          type: "paragraph",
          text: "A common workflow looks like this:",
        },
        {
          type: "code",
          code: "command\n   ↓\ntext output\n   ↓\nfilter\n   ↓\nsort\n   ↓\ncount\n   ↓\nuseful result",
          language: "text",
          title: "text-processing workflow",
        },
        {
          type: "paragraph",
          text: "This lesson connects to what you already know:",
        },
        {
          type: "list",
          items: [
            "**Pipes** connect commands so output flows from one tool to the next.",
            "`grep` **filters** text to matching lines.",
            "Text-processing tools further **transform** that result — counting, sorting, deduplicating, and extracting fields.",
          ],
        },
        {
          type: "callout",
          title: "Small tools, big results",
          text: "Linux workflows usually combine several small tools instead of relying on one giant command. Learn each tool, then combine them one step at a time.",
        },
      ],
    },
    {
      id: "cat-as-a-simple-starting-point",
      title: "`cat` as a Simple Starting Point",
      blocks: [
        {
          type: "paragraph",
          text: "You have already used `cat` to display file contents:",
        },
        {
          type: "code",
          code: "cat notes.txt",
          language: "bash",
          title: "display a file",
        },
        {
          type: "paragraph",
          text: "`cat` can also provide text to another command through a pipe:",
        },
        {
          type: "code",
          code: 'cat notes.txt | grep "Linux"',
          language: "bash",
          title: "pipe file contents into grep",
        },
        {
          type: "note",
          text: "This lesson treats `cat` as a familiar starting point. The focus is on the tools that transform text after it appears.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            { command: "cat notes.txt", label: "cat notes.txt" },
            {
              command: 'cat notes.txt | grep "Linux"',
              label: 'cat notes.txt | grep "Linux"',
            },
          ],
          suggestionsLabel: "Try cat and grep",
        },
      ],
    },
    {
      id: "counting-with-wc",
      title: "Counting with `wc`",
      blocks: [
        {
          type: "paragraph",
          text: "`wc` stands for **word count**. It can count lines, words, and bytes:",
        },
        {
          type: "code",
          code: "wc notes.txt",
          language: "bash",
          title: "count everything",
        },
        {
          type: "paragraph",
          text: "Common options focus on one measurement:",
        },
        {
          type: "code",
          code: "wc -l notes.txt\nwc -w notes.txt\nwc -c notes.txt",
          language: "bash",
          title: "line, word, and byte counts",
        },
        {
          type: "definitions",
          items: [
            {
              term: "wc -l",
              description: "Count **lines**.",
            },
            {
              term: "wc -w",
              description: "Count **words**.",
            },
            {
              term: "wc -c",
              description: "Count **bytes**.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "`wc` also works with piped input:",
        },
        {
          type: "code",
          code: "cat notes.txt | wc -l",
          language: "bash",
          title: "count piped lines",
        },
        {
          type: "callout",
          title: "Everyday pattern",
          text: "`wc -l` is commonly used when you want to know how many lines are present — for example after filtering with `grep`.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            { command: "wc notes.txt", label: "wc notes.txt" },
            { command: "wc -l notes.txt", label: "wc -l notes.txt" },
            { command: "wc -w notes.txt", label: "wc -w notes.txt" },
            { command: "wc -c notes.txt", label: "wc -c notes.txt" },
            {
              command: "cat notes.txt | wc -l",
              label: "cat notes.txt | wc -l",
            },
          ],
          suggestionsLabel: "Try wc",
        },
      ],
    },
    {
      id: "sorting-with-sort",
      title: "Sorting with `sort`",
      blocks: [
        {
          type: "paragraph",
          text: "`sort` orders lines. Start with a simple file of names:",
        },
        {
          type: "code",
          code: "sort names.txt",
          language: "bash",
          title: "sort lines",
        },
        {
          type: "paragraph",
          text: "Use `-r` for reverse order:",
        },
        {
          type: "code",
          code: "sort -r names.txt",
          language: "bash",
          title: "reverse sort",
        },
        {
          type: "list",
          items: [
            "Normal sorting arranges lines in ascending order.",
            "Reverse sorting (`-r`) arranges lines in descending order.",
            "`sort` prints a sorted result — it does **not** change the original file by itself.",
          ],
        },
        {
          type: "paragraph",
          text: "You can also sort piped input:",
        },
        {
          type: "code",
          code: "cat names.txt | sort",
          language: "bash",
          title: "sort from a pipe",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            { command: "sort names.txt", label: "sort names.txt" },
            { command: "sort -r names.txt", label: "sort -r names.txt" },
            {
              command: "cat names.txt | sort",
              label: "cat names.txt | sort",
            },
          ],
          suggestionsLabel: "Try sort",
        },
      ],
    },
    {
      id: "removing-repeated-lines-with-uniq",
      title: "Removing Repeated Lines with `uniq`",
      blocks: [
        {
          type: "paragraph",
          text: "`uniq` removes repeated **adjacent** lines. That detail matters.",
        },
        {
          type: "code",
          code: "uniq names.txt",
          language: "bash",
          title: "collapse adjacent duplicates",
        },
        {
          type: "paragraph",
          text: "Imagine this input:",
        },
        {
          type: "code",
          code: "apple\napple\nbanana\nbanana\norange",
          language: "text",
          title: "adjacent duplicates",
        },
        {
          type: "paragraph",
          text: "After `uniq`, the output becomes:",
        },
        {
          type: "code",
          code: "apple\nbanana\norange",
          language: "text",
          title: "uniq result",
        },
        {
          type: "callout",
          title: "Adjacent only",
          text: "Basic `uniq` only collapses duplicates that sit next to each other. Scattered duplicates stay unless you sort first.",
        },
        {
          type: "paragraph",
          text: "That is why this pattern is so common:",
        },
        {
          type: "code",
          code: "sort names.txt | uniq",
          language: "bash",
          title: "sort then uniq",
        },
        {
          type: "paragraph",
          text: "Sorting brings identical lines together, so `uniq` can remove them. To count occurrences, add `-c`:",
        },
        {
          type: "code",
          code: "sort names.txt | uniq -c",
          language: "bash",
          title: "count duplicates",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            { command: "uniq names.txt", label: "uniq names.txt" },
            {
              command: "sort names.txt | uniq",
              label: "sort names.txt | uniq",
            },
            {
              command: "sort names.txt | uniq -c",
              label: "sort names.txt | uniq -c",
            },
          ],
          suggestionsLabel: "Try uniq",
        },
      ],
    },
    {
      id: "extracting-fields-with-cut",
      title: "Extracting Fields with `cut`",
      blocks: [
        {
          type: "paragraph",
          text: "Some text is structured with a delimiter between fields. For example:",
        },
        {
          type: "code",
          code: "bunsal:1000:developers\nalice:1001:developers\nroot:0:root",
          language: "text",
          title: "colon-separated fields",
        },
        {
          type: "paragraph",
          text: "`cut` extracts selected fields:",
        },
        {
          type: "code",
          code: "cut -d: -f1 users.txt",
          language: "bash",
          title: "first field",
        },
        {
          type: "list",
          items: [
            "`-d:` → use `:` as the **delimiter**",
            "`-f1` → select **field 1** (fields start at 1)",
          ],
        },
        {
          type: "paragraph",
          text: "Select other fields the same way:",
        },
        {
          type: "code",
          code: "cut -d: -f2 users.txt\ncut -d: -f1,3 users.txt",
          language: "bash",
          title: "field 2, and fields 1 and 3",
        },
        {
          type: "note",
          text: "This lesson focuses on simple field extraction. Complex CSV parsing belongs later.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            {
              command: "cut -d: -f1 users.txt",
              label: "cut -d: -f1 users.txt",
            },
            {
              command: "cut -d: -f2 users.txt",
              label: "cut -d: -f2 users.txt",
            },
            {
              command: "cut -d: -f1,3 users.txt",
              label: "cut -d: -f1,3 users.txt",
            },
          ],
          suggestionsLabel: "Try cut",
        },
      ],
    },
    {
      id: "combining-text-processing-commands",
      title: "Combining Text-Processing Commands",
      blocks: [
        {
          type: "paragraph",
          text: "These tools become powerful when combined. Extract groups, sort them, then remove duplicates:",
        },
        {
          type: "code",
          code: "cat users.txt | cut -d: -f3 | sort | uniq",
          language: "bash",
          title: "unique groups",
        },
        {
          type: "paragraph",
          text: "The flow looks like this:",
        },
        {
          type: "code",
          code: "users.txt\n   ↓\ncut\n   ↓\ngroup names\n   ↓\nsort\n   ↓\nuniq\n   ↓\nunique groups",
          language: "text",
          title: "pipeline flow",
        },
        {
          type: "paragraph",
          text: "Another useful combination counts sorted names:",
        },
        {
          type: "code",
          code: "cat names.txt | sort | uniq -c",
          language: "bash",
          title: "count each name",
        },
        {
          type: "callout",
          title: "Compose small tools",
          text: "Linux command-line workflows often combine several small tools instead of relying on one giant command. Build the pipeline one stage at a time.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            {
              command: "cat users.txt | cut -d: -f3 | sort | uniq",
              label: "cat users.txt | cut -d: -f3 | sort | uniq",
            },
            {
              command: "cat names.txt | sort | uniq -c",
              label: "cat names.txt | sort | uniq -c",
            },
          ],
          suggestionsLabel: "Try combined pipelines",
        },
      ],
    },
    {
      id: "head-and-tail",
      title: "`head` and `tail`",
      blocks: [
        {
          type: "paragraph",
          text: "`head` shows the beginning of input. `tail` shows the end:",
        },
        {
          type: "code",
          code: "head notes.txt\ntail notes.txt",
          language: "bash",
          title: "beginning and end",
        },
        {
          type: "paragraph",
          text: "Use `-n` to control how many lines appear:",
        },
        {
          type: "code",
          code: "head -n 5 notes.txt\ntail -n 5 notes.txt",
          language: "bash",
          title: "first and last five lines",
        },
        {
          type: "list",
          items: [
            "`head` shows the **beginning** of input.",
            "`tail` shows the **end** of input.",
            "`-n` controls the **number of lines**.",
          ],
        },
        {
          type: "paragraph",
          text: "Both work well in pipelines, including with log files:",
        },
        {
          type: "code",
          code: "cat /var/log/app.log | head -n 5\ncat /var/log/app.log | tail -n 5",
          language: "bash",
          title: "inspect log edges",
        },
        {
          type: "note",
          text: "Real-time log following with `tail -f` belongs to a later topic. This lesson stays with static inspection.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            { command: "head -n 5 notes.txt", label: "head -n 5 notes.txt" },
            { command: "tail -n 5 notes.txt", label: "tail -n 5 notes.txt" },
            {
              command: "cat /var/log/app.log | head -n 5",
              label: "cat /var/log/app.log | head -n 5",
            },
            {
              command: "cat /var/log/app.log | tail -n 5",
              label: "cat /var/log/app.log | tail -n 5",
            },
          ],
          suggestionsLabel: "Try head and tail",
        },
      ],
    },
    {
      id: "building-useful-pipelines",
      title: "Building Useful Pipelines",
      blocks: [
        {
          type: "paragraph",
          text: "Realistic combinations often look longer at first glance. Read them one stage at a time.",
        },
        {
          type: "code",
          code: "cat users.txt | cut -d: -f3 | sort | uniq",
          language: "bash",
          title: "unique groups again",
        },
        {
          type: "paragraph",
          text: "Another pipeline counts names, then sorts the counts from highest to lowest:",
        },
        {
          type: "code",
          code: "cat names.txt | sort | uniq -c | sort -r",
          language: "bash",
          title: "ranked counts",
        },
        {
          type: "paragraph",
          text: "A visual flow for the ranked-count idea:",
        },
        {
          type: "code",
          code: "Input\n  ↓\ncut\n  ↓\nsort\n  ↓\nuniq\n  ↓\nsort\n  ↓\nFinal result",
          language: "text",
          title: "stage by stage",
        },
        {
          type: "callout",
          title: "Main lesson",
          text: "Start with a simple command, then add one transformation at a time. Understand each stage before you lengthen the pipeline.",
        },
        {
          type: "terminal",
          preset: "text-processing",
          suggestions: [
            {
              command: "cat users.txt | cut -d: -f3 | sort | uniq",
              label: "cat users.txt | cut -d: -f3 | sort | uniq",
            },
            {
              command: "cat names.txt | sort | uniq -c | sort -r",
              label: "cat names.txt | sort | uniq -c | sort -r",
            },
            {
              command: 'cat notes.txt | grep "Linux" | wc -l',
              label: 'cat notes.txt | grep "Linux" | wc -l',
            },
          ],
          suggestionsLabel: "Build pipelines",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "text-processing-practice",
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
          text: "Mistake 1 — Thinking `uniq` removes every duplicate",
        },
        {
          type: "paragraph",
          text: "`uniq` only removes **adjacent** duplicates. Scattered duplicates stay unless you sort first.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 2 — Forgetting to sort before `uniq`",
        },
        {
          type: "paragraph",
          text: "When identical lines are not next to each other, use `sort ... | uniq` so duplicates become adjacent.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 3 — Confusing `-l` with `-w` in `wc`",
        },
        {
          type: "paragraph",
          text: "`-l` counts lines. `-w` counts words. Use the option that matches the question you are asking.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 4 — Forgetting that `cut -f` starts at 1",
        },
        {
          type: "paragraph",
          text: "Field numbers start at **1**, not 0. The first field is `-f1`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 5 — Using the wrong delimiter with `cut`",
        },
        {
          type: "paragraph",
          text: "If fields are separated by `:`, use `-d:`. The wrong delimiter produces empty or unexpected fields.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 6 — Thinking `sort` changes the original file",
        },
        {
          type: "paragraph",
          text: "`sort` prints a sorted result. The original file stays unchanged unless you redirect output into a file.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 7 — Assuming pipelines modify files automatically",
        },
        {
          type: "paragraph",
          text: "A pipeline transforms a stream of text. To save that result, redirect with `>` or `>>`.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 8 — Building very long commands too early",
        },
        {
          type: "paragraph",
          text: "Understand each step first. Add one transformation at a time so you can see what each tool contributes.",
        },
        {
          type: "heading",
          level: 3,
          text: "Mistake 9 — Assuming the simulator is a real Linux shell",
        },
        {
          type: "paragraph",
          text: "This learning terminal only processes its in-memory teaching files. It never runs a real shell or touches your computer's filesystem.",
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
          code: "wc       → count lines, words, bytes\nsort     → sort lines\nuniq     → remove/count repeated adjacent lines\ncut      → extract fields\nhead     → show beginning\ntail     → show end\ngrep     → filter matching text\n|        → connect commands",
          language: "text",
          title: "quick reference",
        },
        {
          type: "paragraph",
          text: "Mental model:",
        },
        {
          type: "code",
          code: "Find useful text\n      ↓\nFilter it\n      ↓\nExtract what you need\n      ↓\nSort it\n      ↓\nRemove/count duplicates\n      ↓\nInspect the result",
          language: "text",
          title: "remember",
        },
        {
          type: "table",
          caption: "Text-processing quick reference",
          headers: ["Tool / option", "Purpose"],
          rows: [
            ["`wc`", "Count lines, words, and bytes"],
            ["`wc -l`", "Count lines"],
            ["`sort`", "Sort lines"],
            ["`sort -r`", "Reverse sort"],
            ["`uniq`", "Remove adjacent duplicate lines"],
            ["`uniq -c`", "Count adjacent duplicates"],
            ["`cut -d -f`", "Extract fields with a delimiter"],
            ["`head`", "Show the beginning of input"],
            ["`tail`", "Show the end of input"],
            ["`grep`", "Filter matching text"],
            ["`|`", "Pipe one command’s output into another"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
