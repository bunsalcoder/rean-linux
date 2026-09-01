import { cn } from "@/lib/utils";
import type { LessonSection } from "@/types/lesson";

type TableOfContentsProps = {
  sections: readonly LessonSection[];
  className?: string;
};

export function TableOfContents({ sections, className }: TableOfContentsProps) {
  return (
    <nav
      aria-labelledby="lesson-toc-heading"
      className={cn(className)}
    >
      <p
        id="lesson-toc-heading"
        className="text-foreground mb-3 text-sm font-medium"
      >
        On this page
      </p>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "text-muted-foreground hover:text-primary block text-sm leading-snug transition-colors",
                "focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type MobileTableOfContentsProps = TableOfContentsProps;

export function MobileTableOfContents({
  sections,
  className,
}: MobileTableOfContentsProps) {
  return (
    <nav
      aria-labelledby="lesson-toc-mobile-heading"
      className={cn(
        "border-border bg-muted/30 rounded-lg border p-4 lg:hidden",
        className,
      )}
    >
      <p
        id="lesson-toc-mobile-heading"
        className="text-foreground mb-3 text-sm font-medium"
      >
        On this page
      </p>
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cn(
                "border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/30 inline-block rounded-full border px-3 py-1 text-xs transition-colors",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
