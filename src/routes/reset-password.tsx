import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    ...seo({
      title: "Reset Password | Tranquility Level Cleaning",
      description: "Reset the secure owner password.",
      path: "/reset-password",
    }),
    meta: [
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Reset Password | Tranquility Level Cleaning" },
      { property: "og:description", content: "Reset the secure owner password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { text } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValid(window.location.hash.includes("type=recovery"));
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!valid) {
      setError(
        text({
          en: "This recovery link is invalid or expired.",
          es: "Este enlace de recuperación no es válido o ha vencido.",
        }),
      );
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else window.location.assign("/admin");
  }
  return (
    <main className="min-h-screen bg-sand px-4 py-16">
      <form
        onSubmit={submit}
        className="mx-auto max-w-md rounded-lg border bg-card p-7 shadow-lift"
      >
        <h1 className="text-3xl">
          {text({ en: "Set a new password", es: "Establece una nueva contraseña" })}
        </h1>
        <div className="mt-6">
          <Label htmlFor="new-password">
            {text({ en: "New password", es: "Nueva contraseña" })}
          </Label>
          <Input
            id="new-password"
            className="mt-2"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          {text({ en: "Update password", es: "Actualizar contraseña" })}
        </Button>
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
