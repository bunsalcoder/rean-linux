export function BeginnerTip() {
  return (
    <aside
      aria-labelledby="beginner-tip-heading"
      className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
    >
      <h2
        id="beginner-tip-heading"
        className="font-heading text-base font-semibold tracking-tight sm:text-lg"
      >
        New to Linux? That&apos;s okay.
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        You don&apos;t need previous Linux experience to follow this path. Start
        from Lesson 01 and work through the lessons in order.
      </p>
    </aside>
  );
}
