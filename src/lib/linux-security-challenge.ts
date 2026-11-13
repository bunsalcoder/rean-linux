/**
 * Frontend-only Linux Security Challenge for Stage 04 Lesson 12.
 * All users, configs, logs, packages, and remediations are fictional
 * in-memory teaching data — never touches the host system.
 */

export const SECURITY_CHALLENGE_HOST = "rean-harden";
export const SECURITY_CHALLENGE_USER = "bunsal";

export type SecurityChallengeCategoryId =
  | "fundamentals"
  | "access-control"
  | "permissions-acls"
  | "privilege-management"
  | "ssh-hardening"
  | "firewall-network"
  | "security-updates"
  | "security-auditing"
  | "authentication-pam"
  | "mandatory-access-control"
  | "incident-response"
  | "final-assessment";

export type SecurityChallengeTaskId =
  | "fund-1"
  | "fund-2"
  | "fund-3"
  | "access-1"
  | "access-2"
  | "access-3"
  | "perms-1"
  | "perms-2"
  | "perms-3"
  | "sudo-1"
  | "sudo-2"
  | "sudo-3"
  | "ssh-1"
  | "ssh-2"
  | "ssh-3"
  | "fw-1"
  | "fw-2"
  | "fw-3"
  | "updates-1"
  | "updates-2"
  | "updates-3"
  | "audit-1"
  | "audit-2"
  | "audit-3"
  | "pam-1"
  | "pam-2"
  | "pam-3"
  | "mac-1"
  | "mac-2"
  | "mac-3"
  | "ir-1"
  | "ir-2"
  | "ir-3"
  | "final-1"
  | "final-2"
  | "final-3"
  | "final-4"
  | "final-5"
  | "final-6";

export type SecurityChallengeDifficulty = "easy" | "medium" | "hard";

export type SecurityChallengeAnswerKind =
  "single-choice" | "multi-choice" | "text" | "remediation";

export type SecurityChallengeOption = {
  key: string;
  label: string;
};

export type SecurityChallengeRemediationAction = {
  id: string;
  label: string;
  description: string;
};

export type SecurityChallengeCategory = {
  id: SecurityChallengeCategoryId;
  number: number;
  title: string;
  sectionId: string;
  description: string;
  reviewHref: `/learn/security/${string}`;
  reviewLabel: string;
  taskIds: readonly SecurityChallengeTaskId[];
};

/** Mutable posture flags for the shared fictional host. */
export type SecurityChallengeEnvState = {
  contractorInSudo: boolean;
  secretsMode: "0644" | "0600";
  secretsAclOtherRead: boolean;
  deploySudoAll: boolean;
  sshPasswordAuth: boolean;
  sshPermitRootLogin: boolean;
  postgresPublicBind: boolean;
  ufwAllows5432: boolean;
  opensshOutdated: boolean;
  apparmorComplain: boolean;
  backupVerified: boolean;
  evidencePreserved: boolean;
  contractorDisabled: boolean;
  authLogReviewed: boolean;
};

export type SecurityChallengeEvidence = {
  id: string;
  title: string;
  command: string;
  output: string;
};

export type SecurityChallengeValidationContext = {
  selectedKeys: readonly string[];
  textAnswer: string;
  selectedRemediations: readonly string[];
  env: SecurityChallengeEnvState;
};

export type SecurityChallengeTask = {
  id: SecurityChallengeTaskId;
  categoryId: SecurityChallengeCategoryId;
  title: string;
  difficulty: SecurityChallengeDifficulty;
  scenario: string;
  instructions: string;
  evidenceIds: readonly string[];
  hint: string;
  explanation: string;
  answerKind: SecurityChallengeAnswerKind;
  options?: readonly SecurityChallengeOption[];
  /** Correct option keys (single or multi). */
  correctKeys?: readonly string[];
  /** Accepted text answers (normalized). */
  acceptedAnswers?: readonly string[];
  remediationActions?: readonly SecurityChallengeRemediationAction[];
  /** Remediation ids that must be selected (exact set). */
  correctRemediationIds?: readonly string[];
  /** Optional state-based validation after remediations would apply. */
  validate?: (ctx: SecurityChallengeValidationContext) => boolean;
  /** Base points awarded for a correct first attempt with no hint. */
  basePoints: number;
};

/** Scoring: first attempt full; retry 70%; each hint −10% of base (floor 40%). */
export const SECURITY_CHALLENGE_SCORING = {
  firstAttemptMultiplier: 1,
  retryMultiplier: 0.7,
  hintPenaltyFraction: 0.1,
  minMultiplier: 0.4,
} as const;

export function createInitialChallengeEnv(): SecurityChallengeEnvState {
  return {
    contractorInSudo: true,
    secretsMode: "0644",
    secretsAclOtherRead: true,
    deploySudoAll: true,
    sshPasswordAuth: true,
    sshPermitRootLogin: true,
    postgresPublicBind: true,
    ufwAllows5432: true,
    opensshOutdated: true,
    apparmorComplain: true,
    backupVerified: false,
    evidencePreserved: false,
    contractorDisabled: false,
    authLogReviewed: false,
  };
}

export function applyRemediations(
  env: SecurityChallengeEnvState,
  actionIds: readonly string[],
): SecurityChallengeEnvState {
  const next = { ...env };
  for (const id of actionIds) {
    switch (id) {
      case "remove-contractor-sudo":
        next.contractorInSudo = false;
        break;
      case "harden-secrets":
        next.secretsMode = "0600";
        next.secretsAclOtherRead = false;
        break;
      case "restrict-deploy-sudo":
        next.deploySudoAll = false;
        break;
      case "harden-ssh":
        next.sshPasswordAuth = false;
        next.sshPermitRootLogin = false;
        break;
      case "contain-postgres":
        next.postgresPublicBind = false;
        next.ufwAllows5432 = false;
        break;
      case "patch-openssh":
        next.opensshOutdated = false;
        break;
      case "enforce-apparmor":
        next.apparmorComplain = false;
        break;
      case "verify-backup":
        next.backupVerified = true;
        break;
      case "preserve-evidence":
        next.evidencePreserved = true;
        break;
      case "disable-contractor":
        next.contractorDisabled = true;
        break;
      case "review-auth-log":
        next.authLogReviewed = true;
        break;
      default:
        break;
    }
  }
  return next;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function setsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].map(normalizeText).sort();
  const sortedB = [...b].map(normalizeText).sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

export function scoreTaskAttempt(options: {
  basePoints: number;
  attemptsBeforeSuccess: number;
  hintsUsed: number;
}): number {
  const { basePoints, attemptsBeforeSuccess, hintsUsed } = options;
  const attemptMultiplier =
    attemptsBeforeSuccess <= 1
      ? SECURITY_CHALLENGE_SCORING.firstAttemptMultiplier
      : SECURITY_CHALLENGE_SCORING.retryMultiplier;
  const hintMultiplier = Math.max(
    SECURITY_CHALLENGE_SCORING.minMultiplier,
    1 - hintsUsed * SECURITY_CHALLENGE_SCORING.hintPenaltyFraction,
  );
  return Math.round(basePoints * attemptMultiplier * hintMultiplier);
}

export function validateTaskAnswer(
  task: SecurityChallengeTask,
  ctx: SecurityChallengeValidationContext,
): boolean {
  if (task.validate) {
    return task.validate(ctx);
  }

  if (
    task.answerKind === "single-choice" ||
    task.answerKind === "multi-choice"
  ) {
    return setsEqual(ctx.selectedKeys, task.correctKeys ?? []);
  }

  if (task.answerKind === "text") {
    const answer = normalizeText(ctx.textAnswer);
    return (task.acceptedAnswers ?? []).some(
      (accepted) => normalizeText(accepted) === answer,
    );
  }

  if (task.answerKind === "remediation") {
    return setsEqual(
      ctx.selectedRemediations,
      task.correctRemediationIds ?? [],
    );
  }

  return false;
}

/** Evidence snapshots — regenerated from env when posture changes. */
export function buildChallengeEvidence(
  env: SecurityChallengeEnvState,
): Record<string, SecurityChallengeEvidence> {
  const sudoMembers = env.contractorInSudo
    ? "root,bunsal,contractor"
    : "root,bunsal";
  const contractorGroups = env.contractorInSudo
    ? "1002(contractor),27(sudo)"
    : "1002(contractor)";
  const contractorShell = env.contractorDisabled
    ? "/usr/sbin/nologin"
    : "/bin/bash";
  const secretsMode = env.secretsMode === "0600" ? "-rw-------" : "-rw-r--r--";
  const secretsAcl = env.secretsAclOtherRead
    ? "user::rw-\ngroup::r--\nother::r--"
    : "user::rw-\ngroup::---\nother::---";
  const deploySudo = env.deploySudoAll
    ? "(ALL) NOPASSWD: ALL"
    : "(ALL) NOPASSWD: /usr/bin/systemctl restart rean-app, /usr/local/bin/deploy-release";
  const passwordAuth = env.sshPasswordAuth ? "yes" : "no";
  const permitRoot = env.sshPermitRootLogin ? "yes" : "no";
  const postgresListen = env.postgresPublicBind
    ? "0.0.0.0:5432"
    : "127.0.0.1:5432";
  const ufw5432 = env.ufwAllows5432
    ? "5432/tcp                     ALLOW       Anywhere"
    : "5432/tcp                     DENY        Anywhere";
  const opensshVer = env.opensshOutdated
    ? "1:8.9p1-3ubuntu0.4"
    : "1:8.9p1-3ubuntu0.10";
  const advisory = env.opensshOutdated
    ? "REAN-2026-0412  openssh-server  HIGH  Remote auth bypass in password path (fictional)"
    : "(no open advisories for openssh-server)";
  const apparmorMode = env.apparmorComplain ? "complain" : "enforce";
  const backupStatus = env.backupVerified
    ? "last_restore_test: 2026-11-12 PASSED"
    : "last_restore_test: NEVER";
  const evidenceNote = env.evidencePreserved
    ? "evidence/bundle-20261113.tgz  OK (auth.log excerpt + process list)"
    : "(no evidence bundle recorded)";

  return {
    host: {
      id: "host",
      title: "Host identity",
      command: "hostnamectl",
      output: `Static hostname: ${SECURITY_CHALLENGE_HOST}\nOperating System: Ubuntu 22.04 LTS (fictional)\nKernel: Linux 5.15.0-rean`,
    },
    passwd: {
      id: "passwd",
      title: "Local accounts (excerpt)",
      command: "getent passwd bunsal deploy contractor www-data app backup",
      output: [
        "bunsal:x:1000:1000:Bunsal Admin:/home/bunsal:/bin/bash",
        "deploy:x:1001:1001:Deploy Service:/home/deploy:/bin/bash",
        `contractor:x:1002:1002:External Contractor:/home/contractor:${contractorShell}`,
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
        "app:x:1003:1003:App Runtime:/srv/app:/usr/sbin/nologin",
        "backup:x:1004:1004:Backup Operator:/home/backup:/bin/bash",
      ].join("\n"),
    },
    groups: {
      id: "groups",
      title: "Group membership",
      command: "getent group sudo deploy www-data",
      output: [
        `sudo:x:27:${sudoMembers}`,
        "deploy:x:1001:deploy",
        "www-data:x:33:www-data,app",
      ].join("\n"),
    },
    idContractor: {
      id: "idContractor",
      title: "contractor identity",
      command: "id contractor",
      output: `uid=1002(contractor) gid=1002(contractor) groups=${contractorGroups}`,
    },
    secretsLs: {
      id: "secretsLs",
      title: "Secrets file permissions",
      command: "ls -l /srv/app/secrets.env",
      output: `${secretsMode} 1 www-data www-data 512 Nov 10 09:00 /srv/app/secrets.env`,
    },
    secretsAcl: {
      id: "secretsAcl",
      title: "Secrets ACL",
      command: "getfacl /srv/app/secrets.env",
      output: `# file: srv/app/secrets.env\n# owner: www-data\n# group: www-data\n${secretsAcl}`,
    },
    appDir: {
      id: "appDir",
      title: "Application directory",
      command: "ls -la /srv/app",
      output: [
        "drwxr-x---  5 www-data www-data 4096 Nov 10 09:00 .",
        "drwxr-xr-x  3 root     root     4096 Oct 01 08:00 ..",
        `${secretsMode}  1 www-data www-data  512 Nov 10 09:00 secrets.env`,
        "-rw-r-----  1 www-data www-data 2048 Nov 10 09:00 config.yml",
        "drwxr-x---  2 www-data www-data 4096 Nov 10 09:00 releases",
      ].join("\n"),
    },
    sudoDeploy: {
      id: "sudoDeploy",
      title: "deploy sudo policy",
      command: "sudo -l -U deploy",
      output: `User deploy may run the following commands on ${SECURITY_CHALLENGE_HOST}:\n    ${deploySudo}`,
    },
    sudoersDeploy: {
      id: "sudoersDeploy",
      title: "sudoers.d/deploy",
      command: "sudo cat /etc/sudoers.d/deploy",
      output: env.deploySudoAll
        ? "deploy ALL=(ALL) NOPASSWD: ALL"
        : "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart rean-app, /usr/local/bin/deploy-release",
    },
    sshdT: {
      id: "sshdT",
      title: "Effective sshd settings",
      command:
        "sshd -T | egrep 'passwordauthentication|permitrootlogin|pubkeyauthentication|port'",
      output: [
        "port 22",
        `permitrootlogin ${permitRoot}`,
        `passwordauthentication ${passwordAuth}`,
        "pubkeyauthentication yes",
      ].join("\n"),
    },
    sshConfig: {
      id: "sshConfig",
      title: "sshd_config excerpt",
      command:
        "grep -E '^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)' /etc/ssh/sshd_config",
      output: [
        `PermitRootLogin ${permitRoot}`,
        `PasswordAuthentication ${passwordAuth}`,
        "PubkeyAuthentication yes",
      ].join("\n"),
    },
    ssListen: {
      id: "ssListen",
      title: "Listening sockets",
      command: "ss -tuln",
      output: [
        "Netid  State   Local Address:Port",
        "tcp    LISTEN  0.0.0.0:22",
        "tcp    LISTEN  0.0.0.0:80",
        "tcp    LISTEN  0.0.0.0:443",
        `tcp    LISTEN  ${postgresListen}`,
      ].join("\n"),
    },
    ufwStatus: {
      id: "ufwStatus",
      title: "Firewall status",
      command: "ufw status numbered",
      output: [
        "Status: active",
        "     To                         Action      From",
        "-----                          ------      ----",
        "[ 1] 22/tcp                     ALLOW IN    Anywhere",
        "[ 2] 80/tcp                     ALLOW IN    Anywhere",
        "[ 3] 443/tcp                    ALLOW IN    Anywhere",
        `[ 4] ${ufw5432}`,
      ].join("\n"),
    },
    packages: {
      id: "packages",
      title: "Installed security-relevant packages",
      command: "dpkg -l openssh-server nginx postgresql",
      output: [
        `ii  openssh-server  ${opensshVer}  amd64  secure shell server`,
        "ii  nginx           1.18.0-6ubuntu14.4  amd64  high performance web server",
        "ii  postgresql      14.11-0ubuntu0.22.04.1  amd64  object-relational database",
      ].join("\n"),
    },
    advisory: {
      id: "advisory",
      title: "Fictional security advisories",
      command: "rean-advisory list --installed",
      output: advisory,
    },
    authLog: {
      id: "authLog",
      title: "Authentication log excerpt",
      command: "journalctl -u ssh -n 12 --no-pager",
      output: [
        `Nov 13 02:13:11 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:13:18 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:13:25 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:13:33 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:13:41 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:13:55 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Failed password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:14:08 ${SECURITY_CHALLENGE_HOST} sshd[2201]: Accepted password for contractor from 203.0.113.88 port 52110 ssh2`,
        `Nov 13 02:14:09 ${SECURITY_CHALLENGE_HOST} sshd[2201]: pam_unix(sshd:session): session opened for user contractor`,
      ].join("\n"),
    },
    pamSshd: {
      id: "pamSshd",
      title: "PAM stack for sshd",
      command: "cat /etc/pam.d/sshd",
      output: [
        "# PAM configuration for the Secure Shell service (fictional teaching copy)",
        "auth       required     pam_seal.so nullok",
        "auth       required     pam_unix.so",
        "account    required     pam_nologin.so",
        "account    required     pam_unix.so",
        "session    required     pam_unix.so",
        "password   required     pam_unix.so obscure sha512",
      ].join("\n"),
    },
    pamUnix: {
      id: "pamUnix",
      title: "common-auth excerpt",
      command: "grep -v '^#' /etc/pam.d/common-auth | head -5",
      output: [
        "auth  [success=1 default=ignore]  pam_unix.so nullok",
        "auth  requisite                   pam_deny.so",
        "auth  required                    pam_permit.so",
      ].join("\n"),
    },
    apparmor: {
      id: "apparmor",
      title: "AppArmor profiles",
      command: "aa-status",
      output: [
        "apparmor module is loaded.",
        "2 profiles are loaded.",
        "1 profiles are in enforce mode.",
        "   nginx",
        `1 profiles are in ${apparmorMode} mode.`,
        "   rean-app",
      ].join("\n"),
    },
    selinux: {
      id: "selinux",
      title: "SELinux context sample",
      command: "ls -Z /var/www/html/index.html /srv/app/config.yml",
      output: [
        "system_u:object_r:httpd_sys_content_t:s0 /var/www/html/index.html",
        "system_u:object_r:default_t:s0           /srv/app/config.yml",
      ].join("\n"),
    },
    macLog: {
      id: "macLog",
      title: "MAC audit excerpt",
      command: "grep -E 'apparmor|avc' /var/log/audit/audit.log | tail -3",
      output: env.apparmorComplain
        ? `Nov 13 09:13:40 ${SECURITY_CHALLENGE_HOST} apparmor: ALLOWED (complain) operation=open profile=rean-app name=/etc/shadow`
        : `Nov 13 09:20:01 ${SECURITY_CHALLENGE_HOST} apparmor: DENIED operation=open profile=rean-app name=/etc/shadow`,
    },
    backup: {
      id: "backup",
      title: "Backup verification record",
      command: "cat /var/lib/rean-backup/status",
      output: [
        "dataset: /srv/app",
        "last_full: 2026-11-11",
        backupStatus,
        `evidence: ${evidenceNote}`,
      ].join("\n"),
    },
    auditFindings: {
      id: "auditFindings",
      title: "Open audit findings summary",
      command: "rean-audit summary",
      output: [
        env.contractorInSudo
          ? "[HIGH] contractor in sudo group"
          : "[OK] sudo group membership reviewed",
        env.secretsMode === "0644" || env.secretsAclOtherRead
          ? "[CRITICAL] /srv/app/secrets.env overly readable"
          : "[OK] secrets.env hardened",
        env.deploySudoAll
          ? "[HIGH] deploy NOPASSWD ALL"
          : "[OK] deploy sudo least privilege",
        env.sshPasswordAuth || env.sshPermitRootLogin
          ? "[HIGH] SSH password/root login enabled"
          : "[OK] SSH hardened",
        env.postgresPublicBind || env.ufwAllows5432
          ? "[CRITICAL] PostgreSQL network exposure"
          : "[OK] PostgreSQL contained",
        env.opensshOutdated
          ? "[HIGH] openssh-server advisory REAN-2026-0412"
          : "[OK] openssh-server current",
        env.apparmorComplain
          ? "[MEDIUM] rean-app AppArmor in complain mode"
          : "[OK] rean-app AppArmor enforce",
        env.backupVerified
          ? "[OK] backup restore verified"
          : "[MEDIUM] backup restore never verified",
      ].join("\n"),
    },
    irTicket: {
      id: "irTicket",
      title: "Incident ticket",
      command: "rean-ir show INC-2044",
      output: [
        "INC-2044  Suspicious authentication on rean-harden",
        "Status: Investigating",
        "Summary: Multiple failed SSH passwords for contractor from 203.0.113.88,",
        "         then Accepted password. Concurrent privilege and exposure findings.",
        `Evidence preserved: ${env.evidencePreserved ? "yes" : "no"}`,
        `Account contained: ${env.contractorDisabled ? "yes" : "no"}`,
      ].join("\n"),
    },
  };
}

export const SECURITY_CHALLENGE_CATEGORIES: readonly SecurityChallengeCategory[] =
  [
    {
      id: "fundamentals",
      number: 1,
      title: "Security Fundamentals",
      sectionId: "challenge-1-fundamentals",
      description:
        "Apply CIA, least privilege, and defense in depth to the fictional host.",
      reviewHref: "/learn/security/fundamentals",
      reviewLabel: "Linux Security Fundamentals",
      taskIds: ["fund-1", "fund-2", "fund-3"],
    },
    {
      id: "access-control",
      number: 2,
      title: "Users, Groups, and Access Control",
      sectionId: "challenge-2-access-control",
      description: "Review accounts and group membership for privilege risk.",
      reviewHref: "/learn/security/access-control",
      reviewLabel: "Users, Groups, and Access Control Review",
      taskIds: ["access-1", "access-2", "access-3"],
    },
    {
      id: "permissions-acls",
      number: 3,
      title: "File Permissions and ACLs",
      sectionId: "challenge-3-permissions-acls",
      description: "Inspect modes and ACLs on sensitive application files.",
      reviewHref: "/learn/security/permissions-and-acls",
      reviewLabel: "Advanced File Permissions and ACLs",
      taskIds: ["perms-1", "perms-2", "perms-3"],
    },
    {
      id: "privilege-management",
      number: 4,
      title: "sudo and Privilege Management",
      sectionId: "challenge-4-privilege-management",
      description: "Evaluate sudo policy for service and human accounts.",
      reviewHref: "/learn/security/privilege-management",
      reviewLabel: "sudo and Privilege Management",
      taskIds: ["sudo-1", "sudo-2", "sudo-3"],
    },
    {
      id: "ssh-hardening",
      number: 5,
      title: "SSH Security Hardening",
      sectionId: "challenge-5-ssh-hardening",
      description: "Assess remote-access configuration risk on rean-harden.",
      reviewHref: "/learn/security/ssh-hardening",
      reviewLabel: "SSH Security Hardening",
      taskIds: ["ssh-1", "ssh-2", "ssh-3"],
    },
    {
      id: "firewall-network",
      number: 6,
      title: "Firewall and Network Exposure",
      sectionId: "challenge-6-firewall-network",
      description: "Identify unnecessary listening services and firewall gaps.",
      reviewHref: "/learn/security/firewall-hardening",
      reviewLabel: "Firewall Hardening and Network Exposure",
      taskIds: ["fw-1", "fw-2", "fw-3"],
    },
    {
      id: "security-updates",
      number: 7,
      title: "Security Updates and Vulnerability Management",
      sectionId: "challenge-7-security-updates",
      description: "Prioritize fictional advisories against exposure context.",
      reviewHref: "/learn/security/security-updates",
      reviewLabel: "Security Updates and Vulnerability Management",
      taskIds: ["updates-1", "updates-2", "updates-3"],
    },
    {
      id: "security-auditing",
      number: 8,
      title: "Security Auditing",
      sectionId: "challenge-8-security-auditing",
      description: "Read audit evidence and rank findings by severity.",
      reviewHref: "/learn/security/security-auditing",
      reviewLabel: "Linux Security Auditing",
      taskIds: ["audit-1", "audit-2", "audit-3"],
    },
    {
      id: "authentication-pam",
      number: 9,
      title: "Authentication and PAM",
      sectionId: "challenge-9-authentication-pam",
      description: "Interpret PAM stacks and authentication log patterns.",
      reviewHref: "/learn/security/authentication-and-pam",
      reviewLabel: "Authentication and PAM Fundamentals",
      taskIds: ["pam-1", "pam-2", "pam-3"],
    },
    {
      id: "mandatory-access-control",
      number: 10,
      title: "AppArmor and SELinux",
      sectionId: "challenge-10-mandatory-access-control",
      description: "Judge MAC mode and context issues for rean-app.",
      reviewHref: "/learn/security/mandatory-access-control",
      reviewLabel: "Mandatory Access Control: AppArmor and SELinux",
      taskIds: ["mac-1", "mac-2", "mac-3"],
    },
    {
      id: "incident-response",
      number: 11,
      title: "Incident Response",
      sectionId: "challenge-11-incident-response",
      description: "Choose safe investigate → contain → recover steps.",
      reviewHref: "/learn/security/incident-response",
      reviewLabel: "Linux Security Incident Response",
      taskIds: ["ir-1", "ir-2", "ir-3"],
    },
    {
      id: "final-assessment",
      number: 12,
      title: "Final Integrated Security Assessment",
      sectionId: "challenge-12-final-assessment",
      description:
        "Investigate, prioritize, remediate, and verify the full rean-harden posture.",
      reviewHref: "/learn/security/security-auditing",
      reviewLabel: "Linux Security Auditing",
      taskIds: [
        "final-1",
        "final-2",
        "final-3",
        "final-4",
        "final-5",
        "final-6",
      ],
    },
  ];

export const SECURITY_CHALLENGE_TASKS: Record<
  SecurityChallengeTaskId,
  SecurityChallengeTask
> = {
  "fund-1": {
    id: "fund-1",
    categoryId: "fundamentals",
    title: "Map findings to the CIA triad",
    difficulty: "easy",
    scenario:
      "On rean-harden, /srv/app/secrets.env is world-readable and PostgreSQL listens on 0.0.0.0:5432.",
    instructions:
      "Which CIA properties are most directly threatened by these two findings together?",
    evidenceIds: ["secretsLs", "ssListen"],
    hint: "Readable secrets threaten confidentiality; a public database threatens confidentiality and availability if abused.",
    explanation:
      "World-readable secrets primarily break confidentiality. A publicly exposed database threatens confidentiality of stored data and can also undermine availability if attacked. Integrity is not the primary issue shown by this evidence alone.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label: "Confidentiality (and availability risk for the database)",
      },
      { key: "B", label: "Integrity only" },
      { key: "C", label: "Availability only — secrets exposure is irrelevant" },
      { key: "D", label: "None — local files never relate to CIA" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "fund-2": {
    id: "fund-2",
    categoryId: "fundamentals",
    title: "Apply least privilege",
    difficulty: "easy",
    scenario:
      "The deploy account can run any command as root without a password.",
    instructions: "Which change best follows least privilege for deploy?",
    evidenceIds: ["sudoDeploy"],
    hint: "Service accounts should run only the commands they need.",
    explanation:
      "Least privilege means replacing NOPASSWD ALL with a narrow allow-list of deployment commands. Removing the account entirely may break releases; granting more access makes the risk worse.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Restrict sudo to specific deploy commands (for example systemctl restart and deploy-release)",
      },
      { key: "B", label: "Add deploy to every group on the system" },
      { key: "C", label: "Enable PermitRootLogin yes so deploy is unused" },
      { key: "D", label: "Make /srv/app world-writable instead of using sudo" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "fund-3": {
    id: "fund-3",
    categoryId: "fundamentals",
    title: "Defense in depth trade-off",
    difficulty: "medium",
    scenario:
      "SSH still allows passwords, UFW allows 5432, and openssh-server has a fictional HIGH advisory.",
    instructions:
      "Which statement best describes defense in depth for this host?",
    evidenceIds: ["sshdT", "ufwStatus", "advisory"],
    hint: "No single control should be the only barrier.",
    explanation:
      "Defense in depth means stacking independent controls — hardening SSH, tightening firewall exposure, and patching — so one weak layer does not equal total failure. Relying on a single strong password or ignoring patches is the opposite.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Harden SSH, reduce network exposure, and patch — each layer covers gaps in the others",
      },
      {
        key: "B",
        label: "Pick one strong control and leave the others weak forever",
      },
      { key: "C", label: "Disable all logging so attackers have less to read" },
      {
        key: "D",
        label: "Only patch after a confirmed breach and never before",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "access-1": {
    id: "access-1",
    categoryId: "access-control",
    title: "Identify unexpected sudo membership",
    difficulty: "easy",
    scenario:
      "Review local accounts on rean-harden after suspicious contractor logins.",
    instructions:
      "Which account appears in the sudo group but should be treated as unexpected for a contractor?",
    evidenceIds: ["groups", "idContractor", "passwd"],
    hint: "Look at getent group sudo and id contractor.",
    explanation:
      "contractor is listed in the sudo group. Contractor accounts should rarely hold standing admin rights; bunsal as a named admin is expected on this teaching host.",
    answerKind: "text",
    acceptedAnswers: [
      "contractor",
      "the contractor",
      "contractor account",
      "user contractor",
    ],
    basePoints: 10,
  },
  "access-2": {
    id: "access-2",
    categoryId: "access-control",
    title: "Interpret account shells",
    difficulty: "medium",
    scenario: "Compare interactive vs service accounts on the host.",
    instructions:
      "Which listed accounts are correctly non-interactive (nologin shell) based on the passwd excerpt?",
    evidenceIds: ["passwd"],
    hint: "Service accounts often use /usr/sbin/nologin.",
    explanation:
      "www-data and app use nologin shells, which is appropriate for service identities. bunsal, deploy, contractor, and backup have /bin/bash and are interactive (or intended to be).",
    answerKind: "multi-choice",
    options: [
      { key: "A", label: "www-data" },
      { key: "B", label: "app" },
      { key: "C", label: "bunsal" },
      { key: "D", label: "deploy" },
    ],
    correctKeys: ["A", "B"],
    basePoints: 10,
  },
  "access-3": {
    id: "access-3",
    categoryId: "access-control",
    title: "Access-control remediation decision",
    difficulty: "medium",
    scenario:
      "contractor has sudo after a suspicious successful SSH password login.",
    instructions: "What is the best immediate access-control response?",
    evidenceIds: ["idContractor", "authLog", "groups"],
    hint: "Reduce standing privilege while preserving investigation options.",
    explanation:
      "Removing unexpected sudo membership promptly reduces blast radius. Deleting the home directory destroys evidence; granting more sudo worsens exposure; ignoring the finding leaves high risk open.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Remove contractor from the sudo group and continue investigation",
      },
      { key: "B", label: "Delete /home/contractor immediately without notes" },
      { key: "C", label: "Add contractor to root and deploy groups as well" },
      {
        key: "D",
        label: "Leave sudo membership — contractors always need root",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "perms-1": {
    id: "perms-1",
    categoryId: "permissions-acls",
    title: "Read the secrets mode string",
    difficulty: "easy",
    scenario: "Inspect /srv/app/secrets.env on rean-harden.",
    instructions:
      "What octal mode matches the current ls -l permission bits for secrets.env?",
    evidenceIds: ["secretsLs"],
    hint: "rw-r--r-- is owner read/write, group read, other read.",
    explanation:
      "-rw-r--r-- corresponds to mode 0644. Secrets files should typically be 0600 (owner-only).",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "0644" },
      { key: "B", label: "0600" },
      { key: "C", label: "0755" },
      { key: "D", label: "0000" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "perms-2": {
    id: "perms-2",
    categoryId: "permissions-acls",
    title: "ACL exposure",
    difficulty: "medium",
    scenario: "Traditional mode and ACL both matter for secrets.env.",
    instructions: "What does the getfacl evidence show about other users?",
    evidenceIds: ["secretsAcl", "secretsLs"],
    hint: "Look at the other:: line.",
    explanation:
      "other::r-- grants read to everyone not covered by user/group entries — an ACL (and mode) problem for secrets.",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "other has read access" },
      { key: "B", label: "other has write and execute only" },
      { key: "C", label: "ACLs deny all access including owner" },
      { key: "D", label: "No ACL lines exist for this file" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "perms-3": {
    id: "perms-3",
    categoryId: "permissions-acls",
    title: "Choose a hardening command outcome",
    difficulty: "medium",
    scenario:
      "You must harden secrets.env without breaking www-data ownership.",
    instructions:
      "Which remediation set correctly hardens the file for this evidence?",
    evidenceIds: ["secretsLs", "secretsAcl"],
    hint: "Owner-only mode and clearing overly broad ACL entries.",
    explanation:
      "chmod 600 restricts the mode; clearing the broad other ACL (setfacl -b or equivalent teaching action) removes extended other:r. chmod 777 and chown to contractor make exposure worse.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "harden-secrets",
        label: "chmod 600 + clear other ACL on secrets.env",
        description: "Owner-only secrets; remove other:r ACL.",
      },
      {
        id: "chmod-777-secrets",
        label: "chmod 777 secrets.env",
        description: "Make secrets world-writable (unsafe).",
      },
      {
        id: "chown-contractor",
        label: "chown contractor secrets.env",
        description: "Hand secrets to the contractor account.",
      },
      {
        id: "open-acl-other",
        label: "setfacl -m o:rwx secrets.env",
        description: "Expand other access further.",
      },
    ],
    correctRemediationIds: ["harden-secrets"],
    basePoints: 10,
  },
  "sudo-1": {
    id: "sudo-1",
    categoryId: "privilege-management",
    title: "Interpret deploy sudo rights",
    difficulty: "easy",
    scenario: "Review sudo policy for the deploy service account.",
    instructions: "What privilege does deploy currently have?",
    evidenceIds: ["sudoDeploy", "sudoersDeploy"],
    hint: "Read the sudo -l output carefully.",
    explanation:
      "deploy currently has (ALL) NOPASSWD: ALL — unrestricted passwordless root. That is excessive for a deploy role.",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "Passwordless permission to run any command as root" },
      { key: "B", label: "No sudo rights at all" },
      { key: "C", label: "Only permission to restart nginx" },
      { key: "D", label: "Read-only access to /etc/sudoers" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "sudo-2": {
    id: "sudo-2",
    categoryId: "privilege-management",
    title: "Name the sudoers fragment",
    difficulty: "easy",
    scenario: "The deploy rule lives in a drop-in file under /etc/sudoers.d.",
    instructions:
      "Enter the path of the sudoers drop-in shown in the evidence (full path).",
    evidenceIds: ["sudoersDeploy"],
    hint: "The command was sudo cat /etc/sudoers.d/deploy.",
    explanation:
      "The teaching evidence comes from /etc/sudoers.d/deploy — a common place for per-role sudo rules.",
    answerKind: "text",
    acceptedAnswers: ["/etc/sudoers.d/deploy", "etc/sudoers.d/deploy"],
    basePoints: 10,
  },
  "sudo-3": {
    id: "sudo-3",
    categoryId: "privilege-management",
    title: "Select least-privilege sudo remediation",
    difficulty: "medium",
    scenario: "Replace NOPASSWD ALL for deploy without breaking releases.",
    instructions: "Choose the appropriate remediation action.",
    evidenceIds: ["sudoDeploy", "sudoersDeploy"],
    hint: "Keep deploy able to restart the app and run the release script only.",
    explanation:
      "Restricting deploy to specific commands preserves operations while removing silent full-root risk. Granting NOPASSWD ALL to contractor increases exposure.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "restrict-deploy-sudo",
        label: "Limit deploy to restart + deploy-release only",
        description: "Least-privilege sudoers entry.",
      },
      {
        id: "give-contractor-all",
        label: "Give contractor NOPASSWD ALL as well",
        description: "Expand privilege further.",
      },
      {
        id: "disable-sudoers",
        label: "Delete /etc/sudoers entirely",
        description: "Break admin access host-wide.",
      },
    ],
    correctRemediationIds: ["restrict-deploy-sudo"],
    basePoints: 10,
  },
  "ssh-1": {
    id: "ssh-1",
    categoryId: "ssh-hardening",
    title: "Spot weak SSH settings",
    difficulty: "easy",
    scenario: "sshd -T shows effective remote-access settings.",
    instructions: "Which weak settings are currently enabled?",
    evidenceIds: ["sshdT", "sshConfig"],
    hint: "Check passwordauthentication and permitrootlogin.",
    explanation:
      "Both PasswordAuthentication and PermitRootLogin are yes — high-value hardening targets, especially with password brute-force evidence in the auth log.",
    answerKind: "multi-choice",
    options: [
      { key: "A", label: "PasswordAuthentication yes" },
      { key: "B", label: "PermitRootLogin yes" },
      { key: "C", label: "PubkeyAuthentication no" },
      { key: "D", label: "SSH listening on port 2222 only" },
    ],
    correctKeys: ["A", "B"],
    basePoints: 10,
  },
  "ssh-2": {
    id: "ssh-2",
    categoryId: "ssh-hardening",
    title: "Connect SSH config to auth log risk",
    difficulty: "medium",
    scenario:
      "Auth logs show failed then accepted passwords for contractor from 203.0.113.88.",
    instructions: "How does current SSH config amplify this risk?",
    evidenceIds: ["sshdT", "authLog"],
    hint: "Password auth enables remote password guessing.",
    explanation:
      "Allowing password authentication enables remote password guessing against accounts. Key-only auth would block this password path. Pubkey is already yes — the weak layer is passwords (and root login).",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "PasswordAuthentication yes allows remote password guessing against accounts",
      },
      {
        key: "B",
        label: "PubkeyAuthentication yes is what enables password guessing",
      },
      { key: "C", label: "SSH on port 22 cannot be brute-forced in principle" },
      { key: "D", label: "The auth log proves the firewall is disabled" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "ssh-3": {
    id: "ssh-3",
    categoryId: "ssh-hardening",
    title: "Apply SSH hardening",
    difficulty: "medium",
    scenario: "Choose the remediation that disables password and root login.",
    instructions: "Select the correct SSH hardening action for this host.",
    evidenceIds: ["sshdT", "sshConfig"],
    hint: "Disable password auth and root login together.",
    explanation:
      "Setting PasswordAuthentication no and PermitRootLogin no (after confirming admin key access) is the standard teaching remediation here.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "harden-ssh",
        label: "Disable password auth and root login",
        description: "PasswordAuthentication no; PermitRootLogin no.",
      },
      {
        id: "enable-empty-passwords",
        label: "Allow empty passwords for convenience",
        description: "Unsafe teaching counter-example.",
      },
      {
        id: "disable-pubkey",
        label: "Disable PubkeyAuthentication",
        description: "Removes the stronger auth path.",
      },
    ],
    correctRemediationIds: ["harden-ssh"],
    basePoints: 10,
  },
  "fw-1": {
    id: "fw-1",
    categoryId: "firewall-network",
    title: "Identify unexpected listener",
    difficulty: "easy",
    scenario: "Review listening sockets on the application server.",
    instructions:
      "Which service address/port is unnecessarily exposed on all interfaces?",
    evidenceIds: ["ssListen"],
    hint: "Web and SSH may be intentional; look at the database port.",
    explanation:
      "PostgreSQL listening on 0.0.0.0:5432 is unexpected for a typical app server — it should usually bind to localhost unless there is a deliberate remote-DB design.",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "PostgreSQL on 0.0.0.0:5432" },
      { key: "B", label: "SSH on 0.0.0.0:22 (always forbidden)" },
      { key: "C", label: "HTTPS on 0.0.0.0:443 (always forbidden)" },
      { key: "D", label: "No sockets are listening" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "fw-2": {
    id: "fw-2",
    categoryId: "firewall-network",
    title: "Firewall rule that matches exposure",
    difficulty: "medium",
    scenario: "UFW is active but may still allow risky ports.",
    instructions: "Which UFW rule currently allows the database exposure?",
    evidenceIds: ["ufwStatus", "ssListen"],
    hint: "Find 5432/tcp in the allow list.",
    explanation:
      "UFW allows 5432/tcp from Anywhere while PostgreSQL listens publicly — defense-in-depth failure on both bind address and firewall.",
    answerKind: "text",
    acceptedAnswers: [
      "5432/tcp",
      "5432",
      "allow 5432",
      "5432/tcp allow",
      "[ 4] 5432/tcp",
    ],
    validate: (ctx) => {
      const answer = normalizeText(ctx.textAnswer);
      if (!answer) {
        return false;
      }
      const exactAccepted = [
        "5432/tcp",
        "5432",
        "allow 5432",
        "5432/tcp allow",
        "[ 4] 5432/tcp",
      ];
      if (
        exactAccepted.some((accepted) => normalizeText(accepted) === answer)
      ) {
        return true;
      }
      // Accept pasted UFW status lines that clearly identify 5432/tcp allow.
      return (
        /\b5432(?:\/tcp)?\b/.test(answer) &&
        /\ballow\b/.test(answer) &&
        !/\bdeny\b/.test(answer)
      );
    },
    basePoints: 10,
  },
  "fw-3": {
    id: "fw-3",
    categoryId: "firewall-network",
    title: "Contain database exposure",
    difficulty: "medium",
    scenario: "Reduce PostgreSQL exposure without blocking HTTPS.",
    instructions: "Select the remediation that contains the database safely.",
    evidenceIds: ["ssListen", "ufwStatus"],
    hint: "Bind to localhost and deny 5432 in the firewall.",
    explanation:
      "Binding PostgreSQL to localhost and denying 5432/tcp closes the unnecessary exposure while leaving 80/443 available for the web app.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "contain-postgres",
        label: "Bind PostgreSQL to localhost and deny 5432/tcp",
        description: "Reduce DB network exposure.",
      },
      {
        id: "allow-all-ports",
        label: "ufw allow 1:65535/tcp",
        description: "Open every TCP port.",
      },
      {
        id: "block-https",
        label: "Deny 443/tcp to hide the app",
        description: "Breaks intended web service.",
      },
    ],
    correctRemediationIds: ["contain-postgres"],
    basePoints: 10,
  },
  "updates-1": {
    id: "updates-1",
    categoryId: "security-updates",
    title: "Read the fictional advisory",
    difficulty: "easy",
    scenario: "rean-advisory lists issues for installed packages.",
    instructions: "What is the advisory ID affecting openssh-server?",
    evidenceIds: ["advisory", "packages"],
    hint: "Look for REAN-2026-… in the advisory list.",
    explanation:
      "The fictional advisory REAN-2026-0412 affects openssh-server at HIGH severity on this teaching host.",
    answerKind: "text",
    acceptedAnswers: ["REAN-2026-0412", "rean-2026-0412"],
    basePoints: 10,
  },
  "updates-2": {
    id: "updates-2",
    categoryId: "security-updates",
    title: "Prioritize with exposure context",
    difficulty: "medium",
    scenario:
      "openssh-server has a HIGH advisory and PasswordAuthentication is still yes.",
    instructions:
      "How should you prioritize this update relative to a LOW advisory on an unused desktop theme package?",
    evidenceIds: ["advisory", "sshdT", "packages"],
    hint: "Exposure and service criticality matter more than CVSS alone.",
    explanation:
      "An SSH advisory on an internet-facing, password-enabled daemon outranks a low-impact unused package. Patch urgency depends on exposure and exploitability, not package name alone.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Prioritize patching openssh-server now — it is exposed and password auth is enabled",
      },
      {
        key: "B",
        label:
          "Always patch the theme package first because UI bugs look worse",
      },
      {
        key: "C",
        label: "Ignore SSH advisories if the host has any firewall at all",
      },
      {
        key: "D",
        label:
          "Wait until the advisory becomes CRITICAL regardless of exposure",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "updates-3": {
    id: "updates-3",
    categoryId: "security-updates",
    title: "Apply the SSH package remediation",
    difficulty: "easy",
    scenario: "Simulate applying the security update for openssh-server.",
    instructions: "Select the remediation that patches openssh-server.",
    evidenceIds: ["packages", "advisory"],
    hint: "Choose the patch action for openssh-server.",
    explanation:
      "Patching openssh-server clears the fictional advisory. Unrelated package removals do not address this finding.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "patch-openssh",
        label: "Apply openssh-server security update",
        description: "Move to patched fictional version.",
      },
      {
        id: "remove-nginx",
        label: "Remove nginx instead",
        description: "Does not fix the SSH advisory.",
      },
      {
        id: "downgrade-openssh",
        label: "Downgrade openssh-server",
        description: "Increases risk.",
      },
    ],
    correctRemediationIds: ["patch-openssh"],
    basePoints: 10,
  },
  "audit-1": {
    id: "audit-1",
    categoryId: "security-auditing",
    title: "List critical open findings",
    difficulty: "medium",
    scenario: "Use the audit summary for rean-harden.",
    instructions: "Which findings are currently marked CRITICAL?",
    evidenceIds: ["auditFindings"],
    hint: "Look for [CRITICAL] lines in the summary.",
    explanation:
      "The critical open items are the overly readable secrets file and PostgreSQL network exposure. Other issues are high/medium.",
    answerKind: "multi-choice",
    options: [
      { key: "A", label: "/srv/app/secrets.env overly readable" },
      { key: "B", label: "PostgreSQL network exposure" },
      { key: "C", label: "rean-app AppArmor complain mode" },
      { key: "D", label: "backup restore never verified" },
    ],
    correctKeys: ["A", "B"],
    basePoints: 10,
  },
  "audit-2": {
    id: "audit-2",
    categoryId: "security-auditing",
    title: "Severity vs operational priority",
    difficulty: "hard",
    scenario:
      "Auth log shows a successful password login for contractor after failures, and contractor is in sudo.",
    instructions:
      "Even if secrets.env is CRITICAL by severity, what should you treat as immediate operational priority during active suspicious auth?",
    evidenceIds: ["authLog", "idContractor", "auditFindings"],
    hint: "Active account compromise indicators can outrank static misconfigurations briefly.",
    explanation:
      "During suspected account abuse, containing the privileged contractor session/path is the immediate operational priority even while CRITICAL static findings remain. You still remediate secrets soon after — priority is sequenced, not ignored.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Contain the suspicious privileged contractor access path first, then harden static CRITICAL findings",
      },
      {
        key: "B",
        label: "Only fix secrets.env and ignore the auth evidence entirely",
      },
      {
        key: "C",
        label: "Reboot repeatedly until the auth log is empty",
      },
      {
        key: "D",
        label: "Disable the firewall so investigation is easier",
      },
    ],
    correctKeys: ["A"],
    basePoints: 12,
  },
  "audit-3": {
    id: "audit-3",
    categoryId: "security-auditing",
    title: "Backup verification gap",
    difficulty: "easy",
    scenario: "Audit also covers recovery readiness.",
    instructions:
      "What does the backup status record say about restore testing?",
    evidenceIds: ["backup"],
    hint: "Read last_restore_test.",
    explanation:
      "last_restore_test: NEVER means backups exist on paper but recovery has not been verified — a medium but important operational gap.",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "Restore testing has never been performed" },
      { key: "B", label: "Restore testing passed yesterday" },
      { key: "C", label: "Backups are disabled completely" },
      {
        key: "D",
        label: "The status file proves ransomware encrypted /srv/app",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "pam-1": {
    id: "pam-1",
    categoryId: "authentication-pam",
    title: "Spot a risky PAM module flag",
    difficulty: "medium",
    scenario: "Review the fictional sshd PAM stack.",
    instructions:
      "Which module line introduces a teaching concern for authentication strength?",
    evidenceIds: ["pamSshd", "pamUnix"],
    hint: "nullok can allow empty passwords depending on module behavior.",
    explanation:
      "pam_seal.so nullok (and common-auth pam_unix.so nullok) is a teaching red flag — nullok can permit empty passwords. That weakens authentication policy.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label: "auth required pam_seal.so nullok (empty-password risk)",
      },
      { key: "B", label: "session required pam_unix.so (always malicious)" },
      { key: "C", label: "account required pam_nologin.so (always malicious)" },
      {
        key: "D",
        label: "password required pam_unix.so sha512 (always malicious)",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "pam-2": {
    id: "pam-2",
    categoryId: "authentication-pam",
    title: "Interpret auth log sequence",
    difficulty: "medium",
    scenario: "Six failures then an accepted password for contractor.",
    instructions: "What is the best interpretation?",
    evidenceIds: ["authLog"],
    hint: "Failures followed by success warrant investigation, not automatic proof of rootkit.",
    explanation:
      "Repeated failures then success is suspicious and warrants investigation. It does not by itself prove a rootkit or that every login is impossible.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Suspicious authentication activity that warrants investigation and possible containment",
      },
      {
        key: "B",
        label: "Proof that the kernel is rooted and the disk must be wiped now",
      },
      {
        key: "C",
        label: "Normal noise that should never be reviewed",
      },
      {
        key: "D",
        label: "Evidence that PAM is disabled on the host",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "pam-3": {
    id: "pam-3",
    categoryId: "authentication-pam",
    title: "Name the source IP from evidence",
    difficulty: "easy",
    scenario: "Identify the source of the password attempts.",
    instructions: "Enter the source IP address shown in the auth log.",
    evidenceIds: ["authLog"],
    hint: "Look for “from …” in the sshd lines.",
    explanation:
      "All attempts in the excerpt come from 203.0.113.88 — a documentation-range address used as fictional evidence.",
    answerKind: "text",
    acceptedAnswers: ["203.0.113.88"],
    basePoints: 10,
  },
  "mac-1": {
    id: "mac-1",
    categoryId: "mandatory-access-control",
    title: "AppArmor mode for rean-app",
    difficulty: "easy",
    scenario: "aa-status shows profile modes.",
    instructions: "What mode is the rean-app profile currently in?",
    evidenceIds: ["apparmor"],
    hint: "Compare enforce vs complain listings.",
    explanation:
      "rean-app is in complain mode — violations are logged but not blocked. nginx is enforce.",
    answerKind: "text",
    acceptedAnswers: ["complain", "complain mode"],
    basePoints: 10,
  },
  "mac-2": {
    id: "mac-2",
    categoryId: "mandatory-access-control",
    title: "SELinux context mismatch risk",
    difficulty: "medium",
    scenario: "Web content vs app config labels differ.",
    instructions:
      "Which path shows a less specific SELinux type that may indicate mislabeling for app config?",
    evidenceIds: ["selinux"],
    hint: "default_t is often a catch-all label.",
    explanation:
      "/srv/app/config.yml is labeled default_t, which is less specific than httpd_sys_content_t on the web root — a common teaching signal to review labeling.",
    answerKind: "single-choice",
    options: [
      { key: "A", label: "/srv/app/config.yml (default_t)" },
      { key: "B", label: "/var/www/html/index.html (httpd_sys_content_t)" },
      { key: "C", label: "Neither path has a context" },
      { key: "D", label: "SELinux contexts only apply to Windows hosts" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "mac-3": {
    id: "mac-3",
    categoryId: "mandatory-access-control",
    title: "Move rean-app to enforce",
    difficulty: "medium",
    scenario:
      "Complain mode logged an ALLOWED open of /etc/shadow by rean-app.",
    instructions: "Select the MAC remediation that strengthens containment.",
    evidenceIds: ["apparmor", "macLog"],
    hint: "Enforce mode blocks policy violations.",
    explanation:
      "Switching rean-app to enforce mode provides real containment. Disabling AppArmor entirely removes that layer.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "enforce-apparmor",
        label: "Set rean-app AppArmor profile to enforce",
        description: "Block policy violations instead of only logging.",
      },
      {
        id: "disable-apparmor",
        label: "Unload all AppArmor profiles",
        description: "Removes MAC containment.",
      },
      {
        id: "chmod-shadow",
        label: "chmod 777 /etc/shadow",
        description: "Makes the problem worse.",
      },
    ],
    correctRemediationIds: ["enforce-apparmor"],
    basePoints: 10,
  },
  "ir-1": {
    id: "ir-1",
    categoryId: "incident-response",
    title: "Order the IR workflow",
    difficulty: "medium",
    scenario: "INC-2044 is open for suspicious authentication on rean-harden.",
    instructions: "Which sequence is the safest high-level workflow?",
    evidenceIds: ["irTicket", "authLog"],
    hint: "Investigate and preserve before destructive changes when safe.",
    explanation:
      "A safe teaching workflow is investigate → preserve evidence → contain → eradicate/recover → verify/document. Wiping first destroys evidence; ignoring logs skips investigation.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Investigate and preserve evidence → contain → recover/verify → document",
      },
      {
        key: "B",
        label: "Wipe the disk first → then read logs if anything remains",
      },
      {
        key: "C",
        label: "Post on social media → wait for attackers to stop",
      },
      {
        key: "D",
        label: "Disable all monitoring so alerts stop",
      },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "ir-2": {
    id: "ir-2",
    categoryId: "incident-response",
    title: "Evidence before containment",
    difficulty: "medium",
    scenario: "You are about to disable contractor after the auth alert.",
    instructions: "Which action should come first when safe to do so?",
    evidenceIds: ["irTicket", "authLog", "idContractor"],
    hint: "Preserve volatile evidence before changing system state.",
    explanation:
      "Preserving evidence (auth excerpts, process lists, membership) before containment keeps the investigation defensible. Skipping straight to deletion loses context.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label: "Preserve evidence (auth log excerpt and related state)",
      },
      { key: "B", label: "rm -rf /home/contractor with no notes" },
      { key: "C", label: "Grant contractor more sudo for debugging" },
      { key: "D", label: "Turn off journald permanently" },
    ],
    correctKeys: ["A"],
    basePoints: 10,
  },
  "ir-3": {
    id: "ir-3",
    categoryId: "incident-response",
    title: "Contain the contractor account",
    difficulty: "hard",
    scenario: "After preserving evidence, contain the suspicious account.",
    instructions:
      "Select the containment actions that should be applied together for this incident.",
    evidenceIds: ["irTicket", "authLog", "groups"],
    hint: "Preserve evidence, disable the account, and remove unexpected sudo.",
    explanation:
      "For this teaching incident: preserve evidence, disable contractor, and remove sudo membership. Opening more ports is not containment.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "preserve-evidence",
        label: "Preserve evidence bundle",
        description: "Record auth excerpt and related state.",
      },
      {
        id: "disable-contractor",
        label: "Disable contractor account (nologin)",
        description: "Block further interactive logins.",
      },
      {
        id: "remove-contractor-sudo",
        label: "Remove contractor from sudo",
        description: "Drop unexpected admin rights.",
      },
      {
        id: "allow-all-ports",
        label: "Open all firewall ports",
        description: "Increases exposure.",
      },
    ],
    correctRemediationIds: [
      "preserve-evidence",
      "disable-contractor",
      "remove-contractor-sudo",
    ],
    basePoints: 12,
  },
  "final-1": {
    id: "final-1",
    categoryId: "final-assessment",
    title: "Identify the active findings set",
    difficulty: "hard",
    scenario:
      "rean-harden shows suspicious contractor authentication plus multiple hardening gaps. Use the shared environment evidence.",
    instructions:
      "Select all findings that are still open in the current audit summary.",
    evidenceIds: [
      "auditFindings",
      "authLog",
      "sshdT",
      "ssListen",
      "advisory",
      "backup",
    ],
    hint: "Every [CRITICAL]/[HIGH]/[MEDIUM] line that is not [OK] is still open.",
    explanation:
      "At the start of the final assessment the host still has: contractor sudo, secrets exposure, deploy NOPASSWD ALL, weak SSH, PostgreSQL exposure, openssh advisory, AppArmor complain, and unverified backups.",
    answerKind: "multi-choice",
    options: [
      { key: "A", label: "contractor in sudo group" },
      { key: "B", label: "secrets.env overly readable" },
      { key: "C", label: "deploy NOPASSWD ALL" },
      { key: "D", label: "SSH password/root login enabled" },
      { key: "E", label: "PostgreSQL network exposure" },
      { key: "F", label: "openssh-server advisory open" },
      { key: "G", label: "rean-app AppArmor complain mode" },
      { key: "H", label: "backup restore never verified" },
      { key: "I", label: "nginx not installed" },
    ],
    correctKeys: ["A", "B", "C", "D", "E", "F", "G", "H"],
    validate: (ctx) => {
      const required = ["A", "B", "C", "D", "E", "F", "G", "H"];
      return (
        setsEqual(ctx.selectedKeys, required) &&
        ctx.env.contractorInSudo &&
        ctx.env.secretsMode === "0644" &&
        ctx.env.deploySudoAll &&
        ctx.env.sshPasswordAuth &&
        ctx.env.postgresPublicBind &&
        ctx.env.opensshOutdated &&
        ctx.env.apparmorComplain &&
        !ctx.env.backupVerified
      );
    },
    basePoints: 15,
  },
  "final-2": {
    id: "final-2",
    categoryId: "final-assessment",
    title: "Prioritize immediate response",
    difficulty: "hard",
    scenario:
      "You must sequence work: suspicious privileged auth is active while CRITICAL static exposures remain.",
    instructions: "Which prioritization is most appropriate first?",
    evidenceIds: ["authLog", "irTicket", "auditFindings", "idContractor"],
    hint: "Contain active abuse paths while preserving evidence, then harden CRITICAL static issues.",
    explanation:
      "Preserve evidence and contain the contractor privilege path first, then address CRITICAL exposures (secrets, PostgreSQL) and other hardening. Ignoring auth evidence to chase only cosmetics is wrong.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Preserve evidence and contain contractor privilege, then remediate CRITICAL exposures and remaining hardening",
      },
      {
        key: "B",
        label: "Only rename the hostname and declare the incident closed",
      },
      {
        key: "C",
        label: "Disable backups so restore tests cannot fail",
      },
      {
        key: "D",
        label: "Grant deploy NOPASSWD ALL to more users for speed",
      },
    ],
    correctKeys: ["A"],
    basePoints: 15,
  },
  "final-3": {
    id: "final-3",
    categoryId: "final-assessment",
    title: "Apply core remediations",
    difficulty: "hard",
    scenario:
      "Apply the simulated remediations that address account privilege, secrets, sudo, SSH, database exposure, the advisory, AppArmor, backup verification, and IR containment.",
    instructions:
      "Select every remediation required to clear the integrated findings for this scenario.",
    evidenceIds: ["auditFindings", "irTicket", "authLog"],
    hint: "Include preserve/disable/remove-sudo, harden secrets/SSH/sudo/postgres, patch openssh, enforce AppArmor, and verify backup.",
    explanation:
      "The integrated remediation set covers IR containment and each major hardening gap on rean-harden. Extra unsafe actions are not required.",
    answerKind: "remediation",
    remediationActions: [
      {
        id: "preserve-evidence",
        label: "Preserve evidence",
        description: "Keep auth and state artifacts.",
      },
      {
        id: "disable-contractor",
        label: "Disable contractor",
        description: "Block further logins.",
      },
      {
        id: "remove-contractor-sudo",
        label: "Remove contractor from sudo",
        description: "Drop unexpected admin rights.",
      },
      {
        id: "harden-secrets",
        label: "Harden secrets.env",
        description: "Mode 0600 and clear other ACL.",
      },
      {
        id: "restrict-deploy-sudo",
        label: "Restrict deploy sudo",
        description: "Least-privilege deploy commands.",
      },
      {
        id: "harden-ssh",
        label: "Harden SSH",
        description: "No password auth; no root login.",
      },
      {
        id: "contain-postgres",
        label: "Contain PostgreSQL",
        description: "Localhost bind + deny 5432.",
      },
      {
        id: "patch-openssh",
        label: "Patch openssh-server",
        description: "Clear fictional advisory.",
      },
      {
        id: "enforce-apparmor",
        label: "Enforce rean-app AppArmor",
        description: "Switch from complain to enforce.",
      },
      {
        id: "verify-backup",
        label: "Verify backup restore",
        description: "Record a successful restore test.",
      },
      {
        id: "allow-all-ports",
        label: "Open all ports",
        description: "Unsafe distraction.",
      },
    ],
    correctRemediationIds: [
      "preserve-evidence",
      "disable-contractor",
      "remove-contractor-sudo",
      "harden-secrets",
      "restrict-deploy-sudo",
      "harden-ssh",
      "contain-postgres",
      "patch-openssh",
      "enforce-apparmor",
      "verify-backup",
    ],
    basePoints: 20,
  },
  "final-4": {
    id: "final-4",
    categoryId: "final-assessment",
    title: "Verify posture after remediation",
    difficulty: "hard",
    scenario:
      "After applying remediations in the previous task, verify the simulated environment state.",
    instructions:
      "Based on the shared environment after your remediations, which statement is true?",
    evidenceIds: ["auditFindings", "sshdT", "ssListen", "backup", "apparmor"],
    hint: "Evidence panels refresh from the shared fictional host state.",
    explanation:
      "Successful remediation clears critical/high exposures: secrets hardened, PostgreSQL contained, SSH hardened, advisory cleared, AppArmor enforce, backup verified, and contractor contained.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Critical exposures are cleared, SSH is hardened, AppArmor is enforce, backup is verified, and contractor is contained",
      },
      {
        key: "B",
        label: "PostgreSQL is still on 0.0.0.0:5432 and secrets remain 0644",
      },
      {
        key: "C",
        label: "PasswordAuthentication is still yes and root login is required",
      },
      {
        key: "D",
        label: "Evidence preservation is impossible on this fictional host",
      },
    ],
    correctKeys: ["A"],
    validate: (ctx) =>
      ctx.selectedKeys.length === 1 &&
      ctx.selectedKeys[0] === "A" &&
      !ctx.env.contractorInSudo &&
      ctx.env.contractorDisabled &&
      ctx.env.evidencePreserved &&
      ctx.env.secretsMode === "0600" &&
      !ctx.env.secretsAclOtherRead &&
      !ctx.env.deploySudoAll &&
      !ctx.env.sshPasswordAuth &&
      !ctx.env.sshPermitRootLogin &&
      !ctx.env.postgresPublicBind &&
      !ctx.env.ufwAllows5432 &&
      !ctx.env.opensshOutdated &&
      !ctx.env.apparmorComplain &&
      ctx.env.backupVerified,
    basePoints: 15,
  },
  "final-5": {
    id: "final-5",
    categoryId: "final-assessment",
    title: "Final security assessment narrative",
    difficulty: "medium",
    scenario: "Produce the closing assessment for INC-2044 / rean-harden.",
    instructions: "Which closing assessment best matches a remediated host?",
    evidenceIds: ["auditFindings", "irTicket", "backup"],
    hint: "Assume remediations from final-3 were applied and verified in final-4.",
    explanation:
      "The appropriate close-out states that suspicious auth was investigated with evidence preserved, privileges and exposures were remediated, and verification passed — with ongoing monitoring recommended. Declaring compromise impossible or skipping documentation is incorrect.",
    answerKind: "single-choice",
    options: [
      {
        key: "A",
        label:
          "Suspicious auth investigated with evidence preserved; privilege and exposure findings remediated and verified; continue monitoring and periodic restore tests",
      },
      {
        key: "B",
        label: "No findings ever existed; delete the ticket without notes",
      },
      {
        key: "C",
        label: "Host is permanently untrustworthy; abandon all backups forever",
      },
      {
        key: "D",
        label: "Only cosmetic changes were made; leave CRITICAL findings open",
      },
    ],
    correctKeys: ["A"],
    validate: (ctx) =>
      ctx.selectedKeys[0] === "A" &&
      ctx.env.evidencePreserved &&
      ctx.env.backupVerified &&
      !ctx.env.sshPasswordAuth,
    basePoints: 12,
  },
  "final-6": {
    id: "final-6",
    categoryId: "final-assessment",
    title: "Recommend follow-up lessons",
    difficulty: "easy",
    scenario: "Reflect on which Stage 04 topics this host exercised most.",
    instructions:
      "Which lesson topics were most central to this integrated scenario?",
    evidenceIds: ["auditFindings", "authLog", "irTicket"],
    hint: "Think beyond a single control — auditing, SSH, IR, privileges, and exposure.",
    explanation:
      "The integrated scenario heavily exercised auditing, SSH hardening, incident response, privilege management, and network exposure. It is not primarily about Bash scripting or package search syntax from earlier stages.",
    answerKind: "multi-choice",
    options: [
      { key: "A", label: "Security auditing" },
      { key: "B", label: "SSH hardening" },
      { key: "C", label: "Incident response" },
      { key: "D", label: "Privilege management / sudo" },
      { key: "E", label: "Firewall and network exposure" },
      { key: "F", label: "Writing Bash for-loops (Stage 02 focus)" },
    ],
    correctKeys: ["A", "B", "C", "D", "E"],
    basePoints: 10,
  },
};

export const TOTAL_SECURITY_CHALLENGE_TASKS = Object.keys(
  SECURITY_CHALLENGE_TASKS,
).length;

export const MAX_SECURITY_CHALLENGE_SCORE = Object.values(
  SECURITY_CHALLENGE_TASKS,
).reduce((sum, task) => sum + task.basePoints, 0);

export function getSecurityChallengeCategory(
  id: SecurityChallengeCategoryId,
): SecurityChallengeCategory | undefined {
  return SECURITY_CHALLENGE_CATEGORIES.find((category) => category.id === id);
}

export function getSecurityChallengeTask(
  id: SecurityChallengeTaskId,
): SecurityChallengeTask | undefined {
  return SECURITY_CHALLENGE_TASKS[id];
}

export function getTasksForSecurityCategory(
  categoryId: SecurityChallengeCategoryId,
): readonly SecurityChallengeTask[] {
  const category = getSecurityChallengeCategory(categoryId);
  if (!category) {
    return [];
  }
  return category.taskIds.map((id) => SECURITY_CHALLENGE_TASKS[id]);
}

export function taskNeedsReview(attempts: number, hintsUsed: number): boolean {
  return attempts >= 3 || hintsUsed >= 1;
}
