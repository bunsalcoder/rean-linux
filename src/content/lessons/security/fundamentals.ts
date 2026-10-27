import type { Lesson } from "@/types/lesson";

export const securityFundamentalsLesson = {
  slug: "fundamentals",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Linux Security Fundamentals",
  description:
    "Understand confidentiality, integrity, availability, least privilege, and defense in depth — then practice a simulated security posture review.",
  seoTitle: "Linux Security Fundamentals — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux security fundamentals: CIA triad, authentication vs authorization, least privilege, attack surface, updates, logs, backups, and a safe simulated assessment.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Linux Security Fundamentals" },
  ],
  navigation: {
    previous: {
      label: "Linux Administration",
      href: "/learn/administration",
    },
    next: {
      label: "Users, Groups, and Access Control Review",
      href: "/learn/security/access-control",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "Welcome to **Stage 04 — Linux Security and Hardening**. After [Linux Administration](/learn/administration), you can operate services, networks, SSH, firewalls, logs, and backups. This lesson builds a **security mindset**: how those same controls protect confidentiality, integrity, and availability — without repeating the full Stage 03 labs.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real security scans, never probes networks, never accesses your host accounts or firewall, and never exploits vulnerabilities.",
    },
  ],
  sections: [
    {
      id: "why-security-matters",
      title: "What Linux Security Means and Why It Matters",
      blocks: [
        {
          type: "paragraph",
          text: "**Linux security** is the practice of protecting systems, data, and services so the right people can do their work — and unauthorized people cannot read, change, or disrupt what matters.",
        },
        {
          type: "list",
          items: [
            "Protects user data, credentials, and business information",
            "Keeps services trustworthy for customers and teammates",
            "Limits damage when a single control fails",
            "Supports recovery when something goes wrong",
          ],
        },
        {
          type: "note",
          text: "No single control is enough by itself. Passwords, firewalls, permissions, updates, and backups work better as a set.",
        },
      ],
    },
    {
      id: "cia-triad",
      title: "The CIA Triad",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Confidentiality",
              description:
                "Only authorized people and processes can read sensitive information (for example secret files with strict modes).",
            },
            {
              term: "Integrity",
              description:
                "Data and configurations stay accurate and unaltered except by authorized changes (updates, permissions, and change control help).",
            },
            {
              term: "Availability",
              description:
                "Systems and data remain usable when needed — including verified backups and recovery readiness.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Most security decisions trade among these three goals. Locking a system down too aggressively can hurt availability; opening everything for convenience can hurt confidentiality.",
        },
        {
          type: "table",
          caption: "CIA triad examples on a Linux host",
          headers: ["Goal", "Example control", "What goes wrong without it"],
          rows: [
            [
              "Confidentiality",
              "`chmod 600` on secrets",
              "Other local users can read credentials",
            ],
            [
              "Integrity",
              "Security updates + limited sudo",
              "Known bugs or unauthorized changes alter the system",
            ],
            [
              "Availability",
              "Verified backups",
              "You cannot restore after loss or ransomware",
            ],
          ],
        },
      ],
    },
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
                "Proving identity — “Who are you?” SSH keys, passwords, and MFA are authentication factors.",
            },
            {
              term: "Authorization",
              description:
                "Granting power after identity is known — “What may you do?” Groups, sudo, and file modes are authorization controls.",
            },
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Authentication problem",
              blocks: [
                {
                  type: "paragraph",
                  text: "PasswordAuthentication is enabled on SSH, making credential guessing easier.",
                },
              ],
            },
            {
              title: "Authorization problem",
              blocks: [
                {
                  type: "paragraph",
                  text: "A contractor account is in the `sudo` group without a clear need.",
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Keep them separate",
          text: "Fixing how someone logs in does not automatically fix what they can do afterward — and vice versa.",
        },
      ],
    },
    {
      id: "least-privilege-defense",
      title: "Least Privilege and Defense in Depth",
      blocks: [
        {
          type: "paragraph",
          text: "**Least privilege** means granting only the access required for a task — no extra sudo rights, world-readable secrets, or open ports “just in case.”",
        },
        {
          type: "paragraph",
          text: "**Defense in depth** means stacking independent layers so one failure is not catastrophic. Example: strong SSH auth **and** a firewall **and** tight file modes **and** timely updates **and** monitoring **and** verified backups.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Identity and authentication (who can log in)",
            "Authorization and privileges (what they can do)",
            "File and service permissions",
            "Network exposure controls",
            "Patching and vulnerability management",
            "Logging and review",
            "Backups and recovery",
          ],
        },
        {
          type: "note",
          text: "If you only harden the firewall but leave secrets world-readable and sudo wide open, risk remains high.",
        },
      ],
    },
    {
      id: "attack-surface",
      title: "Attack Surface and Unnecessary Services",
      blocks: [
        {
          type: "paragraph",
          text: "**Attack surface** is everything an attacker might try to abuse: listening services, open ports, privileged accounts, exposed files, and outdated software.",
        },
        {
          type: "paragraph",
          text: "Unnecessary services increase risk because each one adds code, configuration, and a network entry point you must maintain. If nobody needs telnet, it should not be running.",
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "systemctl status telnet", label: "status telnet" },
            { command: "sudo ufw status", label: "ufw status" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect exposure",
        },
      ],
    },
    {
      id: "controls-overview",
      title: "Users, Permissions, and Privileged Operations as Controls",
      blocks: [
        {
          type: "paragraph",
          text: "Stage 02–03 already covered users, groups, permissions, and sudo in depth. As security controls, they answer:",
        },
        {
          type: "list",
          items: [
            "Which identities exist on the host?",
            "Which groups grant powerful roles (like `sudo`)?",
            "Which files hold secrets, and who can read them?",
            "Which operations require elevation — and who may elevate?",
          ],
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            { command: "whoami", label: "whoami" },
            { command: "id contractor", label: "id contractor" },
            { command: "ls -l /opt/app/secrets.env", label: "ls secrets" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect identity and files",
        },
      ],
    },
    {
      id: "updates-and-vulns",
      title: "Security Updates and Vulnerability Management",
      blocks: [
        {
          type: "paragraph",
          text: "Software bugs become **vulnerabilities** when attackers can abuse them. Security updates reduce that risk. Pending upgrades are not automatically a live breach — but they are a prioritized hygiene item.",
        },
        {
          type: "list",
          items: [
            "Discover available upgrades (`apt list --upgradable` in this lab)",
            "Understand impact (remote service? privileged package?)",
            "Apply updates in a controlled window",
            "Recheck services after patching",
          ],
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            { command: "apt list --upgradable", label: "upgradable" },
            { command: "sudo apt upgrade", label: "apt upgrade" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check updates",
        },
      ],
    },
    {
      id: "network-exposure",
      title: "Network Exposure, Open Ports, and Remote Access",
      blocks: [
        {
          type: "paragraph",
          text: "A listening port (`ss -tuln`) plus a firewall allow rule can make a service reachable. SSH is often necessary; random admin ports and legacy protocols usually are not.",
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "Open port",
              blocks: [
                {
                  type: "paragraph",
                  text: "Something is reachable or allowed. That is exposure — investigate necessity.",
                },
              ],
            },
            {
              title: "Confirmed incident",
              blocks: [
                {
                  type: "paragraph",
                  text: "Evidence shows unauthorized activity succeeded. An open port alone does **not** prove that.",
                },
              ],
            },
          ],
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "sudo ufw status", label: "ufw status" },
            { command: "cat /etc/ssh/sshd_config", label: "sshd_config" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Review remote exposure",
        },
      ],
    },
    {
      id: "logs-and-monitoring",
      title: "Logs, Monitoring, and Suspicious Activity",
      blocks: [
        {
          type: "paragraph",
          text: "Logs help you notice unusual patterns — failed SSH passwords, sudden privilege use, unexpected service starts. Treat them as **evidence to investigate**, not automatic proof of compromise.",
        },
        {
          type: "list",
          items: [
            "A vulnerability is a weakness that *could* be abused",
            "A log warning is a signal that something *might* need review",
            "A confirmed incident needs corroborating evidence and impact",
          ],
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            { command: "journalctl -u ssh", label: "journal ssh" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect logs",
        },
      ],
    },
    {
      id: "backups-availability",
      title: "Backups, Recovery, and Availability",
      blocks: [
        {
          type: "paragraph",
          text: "A backup file that exists is not the same as a backup that has been **verified**. Availability depends on restore readiness, not only on archive presence.",
        },
        {
          type: "table",
          caption: "Backup existence vs verification",
          headers: ["State", "What you know", "What you still risk"],
          rows: [
            [
              "Backup exists",
              "An archive file is present",
              "It may be incomplete, corrupt, or unrestorable",
            ],
            [
              "Backup verified",
              "A restore check succeeded in this lab",
              "You still need operational restore procedures",
            ],
          ],
        },
        {
          type: "terminal",
          preset: "security-fundamentals",
          suggestions: [
            {
              command: "ls -l /var/backups/app-daily.tar.gz",
              label: "ls backup",
            },
            {
              command: "verify-backup /var/backups/app-daily.tar.gz",
              label: "verify-backup",
            },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Check backup readiness",
        },
      ],
    },
    {
      id: "common-mistakes",
      title: "Common Linux Security Mistakes",
      blocks: [
        {
          type: "list",
          items: [
            "Running unused services “for later”",
            "Granting sudo broadly instead of narrowly",
            "Leaving secrets world-readable",
            "Relying only on passwords for SSH",
            "Opening firewall ports without a documented need",
            "Delaying security updates indefinitely",
            "Assuming a backup file size means restore works",
            "Treating every failed login as a confirmed breach — or ignoring logs entirely",
          ],
        },
        {
          type: "callout",
          title: "Critical vs low priority",
          text: "World-readable production secrets are usually more urgent than a single low-severity log warning. Prioritize by impact and likelihood, then recheck.",
        },
      ],
    },
    {
      id: "posture-review",
      title: "A Systematic Security Posture Review",
      blocks: [
        {
          type: "paragraph",
          text: "Use a repeatable order so you do not miss layers:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Review users and privileges",
            "Inspect sensitive file permissions",
            "Identify unnecessary services and exposed ports",
            "Review SSH and firewall configurations",
            "Check security update status",
            "Inspect relevant logs",
            "Confirm backup verification and recovery readiness",
            "Prioritize remediation based on impact and likelihood",
            "Recheck the system after changes",
          ],
        },
        {
          type: "note",
          text: "Work only on systems you are authorized to administer. Prefer careful verification and the smallest necessary change.",
        },
      ],
    },
    {
      id: "interactive-assessment",
      title: "Interactive Security Assessment",
      blocks: [
        {
          type: "paragraph",
          text: "Walk a fictional app server finding by finding: inspect evidence, classify principle and severity, choose a corrective action, apply a simulated remediation where practical, then recheck.",
        },
        {
          type: "exercise",
          id: "security-fundamentals-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Seven focused scenarios: least privilege, permissive files, network exposure, update priority, authentication vs authorization, logs and verified backups, and layered defenses.",
        },
        {
          type: "exercise",
          id: "security-fundamentals-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-fundamentals-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about Linux security fundamentals:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain why Linux security matters",
            "Apply the CIA triad to practical host examples",
            "Separate authentication from authorization",
            "Use least privilege and defense in depth",
            "Reduce attack surface from unused services and ports",
            "Prioritize updates, review logs carefully, and verify backups",
            "Follow a systematic posture review checklist",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`whoami` / `id` / `groups`", "Inspect identity"],
            ["`ls -l PATH`", "Inspect sensitive file modes"],
            ["`systemctl status telnet|ssh`", "Service status"],
            ["`ss -tuln`", "Listening sockets"],
            ["`sudo ufw status`", "Firewall rules"],
            ["`apt list --upgradable`", "Pending updates"],
            ["`journalctl -u ssh`", "SSH journal clues"],
            ["`cat /etc/ssh/sshd_config`", "SSH auth settings"],
            ["`chmod 600 …`", "Restrict secrets file"],
            ["`sudo systemctl stop|disable telnet`", "Remove unused service"],
            ["`sudo gpasswd -d contractor sudo`", "Least privilege"],
            ["`set-ssh PasswordAuthentication no`", "Harden SSH auth"],
            ["`sudo ufw delete allow 8080/tcp`", "Close unnecessary allow"],
            ["`sudo apt upgrade`", "Apply simulated updates"],
            ["`verify-backup PATH`", "Mark backup verified"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Users, Groups, and Access Control Review](/learn/security/access-control) — a security-focused revisit of identity and access decisions.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
