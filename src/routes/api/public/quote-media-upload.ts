import { createHash, createHmac, timingSafeEqual } from "crypto";

import { createFileRoute } from "@tanstack/react-router";

const MAX_PHOTOS_PER_QUOTE = 12;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function expectedToken(quoteId: string) {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  return createHmac("sha256", secret).update(`quote-media:${quoteId}`).digest("hex");
}

function tokenMatches(quoteId: string, token: string) {
  const expected = expectedToken(quoteId);
  if (expected.length !== token.length) return false;
  const a = createHash("sha256").update(expected).digest();
  const b = createHash("sha256").update(token).digest();
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/quote-media-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ ok: false, error: "Invalid upload." }, { status: 400 });
        }

        const quoteId = String(form.get("quoteId") ?? "");
        const uploadToken = String(form.get("uploadToken") ?? "");
        const file = form.get("file");

        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quoteId) ||
          !/^[0-9a-f]{64}$/i.test(uploadToken) ||
          !tokenMatches(quoteId, uploadToken)
        ) {
          return Response.json({ ok: false, error: "Invalid upload token." }, { status: 401 });
        }

        if (!(file instanceof File) || file.size === 0) {
          return Response.json({ ok: false, error: "No file provided." }, { status: 400 });
        }
        if (file.size > MAX_PHOTO_BYTES) {
          return Response.json({ ok: false, error: "File is larger than 8 MB." }, { status: 400 });
        }
        const extension = ALLOWED_TYPES[file.type];
        if (!extension) {
          return Response.json({ ok: false, error: "Unsupported image type." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: quote } = await supabaseAdmin
          .from("quote_requests")
          .select("id")
          .eq("id", quoteId)
          .maybeSingle();
        if (!quote) {
          return Response.json({ ok: false, error: "Quote request not found." }, { status: 404 });
        }

        const { data: existing } = await supabaseAdmin
          .from("quote_media")
          .select("size_bytes")
          .eq("quote_request_id", quoteId);
        const items = existing ?? [];
        const totalBytes = items.reduce((sum, item) => sum + item.size_bytes, 0);
        if (items.length >= MAX_PHOTOS_PER_QUOTE || totalBytes + file.size > MAX_TOTAL_BYTES) {
          return Response.json(
            { ok: false, error: "Photo limit reached for this request." },
            { status: 400 },
          );
        }

        const objectPath = `${quoteId}/${crypto.randomUUID()}.${extension}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabaseAdmin.storage
          .from("quote-media")
          .upload(objectPath, buffer, { contentType: file.type });
        if (uploadError) {
          return Response.json({ ok: false, error: "Unable to store photo." }, { status: 500 });
        }

        const { data: row, error: insertError } = await supabaseAdmin
          .from("quote_media")
          .insert({
            quote_request_id: quoteId,
            object_path: objectPath,
            file_name: file.name.slice(0, 200),
            content_type: file.type,
            size_bytes: file.size,
          })
          .select("id")
          .single();
        if (insertError || !row) {
          await supabaseAdmin.storage.from("quote-media").remove([objectPath]);
          return Response.json({ ok: false, error: "Unable to record photo." }, { status: 500 });
        }

        return Response.json({ ok: true, id: row.id });
      },
    },
  },
});
