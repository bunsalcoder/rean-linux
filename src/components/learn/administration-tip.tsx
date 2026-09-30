export function AdministrationTip() {
  return (
    <aside
      aria-labelledby="administration-tip-heading"
      className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
    >
      <h2
        id="administration-tip-heading"
        className="font-heading text-base font-semibold tracking-tight sm:text-lg"
      >
        Coming soon
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        This stage curriculum is planned and ready to preview. Lessons will
        unlock as they ship. Finish Linux Essentials first if you are still
        building confidence with users, permissions, processes, and the shell.
      </p>
    </aside>
  );
}
