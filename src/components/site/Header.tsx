import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Button } from "@/components/ui/button";
import { ColorStudio } from "@/components/theme/ColorStudio";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { business } from "@/config/business";
import { Logo } from "./Logo";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "select:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef(pathname);
  const isHome = pathname === "/";
  const { text } = useLanguage();

  const nav = [
    { to: "/" as const, label: text({ en: "Home", es: "Inicio" }) },
    { to: "/services" as const, label: text({ en: "Services", es: "Servicios" }) },
    { to: "/service-area" as const, label: text({ en: "Service Area", es: "Área de servicio" }) },
    { to: "/about" as const, label: text({ en: "About", es: "Nosotros" }) },
    { to: "/contact" as const, label: text({ en: "Contact", es: "Contacto" }) },
  ];

  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      setOpen(false);
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
      );

    window.requestAnimationFrame(() => getFocusable()[0]?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      className={`brand-dark inset-x-0 top-0 z-50 text-foreground ${
        isHome
          ? "absolute border-b border-white/10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--night)_78%,transparent),transparent)]"
          : "sticky border-b border-gold/25 bg-background shadow-[0_12px_38px_-30px_rgba(0,0,0,0.9)]"
      }`}
    >
      {!isHome && (
        <div className="hidden border-b border-gold/15 bg-night/80 md:block">
          <div className="container-page flex h-8 items-center justify-between text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span>Dallas - Fort Worth</span>
            <span className="hidden lg:inline">{text({ en: "Come home to tranquility.", es: "Vuelve a casa con tranquilidad." })}</span>
            <a href={business.phoneHref} className="text-gold-soft transition-colors hover:text-primary">{business.phoneDisplay}</a>
          </div>
        </div>
      )}

      <div className={isHome ? "bg-transparent" : "navy-glass"}>
        <div className={`container-page flex items-center justify-between gap-4 ${isHome ? "h-24 md:h-28" : "h-[4.5rem] md:h-20"}`}>
          <Logo hero={isHome} />

          <nav aria-label={text({ en: "Primary navigation", es: "Navegación principal" })} className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {nav.slice(0, 2).map((item) => (
              <Link key={item.to} to={item.to} className="relative flex min-h-11 items-center whitespace-nowrap px-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/78 transition-colors hover:text-gold-soft" activeProps={{ className: "text-gold-soft after:absolute after:inset-x-1 after:bottom-1 after:h-px after:bg-gold" }}>
                {item.label}
              </Link>
            ))}
            <a href={isHome ? "#pricing" : "/#pricing"} className="relative flex min-h-11 items-center whitespace-nowrap px-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/78 transition-colors hover:text-gold-soft">
              {text({ en: "Pricing", es: "Precios" })}
            </a>
            {nav.slice(2).map((item) => (
              <Link key={item.to} to={item.to} className="relative flex min-h-11 items-center whitespace-nowrap px-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/78 transition-colors hover:text-gold-soft" activeProps={{ className: "text-gold-soft after:absolute after:inset-x-1 after:bottom-1 after:h-px after:bg-gold" }}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <LanguageToggle compact />
            <ColorStudio compact />
            <ThemeToggle compact />
            <Button asChild className="min-w-40 justify-between">
              <Link to="/booking">{text({ en: "Book Now", es: "Reservar" })} <span aria-hidden="true">→</span></Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <LanguageToggle compact />
            <ColorStudio compact />
            <ThemeToggle compact />
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? text({ en: "Close menu", es: "Cerrar menú" }) : text({ en: "Open menu", es: "Abrir menú" })}
              className="inline-flex size-11 items-center justify-center rounded-full border border-gold/30 bg-card/90 text-ink shadow-soft backdrop-blur-sm"
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div ref={menuRef} id="mobile-menu" className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-background ${isHome ? "top-24 md:top-28" : "top-[4.5rem] md:top-[6.5rem]"}`}>
          <nav aria-label={text({ en: "Mobile navigation", es: "Navegación móvil" })} className="container-page flex min-h-full flex-col py-5">
            <div className="rounded-2xl border border-gold/20 bg-card/70 p-2 shadow-lift">
              {nav.map((item, index) => (
                <div key={item.to}>
                  {index === 2 && <a href="/#pricing" className="flex min-h-14 items-center border-b border-border/70 px-3 py-3 text-lg text-ink">{text({ en: "Pricing", es: "Precios" })}</a>}
                  <Link to={item.to} className="flex min-h-14 items-center justify-between border-b border-border/70 px-3 py-3 text-lg text-ink last:border-b-0" activeProps={{ className: "text-moss font-semibold" }}>
                    <span>{item.label}</span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-gold/20 bg-sand p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">{text({ en: "Preferences", es: "Preferencias" })}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <LanguageToggle />
                <ThemeToggle />
                <ColorStudio />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button asChild size="lg"><Link to="/booking">{text({ en: "Book Your Clean", es: "Reserva tu limpieza" })}</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-gold/35"><Link to="/quote">{text({ en: "Get a Custom Quote", es: "Solicitar cotización personalizada" })}</Link></Button>
              <a href={business.phoneHref} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Phone className="size-4 text-moss" aria-hidden="true" /> {business.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
