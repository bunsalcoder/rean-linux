import { Clock } from "lucide-react";

type LessonHeaderProps = {
  category: string;
  title: string;
  description: string;
  level: string;
  readingTime: string;
};

export function LessonHeader({
  category,
  title,
  description,
  level,
  readingTime,
}: LessonHeaderProps) {
  return (
    <header className="border-border border-b pb-8 sm:pb-10">
      <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase sm:tracking-[0.16em]">
        {category}
      </p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
      <dl className="text-muted-foreground mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className="text-foreground font-medium">Level</dt>
          <dd>{level}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Estimated reading time</dt>
          <dd className="flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5 shrink-0" />
            <span>{readingTime}</span>
          </dd>
        </div>
      </dl>
    </header>
  );
}
