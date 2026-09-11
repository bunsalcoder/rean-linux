import { Callout } from "@/components/learn/callout";
import { FilesystemExplorer } from "@/components/learn/filesystem-explorer";
import { FirstCommandsPractice } from "@/components/learn/first-commands-practice";
import { FilesystemPractice } from "@/components/learn/filesystem-practice";
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
import {
  listItemClassName,
  RichTextParagraph,
  RichTextSpan,
} from "@/components/learn/rich-text";
import {
  CompositionDiagram,
  StackDiagram,
  TreeDiagram,
} from "@/components/learn/stack-diagram";
import { FilePermissionsPractice } from "@/components/learn/file-permissions-practice";
import { TerminalSimulator } from "@/components/learn/terminal-simulator";
import { UsersAndGroupsPractice } from "@/components/learn/users-and-groups-practice";
import { CodeBlock } from "@/components/ui/code-block";
import {
  createFilesystemLessonFs,
  createLearnerHomeFs,
} from "@/lib/simulated-filesystem";
import type {
  Lesson,
  LessonBlock,
  LessonContentSection,
  LessonTerminalPreset,
} from "@/types/lesson";

function resolveTerminalFilesystem(
  preset: LessonTerminalPreset | undefined,
  includeNotes: boolean | undefined,
  cwd: string | undefined,
) {
  if (
    !preset ||
    preset === "simple" ||
    preset === "users-and-groups" ||
    preset === "file-permissions"
  ) {
    return undefined;
  }

  const base =
    preset === "filesystem-lesson"
      ? createFilesystemLessonFs()
      : createLearnerHomeFs({ includeNotes });

  if (cwd) {
    return { ...base, cwd };
  }

  return base;
}

function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "paragraph":
      return <RichTextParagraph text={block.text} />;
    case "note":
      return (
        <RichTextParagraph
          text={block.text}
          className="text-muted-foreground text-sm"
        />
      );
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      const variant = block.variant ?? "disc";
      return (
        <ListTag
          className={
            block.ordered
              ? "list-decimal space-y-2 pl-5"
              : listItemClassName(variant)
          }
        >
          {block.items.map((item) => (
            <li key={item}>
              <RichTextSpan text={item} />
            </li>
          ))}
        </ListTag>
      );
    }
    case "heading":
      return (
        <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
          <RichTextSpan text={block.text} codeStyle="plain" />
        </h3>
      );
    case "code":
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          title={block.title}
        />
      );
    case "callout":
      return (
        <Callout title={block.title}>
          <RichTextParagraph text={block.text} />
        </Callout>
      );
    case "table":
      return (
        <LessonTable caption={block.caption}>
          <LessonTableHead>
            {block.headers.map((header) => (
              <LessonTableHeaderCell key={header}>
                {header}
              </LessonTableHeaderCell>
            ))}
          </LessonTableHead>
          <LessonTableBody>
            {block.rows.map((row) => (
              <LessonTableRow key={row.join("|")}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <LessonTableCellPrimary key={`${cell}-primary`}>
                      <RichTextSpan text={cell} codeStyle="plain" />
                    </LessonTableCellPrimary>
                  ) : (
                    <LessonTableCell key={`${cell}-${cellIndex}`}>
                      <RichTextSpan text={cell} />
                    </LessonTableCell>
                  ),
                )}
              </LessonTableRow>
            ))}
          </LessonTableBody>
        </LessonTable>
      );
    case "definitions":
      return (
        <dl className="space-y-5">
          {block.items.map((item) => (
            <div key={item.term}>
              <dt className="text-foreground font-medium">{item.term}</dt>
              <dd className="mt-1">
                <RichTextSpan text={item.description} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "stack-diagram":
      return <StackDiagram layers={block.layers} ariaLabel={block.ariaLabel} />;
    case "composition-diagram":
      return (
        <CompositionDiagram
          components={block.components}
          result={block.result}
          ariaLabel={block.ariaLabel}
        />
      );
    case "tree-diagram":
      return <TreeDiagram root={block.root} ariaLabel={block.ariaLabel} />;
    case "terminal":
      return (
        <TerminalSimulator
          identity={block.preset === "users-and-groups"}
          permissions={block.preset === "file-permissions"}
          filesystem={resolveTerminalFilesystem(
            block.preset,
            block.includeNotes,
            block.cwd,
          )}
          suggestions={block.suggestions}
          suggestionsLabel={block.suggestionsLabel}
        />
      );
    case "filesystem-explorer":
      return <FilesystemExplorer filesystem={createFilesystemLessonFs()} />;
    case "exercise":
      if (block.id === "first-commands-practice") {
        return <FirstCommandsPractice />;
      }
      if (block.id === "users-and-groups-practice") {
        return <UsersAndGroupsPractice />;
      }
      if (block.id === "file-permissions-practice") {
        return <FilePermissionsPractice />;
      }
      return <FilesystemPractice />;
    case "panel":
      return (
        <div className="border-border bg-muted/30 space-y-4 rounded-lg border p-5 sm:p-6">
          <h3 className="text-foreground font-heading text-lg font-semibold tracking-tight">
            {block.title}
          </h3>
          {block.blocks.map((child, index) => (
            <LessonBlockView key={`${child.type}-${index}`} block={child} />
          ))}
        </div>
      );
    case "compare-grid":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {block.columns.map((column) => (
            <div key={column.title} className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                {column.title}
              </p>
              {column.blocks.map((child, index) =>
                child.type === "tree-diagram" ? (
                  <TreeDiagram
                    key={`${child.type}-${index}`}
                    root={child.root}
                    ariaLabel={child.ariaLabel}
                    className="my-0"
                  />
                ) : (
                  <LessonBlockView
                    key={`${child.type}-${index}`}
                    block={child}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

function ContentSectionView({ section }: { section: LessonContentSection }) {
  return (
    <LessonSection id={section.id} title={section.title}>
      {section.blocks.map((block, index) => (
        <LessonBlockView
          key={`${section.id}-${block.type}-${index}`}
          block={block}
        />
      ))}
    </LessonSection>
  );
}

type LessonContentProps = {
  lesson: Lesson;
};

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <>
      {lesson.intro && lesson.intro.length > 0 ? (
        <section className="space-y-4" aria-label="Lesson introduction">
          {lesson.intro.map((block, index) => (
            <LessonBlockView
              key={`intro-${block.type}-${index}`}
              block={block}
            />
          ))}
        </section>
      ) : null}
      {lesson.sections.map((section) => (
        <ContentSectionView key={section.id} section={section} />
      ))}
    </>
  );
}
