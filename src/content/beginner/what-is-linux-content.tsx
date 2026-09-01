import { ImportantTerm } from "@/components/learn/important-term";
import { LessonSection } from "@/components/learn/lesson-section";
import {
  CompositionDiagram,
  StackDiagram,
} from "@/components/learn/stack-diagram";
import { TextLink } from "@/components/ui/text-link";
import { WHAT_IS_LINUX_SECTIONS } from "@/content/beginner/what-is-linux";

export function WhatIsLinuxContent() {
  const {
    simpleTerms,
    kernel,
    vsDistribution,
    popularity,
    whereUsed,
    distributions,
    nextSteps,
  } = WHAT_IS_LINUX_SECTIONS;

  return (
    <>
      <LessonSection id={simpleTerms.id} title={simpleTerms.title}>
        <p>
          At its core, <strong className="text-foreground">Linux</strong> is an
          open-source operating system kernel — the foundational layer of
          software that lets your computer hardware and applications work
          together. When people say they use &ldquo;Linux,&rdquo; they are
          usually referring to a complete system built around that kernel.
        </p>
        <p>
          An <strong className="text-foreground">operating system</strong>{" "}
          manages the basics: starting programs, reading files from disk,
          connecting to the network, and sharing the CPU and memory among
          everything running on your machine. Without an operating system,
          software would have no consistent way to talk to hardware.
        </p>
        <ImportantTerm term="Kernel">
          the core part of an operating system responsible for managing hardware
          and system resources.
        </ImportantTerm>
        <p>
          The Linux kernel on its own is not a complete desktop or server
          environment. A full system also needs system tools, libraries, a way
          to install software, and often a desktop or server applications. That
          complete package is called a{" "}
          <strong className="text-foreground">Linux distribution</strong>.
        </p>
        <ImportantTerm term="Distribution">
          a complete operating system built around the Linux kernel.
        </ImportantTerm>
        <p>
          In everyday conversation, saying &ldquo;I run Linux&rdquo; usually
          means you run a distribution such as Ubuntu or Fedora — not the kernel
          alone. That shorthand is common because the kernel is the shared
          foundation across all of them.
        </p>
      </LessonSection>

      <LessonSection id={kernel.id} title={kernel.title}>
        <p>
          The kernel sits at the center of every Linux system. It is the bridge
          between your hardware and the software you actually use.
        </p>
        <p>
          When you open a file, connect to Wi-Fi, or run a program, the request
          eventually reaches the kernel. It decides how CPU time is shared,
          which memory regions belong to which process, how devices are
          accessed, and how data moves between storage, network interfaces, and
          applications.
        </p>
        <p>In practical terms, the kernel handles responsibilities such as:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Scheduling processes on the CPU</li>
          <li>Managing RAM and virtual memory</li>
          <li>Controlling access to disks and other storage</li>
          <li>Driving network interfaces and connected devices</li>
          <li>Enforcing basic security boundaries between programs</li>
        </ul>
        <p>
          Most users never interact with the kernel directly. You work through a
          shell, desktop environment, or applications — and those tools ask the
          kernel to perform work on your behalf.
        </p>
        <StackDiagram
          ariaLabel="Conceptual stack showing applications above shell or desktop, above the Linux kernel, above hardware"
          layers={[
            "Applications",
            "Shell / Desktop",
            "Linux Kernel",
            "Hardware",
          ]}
        />
      </LessonSection>

      <LessonSection id={vsDistribution.id} title={vsDistribution.title}>
        <p>
          This distinction matters because beginners often hear both terms used
          interchangeably. The kernel is one component; a distribution is the
          full operating system experience built on top of it.
        </p>
        <CompositionDiagram
          ariaLabel="Linux distribution composed of the Linux kernel plus system tools, package manager, libraries, and desktop or applications"
          components={[
            "Linux Kernel",
            "System tools",
            "Package manager",
            "Libraries",
            "Desktop / applications",
          ]}
          result="Linux Distribution"
        />
        <p>
          Different distributions make different choices about default software,
          release schedules, and system administration tools. Ubuntu, Debian,
          Fedora, and Arch Linux all use the Linux kernel, but each ships its
          own curated combination of packages, configuration, and community
          support.
        </p>
        <p>
          Think of the kernel as the engine and the distribution as the entire
          car — frame, controls, fuel system, and dashboard included. You need
          both to drive somewhere useful.
        </p>
      </LessonSection>

      <LessonSection id={popularity.id} title={popularity.title}>
        <p>
          Linux did not become widely used by accident. It offers practical
          advantages that matter to individual learners, companies, and
          infrastructure teams alike.
        </p>
        <ul className="space-y-4">
          <li>
            <strong className="text-foreground">Open source</strong> — The
            kernel and most distributions can be inspected, modified, and shared
            freely. Organizations can audit code and communities can fix
            problems without waiting on a single vendor.
          </li>
          <li>
            <strong className="text-foreground">Flexible</strong> — Linux runs
            on laptops, servers, routers, embedded boards, and supercomputers.
            You can strip it down to the essentials or build a full desktop
            environment.
          </li>
          <li>
            <strong className="text-foreground">Stable</strong> — Many
            distributions prioritize reliability for long-running servers and
            workstations, with conservative update models when needed.
          </li>
          <li>
            <strong className="text-foreground">Powerful command line</strong> —
            The shell and core utilities make it efficient to automate tasks,
            inspect systems, and manage remote machines.
          </li>
          <li>
            <strong className="text-foreground">Strong server ecosystem</strong>{" "}
            — Web servers, databases, mail systems, and countless backend
            services have mature Linux tooling and documentation.
          </li>
          <li>
            <strong className="text-foreground">Large community</strong> —
            Forums, documentation, and open-source projects provide help at
            every skill level.
          </li>
          <li>
            <strong className="text-foreground">
              Widely used in cloud infrastructure
            </strong>{" "}
            — Major cloud providers build much of their platform around Linux
            virtual machines and services.
          </li>
          <li>
            <strong className="text-foreground">Highly customizable</strong> —
            From package selection to desktop environment to kernel parameters,
            you can tune a system to match your workflow.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id={whereUsed.id} title={whereUsed.title}>
        <p>
          Linux is not limited to one type of machine or one kind of user. You
          may already depend on it without realizing it.
        </p>
        <ul className="space-y-3">
          <li>
            <strong className="text-foreground">Web servers</strong> — A large
            share of websites and APIs run on Linux, often paired with software
            like Nginx or Apache.
          </li>
          <li>
            <strong className="text-foreground">Cloud infrastructure</strong> —
            Virtual machines, managed databases, and platform services commonly
            run on Linux hosts.
          </li>
          <li>
            <strong className="text-foreground">Containers</strong> — Tools such
            as Docker and Kubernetes rely on Linux kernel features for isolation
            and resource control.
          </li>
          <li>
            <strong className="text-foreground">
              Development environments
            </strong>{" "}
            — Many developers use Linux locally or in remote environments
            because it mirrors production servers closely.
          </li>
          <li>
            <strong className="text-foreground">Networking equipment</strong> —
            Routers, switches, and firewalls often run embedded Linux systems.
          </li>
          <li>
            <strong className="text-foreground">Embedded systems</strong> — TVs,
            appliances, industrial controllers, and IoT devices frequently use a
            trimmed-down Linux build.
          </li>
          <li>
            <strong className="text-foreground">Supercomputers</strong> — Most
            of the world&apos;s top supercomputers run Linux because of its
            performance, scalability, and adaptability.
          </li>
          <li>
            <strong className="text-foreground">Android</strong> — Google&apos;s
            Android operating system for phones and tablets is built on the
            Linux kernel.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id={distributions.id} title={distributions.title}>
        <p>
          There are hundreds of distributions, but a few names come up
          constantly when you start learning. Here are five well-known options
          and what makes each approachable for beginners.
        </p>
        <dl className="space-y-5">
          <div>
            <dt className="text-foreground font-medium">Ubuntu</dt>
            <dd className="mt-1">
              A popular beginner-friendly distribution with strong hardware
              support, regular releases, and a large community.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Debian</dt>
            <dd className="mt-1">
              One of the oldest distributions, known for stability and a huge
              package archive. Ubuntu is based on Debian.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Fedora</dt>
            <dd className="mt-1">
              A community distribution sponsored by Red Hat that often ships
              newer software and upstream innovations early.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Arch Linux</dt>
            <dd className="mt-1">
              A rolling-release distribution that lets you build up a system
              step by step — popular with users who want fine-grained control.
            </dd>
          </div>
          <div>
            <dt className="text-foreground font-medium">Rocky Linux</dt>
            <dd className="mt-1">
              An enterprise-focused distribution commonly used for servers and
              environments that need long-term support cycles.
            </dd>
          </div>
        </dl>
      </LessonSection>

      <LessonSection id={nextSteps.id} title={nextSteps.title}>
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-5 sm:p-6">
          <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
            Ready for the next step?
          </h3>
          <p>
            Now that you understand what Linux is, let&apos;s look at the
            different Linux distributions and how to choose one for your
            learning journey.
          </p>
          <p>
            <TextLink href="/learn/beginner/linux-distributions">
              Next: Linux Distributions →
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
