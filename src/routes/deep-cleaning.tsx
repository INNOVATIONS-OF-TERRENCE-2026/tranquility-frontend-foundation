import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";
import { ServiceDetail } from "@/components/site/ServiceDetail";

export const Route = createFileRoute("/deep-cleaning")({
  head: () =>
    seo({
      title: "Deep Cleaning in Dallas–Fort Worth — Tranquility Level Cleaning",
      description:
        "Detailed deep cleaning across DFW from $215. Build-up, edges, trim and the places routine cleaning passes over.",
      path: "/deep-cleaning",
    }),
  component: () => (
    <ServiceDetail
      serviceId="deep"
      eyebrow="Deep cleaning"
      intro="A thorough reset for homes that need more than upkeep — the right starting point before moving to a recurring schedule."
      bestFor={[
        "First-time cleans before starting recurring service",
        "Homes that haven't been professionally cleaned in a while",
        "Seasonal resets and pre- or post-event cleaning",
      ]}
      notes="If the home's condition is significantly heavier than typical, we may recommend a consultation so the estimate reflects the real work involved."
    />
  ),
});
