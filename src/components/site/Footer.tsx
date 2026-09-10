import { Link } from "@tanstack/react-router";

import { business, cities } from "@/config/business";
import { services } from "@/config/pricing";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-sand">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4 md:py-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {business.tagline} Professional cleaning across {business.serviceAreaLabel} with clear pricing and thoughtful customization.
          </p>
          <Link to="/studio" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-moss hover:underline">
            Open Tranquility Studio
          </Link>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Services</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {services.map((service) => <li key={service.id}><Link to={service.route} className="hover:text-moss">{service.name}</Link></li>)}
            <li><Link to="/commercial-cleaning" className="hover:text-moss">Commercial / Office</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Company</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-moss">About</Link></li>
            <li><Link to="/studio" className="hover:text-moss">Tranquility Studio</Link></li>
            <li><Link to="/service-area" className="hover:text-moss">Service Area</Link></li>
            <li><Link to="/faq" className="hover:text-moss">FAQ</Link></li>
            <li><Link to="/careers" className="hover:text-moss">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-moss">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Get in touch</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href={business.phoneHref} className="hover:text-moss">{business.phoneDisplay}</a></li>
            <li><a href={business.emailHref} className="break-all hover:text-moss">{business.email}</a></li>
          </ul>
          <div className="mt-5 flex flex-col gap-2 text-sm">
            <Link to="/booking" className="font-semibold text-moss hover:underline">Request service →</Link>
            <Link to="/quote" className="font-semibold text-moss hover:underline">Get a custom quote →</Link>
          </div>
        </div>
      </div>

      <div className="container-page pb-10">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-ink">Service area:</span> {cities.join(" · ")} and surrounding communities.
        </p>
      </div>

      <div className="border-t border-border/70">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.legalName}. All rights reserved.</p>
          <div className="flex gap-5"><Link to="/privacy" className="hover:text-moss">Privacy</Link><Link to="/terms" className="hover:text-moss">Terms</Link></div>
        </div>
      </div>
    </footer>
  );
}
