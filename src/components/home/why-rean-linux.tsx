import { Container } from "@/components/layout/container";
import {
  whyReanLinuxFeatures,
  type WhyReanLinuxFeature,
} from "@/config/why-rean-linux";
import { cn } from "@/lib/utils";

function featureNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function WhyReanLinux() {
  return (
    <section
      aria-labelledby="why-rean-linux-heading"
      className="relative overflow-hidden border-t"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_50%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_50%,transparent)_1px,transparent_1px)] mask-[linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)] bg-[size:2.5rem_2.5rem]"
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] sm:tracking-[0.16em]">
            <span className="text-primary" aria-hidden="true">
              ${" "}
            </span>
            WHY REAN LINUX
          </p>
          <h2
            id="why-rean-linux-heading"
            className="font-heading mt-5 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl"
          >
            Learn Linux by understanding it, not memorizing it.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Clear explanations, practical commands, and a structured path help
            you build Linux skills that you can actually use.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-2">
          {whyReanLinuxFeatures.map((feature, index) => (
            <li key={feature.label} className="min-w-0">
              <FeatureBlock feature={feature} index={index} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FeatureBlock({
  feature,
  index,
}: {
  feature: WhyReanLinuxFeature;
  index: number;
}) {
  const Icon = feature.icon;
  const number = featureNumber(index);
  const titleId = `why-feature-${feature.label}-title`;
  const descId = `why-feature-${feature.label}-desc`;

  return (
    <article
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={cn(
        "group/feature bg-card relative flex h-full min-w-0 flex-col rounded-lg border p-5 sm:p-6",
        "transition-[border-color,background-color,box-shadow] duration-200",
        "hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm",
      )}
    >
      <div
        aria-hidden="true"
        className="border-primary/0 group-hover/feature:border-primary/20 pointer-events-none absolute inset-x-0 top-0 h-px border-t transition-colors duration-200"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {number}
          </span>
          <span className="text-muted-foreground font-mono text-[0.65rem] tracking-wide uppercase">
            <span className="text-primary/70" aria-hidden="true">
              #{" "}
            </span>
            {feature.label}
          </span>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md border",
            "transition-[border-color,background-color,color,transform] duration-200",
            "group-hover/feature:border-primary/30 group-hover/feature:bg-primary/10 group-hover/feature:text-primary",
            "group-hover/feature:scale-105",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <h3
        id={titleId}
        className="font-heading mt-5 text-lg leading-snug font-semibold"
      >
        {feature.title}
      </h3>
      <p
        id={descId}
        className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-[0.9375rem]"
      >
        {feature.description}
      </p>
    </article>
  );
}
