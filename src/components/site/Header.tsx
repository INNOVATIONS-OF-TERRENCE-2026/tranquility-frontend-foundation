import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { business } from "@/config/business";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/service-area", label: "Service Area" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-ink/95 text-[0.72rem] tracking-wide text-background md:block">
        <div className="container-page flex h-9 items-center justify-between">
          <span>Serving {business.serviceAreaLabel}</span>
          <a href={business.phoneHref} className="hover:underline">
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <div className="border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-foreground/80 transition-colors hover:text-moss"
                activeProps={{ className: "text-moss font-semibold" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild variant="outline">
              <Link to="/quote">Get a Quote</Link>
            </Button>
            <Button asChild>
              <Link to="/booking">Request Service</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-11 items-center justify-center rounded-md border border-border text-ink lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-background md:top-[7.25rem] lg:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b border-border/70 py-4 text-lg text-ink"
                activeProps={{ className: "text-moss" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link to="/booking">Request Service</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quote">Get a Custom Quote</Link>
              </Button>
              <a
                href={business.phoneHref}
                className="mt-2 inline-flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground"
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
