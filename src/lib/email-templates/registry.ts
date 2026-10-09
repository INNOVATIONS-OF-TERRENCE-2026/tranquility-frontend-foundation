import type { ComponentType } from "react";

export interface TemplateEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  subject: string;
  displayName?: string;
  previewData?: Record<string, unknown>;
  to?: string;
}

import { template as bookingConfirmation } from "./booking-confirmation";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "booking-confirmation": bookingConfirmation,
};
