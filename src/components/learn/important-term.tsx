import type { ReactNode } from "react";

type ImportantTermProps = {
  term: string;
  children: ReactNode;
};

export function ImportantTerm({ term, children }: ImportantTermProps) {
  return (
    <p className="border-border bg-muted/40 rounded-md border px-4 py-3 text-[0.9375rem] leading-relaxed sm:text-base">
      <strong className="text-foreground font-medium">{term}</strong>
      <span aria-hidden="true" className="text-muted-foreground mx-1.5">
        —
      </span>
      <span>{children}</span>
    </p>
  );
}
