import { Link } from "@tanstack/react-router";

import { business } from "@/config/business";
import { Button } from "@/components/ui/button";

export function CTABand({
  title = "Ready for a calmer home?",
  intro = "Tell us about your space and we'll take it from there.",
}: {
  title?: string;
  intro?: string;
}) {
  return (
    <section className="bg-ink text-background">
      <div className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl text-background md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-background/75">{intro}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link to="/booking">Request Service</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background"
          >
            <Link to="/quote">Get a Custom Quote</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-background hover:bg-background/10 hover:text-background"
          >
            <a href={business.phoneHref}>Call {business.phoneDisplay}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
