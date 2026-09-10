import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { ServiceDetail } from "@/components/site/ServiceDetail";

export const Route = createFileRoute("/residential-cleaning")({
  head: () =>
    seo({
      title: "Residential Standard Cleaning in DFW — Tranquility Level Cleaning",
      description:
        "Recurring residential house cleaning across Dallas–Fort Worth from $145. Weekly, bi-weekly and monthly service with savings up to 20%.",
      path: "/residential-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="standard"
      eyebrow="Residential cleaning"
      intro="Regular upkeep that keeps your home feeling settled — the service most households choose on a weekly, bi-weekly or monthly rhythm."
      bestFor={[
        "Homes that are already maintained and need consistent upkeep",
        "Busy households wanting a dependable rhythm",
        "Anyone who wants the home to feel reset without a full overhaul",
      ]}
      notes="Base pricing covers a standard average 1-bedroom, 1-full-bath home. Additional bedrooms, bathrooms, living spaces and extras are added individually so you only pay for the rooms you want serviced."
    />
  ),
});
