import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Home as HomeIcon,
  MapPin,
  PackageOpen,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { uploadedBrandHero } from "@/assets/uploadedImages";
import { Button } from "@/components/ui/button";
import { business, cities } from "@/config/business";
import { frequencies, money, services, servicePrice } from "@/config/pricing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Tranquility Level Cleaning | Premium Cleaning in Dallas-Fort Worth",
      description:
        "A cleaner space. A brighter you. Premium residential, deep, move-in, move-out, and commercial cleaning across Dallas-Fort Worth.",
      path: "/",
    }),
  component: Home,
});

const heroServices = [
  {
    icon: HomeIcon,
    label: "Residential",
    note: "Clean homes. Brighter days.",
    to: "/residential-cleaning" as const,
  },
  {
    icon: Building2,
    label: "Commercial",
    note: "Clean workspaces. Higher productivity.",
    to: "/commercial-cleaning" as const,
  },
  {
    icon: PackageOpen,
    label: "Move-In / Move-Out",
    note: "Fresh starts. Done right.",
    to: "/move-in-move-out-cleaning" as const,
  },
  {
    icon: Sparkles,
    label: "Custom Care",
    note: "Tailored to your lifestyle.",
    to: "/studio" as const,
  },
];

function Home() {
  return (
    <>
      <section className="brand-dark relative overflow-hidden bg-night text-night-foreground">
        <div className="relative min-h-[35rem] overflow-hidden md:min-h-[39rem] lg:min-h-[31rem] xl:min-h-[34rem]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--night)_0%,color-mix(in_srgb,var(--night)_96%,transparent)_35%,color-mix(in_srgb,var(--night)_50%,transparent)_58%,transparent_82%)]" aria-hidden="true" />

          <div className="absolute inset-y-0 left-[34%] right-0 overflow-hidden" aria-hidden="true">
            <img
              src={uploadedBrandHero}
              alt=""
              className="absolute right-0 top-[-22%] h-[145%] w-auto max-w-none object-cover object-right"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--night)_52%,transparent)_0%,transparent_22%,transparent_72%,color-mix(in_srgb,var(--night)_60%,transparent)_100%)]" />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,color-mix(in_srgb,var(--gold)_16%,transparent),transparent_24%)]" aria-hidden="true" />

          <div className="container-page relative z-10 flex min-h-[35rem] items-center pb-12 pt-28 md:min-h-[39rem] md:pb-16 md:pt-32 lg:min-h-[31rem] lg:pb-12 lg:pt-24 xl:min-h-[34rem] xl:pt-28">
            <div className="max-w-[44rem] lg:w-[44%]">
              <div className="mb-5 h-px w-72 max-w-full bg-[linear-gradient(90deg,var(--gold),transparent)]" aria-hidden="true" />
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-gold-soft sm:text-xs">
                Premium Cleaning Services
              </p>

              <h1 className="mt-5 font-display text-[3.35rem] font-medium leading-[0.9] tracking-[-0.045em] text-white sm:text-6xl md:text-[4.7rem] lg:text-[4.8rem] xl:text-[5.25rem]">
                A Cleaner Space.
                <span className="gold-text block">A Brighter You.</span>
              </h1>

              <p className="mt-5 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-xs">
                Residential <span className="mx-2 text-gold/65">|</span> Commercial <span className="mx-2 text-gold/65">|</span> Move-In / Move-Out <span className="mx-2 text-gold/65">|</span> Custom Care
              </p>

              <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 md:text-[0.98rem] md:leading-7">
                Fully customizable cleaning solutions designed around your space, your lifestyle, and your standards.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="min-w-52 justify-between px-7">
                  <Link to="/booking">
                    Book Your Clean
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-w-60 justify-between border-gold/60 bg-night/45 px-7 text-white backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:text-white"
                >
                  <Link to="/studio">
                    TLC Studio
                    <SlidersHorizontal className="size-4 text-gold-soft" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 border-y border-gold/30 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--night)_98%,black),color-mix(in_srgb,var(--navy-soft)_88%,black),color-mix(in_srgb,var(--night)_98%,black))]">
          <div className="container-page grid lg:grid-cols-[repeat(4,minmax(0,1fr))_1.55fr_1fr]">
            {heroServices.map(({ icon: Icon, label, note, to }, index) => (
              <Link
                key={label}
                to={to}
                className={`group flex min-h-32 items-center gap-4 border-gold/20 px-4 py-5 transition-colors hover:bg-white/[0.035] ${index < heroServices.length - 1 ? "border-b lg:border-b-0 lg:border-r" : "border-b lg:border-b-0 lg:border-r"}`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center text-gold-soft">
                  <Icon className="size-8 stroke-[1.35]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[0.75rem] font-bold uppercase tracking-[0.12em] text-white">{label}</span>
                  <span className="mt-2 block max-w-36 text-[0.58rem] font-medium uppercase leading-4 tracking-[0.16em] text-white/55">{note}</span>
                </span>
              </Link>
            ))}

            <div className="hidden min-h-32 items-center justify-center border-r border-gold/20 px-6 text-center lg:flex">
              <div>
                <p className="font-display text-[2.1rem] italic leading-none text-gold-soft">More Than Clean.</p>
                <div className="mx-auto mt-3 h-px w-44 bg-[linear-gradient(90deg,transparent,var(--gold),transparent)]" aria-hidden="true" />
                <p className="mt-3 text-[0.58rem] font-semibold uppercase tracking-[0.34em] text-white/55">It&apos;s a feeling.</p>
              </div>
            </div>

            <Link to="/service-area" className="hidden min-h-32 items-center justify-center gap-3 px-5 text-center transition-colors hover:bg-white/[0.035] lg:flex">
              <MapPin className="size-6 shrink-0 text-gold-soft" aria-hidden="true" />
              <span>
                <span className="block text-[0.67rem] font-semibold uppercase tracking-[0.23em] text-white">Dallas - Fort Worth</span>
                <span className="mt-2 block text-[0.54rem] uppercase tracking-[0.15em] text-white/45">Serving homes and businesses</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section id="pricing" className="section bg-background">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow">Clear Pricing</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Premium care with a visible starting point.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              Residential pricing begins with a standard average 1-bedroom, 1-full-bath home. Recurring service lowers the service subtotal while approved add-ons remain visible.
            </p>
            <Button asChild className="mt-7">
              <Link to="/services">Explore Services <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-moss">{service.name}</p>
                <p className="mt-5 font-display text-5xl text-ink">{money(service.basePrice)}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">One-time starting price for the standard base scope.</p>
                <div className="mt-6 space-y-2 border-t border-border pt-5">
                  {frequencies.filter((frequency) => frequency.id !== "onetime").map((frequency) => (
                    <div key={frequency.id} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">{frequency.name}</span>
                      <span className="font-semibold tabular-nums text-ink">{money(servicePrice(service.id, frequency.id))}</span>
                    </div>
                  ))}
                </div>
                <Link to="/booking" search={{ service: service.id }} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-moss hover:underline">
                  Request this clean <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark section bg-background text-foreground">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">TLC Studio</p>
            <h2 className="mt-4 text-4xl text-ink md:text-6xl">Your space. Your standards. Your clean.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              Build the cleaning experience room by room, set priorities, flag protected areas, document surfaces and household preferences, and carry approved service choices into your request.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/studio">Open TLC Studio</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-gold/45 text-foreground hover:bg-gold/10"><Link to="/quote">Custom Quote</Link></Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Room-by-room scope", "Cleaning priorities", "Surface preferences", "Protected areas", "Household profile", "Home Care Blueprint"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-gold/20 bg-card/70 p-5 shadow-soft">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-moss">0{index + 1}</span>
                <p className="mt-3 font-display text-2xl text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-sand">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow">Service Area</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Dallas - Fort Worth and surrounding communities.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              Search the full service-area tool to explore core cities, mileage radius options, and the interactive map.
            </p>
            <Button asChild variant="outline" className="mt-7"><Link to="/service-area">Open Service Area Map</Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cities.slice(0, 12).map((city) => (
              <div key={city} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-soft">
                <MapPin className="size-4 text-moss" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark bg-night py-12 text-night-foreground">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.25em] text-gold-soft">Come Home to Tranquility</p>
            <h2 className="mt-3 text-3xl text-white md:text-4xl">Ready for a cleaner space and a calmer day?</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/booking">Book Your Clean</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-gold/45 text-white hover:bg-gold/10 hover:text-white"><a href={business.phoneHref}>Call {business.phoneDisplay}</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}
