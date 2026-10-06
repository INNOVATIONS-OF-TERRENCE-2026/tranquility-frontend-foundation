import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { invokePublicEdge } from "@/integrations/supabase/public-api";

const entrySchema = z.object({
  entrantName: z.string().trim().min(2).max(100),
  entrantEmail: z.string().trim().email().max(255),
  entrantPhone: z.string().trim().min(10).max(30),
  entryFor: z.enum(["self", "someone_else"]),
  nomineeName: z.string().trim().max(100).optional(),
  nomineeRelationship: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().regex(/^\d{5}$/),
  needCategory: z.enum([
    "postpartum",
    "mental_health_clutter",
    "recovery",
    "disability_support",
    "veteran_support",
    "other",
  ]),
  story: z.string().trim().min(20).max(2500),
  age18: z.literal(true),
  marketingEmailOptIn: z.boolean(),
  marketingSmsOptIn: z.boolean(),
  language: z.enum(["en", "es"]),
  website: z.string().max(0),
});

export type GiveawayStatus = {
  ok: true;
  month: string;
  deadline: string;
  rollover: boolean;
};

export type GiveawayEntryResponse = {
  ok: true;
  reference: string;
  giveawayMonth: string;
  deadline: string;
  rollover: boolean;
};

export const getGiveawayStatus = createServerFn({ method: "GET" }).handler(async () => {
  return invokePublicEdge<GiveawayStatus>("giveaway-api", { action: "status" });
});

export const submitGiveawayEntry = createServerFn({ method: "POST" })
  .validator((input) => entrySchema.parse(input))
  .handler(async ({ data }) => {
    return invokePublicEdge<GiveawayEntryResponse>("giveaway-api", {
      action: "enter",
      data,
    });
  });
