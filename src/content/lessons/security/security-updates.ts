import type { Lesson } from "@/types/lesson";

export const securityUpdatesLesson = {
  slug: "security-updates",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Security Updates and Vulnerability Management",
  description:
    "Identify outdated packages, read advisories and severity, prioritize remediation, and verify that patches actually reduce risk on a running system.",
  seoTitle:
    "Security Updates and Vulnerability Management — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux security updates: package metadata, apt update vs upgrade, fictional DEMO advisories, CVSS limits, prioritization, patch verification, restarts, and reboots in a simulated lab.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Security Updates and Vulnerability Management" },
  ],
  navigation: {
    previous: {
      label: "Firewall Hardening",
      href: "/learn/security/firewall-hardening",
    },
    next: {
      label: "Linux Security Auditing",
      href: "/learn/security/security-auditing",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Firewall Hardening](/learn/security/firewall-hardening) shrinks **network exposure**, **security updates** close known weaknesses in the software you still run. This lesson teaches how to find outdated packages, interpret advisories, prioritize fixes, and confirm that installed patches are **actually active** — not just present on disk.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real `apt`, never contacts real package repositories, never performs vulnerability scans against real hosts, and never restarts real services or reboots your machine. Advisory identifiers such as **DEMO-2026-*** are **fictional teaching labels** — they are **not** real CVEs or vendor bulletins.",
    },
  ],
  sections: [
    {
      id: "understanding-security-updates",
      title: "Understanding Security Updates",
      blocks: [
        {
          type: "paragraph",
          text: "Not every change to software is a **security update**. Operators need to distinguish ordinary bugs from exploitable weaknesses, and understand why keeping the OS and applications current is a core hardening habit — alongside firewalls, SSH policy, and least privilege.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Bug",
              description:
                "Incorrect behavior (crash, wrong result, performance issue). Bugs can be annoying or costly but are not always security-relevant.",
            },
            {
              term: "Vulnerability",
              description:
                "A weakness an attacker could abuse to violate confidentiality, integrity, or availability. Often tracked publicly (for example CVE records) and in vendor advisories.",
            },
            {
              term: "Misconfiguration",
              description:
                "Secure software deployed insecurely (open permissions, default passwords, exposed admin interfaces). Patching alone does not fix policy mistakes.",
            },
            {
              term: "Patch",
              description:
                "A maintained package version (or configuration change) that fixes a known problem. Security patches target exploitable or high-impact flaws.",
            },
            {
              term: "Feature update",
              description:
                "New capability or UI change. May be desirable operationally but is not the same as closing an advisory.",
            },
            {
              term: "Bugfix update",
              description:
                "Corrects non-security defects. Still worth applying for stability, but urgency differs from active exploitation.",
            },
            {
              term: "Security update",
              description:
                "Maintainer-classified fix for a vulnerability. Often published through distribution **security channels** with explicit version bounds.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "**OS updates** refresh the kernel, core libraries, and base tools attackers probe first",
            "**Application updates** fix daemons you expose (web servers, SSH, containers) and libraries they load (OpenSSL, glibc)",
            "Unpatched software is a standing bet that nobody will exploit a **known** issue",
            "Updates complement — do not replace — [firewall hardening](/learn/security/firewall-hardening) and service configuration",
            "Effective vulnerability management connects **inventory → advisory → patch → verification → documentation**",
          ],
        },
        {
          type: "callout",
          title: "Defense in depth",
          text: "A patched service behind a well-designed firewall is stronger than either control alone. Updates address **software flaws**; network policy addresses **reachability**.",
        },
      ],
    },
    {
      id: "linux-package-security",
      title: "Linux Package Security",
      blocks: [
        {
          type: "paragraph",
          text: "On Debian and Ubuntu systems, **APT** reads **repositories** — curated mirrors of signed package **metadata** and `.deb` archives. Maintainers publish **version numbers**, dependencies, and (for security work) which builds close which advisories. Trust starts with **official or vetted repos** and **signed Release/InRelease** metadata — not random download sites.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Repository",
              description:
                "A structured source of packages (for example `jammy-security/main`). Configured in `/etc/apt/sources.list` and `/etc/apt/sources.list.d/`.",
            },
            {
              term: "Package version",
              description:
                "Distribution-specific string (often `epoch:upstream-debianrevision`). Compare versions with packaging rules, not plain string sort.",
            },
            {
              term: "Candidate version",
              description:
                "Best installable version from configured repos after `apt update` — shown by `apt policy`.",
            },
            {
              term: "Security pocket / channel",
              description:
                "Ubuntu `-security` and Debian **security** suites ship maintainer-reviewed fixes without waiting for the next full release.",
            },
            {
              term: "Signed metadata",
              description:
                "Indexes authenticated with distribution keys so clients detect tampering in transit or on mirrors.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "Prefer **distribution security archives** for production baselines",
            "Treat unknown PPAs and third-party repos as **supply-chain risk** — pin purpose and review keys",
            "Read `apt show` and `apt policy` to see **installed vs available** before upgrading",
            "Security maintenance is a **maintainer + operator** partnership: they publish fixes; you schedule and apply them",
            "Review [Package Management](/learn/essentials/package-management) if APT vocabulary is new",
          ],
        },
        {
          type: "note",
          text: "This lesson focuses on Ubuntu/Debian-style APT examples. Other families (Fedora/RHEL DNF, Arch pacman) follow the same ideas: trusted repos, metadata refresh, and versioned security fixes.",
        },
        {
          type: "terminal",
          preset: "security-updates",
          suggestions: [
            { command: "apt show openssh-server", label: "apt show" },
            { command: "apt policy nginx", label: "apt policy" },
            { command: "apt list --upgradable", label: "list upgradable" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect package metadata",
        },
      ],
    },
    {
      id: "package-update-workflow",
      title: "Package Update Workflow",
      blocks: [
        {
          type: "paragraph",
          text: "A disciplined **update workflow** separates **refreshing indexes** from **installing new package versions**. Skipping `apt update` leaves you judging staleness; confusing `update` with `upgrade` leaves you thinking you patched when you only downloaded metadata.",
        },
        {
          type: "table",
          caption: "APT commands in this lesson’s simulator",
          headers: ["Command", "Purpose", "Common mistake"],
          rows: [
            [
              "`sudo apt update`",
              "Download fresh package indexes from configured repos",
              "Assuming this upgrades installed software — it does **not**",
            ],
            [
              "`apt list --upgradable`",
              "List packages with a newer candidate version",
              "Running before `apt update` and missing newly published fixes",
            ],
            [
              "`sudo apt upgrade`",
              "Install newer versions of installed packages",
              "Ignoring services that need restart to load new code",
            ],
            [
              "`sudo apt full-upgrade`",
              "Upgrade and allow dependency changes/removals if required",
              "Using on production without testing when dependencies shift",
            ],
            [
              "`apt show NAME`",
              "Display description, version, and maintainer metadata",
              "Treating output as a substitute for reading advisories",
            ],
            [
              "`apt policy NAME`",
              "Show installed, candidate, and pin priority",
              "Forgetting that **installed** can lag **candidate** until upgrade",
            ],
            [
              "`apt changelog NAME`",
              "Review fictional security notes for teaching packages",
              "Assuming every changelog entry is security-critical",
            ],
            [
              "`sudo apt install NAME`",
              "Install or upgrade a specific package",
              "Upgrading one package without checking dependent services",
            ],
            [
              "`sudo apt remove NAME`",
              "Remove a package (simulator blocks some essentials)",
              "Removing security tooling instead of patching",
            ],
          ],
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Run `sudo apt update` to refresh metadata",
            "Run `apt list --upgradable` (or targeted `apt policy`) to inventory drift",
            "Read `apt show` / `apt changelog` for context on critical packages",
            "Apply `sudo apt upgrade` or targeted `sudo apt install` during an approved window",
            "Restart affected **services** or **reboot** for kernel updates",
            "Verify running versions (`systemctl status`, `uname -r`) match installed fixes",
          ],
        },
        {
          type: "callout",
          title: "`apt update` ≠ upgrade",
          text: "**`apt update`** synchronizes the local package index with repositories. **`apt upgrade`** (or **`apt install`**) changes installed `.deb` versions. Security work fails when teams run `update` in automation but never schedule `upgrade`.",
        },
        {
          type: "terminal",
          preset: "security-updates",
          suggestions: [
            { command: "sudo apt update", label: "apt update" },
            { command: "apt list --upgradable", label: "list upgradable" },
            { command: "sudo apt upgrade", label: "apt upgrade" },
            { command: "apt policy openssh-server", label: "apt policy" },
            { command: "apt changelog nginx", label: "changelog" },
          ],
          suggestionsLabel: "Practice the update workflow",
        },
      ],
    },
    {
      id: "vulnerability-advisories",
      title: "Vulnerability Advisories",
      blocks: [
        {
          type: "paragraph",
          text: "**Advisories** translate research into operator action: affected products, fixed versions, severity, and mitigation. Public **CVE** identifiers give a shared name to a flaw; **CVSS** scores attempt to summarize impact — but neither replaces **context** on your specific host.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "CVE",
              description:
                "Common Vulnerabilities and Exposures — a public identifier for a known issue. Real CVEs appear in vendor bulletins; this lesson uses **DEMO-*** IDs instead.",
            },
            {
              term: "CVSS",
              description:
                "Common Vulnerability Scoring System — numeric severity model (often 0–10). Useful for triage, not a complete priority order.",
            },
            {
              term: "Vendor advisory",
              description:
                "Distribution or vendor notice tying a flaw to package versions and recommended remediation steps.",
            },
            {
              term: "Affected / fixed version",
              description:
                "Version bounds stating which builds are vulnerable and which package version contains the fix.",
            },
          ],
        },
        {
          type: "table",
          caption:
            "Fictional DEMO-2026-* advisories (teaching data — not real CVEs)",
          headers: ["ID", "Package", "Severity", "CVSS", "Teaching focus"],
          rows: [
            [
              "DEMO-2026-001",
              "openssh-server",
              "Critical",
              "9.8",
              "Network-exposed SSH with exploit and fix available",
            ],
            [
              "DEMO-2026-002",
              "nginx",
              "High",
              "7.5",
              "Public web proxy; patch plus service reload",
            ],
            [
              "DEMO-2026-003",
              "openssl",
              "High",
              "7.4",
              "Shared library; multiple dependents may need restart",
            ],
            [
              "DEMO-2026-004",
              "sudo",
              "Medium",
              "6.3",
              "Local privilege boundary; high CVSS label ≠ internet urgency",
            ],
            [
              "DEMO-2026-005",
              "docker.io",
              "High",
              "8.1",
              "Disruptive daemon upgrade — maintenance window matters",
            ],
            [
              "DEMO-2026-006",
              "linux-image-generic",
              "Medium",
              "5.9",
              "Kernel fix requires **reboot** to become active",
            ],
          ],
        },
        {
          type: "list",
          items: [
            "**Severity alone ≠ priority** — combine CVSS with exposure, exploit availability, and compensating controls",
            "Check whether the **package is installed** and the running service version is still affected",
            "Confirm a **fixed version** exists in your repos (`apt policy`) before promising remediation dates",
            "Track **pending restart** and **pending reboot** states — installed fixes are not always **active** fixes",
          ],
        },
        {
          type: "paragraph",
          text: "Use the advisory dashboard below to filter fictional **DEMO-2026-*** records, compare remediation status, and practice reading severity alongside exposure — without querying external CVE databases.",
        },
        {
          type: "exercise",
          id: "security-updates-dashboard",
        },
      ],
    },
    {
      id: "vulnerability-prioritization",
      title: "Vulnerability Prioritization",
      blocks: [
        {
          type: "paragraph",
          text: "Prioritization turns a long advisory feed into an **ordered work queue**. Start from evidence on **this** system, then layer business impact — do not sort purely by CVSS.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "**Severity / CVSS** — how bad could successful exploitation be?",
            "**Installed?** — skip packages not present unless they are transitive dependencies you still load",
            "**Running?** — idle packages matter less than active daemons",
            "**Network-exposed?** — internet-facing SSH, web, and VPN endpoints escalate urgency",
            "**Exploit available?** — public proof-of-concept or active campaigns shorten timelines",
            "**Fix available?** — no candidate version means mitigate, isolate, or accept temporary risk explicitly",
            "**Business impact** — downtime, compliance deadlines, and data sensitivity set maintenance windows",
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "High urgency signals",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Critical/high advisory on an **installed**, **running**, **exposed** service",
                    "Known exploit plus fix available in `-security`",
                    "Authentication or remote-code paths on management interfaces",
                  ],
                },
              ],
            },
            {
              title: "Lower urgency (still track)",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Medium severity on local-only tooling with strong access controls",
                    "Package installed but service disabled",
                    "Fix requires reboot but exploit is unproven and exposure is internal-only",
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "callout",
          title: "Example: DEMO-2026-001 vs DEMO-2026-004",
          text: "**DEMO-2026-001** (critical OpenSSH, network-exposed, exploit available) typically outranks **DEMO-2026-004** (medium sudo, local boundary) even though both deserve scheduled patching. Context beats the headline score.",
        },
        {
          type: "terminal",
          preset: "security-updates",
          suggestions: [
            { command: "apt policy openssh-server", label: "policy SSH" },
            { command: "systemctl status ssh", label: "status ssh" },
            { command: "apt list --upgradable", label: "upgradable list" },
          ],
          suggestionsLabel: "Gather prioritization evidence",
        },
      ],
    },
    {
      id: "patch-management-practices",
      title: "Patch Management Practices",
      blocks: [
        {
          type: "paragraph",
          text: "Production patch management balances **speed** against **stability**. Documented schedules, tested rollouts, and explicit verification beat ad-hoc `upgrade` sessions during incidents.",
        },
        {
          type: "list",
          items: [
            "**Regular maintenance windows** — predictable times for non-emergency updates",
            "**Emergency process** — pre-approved paths for critical exposed services with exploit activity",
            "**Testing** — validate application smoke tests on staging or canaries before fleet-wide rollout",
            "**Backups and rollback** — snapshot volumes or image backups before disruptive changes",
            "**Service restarts** — reload daemons so running processes pick up patched libraries",
            "**Reboots** — required when the **running kernel** lags an installed `linux-image-*` fix",
            "**Verification** — confirm installed version, running version, and advisory status align",
            "**Documentation** — ticket IDs, packages changed, restarts performed, and residual risk",
            "**Deferred packages** — pin or hold only with written risk acceptance and compensating controls",
          ],
        },
        {
          type: "code",
          title: "Simulated post-patch verification (fictional host)",
          language: "bash",
          code: `# After upgrading a network service\nsudo apt update\nsudo apt install openssh-server\nsystemctl status ssh\njournalctl -u ssh\n\n# After a kernel security fix\napt policy linux-image-generic\nuname -r\nsudo reboot   # simulated in this app only`,
        },
        {
          type: "callout",
          title: "Do not blind-upgrade production",
          text: "Running `sudo apt full-upgrade` across critical servers without testing, backups, or a rollback plan causes outages that patching was meant to prevent. Use **assess-risk** / **approve-change** checks in the lab before disruptive fictional upgrades.",
        },
        {
          type: "note",
          text: "Some packages cannot update immediately (legacy app pins, license audits, hardware dependencies). Track them explicitly — **held** packages are not **secure** packages.",
        },
        {
          type: "terminal",
          preset: "security-updates",
          suggestions: [
            { command: "assess-risk tested on", label: "risk: tested" },
            { command: "assess-risk backup on", label: "risk: backup" },
            { command: "approve-change", label: "approve change" },
            { command: "sudo systemctl restart nginx", label: "restart nginx" },
            { command: "uname -r", label: "running kernel" },
          ],
          suggestionsLabel: "Practice verification and risk gates",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm update vocabulary, advisory reading, and prioritization before the lab scenarios.",
        },
        {
          type: "exercise",
          id: "security-updates-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Security Updates Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work through fictional host scenarios on `rean-patch`: inventory outdated packages, respond to **DEMO-2026-001**, complete the apt workflow, restart services, handle kernel reboot requirements, and approve disruptive changes only after risk checks. Validation inspects **simulated package and service state**, not just command text.",
        },
        {
          type: "exercise",
          id: "security-updates-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Terminal exercises covering metadata refresh, upgradable inventory, targeted installs, service restarts, simulated reboot, and patch-risk approval.",
        },
        {
          type: "exercise",
          id: "security-updates-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-updates-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to manage security updates and vulnerability remediation deliberately:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Separate bugs, vulnerabilities, and misconfigurations; distinguish feature, bugfix, and security updates",
            "Use trusted repositories, signed metadata, and APT tooling to compare installed vs candidate versions",
            "Follow a safe workflow: `apt update` → inventory → upgrade/install → restart or reboot → verify",
            "Read fictional **DEMO-2026-*** advisories with CVE/CVSS context while remembering severity is not the whole priority story",
            "Prioritize using installation, runtime, exposure, exploit, fix availability, and business impact",
            "Apply patch-management discipline: schedules, testing, backups, documentation, and no blind production upgrades",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`sudo apt update`", "Refresh package indexes (does not upgrade)"],
            ["`apt list --upgradable`", "List packages with newer candidates"],
            ["`sudo apt upgrade` / `full-upgrade`", "Apply available upgrades"],
            ["`apt show` / `apt policy`", "Inspect metadata and version pins"],
            ["`apt changelog NAME`", "Read fictional security change notes"],
            ["`sudo apt install` / `remove`", "Targeted package changes"],
            [
              "`systemctl status` / `sudo systemctl restart`",
              "Inspect and reload fictional services",
            ],
            ["`journalctl -u UNIT`", "Review simulated service logs"],
            ["`uname -r`", "Show running kernel release"],
            ["`sudo reboot`", "Simulated reboot for kernel fixes"],
            [
              "`assess-risk` / `approve-change`",
              "Patch-risk checklist before disruptive upgrades",
            ],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Linux Security Auditing](/learn/security/security-auditing) — inspect security-related logs and build review habits after you patch (coming soon).",
        },
      ],
    },
  ],
} as const satisfies Lesson;
