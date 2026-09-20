export async function uploadQuotePhoto(input: {
  quoteId: string;
  uploadToken: string;
  file: File;
}) {
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

  const response = await fetch("/api/public/quote-media-upload", {
    method: "POST",
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
