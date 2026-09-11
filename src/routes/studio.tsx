import { createFileRoute } from "@tanstack/react-router";

import { StudioShell } from "@/components/studio/StudioShell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/studio")({
  head: () =>
    seo({
      title: "TLC Studio | Personalized Cleaning Plan",
      description:
        "Use TLC Studio to build a personalized room-by-room cleaning plan, organize surfaces and household priorities, and create a Home Care Blueprint.",
      path: "/studio",
    }),
  component: StudioPage,
});

function StudioPage() {
  return <StudioShell />;
}
