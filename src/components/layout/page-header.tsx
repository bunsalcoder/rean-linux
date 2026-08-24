type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
        {description}
      </p>
    </header>
  );
}
