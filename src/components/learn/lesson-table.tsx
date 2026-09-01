import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LessonTableProps = {
  caption: string;
  children: ReactNode;
  className?: string;
};

export function LessonTable({
  caption,
  children,
  className,
}: LessonTableProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 -mx-1 overflow-x-auto rounded-lg border px-1",
        className,
      )}
    >
      <table className="text-foreground w-full min-w-[32rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function LessonTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-border bg-muted/50 border-b">
      <tr>{children}</tr>
    </thead>
  );
}

export function LessonTableHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="text-foreground px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
    >
      {children}
    </th>
  );
}

export function LessonTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-border divide-y">{children}</tbody>;
}

export function LessonTableRow({ children }: { children: ReactNode }) {
  return <tr className="bg-background/60">{children}</tr>;
}

export function LessonTableCell({ children }: { children: ReactNode }) {
  return (
    <td className="text-muted-foreground px-4 py-3 align-top">{children}</td>
  );
}

export function LessonTableCellPrimary({ children }: { children: ReactNode }) {
  return (
    <th
      scope="row"
      className="text-foreground px-4 py-3 text-left align-top font-medium"
    >
      {children}
    </th>
  );
}
