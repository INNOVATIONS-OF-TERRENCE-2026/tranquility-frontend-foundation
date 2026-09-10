import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { business } from "@/config/business";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/studio", label: "Tranquility Studio" },
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
    <header className="sticky top-0 z-50">
      <div className="hidden bg-night/95 text-[0.72rem] tracking-wide text-night-foreground md:block">
        <div className="container-page flex h-9 items-center justify-between">
          <span>Serving {business.serviceAreaLabel}</span>
          <a
            href={business.phoneHref}
            className="transition-opacity hover:opacity-80 hover:underline"
          >
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="border-b border-border/70 bg-background/92 shadow-[0_1px_0_color-mix(in_oklab,var(--color-border)_70%,transparent)] backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap text-sm text-foreground/80 transition-colors hover:text-moss"
                activeProps={{ className: "text-moss font-semibold" }}
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
            <ThemeToggle compact />
            <Button asChild variant="outline">
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <Button asChild>
              <Link to="/booking">Request Service</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <ThemeToggle compact />
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-card text-ink shadow-sm"
            >
              {open ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-background md:top-[7.25rem] xl:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex min-h-full flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-h-14 items-center border-b border-border/70 py-3 text-lg text-ink"
                activeProps={{ className: "text-moss font-semibold" }}
              >
                {item.to === "/studio" ? (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="size-4" aria-hidden="true" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ))}

            <div className="mt-6 rounded-xl border border-border bg-sand p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Appearance
              </p>
              <div className="mt-3">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button asChild size="lg">
                <Link to="/booking">Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quote">Get a Custom Quote</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/studio">Open Tranquility Studio</Link>
              </Button>
              <a
                href={business.phoneHref}
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
              >
                <Phone className="size-4" aria-hidden="true" /> {business.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
