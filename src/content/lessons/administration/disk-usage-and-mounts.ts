import type { Lesson } from "@/types/lesson";

export const diskUsageAndMountsLesson = {
  slug: "disk-usage-and-mounts",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "20–25 min read",
  title: "Disk Usage and Mounts",
  description:
    "Learn how to inspect filesystem capacity with df, find directory usage with du, and understand mounting and unmounting filesystems.",
  seoTitle: "Disk Usage and Mounts — Linux Administration | Rean Linux",
  seoDescription:
    "Learn Linux disk usage and mounts: df, du, mount, umount, and findmnt — inspect filesystem capacity, locate large directories, and practice safe simulated mounts.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Disk Usage and Mounts" },
  ],
  navigation: {
    previous: {
      label: "Storage and Filesystems",
      href: "/learn/administration/storage-and-filesystems",
      unavailable: true,
    },
    next: {
      label: "Networking Fundamentals",
      href: "/learn/administration/networking-fundamentals",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "In [Storage and Filesystems](/learn/administration/storage-and-filesystems) you met disks, partitions, and filesystems. This lesson focuses on the everyday questions administrators ask next: **how much space is left**, **what is using it**, and **how mounts connect filesystems to directories** — all in a safe simulated terminal.",
    },
  ],
  sections: [
    {
      id: "two-storage-questions",
      title: "Two Different Storage Questions",
      blocks: [
        {
          type: "paragraph",
          text: "When storage looks tight, start by separating two questions:",
        },
        {
          type: "list",
          items: [
            "**How much space is available on the filesystem?**",
            "**Which files or directories are using that space?**",
          ],
        },
        {
          type: "code",
          code: "df → filesystem usage\ndu → file/directory usage",
          language: "text",
          title: "core distinction",
        },
        {
          type: "callout",
          title: "Keep this distinction",
          text: "`df` answers capacity questions about a **mounted filesystem**. `du` answers usage questions about **paths** under that filesystem. Mixing them up is a common troubleshooting mistake.",
        },
      ],
    },
    {
      id: "checking-with-df",
      title: "Checking Filesystem Space with df",
      blocks: [
        {
          type: "paragraph",
          text: "Start with:",
        },
        {
          type: "code",
          code: "df",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Then prefer the human-readable form:",
        },
        {
          type: "code",
          code: "df -h",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`-h` means **human-readable** sizes (G, M) instead of raw block counts.",
        },
        {
          type: "code",
          code: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        20G   8G   12G  40% /\n/dev/sda2        70G  22G   48G  32% /home",
          language: "text",
          title: "example output",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Size",
              description: "Total capacity of the filesystem",
            },
            {
              term: "Used",
              description: "Space currently consumed",
            },
            {
              term: "Avail",
              description: "Space still available",
            },
            {
              term: "Use%",
              description: "Used space as a percentage of capacity",
            },
            {
              term: "Mounted on",
              description: "Directory where the filesystem is attached",
            },
          ],
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "df", label: "df" },
            { command: "df -h", label: "df -h" },
          ],
          suggestionsLabel: "Try df",
        },
      ],
    },
    {
      id: "reading-percentages",
      title: "Reading Disk Usage Percentages",
      blocks: [
        {
          type: "paragraph",
          text: "Use% is a quick signal, but thresholds depend on the system and workload. Rough educational examples:",
        },
        {
          type: "list",
          items: [
            "`40%` → plenty of free space",
            "`75%` → monitor usage",
            "`90%` → investigate",
            "`100%` → filesystem is full",
          ],
        },
        {
          type: "note",
          text: "These are **not** universal operational rules. A busy database server and a quiet desktop may need different thresholds. Treat Use% as a prompt to look closer — not as a fixed alarm policy.",
        },
      ],
    },
    {
      id: "finding-directory-usage",
      title: "Finding Which Directories Use Space",
      blocks: [
        {
          type: "paragraph",
          text: "After `df` shows a filesystem is filling up, use `du` to see **where** space is going:",
        },
        {
          type: "code",
          code: "du",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Human-readable form:",
        },
        {
          type: "code",
          code: "du -h",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Summary for one path:",
        },
        {
          type: "code",
          code: "du -sh /home",
          language: "bash",
          title: "command",
        },
        {
          type: "list",
          items: [
            "`du` estimates file and directory space usage",
            "`-h` makes values easier to read",
            "`-s` provides a **summary** for the path",
          ],
        },
        {
          type: "code",
          code: "6.5G\t/home",
          language: "text",
          title: "example output",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "du -h", label: "du -h" },
            { command: "du -sh /home", label: "du -sh /home" },
          ],
          suggestionsLabel: "Try du",
        },
      ],
    },
    {
      id: "inspecting-subdirectories",
      title: "Inspecting Subdirectories",
      blocks: [
        {
          type: "paragraph",
          text: "To explore under a directory:",
        },
        {
          type: "code",
          code: "du -h /var",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "To limit depth to one level of subdirectories:",
        },
        {
          type: "code",
          code: "du -h --max-depth=1 /var",
          language: "bash",
          title: "command",
        },
        {
          type: "code",
          code: "1.2G\t/var/log\n850M\t/var/cache\n120M\t/var/tmp\n2.3G\t/var",
          language: "text",
          title: "example output",
        },
        {
          type: "paragraph",
          text: "This pattern helps identify which directories consume large amounts of storage. Exact `du` options can vary across implementations — this lesson and simulator support the documented educational form.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "du -h /var", label: "du -h /var" },
            {
              command: "du -h --max-depth=1 /var",
              label: "du -h --max-depth=1 /var",
            },
          ],
          suggestionsLabel: "Inspect /var",
        },
      ],
    },
    {
      id: "finding-large-files",
      title: "Finding Large Files",
      blocks: [
        {
          type: "paragraph",
          text: "To include **files** as well as directories:",
        },
        {
          type: "code",
          code: "du -ah /var",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`-a` means all entries — files and directories. Keep the focus on understanding disk usage; searching and sorting tools were covered earlier.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [{ command: "du -ah /var", label: "du -ah /var" }],
          suggestionsLabel: "Include files",
        },
      ],
    },
    {
      id: "what-is-a-mount",
      title: "What Is a Mount?",
      blocks: [
        {
          type: "paragraph",
          text: "From the previous storage lesson, devices map to mount points:",
        },
        {
          type: "code",
          code: "/dev/sda1 → /\n/dev/sda2 → /home",
          language: "text",
          title: "review",
        },
        {
          type: "paragraph",
          text: "**Mounting** makes a filesystem accessible through a directory (the mount point).",
        },
        {
          type: "code",
          code: "Device:\n    /dev/sdb1\n\nFilesystem:\n    ext4\n\nMount point:\n    /data",
          language: "text",
          title: "example",
        },
        {
          type: "code",
          code: "/dev/sdb1\n     ↓\n    /data",
          language: "text",
          title: "conceptually",
        },
        {
          type: "note",
          text: "The device and filesystem still exist when unmounted — they are just not attached to a directory path until you mount them again.",
        },
      ],
    },
    {
      id: "inspecting-mounts",
      title: "Inspecting Mounted Filesystems",
      blocks: [
        {
          type: "paragraph",
          text: "`mount` without arguments can display mounted filesystems:",
        },
        {
          type: "code",
          code: "mount",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`findmnt` is a more structured way to inspect mounts:",
        },
        {
          type: "code",
          code: "findmnt",
          language: "bash",
          title: "command",
        },
        {
          type: "code",
          code: "TARGET SOURCE    FSTYPE\n/      /dev/sda1 ext4\n/home  /dev/sda2 ext4\n/data  /dev/sdb1 ext4",
          language: "text",
          title: "example (after mounting /data)",
        },
        {
          type: "note",
          text: "In this lesson, `findmnt` is informational — use it to read the mount table, not to change mounts.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "mount", label: "mount" },
            { command: "findmnt", label: "findmnt" },
          ],
          suggestionsLabel: "Inspect mounts",
        },
      ],
    },
    {
      id: "mounting-a-filesystem",
      title: "Mounting a Filesystem",
      blocks: [
        {
          type: "paragraph",
          text: "Conceptually:",
        },
        {
          type: "code",
          code: "sudo mount /dev/sdb1 /data",
          language: "bash",
          title: "command",
        },
        {
          type: "definitions",
          items: [
            {
              term: "sudo",
              description:
                "Elevated privileges (mounting usually needs admin rights)",
            },
            {
              term: "mount",
              description: "Attach a filesystem to a directory",
            },
            {
              term: "/dev/sdb1",
              description: "The block device / filesystem source",
            },
            {
              term: "/data",
              description: "The mount point directory",
            },
          ],
        },
        {
          type: "callout",
          title: "Simulation only",
          text: "This learning terminal never runs a real mount. It only updates **in-memory** simulated state so you can practice safely.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            {
              command: "sudo mount /dev/sdb1 /data",
              label: "mount /dev/sdb1",
            },
            { command: "findmnt", label: "findmnt" },
          ],
          suggestionsLabel: "Mount /data",
        },
      ],
    },
    {
      id: "unmounting-a-filesystem",
      title: "Unmounting a Filesystem",
      blocks: [
        {
          type: "paragraph",
          text: "To disconnect a filesystem from its mount point:",
        },
        {
          type: "code",
          code: "sudo umount /data",
          language: "bash",
          title: "command",
        },
        {
          type: "callout",
          title: "Important distinction",
          text: "**Unmounting does not mean deleting the filesystem.** It only removes the mount relationship. The device and its data remain.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "sudo umount /data", label: "umount /data" },
            { command: "findmnt", label: "findmnt" },
          ],
          suggestionsLabel: "Unmount /data",
        },
      ],
    },
    {
      id: "mounted-vs-unmounted",
      title: "Mounted vs Unmounted",
      blocks: [
        {
          type: "compare-grid",
          columns: [
            {
              title: "Before mounting",
              blocks: [
                {
                  type: "code",
                  code: "/dev/sdb1\nFilesystem: ext4\nMount point: -",
                  language: "text",
                },
              ],
            },
            {
              title: "After mounting",
              blocks: [
                {
                  type: "code",
                  code: "/dev/sdb1\nFilesystem: ext4\nMount point: /data",
                  language: "text",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          text: "The underlying filesystem still exists either way. Only its accessibility through the directory tree has changed.",
        },
      ],
    },
    {
      id: "why-mounts-matter",
      title: "Why Mounts Matter",
      blocks: [
        {
          type: "paragraph",
          text: "Servers commonly use multiple filesystems or storage devices for different purposes:",
        },
        {
          type: "list",
          items: [
            "Separate `/home` for user data",
            "External storage",
            "Data disks",
            "Backup drives",
            "Application storage",
          ],
        },
        {
          type: "paragraph",
          text: "Knowing which device is mounted where — and verifying before you change storage — helps avoid damaging the wrong filesystem.",
        },
      ],
    },
    {
      id: "troubleshooting-full-root",
      title: "Troubleshooting: Almost-Full Root",
      blocks: [
        {
          type: "paragraph",
          text: "A simplified workflow when a server reports that `/` is almost full:",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 1 — Check filesystem usage",
        },
        {
          type: "code",
          code: "df -h",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 2 — Investigate a likely directory",
        },
        {
          type: "code",
          code: "du -h --max-depth=1 /var",
          language: "bash",
          title: "command",
        },
        {
          type: "heading",
          level: 3,
          text: "Step 3 — Identify the largest directory",
        },
        {
          type: "paragraph",
          text: "In the simulated `/var` tree, `/var/log` is the largest consumer. That is enough to decide where to look next in a real investigation.",
        },
        {
          type: "note",
          text: "This is a simplified troubleshooting workflow — not a complete automated remediation system.",
        },
        {
          type: "terminal",
          preset: "disk-usage-and-mounts",
          suggestions: [
            { command: "df -h", label: "df -h" },
            {
              command: "du -h --max-depth=1 /var",
              label: "du /var depth 1",
            },
          ],
          suggestionsLabel: "Troubleshoot storage",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through seven short exercises in one simulated terminal: check filesystem and directory usage, inspect mounts, mount a data disk, verify it, and unmount it.",
        },
        {
          type: "exercise",
          id: "disk-usage-and-mounts-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "disk-usage-and-mounts-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain and practice basic storage inspection:",
        },
        {
          type: "list",
          items: [
            "`df` shows filesystem-level capacity and usage",
            "`du` helps identify file and directory usage",
            "`mount` makes a filesystem accessible at a directory",
            "`umount` removes that mount relationship",
            "`findmnt` helps inspect mounted filesystems",
            "A filesystem and its mount point are different concepts",
            "Storage troubleshooting often starts with `df`, then uses `du` to locate where space is consumed",
            "Never make destructive storage changes without understanding the target device and filesystem",
          ],
        },
        {
          type: "table",
          caption: "Command reference for disk usage and mounts",
          headers: ["Command", "Purpose"],
          rows: [
            ["`df -h`", "Filesystem capacity (human-readable)"],
            ["`du -sh PATH`", "Summary usage for a path"],
            ["`du -h --max-depth=1 PATH`", "One level of subdirectory usage"],
            ["`du -ah PATH`", "Include files as well as directories"],
            ["`mount`", "List mounted filesystems"],
            ["`findmnt`", "Structured mount table"],
            ["`sudo mount DEVICE DIR`", "Mount a filesystem"],
            ["`sudo umount DIR`", "Unmount a filesystem"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
