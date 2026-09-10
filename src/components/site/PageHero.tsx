import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}

export function PageHero({ eyebrow, title, intro, children }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-sand">
      <div className="container-page py-14 md:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] md:text-5xl lg:text-[3.4rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
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
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-tight md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}
