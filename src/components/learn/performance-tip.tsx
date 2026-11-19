export function PerformanceTip() {
  return (
    <aside
      aria-labelledby="performance-tip-heading"
      className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
    >
      <h2
        id="performance-tip-heading"
        className="font-heading text-base font-semibold tracking-tight sm:text-lg"
      >
        Getting started
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        Start with Linux Performance Fundamentals, then work through CPU,
        memory, disk, processes, load, networking, logs, boot, applications, and
        optimization. Finish Linux Security and Hardening first if you are still
        building confidence with services, networking, and system evidence —
        Stage 05 focuses on reading metrics, finding bottlenecks, and verifying
        improvements in safe simulations.
      </p>
    </aside>
  );
}
