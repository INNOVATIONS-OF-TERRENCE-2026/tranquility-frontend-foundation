import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

import { business, cities } from "@/config/business";
import { services } from "@/config/pricing";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="brand-dark mt-auto border-t border-gold/20 bg-background text-foreground">
      <div className="container-page py-14 md:py-18">
        <div className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {business.tagline} Professional cleaning across {business.serviceAreaLabel} with clear pricing, thoughtful customization, and direct custom-quote options when a home needs more review.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/booking" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/35 bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-gold">
              Request Service
            </Link>
            <Link to="/studio" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/30 px-6 text-sm font-semibold text-gold-soft transition-colors hover:bg-gold/10">
              Open TLC Studio
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Services</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {services.map((service) => (
                <li key={service.id}><Link to={service.route} className="transition-colors hover:text-gold-soft">{service.name}</Link></li>
              ))}
              <li><Link to="/commercial-cleaning" className="transition-colors hover:text-gold-soft">Commercial / Office</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Explore</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/studio" className="transition-colors hover:text-gold-soft">TLC Studio</Link></li>
              <li><Link to="/service-area" className="transition-colors hover:text-gold-soft">Service Area</Link></li>
              <li><Link to="/faq" className="transition-colors hover:text-gold-soft">FAQ</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-gold-soft">About</Link></li>
              <li><Link to="/careers" className="transition-colors hover:text-gold-soft">Careers</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Contact</p>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <a href={business.phoneHref} className="flex items-center gap-2 transition-colors hover:text-gold-soft"><Phone className="size-4 text-moss" aria-hidden="true" />{business.phoneDisplay}</a>
              <a href={business.emailHref} className="block break-all transition-colors hover:text-gold-soft">{business.email}</a>
              <Link to="/contact" className="inline-flex text-gold-soft hover:underline">General inquiry →</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-moss">Service area</p>
            <div className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-moss" aria-hidden="true" />
              <span>{business.serviceAreaLabel}</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">{cities.slice(0, 9).join(" · ")} and surrounding communities.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.legalName}. All rights reserved.</p>
          <div className="flex gap-5"><Link to="/privacy" className="hover:text-gold-soft">Privacy</Link><Link to="/terms" className="hover:text-gold-soft">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
