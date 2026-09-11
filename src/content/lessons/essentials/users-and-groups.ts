import type { Lesson } from "@/types/lesson";

export const usersAndGroupsLesson = {
  slug: "users-and-groups",
  level: "essentials",
  levelNumber: "01",
  difficulty: "Intermediate",
  readingTime: "15–20 min read",
  title: "Users and Groups",
  description:
    "Understand how Linux identifies users, organizes them into groups, and controls access to system resources.",
  seoTitle: "Users and Groups — Linux Essentials | Rean Linux",
  seoDescription:
    "Learn how Linux users, UIDs, groups, GIDs, primary groups, supplementary groups, and commands like whoami, id, and groups work.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Essentials", href: "/learn/essentials" },
    { label: "Users and Groups" },
  ],
  navigation: {
    previous: {
      label: "Understanding the Linux Filesystem",
      href: "/learn/beginner/filesystem",
    },
    next: {
      label: "File Permissions",
      href: "/learn/essentials/file-permissions",
    },
  },
  sections: [
    {
      id: "why-linux-has-users",
      title: "Why Linux Has Users",
      blocks: [
        {
          type: "paragraph",
          text: "Linux is designed as a **multi-user** operating system. That means one machine can host many identities at once — people, services, and administrative accounts.",
        },
        {
          type: "paragraph",
          text: "Linux needs to distinguish between users so that:",
        },
        {
          type: "list",
          items: [
            "different people can use the same machine",
            "services can run under dedicated accounts",
            "files and processes can be associated with identities",
            "access control can depend on user and group identity",
          ],
        },
        {
          type: "paragraph",
          text: "Here are some example identities you might see on a system:",
        },
        {
          type: "code",
          code: "Alice\nBob\nroot\nweb-server\ndatabase",
          language: "text",
          title: "identities",
        },
        {
          type: "paragraph",
          text: "These are **identities**, not necessarily physical people. `root` is the administrative account. Names like `web-server` or `database` often represent software services that need their own identity.",
        },
        {
          type: "callout",
          title: "Remember",
          text: "This lesson focuses on **who** you are on the system. File permission details come in the next lesson.",
        },
      ],
    },
    {
      id: "users-and-user-ids",
      title: "Users and User IDs",
      blocks: [
        {
          type: "paragraph",
          text: "Every Linux user has two important representations:",
        },
        {
          type: "list",
          items: [
            "**Username** — the human-friendly name you type and read (`bunsal`)",
            "**UID** (user ID) — the numeric ID Linux uses internally (`1000`)",
          ],
        },
        {
          type: "paragraph",
          text: "Linux prefers numbers because they are unambiguous and efficient. The username is a friendly label mapped to that number.",
        },
        {
          type: "code",
          code: "username: bunsal\nUID:      1000",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "A few conventions help you read UID values:",
        },
        {
          type: "list",
          items: [
            "**UID 0** represents the `root` account",
            "Regular users commonly receive higher UID values (often starting around `1000`)",
            "Exact UID values **can vary between systems** — treat examples as illustrations, not universal requirements",
          ],
        },
      ],
    },
    {
      id: "groups-and-group-ids",
      title: "Groups and Group IDs",
      blocks: [
        {
          type: "paragraph",
          text: "A **group** is a named collection of users. Groups make it easier to share access among related people or roles without managing every user individually.",
        },
        {
          type: "paragraph",
          text: "Like users, groups have:",
        },
        {
          type: "list",
          items: [
            "a **group name** (human-friendly)",
            "a **GID** (group ID — the numeric form Linux uses)",
          ],
        },
        {
          type: "paragraph",
          text: "A user can belong to **multiple groups**. That matters later for access control: membership helps decide what you can open, edit, or run.",
        },
        {
          type: "code",
          code: "User:\nbunsal\n\nGroups:\nbunsal\ndevelopers\ndocker",
          language: "text",
          title: "example",
        },
        {
          type: "paragraph",
          text: "In practice, a user typically has:",
        },
        {
          type: "list",
          items: [
            "**one primary group** — the main group identity for that user",
            "**additional supplementary groups** — extra memberships for shared roles",
          ],
        },
      ],
    },
    {
      id: "your-current-user",
      title: "Your Current User",
      blocks: [
        {
          type: "paragraph",
          text: "Start with the simplest identity check. The `whoami` command prints the username associated with your current effective user identity.",
        },
        {
          type: "code",
          code: "whoami",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Example output:",
        },
        {
          type: "code",
          code: "$ whoami\nbunsal",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "Try it in the simulated terminal below. Nothing runs on your real machine.",
        },
        {
          type: "terminal",
          preset: "users-and-groups",
          suggestions: [{ command: "whoami", label: "Run whoami" }],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "understanding-id",
      title: "Understanding `id`",
      blocks: [
        {
          type: "paragraph",
          text: "The `id` command shows a fuller picture of user and group identity.",
        },
        {
          type: "code",
          code: "id",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "You can also inspect another account:",
        },
        {
          type: "code",
          code: "id bunsal",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Typical output looks like this:",
        },
        {
          type: "code",
          code: "uid=1000(bunsal)\ngid=1000(bunsal)\ngroups=1000(bunsal),1001(developers),998(docker)",
          language: "text",
          title: "output",
        },
        {
          type: "paragraph",
          text: "How to read that line:",
        },
        {
          type: "definitions",
          items: [
            {
              term: "uid",
              description:
                "Your user ID number. The name in parentheses is the matching username.",
            },
            {
              term: "gid",
              description:
                "Your **primary** group ID. The name in parentheses is the primary group name.",
            },
            {
              term: "groups",
              description:
                "All group memberships for the user, including the primary group and any supplementary groups.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "A few focused options are useful when you only need one piece of the puzzle:",
        },
        {
          type: "code",
          code: "id -u\nid -g\nid -G",
          language: "bash",
          title: "bash",
        },
        {
          type: "list",
          items: [
            "`id -u` — prints only the UID",
            "`id -g` — prints only the primary GID",
            "`id -G` — prints all group IDs (primary and supplementary)",
          ],
        },
        {
          type: "terminal",
          preset: "users-and-groups",
          suggestions: [
            { command: "id", label: "Run id" },
            { command: "id bunsal", label: "Run id bunsal" },
            { command: "id -u", label: "Run id -u" },
            { command: "id -g", label: "Run id -g" },
            { command: "id -G", label: "Run id -G" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "checking-group-membership",
      title: "Checking Group Membership",
      blocks: [
        {
          type: "paragraph",
          text: "When you mainly care about group names, `groups` is a quick check.",
        },
        {
          type: "code",
          code: "groups",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Example:",
        },
        {
          type: "code",
          code: "$ groups\nbunsal developers docker",
          language: "bash",
          title: "example",
        },
        {
          type: "paragraph",
          text: "You can also check another user:",
        },
        {
          type: "code",
          code: "groups bunsal",
          language: "bash",
          title: "bash",
        },
        {
          type: "paragraph",
          text: "Without a username, `groups` reports membership for the **current** user. With a username, it reports membership for that account — useful when you are comparing identities.",
        },
        {
          type: "terminal",
          preset: "users-and-groups",
          suggestions: [
            { command: "groups", label: "Run groups" },
            { command: "groups bunsal", label: "Run groups bunsal" },
            { command: "groups alice", label: "Run groups alice" },
          ],
          suggestionsLabel: "Try it",
        },
      ],
    },
    {
      id: "etc-passwd",
      title: "`/etc/passwd`",
      blocks: [
        {
          type: "paragraph",
          text: "The file `/etc/passwd` describes user accounts on the system. Each line is a colon-separated record with seven fields.",
        },
        {
          type: "code",
          code: "bunsal:x:1000:1000:Bunsal:/home/bunsal:/bin/bash",
          language: "text",
          title: "/etc/passwd",
        },
        {
          type: "paragraph",
          text: "The structure looks like this:",
        },
        {
          type: "code",
          code: "name : password : UID : GID : GECOS : home : shell",
          language: "text",
          title: "structure",
        },
        {
          type: "definitions",
          items: [
            {
              term: "username",
              description: "The account name (`bunsal`).",
            },
            {
              term: "password placeholder",
              description:
                "Usually `x` on modern systems — a marker, not the real password hash.",
            },
            {
              term: "UID",
              description: "The numeric user ID.",
            },
            {
              term: "GID",
              description: "The numeric primary group ID.",
            },
            {
              term: "GECOS / user information",
              description:
                "Optional descriptive text such as a full name (`Bunsal`).",
            },
            {
              term: "home directory",
              description: "Where the user’s home files live (`/home/bunsal`).",
            },
            {
              term: "login shell",
              description:
                "The default shell started for interactive logins (`/bin/bash`).",
            },
          ],
        },
        {
          type: "callout",
          title: "Important",
          text: "Modern Linux systems commonly store password hashes in `/etc/shadow`, not in `/etc/passwd`. Despite the historic name, `/etc/passwd` is mainly an account description file — not a password vault.",
        },
        {
          type: "terminal",
          preset: "users-and-groups",
          suggestions: [
            { command: "cat /etc/passwd", label: "Run cat /etc/passwd" },
          ],
          suggestionsLabel: "Inspect accounts",
        },
      ],
    },
    {
      id: "etc-group",
      title: "`/etc/group`",
      blocks: [
        {
          type: "paragraph",
          text: "The file `/etc/group` stores group information and membership lists.",
        },
        {
          type: "code",
          code: "developers:x:1001:bunsal,alice,bob",
          language: "text",
          title: "/etc/group",
        },
        {
          type: "paragraph",
          text: "Each line follows this pattern:",
        },
        {
          type: "code",
          code: "group_name : password : GID : members",
          language: "text",
          title: "structure",
        },
        {
          type: "list",
          items: [
            "**group_name** — the human-friendly group name",
            "**password** — usually unused for day-to-day work (often `x`)",
            "**GID** — the numeric group identity",
            "**members** — a comma-separated list of usernames belonging to the group",
          ],
        },
        {
          type: "paragraph",
          text: "The GID identifies the group numerically, just as a UID identifies a user. `/etc/group` is where you look when you want to see which users share a named group.",
        },
        {
          type: "note",
          text: "This lesson does not cover group administration commands yet. First learn how to **read** group identity.",
        },
        {
          type: "terminal",
          preset: "users-and-groups",
          suggestions: [
            { command: "cat /etc/group", label: "Run cat /etc/group" },
          ],
          suggestionsLabel: "Inspect groups",
        },
      ],
    },
    {
      id: "primary-and-supplementary-groups",
      title: "Primary and Supplementary Groups",
      blocks: [
        {
          type: "paragraph",
          text: "Group membership has two layers that are easy to mix up.",
        },
        {
          type: "heading",
          level: 3,
          text: "Primary group",
        },
        {
          type: "paragraph",
          text: "The primary group is the user’s main group identity. It is the GID shown by `id` (and the GID field in `/etc/passwd`).",
        },
        {
          type: "code",
          code: "bunsal\nUID: 1000\nPrimary GID: 1000",
          language: "text",
          title: "primary group",
        },
        {
          type: "heading",
          level: 3,
          text: "Supplementary groups",
        },
        {
          type: "paragraph",
          text: "Supplementary groups are additional memberships beyond the primary group. They are useful for shared roles — for example, belonging to `developers` or `docker` without changing your primary group.",
        },
        {
          type: "code",
          code: "developers\ndocker",
          language: "text",
          title: "supplementary groups",
        },
        {
          type: "code",
          code: "                 User\n                bunsal\n                  |\n        +---------+---------+\n        |                   |\n   Primary group     Supplementary groups\n      bunsal          developers\n                      docker",
          language: "text",
          title: "diagram",
        },
        {
          type: "paragraph",
          text: "Supplementary groups let one person collaborate across projects and tools while keeping a clear primary identity. Exact permission evaluation comes next — for now, focus on recognizing the difference.",
        },
      ],
    },
    {
      id: "a-small-practice-session",
      title: "A Small Practice Session",
      blocks: [
        {
          type: "exercise",
          id: "users-and-groups-practice",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to explain the core identity model on Linux:",
        },
        {
          type: "list",
          items: [
            "Linux supports multiple user identities on one system",
            "Users have UIDs; groups have GIDs",
            "`whoami` shows the current username",
            "`id` shows detailed identity information",
            "`groups` shows group membership",
            "`/etc/passwd` describes user accounts",
            "`/etc/group` describes groups and membership",
            "Users can have a primary group and supplementary groups",
          ],
        },
        {
          type: "panel",
          title: "Common Mistakes",
          blocks: [
            {
              type: "list",
              items: [
                "UID and username are two representations of the same user identity",
                "GID and group name are two representations of a group identity",
                "Being in a group does not mean the group is your primary group",
                "`/etc/passwd` is not simply “the file containing everyone’s passwords”",
                "`/etc/group` is not the same thing as the user’s primary group",
              ],
            },
          ],
        },
        {
          type: "table",
          caption: "Command reference for users and groups",
          headers: ["Command", "Purpose"],
          rows: [
            ["`whoami`", "Show the current username"],
            ["`id`", "Show user and group identity information"],
            ["`id -u`", "Show UID"],
            ["`id -g`", "Show primary GID"],
            ["`id -G`", "Show group IDs"],
            ["`groups`", "Show group membership"],
            ["`cat /etc/passwd`", "Inspect simulated user account records"],
            ["`cat /etc/group`", "Inspect simulated group records"],
          ],
        },
        {
          type: "paragraph",
          text: "Next up: file permissions — how Linux uses these identities to control access to files and directories.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
