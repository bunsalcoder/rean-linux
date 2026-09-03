type LessonHeaderProps = {
  levelNumber: string;
  level: string;
  title: string;
  description: string;
  readingTime: string;
};

export function LessonHeader({
  levelNumber,
  level,
  title,
  description,
  readingTime,
}: LessonHeaderProps) {
  return (
    <header className="border-border border-b pb-8 sm:pb-10">
      <dl className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs tracking-[0.14em] uppercase sm:tracking-[0.16em]">
        <div className="flex items-center gap-3">
          <dt className="sr-only">Level number</dt>
          <dd>Level {levelNumber}</dd>
        </div>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <div className="flex items-center gap-3">
          <dt className="sr-only">Difficulty</dt>
          <dd>{level}</dd>
        </div>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <div className="flex items-center gap-3">
          <dt className="sr-only">Estimated reading time</dt>
          <dd>{readingTime}</dd>
        </div>
      </dl>
      <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-pretty sm:mt-5 sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
    </header>
  );
}
