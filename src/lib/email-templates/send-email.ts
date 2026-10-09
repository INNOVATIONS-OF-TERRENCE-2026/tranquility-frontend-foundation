import { createElement } from "react";
import { render } from "@react-email/render";
import { sendLovableEmail } from "@lovable.dev/email-js";

import { TEMPLATES } from "./registry";

export const SITE_NAME = "Tranquility Level Cleaning";
export const SENDER_DOMAIN = "notify.heytlcleaning.com";
export const FROM_DOMAIN = "heytlcleaning.com";

export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: { templateData?: Record<string, unknown>; idempotencyKey?: string } = {},
) {
  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`Unknown email template: ${templateName}`);

  const element = createElement(entry.component, options.templateData ?? {});
  const html = await render(element);
  const text = await render(element, { plainText: true });

  return sendLovableEmail(
    {
      to,
      from: { name: SITE_NAME, address: `noreply@${FROM_DOMAIN}` },
      sender_domain: SENDER_DOMAIN,
      subject: entry.subject,
      html,
      text,
      ...(options.idempotencyKey ? { idempotency_key: options.idempotencyKey } : {}),
    },
    { apiKey: process.env["LOVABLE_API_KEY"]! },
  );
}
