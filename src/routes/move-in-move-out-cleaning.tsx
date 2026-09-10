import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { ServiceDetail } from "@/components/site/ServiceDetail";

export const Route = createFileRoute("/move-in-move-out-cleaning")({
  head: () =>
    seo({
      title: "Move-In / Move-Out Cleaning in DFW — Tranquility Level Cleaning",
      description:
        "Move-in and move-out cleaning across Dallas–Fort Worth from $235. A whole-home detail clean for empty spaces in transition.",
      path: "/move-in-move-out-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="move"
      eyebrow="Move-in / move-out"
      intro="For homes in transition — handing over keys, or walking into a space that should feel genuinely new on day one."
      bestFor={[
        "Renters and owners preparing to hand over a property",
        "New homeowners who want a clean slate before unpacking",
        "Property managers turning over a unit between residents",
      ]}
      notes="These cleans work best when the home is empty or nearly empty. Cabinet interiors, appliance interiors and other detail work can be added in the request flow."
    />
  ),
});
