import { LessonSection } from "@/components/learn/lesson-section";
import {
  LessonTable,
  LessonTableBody,
  LessonTableCell,
  LessonTableCellPrimary,
  LessonTableHead,
  LessonTableHeaderCell,
  LessonTableRow,
} from "@/components/learn/lesson-table";
import { CompositionDiagram } from "@/components/learn/stack-diagram";
import { CodeBlock } from "@/components/ui/code-block";
import { TextLink } from "@/components/ui/text-link";
import { LINUX_DISTRIBUTIONS_SECTIONS } from "@/content/beginner/linux-distributions";

export function LinuxDistributionsContent() {
  const {
    whatIs,
    whySoMany,
    popular,
    packageManagers,
    whichChoose,
    vsDesktop,
    nextSteps,
  } = LINUX_DISTRIBUTIONS_SECTIONS;

  return (
    <>
      <LessonSection id={whatIs.id} title={whatIs.title}>
        <p>
          <strong className="text-foreground">Linux itself</strong> is the
          kernel — the core software that manages hardware and provides
          essential services to everything running on your computer. On its own,
          the kernel is not a complete operating system you can install and use
          directly.
        </p>
        <p>
          A <strong className="text-foreground">Linux distribution</strong>{" "}
          combines the Linux kernel with system tools, libraries, a package
          manager, and applications. Different distributions make different
          choices about defaults, bundled software, and how the system is
          maintained.
        </p>
        <p>
          This is why Ubuntu, Debian, Fedora, and Arch can all be called Linux
          distributions while behaving differently — they share the same kernel
          foundation but ship different combinations of software and
          configuration.
        </p>
        <CompositionDiagram
          ariaLabel="Linux distribution composed of the Linux kernel plus system tools, libraries, package manager, and applications"
          components={[
            "Linux Kernel",
            "System Tools",
            "Libraries",
            "Package Manager",
            "Applications",
          ]}
          result="Linux Distribution"
        />
      </LessonSection>

      <LessonSection id={whySoMany.id} title={whySoMany.title}>
        <p>
          Linux distributions exist because different users have different
          requirements. No single package of software can be the best fit for
          everyone, so communities and companies build variations tuned to
          specific goals.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Different audiences</strong> —
            Beginners, developers, enterprise administrators, and hobbyists all
            want different out-of-the-box experiences.
          </li>
          <li>
            <strong className="text-foreground">Different philosophies</strong>{" "}
            — Some distributions prioritize stability and predictability; others
            prioritize cutting-edge software or minimalism.
          </li>
          <li>
            <strong className="text-foreground">
              Different package management systems
            </strong>{" "}
            — Tools like APT, DNF, and Pacman organize software differently and
            target different ecosystems.
          </li>
          <li>
            <strong className="text-foreground">Different release models</strong>{" "}
            — Some release on fixed schedules with long-term support; others
            update continuously as new packages become available.
          </li>
          <li>
            <strong className="text-foreground">Different default software</strong>{" "}
            — Desktop environments, server tools, and preinstalled applications
            vary widely between distributions.
          </li>
          <li>
            <strong className="text-foreground">
              Different levels of customization
            </strong>{" "}
            — Some distributions give you a polished, ready-to-use system;
            others provide a minimal base you configure yourself.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id={popular.id} title={popular.title}>
        <p>
          Hundreds of distributions exist, but a handful appear constantly in
          learning resources, job postings, and server environments. Here are
          five well-known options and what each is generally known for.
        </p>
        <dl className="space-y-5">
          <div>
            <dt className="text-foreground font-medium">Ubuntu</dt>
            <dd className="mt-1">
              Ubuntu is a popular Debian-based distribution known for being
              beginner-friendly and widely used on desktops, servers, and cloud
              platforms.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Debian</dt>
            <dd className="mt-1">
              Debian is a long-running community-driven distribution known for
              stability and a large software ecosystem.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Fedora</dt>
            <dd className="mt-1">
              Fedora is a community Linux distribution sponsored by Red Hat and
              is known for adopting newer technologies.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Arch Linux</dt>
            <dd className="mt-1">
              Arch Linux is designed for users who want a minimal starting point
              and extensive control over how their system is configured.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Rocky Linux</dt>
            <dd className="mt-1">
              Rocky Linux is an enterprise-oriented distribution designed to be
              compatible with Red Hat Enterprise Linux.
            </dd>
          </div>
        </dl>
        <p>
          Each distribution has strengths for particular use cases. None is
          universally better — the right choice depends on your goals and
          context.
        </p>
        <LessonTable caption="Comparison of popular Linux distributions">
          <LessonTableHead>
            <LessonTableHeaderCell>Distribution</LessonTableHeaderCell>
            <LessonTableHeaderCell>Ecosystem</LessonTableHeaderCell>
            <LessonTableHeaderCell>Package Manager</LessonTableHeaderCell>
            <LessonTableHeaderCell>Typical Focus</LessonTableHeaderCell>
          </LessonTableHead>
          <LessonTableBody>
            <LessonTableRow>
              <LessonTableCellPrimary>Ubuntu</LessonTableCellPrimary>
              <LessonTableCell>Debian</LessonTableCell>
              <LessonTableCell>APT</LessonTableCell>
              <LessonTableCell>Beginners, desktop, server</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>Debian</LessonTableCellPrimary>
              <LessonTableCell>Debian</LessonTableCell>
              <LessonTableCell>APT</LessonTableCell>
              <LessonTableCell>Stability, servers</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>Fedora</LessonTableCellPrimary>
              <LessonTableCell>Red Hat</LessonTableCell>
              <LessonTableCell>DNF</LessonTableCell>
              <LessonTableCell>Modern Linux, development</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>Arch Linux</LessonTableCellPrimary>
              <LessonTableCell>Independent</LessonTableCell>
              <LessonTableCell>Pacman</LessonTableCell>
              <LessonTableCell>Control, customization</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>Rocky Linux</LessonTableCellPrimary>
              <LessonTableCell>RHEL-compatible</LessonTableCell>
              <LessonTableCell>DNF</LessonTableCell>
              <LessonTableCell>Enterprise servers</LessonTableCell>
            </LessonTableRow>
          </LessonTableBody>
        </LessonTable>
      </LessonSection>

      <LessonSection id={packageManagers.id} title={packageManagers.title}>
        <p>
          A <strong className="text-foreground">package manager</strong> is the
          tool your distribution uses to install, update, and remove software.
          Instead of downloading programs manually from individual websites, you
          use a package manager to fetch software from trusted repositories
          maintained for your distribution.
        </p>
        <p>
          Different distributions use different package management systems. The
          commands look similar in purpose but differ in syntax — always use the
          tools appropriate for the distribution you are running.
        </p>
        <p>
          <strong className="text-foreground">Ubuntu / Debian</strong> use APT:
        </p>
        <CodeBlock
          language="bash"
          title="Ubuntu / Debian"
          code={`sudo apt update
sudo apt install nginx`}
        />
        <p>
          <strong className="text-foreground">Fedora / Rocky Linux</strong> use
          DNF:
        </p>
        <CodeBlock
          language="bash"
          title="Fedora / Rocky Linux"
          code="sudo dnf install nginx"
        />
        <p>
          <strong className="text-foreground">Arch Linux</strong> uses Pacman:
        </p>
        <CodeBlock
          language="bash"
          title="Arch Linux"
          code="sudo pacman -S nginx"
        />
        <p>
          These examples show how the same task — installing the Nginx web
          server — uses different commands on different distributions. You do
          not need to run these commands now; they illustrate how package
          managers work in practice.
        </p>
      </LessonSection>

      <LessonSection id={whichChoose.id} title={whichChoose.title}>
        <p>
          There is no single distribution that is best for every person. Your
          choice depends on what you want to learn and how you plan to use
          Linux. Here are reasonable starting points for common goals:
        </p>
        <ul className="space-y-4">
          <li>
            <strong className="text-foreground">
              For someone completely new to Linux
            </strong>{" "}
            — Ubuntu is a reasonable starting point because of its
            beginner-friendly ecosystem and large amount of documentation.
          </li>
          <li>
            <strong className="text-foreground">
              For someone interested in learning enterprise-style Linux
            </strong>{" "}
            — Rocky Linux can be useful.
          </li>
          <li>
            <strong className="text-foreground">
              For someone who wants to understand Linux deeply and customize
              everything
            </strong>{" "}
            — Arch Linux can be a later challenge.
          </li>
          <li>
            <strong className="text-foreground">
              For someone who wants a stable general-purpose foundation
            </strong>{" "}
            — Debian is worth learning.
          </li>
        </ul>
        <p>
          The important lesson:{" "}
          <strong className="text-foreground">
            the distribution matters less than actually learning Linux
            fundamentals.
          </strong>{" "}
          Commands, the filesystem, permissions, and processes work similarly
          across distributions. Pick one, start learning, and refine your choice
          later as your goals become clearer.
        </p>
      </LessonSection>

      <LessonSection id={vsDesktop.id} title={vsDesktop.title}>
        <p>
          <strong className="text-foreground">Distribution ≠ Desktop Environment</strong>
        </p>
        <p>
          A distribution is the broader operating system package — kernel,
          tools, package manager, and default software. A{" "}
          <strong className="text-foreground">desktop environment</strong> is
          the graphical layer that provides windows, panels, menus, and
          settings for daily desktop use.
        </p>
        <p>
          The same distribution can ship with different desktop environments,
          such as:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>GNOME</li>
          <li>KDE Plasma</li>
          <li>XFCE</li>
        </ul>
        <p>
          The desktop environment controls much of the graphical user
          experience, while the distribution determines the underlying system,
          package management, and release model. You can often choose or switch
          desktop environments without changing distributions.
        </p>
      </LessonSection>

      <LessonSection id={nextSteps.id} title={nextSteps.title}>
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-5 sm:p-6">
          <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
            Ready to install Linux?
          </h3>
          <p>
            Now that you understand distributions, the next step is preparing and
            installing a Linux system.
          </p>
          <p>
            <TextLink href="/learn/beginner/installing-linux">
              Next: Installing Linux →
            </TextLink>
          </p>
          <p>
            <TextLink href="/learn/beginner/what-is-linux">
              ← Previous: What is Linux?
            </TextLink>
          </p>
          <p>
            <TextLink href="/learn/beginner">← Back to Beginner Path</TextLink>
          </p>
        </div>
      </LessonSection>
    </>
  );
}
