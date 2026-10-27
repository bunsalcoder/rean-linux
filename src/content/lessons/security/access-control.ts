import type { Lesson } from "@/types/lesson";

export const securityAccessControlLesson = {
  slug: "access-control",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "20–25 min read",
  title: "Users, Groups, and Access Control Review",
  description:
    "Review Linux users, groups, file permissions, and access risks from a security perspective — then practice a simulated access-control lab.",
  seoTitle:
    "Users, Groups, and Access Control Review — Linux Security | Rean Linux",
  seoDescription:
    "Learn how to review Linux users, groups, permissions, special bits, and least privilege with a safe simulated access-control lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Users, Groups, and Access Control Review" },
  ],
  navigation: {
    previous: {
      label: "Linux Security Fundamentals",
      href: "/learn/security/fundamentals",
    },
    next: {
      label: "Advanced File Permissions and ACLs",
      href: "/learn/security/permissions-and-acls",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Stage 02 covered users, groups, and permissions as day-to-day skills. This lesson revisits them as **security controls**: who exists on a host, what they can reach, and whether that access matches their role.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never reads your host `/etc/passwd`, never changes real permissions, and never runs a real shell. Accounts such as `bunsal`, `deploy`, `analyst`, and `backup` are fictional teaching examples.",
    },
  ],
  sections: [
    {
      id: "authn-vs-authz",
      title: "Authentication Versus Authorization",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Authentication",
              description:
                "Proving identity — “Who are you?” Passwords, SSH keys, and MFA answer this question.",
            },
            {
              term: "Authorization",
              description:
                "Deciding power after identity is known — “What may you do?” Groups, file modes, and sudo membership are authorization controls.",
            },
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Authentication success",
              blocks: [
                {
                  type: "paragraph",
                  text: "`deploy` can log in with a valid key. That only proves identity.",
                },
              ],
            },
            {
              title: "Authorization problem",
              blocks: [
                {
                  type: "paragraph",
                  text: "`deploy` is also in `sudo`. Login success does not justify administrative power.",
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Keep them separate",
          text: "Fixing how someone authenticates does not automatically fix what they are authorized to do — and removing excess privilege does not replace strong authentication.",
        },
      ],
    },
    {
      id: "users-and-identities",
      title: "Users and Identities",
      blocks: [
        {
          type: "paragraph",
          text: "Linux identities include **regular users**, **service accounts**, **system accounts**, and **root** (UID 0). Each has a UID, a home directory, and a login shell recorded in the passwd database.",
        },
        {
          type: "table",
          caption: "Fictional accounts on the access-review host",
          headers: ["Account", "Role", "Notes for review"],
          rows: [
            [
              "`bunsal`",
              "Administrator-in-training",
              "Human account; may need sudo intentionally",
            ],
            [
              "`deploy`",
              "Deployment account",
              "Should deploy — not administer everything",
            ],
            [
              "`analyst`",
              "Read-only analyst",
              "Needs reports access, not deploy write",
            ],
            [
              "`backup`",
              "Backup service",
              "Should not be a routine interactive admin login",
            ],
            [
              "`root`",
              "Superuser",
              "UID 0 — unlimited authorization when used",
            ],
            [
              "`daemon`",
              "System account",
              "Low UID is normal — not automatically suspicious",
            ],
          ],
        },
        {
          type: "note",
          text: "System accounts (often low UIDs, non-login shells) exist so services can run with their own identity. Treat unexpected interactive shells or unexpected group power as the signal — not the mere presence of a system UID.",
        },
        {
          type: "terminal",
          preset: "security-access-control",
          suggestions: [
            { command: "whoami", label: "whoami" },
            { command: "getent passwd", label: "passwd" },
            { command: "id backup", label: "id backup" },
            { command: "getent passwd daemon", label: "passwd daemon" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect identities",
        },
      ],
    },
    {
      id: "groups",
      title: "Groups and Group-Based Access",
      blocks: [
        {
          type: "paragraph",
          text: "A user has one **primary group** (from the passwd GID) and may have **supplementary groups**. Group membership is a common way to authorize shared access — and a common place for excess privilege to hide.",
        },
        {
          type: "list",
          items: [
            "`deployers` — intended for deployment tooling",
            "`reports` — intended for analyst read access to reporting data",
            "`sudo` — administrative elevation; membership must be justified",
          ],
        },
        {
          type: "callout",
          title: "Excessive membership",
          text: "If `deploy` is in `sudo` “just in case,” that is an authorization smell. Prefer a role-aligned group (like `deployers`) over broad administrative rights.",
        },
        {
          type: "terminal",
          preset: "security-access-control",
          suggestions: [
            { command: "id deploy", label: "id deploy" },
            { command: "groups deploy", label: "groups deploy" },
            { command: "getent group sudo", label: "group sudo" },
            { command: "getent group deployers", label: "group deployers" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect groups",
        },
      ],
    },
    {
      id: "permission-review",
      title: "Permission Review",
      blocks: [
        {
          type: "paragraph",
          text: "Classic Unix permissions split access among **owner**, **group**, and **others**, each with **read**, **write**, and **execute**. During a security review, ask whether anyone outside the intended role can read secrets or write operational scripts.",
        },
        {
          type: "table",
          caption: "Fictional paths used in this lesson",
          headers: ["Path", "Intended use", "Typical review focus"],
          rows: [
            [
              "`/srv/app/config.yml`",
              "App configuration / secrets",
              "Is it world-readable?",
            ],
            ["`/srv/app/deploy.sh`", "Deployment script", "Who can write it?"],
            [
              "`/srv/reports/monthly.csv`",
              "Analyst reports",
              "Group `reports` read OK?",
            ],
            [
              "`/srv/backups/`",
              "Backup service data",
              "Limited to backup role?",
            ],
            [
              "`/tmp/shared-report.txt`",
              "Temporary shared note",
              "World-writable?",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "security-access-control",
          suggestions: [
            { command: "ls -l /srv/app/config.yml", label: "ls config" },
            { command: "ls -l /srv/app/deploy.sh", label: "ls deploy.sh" },
            { command: "stat /tmp/shared-report.txt", label: "stat shared" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect permissions",
        },
      ],
    },
    {
      id: "special-permissions",
      title: "Special Permissions: SUID, SGID, and Sticky Bit",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "SUID",
              description:
                "When set on an executable, the process may run with the file owner’s privileges. Powerful — and risky if unexpected.",
            },
            {
              term: "SGID",
              description:
                "On executables, similar idea for the file’s group; on directories, new files often inherit the directory’s group.",
            },
            {
              term: "Sticky bit",
              description:
                "On directories such as `/tmp`, users typically can delete only their own files even when the directory is world-writable.",
            },
          ],
        },
        {
          type: "note",
          text: "This lesson only introduces why these bits need careful review. Deeper ACL and special-bit labs come in the next Stage 04 lesson.",
        },
        {
          type: "terminal",
          preset: "security-access-control",
          suggestions: [
            { command: "ls -ld /tmp", label: "ls -ld /tmp" },
            {
              command: "namei -l /srv/app/deploy.sh",
              label: "namei deploy.sh",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect path components",
        },
      ],
    },
    {
      id: "least-privilege",
      title: "Least Privilege",
      blocks: [
        {
          type: "paragraph",
          text: "**Least privilege** means granting only the access necessary for a user’s or service’s role — no extra sudo, no world-writable scripts, no shared interactive service logins “for convenience.”",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Map the role (deploy, analyze, back up, administer)",
            "List current groups and file rights",
            "Remove access that is not required",
            "Preserve access that legitimate operations still need",
            "Verify the result",
          ],
        },
        {
          type: "callout",
          title: "Do not swing the axe blindly",
          text: "chmod 000 or deleting accounts without understanding dependencies can break backups, deploys, or reporting. Prefer the smallest change that removes excess risk.",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Pause and confirm the basics before the guided lab.",
        },
        {
          type: "exercise",
          id: "security-access-control-knowledge-check",
        },
      ],
    },
    {
      id: "review-workflow",
      title: "Access Review Workflow",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Identify the account (human, service, system, or root)",
            "Inspect primary and supplementary group membership",
            "Review relevant file and directory permissions",
            "Assess risk (impact × likelihood, in practical terms)",
            "Recommend a least-privilege change",
            "Apply a simulated remediation where supported",
            "Verify the updated state",
          ],
        },
        {
          type: "paragraph",
          text: "The teaching command `access-review` summarizes open findings in this lab. It is **not** a standard Linux tool — use it only as a learning aid after you inspect evidence yourself.",
        },
        {
          type: "terminal",
          preset: "security-access-control",
          suggestions: [
            { command: "access-review", label: "access-review" },
            { command: "id deploy", label: "id deploy" },
            { command: "ls -l /srv/app/config.yml", label: "ls config" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Start a review",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "Common Access-Control Mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Sharing one interactive account across a team",
            "Granting unnecessary administrative (`sudo`) access",
            "Making files world-writable or world-readable “temporarily” and forgetting",
            "Removing access without understanding operational dependencies",
            "Treating every system account as malware because the UID is low",
            "Confusing a successful login (authentication) with appropriate power (authorization)",
          ],
        },
      ],
    },
    {
      id: "security-checklist",
      title: "Security Checklist for Access Reviews",
      blocks: [
        {
          type: "paragraph",
          text: "Practical questions a Linux administrator should ask:",
        },
        {
          type: "list",
          items: [
            "Which accounts are interactive, and which should be service-only?",
            "Which groups grant powerful roles, and who is in them?",
            "Which files hold secrets or control operations, and who can read/write them?",
            "Are special bits present where they are not justified?",
            "If I remove this access, what legitimate work still needs a path to succeed?",
            "After the change, does inspection confirm the excess access is gone?",
          ],
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Access-Control Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Walk a fictional server finding by finding: inspect evidence, choose risk and a least-privilege recommendation, apply a simulated change, then verify. Hints are available on demand — solutions stay hidden until you attempt each step.",
        },
        {
          type: "exercise",
          id: "security-access-control-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Six focused exercises: identity inspection, config modes, deploy-script ownership, sudo membership, service shells, and shared-file permissions. Exercise checks use the simulated state — not only the command string you typed.",
        },
        {
          type: "exercise",
          id: "security-access-control-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-access-control-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to review access control on Linux with a security mindset:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Separate authentication from authorization",
            "Interpret users, UIDs, and system vs human vs service accounts calmly",
            "Review primary and supplementary group membership for excess privilege",
            "Spot overly broad owner/group/other permissions",
            "Explain why SUID, SGID, and sticky bits need careful review",
            "Apply least privilege without breaking legitimate dependencies",
            "Follow an inspect → assess → change → verify workflow",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`whoami` / `id` / `groups`", "Inspect identity"],
            [
              "`getent passwd` / `getent group`",
              "List simulated accounts and groups",
            ],
            ["`ls -l` / `ls -ld`", "Inspect modes and ownership"],
            ["`stat PATH`", "Detailed metadata"],
            ["`namei -l PATH`", "Walk path components"],
            ["`chmod 640|750 …`", "Tighten supported file modes"],
            ["`sudo chgrp deployers …`", "Fix deploy.sh group ownership"],
            ["`sudo gpasswd -d deploy sudo`", "Remove excess sudo"],
            [
              "`set-shell backup /usr/sbin/nologin`",
              "Teaching helper for service shells",
            ],
            ["`access-review`", "Lab-only finding summary"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Advanced File Permissions and ACLs](/learn/security/permissions-and-acls) — special bits and access-control lists in more depth.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
