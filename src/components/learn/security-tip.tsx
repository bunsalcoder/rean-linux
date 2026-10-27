export function SecurityTip() {
  return (
    <aside
      aria-labelledby="security-tip-heading"
      className="border-border bg-muted/40 mt-8 rounded-lg border p-5 sm:mt-10 sm:p-6"
    >
      <h2
        id="security-tip-heading"
        className="font-heading text-base font-semibold tracking-tight sm:text-lg"
      >
        Getting started
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-[0.9375rem]">
        Start with Linux Security Fundamentals when that lesson ships, then
        continue through access control, privileges, hardening, auditing, and
        incident response. Finish Linux Administration first if you are still
        building confidence with services, networking, SSH, and firewalls —
        Stage 04 focuses on security decisions rather than repeating basic
        administration commands.
      </p>
    </aside>
  );
}
