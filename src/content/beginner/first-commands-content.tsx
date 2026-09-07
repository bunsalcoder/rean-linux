import { Callout } from "@/components/learn/callout";
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
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { CodeBlock } from "@/components/ui/code-block";
import { FirstCommandsPractice } from "@/content/beginner/first-commands-practice";
import { FIRST_COMMANDS_SECTIONS } from "@/content/beginner/first-commands";
import { createLearnerHomeFs } from "@/lib/simulated-filesystem";

export function FirstCommandsContent() {
  const {
    meetCli,
    whereAmI,
    listFiles,
    moveAround,
    createDirectory,
    createFile,
    readFile,
    copyMove,
    removeFiles,
    practice,
    summary,
  } = FIRST_COMMANDS_SECTIONS;

  return (
    <>
      <LessonSection id={meetCli.id} title={meetCli.title}>
        <p>
          Most Linux commands follow a simple pattern. You already saw this in
          the terminal lesson — here is a quick refresher before you start
          typing real file commands.
        </p>
        <CodeBlock
          code="command [options] [arguments]"
          language="text"
          title="structure"
        />
        <p>Example:</p>
        <CodeBlock code="ls -la" language="bash" title="bash" />
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              ls
            </code>{" "}
            → the command
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              -la
            </code>{" "}
            → options that change how the command behaves
          </li>
          <li>No argument in this example — it lists the current directory</li>
        </ul>
        <Callout title="Tip">
          <p>
            Linux becomes much easier when you practice commands instead of only
            reading about them.
          </p>
        </Callout>
      </LessonSection>

      <LessonSection id={whereAmI.id} title={whereAmI.title}>
        <p>
          Before you change anything, find out where you are. The{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            pwd
          </code>{" "}
          command prints the current working directory.
        </p>
        <CodeBlock code="pwd" language="bash" title="bash" />
        <p>A typical home directory looks like this:</p>
        <CodeBlock code="/home/learner" language="text" title="output" />
        <p>
          Think of it as asking the shell: &ldquo;Where am I right now?&rdquo;
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[{ command: "pwd", label: "Run pwd" }]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={listFiles.id} title={listFiles.title}>
        <p>
          Once you know where you are, list what is nearby with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls
          </code>
          .
        </p>
        <CodeBlock code="ls" language="bash" title="bash" />
        <p>
          By itself,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls
          </code>{" "}
          shows the names of files and directories in the current location.
        </p>
        <p>Options can change the output. A common beginner variant is:</p>
        <CodeBlock code="ls -la" language="bash" title="bash" />
        <p>
          The{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            -la
          </code>{" "}
          options ask for a longer listing that includes hidden entries and
          extra details. You do not need every{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls
          </code>{" "}
          option yet — just remember that options modify command behavior.
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[
            { command: "ls", label: "Run ls" },
            { command: "ls -la", label: "Run ls -la" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={moveAround.id} title={moveAround.title}>
        <p>
          Use{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cd
          </code>{" "}
          to change directories.
        </p>
        <CodeBlock code="cd Documents" language="bash" title="bash" />
        <CodeBlock code="cd .." language="bash" title="bash" />
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              cd Documents
            </code>{" "}
            → enter a directory
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              cd ..
            </code>{" "}
            → move to the parent directory
          </li>
          <li>
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              cd ~
            </code>{" "}
            → move to the user&apos;s home directory
          </li>
        </ul>
        <p>
          After each{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cd
          </code>
          , run{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            pwd
          </code>{" "}
          or{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls
          </code>{" "}
          to confirm where you landed.
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[
            { command: "cd Documents", label: "Run cd Documents" },
            { command: "pwd", label: "Run pwd" },
            { command: "cd ..", label: "Run cd .." },
            { command: "cd ~", label: "Run cd ~" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={createDirectory.id} title={createDirectory.title}>
        <p>
          Create a new directory with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            mkdir
          </code>
          .
        </p>
        <CodeBlock code="mkdir projects" language="bash" title="bash" />
        <p>
          After you create it,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            ls
          </code>{" "}
          should show the new folder alongside the others.
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[
            { command: "mkdir projects", label: "Run mkdir projects" },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={createFile.id} title={createFile.title}>
        <p>
          Create an empty file with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            touch
          </code>
          .
        </p>
        <CodeBlock code="touch notes.txt" language="bash" title="bash" />
        <p>
          Then list the directory again. You should see{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            notes.txt
          </code>{" "}
          in the output.
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs({ includeNotes: false })}
          suggestions={[
            { command: "touch notes.txt", label: "Run touch notes.txt" },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={readFile.id} title={readFile.title}>
        <p>
          Display a file&apos;s contents with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cat
          </code>
          .
        </p>
        <CodeBlock code="cat notes.txt" language="bash" title="bash" />
        <p>
          This simulator already includes a small{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            notes.txt
          </code>{" "}
          file with content so you can practice reading it:
        </p>
        <CodeBlock
          code={"notes.txt\n\nHello from Rean Linux."}
          language="text"
          title="file"
        />
        <p>
          Running{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cat notes.txt
          </code>{" "}
          should print:
        </p>
        <CodeBlock
          code="Hello from Rean Linux."
          language="text"
          title="output"
        />
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[
            { command: "cat notes.txt", label: "Run cat notes.txt" },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={copyMove.id} title={copyMove.title}>
        <p>
          Copy a file with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            cp
          </code>
          :
        </p>
        <CodeBlock
          code="cp notes.txt backup.txt"
          language="bash"
          title="bash"
        />
        <p>
          That leaves the original in place and creates a second file named{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            backup.txt
          </code>
          .
        </p>
        <p>
          Rename or move a file with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            mv
          </code>
          :
        </p>
        <CodeBlock
          code="mv backup.txt backup-notes.txt"
          language="bash"
          title="bash"
        />
        <p>
          After that command,{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            backup.txt
          </code>{" "}
          is gone and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            backup-notes.txt
          </code>{" "}
          appears instead. Same file contents — new name.
        </p>
        <TerminalSimulator
          filesystem={createLearnerHomeFs()}
          suggestions={[
            {
              command: "cp notes.txt backup.txt",
              label: "Run cp notes.txt backup.txt",
            },
            {
              command: "mv backup.txt backup-notes.txt",
              label: "Run mv backup.txt backup-notes.txt",
            },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={removeFiles.id} title={removeFiles.title}>
        <p>
          Remove a file with{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            rm
          </code>
          :
        </p>
        <CodeBlock code="rm backup-notes.txt" language="bash" title="bash" />
        <Callout title="Be careful with rm">
          <p>
            Unlike moving a file to a graphical trash folder,{" "}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
              rm
            </code>{" "}
            normally removes the file directly. Always make sure you are
            removing the correct file.
          </p>
        </Callout>
        <Callout title="Warning" className="mt-4">
          <p>
            Be careful with commands that modify or remove files. Double-check
            the path before running them.
          </p>
        </Callout>
        <TerminalSimulator
          filesystem={createLearnerHomeFs({
            includeNotes: true,
          })}
          suggestions={[
            {
              command: "cp notes.txt backup-notes.txt",
              label: "Run cp notes.txt backup-notes.txt",
            },
            {
              command: "rm backup-notes.txt",
              label: "Run rm backup-notes.txt",
            },
            { command: "ls", label: "Run ls" },
          ]}
          suggestionsLabel="Try it"
        />
      </LessonSection>

      <LessonSection id={practice.id} title={practice.title}>
        <FirstCommandsPractice />
      </LessonSection>

      <LessonSection id={summary.id} title={summary.title}>
        <p>In this lesson, you practiced the everyday file commands:</p>
        <LessonTable caption="Command reference for first Linux commands">
          <LessonTableHead>
            <LessonTableHeaderCell>Command</LessonTableHeaderCell>
            <LessonTableHeaderCell>What it does</LessonTableHeaderCell>
          </LessonTableHead>
          <LessonTableBody>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">pwd</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Show current directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">ls</code>
              </LessonTableCellPrimary>
              <LessonTableCell>List files and directories</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cd</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Change directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">mkdir</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Create directory</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">touch</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Create an empty file</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cat</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Display file contents</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">cp</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Copy files</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">mv</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Move or rename files</LessonTableCell>
            </LessonTableRow>
            <LessonTableRow>
              <LessonTableCellPrimary>
                <code className="font-mono">rm</code>
              </LessonTableCellPrimary>
              <LessonTableCell>Remove files</LessonTableCell>
            </LessonTableRow>
          </LessonTableBody>
        </LessonTable>
        <p>
          Next, you will learn how Linux organizes the filesystem — why paths
          like{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /home
          </code>{" "}
          and{" "}
          <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
            /etc
          </code>{" "}
          matter.
        </p>
      </LessonSection>
    </>
  );
}
