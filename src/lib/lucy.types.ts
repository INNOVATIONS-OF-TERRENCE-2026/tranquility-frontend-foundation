import { z } from "zod";

export const lucyLanguageSchema = z.enum(["en", "es"]);
export type LucyLanguage = z.infer<typeof lucyLanguageSchema>;

export const lucyActionTypeSchema = z.enum([
  "navigate",
  "start_booking",
  "start_quote",
  "contact",
  "call",
  "estimate",
  "check_service_area",
]);
export type LucyActionType = z.infer<typeof lucyActionTypeSchema>;

export const lucyActionSchema = z.object({
  type: lucyActionTypeSchema,
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().max(300).optional(),
});
export type LucyAction = z.infer<typeof lucyActionSchema>;

export const lucyChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1200),
});
export type LucyChatMessage = z.infer<typeof lucyChatMessageSchema>;

export const lucyEstimateSchema = z.object({
  service: z.string().trim().min(1).max(80),
  frequency: z.string().trim().min(1).max(80),
  total: z.number().nonnegative(),
  totalLabel: z.string().trim().min(1).max(80),
  lines: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        quantity: z.number().int().positive(),
        amount: z.number().nonnegative(),
        amountLabel: z.string().trim().min(1).max(80),
      }),
    )
    .max(24),
  reviewFlags: z.array(z.string().trim().min(1).max(300)).max(8),
});
export type LucyEstimate = z.infer<typeof lucyEstimateSchema>;

export const lucyStateSchema = z.object({
  service: z.enum(["standard", "deep", "move"]).optional(),
  frequency: z.enum(["onetime", "weekly", "biweekly", "monthly"]).optional(),
  bedrooms: z.number().int().min(1).max(20).optional(),
  fullBaths: z.number().int().min(1).max(20).optional(),
  halfBaths: z.number().int().min(0).max(10).optional(),
  sqft: z.number().int().min(100).max(25000).optional(),
  extras: z.array(z.string().trim().min(1).max(40)).max(16).default([]),
  city: z.string().trim().max(80).optional(),
  goal: z.string().trim().max(40).optional(),
  estimated: z.boolean().optional(),
  customReview: z.boolean().optional(),
});
export type LucyState = z.infer<typeof lucyStateSchema>;

export const lucyReplySchema = z.object({
  answer: z.string().trim().min(1).max(2400),
  intent: z.string().trim().min(1).max(80),
  confidence: z.enum(["high", "medium", "low"]),
  actions: z.array(lucyActionSchema).max(4),
  followUps: z.array(z.string().trim().min(1).max(120)).max(4),
  factSources: z.array(z.string().trim().min(1).max(120)).max(6),
  estimate: lucyEstimateSchema.optional(),
  state: lucyStateSchema.optional(),
});
export type LucyReply = z.infer<typeof lucyReplySchema>;

export const lucyPublicRequestSchema = z.object({
  sessionId: z.string().trim().min(8).max(100),
  language: lucyLanguageSchema,
  pathname: z.string().trim().min(1).max(240),
  question: z.string().trim().min(1).max(700),
  history: z.array(lucyChatMessageSchema).max(10),
  state: lucyStateSchema.optional(),
});
export type LucyPublicRequest = z.infer<typeof lucyPublicRequestSchema>;

export const lucyOwnerRequestSchema = z.object({
  language: lucyLanguageSchema,
  pathname: z.string().trim().min(1).max(240),
  question: z.string().trim().min(1).max(700),
  history: z.array(lucyChatMessageSchema).max(8),
});
export type LucyOwnerRequest = z.infer<typeof lucyOwnerRequestSchema>;
