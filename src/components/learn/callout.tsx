import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CalloutProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Callout({ title = "Tip", children, className }: CalloutProps) {
  return (
    <aside
      className={cn(
        "border-border bg-muted/40 rounded-lg border px-4 py-3.5 sm:px-5 sm:py-4",
        className,
      )}
    >
      <p className="text-foreground font-mono text-xs font-medium tracking-[0.12em] uppercase">
        {title}
      </p>
      <div className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed sm:text-base sm:leading-7">
        {children}
      </div>
    </aside>
  );
}
