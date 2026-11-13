import type { Lesson } from "@/types/lesson";

export const securityAuthenticationAndPamLesson = {
  slug: "authentication-and-pam",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "25–30 min read",
  title: "Authentication and PAM Fundamentals",
  description:
    "Learn how Linux authentication works, how PAM provides a flexible framework, how policies are configured, and how to troubleshoot failures safely in a simulated lab.",
  seoTitle: "Authentication and PAM Fundamentals — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux authentication and PAM: identity vs authorization, NSS vs PAM, module types and control flags, password policy, lockout, and troubleshooting in a safe simulation.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Authentication and PAM Fundamentals" },
  ],
  navigation: {
    previous: {
      label: "Linux Security Auditing",
      href: "/learn/security/security-auditing",
    },
    next: {
      label: "Mandatory Access Control: AppArmor and SELinux",
      href: "/learn/security/mandatory-access-control",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Linux Security Auditing](/learn/security/security-auditing) taught you to review hosts systematically, this lesson goes deeper on **how login happens**: authentication concepts, the PAM framework, account policies, and safe troubleshooting — building on Stage 03 SSH and Stage 04 SSH hardening without repeating those labs.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never authenticates real users, never reads or modifies host PAM, never accesses real passwords, hashes, or tokens, and never runs real authentication commands. Configuration snippets are **educational examples** labelled as fictional.",
    },
  ],
  sections: [
    {
      id: "authentication-fundamentals",
      title: "Linux Authentication Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "**Authentication** is proving identity — showing that you are the account you claim to be. **Authorization** decides what that identity may do afterward. Confusing the two leads to weak troubleshooting (“password worked, so why no access?”).",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Authentication",
              description:
                "Verifying identity with a password, public key, token, or additional factor before a session starts.",
            },
            {
              term: "Authorization",
              description:
                "Deciding which actions or resources are allowed for an authenticated identity (sudo policy, file modes, group membership, account flags).",
            },
            {
              term: "User identity and UID",
              description:
                "Accounts map a name to a numeric **UID**. Processes and files are owned by UIDs; names are convenience labels resolved via NSS.",
            },
            {
              term: "Password-based authentication",
              description:
                "Proving knowledge of a secret. Convenient, but guessable if weak — and sensitive to spraying and reuse.",
            },
            {
              term: "Public-key authentication",
              description:
                "Proving possession of a private key that matches an authorized public key (common with SSH).",
            },
            {
              term: "Tokens and sessions",
              description:
                "After successful login, the system creates a **session** with environment, limits, and credentials for that login period — not a permanent grant forever.",
            },
            {
              term: "Local vs centralized authentication",
              description:
                "Local files (`/etc/passwd`, `/etc/shadow`) versus directory services (LDAP, FreeIPA, Active Directory). This lesson focuses on local/PAM concepts; centralized setups still often use PAM modules.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "Weak authentication is a common entry point for unauthorized access",
            "Shared accounts destroy accountability",
            "Misconfigured authentication can **lock operators out** as easily as it can leave doors open",
            "Defense in depth: strong credentials, least privilege, monitoring, and recovery paths",
          ],
        },
        {
          type: "terminal",
          preset: "security-authentication-pam",
          suggestions: [
            { command: "getent passwd", label: "getent passwd" },
            { command: "passwd -S bunsal", label: "passwd -S" },
            { command: "getent group sudo", label: "getent group" },
            { command: "help", label: "help" },
          ],
          suggestionsLabel: "Inspect identity",
        },
      ],
    },
    {
      id: "authentication-architecture",
      title: "Linux Authentication Architecture",
      blocks: [
        {
          type: "paragraph",
          text: "Login is a pipeline. A **login application** (console login, SSH, display manager, sudo) asks **PAM** to authenticate and open a session. **NSS** (Name Service Switch) resolves names and related identity data from configured sources.",
        },
        {
          type: "table",
          caption:
            "Roles in the authentication pipeline (educational overview)",
          headers: ["Component", "Role"],
          rows: [
            [
              "Login applications",
              "Programs that request authentication (login, sshd, sudo, su, GUI greeters)",
            ],
            [
              "SSH authentication",
              "Remote login via sshd — often password and/or public key, still typically through PAM for account/session stages",
            ],
            [
              "PAM",
              "Pluggable Authentication Modules — configurable stacks for auth, account, password, and session handling",
            ],
            [
              "NSS",
              "Resolves identity information (passwd, group, hosts, …) via `/etc/nsswitch.conf`",
            ],
            [
              "`/etc/passwd`",
              "Public account attributes: name, UID, GID, home, shell (password field is a placeholder)",
            ],
            [
              "`/etc/shadow`",
              "Sensitive password hashes and aging fields — restricted; this lab never displays hashes",
            ],
            ["`/etc/group`", "Group names, GIDs, and membership lists"],
            [
              "`/etc/nsswitch.conf`",
              "Which sources NSS consults for each database (files, systemd, ldap, …)",
            ],
          ],
        },
        {
          type: "compare-grid",
          columns: [
            {
              title: "PAM",
              blocks: [
                {
                  type: "paragraph",
                  text: "Handles **authentication-related application requests** through configured modules: prove identity, check account validity, change passwords, open/close sessions.",
                },
              ],
            },
            {
              title: "NSS",
              blocks: [
                {
                  type: "paragraph",
                  text: "Resolves **identity and related information sources** — looking up users, groups, and other databases according to `nsswitch.conf`.",
                },
              ],
            },
          ],
        },
        {
          type: "note",
          text: "Stages matter: **authentication** (prove identity) then **account management** (still allowed?) then **session** (set up the login environment). Succeeding at one stage does not skip the others.",
        },
        {
          type: "terminal",
          preset: "security-authentication-pam",
          suggestions: [
            { command: "cat /etc/nsswitch.conf", label: "nsswitch" },
            { command: "cat /etc/passwd", label: "passwd" },
            { command: "cat /etc/shadow", label: "shadow (blocked)" },
            { command: "getent passwd analyst", label: "getent analyst" },
          ],
          suggestionsLabel: "Architecture files",
        },
      ],
    },
    {
      id: "understanding-pam",
      title: "Understanding PAM",
      blocks: [
        {
          type: "paragraph",
          text: "**Pluggable Authentication Modules (PAM)** let applications share a flexible authentication framework. Instead of embedding password checks in every program, apps call PAM, which runs a **stack** of modules from a service configuration file.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "PAM service file",
              description:
                "Per-application config under `/etc/pam.d/` (for example `sshd`, `login`, `sudo`) listing modules to run.",
            },
            {
              term: "Module",
              description:
                "A shared library implementing a specific check or action (`pam_unix.so`, `pam_faillock.so`, …).",
            },
            {
              term: "Stack processing",
              description:
                "Modules run in order; **control flags** decide whether success/failure continues, stops, or short-circuits.",
            },
          ],
        },
        {
          type: "table",
          caption: "Four common PAM module types",
          headers: ["Type", "Purpose"],
          rows: [
            [
              "`auth`",
              "Authenticate the user (password, key gateways, MFA hooks)",
            ],
            [
              "`account`",
              "Account validity: expiration, lockout, access time, nologin",
            ],
            ["`password`", "Password change and quality enforcement"],
            ["`session`", "Session setup/teardown: limits, env, logging"],
          ],
        },
        {
          type: "table",
          caption: "Control flags (teaching model)",
          headers: ["Flag", "On success", "On failure"],
          rows: [
            [
              "`required`",
              "Continue",
              "Remember failure; continue running later modules",
            ],
            ["`requisite`", "Continue", "Fail immediately; stop the stack"],
            [
              "`sufficient`",
              "If no prior required failure, succeed early and stop",
              "Ignore and continue",
            ],
            [
              "`optional`",
              "Continue (rarely decisive alone)",
              "Usually ignore",
            ],
          ],
        },
        {
          type: "code",
          title: "Educational PAM excerpt (fictional)",
          language: "text",
          code: "# Fictional /etc/pam.d/sshd teaching excerpt\n@include common-auth\n@include common-account\n@include common-session\n\n# Conceptual common-auth lines:\nauth  required   pam_faillock.so preauth silent deny=5 unlock_time=900\nauth  sufficient pam_unix.so\nauth  required   pam_faillock.so authfail deny=5 unlock_time=900\nauth  required   pam_deny.so",
        },
        {
          type: "callout",
          title: "Order and flags change outcomes",
          text: "A **sufficient** success can end the auth stage early. A **requisite** failure aborts immediately. A **required** failure lets later modules run but still fails the stage. Use the explorer below to see these paths.",
        },
        {
          type: "exercise",
          id: "security-authentication-pam-explorer",
        },
      ],
    },
    {
      id: "pam-configuration",
      title: "PAM Configuration",
      blocks: [
        {
          type: "paragraph",
          text: "Most distributions keep service files in **`/etc/pam.d/`**. Applications select a service name; PAM loads that file. Shared **`common-*`** includes keep policy consistent across login, SSH, and other services.",
        },
        {
          type: "list",
          items: [
            "Typical line: `type` · `control` · `module` · optional **arguments**",
            "`@include common-auth` pulls a shared authentication stack",
            "Module arguments tune behavior (`deny=5`, `minlen=12`, `remember=5`)",
            "Manually editing authentication configuration requires care — typos lock people out",
            "Invalid modules or broken includes can break login for every service that shares them",
          ],
        },
        {
          type: "callout",
          title: "Do not weaken authentication for convenience",
          text: "This lesson uses educational examples only. Do not treat lab helpers as instructions to bypass access controls or disable authentication on real systems. Preserve a recovery path before changing production PAM.",
        },
        {
          type: "terminal",
          preset: "security-authentication-pam",
          suggestions: [
            { command: "cat /etc/pam.d/sshd", label: "sshd PAM" },
            { command: "cat /etc/pam.d/login", label: "login PAM" },
            { command: "cat /etc/pam.d/common-auth", label: "common-auth" },
            { command: "cat /etc/pam.d/sudo", label: "sudo PAM" },
          ],
          suggestionsLabel: "Inspect PAM files",
        },
      ],
    },
    {
      id: "password-account-policies",
      title: "Password and Account Policies",
      blocks: [
        {
          type: "paragraph",
          text: "Authentication security is more than “have a password.” Policies cover **quality**, **aging**, **expiration**, **lockout**, **reuse prevention**, and **session restrictions**. Exact module names and defaults vary across distributions.",
        },
        {
          type: "table",
          caption: "Policy concepts and common tools",
          headers: ["Concept", "What it controls", "Common tools / modules"],
          rows: [
            [
              "Password quality",
              "Minimum length and character class expectations",
              "`pam_pwquality`, `passwd`",
            ],
            [
              "Password aging",
              "How often passwords must change; warning windows",
              "`chage`, shadow aging fields",
            ],
            [
              "Account expiration",
              "Hard end date for the account itself",
              "`chage -E`, account stage modules",
            ],
            [
              "Account lockout",
              "Temporary block after repeated failures",
              "`faillock`, `pam_faillock`",
            ],
            [
              "Failed attempts",
              "Counters and evidence for investigation",
              "`faillock`, auth logs",
            ],
            [
              "Reuse prevention",
              "Block recently used passwords",
              "`pam_pwhistory`",
            ],
            [
              "Session restrictions",
              "Limits, nologin, resource controls",
              "`pam_limits`, `pam_nologin`",
            ],
            [
              "Root login considerations",
              "Whether root may authenticate remotely or at console",
              "sshd policy + PAM; prefer individual admin accounts",
            ],
            [
              "Multi-factor authentication",
              "Additional proof beyond password or key",
              "Conceptual layering — not fully implemented in this lab",
            ],
          ],
        },
        {
          type: "note",
          text: "Module availability differs (Debian/Ubuntu `pam-auth-update`, RHEL `authselect`, custom stacks). Always check your distribution’s documentation before copying examples.",
        },
        {
          type: "terminal",
          preset: "security-authentication-pam",
          suggestions: [
            { command: "chage -l bunsal", label: "chage bunsal" },
            { command: "faillock --user deploy", label: "faillock" },
            {
              command: "pam-auth-update --status",
              label: "pam-auth-update",
            },
            { command: "passwd -S backup", label: "passwd -S backup" },
          ],
          suggestionsLabel: "Inspect policy",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Authentication Troubleshooting",
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: "Failed login attempts",
              description:
                "Wrong credentials, disabled methods, or spray noise — investigate patterns before assuming breach.",
            },
            {
              term: "Account expiration",
              description:
                "Auth may succeed while account stage denies — check `chage -l`.",
            },
            {
              term: "Locked accounts",
              description:
                "faillock / consecutive failures — unlock only after understanding cause.",
            },
            {
              term: "Incorrect authentication policy",
              description:
                "Over-strict or incomplete stacks; missing includes; wrong control flags.",
            },
            {
              term: "Missing or invalid PAM modules",
              description:
                "Unknown `.so` names or broken paths fail the stack — validate before relying on login.",
            },
            {
              term: "SSH and PAM interaction",
              description:
                "sshd may accept keys while PAM still enforces account/session rules — layered failure modes.",
            },
            {
              term: "Authentication logs",
              description:
                "`journalctl` / auth logs show failures, lockouts, expirations, and successes for correlation.",
            },
          ],
        },
        {
          type: "callout",
          title: "Recovery before policy changes",
          text: "Administrators should preserve a recovery path (console, out-of-band, verified second session) before changing authentication policies. A single bad PAM edit can lock every remote operator out.",
        },
        {
          type: "terminal",
          preset: "security-authentication-pam",
          suggestions: [
            { command: "pam-eval sshd analyst", label: "pam-eval analyst" },
            { command: "journalctl -u ssh", label: "journalctl" },
            { command: "systemctl status ssh", label: "status ssh" },
            { command: "faillock --user deploy", label: "faillock" },
          ],
          suggestionsLabel: "Troubleshoot safely",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm authentication vs authorization, PAM’s role, and NSS before the lab.",
        },
        {
          type: "exercise",
          id: "security-authentication-pam-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Authentication Security Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Six scenarios on a fictional server: account expiration, lockout after failures, invalid PAM configuration, auth-versus-account denial, weak policy, and log investigation. Validation checks **simulated authentication outcomes**, not only command text.",
        },
        {
          type: "exercise",
          id: "security-authentication-pam-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Six terminal exercises covering account inspection, PAM includes, expiration, lockout, invalid configuration repair, and policy hardening.",
        },
        {
          type: "exercise",
          id: "security-authentication-pam-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "exercise",
          id: "security-authentication-pam-quiz",
        },
      ],
    },
    {
      id: "summary",
      title: "Summary",
      blocks: [
        {
          type: "paragraph",
          text: "You should now be able to reason about Linux authentication and PAM:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Explain authentication vs authorization, identity/UID, and local vs centralized auth",
            "Describe how login apps, PAM, NSS, passwd/shadow/group, and nsswitch fit together",
            "Interpret PAM module types (`auth`, `account`, `password`, `session`) and control flags",
            "Read `/etc/pam.d` service files and shared includes with caution",
            "Apply password quality, aging, lockout, and reuse concepts without weakening controls",
            "Troubleshoot failures while preserving a recovery path and reading logs carefully",
          ],
        },
        {
          type: "table",
          caption: "Command reference for this lesson’s simulator",
          headers: ["Command", "Purpose"],
          rows: [
            ["`getent passwd [USER]`", "Show fictional passwd entries"],
            ["`getent group [GROUP]`", "Show fictional group membership"],
            ["`passwd -S USER`", "Password status (no secrets)"],
            ["`chage -l USER`", "Aging and expiration metadata"],
            ["`faillock --user USER`", "Failed-login / lockout state"],
            ["`pam-auth-update --status`", "Fictional PAM profile summary"],
            ["`cat /etc/pam.d/SERVICE`", "View PAM service file"],
            ["`pam-eval SERVICE USER`", "Evaluate fictional PAM stack"],
            ["`journalctl -u ssh`", "Simulated authentication logs"],
            ["`systemctl status ssh`", "Simulated SSH service status"],
            ["`pam-unlock USER`", "Lab helper: clear lockout"],
            ["`pam-extend USER`", "Lab helper: clear expiration"],
            ["`pam-fix-config`", "Lab helper: repair invalid PAM"],
            ["`pam-harden-policy`", "Lab helper: enable quality + lockout"],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Mandatory Access Control: AppArmor and SELinux](/learn/security/mandatory-access-control) — distinguish discretionary access control from mandatory access control (coming soon).",
        },
      ],
    },
  ],
} as const satisfies Lesson;
