import type { Lesson } from "@/types/lesson";

export const filePermissionsLesson = {
  slug: "file-permissions",
  level: "essentials",
  levelNumber: "02",
  difficulty: "Intermediate",
  readingTime: "20–25 min read",
  title: "File Permissions",
  description:
    "Learn how Linux controls who can read, write, and execute files and directories.",
  seoTitle: "File Permissions — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn Linux file permissions, rwx, owner, group, other, chmod, symbolic permissions, and numeric permissions such as 644 and 755.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "File Permissions" },
  ],
  navigation: {
    previous: {
      label: "Users and Groups",
      href: "/learn/essentials/users-and-groups",
    },
    next: {
      label: "Ownership and sudo",
      href: "/learn/essentials/ownership-and-sudo",
      unavailable: true,
    },
  },
  sections: [
    {
      id: "why-file-permissions-matter",
      title: "Why File Permissions Matter",
      blocks: [
        {
          type: "paragraph",
          text: "Linux is a **multi-user** system. Many identities can share one machine — so Linux needs a clear way to control who can access each file and directory.",
        },
        {
          type: "paragraph",
          text: "Imagine a small project folder:",
        },
        {
          type: "code",
          code: "project/\n├── app.js\n├── config.json\n└── deploy.sh",
          language: "text",
          title: "project/",
        },
        {
          type: "paragraph",
          text: "Different people may need different access. For example:",
        },
        {
          type: "list",
          items: [
            "the **owner** can read and modify the files",
            "**group** members can read them",
            "**everyone else** has no access",
          ],
        },
        {
          type: "callout",
          title: "Scope for this lesson",
          text: "This lesson covers the classic owner / group / other permission model. Advanced systems like ACLs, SELinux, and AppArmor are out of scope for now.",
        },
      ],
    },
    {
      id: "the-permission-model",
      title: "The Permission Model",
      blocks: [
        {
          type: "paragraph",
          text: "Every file and directory has permissions for three categories of identity:",
        },
        {
          type: "code",
          code: "user\ngroup\nother",
          language: "text",
          title: "categories",
        },
        {
          type: "paragraph",
          text: "You will often see this shorthand:",
        },
        {
          type: "code",
          code: "u = user / owner\ng = group\no = other\na = all",
          language: "text",
          title: "shorthand",
        },
        {
          type: "code",
          code: "             Permissions\n                  |\n       +----------+----------+\n       |          |          |\n     user       group      other",
          language: "text",
          title: "diagram",
        },
        {
          type: "paragraph",
          text: "This connects directly to the previous lesson. **Users** and **groups** are the identities. **Permissions** decide what those identities are allowed to do with a specific file or directory.",
        },
      ],
    },
    {
      id: "owner-group-and-other",
      title: "Owner, Group, and Other",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Owner (user)",
              description:
                "Usually the account that created the file. Represented by `u` in symbolic `chmod` mode.",
            },
            {
              term: "Group",
              description:
                "A shared identity that can receive its own permission set. Represented by `g`.",
            },
            {
              term: "Other",
              description:
                "Everyone who is neither the owner nor in the file’s group. Represented by `o`.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Permissions for these three categories are stored **independently**. Giving the owner write access does not automatically give write access to the group or to other users.",
        },
        {
          type: "table",
          caption: "Permission symbols applied to each category",
          headers: ["Symbol", "User", "Group", "Other"],
          rows: [
            ["`r`", "read", "read", "read"],
            ["`w`", "write", "write", "write"],
            ["`x`", "execute/search", "execute/search", "execute/search"],
          ],
        },
        {
          type: "paragraph",
          text: "The same `rwx` symbols are applied separately to each category. For example:",
        },
        {
          type: "code",
          code: "rwx r-x r--",
          language: "text",
          title: "triplets",
        },
        {
          type: "paragraph",
          text: "means:",
        },
        {
          type: "code",
          code: "owner → rwx\ngroup → r-x\nother → r--",
          language: "text",
          title: "meaning",
        },
      ],
    },
    {
      id: "read-write-and-execute",
      title: "Read, Write, and Execute",
      blocks: [
        {
          type: "paragraph",
          text: "Each category can receive any combination of three permission bits:",
        },
        {
          type: "code",
          code: "r = read\nw = write\nx = execute",
          language: "text",
          title: "bits",
        },
        {
          type: "heading",
          level: 3,
          text: "For files",
        },
        {
          type: "table",
          caption: "File permission meanings",
          headers: ["Permission", "Meaning"],
          rows: [
            ["`r`", "Read file contents"],
            ["`w`", "Modify file contents"],
            ["`x`", "Execute the file as a program"],
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "For directories",
        },
        {
          type: "paragraph",
          text: "Directory permissions use the same letters, but the meaning is different:",
        },
        {
          type: "table",
          caption: "Directory permission meanings",
          headers: ["Permission", "Meaning"],
          rows: [
            ["`r`", "List directory entries"],
            [
              "`w`",
              "Create/delete/rename entries when combined with appropriate access",
            ],
            ["`x`", "Enter/search the directory"],
          ],
        },
        {
          type: "callout",
          title: "Directory execute is search",
          text: "On a directory, `x` does **not** mean “execute the directory like a program.” It means you can **traverse** or **search** that path — for example, enter it with `cd` or resolve a file inside it.",
        },
      ],
    },
    {
      id: "reading-permission-strings",
      title: "Reading Permission Strings",
      blocks: [
        {
          type: "paragraph",
          text: "The most common way to inspect permissions is:",
        },
        {
          type: "code",
          code: "ls -l",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "A typical permission string looks like this:",
        },
        {
          type: "code",
          code: "-rwxr-xr--",
          language: "text",
          title: "permission string",
        },
        {
          type: "paragraph",
          text: "Break it into pieces:",
        },
        {
          type: "code",
          code: "- rwx r-x r--\n  │   │   │\n  │   │   └── other\n  │   └────── group\n  └────────── owner",
          language: "text",
          title: "breakdown",
        },
        {
          type: "paragraph",
          text: "The first character describes the entry type:",
        },
        {
          type: "list",
          items: ["`-` means a regular file", "`d` means a directory"],
        },
        {
          type: "paragraph",
          text: "Directory example:",
        },
        {
          type: "code",
          code: "drwxr-xr-x",
          language: "text",
          title: "directory string",
        },
        {
          type: "note",
          text: "Symbolic links use `l` and other special types exist, but this lesson stays with regular files and directories.",
        },
        {
          type: "terminal",
          preset: "file-permissions",
          suggestions: [{ command: "ls -l", label: "Run ls -l" }],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "permissions-for-files",
      title: "Permissions for Files",
      blocks: [
        {
          type: "paragraph",
          text: "Here is a common file mode:",
        },
        {
          type: "code",
          code: "-rw-r--r--",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Meaning:",
        },
        {
          type: "code",
          code: "owner → read + write\ngroup → read\nother → read",
          language: "text",
          title: "meaning",
        },
        {
          type: "paragraph",
          text: "Another example — private and executable only for the owner:",
        },
        {
          type: "code",
          code: "-rwx------",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Meaning:",
        },
        {
          type: "code",
          code: "owner → read + write + execute\ngroup → no permissions\nother → no permissions",
          language: "text",
          title: "meaning",
        },
        {
          type: "callout",
          title: "Permissions are not a safety label",
          text: "A mode is not simply “safe” or “unsafe.” It defines **what each class can do**. The right mode depends on who needs access and why.",
        },
      ],
    },
    {
      id: "permissions-for-directories",
      title: "Permissions for Directories",
      blocks: [
        {
          type: "paragraph",
          text: "Consider this directory mode:",
        },
        {
          type: "code",
          code: "drwxr-x---",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Meaning:",
        },
        {
          type: "code",
          code: "owner → read/write/search\ngroup → read/search\nother → no access",
          language: "text",
          title: "meaning",
        },
        {
          type: "paragraph",
          text: "Directory `x` is the ability to **traverse** or **search** the directory. Without it, you usually cannot enter the path even if you know a filename inside.",
        },
        {
          type: "code",
          code: "/home/bunsal/projects/\n                  |\n                  +── app.js\n                  +── README.md",
          language: "text",
          title: "directory tree",
        },
        {
          type: "paragraph",
          text: "Being able to **see a filename** (`r` on the directory) and being able to **access a file through that path** (`x` on the directory, plus permissions on the file) are related but not identical. Directory permissions control the path; file permissions control the file itself.",
        },
      ],
    },
    {
      id: "symbolic-permissions",
      title: "Symbolic Permissions",
      blocks: [
        {
          type: "paragraph",
          text: "The command that changes permissions is:",
        },
        {
          type: "code",
          code: "chmod",
          language: "bash",
          title: "command",
        },
        {
          type: "paragraph",
          text: "In **symbolic** form, you describe who changes, how they change, and which bits change:",
        },
        {
          type: "code",
          code: "chmod u+x script.sh",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Meaning: **add execute permission for the owner.**",
        },
        {
          type: "paragraph",
          text: "More examples:",
        },
        {
          type: "code",
          code: "chmod g+w file.txt\nchmod o-r file.txt\nchmod a+x script.sh",
          language: "bash",
          title: "examples",
        },
        {
          type: "definitions",
          items: [
            {
              term: "`u`",
              description: "owner",
            },
            {
              term: "`g`",
              description: "group",
            },
            {
              term: "`o`",
              description: "other",
            },
            {
              term: "`a`",
              description: "all (owner, group, and other)",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Operators:",
        },
        {
          type: "code",
          code: "+ = add\n- = remove\n= = set exactly",
          language: "text",
          title: "operators",
        },
        {
          type: "code",
          code: "chmod u+x script.sh\nchmod g-w report.txt\nchmod o=r notes.txt",
          language: "bash",
          title: "examples",
        },
        {
          type: "terminal",
          preset: "file-permissions",
          suggestions: [
            { command: "ls -l", label: "Run ls -l" },
            { command: "chmod u+x script.sh", label: "chmod u+x script.sh" },
            { command: "chmod g+w notes.txt", label: "chmod g+w notes.txt" },
            { command: "chmod o-r notes.txt", label: "chmod o-r notes.txt" },
          ],
          suggestionsLabel: "Try symbolic chmod",
        },
      ],
    },
    {
      id: "numeric-permissions",
      title: "Numeric Permissions",
      blocks: [
        {
          type: "paragraph",
          text: "Linux also accepts **octal** (numeric) modes. Each permission bit has a value:",
        },
        {
          type: "code",
          code: "r = 4\nw = 2\nx = 1",
          language: "text",
          title: "values",
        },
        {
          type: "paragraph",
          text: "Add the values for one category:",
        },
        {
          type: "code",
          code: "rwx = 4 + 2 + 1 = 7\nrw- = 4 + 2     = 6\nr-x = 4     + 1 = 5\nr-- = 4         = 4\n--- = 0",
          language: "text",
          title: "math",
        },
        {
          type: "table",
          caption: "Octal values for one permission triplet",
          headers: ["Permission", "Value"],
          rows: [
            ["`---`", "0"],
            ["`--x`", "1"],
            ["`-w-`", "2"],
            ["`-wx`", "3"],
            ["`r--`", "4"],
            ["`r-x`", "5"],
            ["`rw-`", "6"],
            ["`rwx`", "7"],
          ],
        },
        {
          type: "paragraph",
          text: "A three-digit mode assigns one digit to owner, group, and other:",
        },
        {
          type: "code",
          code: "755",
          language: "text",
          title: "mode",
        },
        {
          type: "paragraph",
          text: "means:",
        },
        {
          type: "code",
          code: "7 → rwx → owner\n5 → r-x → group\n5 → r-x → other",
          language: "text",
          title: "755 meaning",
        },
        {
          type: "paragraph",
          text: "And:",
        },
        {
          type: "code",
          code: "644",
          language: "text",
          title: "mode",
        },
        {
          type: "paragraph",
          text: "means:",
        },
        {
          type: "code",
          code: "6 → rw- → owner\n4 → r-- → group\n4 → r-- → other",
          language: "text",
          title: "644 meaning",
        },
      ],
    },
    {
      id: "using-chmod",
      title: "Using `chmod`",
      blocks: [
        {
          type: "paragraph",
          text: "Basic syntax:",
        },
        {
          type: "code",
          code: "chmod MODE FILE",
          language: "bash",
          title: "syntax",
        },
        {
          type: "paragraph",
          text: "Numeric examples:",
        },
        {
          type: "code",
          code: "chmod 644 notes.txt\nchmod 755 script.sh\nchmod 600 private.txt",
          language: "bash",
          title: "examples",
        },
        {
          type: "list",
          items: [
            "`chmod 644 notes.txt` — owner can read/write; group and other can read",
            "`chmod 755 script.sh` — owner can read/write/execute; group and other can read/execute",
            "`chmod 600 private.txt` — only the owner can read/write",
          ],
        },
        {
          type: "paragraph",
          text: "Symbolic alternative for making a script executable by its owner:",
        },
        {
          type: "code",
          code: "chmod u+x script.sh",
          language: "bash",
          title: "symbolic",
        },
        {
          type: "callout",
          title: "Be careful with recursive changes",
          text: "Be careful with recursive permission changes. Applying permissions to an entire directory tree can unintentionally affect many files. This lesson does not teach `chmod -R` in detail yet.",
        },
        {
          type: "terminal",
          preset: "file-permissions",
          suggestions: [
            { command: "ls -l", label: "Run ls -l" },
            { command: "chmod 644 notes.txt", label: "chmod 644 notes.txt" },
            { command: "chmod 755 script.sh", label: "chmod 755 script.sh" },
            {
              command: "chmod 600 private.txt",
              label: "chmod 600 private.txt",
            },
          ],
          suggestionsLabel: "Try numeric chmod",
        },
      ],
    },
    {
      id: "checking-permissions-with-ls-l",
      title: "Checking Permissions with `ls -l`",
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
          text: "Example simulated output:",
        },
        {
          type: "code",
          code: "-rw-r--r--  bunsal developers  120  notes.txt\n-rwxr-xr-x  bunsal developers  850  deploy.sh\ndrwxr-x---  bunsal developers 4096  projects",
          language: "text",
          title: "ls -l",
        },
        {
          type: "paragraph",
          text: "Important columns for this lesson:",
        },
        {
          type: "code",
          code: "permissions\nowner\ngroup\nsize\nname",
          language: "text",
          title: "columns",
        },
        {
          type: "paragraph",
          text: "The **owner** and **group** columns connect back to Users and Groups. Permissions decide what those identities can do with the entry.",
        },
        {
          type: "terminal",
          preset: "file-permissions",
          suggestions: [
            { command: "ls -l", label: "Run ls -l" },
            { command: "chmod 755 script.sh", label: "chmod 755 script.sh" },
            { command: "ls -l", label: "Check again" },
          ],
          suggestionsLabel: "Inspect and verify",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "file-permissions-practice",
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
                "Confusing the `rwx` order — it is always read, then write, then execute",
                "Thinking directory `x` means “execute the directory” instead of enter/search",
                "Forgetting that owner, group, and other permissions are separate",
                "Confusing `644` (`rw-r--r--`) with `755` (`rwxr-xr-x`)",
                "Using `chmod` without checking what the resulting mode means",
                "Changing permissions recursively without understanding the impact",
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
          text: "You should now be able to explain and apply the classic Linux permission model:",
        },
        {
          type: "list",
          items: [
            "Linux permissions control access to files and directories",
            "Permissions are divided into owner, group, and other",
            "`r`, `w`, and `x` represent read, write, and execute/search",
            "`ls -l` displays permission information",
            "`chmod` changes permission bits",
            "Symbolic permissions use `u`, `g`, `o`, and `a`",
            "Numeric permissions use values `4`, `2`, and `1`",
            "`755` means `rwxr-xr-x`",
            "`644` means `rw-r--r--`",
          ],
        },
        {
          type: "table",
          caption: "Command reference for file permissions",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ls -l`", "List files with permission strings"],
            ["`chmod 644 file`", "Set numeric mode `rw-r--r--`"],
            ["`chmod 755 file`", "Set numeric mode `rwxr-xr-x`"],
            ["`chmod 600 file`", "Owner-only read/write"],
            ["`chmod u+x file`", "Add execute for the owner"],
            ["`chmod g+w file`", "Add write for the group"],
            ["`chmod o-r file`", "Remove read for other"],
          ],
        },
      ],
    },
  ],
} as const satisfies Lesson;
