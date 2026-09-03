import { Callout } from "@/components/learn/callout";
import { LessonSection } from "@/components/learn/lesson-section";
import { StackDiagram } from "@/components/learn/stack-diagram";
import { CodeBlock } from "@/components/ui/code-block";
import { WHAT_IS_LINUX_SECTIONS } from "@/content/beginner/what-is-linux";

export function WhatIsLinuxContent() {
  const {
    whatIs,
    kernel,
    gnuLinux,
    distributions,
    whyLearn,
    everywhere,
    summary,
  } = WHAT_IS_LINUX_SECTIONS;

  return (
    <>
      <LessonSection id={whatIs.id} title={whatIs.title}>
        <p>
          <strong className="text-foreground">Linux</strong> is an open-source
          operating system kernel — the core software that manages your
          computer&apos;s hardware and lets programs run. On its own, the kernel
          is not a complete desktop or server system you can install and use.
        </p>
        <p>
          In everyday conversation, people say &ldquo;Linux&rdquo; to mean a
          complete operating system built around that kernel. Those complete
          systems are called{" "}
          <strong className="text-foreground">Linux distributions</strong>. A
          distribution combines the Linux kernel with tools, libraries, a
          package manager, and other software so you have something practical to
          install and work with.
        </p>
        <p>
          So when someone says they run Ubuntu, Fedora, or Debian, they are
          still talking about Linux — just a specific complete package built on
          the Linux kernel.
        </p>
      </LessonSection>

      <LessonSection id={kernel.id} title={kernel.title}>
        <p>
          The kernel sits between your applications and your hardware. When a
          program needs CPU time, memory, disk access, or a network connection,
          that request goes through the kernel.
        </p>
        <p>In practical terms, the Linux kernel helps manage:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">CPU</strong> — which processes
            get processor time and when
          </li>
          <li>
            <strong className="text-foreground">Memory</strong> — how RAM is
            allocated and protected between programs
          </li>
          <li>
            <strong className="text-foreground">Hardware</strong> — talking to
            disks, keyboards, network cards, and other devices
          </li>
          <li>
            <strong className="text-foreground">Processes</strong> — starting,
            scheduling, and isolating running programs
          </li>
          <li>
            <strong className="text-foreground">Devices</strong> — providing a
            consistent way for software to use connected hardware
          </li>
          <li>
            <strong className="text-foreground">Communication</strong> — acting
            as the bridge between applications and the physical machine
          </li>
        </ul>
        <p>
          You usually do not talk to the kernel directly. You use a shell,
          desktop, or application — and those tools ask the kernel to do the
          work.
        </p>
        <StackDiagram
          ariaLabel="Conceptual stack showing applications above system libraries and tools, above the Linux kernel, above hardware"
          layers={[
            "Applications",
            "System libraries / tools",
            "Linux Kernel",
            "Hardware",
          ]}
        />
        <p>
          You can inspect basic information about the running kernel with a
          simple command:
        </p>
        <CodeBlock code="uname -a" language="bash" title="bash" />
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            uname -a
          </code>{" "}
          prints details about the running system and kernel. It is a quick way
          to confirm you are on a Linux machine and see which kernel version is
          active.
        </p>
        <Callout>
          <p>
            You don&apos;t need to memorize Linux commands. Focus on
            understanding what they do and when to use them.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={gnuLinux.id} title={gnuLinux.title}>
        <p>
          You may also hear the name{" "}
          <strong className="text-foreground">GNU/Linux</strong>. Many
          distributions combine the Linux kernel with GNU tools and libraries —
          utilities for shells, compilers, file handling, and everyday system
          work.
        </p>
        <p>
          In practice, people usually just say &ldquo;Linux.&rdquo; The longer
          name simply acknowledges that a usable system is more than the kernel
          alone: it is the kernel plus a large collection of supporting
          software.
        </p>
      </LessonSection>

      <LessonSection id={distributions.id} title={distributions.title}>
        <p>
          A <strong className="text-foreground">Linux distribution</strong>{" "}
          packages the Linux kernel with software, a package manager,
          configuration tools, defaults, and documentation so you can install
          and maintain a complete operating system.
        </p>
        <p>
          Different distributions make different choices about release cadence,
          default software, and administration style. Common examples include:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Ubuntu</li>
          <li>Debian</li>
          <li>Fedora</li>
          <li>Arch Linux</li>
          <li>openSUSE</li>
        </ul>
        <p>
          You do not need to pick one yet. For now, remember that distributions
          are complete systems built around the same Linux kernel, each with its
          own packaging and defaults.
        </p>
      </LessonSection>

      <LessonSection id={whyLearn.id} title={whyLearn.title}>
        <p>
          Learning Linux is practical. It shows up across many technical roles
          and environments:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Servers</strong> — a large share
            of web and application servers run Linux
          </li>
          <li>
            <strong className="text-foreground">Cloud</strong> — virtual
            machines and managed services commonly run on Linux hosts
          </li>
          <li>
            <strong className="text-foreground">Development</strong> — many
            developers use Linux locally or remotely because it matches
            production systems
          </li>
          <li>
            <strong className="text-foreground">DevOps</strong> — automation,
            deployment, and monitoring workflows often assume Linux skills
          </li>
          <li>
            <strong className="text-foreground">Containers</strong> — Docker and
            Kubernetes rely heavily on Linux kernel features
          </li>
          <li>
            <strong className="text-foreground">Networking</strong> — routers,
            firewalls, and network services frequently run Linux-based software
          </li>
          <li>
            <strong className="text-foreground">System administration</strong> —
            installing packages, managing users, and troubleshooting systems are
            everyday Linux tasks
          </li>
        </ul>
        <p>
          Even a basic comfort level with Linux helps you understand how modern
          software is built, deployed, and operated.
        </p>
      </LessonSection>

      <LessonSection id={everywhere.id} title={everywhere.title}>
        <p>
          Linux is not limited to desktops or one kind of machine. It runs
          across many environments, including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Web servers</li>
          <li>Cloud infrastructure</li>
          <li>Containers</li>
          <li>Networking equipment</li>
          <li>Embedded systems</li>
          <li>Supercomputers</li>
        </ul>
        <p>
          That reach is one reason Linux skills transfer well. Concepts you
          learn here — processes, filesystems, users, packages, and the terminal
          — apply across many of those environments.
        </p>
      </LessonSection>

      <LessonSection id={summary.id} title={summary.title}>
        <p>Here is what you should take away from this lesson:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The <strong className="text-foreground">Linux kernel</strong> is the
            core that manages hardware and processes.
          </li>
          <li>
            A <strong className="text-foreground">Linux distribution</strong> is
            a complete operating system built around that kernel.
          </li>
          <li>
            Linux matters because it powers servers, cloud platforms,
            containers, networking gear, and much more.
          </li>
        </ul>
        <p>
          Next, you will look at Linux distributions in more detail — what
          makes them different, and how to think about choosing one as you
          continue learning.
        </p>
      </LessonSection>
    </>
  );
}
