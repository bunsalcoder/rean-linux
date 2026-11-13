import type { Lesson } from "@/types/lesson";

export const securityIncidentResponseLesson = {
  slug: "incident-response",
  level: "security",
  levelNumber: "04",
  difficulty: "Advanced",
  readingTime: "30–40 min read",
  title: "Linux Security Incident Response",
  description:
    "Investigate a fictional Linux security incident: triage alerts, preserve evidence, contain threats, recover safely, verify services, and document lessons learned in a simulated lab.",
  seoTitle: "Linux Security Incident Response — Linux Security | Rean Linux",
  seoDescription:
    "Learn Linux security incident response: event vs incident, IR phases, evidence preservation, containment, eradication, recovery, verification, and post-incident reporting in a safe simulation.",
  breadcrumb: [
    { label: "Learn", href: "/learn" },
    { label: "Linux Security and Hardening", href: "/learn/security" },
    { label: "Linux Security Incident Response" },
  ],
  navigation: {
    previous: {
      label: "Mandatory Access Control: AppArmor and SELinux",
      href: "/learn/security/mandatory-access-control",
    },
    next: {
      label: "Linux Security Challenge",
      href: "/learn/security/challenge",
      unavailable: true,
    },
  },
  intro: [
    {
      type: "paragraph",
      text: "After [Mandatory Access Control](/learn/security/mandatory-access-control) and [Linux Security Auditing](/learn/security/security-auditing), this lesson focuses on what happens when something already looks wrong: **incident response**. You will practice a safe, evidence-based workflow on the fictional host **rean-ir** — investigate, contain, recover, and document — without touching your real system.",
    },
    {
      type: "callout",
      title: "Learning safety",
      text: "Everything here is **simulated**. The app never runs real shell commands, never inspects your host, never isolates real networks, never modifies real accounts or services, never restores real backups, and never provides malware payloads. Addresses use documentation ranges (for example **203.0.113.0/24**). **SIM-HASH-*** and **DEMO-IR-*** labels are educational identifiers — not real cryptography or vendor advisories.",
    },
  ],
  sections: [
    {
      id: "what-is-incident",
      title: "What Is a Security Incident?",
      blocks: [
        {
          type: "paragraph",
          text: "Not every log line is an emergency. Effective responders distinguish **events**, **alerts**, and **incidents**, then apply **confidence levels** so they neither ignore real compromise nor overreact to noise.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Event",
              description:
                "An observed occurrence in a system or network (a login, a process start, a config change). Most events are routine.",
            },
            {
              term: "Alert",
              description:
                "A signal — often from monitoring or SIEM — that an event pattern may need human review.",
            },
            {
              term: "Incident",
              description:
                "A confirmed or strongly suspected security impact that requires coordinated response (unauthorized access, malware indicators, data risk, service abuse).",
            },
            {
              term: "False positive",
              description:
                "An alert that does not represent a real security problem. Common — triage with evidence before disruptive containment.",
            },
            {
              term: "Confidence level",
              description:
                "How sure you are that the hypothesis is true. Low confidence → investigate; high confidence with impact → contain and recover.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "Common Linux security incidents: credential abuse, unexpected privilege changes, unauthorized services or listeners, config tampering, suspicious processes, and exposed databases",
            "Corroborate alerts with multiple evidence types before declaring certainty",
            "Document assumptions — “suspicious login” is not the same as “confirmed attacker ownership”",
            "This lesson uses fictional user **contractor**, host **rean-ir**, and teaching indicators only",
          ],
        },
        {
          type: "terminal",
          preset: "security-incident-response",
          suggestionsLabel: "Explore the IR terminal",
          suggestions: [
            { command: "whoami", label: "whoami" },
            { command: "help", label: "help" },
            { command: "ir-status", label: "ir-status" },
          ],
        },
      ],
    },
    {
      id: "ir-fundamentals",
      title: "Incident Response Fundamentals",
      blocks: [
        {
          type: "paragraph",
          text: "Incident response is a repeatable workflow. Phases can overlap under pressure, but skipping preparation or evidence discipline usually creates bigger problems later.",
        },
        {
          type: "table",
          caption: "Core IR phases (educational overview)",
          headers: ["Phase", "Focus"],
          rows: [
            [
              "Preparation",
              "Contacts, tooling, baselines, backups, access paths, playbooks",
            ],
            [
              "Identification",
              "Detect and validate that an incident (not just noise) is occurring",
            ],
            [
              "Triage & prioritization",
              "Severity, urgency, business impact, and order of work",
            ],
            [
              "Containment",
              "Stop the bleeding — account, network, service, or process controls",
            ],
            [
              "Evidence preservation",
              "Record sources and timestamps before destructive changes when safe",
            ],
            [
              "Eradication",
              "Remove unauthorized changes, persistence, and bad config",
            ],
            [
              "Recovery",
              "Restore known-good state, rotate credentials, return to service",
            ],
            [
              "Lessons learned",
              "Timeline, root causes, preventive improvements, report",
            ],
          ],
        },
        {
          type: "list",
          items: [
            "Preparation happens **before** the pager goes off — inventories, logging, tested backups",
            "Containment and evidence preservation often interleaved: safety first, then forensics quality",
            "Eradication without recovery validation leaves residual risk",
            "Lessons learned feed the next preparation cycle",
          ],
        },
      ],
    },
    {
      id: "scope-impact",
      title: "Incident Scope and Impact",
      blocks: [
        {
          type: "paragraph",
          text: "Scope answers **what is affected?** Impact answers **how bad is it for the business and operations?** Severity labels technical seriousness; priority schedules response under real constraints.",
        },
        {
          type: "list",
          items: [
            "Identify affected **users** (for example contractor), **services** (sshd, nginx), and **systems** (rean-ir)",
            "Assess confidentiality, integrity, and availability impact",
            "A process indicator plus unexpected sudo plus network exposure usually raises priority",
            "Document assumptions about blast radius — lateral movement may need follow-up hosts later",
          ],
        },
        {
          type: "terminal",
          preset: "security-incident-response",
          suggestionsLabel: "Assess scope on rean-ir",
          suggestions: [
            { command: "id contractor", label: "id contractor" },
            { command: "ps aux", label: "ps aux" },
            { command: "ss -tuln", label: "ss -tuln" },
            {
              command: "systemctl status nginx",
              label: "systemctl status nginx",
            },
          ],
        },
      ],
    },
    {
      id: "evidence-collection",
      title: "Evidence Collection",
      blocks: [
        {
          type: "paragraph",
          text: "Evidence turns suspicion into a defensible timeline. Collect authentication logs, service logs, system events, configuration changes, and network exposure records — with **timestamps** and **sources**.",
        },
        {
          type: "definitions",
          items: [
            {
              term: "Authentication logs",
              description:
                "SSH and login records showing failures, successes, sources, and times.",
            },
            {
              term: "Service / system evidence",
              description:
                "Unit status, process lists, and journal excerpts tied to the alert window.",
            },
            {
              term: "Configuration changes",
              description:
                "Unexpected edits (for example unauthorized nginx upstreams) compared to known-good baselines.",
            },
            {
              term: "Network exposure",
              description:
                "Listeners and connection records that show unexpected ports or destinations.",
            },
            {
              term: "Chain of custody (concept)",
              description:
                "Who handled evidence, when, and how it was protected from unnoticed alteration.",
            },
            {
              term: "Evidence integrity (lab)",
              description:
                "This course uses **SIM-HASH-*** educational labels — clearly not real cryptographic verification.",
            },
          ],
        },
        {
          type: "list",
          items: [
            "Prefer read-only inspection before remediating",
            "Note the command or source that produced each clue",
            "Mark items relevant or inconclusive — not everything is a smoking gun",
            "Preserve evidence **before** killing processes or overwriting configs when operationally safe",
          ],
        },
        {
          type: "terminal",
          preset: "security-incident-response",
          suggestionsLabel: "Collect evidence",
          suggestions: [
            { command: "journalctl -u ssh", label: "journalctl -u ssh" },
            {
              command: "cat /etc/nginx/sites-enabled/app",
              label: "cat nginx config",
            },
            { command: "ss -tpn", label: "ss -tpn" },
            {
              command: "ls -l /tmp/.sim-dropper.sh",
              label: "ls suspicious file",
            },
            { command: "preserve-evidence", label: "preserve-evidence" },
          ],
        },
      ],
    },
    {
      id: "containment",
      title: "Containment Strategies",
      blocks: [
        {
          type: "paragraph",
          text: "Containment reduces ongoing harm. Good responders choose controls that match confidence and impact — and they understand the risks of **premature** changes that erase evidence or break critical services unnecessarily.",
        },
        {
          type: "list",
          items: [
            "Disable a compromised simulated account (`disable-account contractor`)",
            "Isolate a simulated service (`isolate-service nginx`) when exposure is severe",
            "Block a fictional suspicious source (`block-source 203.0.113.88`)",
            "Stop an unusual simulated process or close an unexpected port after recording evidence",
            "Trade-offs: availability vs integrity; speed vs forensic quality",
            "Multiple decisions can be reasonable — document why you chose one path",
          ],
        },
        {
          type: "callout",
          title: "Premature containment",
          text: "If you change system state **before** collecting important evidence, investigation quality may drop. Sometimes rapid containment is still required to stop active harm — record what you can, then explain the trade-off.",
        },
        {
          type: "terminal",
          preset: "security-incident-response",
          suggestionsLabel: "Practice containment helpers",
          suggestions: [
            { command: "preserve-evidence", label: "preserve-evidence" },
            {
              command: "disable-account contractor",
              label: "disable-account contractor",
            },
            {
              command: "block-source 203.0.113.88",
              label: "block-source 203.0.113.88",
            },
            { command: "close-port 31337", label: "close-port 31337" },
          ],
        },
      ],
    },
    {
      id: "eradication-recovery",
      title: "Eradication and Recovery",
      blocks: [
        {
          type: "paragraph",
          text: "After the bleeding stops, remove unauthorized changes and restore trust. Recovery is incomplete without integrity-aware restores, credential rotation (conceptual here), and **verification**.",
        },
        {
          type: "list",
          items: [
            "Remove simulated unauthorized changes (`restore-config nginx`, `remove-sudo contractor`)",
            "Restore known-good configurations from baselines or backups",
            "Recover from a simulated clean backup (`verify-backup` then `restore-backup`)",
            "Conceptually rotate affected credentials (`rotate-credentials contractor`)",
            "Validate services and access controls (`verify-services`) before closing",
            "Restoring a backup **without** integrity checks is an incomplete decision",
            "Closing without validating affected services should not count as complete",
          ],
        },
        {
          type: "terminal",
          preset: "security-incident-response",
          suggestionsLabel: "Recovery sequence",
          suggestions: [
            { command: "ls -l /var/backups/ir-lab", label: "list backups" },
            { command: "verify-backup", label: "verify-backup" },
            { command: "restore-backup", label: "restore-backup" },
            {
              command: "rotate-credentials contractor",
              label: "rotate-credentials",
            },
            { command: "verify-services", label: "verify-services" },
          ],
        },
      ],
    },
    {
      id: "post-incident",
      title: "Post-Incident Review",
      blocks: [
        {
          type: "paragraph",
          text: "When the environment is stable, turn experience into improvement: build a chronological **timeline**, document decisions, identify **root causes**, recommend preventive controls, and produce a clear **incident report**.",
        },
        {
          type: "list",
          items: [
            "Timeline: alert → evidence → containment → eradication → recovery → verification",
            "Root causes may include weak authentication, missing monitoring, untested backups, or privilege drift",
            "Recommendations: key-based SSH, alerting on auth anomalies, config integrity checks, restore testing",
            "Reports support handoff, compliance, and learning — not blame theater",
          ],
        },
        {
          type: "paragraph",
          text: "Use the **Incident Response Workspace** below to walk the guided workflow, manage evidence and timeline entries, take containment/recovery decisions with feedback, and generate a session report you can reset.",
        },
        {
          type: "exercise",
          id: "security-incident-response-workspace",
        },
      ],
    },
    {
      id: "knowledge-check-mid",
      title: "Quick Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Confirm event vs incident, IR phases, severity vs priority, evidence preservation, and auth-log confidence before the lab scenarios.",
        },
        {
          type: "exercise",
          id: "security-incident-response-knowledge-check",
        },
      ],
    },
    {
      id: "interactive-lab",
      title: "Interactive Incident Response Lab",
      blocks: [
        {
          type: "paragraph",
          text: "Work through six guided scenarios on fictional host `rean-ir`: suspicious authentication, compromised account containment, unauthorized nginx configuration, unexpected network exposure, suspicious file/process indicators, and service recovery with verification.",
        },
        {
          type: "exercise",
          id: "security-incident-response-assessment",
        },
      ],
    },
    {
      id: "practice-session",
      title: "Practice Session",
      blocks: [
        {
          type: "paragraph",
          text: "Terminal exercises covering classification, evidence-first containment, scope, trade-offs, recovery completeness, and lessons learned. Checks use simulated state — not only the command string.",
        },
        {
          type: "exercise",
          id: "security-incident-response-practice",
        },
      ],
    },
    {
      id: "knowledge-check",
      title: "Final Knowledge Check",
      blocks: [
        {
          type: "paragraph",
          text: "Assess containment, recovery quality, decision trade-offs, reporting, evidence integrity labels, and false-positive handling. Includes an incident-response checklist for authorized real-world work.",
        },
        {
          type: "exercise",
          id: "security-incident-response-quiz",
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
            "Separate events, alerts, and incidents; use confidence levels to manage false positives",
            "Follow preparation → identification → triage → containment → evidence → eradication → recovery → lessons learned",
            "Determine scope and impact across users, services, and systems",
            "Collect evidence with sources and timestamps; preserve before destructive changes when safe",
            "Choose containment with explicit trade-offs; do not force a single rigid path",
            "Recover with integrity-aware restores, credential rotation, and service verification",
            "Document timeline, actions, verification, and preventive recommendations in a report",
          ],
        },
        {
          type: "table",
          caption: "Command reference (educational simulation)",
          headers: ["Area", "Commands"],
          rows: [
            [
              "Inspect",
              "`journalctl -u ssh`, `id`, `getent`, `ps aux`, `ss -tuln`, `cat` nginx config, `ls` evidence paths",
            ],
            ["Evidence", "`preserve-evidence`, `ir-status`"],
            [
              "Contain",
              "`disable-account`, `isolate-service`, `block-source`, `stop-process`, `close-port`",
            ],
            [
              "Recover",
              "`restore-config`, `verify-backup`, `restore-backup`, `rotate-credentials`, `verify-services`",
            ],
          ],
        },
        {
          type: "callout",
          title: "Next up",
          text: "Next: [Linux Security Challenge](/learn/security/challenge) — apply Stage 04 security and hardening concepts in a final simulated challenge (coming soon).",
        },
      ],
    },
  ],
} as const satisfies Lesson;
