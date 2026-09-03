import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  language?: string;
  title?: string;
  className?: string;
};

export function CodeBlock({
  code,
  language,
  title,
  className,
}: CodeBlockProps) {
  const label = title ?? language;

  return (
    <figure
      className={cn(
        "border-border bg-code text-code-foreground overflow-hidden rounded-lg border",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b px-3 py-1.5">
        <span className="text-muted-foreground font-mono text-xs">
          {label ?? "code"}
        </span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="bg-code m-0 overflow-x-auto rounded-none border-0 p-4">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
