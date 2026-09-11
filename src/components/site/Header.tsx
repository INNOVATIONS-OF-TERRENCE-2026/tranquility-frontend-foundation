import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ColorStudio } from "@/components/theme/ColorStudio";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { business } from "@/config/business";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/studio", label: "TLC Studio" },
  { to: "/service-area", label: "Service Area" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

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
    <header className="brand-dark sticky top-0 z-50 border-b border-gold/25 bg-background text-foreground shadow-[0_12px_38px_-30px_rgba(0,0,0,0.9)]">
      <div className="hidden border-b border-gold/15 bg-night/80 md:block">
        <div className="container-page flex h-8 items-center justify-between text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Dallas - Fort Worth</span>
          <span className="hidden lg:inline">Come home to tranquility.</span>
          <a href={business.phoneHref} className="text-gold-soft transition-colors hover:text-primary">
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="navy-glass">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex min-h-11 items-center whitespace-nowrap px-1 text-[0.79rem] font-semibold uppercase tracking-[0.09em] text-foreground/72 transition-colors hover:text-gold-soft"
                activeProps={{
                  className:
                    "text-gold-soft after:absolute after:inset-x-1 after:bottom-1 after:h-px after:bg-gold",
                }}
              >
                {item.to === "/studio" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <ColorStudio compact />
            <ThemeToggle compact />
            <Button asChild variant="outline" className="border-gold/35 text-foreground hover:bg-gold/10 hover:text-gold-soft">
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <Button asChild>
              <Link to="/booking">Request Service</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <ColorStudio compact />
            <ThemeToggle compact />
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-11 items-center justify-center rounded-full border border-gold/30 bg-card text-ink shadow-soft"
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-background md:top-[6.5rem] xl:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex min-h-full flex-col py-5">
            <div className="rounded-2xl border border-gold/20 bg-card/70 p-2 shadow-lift">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex min-h-14 items-center justify-between border-b border-border/70 px-3 py-3 text-lg text-ink last:border-b-0"
                  activeProps={{ className: "text-moss font-semibold" }}
                >
                  <span>{item.label}</span>
                  {item.to === "/studio" && <Sparkles className="size-4 text-moss" aria-hidden="true" />}
                </Link>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-gold/20 bg-sand p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-moss">Appearance</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <ColorStudio />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button asChild size="lg">
                <Link to="/booking">Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold/35">
                <Link to="/quote">Get a Custom Quote</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/studio">Open TLC Studio</Link>
              </Button>
              <a
                href={business.phoneHref}
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
              >
                <Phone className="size-4 text-moss" aria-hidden="true" /> {business.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
