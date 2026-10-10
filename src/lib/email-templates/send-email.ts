import { createElement } from "react";
import { render } from "@react-email/render";

import { TEMPLATES } from "./registry";

export const SITE_NAME = "Tranquility Level Cleaning";
export const FROM_ADDRESS = `${SITE_NAME} <notifications@heytlcleaning.com>`;

/**
 * Sends a template email through Resend from the verified heytlcleaning.com
 * domain. Requires RESEND_API_KEY in this app's server secrets.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: {
    templateData?: Record<string, unknown>;
    idempotencyKey?: string;
    replyTo?: string;
    subject?: string;
  } = {},
) {
  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`Unknown email template: ${templateName}`);
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured for this app.");

  const element = createElement(entry.component, options.templateData ?? {});
  const html = await render(element);
  const text = await render(element, { plainText: true });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject: options.subject ?? entry.subject,
      html,
      text,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend request failed [${response.status}]: ${await response.text()}`);
  }
  return response.json();
}
