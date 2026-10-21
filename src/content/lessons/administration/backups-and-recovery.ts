import type { Lesson } from "@/types/lesson";

export const backupsAndRecoveryLesson = {
  slug: "backups-and-recovery",
  level: "administration",
  levelNumber: "03",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Backups and Recovery",
  description:
    "Learn backup strategies, tar archives, verification, and safe restores in a simulated lab — never writing real backups on your computer.",
  seoTitle: "Backups and Recovery — Linux Administration | Rean Linux",
  seoDescription:
    "Practice Linux backups and recovery with simulated tar, gzip, verification, restore drills, RTO/RPO, and a recovery checklist — entirely in the browser.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Administration", href: "/learn/administration" },
    { label: "Backups and Recovery" },
  ],
  navigation: {
    previous: {
      label: "System Monitoring and Resource Usage",
      href: "/learn/administration/system-monitoring",
    },
    next: {
      label: "Linux Administration Challenge",
      href: "/learn/administration/challenge",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [System Monitoring and Resource Usage](/learn/administration/system-monitoring), you can spot resource problems. This lesson covers **backups and recovery** — protecting data, creating and inspecting archives, verifying backups, and restoring safely — entirely in a simulated environment that never runs real `tar`/`gzip` or writes files on your host.",
    },
  ],
  sections: [
    {
      id: "why-backups-matter",
      title: "Why Backups Matter",
      blocks: [
        {
          type: "paragraph",
          text: "Backups protect against accidental deletion, disk failure, corrupted updates, ransomware, and human error. Administrators decide **what** needs protection (user data, configs, databases, application state) and **how quickly** it must be recoverable.",
        },
        {
          type: "list",
          items: [
            "User documents and project files",
            "Application configuration under `/etc` or app dirs",
            "Database dumps and application data stores",
            "Anything you cannot recreate cheaply from source control alone",
          ],
        },
        {
          type: "callout",
          title: "Learning safety",
          text: "Everything here is **simulated**. The app never creates real archives on your disk, never runs host `tar`/`gzip`/`gunzip`, and never deletes your files.",
        },
      ],
    },
    {
      id: "backup-types",
      title: "Full, Incremental, and Differential Backups",
      blocks: [
        {
          type: "paragraph",
          text: "At a conceptual level, backup types trade storage and restore complexity:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Full backup",
              description:
                "Copies everything selected. Simple to restore; larger and slower to create.",
            },
            {
              term: "Incremental backup",
              description:
                "Copies changes since the **last backup** (full or incremental). Efficient storage; restore may need a chain of sets.",
            },
            {
              term: "Differential backup",
              description:
                "Copies changes since the **last full** backup. Restore typically needs the last full plus the latest differential.",
            },
          ],
        },
        {
          type: "note",
          text: "This lab focuses on creating and verifying archives. Treat full/incremental/differential as planning concepts when you choose a schedule and retention policy.",
        },
      ],
    },
    {
      id: "what-and-where",
      title: "What to Back Up and Where to Store It",
      blocks: [
        {
          type: "paragraph",
          text: "Choose sources that matter, and destinations that survive the same failure as the original. A backup on the same nearly-full disk as the live data is weak protection.",
        },
        {
          type: "table",
          caption: "Source vs destination thinking",
          headers: ["Prefer", "Avoid as your only copy"],
          rows: [
            [
              "A separate volume or host (here: simulated `/backups`)",
              "Only a file next to the live data on the same failing disk",
            ],
            [
              "Clear naming with dates and scope",
              "Vague names like `stuff.tar` with no verification",
            ],
            [
              "Access-controlled backup storage",
              "World-readable copies of confidential data",
            ],
          ],
        },
        {
          type: "code",
          code: "ls -lh documents\nls -lh /backups\ndf -h",
          title: "Inspect sources, destinations, and free space",
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            { command: "ls -lh documents", label: "ls documents" },
            { command: "ls -lh /backups", label: "ls /backups" },
            { command: "df -h", label: "df -h" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Sources and destinations",
        },
      ],
    },
    {
      id: "archives-vs-backups",
      title: "Archives Versus Actual Backups",
      blocks: [
        {
          type: "paragraph",
          text: "An **archive** (for example a `.tar` or `.tar.gz` file) packages files together. A **backup** is a recoverable protection strategy: the right data, stored safely, verified, and restore-tested. Creating `backup.tar` is a step — not proof you can recover.",
        },
        {
          type: "callout",
          title: "Key idea",
          text: "An archive is **not** automatically a reliable backup. Quality depends on **recoverability**, **verification**, and **appropriate storage** — including a separate copy when data matters.",
        },
      ],
    },
    {
      id: "creating-tar",
      title: "Creating and Inspecting tar Archives",
      blocks: [
        {
          type: "paragraph",
          text: "`tar` gathers files into an archive. In this lab you create archives into `/backups`, list their contents, then decide whether they are safe to restore from.",
        },
        {
          type: "code",
          code: "tar -cvf /backups/docs-backup.tar documents/\ntar -tvf /backups/docs-backup.tar",
          title: "Create and list a simulated archive",
        },
        {
          type: "list",
          items: [
            "`-c` create, `-t` list, `-x` extract",
            "`-v` verbose listing of member paths",
            "`-f` archive filename (required in this lab)",
          ],
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            {
              command: "tar -cvf /backups/docs-backup.tar documents/",
              label: "tar create",
            },
            {
              command: "tar -tvf /backups/docs-backup.tar",
              label: "tar list",
            },
            { command: "ls -lh /backups", label: "ls /backups" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "tar create and list",
        },
      ],
    },
    {
      id: "gzip-compression",
      title: "Using gzip Compression",
      blocks: [
        {
          type: "paragraph",
          text: "Compression shrinks archives for storage and transfer. With `tar`, add `-z` for gzip. You can also compress a single file with `gzip` and decompress with `gunzip` in this simulation.",
        },
        {
          type: "code",
          code: "tar -czvf /backups/docs-backup.tar.gz documents/\ntar -tzvf /backups/docs-backup.tar.gz\ngzip report.txt\ngunzip report.txt.gz",
          title: "Compressed archives and single-file gzip",
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            {
              command: "tar -czvf /backups/docs-backup.tar.gz documents/",
              label: "tar create gz",
            },
            {
              command: "tar -tzvf /backups/docs-backup.tar.gz",
              label: "tar list gz",
            },
            { command: "cd documents", label: "cd documents" },
            { command: "gzip report.txt", label: "gzip report" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compression commands",
        },
        {
          type: "note",
          text: "Smaller size helps, but compression does not replace verification or a separate storage location.",
        },
      ],
    },
    {
      id: "destinations-and-naming",
      title: "Destinations and Naming Conventions",
      blocks: [
        {
          type: "paragraph",
          text: "Name archives so a future you can tell **what**, **when**, and **which host**. Examples: `docs-2024-10-14.tar.gz`, `etc-weekly-full.tar`. Keep destinations consistent (here `/backups`) and check free space with `df -h` before large jobs.",
        },
        {
          type: "code",
          code: "ls -lh /backups\ndf -h",
          title: "Check backup destination and space",
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            { command: "ls -lh /backups", label: "ls /backups" },
            { command: "df -h", label: "df -h" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Destination checks",
        },
      ],
    },
    {
      id: "verify-backups",
      title: "Verifying Backups Exist and Are Readable",
      blocks: [
        {
          type: "paragraph",
          text: "After creating an archive, confirm it exists (`ls -lh /backups`) and that it **lists cleanly** (`tar -tvf`). This lab marks damaged archives so listing fails verification — never silently trust them.",
        },
        {
          type: "code",
          code: "ls -lh /backups\ntar -tvf /backups/docs-backup.tar",
          title: "Existence and readability checks",
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            { command: "ls -lh /backups", label: "ls /backups" },
            {
              command: "tar -tvf /backups/docs-backup.tar",
              label: "verify list",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Verification",
        },
      ],
    },
    {
      id: "restoring-safely",
      title: "Restoring Selected Files Safely",
      blocks: [
        {
          type: "paragraph",
          text: "Extract with `tar -xvf`. Prefer restoring into a **separate directory** first (`-C /tmp/restore-test`) so you can inspect content before overwriting live files. In-place restore explains when a simulated file would be overwritten.",
        },
        {
          type: "code",
          code: "tar -xvf /backups/docs-backup.tar -C /tmp/restore-test\nls /tmp/restore-test\ntar -xvf /backups/docs-backup.tar",
          title: "Safe test restore, then in-place restore",
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            {
              command: "tar -cvf /backups/docs-backup.tar documents/",
              label: "create first",
            },
            {
              command: "tar -xvf /backups/docs-backup.tar -C /tmp/restore-test",
              label: "safe restore",
            },
            { command: "ls /tmp/restore-test", label: "ls restore-test" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Restore practice",
        },
      ],
    },
    {
      id: "rto-rpo",
      title: "Recovery Points, RTO, and RPO",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Recovery point",
              description:
                "The moment-in-time snapshot you can restore to (for example last night’s verified backup).",
            },
            {
              term: "RPO — Recovery Point Objective",
              description:
                "How much data loss (measured in time) you can tolerate. Nightly backups imply up to ~24 hours of possible loss.",
            },
            {
              term: "RTO — Recovery Time Objective",
              description:
                "How quickly systems and data must be usable again after an incident.",
            },
          ],
        },
        {
          type: "note",
          text: "Choosing backup frequency and retention should align with RPO and RTO — not only with how convenient `tar` feels.",
        },
      ],
    },
    {
      id: "test-restores",
      title: "Test Restores — Do Not Assume",
      blocks: [
        {
          type: "paragraph",
          text: "Untested backups fail at the worst time. Periodically restore into a safe location, compare critical files, and document the result. Assuming “the file is there” is not a recovery plan.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Pick a verified archive",
            "Restore to a test path",
            "Compare content to what you expect",
            "Only then restore in place if needed",
          ],
        },
      ],
    },
    {
      id: "common-failures",
      title: "Common Backup Failures",
      blocks: [
        {
          type: "table",
          caption: "Failures you will see in this lab",
          headers: ["Failure", "What to check"],
          rows: [
            [
              "Missing source path",
              "typos in directory names; confirm with `ls`",
            ],
            [
              "Insufficient space",
              "`df -h` on `/backups` before large archives",
            ],
            [
              "Incorrect destination path",
              "parent directory must exist (for example `/backups`)",
            ],
            [
              "Incomplete / damaged archive",
              "listing fails verification — do not restore from it",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "backups-and-recovery",
          suggestions: [
            {
              command: "tar -cvf /backups/x.tar missing-dir/",
              label: "bad path",
            },
            { command: "df -h", label: "df -h" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Failure examples",
        },
      ],
    },
    {
      id: "backup-security",
      title: "Basic Backup Security",
      blocks: [
        {
          type: "paragraph",
          text: "Backups often contain the same sensitive data as production. Restrict who can read backup files, encrypt when appropriate in real environments, and **keep a separate copy** so one compromised or failed host does not erase your only recovery path.",
        },
        {
          type: "list",
          items: [
            "Access control on backup directories and files",
            "Separate storage from the primary system when data matters",
            "Do not rely on a single untested copy",
          ],
        },
      ],
    },
    {
      id: "interactive-workflow",
      title: "Interactive Backup Workflow",
      blocks: [
        {
          type: "paragraph",
          text: "Use the guided workflow to select a source, create an archive, inspect and verify it, simulate loss of a sample file (explicit confirmation), restore safely, and confirm content — all in memory.",
        },
        {
          type: "exercise",
          id: "backups-and-recovery-workflow",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Work through eight exercises: archive a directory, create a compressed backup, inspect before restore, identify an invalid backup, restore a deleted file, diagnose space/path failures, explain verification, and choose a strategy.",
        },
        {
          type: "exercise",
          id: "backups-and-recovery-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check and Recovery Checklist",
      blocks: [
        {
          type: "paragraph",
          text: "Check your understanding of backup types, archives, verification, restores, RTO/RPO, security, and recovery testing. Use the reusable checklist whenever you practice a restore.",
        },
        {
          type: "exercise",
          id: "backups-and-recovery-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to approach backups thoughtfully:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why backups matter and what data needs protection",
            "Distinguish full, incremental, and differential backups conceptually",
            "Choose sources and destinations carefully",
            "Treat archives as building blocks — not automatic proof of recoverability",
            "Create, list, compress, and verify simulated tar archives",
            "Restore safely (test directory first) and confirm content",
            "Relate recovery points to RTO and RPO",
            "Recognize common failures and basic backup security practices",
          ],
        },
        {
          type: "table",
          caption: "Command reference for backups lab",
          headers: ["Command", "Purpose"],
          rows: [
            ["`tar -cvf ARCHIVE SOURCE`", "Create an archive"],
            ["`tar -czvf ARCHIVE SOURCE`", "Create a gzip-compressed archive"],
            ["`tar -tvf ARCHIVE`", "List / verify archive contents"],
            ["`tar -tzvf ARCHIVE`", "List a compressed archive"],
            ["`tar -xvf ARCHIVE`", "Extract here"],
            ["`tar -xvf ARCHIVE -C DEST`", "Extract into DEST"],
            ["`gzip FILE` / `gunzip FILE.gz`", "Compress / decompress a file"],
            ["`ls -lh /backups`", "Confirm backup files and sizes"],
            ["`df -h`", "Check simulated free space"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next you will face the **[Linux Administration Challenge](/learn/administration/challenge)** — applying Stage 03 skills together across simulated incidents.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
