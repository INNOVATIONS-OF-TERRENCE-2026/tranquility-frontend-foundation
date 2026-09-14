import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  variant?: "light" | "soft" | "dark";
}

export function PageHero({ eyebrow, title, intro, children, variant = "soft" }: PageHeroProps) {
  const surface =
    variant === "dark"
      ? "brand-dark bg-night text-night-foreground"
      : variant === "light"
        ? "bg-background"
        : "bg-[radial-gradient(circle_at_82%_12%,color-mix(in_srgb,var(--brand-seaglass)_24%,transparent),transparent_32%),linear-gradient(145deg,var(--surface-canvas),var(--surface-mist))]";
  return (
    <section className={`relative overflow-hidden border-b border-border ${surface}`}>
      <div className="container-page relative py-14 md:py-20 lg:py-24">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl text-4xl leading-[1.04] text-ink md:text-6xl lg:text-[4.25rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {intro}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-[1.08] md:text-5xl">{title}</h2>
      {intro && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>
      )}
    </div>
  );
}
