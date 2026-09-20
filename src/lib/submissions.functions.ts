import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { invokePublicEdge } from "@/integrations/supabase/public-api";

const languageSchema = z.enum(["en", "es"]);
const nameSchema = z.string().trim().min(2).max(100);
const emailSchema = z.string().trim().email().max(255);
const phoneSchema = z.string().trim().min(10).max(30);
const shortText = z.string().trim().max(200);
const longText = z.string().trim().max(1200);

const contactSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  serviceType: z.enum(["standard", "deep", "move", "commercial", "quote", "other"]),
  preferredDate: z.string().date().optional(),
  notes: longText.min(10),
  language: languageSchema,
  website: z.string().max(0),
});

const careerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: shortText.min(2),
  reliableTransportation: z.boolean(),
  experience: longText.min(10),
  availability: longText.min(3),
  additionalInformation: longText.optional(),
  language: languageSchema,
  website: z.string().max(0),
});

const quoteSchema = z.object({
  propertyType: z.enum(["residential", "commercial", "specialty"]),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  city: shortText.min(2),
  approximateSize: shortText.optional(),
  scope: longText.min(10),
  desiredTiming: shortText.optional(),
  contactPreference: z.enum(["phone", "email", "text", "video"]),
  notes: longText.optional(),
  language: languageSchema,
  website: z.string().max(0),
});

type BasicSubmissionResponse = {
  ok: true;
  reference: string;
};

type QuoteSubmissionResponse = BasicSubmissionResponse & {
  id: string;
  uploadToken: string;
};

export const submitContactInquiry = createServerFn({ method: "POST" })
  .validator((input) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    return invokePublicEdge<BasicSubmissionResponse>("public-submissions", {
      kind: "contact",
      data,
    });
  });

export const submitCareerApplication = createServerFn({ method: "POST" })
  .validator((input) => careerSchema.parse(input))
  .handler(async ({ data }) => {
    return invokePublicEdge<BasicSubmissionResponse>("public-submissions", {
      kind: "career",
      data,
    });
  });

export const submitQuoteRequest = createServerFn({ method: "POST" })
  .validator((input) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    return invokePublicEdge<QuoteSubmissionResponse>("public-submissions", {
      kind: "quote",
      data,
    });
  });
