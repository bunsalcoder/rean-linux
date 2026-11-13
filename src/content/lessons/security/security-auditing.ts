import type { Lesson } from "@/types/lesson";

export const securityAuditingLesson = {
  slug: "security-auditing",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "30–40 min read",
  title: "Linux Security Auditing",
  description:
    "Systematically audit a Linux host: review accounts, permissions, sudo policies, SSH and network configuration, packages, authentication logs, and backup readiness — then assemble findings into a structured report.",
  seoTitle: "Linux Security Auditing — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux security auditing: systematic host review, account auditing, permissions, sudo policies, SSH and firewall checks, package advisories, log analysis, backup verification, and audit reporting in a simulated lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Linux Security Auditing" },
  ],
  navigation: {
    previous: {
      label: "Security Updates",
      href: "/learn/security/security-updates",
    },
    next: {
      label: "Authentication and PAM",
      href: "/learn/security/authentication-and-pam",
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Security Updates](/learn/security/security-updates) taught you to patch known vulnerabilities, **security auditing** brings all prior hardening skills together: accounts, permissions, sudo, SSH, firewalls, packages, logs, and backups — reviewed systematically as a whole rather than in isolation.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real shell commands, never inspects your host, never scans networks, never touches real configs or logs, and never modifies packages. Advisory identifiers such as **DEMO-AUDIT-*** are **fictional teaching labels** — they are **not** real CVEs or vendor bulletins.",
    },
  ],
  sections: [
    {
      id: "auditing-fundamentals",
      title: "Auditing Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "A **security audit** is a systematic, evidence-based review of a system's security posture. It differs from vulnerability scanning (automated tool-driven detection) and penetration testing (active exploitation). An audit examines policies, configurations, and operational evidence to answer: **does this system meet its security requirements?**",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Security audit",
              description:
                "Systematic review of configurations, policies, and evidence against security requirements. Produces documented findings, risk assessments, and recommendations.",
            },
            {
              term: "Vulnerability scan",
              description:
                "Automated tool that probes systems for known weaknesses (outdated software, misconfigurations). Faster but less contextual than an audit.",
            },
            {
              term: "Penetration test",
              description:
                "Authorized attempt to exploit vulnerabilities and demonstrate real impact. Goes beyond detection to prove exploitability.",
            },
            {
              term: "Finding",
              description:
                "A documented observation of a weakness, misconfiguration, or policy gap — the core output of an audit.",
            },
            {
              term: "Severity",
              description:
                "Classification of a finding's potential impact (critical, high, medium, low, informational). Based on the weakness itself.",
            },
            {
              term: "Priority",
              description:
                "Operational urgency for remediation. Combines severity with exposure, exploitability, business context, and compensating controls. Can differ from severity.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "**Scope and authorization** come first — only audit systems you are explicitly authorized to review, and document the agreed boundaries",
            "Compare a known **baseline configuration** (policy or hardened template) against the **current configuration** to spot drift",
            "Audits connect **prior hardening skills** — permissions, sudo, SSH, firewalls, and updates — into one cohesive review",
            "Separate a **finding** (observed weakness), **risk** (impact and likelihood), **recommendation** (proposed fix), and **remediation** (applied corrective action)",
            "Severity and priority can differ: a critical finding behind strong compensating controls may be lower priority than a medium finding on an exposed service",
            "Collect **evidence** as you go — command output, timestamps, and config excerpts — so findings are reproducible",
            "Audit results support decisions — **not** blame. The goal is to **improve posture**, not assign fault",
            "This lesson uses the fictional host **rean-audit** with user **bunsal** for all exercises",
          ],
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            { command: "whoami", label: "whoami" },
            { command: "id", label: "id" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Explore the audit terminal",
        },
      ],
    },
    {
      id: "user-account-auditing",
      title: "User Account Auditing",
      blocks: [
        {
          type: "paragraph",
          text: "Account auditing answers: **who has access, and is it appropriate?** Review all user accounts, group memberships, and privilege boundaries. Focus on accounts with elevated access (sudo group), service accounts that should not have shells, and any accounts that no longer need access.",
        },
        {
          type: "list",
          items: [
            "Use `getent passwd` and `getent group` to enumerate users and groups",
            "Flag every **UID 0** account — only `root` should normally share that identity",
            "Check `getent group sudo` for all users with administrative privileges",
            "Use `id USER` to verify individual group memberships",
            "Service accounts (www-data, postgres, backup) should have `/usr/sbin/nologin` shells",
            "Review password and account policy concepts (lockouts, aging, unused accounts) even when the lab focuses on membership evidence",
            "Contractor and temporary accounts deserve extra scrutiny — they often accumulate privileges over time",
            "**Investigate unfamiliar accounts** before deleting them — they may belong to automation, shared roles, or legitimate operators",
            "Document any unauthorized group memberships as findings",
          ],
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            { command: "getent group sudo", label: "getent group sudo" },
            { command: "id contractor", label: "id contractor" },
            { command: "getent passwd contractor", label: "getent passwd" },
            { command: "groups deploy", label: "groups deploy" },
          ],
          suggestionsLabel: "Audit user accounts",
        },
      ],
    },
    {
      id: "permission-privilege-auditing",
      title: "Permission and Privilege Auditing",
      blocks: [
        {
          type: "paragraph",
          text: "File permissions and sudo policies define what authenticated users can **do**. Audit both traditional modes and ACLs for sensitive files, and review sudoers rules for least privilege compliance.",
        },
        {
          type: "heading",
          level: 3,
          text: "File permissions",
        },
        {
          type: "list",
          items: [
            "Check sensitive files with `ls -l` — secrets, configs, and keys should not be world-readable",
            "Look for **world-writable** paths, unexpected ownership, and over-broad group write",
            "Treat **SUID/SGID** binaries as privileged attack surface — inventory them and justify each one",
            "Use `getfacl` to review extended ACL entries and masks that override traditional permissions",
            "Remediate with `chmod 600` for owner-only access and `setfacl -b` to clear unnecessary ACLs",
            "Confirm least-privilege compliance: every permission should map to a real operational need",
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "sudo policies",
        },
        {
          type: "list",
          items: [
            "Use `sudo -l -U USER` to inspect effective sudo rules per user",
            "Watch for `NOPASSWD: ALL` — especially on service accounts",
            "Service accounts should only run specific commands they need",
            "Review `/etc/sudoers.d/` for drop-in policy files",
          ],
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            {
              command: "ls -l /srv/app/secrets.env",
              label: "ls -l secrets.env",
            },
            {
              command: "getfacl /srv/app/secrets.env",
              label: "getfacl secrets.env",
            },
            { command: "sudo -l -U deploy", label: "sudo -l -U deploy" },
            { command: "ls -l /etc/sudoers.d", label: "ls sudoers.d" },
          ],
          suggestionsLabel: "Audit permissions and privileges",
        },
      ],
    },
    {
      id: "service-network-auditing",
      title: "Service and Network Auditing",
      blocks: [
        {
          type: "paragraph",
          text: "Network-exposed services represent the attack surface visible to external and lateral attackers. Audit which services are running, what they listen on, and whether firewall rules appropriately restrict access.",
        },
        {
          type: "list",
          items: [
            "Use `systemctl list-units --type=service` to see active and enabled services",
            "Use `ss -tuln` (or `ss -tulpn`) to show listening TCP/UDP sockets",
            "Distinguish **service status** (is the unit running?), **listening ports** (what is bound locally?), and **external reachability** (does the firewall or bind address allow remote access?)",
            "Services binding to `0.0.0.0` are accessible from all interfaces — bind to `127.0.0.1` when only local access is needed",
            "Use `ufw status` to verify firewall rules match intended exposure",
            "Use `sshd -T` to review effective SSH daemon configuration",
            "Disable unnecessary network services; document unexpected listeners and missing firewall restrictions as findings",
          ],
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            {
              command: "systemctl list-units --type=service",
              label: "list-units",
            },
            { command: "ss -tuln", label: "ss -tuln" },
            { command: "ss -tulpn", label: "ss -tulpn" },
            { command: "ufw status verbose", label: "ufw status" },
            { command: "sshd -T", label: "sshd -T" },
          ],
          suggestionsLabel: "Audit services and network",
        },
      ],
    },
    {
      id: "package-vulnerability-auditing",
      title: "Package Vulnerability Auditing",
      blocks: [
        {
          type: "paragraph",
          text: "Package auditing connects to the [Security Updates](/learn/security/security-updates) lesson: identify outdated packages with known advisories and verify patches are applied. A single unpatched network-exposed daemon can undermine all other hardening.",
        },
        {
          type: "list",
          items: [
            "Use `apt list --upgradable` to find packages with available updates",
            "Use `apt show PACKAGE` to see version details and advisory information",
            "The fictional advisory **DEMO-AUDIT-2026-001** describes a critical OpenSSH remote code execution — the same pattern from the Security Updates lesson",
            "Verify that critical packages are at their fixed versions",
            "Track outstanding package debt just like you track outstanding findings",
          ],
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            {
              command: "apt list --upgradable",
              label: "apt list --upgradable",
            },
            {
              command: "apt show openssh-server",
              label: "apt show openssh-server",
            },
            { command: "systemctl status ssh", label: "systemctl status ssh" },
          ],
          suggestionsLabel: "Audit package security",
        },
      ],
    },
    {
      id: "log-activity-auditing",
      title: "Log and Activity Auditing",
      blocks: [
        {
          type: "paragraph",
          text: "Authentication logs provide evidence of both normal and suspicious activity. Auditors review log patterns — not just individual entries — to identify indicators that warrant investigation.",
        },
        {
          type: "list",
          items: [
            "Use `journalctl -u ssh` to review SSH authentication attempts",
            "Look for **patterns**: repeated failed passwords from the same IP followed by success suggest brute-force or credential compromise",
            "**Successful login after failures** does not automatically prove compromise — it proves investigation is needed",
            "Review `journalctl -u sudo` for privilege escalation patterns",
            "Document suspicious patterns as findings — classify and recommend investigation, not premature conclusions",
            "Log evidence **supports** investigation; it does not replace it",
          ],
        },
        {
          type: "callout",
          title: "Investigation, not proof",
          text: "Multiple failed SSH passwords from 203.0.113.50 followed by a successful login for `contractor` is a suspicious pattern. It could be a brute-force success, a credential compromise from another breach, or even the contractor mistyping their password. The auditor documents the evidence and recommends investigation — they do not claim proof of compromise from logs alone.",
        },
        {
          type: "terminal",
          preset: "security-auditing",
          suggestions: [
            { command: "journalctl -u ssh", label: "journalctl -u ssh" },
            {
              command: "journalctl -u ssh -n 20",
              label: "journalctl -u ssh -n 20",
            },
            { command: "journalctl -u sudo", label: "journalctl -u sudo" },
          ],
          suggestionsLabel: "Audit authentication logs",
        },
      ],
    },
    {
      id: "findings-and-reporting",
      title: "Findings and Reporting",
      blocks: [
        {
          type: "paragraph",
          text: "Audit findings are the deliverable. Each finding should be structured, evidence-backed, and actionable. A well-written finding includes severity, priority, evidence, potential impact, recommendation, verification criteria, and remediation owner.",
        },
        {
          type: "table",
          caption: "Finding structure (per finding)",
          headers: ["Field", "Purpose"],
          rows: [
            ["`title`", "Clear, specific description of the weakness"],
            [
              "`severity`",
              "Impact classification (critical/high/medium/low/informational)",
            ],
            [
              "`priority`",
              "Operational urgency (immediate/high/medium/low) — may differ from severity",
            ],
            [
              "`evidence`",
              "What was observed (command output, configuration lines)",
            ],
            ["`potential impact`", "What could go wrong if unaddressed"],
            ["`recommendation`", "Specific, actionable remediation steps"],
            ["`verification criteria`", "How to confirm the fix worked"],
            ["`remediation owner`", "Who is responsible for the fix"],
            [
              "`status`",
              "open / in-progress / remediated / accepted-risk / verified",
            ],
          ],
        },
        {
          type: "list",
          items: [
            "Group findings by category (accounts, permissions, SSH, network, packages, logs, backups)",
            "Order by priority — not just severity — to guide remediation scheduling",
            "Include an executive summary with scope, methodology, and overall posture assessment",
            "Track remediation status: open → in-progress → remediated → verified",
            "Accepted risk findings should include justification and compensating controls",
          ],
        },
        {
          type: "paragraph",
          text: "Use the **Audit Workspace** below to walk through all nine categories on the fictional host, review findings, and assemble a session report.",
        },
        {
          type: "exercise",
          id: "security-auditing-workspace",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm audit methodology, finding classification, and log interpretation before the lab scenarios.",
        },
        {
          type: "exercise",
          id: "security-auditing-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Security Auditing Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work through eight guided audit scenarios on the fictional host `rean-audit`: identify unauthorized sudo users, harden secrets files, restrict sudo policies, disable SSH misconfigurations, reduce network exposure, patch vulnerable packages, investigate auth logs, and verify backup readiness.",
        },
        {
          type: "exercise",
          id: "security-auditing-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Terminal exercises covering account enumeration, permission auditing, sudo review, SSH hardening, network exposure analysis, and log investigation.",
        },
        {
          type: "exercise",
          id: "security-auditing-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-auditing-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to perform a systematic security audit of a Linux host:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Distinguish audits from vulnerability scans and penetration tests; understand their complementary roles",
            "Audit user accounts and group memberships for unauthorized privilege",
            "Review file permissions, ACLs, and sudo policies for least privilege compliance",
            "Inspect SSH configuration, running services, and firewall rules for unnecessary exposure",
            "Check packages against advisories and verify patches are applied",
            "Interpret authentication logs cautiously — evidence supports investigation, not automatic conclusions",
            "Verify backup existence and restore capability as part of operational resilience",
            "Structure findings with severity, priority, evidence, impact, recommendations, and verification criteria",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson's simulator",
          headers: ["Command", "Purpose"],
          rows: [
            [
              "`whoami` / `id [USER]`",
              "Current user / user identity and groups",
            ],
            ["`getent passwd [USER]`", "Passwd entry for a user"],
            ["`getent group [GROUP]`", "Group membership"],
            ["`groups [USER]`", "Group list for a user"],
            ["`ls -l PATH`", "Long listing for known paths"],
            ["`getfacl PATH`", "ACL for known paths"],
            ["`sudo -l [-U USER]`", "Sudo rules for current/given user"],
            ["`systemctl status UNIT`", "Fictional service status"],
            ["`ss -tuln` / `ss -tulpn`", "Listening sockets"],
            ["`ufw status [verbose]`", "Firewall status"],
            ["`sshd -T`", "Effective sshd configuration"],
            ["`apt list --upgradable`", "Upgradable packages"],
            ["`journalctl [-u UNIT]`", "Scoped fictional log entries"],
            ["`df -h` / `findmnt`", "Disk usage / mount points"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Authentication and PAM](/learn/security/authentication-and-pam) — learn authentication concepts and how PAM shapes login and access flow.",
        },
      ],
    },
  ],
} as const satisfies Lesson;
