import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { LanguageProvider, useLanguage } from "@/components/language/LanguageProvider";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ThemeProvider, themeBootstrapScript } from "@/components/theme/ThemeProvider";
import { business, cities } from "@/config/business";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  const { text } = useLanguage();
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-sand px-4 py-24" aria-labelledby="not-found-title">
      <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-lift md:p-12">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title" className="mt-4 text-4xl md:text-5xl">
          {text({ en: "This page is not here.", es: "Esta página no está disponible." })}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          {text({
            en: "The page may have moved, or the address may be incorrect. Return home or use the main navigation to continue.",
            es: "Es posible que la página haya cambiado de ubicación o que la dirección sea incorrecta. Regresa al inicio o usa la navegación principal para continuar.",
          })}
        </p>
        <div className="mt-8">
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
            {text({ en: "Return home", es: "Volver al inicio" })}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { text } = useLanguage();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-sand px-4 py-24" aria-labelledby="error-title">
      <div className="max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-lift md:p-12">
        <p className="eyebrow">{text({ en: "Something went wrong", es: "Algo salió mal" })}</p>
        <h1 id="error-title" className="mt-4 text-4xl">
          {text({ en: "This page did not load.", es: "Esta página no se pudo cargar." })}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          {text({
            en: "Try the page again. If the issue continues, you can return home and contact Tranquility directly.",
            es: "Intenta cargar la página de nuevo. Si el problema continúa, puedes volver al inicio y comunicarte directamente con Tranquility.",
          })}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => { router.invalidate(); reset(); }} className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
            {text({ en: "Try again", es: "Intentar de nuevo" })}
          </button>
          <a href="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-input bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
            {text({ en: "Return home", es: "Volver al inicio" })}
          </a>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Tranquility Level Cleaning | Dallas-Fort Worth Cleaning Service" },
      {
        name: "description",
        content:
          "Professional residential, deep, move-in, move-out, and commercial cleaning across Dallas-Fort Worth with clear pricing and custom quote options.",
      },
      { name: "author", content: business.legalName },
      { name: "theme-color", content: "#f8f5ef" },
      { property: "og:title", content: business.legalName },
      { property: "og:description", content: "Come home to tranquility. Professional cleaning across Dallas-Fort Worth." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: business.legalName },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CleaningService",
          name: business.legalName,
          url: "https://tranquility.cleaning",
          telephone: business.phoneDisplay,
          email: business.email,
          areaServed: cities.map((name) => ({ "@type": "City", name })),
          slogan: business.tagline,
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script suppressHydrationWarning>{themeBootstrapScript}</script>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AppShell />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { text } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-transform focus:translate-y-0">
        {text({ en: "Skip to content", es: "Saltar al contenido" })}
      </a>
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
