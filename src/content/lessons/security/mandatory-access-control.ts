import type { Lesson } from "@/types/lesson";

export const securityMandatoryAccessControlLesson = {
  slug: "mandatory-access-control",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Mandatory Access Control: AppArmor and SELinux",
  description:
    "Learn how Mandatory Access Control differs from DAC, how AppArmor profiles and SELinux contexts confine applications, and how to troubleshoot policy denials in a safe simulation.",
  seoTitle:
    "Mandatory Access Control: AppArmor and SELinux — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux MAC with AppArmor and SELinux: DAC vs MAC, profiles, contexts, enforce/complain and Enforcing/Permissive modes, and policy troubleshooting in a safe simulation.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Mandatory Access Control: AppArmor and SELinux" },
  ],
  navigation: {
    previous: {
      label: "Authentication and PAM Fundamentals",
      href: "/learn/security/authentication-and-pam",
    },
    next: {
      label: "Linux Security Incident Response",
      href: "/learn/security/incident-response",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Authentication and PAM Fundamentals](/learn/security/authentication-and-pam) and earlier lessons on [permissions and ACLs](/learn/security/permissions-and-acls), this lesson adds another layer: **Mandatory Access Control (MAC)**. You will compare DAC with MAC, explore AppArmor profiles and SELinux contexts, and practice evidence-first troubleshooting — without touching host security modules.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never executes real AppArmor or SELinux commands, never modifies host profiles or labels, never inspects real process security identities or audit logs, and never weakens actual host security. The fictional lab host shows both systems for comparison only — real distributions typically emphasize one MAC framework.",
    },
  ],
  sections: [
    {
      id: "access-control-models",
      title: "Understanding Access Control Models",
      blocks: [
        {
          type: "paragraph",
          text: "**Access control** decides whether a subject (user or process) may perform an operation on an object (file, socket, capability). Linux traditionally relies on **Discretionary Access Control (DAC)** — owners and administrators set modes and ACLs. **Mandatory Access Control (MAC)** adds system policy that subjects cannot freely override.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Discretionary Access Control (DAC)",
              description:
                "Owners manage access with ownership, permission bits, and ACLs. A compromised process running as that user often inherits those rights.",
            },
            {
              term: "Mandatory Access Control (MAC)",
              description:
                "System policy confines what a process may do — even when DAC would allow the same user to read or write the resource.",
            },
            {
              term: "Least privilege",
              description:
                "Grant only the access required for the task. MAC profiles and types encode that idea for applications.",
            },
            {
              term: "Defense in depth",
              description:
                "Layer controls so one failure (weak chmod, stolen credentials) does not automatically grant full access.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Example: `rean-app` runs as user `app`, and `/srv/app/config.yml` is readable by that user under DAC. An AppArmor profile in **enforce** mode can still deny the open. SELinux can likewise deny `httpd_t` reading a file labeled `default_t` even when `chmod` is `644`. DAC answered “who owns it?”; MAC asks “is this process *allowed* to touch it under policy?”",
        },
        {
          type: "list",
          items: [
            "DAC alone may not stop a compromised application from abusing the user’s full rights",
            "MAC policies add path, label, network, and capability boundaries",
            "Troubleshoot layers separately: modes/ACLs first, then profiles or contexts",
            "Never disable MAC as a first reflex — gather denial evidence first",
          ],
        },
        {
          type: "terminal",
          preset: "security-mandatory-access-control",
          suggestionsLabel: "Try inspecting layered access",
          suggestions: [
            "help",
            "ls -l /srv/app/config.yml",
            "aa-status",
            "mac-eval rean-app read /srv/app/config.yml",
          ],
        },
      ],
    },
    {
      id: "apparmor-fundamentals",
      title: "AppArmor Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "**AppArmor** is a Linux Security Module that confines applications with **profiles** usually attached to executable paths. Profiles declare allowed file access, network use, and capabilities. Ubuntu and related distributions commonly ship AppArmor.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Profile",
              description:
                "Named policy for an executable (for example nginx → /usr/bin/nginx).",
            },
            {
              term: "Enforce mode",
              description: "Violations are blocked (and typically logged).",
            },
            {
              term: "Complain mode",
              description:
                "Violations are logged for tuning, but the operation is not blocked.",
            },
            {
              term: "Denial logs",
              description:
                "Audit/journal messages showing which profile denied which operation — evidence for minimal fixes.",
            },
          ],
        },
        {
          type: "table",
          caption: "Common AppArmor commands (conceptual)",
          headers: ["Command", "Purpose"],
          rows: [
            ["`aa-status`", "Show loaded profiles and enforce/complain state"],
            ["`aa-enforce`", "Set a profile to enforce mode"],
            ["`aa-complain`", "Set a profile to complain mode"],
            ["`aa-disable`", "Disable a profile (use rarely and carefully)"],
            [
              "`apparmor_parser`",
              "Load or replace profile text into the kernel (conceptual here)",
            ],
          ],
        },
        {
          type: "note",
          text: "This lesson never runs real AppArmor. Lab helpers such as `mac-allow-path` and `mac-narrow-profile` simulate minimal policy edits for teaching.",
        },
        {
          type: "terminal",
          preset: "security-mandatory-access-control",
          suggestionsLabel: "AppArmor inspection",
          suggestions: [
            "aa-status",
            "aa-complain rean-app",
            "aa-enforce rean-app",
            "journalctl -u apparmor",
          ],
        },
      ],
    },
    {
      id: "selinux-fundamentals",
      title: "SELinux Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "**SELinux** labels every process and object with a **security context**: `user:role:type:level`. **Type Enforcement** is the everyday workhorse — allow rules decide whether a process type may perform an operation on an object type. Fedora, RHEL, and related distributions commonly use SELinux.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Security context",
              description:
                "Four-part label such as `system_u:system_r:httpd_t:s0`.",
            },
            {
              term: "Type",
              description:
                "Primary label used in allow rules (`httpd_t`, `httpd_sys_content_t`).",
            },
            {
              term: "Enforcing / Permissive / Disabled",
              description:
                "Enforcing blocks denials; Permissive logs AVCs without blocking; Disabled turns SELinux off (avoid as a habit).",
            },
            {
              term: "AVC denial",
              description:
                "Access Vector Cache message recording a policy refusal — changing chmod alone may not fix it.",
            },
          ],
        },
        {
          type: "table",
          caption: "Example fictional SELinux contexts",
          headers: ["Context", "Meaning in this lab"],
          rows: [
            ["`system_u:system_r:httpd_t:s0`", "Web server process domain"],
            [
              "`system_u:object_r:httpd_sys_content_t:s0`",
              "Read-oriented web content",
            ],
            [
              "`system_u:object_r:httpd_sys_rw_content_t:s0`",
              "Web content the domain may write",
            ],
          ],
        },
        {
          type: "table",
          caption: "Common SELinux commands (conceptual)",
          headers: ["Command", "Purpose"],
          rows: [
            ["`getenforce`", "Show current mode"],
            ["`sestatus`", "Summarize SELinux status and policy"],
            ["`ls -Z`", "List files with contexts"],
            ["`ps -Z`", "List processes with contexts"],
            ["`restorecon`", "Restore expected file contexts"],
            ["`semanage`", "Persistent mapping tools (conceptual here)"],
            ["`setenforce`", "Toggle Enforcing/Permissive (lab only)"],
            ["`ausearch`", "Search audit/AVC evidence (simulated)"],
          ],
        },
        {
          type: "callout",
          title: "Why chmod may not help",
          text: "If the **type** is wrong, SELinux can deny the operation while DAC looks fine. Inspect `ls -Z` / `ps -Z` and denial logs before widening modes or switching to Permissive.",
        },
        {
          type: "terminal",
          preset: "security-mandatory-access-control",
          suggestionsLabel: "SELinux inspection",
          suggestions: [
            "getenforce",
            "sestatus",
            "ls -Z /var/www/html/index.html",
            "ps -Z",
            "mac-eval httpd_t read /var/www/html/index.html",
          ],
        },
      ],
    },
    {
      id: "apparmor-vs-selinux",
      title: "AppArmor vs SELinux",
      blocks: [
        {
          type: "paragraph",
          text: "Both provide MAC. Neither is universally better — they differ in model, tooling, and where you usually meet them.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "AppArmor",
              blocks: [
                {
                  type: "list",
                  variant: "plain",
                  items: [
                    "Path-based **profiles** for executables",
                    "Readable allow lists for files, network, capabilities",
                    "Modes: enforce, complain, disabled",
                    "Common on Ubuntu-family systems",
                    "Troubleshoot with `aa-status` and profile denials",
                  ],
                },
              ],
            },
            {
              title: "SELinux",
              blocks: [
                {
                  type: "list",
                  variant: "plain",
                  items: [
                    "Label-based **type enforcement**",
                    "Contexts on processes and files",
                    "Modes: Enforcing, Permissive, Disabled",
                    "Common on Fedora/RHEL-family systems",
                    "Troubleshoot with `ls -Z`, `ps -Z`, AVC messages",
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "This lab host exposes both for teaching. Do not assume a real production image runs AppArmor and SELinux together the same way.",
        },
      ],
    },
    {
      id: "policy-explorer",
      title: "Interactive Policy Explorer",
      blocks: [
        {
          type: "paragraph",
          text: "Use the explorer to inspect fictional AppArmor profiles and SELinux contexts, toggle enforce/complain for teaching profiles, and see why an access decision is allowed or denied.",
        },
        {
          type: "exercise",
          id: "security-mandatory-access-control-explorer",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Security Policy Troubleshooting",
      blocks: [
        {
          type: "paragraph",
          text: "Investigate before changing security settings. Typical cases in this lesson:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Application denied a required file by its AppArmor profile",
            "Process restricted from a network resource by profile rules",
            "Profile left in complain mode when enforce was intended",
            "Incorrect SELinux file context after a copy or restore",
            "Process running in an unexpected SELinux domain",
            "SELinux denial despite “correct” traditional permissions",
            "Mixed DAC failure on one path and MAC failure on another",
          ],
        },
        {
          type: "terminal",
          preset: "security-mandatory-access-control",
          suggestionsLabel: "Evidence-first commands",
          suggestions: [
            "journalctl -u apparmor",
            "ausearch",
            "stat /var/www/html/secret.html",
            "mac-eval httpd_t read /var/www/html/secret.html",
          ],
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Three short questions on DAC vs MAC, AppArmor, and SELinux types before the lab.",
        },
        {
          type: "exercise",
          id: "security-mandatory-access-control-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Mandatory Access Control Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work through six scenarios: AppArmor file denial, complain vs enforce, SELinux context mismatch, type-enforcement write deny, layered DAC+MAC diagnosis, and least-privilege profile review. Hints are available on demand — solutions stay hidden until you verify.",
        },
        {
          type: "exercise",
          id: "security-mandatory-access-control-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Six terminal exercises covering AppArmor status, SELinux contexts, denial remediation, enforce restoration, restorecon, and least-privilege hardening. Checks use simulated state — not only the command string.",
        },
        {
          type: "exercise",
          id: "security-mandatory-access-control-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Assess DAC, MAC, AppArmor, SELinux, enforcement modes, contexts, and troubleshooting. Includes a MAC security checklist for authorized administration work.",
        },
        {
          type: "exercise",
          id: "security-mandatory-access-control-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "DAC is owner-driven; MAC adds mandatory confinement processes cannot freely override",
            "AppArmor uses path-based profiles with enforce and complain modes",
            "SELinux uses security contexts and type enforcement with Enforcing/Permissive/Disabled modes",
            "An operation can fail under MAC even when DAC permissions look correct",
            "Investigate profiles, contexts, and denial logs before widening or disabling policy",
            "Prefer least-privilege fixes; neither AppArmor nor SELinux is universally “better”",
          ],
        },
        {
          type: "table",
          caption: "Command reference (educational simulation)",
          headers: ["Area", "Commands"],
          rows: [
            [
              "AppArmor",
              "`aa-status`, `aa-enforce`, `aa-complain`, `aa-disable`",
            ],
            [
              "SELinux",
              "`getenforce`, `sestatus`, `ls -Z`, `ps -Z`, `restorecon`, `setenforce`",
            ],
            ["Inspection", "`ls -l`, `stat`, `journalctl`, `grep`, `ausearch`"],
            [
              "Lab helpers",
              "`mac-eval`, `mac-allow-path`, `mac-restore-mode`, `mac-narrow-profile`",
            ],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Linux Security Incident Response](/learn/security/incident-response) — follow a safe, evidence-based workflow when something looks wrong.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
