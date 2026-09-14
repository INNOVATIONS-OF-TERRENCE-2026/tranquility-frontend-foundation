import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Cleaning Services | Tranquility Level Cleaning" },
      {
        name: "description",
        content: "Explore residential and commercial cleaning services across Dallas-Fort Worth.",
      },
      { property: "og:title", content: "Cleaning Services | Tranquility Level Cleaning" },
      {
        property: "og:description",
        content: "Explore residential and commercial cleaning services across Dallas-Fort Worth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/services" });
  },
  component: () => null,
});
