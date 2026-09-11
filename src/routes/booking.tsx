import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageHero } from "@/components/site/PageHero";
import { seo } from "@/lib/seo";

const searchSchema = z.object({
  service: z.enum(["standard", "deep", "move"]).optional(),
});

export const Route = createFileRoute("/booking")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Request Cleaning Service | Tranquility Level Cleaning",
      description:
        "Build your cleaning request in six clear steps. Choose service, frequency, room scope, approved add-ons, and preferred timing for service across Dallas-Fort Worth.",
      path: "/booking",
    }),
  component: BookingPage,
});

function BookingPage() {
  const search = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="Request service"
        title="Build a cleaning request that fits your home."
        intro="Choose the service, frequency, room scope, approved add-ons, and preferred timing. Your estimate stays visible before you open the final email request, and no payment details are collected."
      />
      <section className="brand-dark relative overflow-hidden bg-background py-12 text-foreground md:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_15%,rgba(226,194,122,0.12),transparent_23%),radial-gradient(circle_at_8%_80%,rgba(255,255,255,0.04),transparent_24%)]" aria-hidden="true" />
        <div className="container-page relative">
          <div className="luxury-panel rounded-3xl p-4 md:p-6 lg:p-8">
            <BookingFlow {...(search.service ? { initialService: search.service } : {})} />
          </div>
        </div>
      </section>
    </>
  );
}
