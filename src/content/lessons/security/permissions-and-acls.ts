import type { Lesson } from "@/types/lesson";

export const securityPermissionsAndAclsLesson = {
  slug: "permissions-and-acls",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Advanced File Permissions and ACLs",
  description:
    "Go beyond basic modes to special bits and POSIX ACLs — then practice grant, mask, default ACL, and effective-access scenarios in a safe simulator.",
  seoTitle: "Advanced File Permissions and ACLs — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux special permission bits and POSIX ACLs: getfacl, setfacl, masks, default ACLs, and effective access with a simulated laboratory.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Advanced File Permissions and ACLs" },
  ],
  navigation: {
    previous: {
      label: "Users, Groups, and Access Control Review",
      href: "/learn/security/access-control",
    },
    next: {
      label: "sudo and Privilege Management",
      href: "/learn/security/privilege-management",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Classic owner/group/other modes are powerful — and often enough. When one group is not enough, **POSIX ACLs** add named-user and named-group grants. This lesson reviews modes and special bits, then teaches how to read, change, and verify ACLs without casually widening access.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real `chmod`/`getfacl`/`setfacl` on your host, never changes real ownership, and never executes a real shell. Paths such as `/srv/projects/app.conf` are fictional teaching examples.",
    },
  ],
  sections: [
    {
      id: "standard-permissions-review",
      title: "Standard Permissions Review",
      blocks: [
        {
          type: "paragraph",
          text: "Every file and directory has an **owner**, an owning **group**, and a mode that grants **read (r)**, **write (w)**, and **execute (x)** to owner, group, and others.",
        },
        {
          type: "table",
          caption: "Permission bits at a glance",
          headers: ["Bit", "On files", "On directories"],
          rows: [
            ["`r`", "Read contents", "List names (with `x` to enter)"],
            ["`w`", "Modify contents", "Create/delete/rename entries"],
            ["`x`", "Run as a program", "Traverse / enter the directory"],
          ],
        },
        {
          type: "definitions",
          items: [
            {
              term: "Owner",
              description:
                "The user identity that owns the object — usually evaluated first for access.",
            },
            {
              term: "Group",
              description:
                "The owning group’s mode bits (or the ACL group-class / mask when ACLs are present).",
            },
            {
              term: "Others",
              description:
                "Everyone else who is not the owner and did not match a more specific ACL identity.",
            },
          ],
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "ls -l /srv/projects", label: "ls projects" },
            { command: "ls -l /srv/projects/app.conf", label: "ls app.conf" },
            { command: "ls -l /srv/projects/deploy.sh", label: "ls deploy.sh" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect modes",
        },
      ],
    },
    {
      id: "symbolic-and-numeric",
      title: "Symbolic and Numeric Modes",
      blocks: [
        {
          type: "paragraph",
          text: "Numeric modes pack three (or four) octal digits. The last three digits are owner, group, and other. Common hardening examples:",
        },
        {
          type: "table",
          caption: "Numeric modes you will see often",
          headers: ["Mode", "Symbolic", "Typical use"],
          rows: [
            ["`640`", "`rw-r-----`", "Secrets readable by owner + group only"],
            ["`750`", "`rwxr-x---`", "Scripts/tools for owner + group execute"],
            ["`755`", "`rwxr-xr-x`", "Public executables or directories"],
            ["`600`", "`rw-------`", "Private owner-only files"],
            ["`700`", "`rwx------`", "Private owner-only directories"],
          ],
        },
        {
          type: "code",
          title: "Examples",
          language: "bash",
          code: "chmod 640 /srv/projects/app.conf\nchmod 750 /srv/projects/deploy.sh\nchmod 755 /usr/local/bin/tool",
        },
        {
          type: "callout",
          title: "Change deliberately",
          text: "If access fails, do **not** jump to `777` or world-readable modes. Identify who needs access, then grant the smallest right that satisfies the role.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "stat /srv/projects/app.conf", label: "stat app.conf" },
            {
              command: "stat /srv/projects/deploy.sh",
              label: "stat deploy.sh",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect with stat",
        },
      ],
    },
    {
      id: "special-bits",
      title: "Special Bits: SUID, SGID, and Sticky",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "SUID (setuid)",
              description:
                "On an executable, the process may run with the **file owner’s** privileges (often root). Powerful and high-risk if unexpected — example: `/usr/bin/passwd`.",
            },
            {
              term: "SGID (setgid)",
              description:
                "On executables, similar idea for the file’s group. On directories, new files often inherit the directory’s group (collaboration layouts).",
            },
            {
              term: "Sticky bit",
              description:
                "On directories such as `/tmp`, users typically may delete only their own files even when the directory is world-writable.",
            },
          ],
        },
        {
          type: "table",
          caption: "Numeric special-bit prefixes",
          headers: ["Mode", "Meaning"],
          rows: [
            ["`4755`", "SUID + `rwxr-xr-x`"],
            ["`2755`", "SGID + `rwxr-xr-x`"],
            ["`1777`", "Sticky + `rwxrwxrwx` (classic `/tmp`)"],
            ["`2770`", "SGID + `rwxrwx---` (shared team directory)"],
          ],
        },
        {
          type: "note",
          text: "In `ls -l`, SUID/SGID often show as `s`/`S` in the execute position; sticky shows as `t`/`T`. Unexpected SUID binaries deserve investigation on real hosts you administer.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "ls -l /usr/bin/passwd", label: "ls passwd" },
            { command: "ls -ld /tmp", label: "ls -ld /tmp" },
            { command: "ls -ld /srv/shared", label: "ls -ld shared" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect special bits",
        },
      ],
    },
    {
      id: "posix-acls-intro",
      title: "What POSIX ACLs Are",
      blocks: [
        {
          type: "paragraph",
          text: "**POSIX ACLs** extend the owner/group/other model with **named-user** and **named-group** entries, plus a **mask** that caps effective rights for the group class. They are useful when:",
        },
        {
          type: "list",
          items: [
            "Two groups need different rights on the same object",
            "One extra person needs read without joining a broad group",
            "You must avoid making a file world-readable “just for one user”",
            "A shared directory should stamp a policy onto new children (default ACLs)",
          ],
        },
        {
          type: "callout",
          title: "ACLs are not a shortcut for bad group design",
          text: "Prefer clear ownership and groups when they fit. Use ACLs when the identity model needs precision — then document why each named grant exists.",
        },
        {
          type: "paragraph",
          text: "When extended ACLs exist, `ls -l` appends a trailing `+` after the mode string. That is your cue to run `getfacl`.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "ls -l /srv/projects/app.conf", label: "ls + marker" },
            { command: "getfacl /srv/projects/app.conf", label: "getfacl" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Spot the ACL marker",
        },
      ],
    },
    {
      id: "getfacl-and-setfacl",
      title: "getfacl and setfacl",
      blocks: [
        {
          type: "compare-grid",
          columns: [
            {
              title: "getfacl",
              blocks: [
                {
                  type: "paragraph",
                  text: "Inspect owner, group, ACL entries, mask, and default ACL lines. Read `#effective:` carefully.",
                },
              ],
            },
            {
              title: "setfacl",
              blocks: [
                {
                  type: "paragraph",
                  text: "Modify ACLs: `-m` add/update, `-x` remove a named entry, `-d` default ACL on directories, `-b` remove extended ACLs.",
                },
              ],
            },
          ],
        },
        {
          type: "code",
          title: "Typical shapes (simulated in this lesson)",
          language: "bash",
          code: "getfacl /srv/projects/app.conf\nsetfacl -m u:analyst:r-- /srv/projects/app.conf\nsetfacl -x u:tempadmin /srv/projects/app.conf\nsetfacl -m m::rw- /srv/reports/quarterly.csv\nsetfacl -d -m g:reports:r-- /srv/shared",
        },
        {
          type: "note",
          text: "This simulator supports the narrowly scoped forms needed for the lab. Unsupported flags print a clear message — it never runs a real shell.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "getfacl /srv/projects/app.conf", label: "getfacl" },
            {
              command: "getfacl /srv/reports/quarterly.csv",
              label: "getfacl csv",
            },
            { command: "getfacl /srv/shared", label: "getfacl shared" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Read ACL output",
        },
      ],
    },
    {
      id: "named-entries-and-masks",
      title: "Named Entries, Masks, and Effective Rights",
      blocks: [
        {
          type: "paragraph",
          text: "A named-user entry such as `user:contractor:rw-` lists intended rights. The **ACL mask** intersects those rights for the group class. If the mask is `r--`, contractor’s **effective** write is denied even though the entry still lists `w`.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Owner matches → use `user::` (mask does **not** apply)",
            "Named-user match → entry permissions **AND** mask",
            "Owning group or named-group match → union of matching group entries **AND** mask",
            "Otherwise → `other::` (mask does **not** apply)",
          ],
        },
        {
          type: "callout",
          title: "Listed ≠ effective",
          text: "Always read `#effective:` in `getfacl` output. Changing the mask updates effective rights **without** silently deleting the underlying named entries.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            {
              command: "getfacl /srv/reports/quarterly.csv",
              label: "getfacl csv",
            },
            {
              command: "check-access contractor /srv/reports/quarterly.csv",
              label: "check contractor",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Compare listed vs effective",
        },
      ],
    },
    {
      id: "default-acls",
      title: "Default ACLs on Directories",
      blocks: [
        {
          type: "paragraph",
          text: "**Default ACLs** live on directories and influence the access ACL that **newly created** files and subdirectories inherit. They do **not** replace the directory’s own access ACL, and they do not silently rewrite existing children.",
        },
        {
          type: "code",
          title: "Set and inspect a default ACL",
          language: "bash",
          code: "setfacl -d -m g:reports:r-- /srv/shared\ngetfacl /srv/shared\ntouch /srv/shared/new-note.txt\ngetfacl /srv/shared/new-note.txt",
        },
        {
          type: "note",
          text: "In `getfacl` output, default entries are prefixed with `default:`. Access entries without that prefix apply to the object itself right now.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "getfacl /srv/shared", label: "getfacl shared" },
            {
              command: "getfacl /srv/shared/team-notes.txt",
              label: "getfacl notes",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect defaults",
        },
      ],
    },
    {
      id: "acls-and-ls",
      title: "How ACLs Interact with Traditional Displays",
      blocks: [
        {
          type: "paragraph",
          text: "When extended ACLs are present, the group-class bits shown by `ls -l` typically reflect the **mask**, not a single owning-group intent alone. That is why a trailing `+` matters: the three triplets are incomplete without `getfacl`.",
        },
        {
          type: "list",
          items: [
            "`chmod` on a file with ACLs updates base entries / mask consistently in this simulator",
            "`chown` changes ownership identity; ACL named entries still refer to user/group names",
            "Removing the last named entries can return you to a simple mode-only object",
          ],
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            { command: "ls -l /srv/shared/team-notes.txt", label: "ls notes" },
            {
              command: "getfacl /srv/shared/team-notes.txt",
              label: "getfacl notes",
            },
            { command: "stat /srv/shared/team-notes.txt", label: "stat notes" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Correlate ls and getfacl",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Pause and confirm modes, ACL purpose, and listed vs effective permissions.",
        },
        {
          type: "exercise",
          id: "security-permissions-acls-knowledge-check",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting Unexpected Access",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Confirm ownership (`ls -l` / `stat`)",
            "Read standard mode bits — including special bits",
            "If you see `+`, run `getfacl` and read named entries + mask + `#effective:`",
            "Decide which identity class applies (owner, named-user, group-class, other)",
            "Change the **smallest** control that matches the role (named ACL, group membership, or mode)",
            "Re-check effective access for the intended user **and** a user who should still be denied",
          ],
        },
        {
          type: "callout",
          title: "Teaching helper",
          text: "This lab includes `check-access USER PATH` to print effective r/w/x for a fictional identity. It is **not** a standard Linux command — use it only as a learning aid.",
        },
        {
          type: "terminal",
          preset: "security-permissions-acls",
          suggestions: [
            {
              command: "check-access analyst /srv/projects/app.conf",
              label: "check analyst",
            },
            {
              command: "check-access contractor /srv/reports/quarterly.csv",
              label: "check contractor",
            },
            {
              command: "check-access deploy /srv/projects/deploy.sh",
              label: "check deploy",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Effective access helper",
        },
      ],
    },
    {
      id: "best-practices",
      title: "Security Best Practices and Common Mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "**Do** prefer named ACL grants over world-readable shortcuts",
            "**Do** read `#effective:` before concluding a user can write",
            "**Do** remove excess named entries with `-x` instead of wiping everything",
            "**Do** distinguish default ACLs (new children) from access ACLs (now)",
            "**Don’t** chmod 777 / o+rwx just to silence an error",
            "**Don’t** raise the mask without checking who else shares the group class",
            "**Don’t** assume `ls -l` alone tells the whole story when `+` is present",
            "**Don’t** leave temporary named-user grants undocumented",
          ],
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive ACL Laboratory",
      blocks: [
        {
          type: "paragraph",
          text: "Five scenarios: grant specific access, diagnose a mask, remove excess access, configure default ACLs, and verify effective permissions. Validation checks the **simulated state**, not only the command text.",
        },
        {
          type: "exercise",
          id: "security-permissions-acls-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Six focused exercises covering mode reading, named-user grants, masks, excess removal, default ACLs, and effective-access decisions.",
        },
        {
          type: "exercise",
          id: "security-permissions-acls-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-permissions-acls-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to work with advanced Linux permissions and ACLs:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Read owner/group/other modes and common numeric forms (`640`, `750`, `755`)",
            "Explain SUID, SGID, and sticky-bit security implications",
            "Use `getfacl` / `setfacl` for named-user and named-group entries",
            "Interpret ACL masks and listed vs effective permissions",
            "Configure and inspect default ACLs on directories",
            "Troubleshoot access using ownership, modes, ACL entries, and effective rights",
            "Change permissions deliberately — never broaden access just to clear an error",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`ls -l` / `ls -ld`", "Modes, ownership, ACL `+` marker"],
            ["`stat PATH`", "Detailed metadata"],
            ["`getfacl PATH`", "Access + default ACL entries"],
            ["`setfacl -m ENTRY PATH`", "Add or update an ACL entry"],
            ["`setfacl -x ENTRY PATH`", "Remove a named ACL entry"],
            ["`setfacl -m m::PERMS PATH`", "Change the ACL mask"],
            ["`setfacl -d -m ENTRY PATH`", "Default ACL on a directory"],
            ["`chmod MODE PATH`", "Numeric mode changes"],
            ["`sudo chown OWNER[:GROUP] PATH`", "Ownership changes"],
            ["`check-access USER PATH`", "Lab-only effective access helper"],
            ["`touch PATH`", "Create a file (inherits default ACLs)"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: sudo and Privilege Management — controlling elevated operations with least privilege (coming soon).",
        },
      ],
    },
  ],
} as const satisfies Lesson;
