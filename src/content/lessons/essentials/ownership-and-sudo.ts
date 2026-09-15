import type { Lesson } from "@/types/lesson";

export const ownershipAndSudoLesson = {
  slug: "ownership-and-sudo",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "Ownership and sudo",
  description:
    "Understand file ownership, change owners and groups, and safely use elevated privileges with sudo.",
  seoTitle: "Ownership and sudo — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux file ownership, chown, chgrp, sudo, and how ownership and permissions work together.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Ownership and sudo" },
  ],
  navigation: {
    previous: {
      label: "File Permissions",
      href: "/learn/essentials/file-permissions",
    },
    next: {
      label: "Processes",
      href: "/learn/essentials/processes",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "So far in Linux Essentials you have learned **users and groups**, then **file permissions**. This lesson connects them:",
    },
    {
      type: "code",
      code: "Users + Groups\n       ↓\nFile Permissions\n       ↓\nOwnership + sudo",
      language: "text",
      title: "path so far",
    },
  ],
  sections: [
    {
      id: "permissions-vs-ownership",
      title: "Permissions vs Ownership",
      blocks: [
        {
          type: "paragraph",
          text: "A Linux file has both:",
        },
        {
          type: "list",
          items: ["an **owner**", "a **group owner**"],
        },
        {
          type: "paragraph",
          text: "And it also has:",
        },
        {
          type: "list",
          items: [
            "**owner** permissions",
            "**group** permissions",
            "**other** permissions",
          ],
        },
        {
          type: "paragraph",
          text: "Look at this example:",
        },
        {
          type: "code",
          code: "-rw-r-----  bunsal  developers  report.txt",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Break it down:",
        },
        {
          type: "code",
          code: "-rw-r-----\n   │ │ │\n   │ │ └── permissions for others\n   │ └──── permissions for group\n   └────── permissions for owner\n\nbunsal      → owner\ndevelopers  → group",
          language: "text",
          title: "breakdown",
        },
        {
          type: "callout",
          title: "Ownership vs permissions",
          text: "Ownership answers **“who does this file belong to?”** Permissions answer **“what can each category do with it?”**",
        },
      ],
    },
    {
      id: "file-owner-and-group",
      title: "File Owner and Group",
      blocks: [
        {
          type: "paragraph",
          text: "A file normally has two ownership identities:",
        },
        {
          type: "code",
          code: "Owner\nGroup",
          language: "text",
          title: "identities",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "report.txt\nOwner: bunsal\nGroup: developers",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "This connects directly to [Users and Groups](/learn/essentials/users-and-groups). The owner and group are **identities associated with the file** — usually a user account and a shared group.",
        },
        {
          type: "code",
          code: "                 report.txt\n                     |\n             +-------+-------+\n             |               |\n           Owner           Group\n          bunsal        developers",
          language: "text",
          title: "diagram",
        },
        {
          type: "note",
          text: "Advanced access controls such as ACLs are out of scope for this lesson.",
        },
      ],
    },
    {
      id: "reading-ownership-with-ls-l",
      title: "Reading Ownership with `ls -l`",
      blocks: [
        {
          type: "paragraph",
          text: "Use:",
        },
        {
          type: "code",
          code: "ls -l",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "-rw-r--r--  bunsal  developers  1200  report.txt",
          language: "text",
          title: "ls -l",
        },
        {
          type: "paragraph",
          text: "Important parts:",
        },
        {
          type: "code",
          code: "-rw-r--r--  → permissions\nbunsal      → owner\ndevelopers  → group\n1200        → size\nreport.txt  → filename",
          language: "text",
          title: "columns",
        },
        {
          type: "paragraph",
          text: "Directories use the same ownership idea:",
        },
        {
          type: "code",
          code: "drwxr-x---  alice  developers  4096  project",
          language: "text",
          title: "directory",
        },
        {
          type: "paragraph",
          text: "The leading `d` marks a directory. The owner and group columns still answer who the entry belongs to.",
        },
        {
          type: "terminal",
          preset: "ownership-and-sudo",
          suggestions: [{ command: "ls -l", label: "Run ls -l" }],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "changing-ownership-with-chown",
      title: "Changing Ownership with `chown`",
      blocks: [
        {
          type: "paragraph",
          text: "The command that changes ownership is:",
        },
        {
          type: "code",
          code: "chown",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`chown` changes the owner and/or group ownership of files.",
        },
        {
          type: "paragraph",
          text: "Basic syntax:",
        },
        {
          type: "code",
          code: "chown OWNER FILE",
          language: "bash",
          title: "syntax",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "sudo chown alice report.txt",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Meaning:",
        },
        {
          type: "code",
          code: "sudo       → request elevated privileges\nchown      → change ownership\nalice      → new owner\nreport.txt → target file",
          language: "text",
          title: "breakdown",
        },
        {
          type: "paragraph",
          text: "You can also change owner and group together with the `owner:group` form:",
        },
        {
          type: "code",
          code: "sudo chown alice:developers report.txt",
          language: "bash",
          title: "owner and group",
        },
        {
          type: "note",
          text: "This lesson sticks to the common forms. Recursive options and advanced flags can wait for later practice.",
        },
        {
          type: "terminal",
          preset: "ownership-and-sudo",
          suggestions: [
            { command: "ls -l", label: "Run ls -l" },
            {
              command: "sudo chown alice report.txt",
              label: "sudo chown alice report.txt",
            },
            {
              command: "sudo chown alice:developers report.txt",
              label: "sudo chown alice:developers",
            },
            { command: "ls -l", label: "Check again" },
          ],
          suggestionsLabel: "Try chown",
        },
      ],
    },
    {
      id: "changing-group-ownership-with-chgrp",
      title: "Changing Group Ownership with `chgrp`",
      blocks: [
        {
          type: "paragraph",
          text: "To change only the group, use:",
        },
        {
          type: "code",
          code: "chgrp",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "Basic syntax:",
        },
        {
          type: "code",
          code: "chgrp GROUP FILE",
          language: "bash",
          title: "syntax",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "sudo chgrp developers report.txt",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "`chgrp` changes the file’s **group ownership** while leaving the owner unchanged.",
        },
        {
          type: "code",
          code: "Before:\nalice developers\n\nAfter:\nalice engineering",
          language: "text",
          title: "before / after",
        },
        {
          type: "paragraph",
          text: "In that example, only the group moved from `developers` to `engineering`.",
        },
        {
          type: "terminal",
          preset: "ownership-and-sudo",
          suggestions: [
            { command: "ls -l", label: "Run ls -l" },
            {
              command: "sudo chgrp engineering report.txt",
              label: "sudo chgrp engineering report.txt",
            },
            { command: "ls -l", label: "Check again" },
          ],
          suggestionsLabel: "Try chgrp",
        },
      ],
    },
    {
      id: "ownership-and-permissions-together",
      title: "Ownership and Permissions Together",
      blocks: [
        {
          type: "paragraph",
          text: "Ownership and permissions work as one system. Consider:",
        },
        {
          type: "code",
          code: "-rw-r-----  alice  developers  report.txt",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Break it down by category:",
        },
        {
          type: "code",
          code: "Owner:\nalice\n→ rw-\n\nGroup:\ndevelopers\n→ r--\n\nOther:\n→ ---",
          language: "text",
          title: "meaning",
        },
        {
          type: "paragraph",
          text: "Now suppose `bunsal` is a member of `developers`. Bunsal is **not** the owner, so owner permissions do not apply. Because bunsal is in the `developers` group, the **group** permissions may apply — here, read-only access.",
        },
        {
          type: "code",
          code: "Users\n   ↓\nGroups\n   ↓\nOwnership\n   ↓\nPermissions",
          language: "text",
          title: "how it connects",
        },
        {
          type: "callout",
          title: "Main idea",
          text: "Linux first decides **which category you belong to** for a file (owner, group, or other), then applies that category’s permission bits. Users, groups, ownership, and permissions all fit together.",
        },
      ],
    },
    {
      id: "what-is-sudo",
      title: "What Is sudo?",
      blocks: [
        {
          type: "paragraph",
          text: "The command:",
        },
        {
          type: "code",
          code: "sudo",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "`sudo` allows an **authorized user** to run a command with **elevated privileges**.",
        },
        {
          type: "callout",
          title: "What sudo is not",
          text: "`sudo` does **not** mean “make everything root forever.” It applies elevated privileges to the **command being run**.",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "sudo chown alice report.txt",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "`sudo` is commonly used for administrative tasks such as changing ownership, installing software, or managing system services.",
        },
        {
          type: "note",
          text: "This lesson does not teach sudoers configuration, `/etc/sudoers`, or `visudo`. Those are advanced topics for later.",
        },
      ],
    },
    {
      id: "running-a-command-with-sudo",
      title: "Running a Command with sudo",
      blocks: [
        {
          type: "paragraph",
          text: "The general pattern is:",
        },
        {
          type: "code",
          code: "sudo COMMAND",
          language: "bash",
          title: "pattern",
        },
        {
          type: "paragraph",
          text: "Examples:",
        },
        {
          type: "code",
          code: "sudo chown alice report.txt\nsudo chgrp developers report.txt",
          language: "bash",
          title: "examples",
        },
        {
          type: "paragraph",
          text: "Everything after `sudo` is the command being run with elevated privileges.",
        },
        {
          type: "paragraph",
          text: "A harmless demonstration of the idea:",
        },
        {
          type: "code",
          code: "sudo ls /root",
          language: "bash",
          title: "demo",
        },
        {
          type: "note",
          text: "In Rean Linux, the simulator only demonstrates the concept. It does not access your real `/root` directory.",
        },
        {
          type: "callout",
          title: "Do not run random commands with sudo",
          text: "Only use `sudo` when you understand the command and why elevated privileges are needed.",
        },
        {
          type: "terminal",
          preset: "ownership-and-sudo",
          suggestions: [
            {
              command: "sudo chown alice report.txt",
              label: "sudo chown alice report.txt",
            },
            {
              command: "sudo chgrp developers report.txt",
              label: "sudo chgrp developers report.txt",
            },
            { command: "sudo ls /root", label: "sudo ls /root" },
          ],
          suggestionsLabel: "Try sudo",
        },
      ],
    },
    {
      id: "why-sudo-requires-privileges",
      title: "Why sudo Requires Privileges",
      blocks: [
        {
          type: "paragraph",
          text: "Not every user can perform every administrative operation. Changing a file’s owner is a **privileged** operation on Linux.",
        },
        {
          type: "paragraph",
          text: "Therefore this may fail for a normal user:",
        },
        {
          type: "code",
          code: "chown alice report.txt",
          language: "bash",
          title: "without sudo",
        },
        {
          type: "paragraph",
          text: "Simulated error:",
        },
        {
          type: "code",
          code: "chown: changing ownership of 'report.txt':\nOperation not permitted",
          language: "text",
          title: "error",
        },
        {
          type: "paragraph",
          text: "Using:",
        },
        {
          type: "code",
          code: "sudo chown alice report.txt",
          language: "bash",
          title: "with sudo",
        },
        {
          type: "paragraph",
          text: "requests elevated privileges — assuming the user is authorized to use `sudo`.",
        },
        {
          type: "terminal",
          preset: "ownership-and-sudo",
          suggestions: [
            { command: "chown alice report.txt", label: "chown without sudo" },
            {
              command: "sudo chown alice report.txt",
              label: "sudo chown alice report.txt",
            },
            { command: "ls -l", label: "Verify with ls -l" },
          ],
          suggestionsLabel: "Compare without and with sudo",
        },
      ],
    },
    {
      id: "using-sudo-safely",
      title: "Using sudo Safely",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "The sudo password prompt",
        },
        {
          type: "paragraph",
          text: "On a real system, Linux may ask for **your** password when you use `sudo`:",
        },
        {
          type: "code",
          code: "[sudo] password for bunsal:",
          language: "text",
          title: "prompt",
        },
        {
          type: "paragraph",
          text: "The real terminal normally does **not** display the password while you type.",
        },
        {
          type: "callout",
          title: "Rean Linux safety note",
          text: "Rean Linux never asks you to enter your real system password into this simulator. The simulator does not collect, store, or authenticate passwords.",
        },
        {
          type: "heading",
          level: 3,
          text: "Think Before You Use sudo",
        },
        {
          type: "list",
          items: [
            "`sudo` gives a command elevated privileges",
            "Mistakes can affect important system files",
            "Do not copy/paste commands blindly",
            "Understand the command before running it",
            "Use the smallest amount of privilege necessary",
            "Avoid using `sudo` just because a command failed",
          ],
        },
        {
          type: "paragraph",
          text: "Destructive commands become more dangerous with elevated privileges. For example, a recursive delete run with `sudo` can remove far more than you intended. Treat every `sudo` command as an administrative action.",
        },
        {
          type: "callout",
          title: "Think Before You Use sudo",
          text: "If you do not understand a command — especially one that includes `sudo` — do not run it. Ask, read the documentation, or practice in a safe environment first.",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "ownership-and-sudo-practice",
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
                "Confusing the owner with the group",
                "Thinking `chmod` changes ownership",
                "Thinking `chown` changes permissions",
                "Using `sudo` for every command",
                "Assuming `sudo` makes the current user permanently root",
                "Copying commands containing `sudo` without understanding them",
                "Changing ownership recursively without understanding the impact",
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
          text: "You should now be able to explain how ownership and elevated privileges fit with permissions:",
        },
        {
          type: "list",
          items: [
            "Files have an owner and a group owner",
            "Permissions control what users can do",
            "`ls -l` shows permissions, owner, and group",
            "`chown` changes ownership",
            "`chgrp` changes group ownership",
            "`sudo` runs an authorized command with elevated privileges",
            "Administrative privileges should be used carefully",
            "Ownership and permissions work together",
          ],
        },
        {
          type: "table",
          caption: "Command reference for ownership and sudo",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ls -l`", "List files with permissions, owner, and group"],
            ["`chown OWNER FILE`", "Change the file owner"],
            ["`chown OWNER:GROUP FILE`", "Change owner and group together"],
            ["`chgrp GROUP FILE`", "Change only the group owner"],
            ["`sudo COMMAND`", "Run a command with elevated privileges"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
