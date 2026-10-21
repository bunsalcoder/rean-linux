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
        Getting started
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        Start with System Services and systemd, then continue through logs,
        disks, networking, and the remaining administration topics. Storage and
        Filesystems stays on the roadmap as a preview. Finish Linux Essentials
        first if you are still building confidence with users, permissions,
        processes, and the shell.
      </p>
    </aside>
  );
}
