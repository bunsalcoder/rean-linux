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
        Getting started
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        Start with Users and Groups, then continue to File Permissions. Return
        here as more Essentials lessons ship. Finish Beginner Foundations first
        if you are still building terminal and filesystem confidence.
      </p>
    </aside>
  );
}
