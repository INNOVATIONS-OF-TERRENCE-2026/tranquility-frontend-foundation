import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bootstrapAdmin } from "@/lib/admin.functions";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    ...seo({
      title: "Owner Sign In | Tranquility Level Cleaning",
      description: "Secure owner access for Tranquility Level Cleaning.",
      path: "/auth",
    }),
    meta: [
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Owner Sign In | Tranquility Level Cleaning" },
      {
        property: "og:description",
        content: "Secure owner access for Tranquility Level Cleaning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { text } = useLanguage();
  const navigate = useNavigate();
  const initializeAdmin = useServerFn(bootstrapAdmin);
  const [email, setEmail] = useState("tlcllc26@gmail.com");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function finishSignIn() {
    await initializeAdmin();
    window.location.assign("/admin");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (email.trim().toLowerCase() !== "tlcllc26@gmail.com")
        throw new Error("This email is not authorized for owner access.");
      if (mode === "setup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (authError) throw authError;
        if (!data.session)
          setMessage(
            text({
              en: "Check the owner email to confirm the account, then sign in.",
              es: "Revisa el correo de la propietaria para confirmar la cuenta y luego inicia sesión.",
            }),
          );
        else await finishSignIn();
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        await finishSignIn();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) setError(result.error.message);
    else if (!result.redirected) await finishSignIn();
  }

  async function resetPassword() {
    setError("");
    setMessage("");
    if (email.trim().toLowerCase() !== "tlcllc26@gmail.com") {
      setError("Enter the authorized owner email.");
      return;
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) setError(resetError.message);
    else
      setMessage(
        text({
          en: "Password reset instructions were sent if the account exists.",
          es: "Se enviaron instrucciones para restablecer la contraseña si la cuenta existe.",
        }),
      );
  }

  return (
    <main className="min-h-screen bg-sand px-4 py-12">
      <div className="mx-auto max-w-md rounded-lg border border-gold/25 bg-card p-6 shadow-lift sm:p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-7 text-center text-3xl">
          {text({ en: "Owner access", es: "Acceso de propietaria" })}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {text({
            en: "Secure access to booking requests and leads.",
            es: "Acceso seguro a solicitudes de reserva y prospectos.",
          })}
        </p>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div>
            <Label htmlFor="owner-email">{text({ en: "Email", es: "Correo electrónico" })}</Label>
            <Input
              id="owner-email"
              className="mt-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <Label htmlFor="owner-password">{text({ en: "Password", es: "Contraseña" })}</Label>
            <Input
              id="owner-password"
              className="mt-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "setup" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={busy}>
            {busy
              ? text({ en: "Please wait…", es: "Espera…" })
              : mode === "setup"
                ? text({ en: "Create owner account", es: "Crear cuenta de propietaria" })
                : text({ en: "Sign in", es: "Iniciar sesión" })}
          </Button>
        </form>
        <Button type="button" variant="outline" className="mt-3 w-full" onClick={googleSignIn}>
          {text({ en: "Continue with Google", es: "Continuar con Google" })}
        </Button>
        <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs">
          <button
            type="button"
            className="text-moss underline"
            onClick={() => setMode(mode === "signin" ? "setup" : "signin")}
          >
            {mode === "signin"
              ? text({ en: "First-time setup", es: "Configuración inicial" })
              : text({ en: "Back to sign in", es: "Volver a iniciar sesión" })}
          </button>
          <button type="button" className="text-moss underline" onClick={resetPassword}>
            {text({ en: "Forgot password?", es: "¿Olvidaste tu contraseña?" })}
          </button>
        </div>
        {message && (
          <p className="mt-5 text-sm text-moss" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-5 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
