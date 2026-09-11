import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="brand-dark relative overflow-hidden border-b border-gold/20 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_10%,rgba(226,194,122,0.16),transparent_28%),radial-gradient(circle_at_15%_90%,rgba(255,255,255,0.06),transparent_30%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px gold-rule opacity-80" aria-hidden="true" />
      <div className="container-page relative py-16 md:py-24 lg:py-28">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl text-4xl leading-[1.03] text-ink md:text-6xl lg:text-[4.4rem]">
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
      {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}
