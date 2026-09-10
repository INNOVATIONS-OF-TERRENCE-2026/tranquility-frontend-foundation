import { createFileRoute } from "@tanstack/react-router";

import { StudioShell } from "@/components/studio/StudioShell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/studio")({
  head: () =>
    seo({
      title: "Tranquility Studio | Personalized Cleaning Plan",
      description:
        "Build a personalized room-by-room cleaning preference plan, organize surfaces and household priorities, and create a Tranquility Home Care Blueprint.",
      path: "/studio",
    }),
  component: StudioPage,
});

function StudioPage() {
  return <StudioShell />;
}
