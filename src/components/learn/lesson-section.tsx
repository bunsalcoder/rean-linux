import type { ReactNode } from "react";

type LessonSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function LessonSection({ id, title, children }: LessonSectionProps) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2
        id={id}
        className="font-heading text-xl font-semibold tracking-tight text-pretty sm:text-2xl"
      >
        {title}
      </h2>
      <div className="text-muted-foreground mt-4 space-y-4 text-[0.9375rem] leading-relaxed sm:text-base sm:leading-7">
        {children}
      </div>
    </section>
  );
}
