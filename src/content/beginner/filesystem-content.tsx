import { Callout } from "@/components/learn/callout";
import { FilesystemExplorer } from "@/components/learn/filesystem-explorer";
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
import { TreeDiagram } from "@/components/learn/stack-diagram";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { CodeBlock } from "@/components/ui/code-block";
import { FilesystemPractice } from "@/content/beginner/filesystem-practice";
import { FILESYSTEM_SECTIONS } from "@/content/beginner/filesystem";
import { createFilesystemLessonFs } from "@/lib/simulated-filesystem";

const INTRO_TREE = {
  label: "/",
  children: [
    {
      label: "home/",
      children: [
        {
          label: "learner/",
          children: [
            { label: "Desktop/" },
            { label: "Documents/" },
            { label: "Downloads/" },
            { label: "notes.txt" },
          ],
        },
      ],
    },
    { label: "etc/" },
    { label: "var/" },
    { label: "tmp/" },
    { label: "usr/" },
    { label: "bin/" },
  ],
};

const HOME_TREE = {
  label: "/home/learner",
  children: [
    { label: "Desktop/" },
    { label: "Documents/" },
    { label: "Downloads/" },
    { label: "notes.txt" },
  ],
};

const ABSOLUTE_TREE = {
  label: "/",
  children: [
    {
      label: "home",
      children: [
        {
          label: "learner",
          children: [{ label: "Documents" }],
        },
      ],
    },
  ],
};

export function FilesystemContent() {
  const {
    root,
    hierarchy,
    home,
    paths,
    dots,
    tilde,
    navigating,
    explore,
    practice,
    mistakes,
    summary,
  } = FILESYSTEM_SECTIONS;

  return (
    <>
      <section className="space-y-4" aria-label="Lesson introduction">
        <p>
          Linux organizes everything into a single filesystem tree. Unlike
          Windows, where learners often think in terms of drives such as{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            C:\
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            D:\
          </code>
          , Linux starts from one root directory:
        </p>
        <CodeBlock code="/" language="text" title="root" />
        <p>
          Every file and directory exists somewhere underneath{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /
          </code>
          .
        </p>
        <TreeDiagram
          root={INTRO_TREE}
          ariaLabel="Example Linux filesystem tree starting at root"
        />
      </section>

      <LessonSection id={root.id} title={root.title}>
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /
          </code>{" "}
          is called the <strong className="text-foreground">root directory</strong>
          . Keep these related ideas separate:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /
            </code>{" "}
            → filesystem root
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /home/learner
            </code>{" "}
            → learner&apos;s home directory
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ~
            </code>{" "}
            → shortcut for the current user&apos;s home directory
          </li>
        </ul>
        <p>
          Check your current location with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            pwd
          </code>
          :
        </p>
        <CodeBlock code="pwd" language="bash" title="bash" />
        <CodeBlock code="/home/learner" language="text" title="output" />
        <p>
          Then move to the root and confirm again:
        </p>
        <CodeBlock
          code={"cd /\npwd"}
          language="bash"
          title="bash"
        />
        <CodeBlock code="/" language="text" title="output" />
        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={[
            { command: "pwd", label: "Run pwd" },
            { command: "cd /", label: "Run cd /" },
            { command: "pwd", label: "Check again" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={hierarchy.id} title={hierarchy.title}>
        <p>
          Common top-level directories each have a purpose. You do not need to
          memorize every detail yet — learn the map first.
        </p>
        <LessonTable caption="Common Linux filesystem directories">
          <LessonTableHead>
            <LessonTableHeaderCell>Directory</LessonTableHeaderCell>
            <LessonTableHeaderCell>Purpose</LessonTableHeaderCell>
          </LessonTableHead>
          <LessonTableBody>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Root of the entire filesystem
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/home</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Personal directories for users
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/etc</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                System and application configuration
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/var</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Frequently changing data such as logs
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/tmp</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Temporary files</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/usr</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                User-space programs, libraries, and shared resources
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/bin</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Essential command-line programs
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">/sbin</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Essential system administration programs
              </LessonTableCell>
            </LessonTableRow>
          </LessonTableBody>
        </LessonTable>
        <p>
          Modern distributions may merge directories such as{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /bin
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /sbin
          </code>{" "}
          into{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /usr/bin
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /usr/sbin
          </code>
          . The important idea for now is that Linux still starts from one root
          tree.
        </p>
        <Callout title="Remember">
          <p>
            Think of{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /
            </code>{" "}
            as the top-level folder containing the entire Linux filesystem.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={home.id} title={home.title}>
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home
          </code>{" "}
          contains user home directories. In this simulator, your home directory
          is:
        </p>
        <CodeBlock code="/home/learner" language="text" title="path" />
        <CodeBlock
          code={"cd /home/learner\npwd"}
          language="bash"
          title="bash"
        />
        <CodeBlock code="/home/learner" language="text" title="output" />
        <p>
          Personal files normally live here — documents, downloads, project
          folders, and notes.
        </p>
        <TreeDiagram
          root={HOME_TREE}
          ariaLabel="Example contents of the learner home directory"
        />
        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={[
            { command: "cd /home/learner", label: "Run cd /home/learner" },
            { command: "pwd", label: "Run pwd" },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={paths.id} title={paths.title}>
        <p>
          An <strong className="text-foreground">absolute path</strong> starts
          from{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /
          </code>
          :
        </p>
        <CodeBlock
          code={"/home/learner\n/home/learner/Documents\n/etc\n/var"}
          language="text"
          title="absolute paths"
        />
        <p>
          A <strong className="text-foreground">relative path</strong> starts
          from the current directory. If you are inside{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home/learner
          </code>
          , then{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            Documents
          </code>{" "}
          refers to{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home/learner/Documents
          </code>
          .
        </p>
        <CodeBlock
          code={"cd /home/learner\ncd Documents\npwd"}
          language="bash"
          title="bash"
        />
        <CodeBlock
          code="/home/learner/Documents"
          language="text"
          title="output"
        />
        <p>The same place with an absolute path:</p>
        <CodeBlock
          code={"cd /home/learner/Documents\npwd"}
          language="bash"
          title="bash"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Absolute</p>
            <TreeDiagram
              root={ABSOLUTE_TREE}
              ariaLabel="Absolute path from root to Documents"
              className="my-0"
            />
          </div>
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              Relative from /home/learner
            </p>
            <CodeBlock code="Documents" language="text" title="relative" />
          </div>
        </div>
        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={[
            { command: "cd /home/learner", label: "Go home" },
            { command: "cd Documents", label: "Relative cd" },
            { command: "pwd", label: "Run pwd" },
            {
              command: "cd /home/learner/Documents",
              label: "Absolute cd",
            },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={dots.id} title={dots.title}>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              .
            </code>{" "}
            means the current directory
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ..
            </code>{" "}
            means the parent directory
          </li>
        </ul>
        <p>If you are here:</p>
        <CodeBlock code="pwd" language="bash" title="bash" />
        <CodeBlock
          code="/home/learner/Documents"
          language="text"
          title="output"
        />
        <p>
          Then{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cd ..
          </code>{" "}
          moves one level up:
        </p>
        <CodeBlock code={"cd ..\npwd"} language="bash" title="bash" />
        <CodeBlock code="/home/learner" language="text" title="output" />
        <p>Another step up:</p>
        <CodeBlock code={"cd ..\npwd"} language="bash" title="bash" />
        <CodeBlock code="/home" language="text" title="output" />
        <p>
          And{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cd .
          </code>{" "}
          keeps you in the same directory:
        </p>
        <CodeBlock code={"cd .\npwd"} language="bash" title="bash" />
        <TerminalSimulator
          filesystem={{
            ...createFilesystemLessonFs(),
            cwd: "/home/learner/Documents",
          }}
          suggestions={[
            { command: "pwd", label: "Run pwd" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd .", label: "Run cd ." },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={tilde.id} title={tilde.title}>
        <p>
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ~
          </code>{" "}
          represents the current user&apos;s home directory. In this simulator,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ~
          </code>{" "}
          means{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home/learner
          </code>
          .
        </p>
        <CodeBlock code={"cd ~\npwd"} language="bash" title="bash" />
        <CodeBlock code="/home/learner" language="text" title="output" />
        <CodeBlock
          code={"cd ~/Documents\npwd"}
          language="bash"
          title="bash"
        />
        <CodeBlock
          code="/home/learner/Documents"
          language="text"
          title="output"
        />
        <Callout title="Tip">
          <p>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ~
            </code>{" "}
            is one of the most useful shortcuts you&apos;ll use in the terminal.
          </p>
        </Callout>
        <TerminalSimulator
          filesystem={{
            ...createFilesystemLessonFs(),
            cwd: "/var",
          }}
          suggestions={[
            { command: "cd ~", label: "Run cd ~" },
            { command: "pwd", label: "Run pwd" },
            { command: "cd ~/Documents", label: "Run cd ~/Documents" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={navigating.id} title={navigating.title}>
        <p>Review the navigation trio you already know:</p>
        <CodeBlock code={"pwd\nls\ncd"} language="bash" title="bash" />
        <CodeBlock
          code={"pwd\nls\ncd Documents\npwd\ncd ..\npwd\ncd ~\npwd"}
          language="bash"
          title="bash"
        />
        <p>Keep this mental model close:</p>
        <CodeBlock
          code={"pwd → Where am I?\n\nls → What's here?\n\ncd → Move somewhere else."}
          language="text"
          title="mental model"
        />
        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={[
            { command: "pwd", label: "Run pwd" },
            { command: "ls", label: "Run ls" },
            { command: "cd Documents", label: "Run cd Documents" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd ~", label: "Run cd ~" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={explore.id} title={explore.title}>
        <p>
          Explore the same simulated filesystem the terminal uses. Click a
          directory to highlight it and inspect its path and children.
        </p>
        <FilesystemExplorer filesystem={createFilesystemLessonFs()} />
        <p className="text-muted-foreground text-sm">
          This explorer is educational only. It does not access files on your
          computer.
        </p>
        <TerminalSimulator
          filesystem={createFilesystemLessonFs()}
          suggestions={[
            { command: "cd /", label: "Run cd /" },
            { command: "ls", label: "Run ls" },
            { command: "cd /var", label: "Run cd /var" },
            { command: "cd log", label: "Run cd log" },
            { command: "cd ~", label: "Run cd ~" },
            { command: "ls -la", label: "Run ls -la" },
            "help",
          ]}
          suggestionsLabel="Explore in the terminal"
        />
      </LessonSection>

      <LessonSection id={practice.id} title={practice.title}>
        <FilesystemPractice />
      </LessonSection>

      <LessonSection id={mistakes.id} title={mistakes.title}>
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Mistake 1 — Absolute vs relative
        </h3>
        <CodeBlock
          code="cd /home/learner/Documents"
          language="bash"
          title="absolute"
        />
        <CodeBlock
          code="cd home/learner/Documents"
          language="bash"
          title="relative"
        />
        <p>
          The first path starts from{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /
          </code>
          . The second starts from wherever you currently are.
        </p>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Mistake 2 — Confusing / and ~
        </h3>
        <CodeBlock
          code={"/\n~"}
          language="text"
          title="paths"
        />
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              /
            </code>{" "}
            → filesystem root
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ~
            </code>{" "}
            → user&apos;s home directory
          </li>
        </ul>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Mistake 3 — Case sensitivity
        </h3>
        <p>
          Linux paths are case-sensitive.{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            Documents
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            documents
          </code>{" "}
          may refer to different locations.
        </p>

        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          Mistake 4 — Too many or too few ..
        </h3>
        <CodeBlock code="cd ../../" language="bash" title="bash" />
        <p>
          That moves up two directory levels — one for each{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ..
          </code>
          .
        </p>
      </LessonSection>

      <LessonSection id={summary.id} title={summary.title}>
        <p>Remember these foundations:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Linux starts from /</li>
          <li>/ is the root directory</li>
          <li>/home/learner is the user&apos;s home directory</li>
          <li>Absolute paths start from /</li>
          <li>Relative paths start from the current directory</li>
          <li>. means current directory</li>
          <li>.. means parent directory</li>
          <li>~ means the user&apos;s home directory</li>
          <li>pwd tells you where you are</li>
          <li>ls shows what&apos;s around you</li>
          <li>cd moves you around</li>
        </ul>

        <LessonTable caption="Command reference for filesystem navigation">
          <LessonTableHead>
            <LessonTableHeaderCell>Command</LessonTableHeaderCell>
            <LessonTableHeaderCell>What it does</LessonTableHeaderCell>
          </LessonTableHead>
          <LessonTableBody>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">pwd</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Shows the current directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">ls</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Lists files and directories
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cd &lt;path&gt;</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Changes directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cd ..</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Moves to the parent directory
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cd .</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Stays in the current directory
              </LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cd ~</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Goes to the home directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">ls -la</code>
              </LessonTableCellPrimary>
              <LessonTableCell>
                Lists detailed directory contents
              </LessonTableCell>
            </LessonTableRow>
          </LessonTableBody>
        </LessonTable>

        <p>
          <strong className="text-foreground">
            You now have the foundations needed to start working with Linux
            confidently from the terminal.
          </strong>
        </p>
      </LessonSection>
    </>
  );
}
