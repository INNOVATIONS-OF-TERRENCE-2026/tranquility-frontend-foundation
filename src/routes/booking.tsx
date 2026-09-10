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
        title="Build a cleaning request that fits your home"
        intro="Choose the service, frequency, rooms, approved add-ons, and preferred timing. You will see the estimate before opening an email request, and no payment details are collected."
      />
      <section className="section">
        <div className="container-page">
          <BookingFlow initialService={search.service} />
        </div>
      </section>
    </>
  );
}
