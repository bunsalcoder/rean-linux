import type { Lesson } from "@/types/lesson";

export const securityPrivilegeManagementLesson = {
  slug: "privilege-management",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "sudo and Privilege Management",
  description:
    "Understand privilege levels, sudo, sudoers policy design, least privilege, and administrative access auditing in a safe simulated laboratory.",
  seoTitle: "sudo and Privilege Management — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux sudo and privilege management: root vs regular users, sudoers, NOPASSWD, least privilege, and auditing elevated access with a simulated lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "sudo and Privilege Management" },
  ],
  navigation: {
    previous: {
      label: "Advanced File Permissions and ACLs",
      href: "/learn/security/permissions-and-acls",
    },
    next: {
      label: "SSH Security Hardening",
      href: "/learn/security/ssh-hardening",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Administrative power on Linux is concentrated in **privilege**. This lesson explains regular users versus **root** (UID 0), how **sudo** grants controlled elevation, how **sudoers** policies are structured, and how to apply **least privilege** when reviewing access.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real `sudo`, never prompts for a real password, never reads host users or `/etc/sudoers`, and never escalates privileges on your machine. Configuration snippets are **educational examples** labelled as fictional.",
    },
  ],
  sections: [
    {
      id: "privilege-levels",
      title: "Understanding Privilege Levels",
      blocks: [
        {
          type: "paragraph",
          text: "A **regular user** can change files they own and use resources their groups allow. **root** is the superuser: UID **0**. On traditional Unix discretionary models, root is not constrained by ordinary permission checks — that is why unrestricted administrative authority is so powerful and so dangerous when misused.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Privilege escalation",
              description:
                "Moving from a limited identity to a more powerful one — for example a regular user obtaining root-equivalent rights through sudo, a setuid binary, or a vulnerability.",
            },
            {
              term: "Authentication",
              description:
                "Proving identity (who you are) — password, key, token, or similar.",
            },
            {
              term: "Authorization",
              description:
                "Deciding what that proven identity is allowed to do — groups, file modes, sudo rules, and other policy.",
            },
          ],
        },
        {
          type: "callout",
          title: "Day-to-day accounts",
          text: "Do routine work as a **regular account**. Use elevated privileges only for the specific administrative task, then return to the unprivileged session. Living as root increases blast radius for mistakes and malware.",
        },
        {
          type: "terminal",
          preset: "security-privilege-management",
          suggestions: [
            { command: "whoami", label: "whoami" },
            { command: "id", label: "id" },
            { command: "id root", label: "id root" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect identity",
        },
      ],
    },
    {
      id: "understanding-sudo",
      title: "Understanding sudo",
      blocks: [
        {
          type: "paragraph",
          text: "**sudo** (“superuser do”) lets an **authorized** user run a specific command with elevated privileges — typically as root — without sharing the root password or staying in a root shell. Authorization usually comes from group membership (often `%sudo` / `%wheel`) and/or explicit rules.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "sudo command",
              blocks: [
                {
                  type: "paragraph",
                  text: "Elevates **one** operation. Easier to audit and closer to least privilege when rules are command-specific.",
                },
              ],
            },
            {
              title: "Root shell (sudo -i / -s)",
              blocks: [
                {
                  type: "paragraph",
                  text: "Elevates an **entire session**. Convenient for long admin work, but widens opportunity for mistakes — prefer single commands when practical.",
                },
              ],
            },
          ],
        },
        {
          type: "list",
          items: [
            "Inspect your rights safely with `sudo -l` (lists allowed commands for the current user)",
            "A policy that **grants** access is not the same as a command that **ran** — execution still depends on matching rules, syntax validity, and (on real hosts) authentication",
            "This lab never prompts for a real password; it only explains when a password would normally be required",
          ],
        },
        {
          type: "terminal",
          preset: "security-privilege-management",
          suggestions: [
            { command: "sudo -l", label: "sudo -l" },
            { command: "sudo systemctl status nginx", label: "sudo status" },
            { command: "switch-user deploy", label: "switch deploy" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Try sudo safely",
        },
      ],
    },
    {
      id: "sudoers-configuration",
      title: "sudoers Configuration",
      blocks: [
        {
          type: "paragraph",
          text: "Policy lives primarily in **`/etc/sudoers`**, often with drop-in files under **`/etc/sudoers.d/`**. Administrators edit with **`visudo`** so syntax is validated before the policy is activated — a typo can lock out administrative access.",
        },
        {
          type: "code",
          title:
            "Educational examples (fictional — do not treat as a live host policy)",
          language: "bash",
          code: "# Unrestricted administrative rule (high risk if overused)\n%sudo ALL=(ALL:ALL) ALL\n\n# Command-specific deployment rule (prefer this shape)\ndeploy ALL=(ALL) /usr/local/bin/deploy-app\n\n# Read-only diagnostic rule\nbunsal ALL=(ALL) systemctl status nginx, journalctl -u nginx\n\n# NOPASSWD — skip password; use only with strong justification\nbackup ALL=(ALL) NOPASSWD: apt update\n\n# Restrictive: analyst may only check service status\nanalyst ALL=(ALL) systemctl status nginx",
        },
        {
          type: "definitions",
          items: [
            {
              term: "NOPASSWD",
              description:
                "Allows matching commands without a password prompt. Convenient for automation — dangerous if paired with broad commands or accounts that can be compromised.",
            },
            {
              term: "visudo -c",
              description:
                "Checks sudoers syntax without opening an editor. In this lab it validates the fictional in-memory policy only.",
            },
          ],
        },
        {
          type: "callout",
          title: "Syntax errors matter",
          text: "An invalid sudoers file can prevent sudo from loading policy at all. Always validate, keep a recovery path, and prefer small drop-in changes you can reverse.",
        },
        {
          type: "terminal",
          preset: "security-privilege-management",
          suggestions: [
            { command: "cat /etc/sudoers", label: "cat sudoers" },
            { command: "ls /etc/sudoers.d/", label: "ls sudoers.d" },
            { command: "cat /etc/sudoers.d/10-deploy", label: "cat deploy" },
            { command: "visudo -c", label: "visudo -c" },
          ],
          suggestionsLabel: "Inspect policy files",
        },
      ],
    },
    {
      id: "least-privilege",
      title: "Least Privilege",
      blocks: [
        {
          type: "list",
          items: [
            "Grant only the **administrative permissions** a role needs",
            "Avoid unnecessary membership in privileged groups such as `sudo`",
            "Prefer **command-specific** sudo rules over `ALL` when appropriate",
            "Review and remove outdated privileges after role changes",
            "Avoid broad unrestricted rules unless there is a justified admin requirement",
            "Consider operational dependencies before removing access someone still needs",
          ],
        },
        {
          type: "note",
          text: "Least privilege is a continuous review habit, not a one-time chmod or group edit. Document why each elevated grant exists.",
        },
        {
          type: "terminal",
          preset: "security-privilege-management",
          suggestions: [
            { command: "id deploy", label: "id deploy" },
            { command: "switch-user deploy", label: "switch deploy" },
            { command: "sudo -l", label: "sudo -l" },
            { command: "getent group sudo", label: "getent sudo" },
          ],
          suggestionsLabel: "Compare role vs rights",
        },
      ],
    },
    {
      id: "auditing-access",
      title: "Auditing Administrative Access",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "Inspect a user’s sudo authorization (`sudo -l` as that user, or review sudoers drop-ins)",
            "Review administrative group membership (`id`, `groups`, `getent group sudo`)",
            "Flag overly broad policies (`ALL` commands, unexpected sudo group members, casual NOPASSWD)",
            "Investigate simulated activity with `sudoers-log` in this lab",
            "Document changes and re-verify with `visudo -c`, `sudo -l`, and group queries",
          ],
        },
        {
          type: "terminal",
          preset: "security-privilege-management",
          suggestions: [
            { command: "getent group sudo", label: "sudo group" },
            { command: "sudoers-log", label: "activity log" },
            { command: "id analyst", label: "id analyst" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Audit helpers",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm privilege levels, sudo purpose, and authentication vs authorization before the lab.",
        },
        {
          type: "exercise",
          id: "security-privilege-management-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Privilege Management Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Five scenarios on a fictional server: excess group membership, unrestricted sudo, NOPASSWD risk, invalid sudoers syntax, and a short access audit. Validation checks the **simulated policy state**, not only the command text.",
        },
        {
          type: "exercise",
          id: "security-privilege-management-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Five terminal exercises covering identity inspection, sudo listing, least-privilege remediation, NOPASSWD review, and syntax validation.",
        },
        {
          type: "exercise",
          id: "security-privilege-management-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-privilege-management-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about Linux privilege management:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain regular users vs root (UID 0) and why daily work should stay unprivileged",
            "Distinguish authentication from authorization and recognize privilege escalation",
            "Use sudo for controlled elevation and prefer single commands over root shells when practical",
            "Read educational sudoers examples, drop-ins, NOPASSWD, and visudo validation",
            "Apply least privilege: minimal groups, command-specific rules, reviewed grants",
            "Audit membership, policies, and simulated administrative activity",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`whoami` / `id` / `groups`", "Identity and membership"],
            ["`getent group sudo`", "Inspect administrative group members"],
            ["`sudo -l`", "List allowed sudo rules for current user"],
            ["`sudo COMMAND`", "Run a supported elevated command if allowed"],
            ["`cat /etc/sudoers`", "View main fictional policy"],
            ["`ls /etc/sudoers.d/`", "List drop-in policy files"],
            ["`visudo -c`", "Validate fictional sudoers syntax"],
            ["`sudoers-log`", "Review simulated admin activity"],
            ["`switch-user USER`", "Lab helper to change current user"],
            ["`policy …`", "Lab helpers to tighten or repair policy"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [SSH Security Hardening](/learn/security/ssh-hardening) — reducing remote-access risk with deliberate sshd and authentication choices.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
