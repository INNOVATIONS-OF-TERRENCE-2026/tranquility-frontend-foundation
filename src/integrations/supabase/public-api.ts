const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || process.env["SUPABASE_URL"] || "";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env["SUPABASE_PUBLISHABLE_KEY"] ||
  "";

function requireConfig() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase public configuration is unavailable.");
  }
}

export async function invokePublicEdge<TResponse>(
  functionName: string,
  body: unknown,
): Promise<TResponse> {
  requireConfig();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & TResponse;

  if (!response.ok) {
    throw new Error(payload.error || `Backend request failed with status ${response.status}.`);
  }

  return payload;
}

export async function uploadQuotePhoto(input: {
  quoteId: string;
  uploadToken: string;
  file: File;
}) {
  requireConfig();
  const form = new FormData();
  form.set("quoteId", input.quoteId);
  form.set("uploadToken", input.uploadToken);

  const extension = input.file.name.split(".").pop()?.toLowerCase();
  const inferredType =
    extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "heic"
            ? "image/heic"
            : extension === "heif"
              ? "image/heif"
              : "";

  const uploadFile =
    input.file.type || !inferredType
      ? input.file
      : new File([input.file], input.file.name, {
          type: inferredType,
          lastModified: input.file.lastModified,
        });

  form.set("file", uploadFile);

  const response = await fetch(`${SUPABASE_URL}/functions/v1/quote-media-upload`, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    body: form,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "Unable to upload photo.");
  }

  return payload;
}
