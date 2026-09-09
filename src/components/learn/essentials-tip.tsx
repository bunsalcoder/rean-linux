export function EssentialsTip() {
  return (
    <aside
      aria-labelledby="essentials-tip-heading"
      className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
    >
      <h2
        id="essentials-tip-heading"
        className="font-heading text-base font-semibold tracking-tight sm:text-lg"
      >
        Curriculum preview
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        This stage is ready to explore, but its lessons are still being built.
        Finish Beginner Foundations first, then return here as each Essentials
        lesson ships.
      </p>
    </aside>
  );
}
