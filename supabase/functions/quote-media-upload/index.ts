import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = [
  "https://heytlcleaning.com",
  "https://www.heytlcleaning.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const lovablePreview = /^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin);
  const allowed = allowedOrigins.includes(origin) || lovablePreview;
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://heytlcleaning.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
function secretKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) return JSON.parse(raw).default as string;
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  throw new Error("Supabase secret key unavailable");
}
const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
async function sha256(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function rateLimit(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
  const fingerprint = await sha256(`media:${ip}`);
  const { data, error } = await admin.rpc("consume_submission_attempt", {
    p_kind: "media",
    p_fingerprint_hash: fingerprint,
    p_limit: 30,
    p_window: "00:15:00",
  });
  if (error) throw error;
  return Boolean(data);
}
function safeName(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return cleaned.slice(0, 120) || "image";
}
const allowedMime = new Set(["image/jpeg","image/png","image/webp","image/heic","image/heif"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  try {
    if (!(await rateLimit(req))) return json(req, { error: "Too many uploads. Please wait and try again." }, 429);

    const form = await req.formData();
    const quoteId = String(form.get("quoteId") ?? "");
    const token = String(form.get("uploadToken") ?? "");
    const file = form.get("file");

    if (!/^[0-9a-f-]{36}$/i.test(quoteId) || token.length < 40 || !(file instanceof File)) {
      return json(req, { error: "Invalid upload request" }, 400);
    }
    if (file.size <= 0 || file.size > 8 * 1024 * 1024) {
      return json(req, { error: "Each file must be 8 MB or smaller" }, 400);
    }
    if (!allowedMime.has(file.type)) {
      return json(req, { error: "Unsupported image type" }, 400);
    }

    const { data: quote, error: quoteError } = await admin
      .from("quote_requests")
      .select("id, upload_token_hash, upload_token_expires_at")
      .eq("id", quoteId)
      .single();
    if (quoteError || !quote) return json(req, { error: "Quote request not found" }, 404);
    if (!quote.upload_token_expires_at || new Date(quote.upload_token_expires_at).getTime() < Date.now()) {
      return json(req, { error: "Upload authorization expired" }, 403);
    }

    const actualHash = await sha256(token);
    const storedHash = String(quote.upload_token_hash ?? "").replace(/^\\x/i, "");
    if (!storedHash || storedHash.toLowerCase() !== actualHash.toLowerCase()) {
      return json(req, { error: "Invalid upload authorization" }, 403);
    }

    const { data: existing, error: existingError } = await admin
      .from("quote_media")
      .select("size_bytes")
      .eq("quote_request_id", quoteId);
    if (existingError) throw existingError;
    if ((existing?.length ?? 0) >= 12) return json(req, { error: "Maximum 12 photos per quote request" }, 409);
    const total = (existing ?? []).reduce((sum, row) => sum + Number(row.size_bytes), 0);
    if (total + file.size > 50 * 1024 * 1024) return json(req, { error: "Photo total exceeds 50 MB" }, 409);

    const objectPath = `${quoteId}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from("quote-media").upload(objectPath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: media, error: mediaError } = await admin.from("quote_media").insert({
      quote_request_id: quoteId,
      object_path: objectPath,
      file_name: file.name.slice(0, 255),
      mime_type: file.type,
      size_bytes: file.size,
    }).select("id").single();

    if (mediaError) {
      await admin.storage.from("quote-media").remove([objectPath]);
      throw mediaError;
    }

    return json(req, { ok: true, id: media.id });
  } catch (error) {
    console.error("quote-media-upload", error);
    return json(req, { error: "Unable to upload photo" }, 500);
  }
});