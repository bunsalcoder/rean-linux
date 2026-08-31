type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      {eyebrow ? (
        <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
          <span className="text-primary" aria-hidden="true">
            ${" "}
          </span>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-pretty sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
    </header>
  );
}
